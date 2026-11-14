#!/usr/bin/env python3
"""Modello dei reel Talyon: dal copione al video.

Uso:
    python3 kit/reel/strumenti/reel.py valida <copione.json>
    python3 kit/reel/strumenti/reel.py controlla <copione.json> [cartella]
    python3 kit/reel/strumenti/reel.py audio <copione.json> <audio.wav>
    python3 kit/reel/strumenti/reel.py video <cartella del reel> [--fino SECONDI]
    python3 kit/reel/strumenti/reel.py copertina <cartella del reel>

Il copione descrive un reel (gancio, promessa, momenti, culmine, didascalia).
Il motore in kit/reel/motore disegna il reel in Chrome (Playwright), come kit/genera.py fa per i caroselli.
Serve solo Python con Playwright, Pillow e ffmpeg: niente Node e niente npm.
"""
import base64
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

KIT = pathlib.Path(__file__).resolve().parent.parent          # kit/reel
MOTORE = KIT / "motore"
RISORSE = KIT / "risorse"
CACHE = pathlib.Path.home() / ".cache" / "talyon-reel"
BLOCCHI = json.loads((KIT / "blocchi.json").read_text())

# moduli del motore, nell'ordine in cui entrano nella pagina (quelli che mancano si saltano)
MODULI = ["core.js", "ui.js", "schermate.js", "blocchi.js", "modello.js", "regia.js", "musica.js", "effetti.js"]
INVITO = "Seguici per non perdere l'anteprima gratuita."
CLIP_FOTOGRAMMI = 120
CLIP_CHIAVE = 60


# ---------------- copione ----------------
def _righe(valore, n_min, n_max):
    return isinstance(valore, list) and n_min <= len(valore) <= n_max and all(isinstance(r, str) and r.strip() for r in valore)


def _valori(dati, percorso):
    """Valori di un percorso come 'righe[*][0]' o 'atleti[*].nome' dentro i dati di un blocco."""
    pezzi = re.findall(r"[^.\[\]]+|\[\*\]|\[\d+\]", percorso)
    correnti = [dati]
    for p in pezzi:
        nuovi = []
        for c in correnti:
            if p == "[*]":
                if isinstance(c, list):
                    nuovi.extend(c)
            elif p.startswith("["):
                i = int(p[1:-1])
                if isinstance(c, list) and i < len(c):
                    nuovi.append(c[i])
            elif isinstance(c, dict) and p in c:
                nuovi.append(c[p])
        correnti = nuovi
    return correnti


def _testo(v) -> bool:
    return isinstance(v, str) and v.strip() != ""


def _intero(v):
    """Il numero intero scritto in v (anche come testo di sole cifre), altrimenti None."""
    if isinstance(v, bool):
        return None
    if isinstance(v, int):
        return v
    if isinstance(v, str) and v.strip().isdigit():
        return int(v)
    return None


def _quanti(lim, cosa):
    a, b = lim
    return f"da {a} a {b} {cosa}" if a != b else f"{a} {cosa}"


def _controlla_forma(dove, campo, v, forma, dati, errori):
    """Un errore per ogni dato che il blocco non sa disegnare (forme in blocchi.json, voce «forme»)."""
    nome = f"{dove}: «{campo}»"
    if forma in ("testo", "testo?"):
        if not _testo(v):
            errori.append(f"{nome} deve essere un testo non vuoto")
    elif forma == "valore":
        if not (_testo(v) or (isinstance(v, int) and not isinstance(v, bool))):
            errori.append(f"{nome} deve essere un testo o un numero")
    elif forma == "schermo":
        if v not in BLOCCHI["schermi"]:
            errori.append(f"{nome}: «{v}» non è una schermata del modello ({', '.join(BLOCCHI['schermi'])})")
    elif forma == "palestra":
        if v not in BLOCCHI["palestre"]:
            errori.append(f"{nome}: la palestra deve essere {' o '.join(BLOCCHI['palestre'])}")
    elif "intero" in forma:
        a, b = forma["intero"]
        n = _intero(v)
        if n is None or not a <= n <= b:
            errori.append(f"{nome} deve essere un numero intero da {a} a {b}")
    elif "schema" in forma:
        if not (_testo(v) and re.fullmatch(forma["schema"], v)):
            errori.append(f"{nome} deve essere scritto come «{forma['esempio']}»")
    elif "indice" in forma:
        lista = dati.get(forma["indice"])
        n = _intero(v)
        if n is None or not isinstance(lista, list) or not 0 <= n < len(lista):
            errori.append(f"{nome} deve indicare una delle «{forma['indice']}» (da 0)")
    elif "lista" in forma:
        a, b = forma["lista"]
        if not (isinstance(v, list) and a <= len(v) <= b and all(_testo(x) for x in v)):
            errori.append(f"{nome} deve essere un elenco di {_quanti(forma['lista'], 'testi')}")
    elif "righe" in forma:
        a, b = forma["righe"]
        c0, c1 = forma["celle"]
        if not (isinstance(v, list) and all(isinstance(r, list) for r in v)):
            errori.append(f"{nome} deve essere un elenco di righe, ognuna un elenco di testi (es. [[\"Trazioni\", \"+40 kg\"]])")
            return
        if not a <= len(v) <= b:
            errori.append(f"{nome}: {_quanti(forma['righe'], 'righe')}, non {len(v)}")
        for i, r in enumerate(v, start=1):
            if not (c0 <= len(r) <= c1 and all(_testo(x) for x in r)):
                errori.append(f"{nome}, riga {i}: {_quanti(forma['celle'], 'testi')}, non vuoti")
            k = forma.get("stato")
            if k is not None and len(r) > k and r[k] not in BLOCCHI["stati"]:
                errori.append(f"{nome}, riga {i}: «{r[k]}» non è uno stato ({', '.join(BLOCCHI['stati'])})")
    elif "richiami" in forma:
        a, b = forma["richiami"]
        buoni = isinstance(v, list) and all(_testo(r) or (isinstance(r, list) and 1 <= len(r) <= 2 and all(_testo(x) for x in r)) for r in v)
        if not buoni or not a <= len(v) <= b:
            errori.append(f"{nome}: {_quanti(forma['richiami'], 'richiami')}, ognuno un testo o [testo, sotto]")
    elif "telefoni" in forma:
        n = forma["telefoni"]
        if not (isinstance(v, list) and len(v) == n and all(isinstance(a, dict) for a in v)):
            errori.append(f"{nome}: servono {n} atleti, ognuno con nome e schermo")
            return
        for i, a in enumerate(v, start=1):
            if not _testo(a.get("nome")):
                errori.append(f"{nome}, atleta {i}: manca il nome")
            if a.get("schermo") not in BLOCCHI["schermi"]:
                errori.append(f"{nome}, atleta {i}: «{a.get('schermo')}» non è una schermata del modello")
            if "sotto" in a and not _testo(a["sotto"]):
                errori.append(f"{nome}, atleta {i}: «sotto» deve essere un testo")


def _controlla_blocco(dove, parte, errori):
    if not isinstance(parte, dict):
        errori.append(f"{dove}: manca")
        return
    if not _righe(parte.get("titolo"), 2, 2):
        errori.append(f"{dove}: il titolo deve avere 2 righe")
    nome = parte.get("blocco")
    info = BLOCCHI["blocchi"].get(nome)
    if info is None:
        errori.append(f"{dove}: blocco «{nome}» sconosciuto")
        return
    dati = parte.get("dati")
    if not isinstance(dati, dict):
        errori.append(f"{dove}: mancano i dati del blocco")
        return
    for campo in info.get("dati", []):
        if campo not in dati:
            errori.append(f"{dove}: nei dati manca «{campo}»")
    forma = info.get("forma", {})
    for campo, v in dati.items():
        if campo not in forma:
            errori.append(f"{dove}: il blocco «{nome}» non usa «{campo}» (usa {', '.join(forma)})")
        else:
            _controlla_forma(dove, campo, v, forma[campo], dati, errori)
    for percorso in info.get("nomi", []):
        for v in _valori(dati, percorso):
            if v not in BLOCCHI["nomi_demo"]:
                errori.append(f"{dove}: «{v}» non è un nome demo")


def valida_copione(c: dict) -> list:
    """Errori del copione, uno per voce. Lista vuota = copione valido."""
    e = []
    if not isinstance(c, dict):
        return ["il copione non è un oggetto JSON"]
    if not isinstance(c.get("n"), int) or not 1 <= c["n"] <= 999:
        e.append("n: serve un numero da 1 a 999")
    if not isinstance(c.get("slug"), str) or not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", c["slug"]):
        e.append("slug: minuscole, numeri e trattini")
    if not isinstance(c.get("titolo"), str) or not c["titolo"].strip():
        e.append("titolo del reel mancante")
    if c.get("funzione") not in BLOCCHI["funzioni"]:
        e.append(f"funzione «{c.get('funzione')}» non è tra quelle che esistono ({', '.join(BLOCCHI['funzioni'])})")
    if c.get("palco") not in ("grafite", "verde"):
        e.append("palco: grafite o verde")
    if c.get("musica") not in (0, 1, 2, 3):
        e.append("musica: variante da 0 a 3")
    g = c.get("gancio")
    if not isinstance(g, dict) or g.get("scena") not in BLOCCHI["scene_gancio"]:
        e.append(f"gancio: la scena deve essere una di {', '.join(BLOCCHI['scene_gancio'])}")
    if not isinstance(g, dict) or not _righe(g.get("righe"), 2, 3):
        e.append("gancio: servono 2 o 3 righe")
    if not _righe(c.get("promessa"), 2, 3):
        e.append("promessa: servono 2 o 3 righe")
    momenti = c.get("momenti")
    if not isinstance(momenti, list) or not 3 <= len(momenti) <= 4:
        e.append("momenti: ne servono 3 o 4")
    else:
        for i, m in enumerate(momenti, start=1):
            _controlla_blocco(f"momento {i}", m, e)
            if isinstance(m, dict) and "durata" in m:
                d = m["durata"]
                if not isinstance(d, (int, float)) or not 4.5 <= d <= 7.5:
                    e.append(f"momento {i}: durata da 4,5 a 7,5 secondi")
    _controlla_blocco("culmine", c.get("culmine"), e)
    d = c.get("didascalia")
    if not isinstance(d, str) or not d.strip():
        e.append("didascalia mancante")
    else:
        n_tag = len(re.findall(r"(?<!\w)#\w+", d))
        if n_tag > 5:
            e.append(f"didascalia: {n_tag} hashtag, al massimo 5")
        if INVITO not in d:
            e.append(f"didascalia: manca l'invito «{INVITO}»")
    if not isinstance(c.get("alt"), str) or not c["alt"].strip():
        e.append("alt: serve una descrizione per chi non vede il video")
    return e


# ---------------- pagina ----------------
def _font_css() -> str:
    b64 = base64.b64encode((RISORSE / "saira.woff2").read_bytes()).decode()
    return "\n".join(
        f"@font-face{{font-family:'{nome}';src:url(data:font/woff2;base64,{b64}) format('woff2');"
        f"font-weight:100 900;font-stretch:{stretch};font-display:block}}"
        for nome, stretch in (("SairaT", "82%"), ("SairaB", "100%"))
    )


def fotogrammi_simbolo() -> pathlib.Path:
    """Estrae una volta i 120 fotogrammi del video del simbolo (chiusura) nella cache."""
    cartella = CACHE / "simbolo"
    sorgente = RISORSE / "simbolo.mp4"
    segno = cartella / ".fatto"
    if not (segno.exists() and segno.read_text() == str(sorgente.stat().st_mtime_ns)):
        cartella.mkdir(parents=True, exist_ok=True)
        for vecchio in cartella.glob("c-*.jpg"):
            vecchio.unlink()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(sorgente), "-q:v", "2", "-start_number", "0",
                        str(cartella / "c-%03d.jpg")], check=True)
        segno.write_text(str(sorgente.stat().st_mtime_ns))
    return cartella


DISEGNO_MINIMO = """
// disegno minimo finché la regia non c'è: solo palco e finitura
ESPORTA.disegna = function (ctx, t) {
  const c = cam({ cx: 540, cy: 1560, s: 1.38, yaw: -0.18, pitch: 0.12 });
  stage(ctx, c, { key: 1, rim: 1 }, t);
  finish(ctx, t, COPIONE.palco === 'verde', false);
};
"""

CARICATORE = """
const FONT = ['700 108px SairaT', '700 92px SairaT', '700 84px SairaT', '700 46px SairaT', '600 30px SairaB', '500 36px SairaB', '400 32px SairaB', '800 40px SairaB'];
async function caricaFont() { try { await Promise.all(FONT.map((f) => document.fonts.load(f, 'AaZz09àè’′″−×'))); await document.fonts.ready; } catch (e) {} }
function caricaClip(fotogrammi) {
  return Promise.all(fotogrammi.map((src) => new Promise((ok, no) => {
    const im = new Image(); im.onload = () => im.decode().then(() => ok(im), () => ok(im)); im.onerror = () => no(new Error('simbolo: ' + src)); im.src = src;
  }))).then((frames) => { window.TALYON_CLIP = frames.length === 1 ? { frames, single: true } : { frames, fps: 30 }; });
}
window.ready = Promise.all([caricaFont(), caricaClip(CLIP)]).then(() => true);
window.renderFrame = function (t, scale) {
  const cv = document.getElementById('c'); scale = scale || 1;
  cv.width = 1080 * scale; cv.height = 1920 * scale;
  const ctx = cv.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.save(); ctx.scale(scale, scale);
  const t0 = performance.now();
  TALYON.disegna(ctx, t);
  ctx.restore();
  return performance.now() - t0;
};
window.frameJPEG = function (t, q) { window.renderFrame(t, 1); return document.getElementById('c').toDataURL('image/jpeg', q || 0.92); };
"""


def pagina(copione: dict, clip: str = "chiave") -> str:
    """HTML completo del reel: font, motore e copione dentro, fotogrammi del simbolo letti dalla cache."""
    cartella = fotogrammi_simbolo()
    indici = [CLIP_CHIAVE] if clip == "chiave" else list(range(CLIP_FOTOGRAMMI))
    fotogrammi = [(cartella / f"c-{i:03d}.jpg").as_uri() for i in indici]
    moduli = "\n".join((MOTORE / m).read_text() for m in MODULI if (MOTORE / m).exists())
    bundle = (
        "(function () {\n'use strict';\n"
        f"const COPIONE = {json.dumps(copione, ensure_ascii=False)};\n"
        f"const BLOCCHI = {json.dumps(BLOCCHI, ensure_ascii=False)};\n"
        "const ESPORTA = {};\n"
        f"{moduli}\n"
        "if (!ESPORTA.disegna) {" + DISEGNO_MINIMO + "}\n"
        "window.TALYON = Object.assign({ W, H: HH, SAFE, COPIONE, BLOCCHI }, ESPORTA);\n"
        "})();\n"
    )
    return (
        "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>reel</title>"
        f"<style>{_font_css()}\nhtml,body{{margin:0;background:#000}}</style></head><body>"
        "<canvas id=\"c\" width=\"1080\" height=\"1920\"></canvas>"
        f"<script>{(MOTORE / 'harness.js').read_text()}</script>"
        f"<script>{(MOTORE / 'sound.js').read_text()}</script>"
        f"<script>{bundle}</script>"
        f"<script>const CLIP = {json.dumps(fotogrammi)};\n{CARICATORE}</script>"
        "</body></html>"
    )


class Sessione:
    """Una pagina del reel aperta in Chromium. Si usa con `with apri(...) as s:`; s.page, s.errori."""

    def __init__(self, copione_path, clip="chiave", copione=None):
        from playwright.sync_api import sync_playwright
        self.copione = copione if copione is not None else json.loads(pathlib.Path(copione_path).read_text())
        cartella = CACHE / "pagine"
        cartella.mkdir(parents=True, exist_ok=True)
        self.file = cartella / f"{self.copione.get('slug', 'reel')}-{clip}.html"
        self.file.write_text(pagina(self.copione, clip))
        self.errori = []
        self._pw = sync_playwright().start()
        self.browser = self._pw.chromium.launch(args=["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"])
        self.page = self.browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        self.page.on("pageerror", lambda err: self.errori.append(str(err)))
        self.page.on("console", lambda m: self.errori.append(m.text) if m.type == "error" else None)
        self.page.goto(self.file.as_uri())
        self.page.evaluate("window.ready")

    def chiudi(self):
        try:
            self.browser.close()
        finally:
            self._pw.stop()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.chiudi()


def apri(copione_path, clip="chiave", copione=None) -> Sessione:
    return Sessione(copione_path, clip, copione)


# ---------------- controllo a vista ----------------
def _jpg(page, espressione, t):
    dati = page.evaluate(espressione, t)
    return base64.b64decode(dati.split(",", 1)[1])


def controlla(percorso, uscita=None) -> int:
    """Valida il copione, controlla le aree e crea controllo.jpg (un fotogramma al secondo) e chiave/ (un fotogramma
    per sezione a grandezza piena). Restituisce 0 se è tutto pulito, 2 se c'è qualcosa da correggere."""
    from PIL import Image, ImageDraw
    import io
    import math
    percorso = pathlib.Path(percorso)
    c = json.loads(percorso.read_text())
    errori = valida_copione(c)
    for x in errori:
        print("copione:", x)
    if errori:
        return 2
    if uscita is None:   # nella cache: nella cartella del reel va solo il foglio, quando si crea il video
        uscita = CACHE / "controllo" / c["slug"]
    uscita = pathlib.Path(uscita)
    (uscita / "chiave").mkdir(parents=True, exist_ok=True)
    for vecchio in (uscita / "chiave").glob("*.jpg"):
        vecchio.unlink()
    with apri(percorso, clip="tutti", copione=c) as s:
        P = s.page.evaluate("TALYON.piano()")
        tempi = [t for t, sez in zip(P["fotogrammiChiave"], P["sezioni"]) if sez["tipo"] != "chiusura"]
        fuori = s.page.evaluate("(tt) => TALYON.controllaAree(tt)", tempi)
        for v in fuori:
            print(f"fuori area a {v['t']} s: «{v['testo']}» {v['box']}")
        for i, t in enumerate(P["fotogrammiChiave"], start=1):
            (uscita / "chiave" / f"{i:02d}-{t:05.2f}s.jpg").write_bytes(
                _jpg(s.page, "(t) => window.frameJPEG(t, 0.9)", t))
        quadri = []
        for t in range(0, math.ceil(P["durata"])):
            quadri.append((t, Image.open(io.BytesIO(_jpg(s.page, "(t) => { window.renderFrame(t, 0.25); return document.getElementById('c').toDataURL('image/jpeg', 0.85); }", t)))))
        console = list(s.errori)
    W, H, col = 270, 480, 10
    righe = math.ceil(len(quadri) / col)
    foglio = Image.new("RGB", (col * W, righe * (H + 24)), (18, 18, 18))
    d = ImageDraw.Draw(foglio)
    for i, (t, im) in enumerate(quadri):
        x, y = (i % col) * W, (i // col) * (H + 24)
        foglio.paste(im.convert("RGB").resize((W, H)), (x, y + 24))
        d.text((x + 6, y + 6), f"{t} s", fill=(255, 200, 150))
    foglio.save(uscita / "controllo.jpg", quality=85)
    for x in console:
        print("console:", x)
    print(f"durata {P['durata']} s, colpo {P['colpo']} s, {len(P['sezioni'])} sezioni → {uscita}")
    return 2 if (fuori or console) else 0


# ---------------- audio ----------------
SR = 48000
# catena del master (come il Reel 2): pulizia dei bassi, guadagno e limitatore
CATENA = "highpass=f=28,lowshelf=f=70:g=-2.5:t=s:w=0.7,volume={G:.2f}dB,alimiter=limit=0.78:attack=3:release=90:asc=1:level=0"
RITARDO_LIMITATORE = 143   # campioni di ritardo del limitatore (attacco 3 ms a 48 kHz), tolti in testa
OBIETTIVO_LUFS = -14.0

REGISTRA = """async (d) => {
  const r = await SOUND.renderOffline(TALYON.scoreSound, d, 48000, { voiceover: false });
  const bytes = new Uint8Array(r.inter.buffer); let s = ''; const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  return { b64: btoa(s), frames: r.frames, sr: r.sr };
}"""


def _wav_float(dati: bytes, sr: int, uscita: pathlib.Path):
    """WAV stereo a 32 bit in virgola mobile (i campioni interlacciati del rendering)."""
    import struct
    testa = b"RIFF" + struct.pack("<I", 36 + len(dati)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 3, 2, sr, sr * 8, 8, 32)
    uscita.write_bytes(testa + b"data" + struct.pack("<I", len(dati)) + dati)


def misura_volume(wav) -> tuple:
    """Volume integrato (LUFS) e picco vero (dBTP) misurati da ffmpeg con ebur128."""
    r = subprocess.run(["ffmpeg", "-nostats", "-hide_banner", "-i", str(wav), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    riassunto = r.stderr[r.stderr.rfind("Summary:"):]
    forte = float(re.search(r"I:\s+(-?[\d.]+) LUFS", riassunto).group(1))
    picco = re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", riassunto.split("True peak:")[1]).group(1)
    return forte, float("-inf") if picco == "-inf" else float(picco)


def _master(grezzo, uscita, guadagno: float, durata: float):
    n = round(durata * SR)
    filtro = (CATENA.format(G=guadagno) + f",atrim=start_sample={RITARDO_LIMITATORE},asetpts=PTS-STARTPTS"
              f",apad=whole_len={n},atrim=end_sample={n}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(grezzo), "-af", filtro, "-ar", str(SR), "-c:a", "pcm_s24le", str(uscita)],
                   check=True)


def audio(percorso, uscita) -> dict:
    """Musica ed effetti del copione: registrati a 48 kHz, portati a -14 LUFS con picco vero sotto -1 dB,
    lunghi esattamente quanto il reel. Restituisce durata, volume, picco e guadagno usato."""
    percorso, uscita = pathlib.Path(percorso), pathlib.Path(uscita)
    c = json.loads(percorso.read_text())
    with apri(percorso, clip="chiave", copione=c) as s:
        durata = s.page.evaluate("TALYON.piano().durata")
        res = s.page.evaluate(REGISTRA, durata + 0.5)
        errori = list(s.errori)
    if errori:
        raise RuntimeError("audio: errori nella pagina: " + "; ".join(errori))
    with tempfile.TemporaryDirectory() as d:
        grezzo, prova = pathlib.Path(d) / "grezzo.wav", pathlib.Path(d) / "prova.wav"
        _wav_float(base64.b64decode(res["b64"]), res["sr"], grezzo)
        forte0, _ = misura_volume(grezzo)
        g0 = OBIETTIVO_LUFS - forte0 + 0.3
        _master(grezzo, prova, g0, durata)
        forte1, _ = misura_volume(prova)
        guadagno = g0 + OBIETTIVO_LUFS - forte1      # prima correzione
        _master(grezzo, prova, guadagno, durata)
        forte2, _ = misura_volume(prova)
        # il limitatore fa salire il volume meno del guadagno (circa 0,6 dB per dB): seconda correzione con la pendenza misurata
        if abs(forte2 - OBIETTIVO_LUFS) > 0.1 and abs(forte2 - forte1) > 0.05:
            pendenza = (forte2 - forte1) / (guadagno - g0)
            guadagno += max(-3.0, min(3.0, (OBIETTIVO_LUFS - forte2) / pendenza))
        uscita.parent.mkdir(parents=True, exist_ok=True)
        _master(grezzo, uscita, guadagno, durata)
    forte, picco = misura_volume(uscita)
    return {"durata": durata, "lufs": forte, "picco": picco, "guadagno": round(guadagno, 2)}


# ---------------- video ----------------
FPS = 30
# codifica come il Reel 2: H.264, BT.709 in gamma tv, aq-mode 3 contro le bande
CODIFICA = ["-vf", "format=rgb24,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-x264-params", "aq-mode=3:aq-strength=0.9",
            "-profile:v", "high", "-level", "4.2", "-r", str(FPS),
            "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"]
LIMITE_MB = 30


def _parte(page, f0: int, f1: int, uscita: pathlib.Path):
    """Una parte del video: fotogrammi JPEG q92 dal canvas a ffmpeg; nome provvisorio finché ffmpeg non esce con 0."""
    tmp = uscita.with_name(uscita.stem + ".tmp.mp4")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-"]
                          + CODIFICA + [str(tmp)], stdin=subprocess.PIPE)
    try:
        for f in range(f0, f1):
            ff.stdin.write(_jpg(page, "(t) => window.frameJPEG(t, 0.92)", f / FPS))
    finally:
        ff.stdin.close()
    if ff.wait() != 0:
        raise RuntimeError(f"ffmpeg non ha chiuso la parte {uscita.name}")
    tmp.replace(uscita)


def copertina(cartella) -> pathlib.Path:
    """Copertina: il fotogramma di fine promessa (6,0 s), JPG qualità 96."""
    cartella = pathlib.Path(cartella)
    percorso = cartella / "copione.json"
    with apri(percorso, clip="tutti") as s:
        (cartella / "copertina.jpg").write_bytes(_jpg(s.page, "(t) => window.frameJPEG(t, 0.96)", 6.0))
    return cartella / "copertina.jpg"


def verifica(mp4, fotogrammi: int, volume=None) -> int:
    """Controllo del video finito con ffprobe: stampa una riga di riepilogo, 0 se va tutto bene, 2 se no.
    volume = (lufs, picco) già misurati sul master intero (per i video tagliati con --fino)."""
    r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", str(mp4)],
                       capture_output=True, text=True)
    info = json.loads(r.stdout or "{}")
    flussi = info.get("streams", [])
    v = next((x for x in flussi if x.get("codec_type") == "video"), {})
    a = [x for x in flussi if x.get("codec_type") == "audio"]
    forte, picco = volume if volume else misura_volume(mp4)
    mb = pathlib.Path(mp4).stat().st_size / 1e6
    prove = {
        "1080×1920": (v.get("width"), v.get("height")) == (1080, 1920),
        "30/1": v.get("r_frame_rate") == "30/1",
        "yuv420p": v.get("pix_fmt") == "yuv420p",
        "bt709": v.get("color_space") == "bt709" and v.get("color_primaries") == "bt709",
        f"{fotogrammi} fotogrammi": int(v.get("nb_read_frames") or 0) == fotogrammi,
        "audio": len(a) == 1,
        "−14 LUFS": abs(forte + 14.0) <= 0.5,
        "picco ≤ −1 dB": picco <= -1.0,
        f"sotto {LIMITE_MB} MB": mb < LIMITE_MB,
    }
    male = [k for k, ok in prove.items() if not ok]
    print(f"{pathlib.Path(mp4).name}: {v.get('width')}×{v.get('height')}, {v.get('nb_read_frames')} fotogrammi, "
          f"{forte} LUFS, picco {picco} dB, {mb:.1f} MB → " + ("tutto a posto" if not male else "da correggere: " + ", ".join(male)))
    return 2 if male else 0


def video(cartella, fino=None) -> int:
    """Il reel finito nella sua cartella: talyon-reelNN.mp4, copertina.jpg, controllo.jpg e didascalia.txt.
    Render a parti (una per sezione), audio dal piano, unione senza ricodifica e controllo finale.
    Restituisce 0 se è tutto a posto, 2 se c'è qualcosa da correggere."""
    cartella = pathlib.Path(cartella)
    percorso = cartella / "copione.json"
    c = json.loads(percorso.read_text())
    lavoro = CACHE / "video" / c["slug"]
    shutil.rmtree(lavoro, ignore_errors=True)
    lavoro.mkdir(parents=True)
    # controllo a vista nella cache (aree, console, fotogrammi chiave); nella cartella va solo il foglio
    if controlla(percorso, lavoro / "controllo"):
        return 2
    shutil.copy(lavoro / "controllo" / "controllo.jpg", cartella / "controllo.jpg")
    suono = audio(percorso, lavoro / "audio.wav")
    fine = suono["durata"] if fino is None else min(suono["durata"], float(fino))
    n = round(fine * FPS)
    with apri(percorso, clip="tutti", copione=c) as s:
        P = s.page.evaluate("TALYON.piano()")
        tagli = sorted({0, n} | {round(x["t0"] * FPS) for x in P["sezioni"][1:] if 0 < round(x["t0"] * FPS) < n})
        parti = []
        for i, (f0, f1) in enumerate(zip(tagli, tagli[1:])):
            parti.append(lavoro / f"parte-{i:02d}.mp4")
            _parte(s.page, f0, f1, parti[-1])
        (cartella / "copertina.jpg").write_bytes(_jpg(s.page, "(t) => window.frameJPEG(t, 0.96)", 6.0))
        if s.errori:
            print("console:", "; ".join(s.errori))
            return 2
    elenco = lavoro / "parti.txt"
    elenco.write_text("".join(f"file '{p}'\n" for p in parti))
    muto = lavoro / "video.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(elenco), "-c", "copy", str(muto)], check=True)
    suono_wav = lavoro / "audio.wav"
    if fino is not None:
        suono_wav = lavoro / "audio-fino.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(lavoro / "audio.wav"), "-af", f"atrim=end_sample={round(fine * SR)}",
                        "-c:a", "pcm_s24le", str(suono_wav)], check=True)
    finito = cartella / f"talyon-reel{c['n']:02d}.mp4"
    tmp = finito.with_name(finito.stem + ".tmp.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(muto), "-i", str(suono_wav), "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(tmp)], check=True)
    tmp.replace(finito)
    (cartella / "didascalia.txt").write_text(c["didascalia"].rstrip() + "\n")
    return verifica(finito, n, (suono["lufs"], suono["picco"]) if fino is not None else None)


# ---------------- riga di comando ----------------
def main(argv):
    if len(argv) < 3:
        sys.exit(__doc__)
    comando, percorso = argv[1], pathlib.Path(argv[2])
    if comando == "valida":
        errori = valida_copione(json.loads(percorso.read_text()))
        for x in errori:
            print(x)
        if errori:
            sys.exit(2)
        print("copione valido")
    elif comando == "controlla":
        sys.exit(controlla(percorso, argv[3] if len(argv) > 3 else None))
    elif comando == "video":
        fino = float(argv[argv.index("--fino") + 1]) if "--fino" in argv else None
        sys.exit(video(percorso, fino))
    elif comando == "copertina":
        print(copertina(percorso))
    elif comando == "audio":
        if len(argv) < 4:
            sys.exit(__doc__)
        info = audio(percorso, argv[3])
        print(f"audio: {info['durata']} s, {info['lufs']} LUFS, picco vero {info['picco']} dB → {argv[3]}")
    else:
        sys.exit(f"comando sconosciuto: {comando}\n{__doc__}")


if __name__ == "__main__":
    main(sys.argv)

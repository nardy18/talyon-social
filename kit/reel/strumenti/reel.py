#!/usr/bin/env python3
"""Modello dei reel Talyon: dal copione al video.

Uso:
    python3 kit/reel/strumenti/reel.py valida <copione.json>

Il copione descrive un reel (gancio, promessa, momenti, culmine, didascalia).
Il motore in kit/reel/motore disegna il reel in Chrome (Playwright), come kit/genera.py fa per i caroselli.
Serve solo Python con Playwright, Pillow e ffmpeg: niente Node e niente npm.
"""
import base64
import json
import pathlib
import re
import subprocess
import sys

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
    else:
        sys.exit(f"comando sconosciuto: {comando}\n{__doc__}")


if __name__ == "__main__":
    main(sys.argv)

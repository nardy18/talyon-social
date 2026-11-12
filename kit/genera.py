#!/usr/bin/env python3
"""Genera le slide di un carosello Talyon.

Uso:
    python3 kit/genera.py caroselli/C05-la-tua-palestra/carosello.html

Il file carosello.html contiene:
    <carosello sfondo="verde|grafite" serie="Nome della serie">
      <style> ...stili extra solo per questo carosello (facoltativi)... </style>
      <section class="slide" data-tipo="copertina"> ... </section>
      <section class="slide" data-tipo="contenuto"> ... </section>
      ...
      <section class="slide" data-tipo="chiusura"> ... </section>
    </carosello>

Crea nella stessa cartella:
    slide-01.jpg ... slide-NN.jpg   (1080x1350, JPG qualita' 95, senza sottocampionamento)
    anteprima.jpg                    (tutte le slide in piccolo, per il controllo veloce)
    pagina.html                      (la pagina completa, per aprirla nel browser)

Controlla anche che nessun elemento esca dall'area dei contenuti.
Se trova problemi li stampa e termina con codice 2: vanno corretti prima di pubblicare.
Gli elementi con l'attributo data-libero vengono ignorati dal controllo (per esempio i telefoni ruotati).
"""
import base64
import math
import os
import pathlib
import re
import subprocess
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

KIT = pathlib.Path(__file__).resolve().parent


def css_font() -> str:
    """Saira variabile (pesi e larghezze) incorporata in base64: nessun file esterno da caricare."""
    base = pathlib.Path(os.environ.get("TALYON_FONT_DIR", str(pathlib.Path.home() / ".cache" / "talyon-font")))
    pkg = base / "node_modules" / "@fontsource-variable" / "saira"
    if not (pkg / "standard.css").exists():
        base.mkdir(parents=True, exist_ok=True)
        subprocess.run(["npm", "i", "--silent", "--no-audit", "--no-fund", "--prefix", str(base),
                        "@fontsource-variable/saira"], check=True)
    blocchi = []
    for nome in ("saira-latin-standard-normal.woff2", "saira-latin-ext-standard-normal.woff2"):
        dati = base64.b64encode((pkg / "files" / nome).read_bytes()).decode()
        blocchi.append(
            "@font-face{font-family:'Saira';font-style:normal;font-display:block;"
            "font-weight:100 900;font-stretch:50% 125%;"
            f"src:url(data:font/woff2;base64,{dati}) format('woff2');}}"
        )
    return "\n".join(blocchi)


def documento(sorgente: str) -> str:
    m = re.search(r"<carosello\b([^>]*)>(.*)</carosello>", sorgente, re.S | re.I)
    if not m:
        sys.exit("Errore: il file deve contenere <carosello sfondo=... serie=...> ... </carosello>")
    attr, interno = m.group(1), m.group(2)
    sfondo = re.search(r'sfondo="([^"]+)"', attr)
    serie = re.search(r'serie="([^"]*)"', attr)
    if not sfondo or sfondo.group(1) not in ("verde", "grafite"):
        sys.exit('Errore: sfondo deve essere "verde" (caroselli dispari) o "grafite" (caroselli pari)')
    serie_txt = serie.group(1) if serie else ""
    stile = (KIT / "stile.css").read_text()
    cornice = (KIT / "cornice.js").read_text()
    return (
        "<!doctype html><html lang=\"it\"><head><meta charset=\"utf-8\">"
        f"<style>{css_font()}</style><style>{stile}</style></head>"
        f"<body data-sfondo=\"{sfondo.group(1)}\" data-serie=\"{serie_txt}\">{interno}"
        f"<script>{cornice}</script></body></html>"
    )


CONTROLLO_JS = """
() => {
  const problemi = [];
  document.querySelectorAll('section.slide').forEach((s, i) => {
    const c = s.querySelector('.contenuto');
    if (!c) return;
    const cr = c.getBoundingClientRect();
    c.querySelectorAll('*').forEach(el => {
      if (el.closest('[data-libero]')) return;
      if (getComputedStyle(el).display === 'inline') return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const fuori = [];
      if (r.bottom > cr.bottom + 2) fuori.push('sotto di ' + Math.round(r.bottom - cr.bottom) + ' px');
      if (r.top < cr.top - 2) fuori.push('sopra di ' + Math.round(cr.top - r.top) + ' px');
      if (r.left < cr.left - 2) fuori.push('a sinistra di ' + Math.round(cr.left - r.left) + ' px');
      if (r.right > cr.right + 2) fuori.push('a destra di ' + Math.round(r.right - cr.right) + ' px');
      if (fuori.length) {
        const nome = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '');
        const testo = (el.textContent || '').trim().slice(0, 40);
        problemi.push('slide ' + (i + 1) + ': ' + nome + ' esce ' + fuori.join(', ') + (testo ? ' ("' + testo + '")' : ''));
      }
    });
  });
  return problemi;
}
"""


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = pathlib.Path(sys.argv[1]).resolve()
    cartella = src.parent
    html = documento(src.read_text())
    (cartella / "pagina.html").write_text(html)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        pagina = browser.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
        pagina.set_content(html, wait_until="load")
        pagina.wait_for_function("document.body.getAttribute('data-pronto') === '1'")
        pagina.evaluate("document.fonts.ready")
        if not pagina.evaluate("document.fonts.check('700 84px Saira')"):
            sys.exit("Errore: il font Saira non si e' caricato")
        problemi = pagina.evaluate(CONTROLLO_JS)
        slide = pagina.query_selector_all("section.slide")
        if not slide:
            sys.exit("Errore: nessuna <section class=\"slide\"> trovata")
        for vecchio in cartella.glob("slide-*.jpg"):
            vecchio.unlink()
        file_jpg = []
        for i, el in enumerate(slide, start=1):
            png = cartella / f"slide-{i:02d}.png"
            el.screenshot(path=str(png))
            jpg = cartella / f"slide-{i:02d}.jpg"
            with Image.open(png) as im:
                im.convert("RGB").save(jpg, "JPEG", quality=95, subsampling=0, optimize=True)
            png.unlink()
            file_jpg.append(jpg)
        browser.close()

    # anteprima: tutte le slide in piccolo, 4 per riga
    colonne, scala, spazio = 4, 0.3, 16
    w, h = int(1080 * scala), int(1350 * scala)
    righe = math.ceil(len(file_jpg) / colonne)
    foglio = Image.new("RGB", (colonne * w + (colonne + 1) * spazio, righe * h + (righe + 1) * spazio), (17, 17, 17))
    for i, f in enumerate(file_jpg):
        with Image.open(f) as im:
            piccola = im.resize((w, h), Image.LANCZOS)
        x = spazio + (i % colonne) * (w + spazio)
        y = spazio + (i // colonne) * (h + spazio)
        foglio.paste(piccola, (x, y))
    foglio.save(cartella / "anteprima.jpg", "JPEG", quality=90)

    print(f"Fatto: {len(file_jpg)} slide in {cartella}")
    if problemi:
        print("\nATTENZIONE, elementi fuori dall'area dei contenuti:")
        for riga in problemi:
            print(" -", riga)
        sys.exit(2)


if __name__ == "__main__":
    main()

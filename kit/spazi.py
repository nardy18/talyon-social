#!/usr/bin/env python3
"""Calendario dei post Talyon: il prossimo spazio libero per un carosello o un reel.

Uso:
    python3 kit/spazi.py prossimo <carosello|reel> <oggi AAAA-MM-GG> <post.json> [<temi.md>] [--quanti N]

post.json è la risposta di getScheduledPosts di Metricool (bozze comprese).
Spazi (ora italiana): caroselli il martedì alle 18:30 e il giovedì alle 9:00, reel il mercoledì alle 18:30.
Lo spazio deve cadere almeno 3 giorni dopo oggi ed essere libero: in Metricool nessun post dello stesso tipo
in quella data, e nell'elenco dei temi nessuna riga con quella data.
Stampa data e ora, es. 2026-12-09T18:30 (con --quanti N, i primi N spazi liberi, uno per riga).
"""
import datetime as dt
import json
import pathlib
import re
import sys

SPAZI = {"carosello": [(1, "18:30"), (3, "09:00")], "reel": [(2, "18:30")]}   # giorno della settimana: lunedì = 0
TIPO = {"carosello": "POST", "reel": "REEL"}
MESI = {"gen": 1, "feb": 2, "mar": 3, "apr": 4, "mag": 5, "giu": 6, "lug": 7, "ago": 8, "set": 9, "ott": 10, "nov": 11, "dic": 12}
ANTICIPO = 3          # giorni minimi tra oggi e lo spazio
ORIZZONTE = 180       # giorni oltre i quali non si cerca più


def date_metricool(programmati, tipo: str) -> set:
    """Date dei post dello stesso tipo in Metricool (POST = carosello, REEL = reel), bozze comprese."""
    elenco = programmati.get("data", []) if isinstance(programmati, dict) else (programmati or [])
    date = set()
    for p in elenco:
        if (p.get("instagramData") or {}).get("type", "POST") != TIPO[tipo]:
            continue
        quando = (p.get("publicationDate") or {}).get("dateTime", "")
        if quando:
            date.add(dt.date.fromisoformat(quando[:10]))
    return date


def date_temi(testo: str) -> set:
    """Date scritte nell'elenco dei temi, come «mar 17 nov 2026» o «2026-11-17»."""
    date = set()
    for g, m, a in re.findall(r"\b(\d{1,2}) (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)[a-z]* (\d{4})\b", testo or ""):
        date.add(dt.date(int(a), MESI[m], int(g)))
    for a, m, g in re.findall(r"\b(\d{4})-(\d{2})-(\d{2})\b", testo or ""):
        date.add(dt.date(int(a), int(m), int(g)))
    return date


def prossimi(tipo: str, oggi: str, programmati, temi: str = "", quanti: int = 1) -> list:
    """I primi spazi liberi del tipo, ad almeno 3 giorni da oggi."""
    if tipo not in SPAZI:
        raise ValueError(f"tipo «{tipo}»: carosello o reel")
    occupate = date_metricool(programmati, tipo) | date_temi(temi)
    giorno, liberi = dt.date.fromisoformat(oggi) + dt.timedelta(days=ANTICIPO), []
    for _ in range(ORIZZONTE):
        for settimana, ora in SPAZI[tipo]:
            if giorno.weekday() == settimana and giorno not in occupate:
                liberi.append(f"{giorno.isoformat()}T{ora}")
                if len(liberi) == quanti:
                    return liberi
        giorno += dt.timedelta(days=1)
    raise RuntimeError("nessuno spazio libero nei prossimi mesi")


def prossimo(tipo: str, oggi: str, programmati, temi: str = "") -> str:
    """Il primo spazio libero del tipo, ad almeno 3 giorni da oggi."""
    return prossimi(tipo, oggi, programmati, temi)[0]


def main(argv):
    if len(argv) < 5 or argv[1] != "prossimo":
        sys.exit(__doc__)
    quanti = 1
    if "--quanti" in argv:
        i = argv.index("--quanti")
        quanti = int(argv[i + 1])
        argv = argv[:i] + argv[i + 2:]
    tipo, oggi, post_json = argv[2], argv[3], pathlib.Path(argv[4])
    temi = pathlib.Path(argv[5]).read_text() if len(argv) > 5 else ""
    try:
        programmati = json.loads(post_json.read_text())
    except (OSError, ValueError):
        sys.exit(f"{post_json}: manca o non è JSON valido. Salvaci la risposta di getScheduledPosts "
                 "(passo 2 di kit/LEGGIMI.md) e rilancia.")
    print("\n".join(prossimi(tipo, oggi, programmati, temi, quanti)))


if __name__ == "__main__":
    main(sys.argv)

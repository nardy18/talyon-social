"""Test dei temi R03–R06 (Task 5): copioni validi, aree pulite, nessun errore, blocchi disegnati."""
import json
import math
import pathlib
import sys
import unittest

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
import reel  # noqa: E402

PROVE = QUI.parent / "prove"
# blocchi che cambiano solo la schermata del telefono: i loro dati sono nomi di schermate, non testi
SOLO_SCHERMO = {"telefono-schermata"}


def foglie(v):
    """Tutte le stringhe e i numeri dentro i dati di un blocco, riga per riga."""
    if isinstance(v, dict):
        return [x for k in v.values() for x in foglie(k)]
    if isinstance(v, list):
        return [x for k in v for x in foglie(k)]
    if isinstance(v, (int, float)):
        return [str(v)]
    return [r.strip() for r in str(v).replace(" ↑", "").replace(" ↓", "").split("\n") if r.strip()]


class TemaR03R06:
    nome = None

    @classmethod
    def setUpClass(cls):
        cls.percorso = PROVE / f"{cls.nome}.json"
        cls.copione = json.loads(cls.percorso.read_text())
        cls.s = reel.apri(cls.percorso)
        cls.p = cls.s.page.evaluate("TALYON.piano()")

    @classmethod
    def tearDownClass(cls):
        cls.s.chiudi()

    def test_copione_valido(self):
        self.assertEqual(reel.valida_copione(self.copione), [])

    def test_aree(self):
        self.assertEqual(self.s.page.evaluate("(tt) => TALYON.controllaAree(tt)", self.p["fotogrammiChiave"]), [])

    def test_nessun_errore(self):
        for t in range(0, math.ceil(self.p["durata"])):
            self.s.page.evaluate("(t) => window.renderFrame(t, 0.25)", t)
        self.assertEqual(self.s.errori, [])

    def test_blocchi_disegnati(self):
        """Nel fotogramma chiave di ogni momento e del culmine si leggono testi presi dai dati del suo blocco."""
        parti = self.copione["momenti"] + [self.copione["culmine"]]
        sezioni = [s for s in self.p["sezioni"] if s["tipo"] in ("momento", "culmine")]
        for parte, sez in zip(parti, sezioni):
            if parte["blocco"] in SOLO_SCHERMO:
                continue
            t = self.p["fotogrammiChiave"][self.p["sezioni"].index(sez)]
            testi = set(self.s.page.evaluate("(t) => TALYON.controllaAree([t], null, { tutti: true }).map((v) => v.testo)", t))
            attesi = set(foglie(parte["dati"]))
            with self.subTest(blocco=parte["blocco"], t=t):
                self.assertTrue(attesi & testi, f"{parte['blocco']} a {t} s: nessun testo dei dati tra {sorted(testi)}")


class TestR03(TemaR03R06, unittest.TestCase):
    nome = "r03"


class TestR04(TemaR03R06, unittest.TestCase):
    nome = "r04"


class TestR05(TemaR03R06, unittest.TestCase):
    nome = "r05"


class TestR06(TemaR03R06, unittest.TestCase):
    nome = "r06"


if __name__ == "__main__":
    unittest.main()

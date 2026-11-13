"""Test della regia: il reel disegnato dal copione (Task 4)."""
import hashlib
import json
import math
import pathlib
import sys
import unittest

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
import reel  # noqa: E402

PERCORSO = QUI.parent / "prove" / "minimo.json"
MINIMO = json.loads(PERCORSO.read_text())


class TestRegia(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.s = reel.apri(PERCORSO)
        cls.p = cls.s.page.evaluate("TALYON.piano()")

    @classmethod
    def tearDownClass(cls):
        cls.s.chiudi()

    def png(self, t):
        return hashlib.sha1(self.s.page.evaluate(
            "(t) => { window.renderFrame(t, 0.5); return document.getElementById('c').toDataURL('image/png'); }", t).encode()).hexdigest()

    def test_nessun_errore(self):
        for t in range(0, math.ceil(self.p["durata"])):
            self.s.page.evaluate("(t) => window.renderFrame(t, 0.25)", t)
        self.assertEqual(self.s.errori, [])

    def test_deterministico(self):
        self.assertEqual(self.png(12.3), self.png(12.3))

    def test_aree(self):
        tempi = [t for t, sez in zip(self.p["fotogrammiChiave"], self.p["sezioni"]) if sez["tipo"] != "chiusura"]
        self.assertEqual(self.s.page.evaluate("(tt) => TALYON.controllaAree(tt)", tempi), [])

    def test_titolo_disegnato(self):
        sez = [x for x in self.p["sezioni"] if x["tipo"] == "momento"][0]
        t = self.p["fotogrammiChiave"][self.p["sezioni"].index(sez)]
        testi = self.s.page.evaluate("(t) => TALYON.controllaAree([t], null, { tutti: true }).map((v) => v.testo)", t)
        for parola in " ".join(MINIMO["momenti"][0]["titolo"]).split():
            self.assertIn(parola, testi)


if __name__ == "__main__":
    unittest.main()


class TestControlla(unittest.TestCase):
    def test_controlla_crea_file(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            esito = reel.controlla(PERCORSO, pathlib.Path(d))
            self.assertEqual(esito, 0)
            self.assertTrue((pathlib.Path(d) / "controllo.jpg").exists())
            chiave = sorted((pathlib.Path(d) / "chiave").glob("*.jpg"))
            self.assertEqual(len(chiave), 7)

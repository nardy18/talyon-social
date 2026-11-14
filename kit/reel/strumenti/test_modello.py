"""Test del modello: dal copione alla linea del tempo (Task 3)."""
import copy
import json
import pathlib
import sys
import unittest

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
import reel  # noqa: E402

PERCORSO = QUI.parent / "prove" / "minimo.json"
MINIMO = json.loads(PERCORSO.read_text())
E = 1e-6


class TestModello(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.s = reel.apri(PERCORSO)

    @classmethod
    def tearDownClass(cls):
        cls.s.chiudi()

    def piano(self, c):
        return self.s.page.evaluate("(c) => TALYON.piano(c)", c)

    def con_momenti(self, n, durata):
        c = copy.deepcopy(MINIMO)
        c["momenti"] = [dict(copy.deepcopy(MINIMO["momenti"][i % 3]), durata=durata) for i in range(n)]
        return c

    def test_durata(self):
        p = self.piano(MINIMO)
        self.assertTrue(30 - E <= p["durata"] <= 36 + E, p["durata"])

    def test_ordine(self):
        sez = self.piano(MINIMO)["sezioni"]
        self.assertEqual([s["tipo"] for s in sez], ["gancio", "logo", "momento", "momento", "momento", "culmine", "chiusura"])
        for a, b in zip(sez, sez[1:]):
            self.assertLessEqual(b["t0"], a["t1"] + E, (a, b))
            self.assertLessEqual(a["t1"] - b["t0"], 0.6 + E, (a, b))

    def test_colpo_in_battere(self):
        p = self.piano(MINIMO)
        culmine = [s for s in p["sezioni"] if s["tipo"] == "culmine"][0]
        self.assertTrue(any(abs(b - p["colpo"]) < E for b in p["battute"]), (p["colpo"], p["battute"]))
        self.assertGreaterEqual(p["colpo"], culmine["t0"] + 1.0 - E)

    def test_chiusura(self):
        p = self.piano(MINIMO)
        ultima = p["sezioni"][-1]
        self.assertEqual(ultima["tipo"], "chiusura")
        self.assertAlmostEqual(ultima["t1"] - ultima["t0"], 4.0, places=6)
        self.assertAlmostEqual(ultima["t1"], p["durata"], places=6)

    def test_momenti_minimi(self):
        for s in self.piano(MINIMO)["sezioni"]:
            if s["tipo"] == "momento":
                self.assertGreaterEqual(s["t1"] - s["t0"], 4.5 - E)

    def test_quattro_momenti(self):
        p = self.piano(self.con_momenti(4, 7.5))
        self.assertLessEqual(p["durata"], 36 + E)
        for s in p["sezioni"]:
            if s["tipo"] == "momento":
                self.assertGreaterEqual(s["t1"] - s["t0"], 4.5 - E)

    def test_corto_allungato(self):
        p = self.piano(self.con_momenti(3, 4.5))
        self.assertGreaterEqual(p["durata"], 30 - E)

    def test_fotogrammi_chiave(self):
        p = self.piano(MINIMO)
        self.assertEqual(len(p["fotogrammiChiave"]), len(p["sezioni"]))
        for t, s in zip(p["fotogrammiChiave"], p["sezioni"]):
            self.assertTrue(s["t0"] - E <= t <= s["t1"] + E, (t, s))


if __name__ == "__main__":
    unittest.main()

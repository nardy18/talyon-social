"""Test del copione e della pagina del modello dei reel (Task 1)."""
import copy
import json
import os
import pathlib
import shutil
import sys
import unittest

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
import reel  # noqa: E402

MINIMO = json.loads((QUI.parent / "prove" / "minimo.json").read_text())


def errori_con(c, parola):
    return [e for e in reel.valida_copione(c) if parola in e]


class TestCopione(unittest.TestCase):
    def test_minimo_valido(self):
        self.assertEqual(reel.valida_copione(copy.deepcopy(MINIMO)), [])

    def test_funzione_sconosciuta(self):
        c = copy.deepcopy(MINIMO)
        c["funzione"] = "progressione"
        self.assertTrue(errori_con(c, "funzione"))

    def test_righe_gancio(self):
        c = copy.deepcopy(MINIMO)
        c["gancio"]["righe"] = ["Una", "due", "tre", "quattro"]
        self.assertTrue(errori_con(c, "gancio"))

    def test_titolo_tre_righe(self):
        c = copy.deepcopy(MINIMO)
        c["momenti"][0]["titolo"] = ["Una", "due", "tre"]
        self.assertTrue(errori_con(c, "titolo"))

    def test_hashtag(self):
        c = copy.deepcopy(MINIMO)
        c["didascalia"] += " #sesto"
        self.assertTrue(errori_con(c, "hashtag"))

    def test_nome_non_demo(self):
        c = copy.deepcopy(MINIMO)
        c["momenti"][0]["dati"]["righe"][0][0] = "Giuseppe"
        self.assertTrue(errori_con(c, "Giuseppe"))

    def test_durata_momento(self):
        c = copy.deepcopy(MINIMO)
        c["momenti"][1]["durata"] = 6.5
        self.assertEqual(reel.valida_copione(c), [])
        c["momenti"][1]["durata"] = 9
        self.assertTrue(errori_con(c, "durata"))


class TestPagina(unittest.TestCase):
    def test_pagina_senza_node(self):
        senza = [d for d in os.environ["PATH"].split(os.pathsep)
                 if d and not (pathlib.Path(d, "node").exists() or pathlib.Path(d, "npm").exists())]
        vecchio = os.environ["PATH"]
        os.environ["PATH"] = os.pathsep.join(senza)
        try:
            self.assertIsNone(shutil.which("node"))
            with reel.apri(QUI.parent / "prove" / "minimo.json", clip="chiave") as s:
                self.assertTrue(s.page.evaluate("document.fonts.check('700 84px SairaT')"))
                self.assertTrue(s.page.evaluate("document.fonts.check('500 36px SairaB')"))
                s.page.evaluate("window.renderFrame(0)")
                self.assertEqual(s.errori, [])
        finally:
            os.environ["PATH"] = vecchio


if __name__ == "__main__":
    unittest.main()

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


def con_momento(blocco, dati):
    """Il copione minimo con il primo momento sostituito da un blocco con questi dati."""
    c = copy.deepcopy(MINIMO)
    c["momenti"][0] = {"titolo": ["Due righe", "di titolo."], "blocco": blocco, "dati": dati}
    return c


class TestFormaDeiDati(unittest.TestCase):
    """Dati che il blocco non sa disegnare: valida li ferma prima del video (NaN, telefono vuoto, righe tagliate)."""

    def test_numero_non_intero(self):
        c = con_momento("elenco-contatore", {"numero": "tre", "etichetta": "atleti", "righe": [["Luca", "Da seguire", "rame"]]})
        self.assertTrue(errori_con(c, "numero"))

    def test_numero_zero(self):
        c = con_momento("elenco-contatore", {"numero": 0, "etichetta": "atleti", "righe": [["Luca", "Da seguire", "rame"]]})
        self.assertTrue(errori_con(c, "numero"))

    def test_schermata_sconosciuta(self):
        c = con_momento("telefono-schermata", {"da": "calendario", "a": "sessione"})
        self.assertTrue(errori_con(c, "calendario"))

    def test_righe_di_testi(self):
        c = con_momento("pannello-righe", {"intestazione": "Luca · massimali", "righe": ["Trazione +65 kg", "Dip +90 kg"]})
        self.assertTrue(errori_con(c, "righe"))

    def test_troppe_righe(self):
        riga = ["Back-off", "+52,5 kg", "@8", "@8,5", "@9,5 ↑"]
        c = con_momento("celle-coach", {"atleta": "Luca", "righe": [riga] * 6})
        self.assertTrue(errori_con(c, "righe"))

    def test_testo_vuoto(self):
        c = con_momento("pannello-righe", {"intestazione": None, "righe": [["Trazione", "+65 kg"]]})
        self.assertTrue(errori_con(c, "intestazione"))

    def test_stato_sconosciuto(self):
        c = con_momento("seguire-lista", {"titolo": "Atleti da seguire", "righe": [["Luca", "Da seguire", "rosso"]]})
        self.assertTrue(errori_con(c, "rosso"))

    def test_palestra_inventata(self):
        c = con_momento("invito-qr", {"palestra": "Luca"})
        self.assertTrue(errori_con(c, "palestra"))

    def test_troppi_richiami(self):
        c = con_momento("sessione-serie", {"richiami": [["Serie già\ncompilate"], ["Un tocco"]]})
        self.assertTrue(errori_con(c, "richiami"))

    def test_tre_telefoni(self):
        atleti = [{"nome": "Luca", "schermo": "settimana:luca"}, {"nome": "Anna", "schermo": "settimana:anna"}]
        self.assertTrue(errori_con(con_momento("tre-telefoni", {"atleti": atleti}), "atleti"))
        atleti.append({"nome": "Matteo", "schermo": "settimana:matteo", "sotto": "Settimana 4"})
        self.assertEqual(reel.valida_copione(con_momento("tre-telefoni", {"atleti": atleti})), [])

    def test_dato_che_il_blocco_non_usa(self):
        c = con_momento("assegna-modello", {"modello": "Forza · 4 settimane", "dettagli": "3 giorni", "atleti": ["Luca"]})
        self.assertTrue(errori_con(c, "dettagli"))

    def test_copioni_pronti_validi(self):
        """I copioni già scritti (prove e reel fatti) restano validi con le forme."""
        for f in sorted((QUI.parent / "prove").glob("*.json")) + sorted((QUI.parent.parent.parent / "reel").glob("*/copione.json")):
            with self.subTest(copione=f.name):
                self.assertEqual(reel.valida_copione(json.loads(f.read_text())), [])


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

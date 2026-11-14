"""Test del controllo delle aree coperte da Instagram (Task 2)."""
import pathlib
import sys
import unittest

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
import reel  # noqa: E402

MINIMO = QUI.parent / "prove" / "minimo.json"

# un titolo dei momenti come lo disegna la regia: in alto a sinistra, 84 px, due righe
TITOLO = """(righe) => TALYON.controllaAree([2], (ctx, t) =>
  TALYON.testo.wordsBlock(ctx, TALYON.testo.W2(righe, 0), 80, 372, 700, 84, t, {}))"""


class TestAree(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.s = reel.apri(MINIMO)

    @classmethod
    def tearDownClass(cls):
        cls.s.chiudi()

    def test_minimo_aree_pulite(self):
        self.assertEqual(self.s.page.evaluate(TITOLO, ["Vedi chi", "si è fermato."]), [])
        self.assertEqual(self.s.errori, [])

    def test_titolo_lungo_segnalato(self):
        fuori = self.s.page.evaluate(TITOLO, ["Scrivi la settimana intera come in palestra", "e poi assegnala."])
        self.assertTrue([v for v in fuori if v["testo"] in ("palestra", "Scrivi la settimana intera come in palestra")], fuori)

    def test_libero_esente(self):
        fuori = self.s.page.evaluate("""() => TALYON.controllaAree([2], (ctx, t) => TALYON.libero(() =>
            TALYON.testo.label(ctx, 'Gara marzo – copia.xlsx', 900, 1700, 600, 30, '#fff')))""")
        self.assertEqual(fuori, [])

    def test_schermate_del_catalogo(self):
        """Ogni schermata del catalogo (blocchi.json) esiste nel motore, e ogni schermata del motore è nel catalogo."""
        nomi = reel.BLOCCHI["schermi"]
        self.assertEqual(self.s.page.evaluate("(nn) => nn.filter((n) => TALYON.schermate.vuota(n))", nomi), [])
        self.assertEqual(sorted(set(self.s.page.evaluate("TALYON.schermate.motore()")) - set(nomi)), [])

    def test_riquadro_fuori_segnalato(self):
        fuori = self.s.page.evaluate("""() => TALYON.controllaAree([2], (ctx, t) =>
            TALYON.riquadro(ctx, 'prova', 950, 300, 540, 1300))""")
        self.assertTrue(fuori and fuori[0]["testo"].startswith("riquadro"), fuori)


if __name__ == "__main__":
    unittest.main()

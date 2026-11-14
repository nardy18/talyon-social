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


def problemi_del_momento(blocco, dati):
    """Quello che il controllo delle aree trova nel fotogramma chiave del primo momento, con questo blocco."""
    import copy
    import json
    c = json.loads(MINIMO.read_text())
    c["momenti"][0] = {"titolo": ["Due righe", "di titolo."], "blocco": blocco, "dati": dati}
    with reel.apri(None, copione=copy.deepcopy(c)) as s:
        P = s.page.evaluate("TALYON.piano()")
        return s.page.evaluate("(tt) => TALYON.controllaAree(tt)", [P["fotogrammiChiave"][2]])


class TestTestiNeiRiquadri(unittest.TestCase):
    """Testi che escono dal riquadro o dalla schermata del telefono, o che si coprono: il controllo li segnala."""

    def test_intestazione_che_esce_dal_riquadro(self):
        fuori = problemi_del_momento("pannello-righe", {
            "intestazione": "Anna · ultima seduta di martedì della settimana tre del blocco", "righe": [["Trazioni", "RPE 9,5"]]})
        self.assertTrue([v for v in fuori if "ULTIMA SEDUTA" in v["testo"]], fuori)

    def test_testi_della_riga_sovrapposti(self):
        fuori = problemi_del_momento("pannello-righe", {
            "intestazione": "Anna", "righe": [["Trazioni zavorrate presa prona 4 × 2 @8", "RPE 9,5 sopra il previsto"]]})
        self.assertTrue([v for v in fuori if "sovrappone" in v.get("motivo", "")], fuori)

    def test_testo_che_esce_dalla_schermata(self):
        fuori = problemi_del_momento("record-proposto", {
            "esercizio": "Trazione zavorrata presa supina stretta", "record": "+67,5 kg", "richiami": [["Proposto\nal coach"]]})
        self.assertTrue([v for v in fuori if "presa supina" in v["testo"]], fuori)

    def test_nota_troppo_lunga(self):
        nota = ("Fermo di un secondo in basso, gomiti stretti e spalle basse; se il fermo salta, "
                "togli due chili e mezzo e rifai la serie con calma, senza rimbalzo, fino alla fine della seduta.")
        fuori = problemi_del_momento("nota-scrivi", {"esercizio": "Dip con fermo", "nota": nota})
        self.assertTrue([v for v in fuori if "troppo lunga" in v.get("motivo", "")], fuori)

    def test_pulsante_che_non_entra(self):
        fuori = problemi_del_momento("scheda-conferma", {
            "intestazione": "Record da confermare", "righe": [["Luca · trazione", "+67,5 kg"]],
            "pulsante": "Conferma il record nuovo di Luca e aggiorna il massimale", "fatto": "Confermato"})
        self.assertTrue([v for v in fuori if "pulsante" in v.get("motivo", "")], fuori)

    def test_pulsante_assegna_che_non_entra(self):
        fuori = problemi_del_momento("assegna-modello", {
            "modello": "Forza · 4 settimane", "atleti": ["Luca"], "pulsante": "Assegna da lunedì", "fatto": "Assegnata da lunedì prossimo"})
        self.assertTrue([v for v in fuori if "pulsante" in v.get("motivo", "")], fuori)

    def test_testo_sotto_le_celle(self):
        fuori = problemi_del_momento("celle-coach", {
            "atleta": "Luca", "righe": [["Back-off", "+52,5 kg dalla top single del giorno", "@8", "@8,5", "@9,5 ↑"]]})
        self.assertTrue([v for v in fuori if "celle" in v.get("motivo", "")], fuori)

    def test_righe_corte_pulite(self):
        self.assertEqual(problemi_del_momento("pannello-righe", {
            "intestazione": "Anna · ultima seduta", "righe": [["Trazioni 4 × 2 @8", "RPE 9,5"], ["Dip 4 × 3 @7", "RPE 9"]]}), [])


if __name__ == "__main__":
    unittest.main()

"""Test della musica e degli effetti dal piano (Task 7)."""
import copy
import json
import pathlib
import sys
import tempfile
import unittest
import wave

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
import reel  # noqa: E402

PERCORSO = QUI.parent / "prove" / "minimo.json"
MINIMO = json.loads(PERCORSO.read_text())

# kit finto: registra ogni suono con il suo tempo e il nome dello strumento (se c'è)
KIT_FINTO = """() => {
  const log = [];
  const kit = {
    tone: (t, p) => log.push({ t, nome: p && p.nome }), noise: (t, p) => log.push({ t, nome: p && p.nome }),
    play: (n, t) => log.push({ t, nome: n }), hz: SOUND.hz, bed() {}, music() {}, withMinor: (f) => f(), vo: false,
  };
  TALYON.scoreSound(kit);
  const P = TALYON.piano();
  return { colpo: P.colpo, durata: P.durata, crash: log.filter((v) => v.nome === 'crash').map((v) => v.t), n: log.length };
}"""


class TestColpo(unittest.TestCase):
    def test_colpo_suonato(self):
        with reel.apri(PERCORSO) as s:
            r = s.page.evaluate(KIT_FINTO)
            self.assertEqual(s.errori, [])
        self.assertTrue(any(abs(t - r["colpo"]) <= 0.01 for t in r["crash"]), r)

    def test_risolto_a_tempo(self):
        """L'accordo risolto (1,5 s dopo l'inizio della chiusura) cade su un battito dopo il colpo."""
        with reel.apri(PERCORSO) as s:
            P = s.page.evaluate("TALYON.piano()")
        ris = P["sezioni"][-1]["t0"] + 1.5
        passi = (ris - P["colpo"]) / 0.5
        self.assertAlmostEqual(passi, round(passi), places=6)


class TestVolume(unittest.TestCase):
    def test_volume_varianti(self):
        for v in range(4):
            c = copy.deepcopy(MINIMO)
            c["musica"], c["slug"] = v, f"minimo-musica-{v}"
            with tempfile.TemporaryDirectory() as d, self.subTest(variante=v):
                percorso, uscita = pathlib.Path(d) / "copione.json", pathlib.Path(d) / "audio.wav"
                percorso.write_text(json.dumps(c, ensure_ascii=False))
                info = reel.audio(percorso, uscita)
                forte, picco = reel.misura_volume(uscita)
                with wave.open(str(uscita)) as w:
                    campioni, sr = w.getnframes(), w.getframerate()
                self.assertEqual(sr, 48000)
                self.assertAlmostEqual(forte, -14.0, delta=0.5)
                self.assertLessEqual(picco, -1.0)
                self.assertLessEqual(abs(campioni - round(info["durata"] * 48000)), 1)


if __name__ == "__main__":
    unittest.main()

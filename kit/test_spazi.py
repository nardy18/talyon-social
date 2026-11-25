"""Test del calendario: il prossimo spazio libero per un carosello o un reel (Task 9)."""
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
import spazi  # noqa: E402


def post(data_ora, tipo="POST", bozza=False):
    """Un post come lo restituisce getScheduledPosts di Metricool."""
    return {"publicationDate": {"dateTime": data_ora, "timezone": "Europe/Rome"}, "draft": bozza,
            "instagramData": {"type": tipo, "showReelOnFeed": True, "isAiGenerated": False}}


class TestSpazi(unittest.TestCase):
    def test_mercoledi_occupato(self):
        programmati = {"data": [post("2026-11-25T14:00:00", "REEL", bozza=True), post("2026-12-02T14:00:00", "REEL")]}
        self.assertEqual(spazi.prossimo("reel", "2026-11-21", programmati), "2026-12-09T14:00")

    def test_carosello(self):
        programmati = {"data": [post("2026-11-17T14:00:00"), post("2026-11-18T14:00:00", "REEL")]}
        self.assertEqual(spazi.prossimo("carosello", "2026-11-14", programmati), "2026-11-20T14:00")

    def test_tre_giorni(self):
        self.assertEqual(spazi.prossimo("reel", "2026-11-15", {"data": []}), "2026-11-18T14:00")

    def test_data_nei_temi(self):
        temi = "| 3 | verde | Domenica sera | ... | in bozza | mer 2 dic 2026 | |\n"
        programmati = {"data": [post("2026-11-25T14:00:00", "REEL", bozza=True)]}
        self.assertEqual(spazi.prossimo("reel", "2026-11-21", programmati, temi), "2026-12-09T14:00")

    def test_due_caroselli(self):
        programmati = {"data": [post("2026-11-17T14:00:00")]}
        self.assertEqual(spazi.prossimi("carosello", "2026-11-14", programmati, quanti=2), ["2026-11-20T14:00", "2026-11-23T14:00"])

    def test_riga_di_comando(self):
        cartella = pathlib.Path(__file__).resolve().parent
        f = cartella / "_prova_post.json"
        try:
            f.write_text(json.dumps({"data": [post("2026-11-17T14:00:00")]}))
            r = subprocess.run([sys.executable, str(cartella / "spazi.py"), "prossimo", "carosello", "2026-11-14", str(f)],
                               capture_output=True, text=True, check=True)
            self.assertEqual(r.stdout.strip(), "2026-11-20T14:00")
        finally:
            f.unlink(missing_ok=True)

    def _riga(self, post_json):
        cartella = pathlib.Path(__file__).resolve().parent
        return subprocess.run([sys.executable, str(cartella / "spazi.py"), "prossimo", "reel", "2026-11-21", str(post_json)],
                              capture_output=True, text=True)

    def test_file_dei_post_mancante(self):
        """Senza il file dei post: una riga che dice cosa manca, niente traceback."""
        with tempfile.TemporaryDirectory() as d:
            r = self._riga(pathlib.Path(d) / "post.json")
        self.assertNotEqual(r.returncode, 0)
        self.assertNotIn("Traceback", r.stderr)
        self.assertIn("getScheduledPosts", r.stderr)

    def test_file_dei_post_non_valido(self):
        with tempfile.TemporaryDirectory() as d:
            f = pathlib.Path(d) / "post.json"
            f.write_text("non è JSON")
            r = self._riga(f)
        self.assertNotEqual(r.returncode, 0)
        self.assertNotIn("Traceback", r.stderr)
        self.assertIn("getScheduledPosts", r.stderr)


if __name__ == "__main__":
    unittest.main()

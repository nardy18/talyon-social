"""Test del calendario: il prossimo spazio libero per un carosello o un reel (Task 9)."""
import json
import pathlib
import subprocess
import sys
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
        programmati = {"data": [post("2026-11-25T18:30:00", "REEL", bozza=True), post("2026-12-02T18:30:00", "REEL")]}
        self.assertEqual(spazi.prossimo("reel", "2026-11-21", programmati), "2026-12-09T18:30")

    def test_carosello(self):
        programmati = {"data": [post("2026-11-17T18:30:00"), post("2026-11-18T18:30:00", "REEL")]}
        self.assertEqual(spazi.prossimo("carosello", "2026-11-14", programmati), "2026-11-19T09:00")

    def test_tre_giorni(self):
        self.assertEqual(spazi.prossimo("reel", "2026-11-15", {"data": []}), "2026-11-18T18:30")

    def test_data_nei_temi(self):
        temi = "| 3 | verde | Domenica sera | ... | in bozza | mer 2 dic 2026 | |\n"
        programmati = {"data": [post("2026-11-25T18:30:00", "REEL", bozza=True)]}
        self.assertEqual(spazi.prossimo("reel", "2026-11-21", programmati, temi), "2026-12-09T18:30")

    def test_due_caroselli(self):
        programmati = {"data": [post("2026-11-17T18:30:00")]}
        self.assertEqual(spazi.prossimi("carosello", "2026-11-14", programmati, quanti=2), ["2026-11-19T09:00", "2026-11-24T18:30"])

    def test_riga_di_comando(self):
        cartella = pathlib.Path(__file__).resolve().parent
        f = cartella / "_prova_post.json"
        try:
            f.write_text(json.dumps({"data": [post("2026-11-17T18:30:00")]}))
            r = subprocess.run([sys.executable, str(cartella / "spazi.py"), "prossimo", "carosello", "2026-11-14", str(f)],
                               capture_output=True, text=True, check=True)
            self.assertEqual(r.stdout.strip(), "2026-11-19T09:00")
        finally:
            f.unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main()

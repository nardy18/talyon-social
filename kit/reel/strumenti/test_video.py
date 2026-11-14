"""Test del video finito (Task 8): render a parti, audio, copertina e controllo con ffprobe."""
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
import reel  # noqa: E402

MINIMO = json.loads((QUI.parent / "prove" / "minimo.json").read_text())


def sonda(mp4):
    r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-of", "json", str(mp4)],
                       capture_output=True, text=True, check=True)
    flussi = json.loads(r.stdout)["streams"]
    return [s for s in flussi if s["codec_type"] == "video"][0], [s for s in flussi if s["codec_type"] == "audio"]


class TestVideo(unittest.TestCase):
    def test_video_breve(self):
        with tempfile.TemporaryDirectory() as d:
            cartella = pathlib.Path(d) / "R99-minimo"
            cartella.mkdir()
            (cartella / "copione.json").write_text(json.dumps(MINIMO, ensure_ascii=False))
            esito = reel.video(cartella, fino=7)
            mp4 = cartella / "talyon-reel99.mp4"
            self.assertEqual(esito, 0)
            v, a = sonda(mp4)
            self.assertEqual((v["width"], v["height"]), (1080, 1920))
            self.assertEqual(v["r_frame_rate"], "30/1")
            self.assertEqual(v["pix_fmt"], "yuv420p")
            self.assertEqual(int(v["nb_read_frames"]), 210)
            self.assertEqual(len(a), 1)
            self.assertAlmostEqual(float(a[0]["duration"]), 7.0, delta=0.05)
            self.assertTrue((cartella / "copertina.jpg").stat().st_size > 50_000)
            self.assertTrue((cartella / "controllo.jpg").exists())
            self.assertFalse(list(cartella.glob("*.tmp.mp4")))


if __name__ == "__main__":
    unittest.main()

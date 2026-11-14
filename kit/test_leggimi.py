"""Test delle istruzioni dell'attività del sabato (kit/LEGGIMI.md): l'attività non ha nessuno che la guida,
quindi i passi che la tengono in piedi devono esserci, nel punto giusto."""
import pathlib
import re
import unittest

LEGGIMI = (pathlib.Path(__file__).resolve().parent / "LEGGIMI.md").read_text()


def passo(n: int) -> str:
    """Il testo del passo n della lista «I passi, in ordine», fino al passo dopo."""
    m = re.search(rf"^{n}\. \*\*.*?(?=^{n + 1}\. \*\*|^## )", LEGGIMI, re.S | re.M)
    return m.group(0) if m else ""


class TestLeggimi(unittest.TestCase):
    def test_post_salvati_prima_dei_caroselli(self):
        """L'elenco dei post di Metricool si salva al passo 2: serve ai caroselli e al reel, anche senza caroselli."""
        self.assertIn("getScheduledPosts", passo(2))
        self.assertIn("/tmp/post.json", passo(2))
        self.assertLess(LEGGIMI.index("/tmp/post.json"), LEGGIMI.index("5. **Caroselli.**"))

    def test_reel_usa_i_post_del_passo_2(self):
        self.assertRegex(passo(6), r"/tmp/post\.json[^\n]*passo 2|passo 2[^\n]*/tmp/post\.json")

    def test_limite_dei_giri_del_reel(self):
        """Il reel si corregge al massimo 3 volte, poi si applica «Se il reel non viene bene»: il giro non resta bloccato."""
        self.assertIn("al massimo 3 giri", passo(6))
        self.assertIn("«Se il reel non viene bene»", passo(6))


if __name__ == "__main__":
    unittest.main()

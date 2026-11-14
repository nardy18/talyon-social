"""Test dei temi R07–R10 (Task 6): gli stessi controlli dei temi R03–R06."""
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from test_r03_r06 import TemaR03R06 as Tema  # noqa: E402


class TestR07(Tema, unittest.TestCase):
    nome = "r07"


class TestR08(Tema, unittest.TestCase):
    nome = "r08"


class TestR09(Tema, unittest.TestCase):
    nome = "r09"


class TestR10(Tema, unittest.TestCase):
    nome = "r10"


if __name__ == "__main__":
    unittest.main()

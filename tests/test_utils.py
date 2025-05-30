import unittest
import string
# Assuming 'app' is discoverable (e.g., PYTHONPATH is set or project is structured as a package)
from app.utils import generate_short_code

class TestUtils(unittest.TestCase):

    def test_generate_short_code_default_length(self):
        """Test that generate_short_code produces a code of the default length."""
        code = generate_short_code()
        self.assertEqual(len(code), 6)

    def test_generate_short_code_custom_length(self):
        """Test that generate_short_code produces a code of a custom length."""
        custom_length = 8
        code = generate_short_code(length=custom_length)
        self.assertEqual(len(code), custom_length)

    def test_generate_short_code_characters(self):
        """Test that generate_short_code uses the correct character set."""
        code = generate_short_code(length=100) # Generate a longer code
        allowed_chars = string.ascii_letters + string.digits
        for char_in_code in code:
            self.assertIn(char_in_code, allowed_chars)

    def test_generate_short_code_uniqueness_simple(self):
        """Test that multiple calls (few) produce unique codes."""
        codes = set()
        for _ in range(10): # Generate 10 codes
            codes.add(generate_short_code())
        self.assertEqual(len(codes), 10)

if __name__ == '__main__':
    unittest.main()

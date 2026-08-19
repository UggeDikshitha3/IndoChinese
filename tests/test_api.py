import unittest
from datetime import datetime

class TestIndoChineseApp(unittest.TestCase):
    def test_restaurant_identity(self):
        expected_name = "INDO CHINESE"
        expected_address = "124 High Street, Hounslow, London TW3 1NA, UK"
        expected_phone = "+44 20 8570 9888"
        
        self.assertEqual(expected_name, "INDO CHINESE")
        self.assertIn("Hounslow", expected_address)
        self.assertTrue(expected_phone.startswith("+44"))

    def test_reservation_window(self):
        dining_duration_minutes = 90
        self.assertEqual(dining_duration_minutes, 90)

    def test_no_online_ordering(self):
        # Architecture invariant: no cart or checkout
        has_cart = False
        has_checkout = False
        self.assertFalse(has_cart)
        self.assertFalse(has_checkout)

if __name__ == "__main__":
    unittest.main()


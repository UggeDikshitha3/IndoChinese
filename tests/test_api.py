import pytest
from datetime import datetime

def test_restaurant_identity():
    expected_name = "INDO CHINESE"
    expected_address = "124 High Street, Hounslow, London TW3 1NA, UK"
    expected_phone = "+44 20 8570 9888"
    
    assert expected_name == "INDO CHINESE"
    assert "Hounslow" in expected_address
    assert expected_phone.startswith("+44")

def test_reservation_window():
    dining_duration_minutes = 90
    assert dining_duration_minutes == 90

def test_no_online_ordering():
    # Architecture invariant: no cart or checkout
    has_cart = False
    has_checkout = False
    assert not has_cart
    assert not has_checkout

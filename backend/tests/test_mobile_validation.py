import sys
import os
import pytest
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pydantic import ValidationError
from app.schemas.schemas import UserRegister

def test_backend_mobile_validation():
    # Valid 10-digit Indian numbers starting with 6, 7, 8, 9
    valid_numbers = [
        "9876543210",
        "9123456789",
        "8765432109",
        "7012345678",
        "6987654321",
        "+919876543210", # With +91 prefix
        "91 9876543210", # With 91 space prefix
        "9876-543-210"   # With dashes
    ]
    for num in valid_numbers:
        user = UserRegister(
            full_name="Valid Passenger",
            email=f"valid_{num[-6:]}@railone.in",
            phone=num,
            password="securePassword#123"
        )
        assert len(user.phone) == 10
        assert user.phone[0] in "6789"

    # Invalid numbers
    invalid_numbers = [
        "1234567890",       # Starts with 1
        "5123456789",       # Starts with 5
        "123456789",        # 9 digits
        "987654321",        # 9 digits
        "98765432101",      # 11 digits
        "98765abcde",       # Letters
        "9876@#$%^",        # Symbols
        "123ujjke;dlmd",    # Mixed letters/symbols
        "abcdefghij",       # All letters
        "",                 # Empty
        "   "               # Whitespace
    ]
    for inv in invalid_numbers:
        with pytest.raises(ValidationError):
            UserRegister(
                full_name="Invalid Passenger",
                email="invalid@railone.in",
                phone=inv,
                password="securePassword#123"
            )

def test_frontend_sanitization_rules():
    # Emulate the frontend sanitization: value.replace(/\D/g, '').slice(0, 10)
    import re
    sanitize = lambda s: re.sub(r"\D", "", s)[:10]

    # A. Letters: "abcdef" -> ""
    assert sanitize("abcdef") == ""

    # B. Symbols: "@#$%^&*" -> ""
    assert sanitize("@#$%^&*") == ""

    # C. Mixed input: "98abc76@54" -> "987654"
    assert sanitize("98abc76@54") == "987654"

    # D. 10 valid digits: "9876543210" -> "9876543210"
    assert sanitize("9876543210") == "9876543210"

    # E. 11 digits: "98765432101" -> "9876543210"
    assert sanitize("98765432101") == "9876543210"

    # H. Paste mixed content: "abc9876543210xyz" -> "9876543210"
    assert sanitize("abc9876543210xyz") == "9876543210"

    # I. Paste more than 10 digits: "987654321012345" -> "9876543210"
    assert sanitize("987654321012345") == "9876543210"

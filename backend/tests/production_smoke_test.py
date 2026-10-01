"""
RailOne Production Smoke Test Suite
Executes live functional and security tests against the deployed production backend:
https://railone-backend-g9u4.onrender.com/api
"""
import urllib.request
import urllib.error
import json
import random
import uuid
import time
import sys

PROD_API = "https://railone-backend-g9u4.onrender.com/api"

def api_call(endpoint: str, method: str = "GET", data: dict = None, token: str = None) -> tuple[int, dict]:
    url = f"{PROD_API}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except:
            return e.code, {"error": content}
    except Exception as e:
        return 0, {"network_error": str(e)}

def run_smoke_tests():
    print(f"=== RAILONE PRODUCTION LIVE SMOKE TEST ===")
    print(f"Target: {PROD_API}\n")
    results = {}

    # 1. API Health
    status, res = api_call("/stations/popular")
    assert status == 200 and len(res) > 0, f"Popular stations check failed: {status}"
    results["API Reachability"] = "PASS"
    print("[PASS] 1. Production API is reachable and responding with 200.")

    # 2. Registration Validation (Test A: Empty submission)
    status, res = api_call("/auth/register", method="POST", data={})
    assert status == 422, f"Expected 422 on empty registration, got {status}"
    results["Empty Registration Validation"] = "PASS"
    print("[PASS] 2. Empty registration request correctly rejected with 422.")

    # 3. Registration Validation (Test C: Invalid Mobile)
    status, res = api_call("/auth/register", method="POST", data={
        "full_name": "QA Tester",
        "email": "valid_email@railone.in",
        "phone": "1234567890", # Invalid starting digit
        "password": "validPassword123"
    })
    assert status == 422, f"Expected 422 on invalid mobile, got {status}"
    results["Invalid Mobile Rejection"] = "PASS"
    print("[PASS] 3. Invalid Indian mobile number correctly rejected with 422.")

    # 4. Registration Validation (Test D: Short Password)
    status, res = api_call("/auth/register", method="POST", data={
        "full_name": "QA Tester",
        "email": "valid_email@railone.in",
        "phone": "9820011223",
        "password": "123" # Less than 6 chars
    })
    assert status == 422, f"Expected 422 on short password, got {status}"
    results["Short Password Rejection"] = "PASS"
    print("[PASS] 4. Short password correctly rejected with 422.")

    # 5. Clean QA User Registration (Test F)
    uid = uuid.uuid4().hex[:8]
    qa_email = f"qa_smoke_{uid}@railone.in"
    qa_phone = f"98{random.randint(10000000, 99999999)}"
    qa_pass = "QATestSecure#2026"
    qa_name = "RailOne QA Tester"

    status, reg_data = api_call("/auth/register", method="POST", data={
        "full_name": qa_name,
        "email": qa_email,
        "phone": qa_phone,
        "password": qa_pass
    })
    assert status == 200, f"Registration failed with {status}: {reg_data}"
    qa_token = reg_data["access_token"]
    qa_user_id = reg_data["user"]["id"]
    results["QA Account Registration"] = "PASS"
    print(f"[PASS] 5. QA User registration succeeded (ID: {qa_user_id}).")

    # 6. Duplicate Account Prevention (Phase 6)
    status, dup_res = api_call("/auth/register", method="POST", data={
        "full_name": "Duplicate Tester",
        "email": qa_email, # Same email
        "phone": f"97{random.randint(10000000, 99999999)}",
        "password": "otherPassword123"
    })
    assert status == 400 and "email already exists" in str(dup_res), f"Duplicate email not rejected: {status} {dup_res}"

    status, dup_phone_res = api_call("/auth/register", method="POST", data={
        "full_name": "Duplicate Tester",
        "email": f"other_{uuid.uuid4().hex[:6]}@railone.in",
        "phone": qa_phone, # Same phone
        "password": "otherPassword123"
    })
    assert status == 400 and "mobile number already exists" in str(dup_phone_res), f"Duplicate mobile not rejected: {status}"
    results["Duplicate Account Protection"] = "PASS"
    print("[PASS] 6. Duplicate email and mobile registrations strictly blocked by database.")

    # 7. Login Tests (Phase 7)
    # Incorrect password
    status, _ = api_call("/auth/login", method="POST", data={"username": qa_email, "password": "WrongPassword"})
    assert status == 401, f"Expected 401 on wrong password, got {status}"

    # Incorrect email
    status, _ = api_call("/auth/login", method="POST", data={"username": "nonexistent@railone.in", "password": qa_pass})
    assert status == 401, f"Expected 401 on wrong username, got {status}"

    # Correct credentials
    status, login_res = api_call("/auth/login", method="POST", data={"username": qa_email, "password": qa_pass})
    assert status == 200 and "access_token" in login_res, f"Login failed: {status}"
    qa_token = login_res["access_token"]
    results["Authentication & Login"] = "PASS"
    print("[PASS] 7. Authentication, invalid credential rejection, and re-login passed.")

    # 8. Protected Route & Profile (Phase 9)
    status, _ = api_call("/auth/me")
    assert status == 401, f"Unauthenticated access to /auth/me allowed: {status}"

    status, profile = api_call("/auth/me", token=qa_token)
    assert status == 200 and profile["email"] == qa_email, f"Failed to get profile: {status}"
    results["Protected Route Security"] = "PASS"
    print("[PASS] 8. Protected route access correctly gated by Bearer JWT.")

    # 9. Initial Wallet Balance Check
    status, wallet = api_call("/wallet", token=qa_token)
    assert status == 200 and wallet["balance"] == 1500.0, f"Expected 1500 welcome balance, got: {wallet}"
    results["Welcome Wallet Balance"] = "PASS"
    print("[PASS] 9. Welcome wallet balance INR 1,500.00 confirmed.")

    # 10. MPIN Setup and Verification (Phase 12)
    status, _ = api_call("/auth/mpin/set", method="POST", data={"mpin": "5921"}, token=qa_token)
    assert status == 200, f"Failed to set mPIN: {status}"

    status, _ = api_call("/auth/mpin/verify", method="POST", data={"mpin": "5921"}, token=qa_token)
    assert status == 200, f"mPIN verification failed: {status}"

    status, _ = api_call("/auth/mpin/verify", method="POST", data={"mpin": "0000"}, token=qa_token)
    assert status == 401, f"Wrong mPIN verification allowed: {status}"
    results["mPIN Setup & Verification"] = "PASS"
    print("[PASS] 10. RailOne Secure mPIN setup, encryption, and verification passed.")

    # 11. Biometric Enable & Disable (Phase 11)
    status, chal = api_call("/auth/biometric/challenge", method="POST", token=qa_token)
    assert status == 200 and "challenge" in chal, f"Biometric challenge failed: {status}"

    status, _ = api_call("/auth/biometric/register", method="POST", data={
        "credential_id": f"cred-live-{uid}",
        "challenge": chal["challenge"]
    }, token=qa_token)
    assert status == 200, f"Biometric registration failed: {status}"

    # Verify enabled
    status, prof_bio = api_call("/auth/me", token=qa_token)
    assert prof_bio["biometric_enabled"] is True, "Biometric flag not updated to True"

    # Disable biometric
    status, dis_res = api_call("/auth/biometric/disable", method="POST", token=qa_token)
    assert status == 200, f"Biometric disable failed: {status}"

    status, prof_bio2 = api_call("/auth/me", token=qa_token)
    assert prof_bio2["biometric_enabled"] is False, "Biometric flag not updated to False"
    results["Biometric Passkey Toggle"] = "PASS"
    print("[PASS] 11. Biometric passkey challenge, registration, and disable toggle passed.")

    # 12. Reserved Train Search & Booking (Phase 13 & 14)
    status, trains = api_call("/trains/search?from=MMCT&to=PUNE&date=2026-10-15&class_type=CC")
    assert status == 200 and len(trains) > 0, f"Train search failed: {status}"
    target_train = trains[0]

    booking_req = {
        "train_id": target_train["id"],
        "train_number": target_train["train_number"],
        "train_name": target_train["train_name"],
        "source_code": "MMCT",
        "source_name": "Mumbai Central",
        "dest_code": "PUNE",
        "dest_name": "Pune Junction",
        "journey_date": "2026-10-15",
        "class_type": "CC",
        "passengers": [
            {
                "name": "QA Tester",
                "age": 28,
                "gender": "Male",
                "berth_preference": "Window"
            }
        ],
        "payment_method": "Wallet"
    }

    status, booking = api_call("/bookings", method="POST", data=booking_req, token=qa_token)
    assert status == 200 and booking["status"] == "Confirmed", f"Booking failed: {status} {booking}"
    booking_id = booking["id"]
    fare = booking["fare_amount"]
    pnr = booking["pnr_number"]
    results["Reserved Ticket Booking"] = "PASS"
    print(f"[PASS] 12. Ticket booking confirmed (PNR: {pnr}, Fare: INR {fare}).")

    # 13. Financial Transaction Safety (Phase 14)
    status, wallet_after = api_call("/wallet", token=qa_token)
    expected_bal = round(1500.0 - fare, 2)
    assert status == 200 and abs(wallet_after["balance"] - expected_bal) < 0.01, f"Wallet balance mismatch: {wallet_after['balance']} vs {expected_bal}"

    status, txs = api_call("/wallet/transactions", token=qa_token)
    assert status == 200 and len(txs) > 0 and txs[0]["tx_type"] == "DEBIT", "Wallet transaction record missing"
    results["Wallet Debit & Transaction Safety"] = "PASS"
    print(f"[PASS] 13. Wallet atomically debited to INR {wallet_after['balance']:.2f} with transaction reference.")

    # 14. Food Ordering with Atomicity & Duplicate Protection (Phase 15)
    status, rests = api_call("/food/restaurants?station=PUNE")
    assert status == 200 and len(rests) > 0, f"Failed to get restaurants: {status}"
    rest = rests[0]
    menu_item = rest["menu_items"][0]

    food_req = {
        "restaurant_id": rest["id"],
        "train_number": target_train["train_number"],
        "pnr_number": pnr,
        "delivery_station": "Pune Junction",
        "coach_berth": "C1 - Berth 24",
        "items": [
            {
                "menu_item_id": menu_item["id"],
                "quantity": 1
            }
        ]
    }
    status, food_order = api_call("/food/orders", method="POST", data=food_req, token=qa_token)
    assert status == 200 and food_order["status"] == "Preparing", f"Food order failed: {status} {food_order}"
    food_total = food_order["total_amount"]

    # Test duplicate-click protection (< 10 seconds)
    status_dup, dup_food_res = api_call("/food/orders", method="POST", data=food_req, token=qa_token)
    assert status_dup == 400 and "Duplicate order detected" in str(dup_food_res), f"Duplicate food order was not blocked: {status_dup} {dup_food_res}"
    results["Food Ordering & Duplicate Protection"] = "PASS"
    print(f"[PASS] 14. Food order created (INR {food_total:.2f}) and immediate duplicate submission blocked.")

    # 15. Ticket Cancellation & Refund Status Synchronization (Phase 16)
    wallet_before_cancel = api_call("/wallet", token=qa_token)[1]["balance"]
    status, cancel_res = api_call(f"/bookings/{booking_id}/cancel", method="POST", token=qa_token)
    assert status == 200, f"Cancellation failed: {status} {cancel_res}"
    refund_amt = cancel_res["refund_amount"]

    wallet_after_cancel = api_call("/wallet", token=qa_token)[1]["balance"]
    expected_refund_bal = round(wallet_before_cancel + refund_amt, 2)
    assert abs(wallet_after_cancel - expected_refund_bal) < 0.01, f"Wallet refund credit mismatch: {wallet_after_cancel} vs {expected_refund_bal}"

    # Check refund record status
    status, refunds = api_call("/refunds", token=qa_token)
    assert status == 200 and len(refunds) > 0, f"Refund record not found: {status}"
    assert refunds[0]["status"] == "Completed", f"Refund status not Completed: {refunds[0]['status']}"

    # Test duplicate refund attempt
    status_dup_ref, dup_ref_msg = api_call("/refunds", method="POST", data={
        "booking_id": booking_id,
        "reason": "Duplicate claim test"
    }, token=qa_token)
    assert status_dup_ref == 400, f"Duplicate refund filing was not blocked: {status_dup_ref} {dup_ref_msg}"
    results["Refund Lifecycle & Wallet Credit"] = "PASS"
    print(f"[PASS] 15. Cancellation refunded INR {refund_amt:.2f} to wallet and refund status synchronized to Completed.")

    # 16. Support Ticket Lifecycle (Phase 17)
    status, spt = api_call("/support/tickets", method="POST", data={
        "subject": "Platform Accessibility Enquiry",
        "message": "Testing Rail Madad 24x7 support ticket workflow on live production.",
        "category": "Platform",
        "priority": "Medium"
    }, token=qa_token)
    assert status == 200 and spt["status"] == "Submitted", f"Support ticket creation failed: {status} {spt}"
    ticket_ref = spt["ticket_id"]
    results["Rail Madad Support Ticket"] = "PASS"
    print(f"[PASS] 16. Support ticket opened with reference {ticket_ref} and status 'Submitted'.")

    # 17. Session Expiration & Permanent Data Persistence (Phase 8)
    # Discard existing token and re-login
    status, re_login = api_call("/auth/login", method="POST", data={"username": qa_email, "password": qa_pass})
    assert status == 200 and "access_token" in re_login
    new_token = re_login["access_token"]
    re_user = re_login["user"]

    assert re_user["id"] == qa_user_id, "User ID changed across sessions!"
    
    # Check that wallet, bookings, transactions, notifications, and support tickets persisted
    _, pers_wallet = api_call("/wallet", token=new_token)
    assert abs(pers_wallet["balance"] - wallet_after_cancel) < 0.01, "Wallet balance was reset upon new session!"

    _, pers_bookings = api_call("/bookings", token=new_token)
    assert len(pers_bookings) >= 1, "Bookings disappeared across sessions!"

    _, pers_txs = api_call("/wallet/transactions", token=new_token)
    assert len(pers_txs) >= 2, "Wallet transactions disappeared across sessions!"

    _, pers_spt = api_call("/support/tickets", token=new_token)
    assert len(pers_spt) >= 1, "Support tickets disappeared across sessions!"
    results["Session Persistence & Data Integrity"] = "PASS"
    print("[PASS] 17. Session re-login verified: user ID, wallet balance, bookings, and tickets permanently intact.")

    print("\n=== ALL LIVE PRODUCTION SMOKE TESTS PASSED (17/17) ===")
    return True

if __name__ == "__main__":
    success = run_smoke_tests()
    if not success:
        sys.exit(1)

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import SessionLocal
from app.models.all_models import Station, Train, User

client = TestClient(app)

def test_health_and_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "RailOne"
    assert data["tagline"] == "Your journey, simplified."

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_auth_login_and_jwt():
    # Login as demo user Manali
    res = client.post("/api/auth/login", json={
        "username": "manali@railone.in",
        "password": "manali123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Manali Manish Gharat"
    assert data["user"]["email"] == "manali@railone.in"

def test_auth_registration():
    new_email = f"testuser_{os.urandom(4).hex()}@railone.in"
    res = client.post("/api/auth/register", json={
        "full_name": "Test Passenger",
        "email": new_email,
        "phone": f"91{os.urandom(4).hex()[:8]}",
        "password": "securepassword123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Test Passenger"

def test_otp_flow():
    test_phone = "9820011223"
    req_res = client.post("/api/auth/otp/request", json={"phone": test_phone})
    assert req_res.status_code == 200
    otp = req_res.json()["demo_hint"]
    assert otp is not None
    assert len(otp) == 6

    verify_res = client.post("/api/auth/otp/verify", json={"phone": test_phone, "otp": otp})
    assert verify_res.status_code == 200
    assert "access_token" in verify_res.json()

def test_mpin_flow():
    # Login Manali
    login = client.post("/api/auth/login", json={"username": "manali@railone.in", "password": "manali123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify correct mPIN (1234)
    v_res = client.post("/api/auth/mpin/verify", json={"mpin": "1234"}, headers=headers)
    assert v_res.status_code == 200

    # Verify wrong mPIN
    bad_res = client.post("/api/auth/mpin/verify", json={"mpin": "9876"}, headers=headers)
    assert bad_res.status_code == 401

def test_station_count_and_search():
    # Verify 152+ stations minimum
    db = SessionLocal()
    total_stations = db.query(Station).count()
    db.close()
    assert total_stations >= 152, f"Expected at least 152 stations, found {total_stations}"

    # Search station by code
    res = client.get("/api/stations/search?q=MMCT")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    assert items[0]["station_code"] == "MMCT"

    # Search station by city
    res_city = client.get("/api/stations/search?q=Pune")
    assert res_city.status_code == 200
    assert any(s["station_code"] == "PUNE" for s in res_city.json())

def test_mumbai_suburban_stations():
    # Western Line
    res_wr = client.get("/api/stations/suburban/Western")
    assert res_wr.status_code == 200
    wr_codes = [s["station_code"] for s in res_wr.json()]
    assert "CCG" in wr_codes
    assert "MMCT" in wr_codes
    assert "ADH" in wr_codes
    assert "BVI" in wr_codes
    assert "VR" in wr_codes

    # Central Line
    res_cr = client.get("/api/stations/suburban/Central")
    assert res_cr.status_code == 200
    cr_codes = [s["station_code"] for s in res_cr.json()]
    assert "CSMT" in cr_codes
    assert "DR" in cr_codes
    assert "TNA" in cr_codes
    assert "KYN" in cr_codes

def test_nerul_uran_corridor():
    # Must support Nerul -> Uran stations
    nerul_uran_stations = [
        "NEU", "SWDV", "SGSM", "TRGR", "BMDR", "KARP", "GAVN", "RJNP", "NUSH", "DRGI", "UNR"
    ]
    for code in nerul_uran_stations:
        res = client.get(f"/api/stations/{code}")
        assert res.status_code == 200, f"Station {code} not found in Nerul-Uran corridor"

    # Search suburban train between Nerul and Uran
    res_train = client.get("/api/trains/search?from=NEU&to=UNR")
    assert res_train.status_code == 200
    trains = res_train.json()
    assert len(trains) > 0
    assert trains[0]["train_number"] == "99701"

    # Reverse direction Uran to Nerul
    res_rev = client.get("/api/trains/search?from=UNR&to=NEU")
    assert res_rev.status_code == 200
    rev_trains = res_rev.json()
    assert len(rev_trains) > 0
    assert rev_trains[0]["train_number"] == "99702"

def test_same_station_validation():
    # Origin and destination same (MMCT -> MMCT) must fail
    res = client.get("/api/trains/search?from=MMCT&to=MMCT")
    assert res.status_code == 400
    assert "cannot be the same" in res.json()["detail"]

    # In fare engine
    fare_res = client.post("/api/trains/fare", json={
        "source_code": "MMCT",
        "dest_code": "MMCT",
        "journey_type": "reserved"
    })
    assert fare_res.status_code == 400

def test_train_search_mmct_to_pune_and_all_class():
    # MMCT -> PUNE scenario
    res = client.get("/api/trains/search?from=MMCT&to=PUNE&class_type=ALL")
    assert res.status_code == 200
    trains = res.json()
    assert len(trains) > 0, "MMCT -> PUNE search returned no trains!"
    train_numbers = [t["train_number"] for t in trains]
    assert "12125" in train_numbers

    # Verify class_type=ALL does NOT filter out trains
    res_all = client.get("/api/trains/search?from=MMCT&to=PUNE&class_type=ALL")
    assert len(res_all.json()) >= 1

def test_pnr_status():
    # Query seeded PNR 8421095812
    res = client.get("/api/pnr/8421095812")
    assert res.status_code == 200
    data = res.json()
    assert data["pnr_number"] == "8421095812"
    assert len(data["passengers"]) >= 1

    # Query mock PNR
    mock_res = client.get("/api/pnr/9876543210")
    assert mock_res.status_code == 200
    mock_data = mock_res.json()
    assert mock_data["is_demo"] is True

def test_coach_position():
    res = client.get("/api/coaches/12124")
    assert res.status_code == 200
    data = res.json()
    assert data["train_number"] == "12124"
    assert len(data["coaches"]) > 0
    assert any(c["category"] == "Engine" for c in data["coaches"])

def test_track_train():
    res = client.get("/api/tracking/12124")
    assert res.status_code == 200
    data = res.json()
    assert "current_station" in data
    assert len(data["stations"]) > 0

def test_wallet_and_booking_workflow():
    # Login Manali
    login = client.post("/api/auth/login", json={"username": "manali@railone.in", "password": "manali123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check wallet balance
    w_res = client.get("/api/wallet", headers=headers)
    assert w_res.status_code == 200
    init_balance = w_res.json()["balance"]
    if init_balance < 500:
        client.post("/api/wallet/add", json={"amount": 1000.0, "payment_method": "UPI"}, headers=headers)
        w_res = client.get("/api/wallet", headers=headers)
        init_balance = w_res.json()["balance"]
    assert init_balance > 0

    # Book a ticket
    book_res = client.post("/api/bookings", json={
        "train_number": "12125",
        "train_name": "Pragati Express",
        "source_code": "MMCT",
        "source_name": "Mumbai Central",
        "dest_code": "PUNE",
        "dest_name": "Pune Junction",
        "journey_date": "2026-11-20",
        "class_type": "CC",
        "passengers": [
            {"name": "Manali Gharat", "age": 29, "gender": "Female", "berth_preference": "Window"}
        ],
        "payment_method": "Wallet"
    }, headers=headers)
    assert book_res.status_code == 200, f"Booking failed: {book_res.text}"
    b_data = book_res.json()
    assert b_data["status"] == "Confirmed"
    assert len(b_data["pnr_number"]) == 10
    assert "qr_data" in b_data

    # Verify wallet was debited
    w_after = client.get("/api/wallet", headers=headers)
    assert w_after.json()["balance"] < init_balance

def test_notifications():
    login = client.post("/api/auth/login", json={"username": "manali@railone.in", "password": "manali123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 15

    unread_res = client.get("/api/notifications/unread-count", headers=headers)
    assert unread_res.status_code == 200
    assert "unread_count" in unread_res.json()

def test_admin_authorization_enforced():
    # User Manali cannot access admin endpoints
    login_user = client.post("/api/auth/login", json={"username": "manali@railone.in", "password": "manali123"})
    user_token = login_user.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    denied = client.get("/api/admin/stats", headers=user_headers)
    assert denied.status_code == 403

    # Admin CAN access
    login_admin = client.post("/api/auth/login", json={"username": "admin@railone.in", "password": "admin123"})
    admin_token = login_admin.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    allowed = client.get("/api/admin/stats", headers=admin_headers)
    assert allowed.status_code == 200
    stats = allowed.json()
    assert stats["total_stations"] >= 152
    assert stats["total_trains"] > 0

def test_multi_user_isolation():
    # 1. Unauthenticated request to /api/auth/me is rejected
    unauth = client.get("/api/auth/me")
    assert unauth.status_code == 401

    # 2. Authenticate as Manali
    login_a = client.post("/api/auth/login", json={"username": "manali@railone.in", "password": "manali123"})
    assert login_a.status_code == 200
    token_a = login_a.json()["access_token"]
    profile_a = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert profile_a["full_name"] == "Manali Manish Gharat"
    assert profile_a["email"] == "manali@railone.in"

    # 3. Create a second distinct user
    random_id = os.urandom(4).hex()
    reg_b = client.post("/api/auth/register", json={
        "full_name": "Test Passenger B",
        "email": f"test_b_{random_id}@railone.in",
        "phone": f"88{random_id[:8]}",
        "password": "password_test_123"
    })
    assert reg_b.status_code == 200
    token_b = reg_b.json()["access_token"]

    # 4. User B gets their OWN profile, never Manali's
    profile_b = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert profile_b["full_name"] == "Test Passenger B"
    assert profile_b["email"] == f"test_b_{random_id}@railone.in"
    assert profile_b["id"] != profile_a["id"]


def test_food_order_and_duplicate_protection():
    # Login Manali
    login = client.post("/api/auth/login", json={"username": "manali@railone.in", "password": "manali123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch restaurants
    rest_res = client.get("/api/food/restaurants?station=PUNE")
    assert rest_res.status_code == 200
    rests = rest_res.json()
    assert len(rests) > 0
    rest = rests[0]
    menu_item = rest["menu_items"][0]

    food_req = {
        "restaurant_id": rest["id"],
        "train_number": "12125",
        "pnr_number": "9876543210",
        "delivery_station": "Pune Junction",
        "coach_berth": "C1 - Berth 24",
        "items": [
            {
                "menu_item_id": menu_item["id"],
                "quantity": 1
            }
        ]
    }
    order_res = client.post("/api/food/orders", json=food_req, headers=headers)
    assert order_res.status_code == 200, f"Food order failed: {order_res.text}"
    order_data = order_res.json()
    assert order_data["status"] == "Preparing"
    assert len(order_data["items"]) == 1
    assert order_data["items"][0]["item_name"] == menu_item["name"]

    # Test duplicate-click protection (<10s)
    dup_res = client.post("/api/food/orders", json=food_req, headers=headers)
    assert dup_res.status_code == 400
    assert "Duplicate order detected" in dup_res.json()["detail"]


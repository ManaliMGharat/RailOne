from datetime import date, timedelta

def test_create_booking_single_passenger(client, user_auth_headers):
    # Find train and stations
    search_res = client.get(f"/api/trains/search?from_station=BCT&to_station=NDLS&journey_date={date.today() + timedelta(days=2)}")
    assert search_res.status_code == 200
    train = search_res.json()[0]

    bct_st = client.get("/api/stations/search?q=BCT").json()[0]
    ndls_st = client.get("/api/stations/search?q=NDLS").json()[0]

    booking_payload = {
        "train_id": train["id"],
        "from_station_id": bct_st["id"],
        "to_station_id": ndls_st["id"],
        "journey_date": str(date.today() + timedelta(days=2)),
        "class_code": "3A",
        "payment_method": "UPI",
        "passengers": [
            {
                "full_name": "Priya Sharma",
                "age": 27,
                "gender": "FEMALE",
                "berth_preference": "LOWER",
                "id_type": "Aadhaar",
                "id_number": "123456789012"
            }
        ]
    }

    res = client.post("/api/bookings", json=booking_payload, headers=user_auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert "booking_reference" in data
    assert "pnr_number" in data
    assert len(data["pnr_number"]) == 10
    assert data["pnr_number"].isdigit()
    assert len(data["passengers"]) == 1
    assert data["passengers"][0]["passenger_name"] == "Priya Sharma"
    assert data["passengers"][0]["coach_number"] is not None
    assert data["passengers"][0]["seat_number"] is not None
    assert data["payment"]["status"] == "SUCCESS"
    assert data["ticket"] is not None

def test_create_booking_multi_passenger(client, user_auth_headers):
    search_res = client.get(f"/api/trains/search?from_station=BCT&to_station=NDLS&journey_date={date.today() + timedelta(days=3)}")
    train = search_res.json()[0]

    bct_st = client.get("/api/stations/search?q=BCT").json()[0]
    ndls_st = client.get("/api/stations/search?q=NDLS").json()[0]

    booking_payload = {
        "train_id": train["id"],
        "from_station_id": bct_st["id"],
        "to_station_id": ndls_st["id"],
        "journey_date": str(date.today() + timedelta(days=3)),
        "class_code": "2A",
        "payment_method": "CARD",
        "passengers": [
            {
                "full_name": "Vikram Malhotra",
                "age": 42,
                "gender": "MALE",
                "berth_preference": "LOWER",
                "id_type": "PAN",
                "id_number": "ABCDE1234F"
            },
            {
                "full_name": "Ananya Malhotra",
                "age": 38,
                "gender": "FEMALE",
                "berth_preference": "UPPER",
                "id_type": "Aadhaar",
                "id_number": "987654321098"
            }
        ]
    }

    res = client.post("/api/bookings", json=booking_payload, headers=user_auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert len(data["passengers"]) == 2
    assert data["total_fare"] > 0

def test_get_user_bookings(client, user_auth_headers):
    res = client.get("/api/bookings", headers=user_auth_headers)
    assert res.status_code == 200
    bookings = res.json()
    assert len(bookings) >= 1

def test_get_single_booking(client, user_auth_headers):
    bookings = client.get("/api/bookings", headers=user_auth_headers).json()
    b_id = bookings[0]["id"]

    res = client.get(f"/api/bookings/{b_id}", headers=user_auth_headers)
    assert res.status_code == 200
    assert res.json()["id"] == b_id

def test_booking_unauthorized_access(client):
    res = client.get("/api/bookings")
    assert res.status_code == 401

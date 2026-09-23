from datetime import date, timedelta

def test_cancel_booking_success(client, user_auth_headers):
    # Create a fresh booking to cancel
    search_res = client.get(f"/api/trains/search?from_station=BCT&to_station=NDLS&journey_date={date.today() + timedelta(days=5)}")
    train = search_res.json()[0]
    bct_st = client.get("/api/stations/search?q=BCT").json()[0]
    ndls_st = client.get("/api/stations/search?q=NDLS").json()[0]

    booking_payload = {
        "train_id": train["id"],
        "from_station_id": bct_st["id"],
        "to_station_id": ndls_st["id"],
        "journey_date": str(date.today() + timedelta(days=5)),
        "class_code": "3A",
        "payment_method": "UPI",
        "passengers": [
            {
                "full_name": "Karan Mehra",
                "age": 30,
                "gender": "MALE",
                "berth_preference": "LOWER",
                "id_type": "Aadhaar",
                "id_number": "111122223333"
            }
        ]
    }
    b_res = client.post("/api/bookings", json=booking_payload, headers=user_auth_headers)
    booking_id = b_res.json()["id"]

    # Cancel ticket
    cancel_res = client.post(f"/api/bookings/{booking_id}/cancel", json={}, headers=user_auth_headers)
    assert cancel_res.status_code == 200
    c_data = cancel_res.json()
    assert c_data["cancelled_passengers_count"] == 1
    assert c_data["cancellation_fee"] > 0
    assert c_data["refund_amount"] > 0
    assert c_data["status"] == "PROCESSED"
    assert "refund_reference" in c_data

    # Verify status changed
    details = client.get(f"/api/bookings/{booking_id}", headers=user_auth_headers).json()
    assert details["status"] == "CANCELLED"

def test_cancel_already_cancelled_booking_fails(client, user_auth_headers):
    # Find existing cancelled booking or cancel one
    bookings = client.get("/api/bookings?status_filter=cancelled", headers=user_auth_headers).json()
    assert len(bookings) >= 1
    cancelled_id = bookings[0]["id"]

    # Attempt to cancel again
    res = client.post(f"/api/bookings/{cancelled_id}/cancel", json={}, headers=user_auth_headers)
    assert res.status_code == 400
    assert "already cancelled" in res.json()["detail"]

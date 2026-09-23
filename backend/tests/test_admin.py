def test_admin_dashboard_metrics(client, admin_auth_headers):
    res = client.get("/api/admin/dashboard", headers=admin_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_users"] >= 2
    assert data["total_trains"] >= 10
    assert data["total_stations"] >= 20
    assert "bookings_by_date" in data
    assert "revenue_by_date" in data
    assert "popular_routes" in data

def test_user_forbidden_from_admin_dashboard(client, user_auth_headers):
    res = client.get("/api/admin/dashboard", headers=user_auth_headers)
    assert res.status_code == 403
    assert "Administrator access required" in res.json()["detail"]

def test_admin_list_users(client, admin_auth_headers):
    res = client.get("/api/admin/users", headers=admin_auth_headers)
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 2

def test_admin_create_and_delete_station(client, admin_auth_headers):
    payload = {
        "code": "TESTSTN",
        "name": "Test Junction",
        "city": "Test City",
        "state": "Test State",
        "zone": "CR"
    }
    create_res = client.post("/api/admin/stations", json=payload, headers=admin_auth_headers)
    assert create_res.status_code == 201
    st_id = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/admin/stations/{st_id}", headers=admin_auth_headers)
    assert del_res.status_code == 200

def test_admin_create_train(client, admin_auth_headers):
    st_bct = client.get("/api/stations/search?q=BCT").json()[0]
    st_pune = client.get("/api/stations/search?q=PUNE").json()[0]

    payload = {
        "number": "99991",
        "name": "Mumbai Pune Test Superfast",
        "source_station_id": st_bct["id"],
        "destination_station_id": st_pune["id"],
        "departure_time": "05:00",
        "arrival_time": "08:15",
        "duration": "03h 15m",
        "running_days": "MON,TUE,WED",
        "train_type": "Intercity Superfast",
        "is_active": True
    }
    res = client.post("/api/admin/trains", json=payload, headers=admin_auth_headers)
    assert res.status_code == 201
    assert res.json()["number"] == "99991"

def test_admin_audit_logs(client, admin_auth_headers):
    res = client.get("/api/admin/audit-logs", headers=admin_auth_headers)
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) >= 1  # Station creation or booking actions should have logged

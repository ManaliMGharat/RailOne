def test_get_valid_pnr_status(client):
    # Seeded demo booking has PNR: 2104598124
    res = client.get("/api/pnr/2104598124")
    assert res.status_code == 200
    data = res.json()
    assert data["pnr_number"] == "2104598124"
    assert data["train_number"] == "12951"
    assert len(data["passengers"]) == 1
    assert data["passengers"][0]["passenger_name"] == "Aarav Sharma"
    assert data["passengers"][0]["coach_number"] == "B1"

def test_get_pnr_with_hyphen(client):
    res = client.get("/api/pnr/210-4598124")
    assert res.status_code == 200
    assert res.json()["pnr_number"] == "2104598124"

def test_get_nonexistent_pnr(client):
    res = client.get("/api/pnr/9999999999")
    assert res.status_code == 404
    assert "PNR not found" in res.json()["detail"]

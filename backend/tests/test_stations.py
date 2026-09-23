def test_get_stations_list(client):
    response = client.get("/api/stations?limit=25")
    assert response.status_code == 200
    stations = response.json()
    assert len(stations) >= 20
    codes = [s["code"] for s in stations]
    assert "CSMT" in codes
    assert "NDLS" in codes

def test_search_station_by_code(client):
    response = client.get("/api/stations/search?q=CSMT")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["code"] == "CSMT"

def test_search_station_by_city(client):
    response = client.get("/api/stations/search?q=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    cities = [s["city"] for s in data]
    assert "Delhi" in cities

def test_get_station_by_id(client):
    res_list = client.get("/api/stations?limit=1")
    st_id = res_list.json()[0]["id"]

    res = client.get(f"/api/stations/{st_id}")
    assert res.status_code == 200
    assert res.json()["id"] == st_id

def test_trigger_system_seed(client):
    response = client.post("/api/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["stations_count"] >= 24
    assert data["trains_count"] >= 12

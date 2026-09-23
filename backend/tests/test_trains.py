from datetime import date, timedelta

def test_search_trains_direct_route(client):
    tomorrow = date.today() + timedelta(days=1)
    response = client.get(f"/api/trains/search?from_station=BCT&to_station=NDLS&journey_date={tomorrow}")
    assert response.status_code == 200
    trains = response.json()
    assert len(trains) >= 1
    t_numbers = [t["number"] for t in trains]
    assert "12951" in t_numbers
    # Check classes are populated
    train = trains[0]
    assert len(train["classes"]) >= 1
    assert "status_label" in train["classes"][0]

def test_search_trains_by_city_aggregation(client):
    tomorrow = date.today() + timedelta(days=1)
    response = client.get(f"/api/trains/search?from_station=Mumbai&to_station=Delhi&journey_date={tomorrow}")
    assert response.status_code == 200
    trains = response.json()
    assert len(trains) >= 1

def test_search_trains_intermediate_stops(client):
    # Punjab Mail stops at CSMT -> BPL -> AGC -> NDLS
    tomorrow = date.today() + timedelta(days=1)
    response = client.get(f"/api/trains/search?from_station=CSMT&to_station=BPL&journey_date={tomorrow}")
    assert response.status_code == 200
    trains = response.json()
    assert len(trains) >= 1

def test_get_train_details(client):
    # Find train 12951
    search_res = client.get(f"/api/trains/search?from_station=BCT&to_station=NDLS&journey_date={date.today() + timedelta(days=1)}")
    train_id = search_res.json()[0]["id"]

    res = client.get(f"/api/trains/{train_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["number"] == "12951"
    assert "stops" in data
    assert len(data["stops"]) >= 2

def test_get_train_route_stops(client):
    search_res = client.get(f"/api/trains/search?from_station=BCT&to_station=NDLS&journey_date={date.today() + timedelta(days=1)}")
    train_id = search_res.json()[0]["id"]

    res = client.get(f"/api/trains/{train_id}/route")
    assert res.status_code == 200
    stops = res.json()
    assert len(stops) >= 2
    assert stops[0]["stop_number"] == 1

def test_get_train_availability(client):
    search_res = client.get(f"/api/trains/search?from_station=BCT&to_station=NDLS&journey_date={date.today() + timedelta(days=1)}")
    train_id = search_res.json()[0]["id"]
    tomorrow = date.today() + timedelta(days=1)

    res = client.get(f"/api/trains/{train_id}/availability?journey_date={tomorrow}")
    assert res.status_code == 200
    avail_list = res.json()
    assert len(avail_list) >= 1
    codes = [a["class_code"] for a in avail_list]
    assert "3A" in codes

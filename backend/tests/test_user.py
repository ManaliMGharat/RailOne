def test_get_user_profile(client, user_auth_headers):
    res = client.get("/api/users/me", headers=user_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "email" in data
    assert "mobile" in data
    assert data["role"] == "USER"

def test_update_user_profile(client, user_auth_headers):
    res = client.put("/api/users/me", json={"full_name": "Aarav K. Sharma"}, headers=user_auth_headers)
    assert res.status_code == 200
    assert res.json()["full_name"] == "Aarav K. Sharma"

def test_change_password_wrong_current(client, user_auth_headers):
    res = client.put("/api/users/change-password", json={
        "current_password": "WrongPassword@123",
        "new_password": "NewSecretPassword@123"
    }, headers=user_auth_headers)
    assert res.status_code == 400
    assert "Incorrect current password" in res.json()["detail"]

def test_get_notifications(client, user_auth_headers):
    res = client.get("/api/notifications", headers=user_auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

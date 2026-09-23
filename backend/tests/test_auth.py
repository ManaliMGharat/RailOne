def test_register_user_success(client):
    payload = {
        "full_name": "Rohan Deshmukh",
        "email": "rohan.deshmukh@example.com",
        "mobile": "9820098200",
        "password": "Password@123",
        "confirm_password": "Password@123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "rohan.deshmukh@example.com"
    assert data["user"]["role"] == "USER"

def test_register_password_mismatch(client):
    payload = {
        "full_name": "Test User",
        "email": "mismatch@example.com",
        "mobile": "9998887776",
        "password": "Password@123",
        "confirm_password": "WrongPassword@123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Passwords do not match" in response.json()["detail"]

def test_register_duplicate_email(client):
    payload = {
        "full_name": "Duplicate User",
        "email": "user@railone.local",
        "mobile": "9000000001",
        "password": "Password@123",
        "confirm_password": "Password@123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Email is already registered" in response.json()["detail"]

def test_register_duplicate_mobile(client):
    payload = {
        "full_name": "Duplicate Mobile",
        "email": "unique.email@example.com",
        "mobile": "9812345678",  # Already assigned to demo user
        "password": "Password@123",
        "confirm_password": "Password@123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Mobile number is already registered" in response.json()["detail"]

def test_login_success_with_email(client):
    response = client.post("/api/auth/login", json={"username": "user@railone.local", "password": "User@123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "user@railone.local"

def test_login_success_with_mobile(client):
    response = client.post("/api/auth/login", json={"username": "9812345678", "password": "User@123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["mobile"] == "9812345678"

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={"username": "user@railone.local", "password": "WrongPassword"})
    assert response.status_code == 401
    assert "Invalid email/mobile or password" in response.json()["detail"]

def test_login_nonexistent_user(client):
    response = client.post("/api/auth/login", json={"username": "nobody@railone.local", "password": "Password@123"})
    assert response.status_code == 401

def test_get_current_user_me(client, user_auth_headers):
    response = client.get("/api/auth/me", headers=user_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "user@railone.local"

def test_token_refresh(client):
    # First login to get refresh token
    login_res = client.post("/api/auth/login", json={"username": "user@railone.local", "password": "User@123"})
    refresh_tok = login_res.json()["refresh_token"]

    ref_res = client.post("/api/auth/refresh", json={"refresh_token": refresh_tok})
    assert ref_res.status_code == 200
    data = ref_res.json()
    assert "access_token" in data
    assert "refresh_token" in data

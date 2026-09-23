import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.db.seed import seed_database
from app.core.security import create_access_token

TEST_DB_FILE = "./test_railone.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine_test = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

    Base.metadata.create_all(bind=engine_test)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()

    yield

    Base.metadata.drop_all(bind=engine_test)
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def user_token(client):
    res = client.post("/api/auth/login", json={"username": "user@railone.local", "password": "User@123"})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]

@pytest.fixture(scope="session")
def admin_token(client):
    res = client.post("/api/auth/login", json={"username": "admin@railone.local", "password": "Admin@123"})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]

@pytest.fixture(scope="session")
def user_auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}

@pytest.fixture(scope="session")
def admin_auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}

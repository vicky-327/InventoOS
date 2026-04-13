from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_unauthenticated_products():
    response = client.get("/api/v1/products/")
    # Needs auth, so expecting 401
    assert response.status_code == 401

from fastapi.testclient import TestClient

def test_register_and_login(client: TestClient):
    # 1. Register a user
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "testuser@example.com", "password": "password123", "role": "customer"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert "id" in data
    
    # 2. Login the user
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser@example.com", "password": "password123"}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

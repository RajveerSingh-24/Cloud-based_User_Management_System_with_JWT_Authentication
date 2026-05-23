from fastapi.testclient import TestClient

def test_protected_routes(client: TestClient):
    # 1. Setup users
    client.post(
        "/api/v1/auth/register",
        json={"email": "admin@test.com", "password": "pass", "role": "admin"}
    )
    client.post(
        "/api/v1/auth/register",
        json={"email": "cust@test.com", "password": "pass", "role": "customer"}
    )
    
    # 2. Get tokens
    admin_token = client.post(
        "/api/v1/auth/login", data={"username": "admin@test.com", "password": "pass"}
    ).json()["access_token"]
    
    cust_token = client.post(
        "/api/v1/auth/login", data={"username": "cust@test.com", "password": "pass"}
    ).json()["access_token"]
    
    # 3. Customer hits Admin route -> Should fail
    res_forbidden = client.get(
        "/api/v1/users/admin/dashboard",
        headers={"Authorization": f"Bearer {cust_token}"}
    )
    assert res_forbidden.status_code == 403
    
    # 4. Admin hits Admin route -> Should succeed
    res_success = client.get(
        "/api/v1/users/admin/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_success.status_code == 200
    assert "Admin" in res_success.json()["message"]

"""Auth flow tests against the live FastAPI app."""


def test_register_and_login_flow(client):
    r = client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "verysecret1", "full_name": "Alice"},
    )
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["user"]["email"] == "alice@example.com"
    assert data["access_token"]

    # Duplicate email
    r2 = client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "verysecret1", "full_name": "Alice"},
    )
    assert r2.status_code == 400

    # Login with form data
    r3 = client.post(
        "/auth/login", data={"username": "alice@example.com", "password": "verysecret1"}
    )
    assert r3.status_code == 200
    token = r3.json()["access_token"]

    # Protected endpoint
    r4 = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r4.status_code == 200
    assert r4.json()["email"] == "alice@example.com"


def test_login_bad_password(client):
    client.post(
        "/auth/register",
        json={"email": "bob@example.com", "password": "verysecret1", "full_name": "Bob"},
    )
    r = client.post("/auth/login", data={"username": "bob@example.com", "password": "wrongpass"})
    assert r.status_code == 401

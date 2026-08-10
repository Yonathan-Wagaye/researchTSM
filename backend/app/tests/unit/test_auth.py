from httpx import AsyncClient

USER_REGISTER_DATA = {
    "email": "test@example.com",
    "password": "Test@password123",
    "first_name": "Test",
    "last_name": "User",
}


async def test_register_user(client: AsyncClient) -> None:
    response = await client.post("/auth/register", json=USER_REGISTER_DATA)
    assert response.status_code == 201

    body = response.json()
    assert body["email"] == USER_REGISTER_DATA["email"]
    assert body["first_name"] == USER_REGISTER_DATA["first_name"]
    assert body["last_name"] == USER_REGISTER_DATA["last_name"]
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


async def test_login_user(client: AsyncClient, created_user_id: int) -> None:
    USER_LOGIN_DATA = {
        "email": "test@example.com",
        "password": "Test@password123",
    }
    response = await client.post("/auth/login", json=USER_LOGIN_DATA)
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "Bearer"
    assert "refresh_token" not in body
    assert "refresh_token" in response.cookies

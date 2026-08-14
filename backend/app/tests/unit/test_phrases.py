from httpx import AsyncClient


async def test_add_phrase(
    authenticated_client: dict[str, AsyncClient], created_projects: list[dict]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    response = await client.post(
        "/phrases/createPhrase",
        json={
            "project_id": created_projects[0]["id"],
            "key": "greeting.hello",
            "source_text": "Hello",
            "context": "Greeting message",
            "usage": "Shown on login",
        },
        headers=headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["project_id"] == created_projects[0]["id"]
    assert body["key"] == "greeting.hello"
    assert body["source_text"] == "Hello"
    assert body["context"] == "Greeting message"
    assert body["usage"] == "Shown on login"
    assert body["created_at"] is not None
    assert body["updated_at"] is not None


async def test_add_phrase_duplicate_key(
    authenticated_client: dict[str, AsyncClient], created_phrases: list[dict]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    existing = created_phrases[0]
    response = await client.post(
        "/phrases/createPhrase",
        json={
            "project_id": existing["project_id"],
            "key": existing["key"],
            "source_text": "Duplicate",
        },
        headers=headers,
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "phrase_already_exists"
    assert (
        response.json()["error"]["message"]
        == "A phrase with this key already exists in the project"
    )


async def test_add_phrase_unauthorized(
    another_authenticated_client: dict[str, AsyncClient],
    created_projects: list[dict],
) -> None:
    client = another_authenticated_client["client"]
    headers = {
        "Authorization": f"Bearer {another_authenticated_client['access_token']}"
    }
    response = await client.post(
        "/phrases/createPhrase",
        json={
            "project_id": created_projects[0]["id"],
            "key": "unauthorized.key",
            "source_text": "Nope",
        },
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "project_access_denied"


async def test_get_paginated_phrases(
    authenticated_client: dict[str, AsyncClient],
    created_projects: list[dict],
    created_phrases: list[dict],
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    project_id = created_projects[0]["id"]
    response = await client.get(
        "/phrases/getPhrases",
        params={"project_id": project_id, "limit": 10, "offset": 0},
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 5
    for phrase in response.json():
        assert phrase["project_id"] == project_id
        assert phrase["key"] in [p["key"] for p in created_phrases]
        assert phrase["source_text"] in [p["source_text"] for p in created_phrases]
        assert phrase["created_at"] is not None
        assert phrase["updated_at"] is not None


async def test_get_paginated_phrases_unauthorized(
    another_authenticated_client: dict[str, AsyncClient],
    created_projects: list[dict],
    created_phrases: list[dict],
) -> None:
    client = another_authenticated_client["client"]
    headers = {
        "Authorization": f"Bearer {another_authenticated_client['access_token']}"
    }
    response = await client.get(
        "/phrases/getPhrases",
        params={"project_id": created_projects[0]["id"], "limit": 10, "offset": 0},
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "project_access_denied"


async def test_get_single_phrase(
    authenticated_client: dict[str, AsyncClient], created_phrases: list[dict]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    expected = created_phrases[0]
    response = await client.get(
        "/phrases/getPhrase",
        params={"phrase_id": expected["id"]},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == expected["id"]
    assert body["project_id"] == expected["project_id"]
    assert body["key"] == expected["key"]
    assert body["source_text"] == expected["source_text"]
    assert body["context"] == expected["context"]
    assert body["usage"] == expected["usage"]
    assert body["created_at"] is not None
    assert body["updated_at"] is not None


async def test_get_single_phrase_unauthorized(
    another_authenticated_client: dict[str, AsyncClient],
    created_phrases: list[dict],
) -> None:
    client = another_authenticated_client["client"]
    headers = {
        "Authorization": f"Bearer {another_authenticated_client['access_token']}"
    }
    response = await client.get(
        "/phrases/getPhrase",
        params={"phrase_id": created_phrases[0]["id"]},
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "phrase_access_denied"
    assert (
        response.json()["error"]["message"]
        == "You are not authorized to access this phrase"
    )


async def test_get_single_phrase_not_found(
    authenticated_client: dict[str, AsyncClient], created_phrases: list[dict]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    response = await client.get(
        "/phrases/getPhrase",
        params={"phrase_id": 999999},
        headers=headers,
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "phrase_not_found"
    assert response.json()["error"]["message"] == "Phrase not found"


async def test_update_phrase_details(
    authenticated_client: dict[str, AsyncClient], created_phrases: list[dict]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    response = await client.put(
        "/phrases/updatePhrase",
        params={"phrase_id": created_phrases[0]["id"]},
        json={
            "key": "welcome.title.updated",
            "source_text": "Welcome updated",
            "context": "Updated context",
            "usage": "Updated usage",
        },
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == created_phrases[0]["id"]
    assert body["key"] == "welcome.title.updated"
    assert body["source_text"] == "Welcome updated"
    assert body["context"] == "Updated context"
    assert body["usage"] == "Updated usage"
    assert body["created_at"] is not None
    assert body["updated_at"] is not None


async def test_update_phrase_details_unauthorized(
    another_authenticated_client: dict[str, AsyncClient],
    created_phrases: list[dict],
) -> None:
    client = another_authenticated_client["client"]
    headers = {
        "Authorization": f"Bearer {another_authenticated_client['access_token']}"
    }
    response = await client.put(
        "/phrases/updatePhrase",
        params={"phrase_id": created_phrases[0]["id"]},
        json={"source_text": "Hacked"},
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "phrase_access_denied"
    assert (
        response.json()["error"]["message"]
        == "You are not authorized to access this phrase"
    )

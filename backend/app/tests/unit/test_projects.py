from app.models.language import Language
from httpx import AsyncClient


def _assert_language_shape(language: dict, expected: Language | dict | None = None) -> None:
    assert "id" in language
    assert "code" in language
    assert "name" in language
    assert "native_name" in language
    assert "direction" in language
    if expected is None:
        return
    if isinstance(expected, Language):
        assert language["id"] == expected.id
        assert language["code"] == expected.code
        assert language["name"] == expected.name
        assert language["native_name"] == expected.native_name
        assert language["direction"] == expected.direction.value
    else:
        assert language["id"] == expected["id"]
        assert language["code"] == expected["code"]
        assert language["name"] == expected["name"]
        assert language["native_name"] == expected["native_name"]
        assert language["direction"] == expected["direction"]


async def test_add_project(
    authenticated_client: dict[str, AsyncClient], created_languages: list[Language]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    response = await client.post(
        "/projects/create",
        json={
            "name": "Test Project",
            "description": "Test Description",
            "default_language_id": created_languages[0].id,
        },
        headers=headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Test Project"
    assert body["description"] == "Test Description"
    assert "default_language_id" not in body
    _assert_language_shape(body["default_language"], created_languages[0])
    assert body["created_at"] is not None
    assert body["updated_at"] is not None


async def test_get_paginated_projects(
    authenticated_client: dict[str, AsyncClient], created_projects: list[dict]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    response = await client.get(
        "/projects/getProjects", params={"limit": 10, "offset": 0}, headers=headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 5
    for project in response.json():
        assert project["name"] in [p["name"] for p in created_projects]
        assert project["description"] in [p["description"] for p in created_projects]
        assert "default_language_id" not in project
        _assert_language_shape(project["default_language"])
        assert project["default_language"]["id"] in [
            p["default_language"]["id"] for p in created_projects
        ]
        assert project["created_at"] is not None
        assert project["updated_at"] is not None


async def test_get_single_project(
    authenticated_client: dict[str, AsyncClient], created_projects: list[dict]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    expected = created_projects[0]
    response = await client.get(
        "/projects/getProject",
        params={"project_id": expected["id"]},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == expected["name"]
    assert body["description"] == expected["description"]
    assert "default_language_id" not in body
    _assert_language_shape(body["default_language"], expected["default_language"])
    assert body["created_at"] is not None
    assert body["updated_at"] is not None


async def test_get_single_project_unauthorized(
    another_authenticated_client: dict[str, AsyncClient], created_projects: list[dict]
) -> None:
    client = another_authenticated_client["client"]
    headers = {
        "Authorization": f"Bearer {another_authenticated_client['access_token']}"
    }
    response = await client.get(
        "/projects/getProject",
        params={"project_id": created_projects[0]["id"]},
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "project_access_denied"
    assert (
        response.json()["error"]["message"]
        == "You are not authorized to access this project"
    )


async def test_get_single_project_not_found(
    authenticated_client: dict[str, AsyncClient], created_projects: list[dict]
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    response = await client.get(
        "/projects/getProject",
        params={"project_id": 999999},
        headers=headers,
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "project_not_found"
    assert response.json()["error"]["message"] == "Project not found"


async def test_update_project_details(
    authenticated_client: dict[str, AsyncClient],
    created_projects: list[dict],
    created_languages: list[Language],
) -> None:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    new_language = created_languages[-1]
    response = await client.put(
        "/projects/updateProject",
        params={"project_id": created_projects[0]["id"]},
        json={
            "name": "Updated Project",
            "description": "Updated Description",
            "default_language_id": new_language.id,
        },
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Updated Project"
    assert body["description"] == "Updated Description"
    assert "default_language_id" not in body
    _assert_language_shape(body["default_language"], new_language)
    assert body["created_at"] is not None
    assert body["updated_at"] is not None


async def test_update_project_details_unauthorized(
    another_authenticated_client: dict[str, AsyncClient],
    created_projects: list[dict],
    created_languages: list[Language],
) -> None:
    client = another_authenticated_client["client"]
    headers = {
        "Authorization": f"Bearer {another_authenticated_client['access_token']}"
    }
    response = await client.put(
        "/projects/updateProject",
        params={"project_id": created_projects[0]["id"]},
        json={
            "name": "Updated Project",
            "description": "Updated Description",
            "default_language_id": created_languages[0].id,
        },
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "project_access_denied"
    assert (
        response.json()["error"]["message"]
        == "You are not authorized to access this project"
    )

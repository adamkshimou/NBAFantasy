"""API tests against a fake Sleeper (no network)."""
import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.sleeper import SleeperClient

PLAYERS = {
    "1": {"full_name": "Starter One", "team": "NYK", "fantasy_positions": ["PG"], "injury_status": None},
    "2": {"full_name": "Bench Two", "team": "BKN", "fantasy_positions": ["C"], "injury_status": "Out"},
    "3": {"full_name": "Rival Three", "team": "BOS", "fantasy_positions": ["SF"]},
    "4": {"full_name": "Free Four", "team": "MIA", "fantasy_positions": ["SG"]},
}
ROUTES = {
    "/v1/state/nba": {"season": "2026", "league_season": "2026", "week": 4},
    "/v1/user/adam": {"user_id": "u1", "display_name": "adam"},
    "/v1/user/ghost": None,
    "/v1/user/u1/leagues/nba/2026": [{"league_id": "L1", "name": "Test League", "total_rosters": 2, "status": "in_season"}],
    "/v1/league/L1": {"name": "Test League", "roster_positions": ["PG", "BN"], "scoring_settings": {"pts": 1}},
    "/v1/league/L1/rosters": [
        {"roster_id": 1, "owner_id": "u1", "players": ["1", "2"], "starters": ["1"], "reserve": None, "settings": {"wins": 2, "losses": 1, "fpts": 900}},
        {"roster_id": 2, "owner_id": "u2", "players": ["3"], "starters": ["3"], "settings": {}},
    ],
    "/v1/league/L1/users": [{"user_id": "u1", "display_name": "adam"}, {"user_id": "u2", "display_name": "rival"}],
    "/v1/players/nba": PLAYERS,
    "/v1/players/nba/trending/add": [{"player_id": "3", "count": 500}, {"player_id": "4", "count": 300}],
}


def handler(request: httpx.Request) -> httpx.Response:
    if request.url.path in ROUTES:
        import json
        return httpx.Response(200, content=json.dumps(ROUTES[request.url.path]))
    return httpx.Response(404)


@pytest.fixture
def client():
    app.state.sleeper = SleeperClient(transport=httpx.MockTransport(handler))
    with TestClient(app) as c:
        yield c
    app.state.sleeper = None


def test_connect_lists_leagues(client):
    data = client.get("/api/users/adam/leagues").json()
    assert data["user_id"] == "u1"
    assert data["leagues"][0]["league_id"] == "L1"


def test_unknown_user_is_404(client):
    assert client.get("/api/users/ghost/leagues").status_code == 404


def test_team_splits_starters_and_bench(client):
    team = client.get("/api/leagues/L1/team", params={"user_id": "u1"}).json()
    assert [p["name"] for p in team["starters"]] == ["Starter One"]
    assert team["bench"][0]["injury_status"] == "Out"
    assert team["record"] == "2-1"


def test_user_not_in_league_is_404(client):
    assert client.get("/api/leagues/L1/team", params={"user_id": "nobody"}).status_code == 404


def test_free_agents_exclude_rostered(client):
    fa = client.get("/api/leagues/L1/free-agents").json()
    assert [p["name"] for p in fa] == ["Free Four"]


def test_advice_without_key_degrades(client, monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, "ai_provider", "anthropic")
    monkeypatch.setattr(settings, "anthropic_api_key", "")
    r = client.post("/api/leagues/L1/advice", json={"user_id": "u1", "kind": "lineup"})
    assert r.status_code == 200 and r.json()["ai"] is False


def test_advice_rejects_bad_kind(client):
    r = client.post("/api/leagues/L1/advice", json={"user_id": "u1", "kind": "nope"})
    assert r.status_code == 422


def test_advice_via_openai_compatible_provider(client, monkeypatch):
    import json
    from app import ai
    from app.config import settings

    seen = {}

    def fake_llm(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["auth"] = request.headers.get("authorization")
        seen["body"] = json.loads(request.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": "Start Starter One."}}]})

    monkeypatch.setattr(settings, "ai_provider", "openai")
    monkeypatch.setattr(settings, "ai_base_url", "http://llm.test/v1/")
    monkeypatch.setattr(settings, "ai_api_key", "k")
    monkeypatch.setattr(settings, "ai_model", "m")
    real = ai._openai_compatible
    monkeypatch.setattr(ai, "_openai_compatible", lambda p: real(p, httpx.MockTransport(fake_llm)))

    r = client.post("/api/leagues/L1/advice", json={"user_id": "u1", "kind": "waivers"})
    assert r.json() == {"kind": "waivers", "ai": True, "advice": "Start Starter One."}
    assert seen["url"] == "http://llm.test/v1/chat/completions"
    assert seen["auth"] == "Bearer k" and seen["body"]["model"] == "m"
    assert "Free Four" in seen["body"]["messages"][1]["content"]

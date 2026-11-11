"""Turn raw Sleeper payloads into the compact views the app and the AI use."""
from .sleeper import SleeperClient, SleeperError


def _player(pid: str, players: dict) -> dict:
    p = players.get(pid) or {}
    name = p.get("full_name") or " ".join(
        x for x in (p.get("first_name"), p.get("last_name")) if x
    )
    return {
        "player_id": pid,
        "name": name or pid,
        "team": p.get("team"),
        "positions": p.get("fantasy_positions") or [],
        "injury_status": p.get("injury_status"),
    }


def _find_roster(rosters: list[dict], user_id: str) -> dict:
    for r in rosters:
        if r.get("owner_id") == user_id or user_id in (r.get("co_owners") or []):
            return r
    raise SleeperError(404, "That user has no team in this league")


def _team_view(roster: dict, players: dict, owner_name: str | None = None) -> dict:
    starters = [p for p in (roster.get("starters") or []) if p and p != "0"]
    reserve = roster.get("reserve") or []
    all_ids = roster.get("players") or []
    bench = [p for p in all_ids if p not in starters and p not in reserve]
    s = roster.get("settings") or {}
    return {
        "roster_id": roster.get("roster_id"),
        "owner": owner_name,
        "record": f"{s.get('wins', 0)}-{s.get('losses', 0)}",
        "points_for": s.get("fpts", 0),
        "starters": [_player(p, players) for p in starters],
        "bench": [_player(p, players) for p in bench],
        "injured_reserve": [_player(p, players) for p in reserve],
    }


async def user_leagues(sl: SleeperClient, username: str) -> dict:
    user = await sl.user(username)
    state = await sl.state()
    season = state.get("league_season") or state.get("season")
    leagues = await sl.leagues(user["user_id"], season)
    return {
        "user_id": user["user_id"],
        "display_name": user.get("display_name"),
        "season": season,
        "leagues": [
            {
                "league_id": lg["league_id"],
                "name": lg.get("name"),
                "teams": lg.get("total_rosters"),
                "status": lg.get("status"),
            }
            for lg in leagues
        ],
    }


async def my_team(sl: SleeperClient, league_id: str, user_id: str) -> dict:
    rosters = await sl.rosters(league_id)
    players = await sl.players()
    return _team_view(_find_roster(rosters, user_id), players)


async def free_agents(sl: SleeperClient, league_id: str, limit: int = 20) -> list[dict]:
    """Unrostered players, ranked by how many Sleeper leagues added them in the last 24h."""
    rosters = await sl.rosters(league_id)
    players = await sl.players()
    taken = {p for r in rosters for p in (r.get("players") or [])}
    out = []
    for t in await sl.trending("add", limit=100):
        pid = t["player_id"]
        if pid not in taken:
            out.append({**_player(pid, players), "adds_24h": t.get("count")})
        if len(out) >= limit:
            break
    return out


async def league_context(sl: SleeperClient, league_id: str, user_id: str) -> dict:
    """Everything the AI needs for one league, in one JSON-able dict."""
    league = await sl.league(league_id)
    rosters = await sl.rosters(league_id)
    players = await sl.players()
    names = {u["user_id"]: u.get("display_name") for u in await sl.league_users(league_id)}
    mine = _find_roster(rosters, user_id)
    state = await sl.state()
    return {
        "league": {
            "name": league.get("name"),
            "week": state.get("week"),
            "roster_positions": league.get("roster_positions"),
            "scoring_settings": league.get("scoring_settings"),
        },
        "my_team": _team_view(mine, players, names.get(mine.get("owner_id"))),
        "other_teams": [
            _team_view(r, players, names.get(r.get("owner_id")))
            for r in rosters if r is not mine
        ],
        "free_agents": await free_agents(sl, league_id),
    }

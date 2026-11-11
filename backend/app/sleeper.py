"""Thin async client for Sleeper's public read-only API (no auth needed).

Sleeper asks callers to stay under ~1000 requests/minute and to fetch the
full player map at most once a day, so everything here is TTL-cached.
"""
import time
from typing import Any

import httpx

from .config import settings

PLAYERS_TTL = 24 * 3600
DEFAULT_TTL = 60


class SleeperError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        super().__init__(message)


class SleeperClient:
    def __init__(self, transport: httpx.AsyncBaseTransport | None = None):
        self._http = httpx.AsyncClient(
            base_url=settings.sleeper_base_url, timeout=30, transport=transport
        )
        self._cache: dict[str, tuple[float, Any]] = {}

    async def _get(self, path: str, ttl: int = DEFAULT_TTL, **params) -> Any:
        key = path + "?" + "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        hit = self._cache.get(key)
        if hit and hit[0] > time.monotonic():
            return hit[1]
        resp = await self._http.get(path, params=params or None)
        if resp.status_code == 404:
            raise SleeperError(404, f"Not found on Sleeper: {path}")
        if resp.status_code >= 400:
            raise SleeperError(502, f"Sleeper returned {resp.status_code} for {path}")
        data = resp.json() if resp.content else None
        self._cache[key] = (time.monotonic() + ttl, data)
        return data

    async def state(self) -> dict:
        return await self._get(f"/state/{settings.sport}", ttl=600)

    async def user(self, username_or_id: str) -> dict:
        data = await self._get(f"/user/{username_or_id}", ttl=600)
        if not data:  # Sleeper answers 200 + null for unknown usernames
            raise SleeperError(404, f"No Sleeper user named '{username_or_id}'")
        return data

    async def leagues(self, user_id: str, season: str) -> list[dict]:
        return await self._get(f"/user/{user_id}/leagues/{settings.sport}/{season}") or []

    async def league(self, league_id: str) -> dict:
        data = await self._get(f"/league/{league_id}")
        if not data:
            raise SleeperError(404, f"No league {league_id}")
        return data

    async def rosters(self, league_id: str) -> list[dict]:
        return await self._get(f"/league/{league_id}/rosters") or []

    async def league_users(self, league_id: str) -> list[dict]:
        return await self._get(f"/league/{league_id}/users", ttl=600) or []

    async def matchups(self, league_id: str, week: int) -> list[dict]:
        return await self._get(f"/league/{league_id}/matchups/{week}") or []

    async def players(self) -> dict[str, dict]:
        return await self._get(f"/players/{settings.sport}", ttl=PLAYERS_TTL)

    async def trending(self, kind: str = "add", hours: int = 24, limit: int = 50) -> list[dict]:
        return await self._get(
            f"/players/{settings.sport}/trending/{kind}",
            ttl=900, lookback_hours=hours, limit=limit,
        ) or []

    async def aclose(self) -> None:
        await self._http.aclose()

from contextlib import asynccontextmanager
from typing import Literal

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from . import ai, services
from .sleeper import SleeperClient, SleeperError


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not getattr(app.state, "sleeper", None):
        app.state.sleeper = SleeperClient()
    yield
    await app.state.sleeper.aclose()


app = FastAPI(title="Sixth Man API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def sleeper(request: Request) -> SleeperClient:
    return request.app.state.sleeper


@app.exception_handler(SleeperError)
async def sleeper_error(_: Request, exc: SleeperError):
    return JSONResponse(status_code=exc.status, content={"detail": str(exc)})


@app.exception_handler(ai.AIError)
async def ai_error(_: Request, exc: ai.AIError):
    return JSONResponse(status_code=502, content={"detail": str(exc)})


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.get("/api/users/{username}/leagues")
async def get_leagues(username: str, sl: SleeperClient = Depends(sleeper)):
    """Connect step: Sleeper username -> user id + this season's NBA leagues."""
    return await services.user_leagues(sl, username)


@app.get("/api/leagues/{league_id}/team")
async def get_team(league_id: str, user_id: str, sl: SleeperClient = Depends(sleeper)):
    return await services.my_team(sl, league_id, user_id)


@app.get("/api/leagues/{league_id}/free-agents")
async def get_free_agents(league_id: str, limit: int = 20, sl: SleeperClient = Depends(sleeper)):
    return await services.free_agents(sl, league_id, limit)


class AdviceRequest(BaseModel):
    user_id: str
    kind: Literal["lineup", "trades", "waivers"]


@app.post("/api/leagues/{league_id}/advice")
async def get_advice(league_id: str, body: AdviceRequest, sl: SleeperClient = Depends(sleeper)):
    context = await services.league_context(sl, league_id, body.user_id)
    return await ai.advise(body.kind, context)

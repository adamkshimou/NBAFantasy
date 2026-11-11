"""AI advice layer. One function per decision type would be overkill for now:
each kind is a prompt over the same league context."""
import json

import httpx

from .config import settings

class AIError(Exception):
    pass


SYSTEM = (
    "You are a fantasy basketball assistant for a Sleeper NBA league. "
    "Use only the league data provided: the scoring settings, roster slots, "
    "rosters and injury statuses. You do not have live stats or schedules "
    "unless they appear in the data, so say when a call depends on something "
    "you cannot see. Be specific, name players, and keep it short."
)

PROMPTS = {
    "lineup": (
        "Suggest my best starting lineup for this week. List who to start in "
        "each slot, flag any injured starters, and name any bench player who "
        "should replace a current starter, with one line of reasoning each."
    ),
    "trades": (
        "Suggest up to 3 realistic trades. Each must help my team and be "
        "plausible for the other manager given their roster needs. For each: "
        "who I give, who I get, which team, and why both sides say yes."
    ),
    "waivers": (
        "Suggest up to 5 waiver pickups from the free agent list, ranked. "
        "For each, say who I should drop and why."
    ),
}


def _off(kind: str, why: str) -> dict:
    return {"kind": kind, "ai": False, "advice": f"AI is not configured. {why}"}


async def _anthropic(prompt: str) -> str:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    msg = await client.messages.create(
        model=settings.ai_model,
        max_tokens=1500,
        system=SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(b.text for b in msg.content if b.type == "text")


async def _openai_compatible(prompt: str, transport: httpx.AsyncBaseTransport | None = None) -> str:
    headers = {"Authorization": f"Bearer {settings.ai_api_key}"} if settings.ai_api_key else {}
    async with httpx.AsyncClient(timeout=180, transport=transport) as http:
        resp = await http.post(
            settings.ai_base_url.rstrip("/") + "/chat/completions",
            headers=headers,
            json={
                "model": settings.ai_model,
                "messages": [
                    {"role": "system", "content": SYSTEM},
                    {"role": "user", "content": prompt},
                ],
            },
        )
    if resp.status_code >= 400:
        raise AIError(f"AI provider returned {resp.status_code}: {resp.text[:300]}")
    return resp.json()["choices"][0]["message"]["content"]


async def advise(kind: str, context: dict) -> dict:
    if kind not in PROMPTS:
        raise ValueError(f"Unknown advice kind: {kind}")
    data = json.dumps(context, separators=(",", ":"))
    prompt = f"{PROMPTS[kind]}\n\nLeague data (JSON):\n{data}"
    if settings.ai_provider == "openai":
        if not settings.ai_base_url:
            return _off(kind, "Set AI_BASE_URL (and AI_API_KEY if the provider needs one).")
        text = await _openai_compatible(prompt)
    else:
        if not settings.anthropic_api_key:
            return _off(kind, "Set ANTHROPIC_API_KEY, or switch AI_PROVIDER to openai.")
        text = await _anthropic(prompt)
    return {"kind": kind, "ai": True, "advice": text}

"""AI advice layer. One function per decision type would be overkill for now:
each kind is a prompt over the same league context."""
import json

from .config import settings

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


async def advise(kind: str, context: dict) -> dict:
    if kind not in PROMPTS:
        raise ValueError(f"Unknown advice kind: {kind}")
    if not settings.anthropic_api_key:
        return {
            "kind": kind,
            "ai": False,
            "advice": "AI is not configured. Set ANTHROPIC_API_KEY to enable suggestions.",
        }
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    msg = await client.messages.create(
        model=settings.ai_model,
        max_tokens=1500,
        system=SYSTEM,
        messages=[{
            "role": "user",
            "content": f"{PROMPTS[kind]}\n\nLeague data (JSON):\n{json.dumps(context)}",
        }],
    )
    text = "".join(b.text for b in msg.content if b.type == "text")
    return {"kind": kind, "ai": True, "advice": text}

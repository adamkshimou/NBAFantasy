# Sixth Man (working name)

AI assistant for Sleeper fantasy NBA leagues: lineup, trade, and waiver suggestions.

## Status

Backend skeleton. Frontend not started.

## Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add ANTHROPIC_API_KEY for AI advice
uvicorn app.main:app --reload
pytest
```

Docs at http://localhost:8000/docs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/users/{username}/leagues` | Connect: Sleeper username to user id and NBA leagues |
| `GET /api/leagues/{id}/team?user_id=` | Your starters, bench, IR |
| `GET /api/leagues/{id}/free-agents` | Unrostered players by 24h add trend |
| `POST /api/leagues/{id}/advice` | AI advice, `kind`: `lineup`, `trades`, `waivers` |

## Not built yet

- Player stats, projections, and NBA schedule (advice currently sees rosters, injuries, scoring settings, and add trends only)
- Postgres (compose file is ready; nothing is persisted yet)
- Accounts and saved leagues
- Frontend

# Sixth Man (working name)

AI assistant for Sleeper fantasy NBA leagues: lineup, trade, and waiver suggestions.

## Status

Backend plus an Expo (React Native) app with a welcome screen and four tabs: Home, Trades, Waivers, and Add team.

## Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # pick an AI option inside (free ones included)
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

## Mobile app (Expo)

```bash
cd mobile
npm install
cp .env.example .env        # point EXPO_PUBLIC_API_URL at the backend
npm run web                 # browser
npx expo start              # phone via Expo Go (use your computer's LAN IP in .env)
npm run typecheck
```

Screens live in `mobile/src/app/` (Expo Router). Connected teams are saved on the device.

## Not built yet

- Player stats, projections, and NBA schedule (advice currently sees rosters, injuries, scoring settings, and add trends only)
- Postgres (compose file is ready; nothing is persisted yet)
- Accounts and saved leagues
- Trade analyzer (pick players to give and get), accounts and sign-in, app icons and store setup

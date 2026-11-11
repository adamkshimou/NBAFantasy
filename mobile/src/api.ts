const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export type League = { league_id: string; name: string; teams: number; status: string };
export type Account = { user_id: string; display_name: string; season: string; leagues: League[] };
export type Player = {
  player_id: string;
  name: string;
  team: string | null;
  positions: string[];
  injury_status: string | null;
  adds_24h?: number;
};
export type Team = {
  roster_id: number;
  record: string;
  points_for: number;
  starters: Player[];
  bench: Player[];
  injured_reserve: Player[];
};
export type AdviceKind = "lineup" | "trades" | "waivers";
export type Advice = { kind: AdviceKind; ai: boolean; advice: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new Error(`Can't reach the server at ${BASE}`);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  connect: (username: string) =>
    request<Account>(`/api/users/${encodeURIComponent(username)}/leagues`),
  team: (leagueId: string, userId: string) =>
    request<Team>(`/api/leagues/${leagueId}/team?user_id=${userId}`),
  freeAgents: (leagueId: string) => request<Player[]>(`/api/leagues/${leagueId}/free-agents`),
  advice: (leagueId: string, userId: string, kind: AdviceKind) =>
    request<Advice>(`/api/leagues/${leagueId}/advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, kind }),
    }),
};

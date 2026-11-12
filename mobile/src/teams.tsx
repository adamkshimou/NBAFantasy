import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SavedTeam = {
  id: string; // `${userId}:${leagueId}`
  userId: string;
  displayName: string;
  leagueId: string;
  leagueName: string;
};

type Store = { teams: SavedTeam[]; activeId: string | null };
type Ctx = Store & {
  ready: boolean;
  active: SavedTeam | null;
  addTeam: (t: Omit<SavedTeam, "id">) => void;
  removeTeam: (id: string) => void;
  setActive: (id: string) => void;
};

const KEY = "sixthman.teams.v1";
const TeamsContext = createContext<Ctx | null>(null);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>({ teams: [], activeId: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setStore(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((fn: (s: Store) => Store) => {
    setStore((prev) => {
      const next = fn(prev);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const active = store.teams.find((t) => t.id === store.activeId) ?? store.teams[0] ?? null;
    return {
      ...store,
      ready,
      active,
      addTeam: (t) =>
        update((s) => {
          const id = `${t.userId}:${t.leagueId}`;
          if (s.teams.some((x) => x.id === id)) return { ...s, activeId: id };
          return { teams: [...s.teams, { ...t, id }], activeId: id };
        }),
      removeTeam: (id) =>
        update((s) => {
          const teams = s.teams.filter((t) => t.id !== id);
          return { teams, activeId: s.activeId === id ? teams[0]?.id ?? null : s.activeId };
        }),
      setActive: (id) => update((s) => ({ ...s, activeId: id })),
    };
  }, [store, ready, update]);

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
}

export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) throw new Error("useTeams must be used inside TeamsProvider");
  return ctx;
}

import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, type Advice, type AdviceKind, type League } from "../api";
import { colors } from "../theme";
import { Button, PlayerRow, SectionTitle, Status } from "../ui";
import { useAsync } from "../useAsync";

type Tab = "team" | "waivers" | "ai";
const TABS: { key: Tab; label: string }[] = [
  { key: "team", label: "My Team" },
  { key: "waivers", label: "Free Agents" },
  { key: "ai", label: "AI Advice" },
];

export function LeagueScreen({ league, userId }: { league: League; userId: string }) {
  const [tab, setTab] = useState<Tab>("team");
  return (
    <View style={{ flex: 1 }}>
      <View style={s.tabs}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={[s.tab, tab === t.key && s.tabOn]}>
            <Text style={[s.tabText, tab === t.key && { color: "#111" }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      {tab === "team" && <TeamTab leagueId={league.league_id} userId={userId} />}
      {tab === "waivers" && <FreeAgentsTab leagueId={league.league_id} />}
      {tab === "ai" && <AdviceTab leagueId={league.league_id} userId={userId} />}
    </View>
  );
}

function TeamTab({ leagueId, userId }: { leagueId: string; userId: string }) {
  const { data, loading, error, reload } = useAsync(() => api.team(leagueId, userId), [leagueId, userId]);
  if (!data) return <Status loading={loading} error={error} onRetry={reload} />;
  return (
    <ScrollView>
      <Text style={s.record}>
        {data.record} · {data.points_for.toLocaleString()} pts
      </Text>
      <SectionTitle>STARTERS</SectionTitle>
      {data.starters.map((p) => <PlayerRow key={p.player_id} player={p} />)}
      <SectionTitle>BENCH</SectionTitle>
      {data.bench.map((p) => <PlayerRow key={p.player_id} player={p} />)}
      {data.injured_reserve.length > 0 && <SectionTitle>INJURED RESERVE</SectionTitle>}
      {data.injured_reserve.map((p) => <PlayerRow key={p.player_id} player={p} />)}
    </ScrollView>
  );
}

function FreeAgentsTab({ leagueId }: { leagueId: string }) {
  const { data, loading, error, reload } = useAsync(() => api.freeAgents(leagueId), [leagueId]);
  if (!data) return <Status loading={loading} error={error} onRetry={reload} />;
  return (
    <FlatList
      data={data}
      keyExtractor={(p) => p.player_id}
      ListHeaderComponent={<SectionTitle>MOST ADDED IN THE LAST 24 HOURS</SectionTitle>}
      renderItem={({ item }) => <PlayerRow player={item} />}
    />
  );
}

const KINDS: { kind: AdviceKind; label: string }[] = [
  { kind: "lineup", label: "Set my lineup" },
  { kind: "trades", label: "Find trades" },
  { kind: "waivers", label: "Waiver pickups" },
];

function AdviceTab({ leagueId, userId }: { leagueId: string; userId: string }) {
  const [busy, setBusy] = useState<AdviceKind | null>(null);
  const [result, setResult] = useState<Advice | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(kind: AdviceKind) {
    setBusy(kind);
    setError(null);
    try {
      setResult(await api.advice(leagueId, userId, kind));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ gap: 10, paddingTop: 16 }}>
      {KINDS.map((k) => (
        <Button
          key={k.kind}
          label={busy === k.kind ? "Thinking..." : k.label}
          onPress={() => ask(k.kind)}
          disabled={busy !== null}
        />
      ))}
      <Status loading={false} error={error} />
      {result && <Text style={s.advice}>{result.advice}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: "row", gap: 8, marginTop: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  record: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 16 },
  advice: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
});

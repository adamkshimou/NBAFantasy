import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { api } from "../../api";
import { useTeams } from "../../teams";
import { c } from "../../theme";
import { AdviceCard, NoTeam, PlayerRow, Screen, Section, Status } from "../../ui";
import { useAsync } from "../../useAsync";

export default function Home() {
  const { active, teams, setActive } = useTeams();
  if (!active) return <Screen title="Home"><NoTeam what="your roster and lineup help" /></Screen>;
  return (
    <Screen title={active.leagueName} subtitle={`Managed by ${active.displayName}`}>
      {teams.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ gap: 8 }}>
          {teams.map((t) => (
            <Pressable key={t.id} onPress={() => setActive(t.id)} style={[s.chip, t.id === active.id && s.chipOn]}>
              <Text style={[s.chipText, t.id === active.id && { color: c.ink }]}>{t.leagueName}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <Roster key={active.id} leagueId={active.leagueId} userId={active.userId} />
    </Screen>
  );
}

function Roster({ leagueId, userId }: { leagueId: string; userId: string }) {
  const { data, loading, error, reload } = useAsync(() => api.team(leagueId, userId), [leagueId, userId]);
  if (!data) return <Status loading={loading} error={error} onRetry={reload} />;
  return (
    <>
      <Text style={s.record}>
        {data.record}
        <Text style={s.points}>   {data.points_for.toLocaleString()} points for</Text>
      </Text>
      <AdviceCard
        kind="lineup"
        title="Lineup help"
        blurb="Who to start and who to sit this week, based on your roster and injuries."
        action="Set my lineup"
      />
      <Section title="Starters">{data.starters.map((p) => <PlayerRow key={p.player_id} player={p} />)}</Section>
      <Section title="Bench">{data.bench.map((p) => <PlayerRow key={p.player_id} player={p} />)}</Section>
      {data.injured_reserve.length > 0 ? (
        <Section title="Injured reserve">{data.injured_reserve.map((p) => <PlayerRow key={p.player_id} player={p} />)}</Section>
      ) : null}
    </>
  );
}

const s = StyleSheet.create({
  record: { color: c.text, fontSize: 28, fontWeight: "800", marginTop: 18 },
  points: { color: c.muted, fontSize: 14, fontWeight: "500" },
  chip: { backgroundColor: c.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: c.accent },
  chipText: { color: c.text, fontWeight: "600", fontSize: 13 },
});

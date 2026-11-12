import { Text } from "react-native";
import { api } from "../../api";
import { useTeams } from "../../teams";
import { c } from "../../theme";
import { AdviceCard, NoTeam, PlayerRow, Screen, Section, Status } from "../../ui";
import { useAsync } from "../../useAsync";

export default function Waivers() {
  const { active } = useTeams();
  if (!active) return <Screen title="Waivers"><NoTeam what="available players and pickup advice" /></Screen>;
  return (
    <Screen title="Waivers" subtitle={active.leagueName}>
      <AdviceCard
        key={active.id}
        kind="waivers"
        title="Pickups and drops"
        blurb="Ranks the best available players for your team and says who to drop for each."
        action="Suggest pickups"
      />
      <FreeAgents key={active.leagueId} leagueId={active.leagueId} />
    </Screen>
  );
}

function FreeAgents({ leagueId }: { leagueId: string }) {
  const { data, loading, error, reload } = useAsync(() => api.freeAgents(leagueId), [leagueId]);
  if (!data) return <Status loading={loading} error={error} onRetry={reload} />;
  return (
    <Section title="Most added today">
      {data.length === 0 ? <Text style={{ color: c.muted }}>No trending free agents right now.</Text> : null}
      {data.map((p) => (
        <PlayerRow
          key={p.player_id}
          player={p}
          trailing={
            p.adds_24h != null ? (
              <Text style={{ color: c.good, fontWeight: "700", fontSize: 13 }}>+{p.adds_24h.toLocaleString()}</Text>
            ) : null
          }
        />
      ))}
    </Section>
  );
}

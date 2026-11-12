import { useTeams } from "../../teams";
import { AdviceCard, NoTeam, Screen } from "../../ui";

export default function Trades() {
  const { active } = useTeams();
  if (!active) return <Screen title="Trades"><NoTeam what="trade ideas for your league" /></Screen>;
  return (
    <Screen title="Trades" subtitle={active.leagueName}>
      <AdviceCard
        key={active.id}
        kind="trades"
        title="Trade ideas"
        blurb="Looks at every roster in your league and suggests deals that help you and that the other manager could accept."
        action="Find trades"
      />
    </Screen>
  );
}

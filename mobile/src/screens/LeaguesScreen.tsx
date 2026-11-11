import { FlatList, Pressable, Text, View } from "react-native";
import type { Account, League } from "../api";
import { colors } from "../theme";
import { SectionTitle, styles as ui } from "../ui";

export function LeaguesScreen({ account, onPick }: { account: Account; onPick: (l: League) => void }) {
  return (
    <View style={{ flex: 1 }}>
      <SectionTitle>{`${account.season} NBA LEAGUES`}</SectionTitle>
      <FlatList
        data={account.leagues}
        keyExtractor={(l) => l.league_id}
        ListEmptyComponent={
          <Text style={{ color: colors.muted, marginTop: 24, textAlign: "center" }}>
            No NBA leagues found for {account.display_name} this season.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => onPick(item)} style={ui.row}>
            <View style={{ flex: 1 }}>
              <Text style={ui.name}>{item.name}</Text>
              <Text style={ui.meta}>{item.teams} teams</Text>
            </View>
            <Text style={{ color: colors.accent, fontSize: 20 }}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

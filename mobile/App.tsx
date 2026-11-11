import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { Account, League } from "./src/api";
import { ConnectScreen } from "./src/screens/ConnectScreen";
import { LeagueScreen } from "./src/screens/LeagueScreen";
import { LeaguesScreen } from "./src/screens/LeaguesScreen";
import { colors } from "./src/theme";

export default function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [league, setLeague] = useState<League | null>(null);

  const back = league ? () => setLeague(null) : account ? () => setAccount(null) : null;
  const title = league?.name ?? account?.display_name ?? "";

  return (
    <View style={s.app}>
      <StatusBar style="light" />
      {back && (
        <View style={s.header}>
          <Pressable onPress={back} hitSlop={12}>
            <Text style={s.back}>‹ {league ? "Leagues" : "Sign out"}</Text>
          </Pressable>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
        </View>
      )}
      {!account ? (
        <ConnectScreen onConnected={setAccount} />
      ) : !league ? (
        <LeaguesScreen account={account} onPick={setLeague} />
      ) : (
        <LeagueScreen league={league} userId={account.user_id} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 56,
    paddingBottom: 16,
  },
  header: { gap: 4, marginBottom: 4 },
  back: { color: colors.accent, fontSize: 15, fontWeight: "600" },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
});

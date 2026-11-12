import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api, type Account, type League } from "../../api";
import { useTeams } from "../../teams";
import { c } from "../../theme";
import { Button, Screen, Section } from "../../ui";

export default function AddTeam() {
  const { teams, active, addTeam, removeTeam, setActive } = useTeams();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  async function find() {
    const name = username.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    setAccount(null);
    try {
      setAccount(await api.connect(name));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function add(league: League) {
    if (!account) return;
    const first = teams.length === 0;
    addTeam({
      userId: account.user_id,
      displayName: account.display_name,
      leagueId: league.league_id,
      leagueName: league.name,
    });
    if (first) router.navigate("/");
  }

  const added = (l: League) => teams.some((t) => t.id === `${account?.user_id}:${l.league_id}`);

  return (
    <Screen title="Add a team" subtitle="Enter your Sleeper username. No password needed.">
      <View style={s.inputRow}>
        <TextInput
          value={username}
          onChangeText={setUsername}
          onSubmitEditing={find}
          placeholder="Sleeper username"
          placeholderTextColor={c.muted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={s.input}
        />
      </View>
      <Button label={busy ? "Looking..." : "Find my leagues"} onPress={find} disabled={busy || !username.trim()} />
      {error ? <Text style={s.error}>{error}</Text> : null}

      {account ? (
        <Section title={`${account.season} NBA leagues`}>
          {account.leagues.length === 0 ? (
            <Text style={s.muted}>{account.display_name} has no NBA leagues this season.</Text>
          ) : null}
          {account.leagues.map((l) => (
            <View key={l.league_id} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.name} numberOfLines={1}>{l.name}</Text>
                <Text style={s.muted}>{l.teams} teams</Text>
              </View>
              {added(l) ? (
                <View style={s.addedTag}>
                  <Ionicons name="checkmark" size={16} color={c.good} />
                  <Text style={{ color: c.good, fontWeight: "700" }}>Added</Text>
                </View>
              ) : (
                <Pressable onPress={() => add(l)} style={s.addBtn}>
                  <Text style={{ color: c.ink, fontWeight: "700" }}>Add</Text>
                </Pressable>
              )}
            </View>
          ))}
        </Section>
      ) : null}

      {teams.length > 0 ? (
        <Section title="Your teams">
          {teams.map((t) => {
            const on = t.id === active?.id;
            return (
              <Pressable key={t.id} onPress={() => setActive(t.id)} style={[s.row, on && { borderColor: c.accent }]}>
                <Ionicons name={on ? "radio-button-on" : "radio-button-off"} size={22} color={on ? c.accent : c.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={s.name} numberOfLines={1}>{t.leagueName}</Text>
                  <Text style={s.muted}>{t.displayName}</Text>
                </View>
                <Pressable onPress={() => removeTeam(t.id)} hitSlop={10} accessibilityLabel={`Remove ${t.leagueName}`}>
                  <Ionicons name="close" size={22} color={c.muted} />
                </Pressable>
              </Pressable>
            );
          })}
        </Section>
      ) : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  inputRow: { marginTop: 22, marginBottom: 12 },
  input: { backgroundColor: c.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 15, color: c.text, fontSize: 16 },
  error: { color: c.bad, fontSize: 15, marginTop: 14 },
  muted: { color: c.muted, fontSize: 13, marginTop: 2 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface,
    borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "transparent",
  },
  name: { color: c.text, fontSize: 16, fontWeight: "600" },
  addBtn: { backgroundColor: c.accent, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8 },
  addedTag: { flexDirection: "row", alignItems: "center", gap: 4 },
});

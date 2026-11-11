import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { api, type Account } from "../api";
import { colors } from "../theme";
import { Button, styles as ui } from "../ui";

export function ConnectScreen({ onConnected }: { onConnected: (a: Account) => void }) {
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    const name = username.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      onConnected(await api.connect(name));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Sixth Man</Text>
      <Text style={s.sub}>AI help for your Sleeper NBA league</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        onSubmitEditing={connect}
        placeholder="Sleeper username"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        style={s.input}
      />
      <Button label={busy ? "Connecting..." : "Connect"} onPress={connect} disabled={busy || !username.trim()} />
      {error ? <Text style={[ui.error, { marginTop: 16 }]}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", gap: 12 },
  title: { color: colors.text, fontSize: 36, fontWeight: "800" },
  sub: { color: colors.muted, fontSize: 16, marginBottom: 16 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    fontSize: 16,
  },
});

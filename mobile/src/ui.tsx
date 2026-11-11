import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { Player } from "./api";
import { colors } from "./theme";

export function Button({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, (pressed || disabled) && { opacity: 0.6 }]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function Status({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry?: () => void }) {
  if (loading) return <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />;
  if (!error) return null;
  return (
    <View style={{ marginTop: 24, gap: 12 }}>
      <Text style={styles.error}>{error}</Text>
      {onRetry && <Button label="Try again" onPress={onRetry} />}
    </View>
  );
}

export function PlayerRow({ player }: { player: Player }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.meta}>
          {[player.team ?? "FA", player.positions.join("/")].filter(Boolean).join(" · ")}
        </Text>
      </View>
      {player.injury_status ? <Text style={styles.injury}>{player.injury_status}</Text> : null}
      {player.adds_24h != null ? <Text style={styles.meta}>+{player.adds_24h.toLocaleString()}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

export const styles = StyleSheet.create({
  button: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#111", fontWeight: "700", fontSize: 16 },
  error: { color: colors.danger, fontSize: 15, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  name: { color: colors.text, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  injury: { color: colors.danger, fontSize: 13, fontWeight: "700" },
  section: { color: colors.muted, fontSize: 13, fontWeight: "700", letterSpacing: 1, marginTop: 16, marginBottom: 8 },
});

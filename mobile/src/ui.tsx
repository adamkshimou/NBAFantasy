import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, type Advice, type AdviceKind, type Player } from "./api";
import { useTeams } from "./teams";
import { c, font } from "./theme";

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 18, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.h1} numberOfLines={2}>{title}</Text>
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
      {children}
    </ScrollView>
  );
}

export function Button({
  label, onPress, disabled, tone = "accent",
}: { label: string; onPress: () => void; disabled?: boolean; tone?: "accent" | "quiet" }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.button, tone === "quiet" && s.buttonQuiet, (pressed || disabled) && { opacity: 0.55 }]}
    >
      <Text style={[s.buttonText, tone === "quiet" && { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 26 }}>
      <Text style={s.section}>{title}</Text>
      {children}
    </View>
  );
}

export function Status({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry?: () => void }) {
  if (loading) return <ActivityIndicator color={c.accent} style={{ marginTop: 36 }} />;
  if (!error) return null;
  return (
    <View style={{ marginTop: 24, gap: 12 }}>
      <Text style={s.error}>{error}</Text>
      {onRetry ? <Button label="Try again" tone="quiet" onPress={onRetry} /> : null}
    </View>
  );
}

export function PlayerRow({ player, trailing }: { player: Player; trailing?: ReactNode }) {
  const initials = player.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <View style={s.row}>
      <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={s.name} numberOfLines={1}>{player.name}</Text>
        <Text style={s.meta}>{[player.team ?? "Free agent", player.positions.join("/")].filter(Boolean).join("  ")}</Text>
      </View>
      {player.injury_status ? (
        <View style={s.tagBad}><Text style={s.tagBadText}>{player.injury_status}</Text></View>
      ) : null}
      {trailing}
    </View>
  );
}

/** Shown on Home, Trades and Waivers until a team is connected. */
export function NoTeam({ what }: { what: string }) {
  return (
    <View style={s.empty}>
      <Ionicons name="basketball-outline" size={40} color={c.accent} />
      <Text style={s.emptyTitle}>Connect a team first</Text>
      <Text style={s.emptyBody}>Add your Sleeper team to see {what}.</Text>
      <Button label="Add a team" onPress={() => router.navigate("/add")} />
    </View>
  );
}

/** A button that asks the AI for one kind of advice about the active team and shows the answer. */
export function AdviceCard({ kind, title, blurb, action }: { kind: AdviceKind; title: string; blurb: string; action: string }) {
  const { active } = useTeams();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Advice | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!active) return null;

  async function ask() {
    if (!active) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await api.advice(active.leagueId, active.userId, kind));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.advice}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="sparkles" size={18} color={c.accent} />
        <Text style={s.adviceTitle}>{title}</Text>
      </View>
      <Text style={s.adviceBlurb}>{blurb}</Text>
      {result ? <Text style={[s.adviceText, !result.ai && { color: c.muted }]}>{result.advice}</Text> : null}
      {error ? <Text style={[s.error, { textAlign: "left" }]}>{error}</Text> : null}
      <Button label={busy ? "Thinking..." : result ? "Ask again" : action} onPress={ask} disabled={busy} />
    </View>
  );
}

const s = StyleSheet.create({
  h1: { color: c.text, fontFamily: font.display, fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  sub: { color: c.muted, fontSize: 15, marginTop: 6 },
  section: { color: c.text, fontFamily: font.title, fontSize: 18, marginBottom: 10 },
  button: { backgroundColor: c.accent, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 20, alignItems: "center" },
  buttonQuiet: { backgroundColor: c.raised },
  buttonText: { color: c.ink, fontWeight: "700", fontSize: 16 },
  error: { color: c.bad, fontSize: 15, textAlign: "center" },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: c.surface, borderRadius: 16, padding: 12, marginBottom: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.raised, alignItems: "center", justifyContent: "center" },
  avatarText: { color: c.muted, fontWeight: "700", fontSize: 13 },
  name: { color: c.text, fontSize: 16, fontWeight: "600" },
  meta: { color: c.muted, fontSize: 13, marginTop: 2 },
  tagBad: { backgroundColor: "rgba(242,100,106,0.16)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagBadText: { color: c.bad, fontSize: 12, fontWeight: "700" },
  empty: { marginTop: 48, gap: 12, alignItems: "stretch" },
  emptyTitle: { color: c.text, fontFamily: font.title, fontSize: 22 },
  emptyBody: { color: c.muted, fontSize: 15, marginBottom: 8 },
  advice: { backgroundColor: c.surface, borderRadius: 20, padding: 16, gap: 12, marginTop: 20, borderWidth: 1, borderColor: c.line },
  adviceTitle: { color: c.text, fontFamily: font.title, fontSize: 18 },
  adviceBlurb: { color: c.muted, fontSize: 14, lineHeight: 20 },
  adviceText: { color: c.text, fontSize: 15, lineHeight: 22 },
});

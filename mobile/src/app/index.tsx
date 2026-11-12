import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTeams } from "../teams";
import { day, font } from "../theme";

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { teams, ready } = useTeams();
  if (!ready) return null;
  if (teams.length > 0) return <Redirect href="/(tabs)" />;

  return (
    <LinearGradient colors={[day.sky, day.peach, day.cream, day.sky]} locations={[0, 0.4, 0.72, 1]} style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <View style={s.collageWrap} pointerEvents="none">
        <View style={s.collage}>
          <View style={s.line}>
            <Card color={day.cream} w={210} h={84}><Text style={s.small}>Week 4</Text><Text style={s.big}>3 wins, 1 loss</Text></Card>
            <Card color={day.blue} w={330} h={84}>
              <View style={s.inline}>
                <View style={s.pillDark}><Text style={s.pillDarkText}>Win chance 61%</Text></View>
                <Text style={[s.small, { color: "#3F5C8C" }]}>4 games left</Text>
              </View>
            </Card>
          </View>
          <View style={s.line}>
            <Card color={day.blue} w={250}>
              <Text style={[s.small, { color: "#3F5C8C" }]}>Start or sit</Text>
              <View style={s.inline}><Ionicons name="checkmark-circle" size={20} color={day.ink} /><Text style={s.big}>Start Okafor</Text></View>
              <View style={s.inline}><Ionicons name="ellipse-outline" size={20} color="#3F5C8C" /><Text style={[s.big, { color: "#3F5C8C" }]}>Sit Lindqvist</Text></View>
            </Card>
            <Court />
            <Card color={day.cream} w={210}>
              <Text style={s.small}>Your trade</Text>
              <Text style={s.big}>You come out ahead</Text>
              <View style={s.pillDark}><Text style={s.pillDarkText}>Fair for both</Text></View>
            </Card>
          </View>
          <View style={s.line}>
            <Card color={day.orange} w={310}>
              <View style={s.inline}>
                <View style={s.badge}><Ionicons name="sparkles" size={20} color={day.orange} /></View>
                <View>
                  <Text style={s.big}>Waiver pickup</Text>
                  <Text style={[s.small, { color: "#7A4A10" }]}>Add Marlowe, drop Tanaka</Text>
                </View>
              </View>
              <View style={[s.inline, { justifyContent: "space-between" }]}>
                <Text style={s.big}>+8.2 a week</Text>
                <View style={s.pillDark}><Text style={[s.pillDarkText, { color: day.orange }]}>Add</Text></View>
              </View>
            </Card>
            <Card color={day.green} w={190}>
              <Text style={[s.small, { color: "#B9DCC8" }]}>This week</Text>
              <Text style={[s.score, { color: "#FFFFFF" }]}>112.4</Text>
              <Text style={[s.small, { color: "#B9DCC8" }]}>to 98.7</Text>
            </Card>
            <Card color={day.cream} w={160}><Text style={s.small}>Bench</Text><Text style={s.big}>2 healthy</Text></Card>
          </View>
          <View style={s.line}>
            <Card color={day.cream} w={120} h={90}><View /></Card>
            <Card color={day.orange} w={360} h={90}><Text style={[s.small, { color: "#7A4A10" }]}>Start or sit</Text></Card>
          </View>
        </View>
      </View>
      {/* Repeats the page gradient from 58% down, so the collage dissolves into the background. */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(246,237,229,0)", "#F6EDE5", day.cream, day.sky]}
        locations={[0.4, 0.58, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[s.header, { top: insets.top + 14 }]}>
        <View style={s.logo}><Text style={s.logoText}>6</Text></View>
        <Text style={s.wordmark}>Sixth Man</Text>
      </View>

      <View style={[s.bottom, { paddingBottom: insets.bottom + 22 }]}>
        <Text style={s.headline}>Every lineup.{"\n"}Every trade.</Text>
        <Text style={s.tagline}>AI help for your Sleeper NBA league.</Text>
        <Pressable
          onPress={() => router.navigate("/add")}
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="basketball" size={22} color="#FFFFFF" />
          <Text style={s.ctaText}>Connect your Sleeper team</Text>
        </Pressable>
        <Text style={s.fine}>Just your Sleeper username. No password.</Text>
      </View>
    </LinearGradient>
  );
}

function Card({ color, w, h = 132, children }: { color: string; w: number; h?: number; children: ReactNode }) {
  const style: ViewStyle = { backgroundColor: color, width: w, height: h };
  return <View style={[s.card, style]}>{children}</View>;
}

/** Half court drawn with plain views, standing in for a photo. */
function Court() {
  const lineColor = "rgba(255,255,255,0.75)";
  return (
    <View style={[s.card, { backgroundColor: day.rim, width: 176, height: 132, padding: 0, overflow: "hidden", alignItems: "center" }]}>
      <View style={{ position: "absolute", top: -96, width: 190, height: 190, borderRadius: 95, borderWidth: 2, borderColor: lineColor }} />
      <View style={{ position: "absolute", top: 0, width: 62, height: 70, borderWidth: 2, borderTopWidth: 0, borderColor: lineColor }} />
      <View style={{ position: "absolute", top: 48, width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: lineColor }} />
      <View style={{ position: "absolute", top: 10, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "#FFFFFF" }} />
      <View style={{ position: "absolute", top: 100, left: 30, width: 12, height: 12, borderRadius: 6, backgroundColor: day.ink }} />
      <View style={{ position: "absolute", top: 82, right: 26, width: 12, height: 12, borderRadius: 6, backgroundColor: day.ink }} />
      <View style={{ position: "absolute", top: 62, left: 82, width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFFFFF" }} />
    </View>
  );
}

const s = StyleSheet.create({
  collageWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" },
  collage: { position: "absolute", top: 104, left: -150, width: 760, gap: 14, transform: [{ rotate: "-9deg" }] },
  line: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  card: { borderRadius: 30, padding: 18, justifyContent: "space-between" },
  inline: { flexDirection: "row", alignItems: "center", gap: 10 },
  small: { color: day.soft, fontSize: 13, fontWeight: "700", letterSpacing: 0.2 },
  big: { color: day.ink, fontFamily: font.title, fontSize: 19 },
  score: { fontFamily: font.display, fontSize: 38, lineHeight: 42 },
  pillDark: { backgroundColor: day.ink, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, alignSelf: "flex-start" },
  pillDarkText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  badge: { width: 44, height: 44, borderRadius: 22, backgroundColor: day.ink, alignItems: "center", justifyContent: "center" },
  header: { position: "absolute", left: 22, flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 12, backgroundColor: day.rim, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#FFFFFF", fontFamily: font.display, fontSize: 24, lineHeight: 28 },
  wordmark: { color: day.ink, fontFamily: font.display, fontSize: 24 },
  bottom: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 24 },
  headline: { color: day.ink, fontFamily: font.display, fontSize: 44, lineHeight: 48, letterSpacing: -1 },
  tagline: { color: day.soft, fontSize: 17, marginTop: 12, marginBottom: 36 },
  cta: {
    backgroundColor: day.ink, borderRadius: 999, paddingVertical: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  ctaText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  fine: { color: day.soft, fontSize: 13, textAlign: "center", marginTop: 14 },
});

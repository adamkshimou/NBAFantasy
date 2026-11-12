import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/bricolage-grotesque";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TeamsProvider } from "../teams";
import { c } from "../theme";

export default function RootLayout() {
  const [loaded] = useFonts({ BricolageGrotesque_600SemiBold, BricolageGrotesque_800ExtraBold });
  if (!loaded) return null;
  return (
    <TeamsProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
    </TeamsProvider>
  );
}

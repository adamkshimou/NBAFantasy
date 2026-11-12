import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { c } from "../../theme";

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (on: IconName, off: IconName) =>
  ({ focused }: { focused: boolean }) =>
    <Ionicons name={focused ? on : off} size={24} color={focused ? c.text : c.muted} />;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.text,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.line,
          height: 72 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 12,
        },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home", "home-outline") }} />
      <Tabs.Screen name="trades" options={{ title: "Trades", tabBarIcon: icon("swap-horizontal", "swap-horizontal-outline") }} />
      <Tabs.Screen name="waivers" options={{ title: "Waivers", tabBarIcon: icon("person-add", "person-add-outline") }} />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add team",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center",
                backgroundColor: focused ? c.accent : c.raised,
              }}
            >
              <Ionicons name="add" size={22} color={focused ? c.ink : c.text} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

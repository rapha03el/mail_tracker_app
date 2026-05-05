import { Stack, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { HeaderMenu } from "@/components/HeaderMenu";
import { IconSymbol } from "@/components/ui/icon-symbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Mail Tracker",
          headerTitleAlign: "center",
          headerRight: () => <HeaderMenu />,
        }}
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#333333", // ← Dark Gray (Selected)
          tabBarInactiveTintColor: "#888888", // Optional: lighter gray when not selected

          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: { position: "absolute" },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Pending",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="tray.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="clock.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

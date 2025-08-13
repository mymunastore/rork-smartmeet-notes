import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Platform, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { NotesProvider } from "@/hooks/use-notes-store";
import { UserProfileProvider } from "@/hooks/use-user-profile";
import { useBackgroundProcessing } from "@/hooks/use-background-processing";
import { ChatProvider } from "@/hooks/use-chat-store";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  useBackgroundProcessing();
  const { colors, isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="logo-intro" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="note/[id]"
        options={{
          title: "Note Details",
          headerTintColor: colors.primary,
        }}
      />
      <Stack.Screen
        name="recording"
        options={{
          title: "Recording",
          headerTintColor: colors.primary,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="two-factor"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

function ThemedContainer() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (Platform.OS !== "web") {
      SystemUI.setBackgroundColorAsync(colors.background).catch((e) =>
        console.warn("SystemUI bg set failed", e)
      );
    }
  }, [colors.background]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={[styles.flex, { backgroundColor: colors.background }]} testID="app-root-bg">
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.background} />
        <RootLayoutNav />
      </View>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <UserProfileProvider>
              <NotesProvider>
                <ChatProvider>
                  <ThemedContainer />
                </ChatProvider>
              </NotesProvider>
            </UserProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
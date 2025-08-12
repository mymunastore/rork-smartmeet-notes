import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NotesProvider } from "@/hooks/use-notes-store";
import { UserProfileProvider } from "@/hooks/use-user-profile";
import { useBackgroundProcessing } from "@/hooks/use-background-processing";
import { ChatProvider } from "@/hooks/use-chat-store";
import { ThemeProvider } from "@/hooks/use-theme";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  // Initialize background processing
  useBackgroundProcessing();
  const { colors } = useTheme();
  
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
    }}>
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
          headerTintColor: "#4A6FFF",
        }} 
      />
      <Stack.Screen 
        name="recording" 
        options={{ 
          title: "Recording",
          headerTintColor: "#4A6FFF",
          presentation: "modal",
        }} 
      />
    </Stack>
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
          <UserProfileProvider>
            <NotesProvider>
              <ChatProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </ChatProvider>
            </NotesProvider>
          </UserProfileProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
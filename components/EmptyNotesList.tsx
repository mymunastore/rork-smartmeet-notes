import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "@/hooks/use-theme";

export default function EmptyNotesList() {
  const { colors } = useTheme();
  return (
    <View style={styles.container} testID="empty-notes-list">
      <View style={[styles.iconContainer, { backgroundColor: colors.nature.sky, shadowColor: colors.nature.sage }]}>
        <Text style={styles.emoji}>🌿</Text>
      </View>
      <Text style={[styles.title, { color: colors.primary }]}>Your nature journal awaits</Text>
      <Text style={[styles.subtitle, { color: colors.gray[600] }]}>
        🎙️ Tap the record button to start capturing your meetings and calls with AI-powered summaries
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
});
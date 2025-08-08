import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Colors from "@/constants/colors";

export default function EmptyNotesList() {
  return (
    <View style={styles.container} testID="empty-notes-list">
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>🌿</Text>
      </View>
      <Text style={styles.title}>Your nature journal awaits</Text>
      <Text style={styles.subtitle}>
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
    backgroundColor: Colors.light.nature.sky,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: Colors.light.nature.sage,
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
    color: Colors.light.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray[600],
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
});
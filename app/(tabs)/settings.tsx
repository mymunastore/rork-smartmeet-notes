import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, Switch, ScrollView, Alert } from "react-native";
import { Info, HelpCircle, Lock, Trash2, Activity, BarChart3, Palette } from "lucide-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { useTheme } from "@/hooks/use-theme";
import { useNotes } from "@/hooks/use-notes-store";
import backgroundProcessor from "@/utils/background-processor";
import performanceMonitor from "@/utils/performance-monitor";
import PerformanceDashboard from "@/components/PerformanceDashboard";
import ThemeSelector from "@/components/ThemeSelector";
import ColorSchemeSelector from "@/components/ColorSchemeSelector";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { notes, processingCount, completedNotes } = useNotes();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [autoTranscribeEnabled, setAutoTranscribeEnabled] = useState<boolean>(true);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState<boolean>(false);
  const [showThemeSettings, setShowThemeSettings] = useState<boolean>(false);
  
  const processingStatus = backgroundProcessor.getProcessingStatus();
  const performanceMetrics = performanceMonitor.getMetrics();
  
  const handleShowPerformanceMetrics = useCallback(() => {
    const metrics = Object.entries(performanceMetrics)
      .map(([key, data]) => `${key}: ${data.average.toFixed(2)}ms avg (${data.count} samples)`)
      .join('\n');
    
    Alert.alert(
      "Performance Metrics",
      metrics || "No metrics available yet",
      [{ text: "OK" }]
    );
  }, [performanceMetrics]);
  
  const handleClearAllNotes = useCallback(() => {
    Alert.alert(
      "Clear All Notes",
      "Are you sure you want to delete all notes? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            // In a real app, you would call a function to delete all notes
            Alert.alert("Notes Deleted", "All notes have been deleted.");
          },
        },
      ]
    );
  }, []);

  const handleAbout = useCallback(() => {
    Alert.alert(
      "About AI Note Taker",
      "Version 1.0.0\n\nAI Note Taker helps you record meetings and calls, then automatically generates summaries using AI technology.",
      [{ text: "OK" }]
    );
  }, []);

  const handleHelp = useCallback(() => {
    // In a real app, this would open a help center or documentation
    Alert.alert(
      "Help & Support",
      "For help and support, please visit our website or contact our support team.",
      [{ text: "OK" }]
    );
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} testID="settings-screen">
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>⚙️ Settings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.gray[600] }]}>Customize your SCRIBE experience</Text>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 Appearance</Text>
        
        <TouchableOpacity 
          style={[styles.button, { borderBottomColor: colors.gray[200] }]} 
          onPress={() => setShowThemeSettings(!showThemeSettings)}
          testID="theme-settings-button"
        >
          <Palette size={20} color={colors.primary} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Theme & Colors</Text>
        </TouchableOpacity>
        
        {showThemeSettings && (
          <View style={[styles.themeContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemeSelector testID="theme-selector" />
            <ColorSchemeSelector testID="color-scheme-selector" />
          </View>
        )}
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🌱 Preferences</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.gray[200] }]}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.settingDescription, { color: colors.gray[600] }]}>
              Receive notifications when processing is complete
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.gray[300], true: colors.primary }}
            thumbColor="#fff"
            testID="notifications-switch"
          />
        </View>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.gray[200] }]}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Auto-Transcribe</Text>
            <Text style={[styles.settingDescription, { color: colors.gray[600] }]}>
              Automatically transcribe recordings when completed
            </Text>
          </View>
          <Switch
            value={autoTranscribeEnabled}
            onValueChange={setAutoTranscribeEnabled}
            trackColor={{ false: colors.gray[300], true: colors.primary }}
            thumbColor="#fff"
            testID="auto-transcribe-switch"
          />
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📁 Data</Text>
        
        <View style={[styles.infoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.gray[700] }]}>
            {notes.length} notes stored • {completedNotes.length} completed • {processingCount} processing
          </Text>
          <Text style={[styles.infoText, { color: colors.gray[700] }]}>
            {notes.reduce((acc, note) => acc + note.duration, 0).toFixed(0)} seconds of audio recorded
          </Text>
          <Text style={[styles.infoText, { color: colors.gray[700] }]}>
            Processing: {processingStatus.currentProcessing}/{processingStatus.maxConcurrent} slots used
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton, { backgroundColor: colors.error }]} 
          onPress={handleClearAllNotes}
          testID="clear-notes-button"
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Clear All Notes</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Performance</Text>
        
        <TouchableOpacity 
          style={[styles.button, { borderBottomColor: colors.gray[200] }]} 
          onPress={handleShowPerformanceMetrics}
          testID="performance-button"
        >
          <Activity size={20} color={colors.secondary} />
          <Text style={[styles.buttonText, { color: colors.text }]}>View Performance Metrics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { borderBottomColor: colors.gray[200] }]} 
          onPress={() => setShowPerformanceDashboard(true)}
          testID="performance-dashboard-button"
        >
          <BarChart3 size={20} color={colors.primary} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Performance Dashboard</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>ℹ️ About</Text>
        
        <TouchableOpacity 
          style={[styles.button, { borderBottomColor: colors.gray[200] }]} 
          onPress={handleAbout}
          testID="about-button"
        >
          <Info size={20} color={colors.accent} />
          <Text style={[styles.buttonText, { color: colors.text }]}>About AI Note Taker</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { borderBottomColor: colors.gray[200] }]} 
          onPress={handleHelp}
          testID="help-button"
        >
          <HelpCircle size={20} color={colors.secondary} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { borderBottomColor: colors.gray[200] }]}
          onPress={() => {
            // In a real app, this would open the privacy policy
            Alert.alert("Privacy Policy", "This would open the privacy policy in a real app.");
          }}
          testID="privacy-button"
        >
          <Lock size={20} color={colors.accent} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
      
      <PerformanceDashboard 
        visible={showPerformanceDashboard}
        onClose={() => setShowPerformanceDashboard(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 16,
  },
  themeContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center" as const,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  dangerButton: {
    borderRadius: 12,
    padding: 16,
    justifyContent: "center" as const,
    borderBottomWidth: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
});
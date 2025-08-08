import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, Switch, ScrollView, Alert } from "react-native";
import { Info, HelpCircle, Lock, Trash2, Activity, BarChart3 } from "lucide-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import Colors from "@/constants/colors";
import { useNotes } from "@/hooks/use-notes-store";
import backgroundProcessor from "@/utils/background-processor";
import performanceMonitor from "@/utils/performance-monitor";
import PerformanceDashboard from "@/components/PerformanceDashboard";

export default function SettingsScreen() {
  const { notes, processingCount, completedNotes } = useNotes();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [autoTranscribeEnabled, setAutoTranscribeEnabled] = useState<boolean>(true);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState<boolean>(false);
  
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
    <ScrollView style={styles.container} testID="settings-screen">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your SCRIBE experience</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌱 Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications when processing is complete
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.light.gray[300], true: Colors.light.nature.sage }}
            thumbColor="#fff"
            testID="notifications-switch"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Auto-Transcribe</Text>
            <Text style={styles.settingDescription}>
              Automatically transcribe recordings when completed
            </Text>
          </View>
          <Switch
            value={autoTranscribeEnabled}
            onValueChange={setAutoTranscribeEnabled}
            trackColor={{ false: Colors.light.gray[300], true: Colors.light.nature.sage }}
            thumbColor="#fff"
            testID="auto-transcribe-switch"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📁 Data</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {notes.length} notes stored • {completedNotes.length} completed • {processingCount} processing
          </Text>
          <Text style={styles.infoText}>
            {notes.reduce((acc, note) => acc + note.duration, 0).toFixed(0)} seconds of audio recorded
          </Text>
          <Text style={styles.infoText}>
            Processing: {processingStatus.currentProcessing}/{processingStatus.maxConcurrent} slots used
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={handleClearAllNotes}
          testID="clear-notes-button"
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Clear All Notes</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Performance</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleShowPerformanceMetrics}
          testID="performance-button"
        >
          <Activity size={20} color={Colors.light.nature.ocean} />
          <Text style={styles.buttonText}>View Performance Metrics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setShowPerformanceDashboard(true)}
          testID="performance-dashboard-button"
        >
          <BarChart3 size={20} color={Colors.light.primary} />
          <Text style={styles.buttonText}>Performance Dashboard</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ About</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAbout}
          testID="about-button"
        >
          <Info size={20} color={Colors.light.nature.moss} />
          <Text style={styles.buttonText}>About AI Note Taker</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleHelp}
          testID="help-button"
        >
          <HelpCircle size={20} color={Colors.light.nature.lavender} />
          <Text style={styles.buttonText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            // In a real app, this would open the privacy policy
            Alert.alert("Privacy Policy", "This would open the privacy policy in a real app.");
          }}
          testID="privacy-button"
        >
          <Lock size={20} color={Colors.light.nature.earth} />
          <Text style={styles.buttonText}>Privacy Policy</Text>
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
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.gray[600],
    lineHeight: 22,
  },
  section: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: Colors.light.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.gray[600],
  },
  infoContainer: {
    backgroundColor: Colors.light.nature.sand,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.gray[700],
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  buttonText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: Colors.light.nature.coral,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    borderBottomWidth: 0,
    shadowColor: Colors.light.nature.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
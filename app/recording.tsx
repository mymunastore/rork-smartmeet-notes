import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  Modal
} from "react-native";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";

import { Waves, Settings, Tag, Folder, Star } from "lucide-react-native";

import Colors from "@/constants/colors";
import RecordButton from "@/components/RecordButton";
import RealTimeTranscription from "@/components/RealTimeTranscription";
import { useNotes } from "@/hooks/use-notes-store";
import audioRecorder from "@/utils/audio-recorder";
import backgroundProcessor from "@/utils/background-processor";

export default function RecordingScreen() {
  const router = useRouter();
  const { addNote, updateNote, projects } = useNotes();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [realTimeTranscript, setRealTimeTranscript] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [meetingType, setMeetingType] = useState<'meeting' | 'call' | 'interview' | 'lecture' | 'other'>('meeting');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isStarred, setIsStarred] = useState<boolean>(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isRecording) {
      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      
      // Start the pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop the animation
      pulseAnim.setValue(1);
    }
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, pulseAnim]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const handleRecordPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };
  
  const startRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please check permissions.");
    }
  };
  
  const stopRecording = async () => {
    try {
      const result = await audioRecorder.stopRecording();
      setIsRecording(false);
      setRecordingUri(result.uri);
      
      // If on web, stop all tracks in the MediaStream
      if (Platform.OS === "web") {
        // This would be implemented for web-specific recording
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording.");
    }
  };
  
  const handleSave = async () => {
    if (!recordingUri) {
      Alert.alert("Error", "No recording to save.");
      return;
    }
    
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your recording.");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create a new note with the recording and enhanced metadata
      const newNote = {
        id: Date.now().toString(),
        title: title.trim(),
        recordingUri,
        duration: recordingDuration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isProcessing: true,
        projectId: selectedProject,
        tags,
        meetingType,
        priority,
        isStarred,
        realTimeTranscript: realTimeTranscript || undefined,
      };
      
      // Add the note to storage
      await addNote(newNote);
      
      // Navigate back to the notes list
      router.back();
      
      // Process the recording in the background using optimized processor
      backgroundProcessor.processNote(newNote, updateNote);
    } catch (error) {
      console.error("Failed to save recording:", error);
      setIsProcessing(false);
      Alert.alert("Error", "Failed to save recording.");
    }
  };
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const meetingTypes = [
    { value: 'meeting' as const, label: '🤝 Meeting', icon: '🤝' },
    { value: 'call' as const, label: '📞 Call', icon: '📞' },
    { value: 'interview' as const, label: '💼 Interview', icon: '💼' },
    { value: 'lecture' as const, label: '🎓 Lecture', icon: '🎓' },
    { value: 'other' as const, label: '📝 Other', icon: '📝' },
  ];
  
  const priorities = [
    { value: 'low' as const, label: 'Low', color: Colors.light.gray[400] },
    { value: 'medium' as const, label: 'Medium', color: Colors.light.nature.sage },
    { value: 'high' as const, label: 'High', color: Colors.light.nature.coral },
  ];
  

  
  const handleCancel = () => {
    if (isRecording) {
      Alert.alert(
        "Cancel Recording",
        "Are you sure you want to cancel this recording?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              if (isRecording) {
                try {
                  await audioRecorder.stopRecording();
                } catch (error) {
                  console.error("Error stopping recording:", error);
                }
              }
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };
  
  return (
    <ScrollView style={styles.container} testID="recording-screen">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {isRecording ? "🎙️ Recording in progress..." : "🌿 New Recording"}
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
            disabled={isRecording}
          >
            <Settings size={20} color={Colors.light.gray[600]} />
          </TouchableOpacity>
        </View>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>LIVE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(recordingDuration)}</Text>
        {isRecording && (
          <View style={styles.waveformContainer}>
            <Animated.View
              style={[
                styles.waveformIconContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Waves size={32} color={Colors.light.nature.ocean} />
            </Animated.View>
          </View>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="✏️ Enter recording title..."
          placeholderTextColor={Colors.light.gray[500]}
          value={title}
          onChangeText={setTitle}
          editable={!isRecording && !isProcessing}
          testID="recording-title-input"
        />
        
        {/* Quick metadata display */}
        <View style={styles.metadataPreview}>
          {selectedProject && (
            <View style={styles.metadataItem}>
              <Folder size={14} color={Colors.light.gray[600]} />
              <Text style={styles.metadataText}>
                {projects.find(p => p.id === selectedProject)?.name || 'Project'}
              </Text>
            </View>
          )}
          {tags.length > 0 && (
            <View style={styles.metadataItem}>
              <Tag size={14} color={Colors.light.gray[600]} />
              <Text style={styles.metadataText}>{tags.length} tags</Text>
            </View>
          )}
          {isStarred && (
            <View style={styles.metadataItem}>
              <Star size={14} color={Colors.light.nature.coral} fill={Colors.light.nature.coral} />
              <Text style={styles.metadataText}>Starred</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Real-time transcription */}
      <RealTimeTranscription 
        isRecording={isRecording}
        onTranscriptUpdate={setRealTimeTranscript}
      />
      
      <View style={styles.controlsContainer}>
        <RecordButton isRecording={isRecording} onPress={handleRecordPress} />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isProcessing}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        {recordingUri && !isRecording && (
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isProcessing}
            testID="save-button"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚙️ Recording Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Project Selection */}
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>📁 Project</Text>
              <View style={styles.projectOptions}>
                <TouchableOpacity
                  style={[
                    styles.projectOption,
                    !selectedProject && styles.projectOptionSelected
                  ]}
                  onPress={() => setSelectedProject(undefined)}
                >
                  <Text style={[
                    styles.projectOptionText,
                    !selectedProject && styles.projectOptionTextSelected
                  ]}>No Project</Text>
                </TouchableOpacity>
                
                {projects.map(project => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectOption,
                      selectedProject === project.id && styles.projectOptionSelected
                    ]}
                    onPress={() => setSelectedProject(project.id)}
                  >
                    <View style={[styles.projectColor, { backgroundColor: project.color }]} />
                    <Text style={[
                      styles.projectOptionText,
                      selectedProject === project.id && styles.projectOptionTextSelected
                    ]}>{project.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Tags */}
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>🏷️ Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add a tag..."
                  placeholderTextColor={Colors.light.gray[500]}
                  value={newTag}
                  onChangeText={setNewTag}
                  onSubmitEditing={addTag}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                  <Text style={styles.addTagText}>Add</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsList}>
                {tags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tagChip}
                    onPress={() => removeTag(tag)}
                  >
                    <Text style={styles.tagChipText}>{tag}</Text>
                    <Text style={styles.tagRemove}>×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Meeting Type */}
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>📝 Meeting Type</Text>
              <View style={styles.typeOptions}>
                {meetingTypes.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      meetingType === type.value && styles.typeOptionSelected
                    ]}
                    onPress={() => setMeetingType(type.value)}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      meetingType === type.value && styles.typeOptionTextSelected
                    ]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Priority */}
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>⚡ Priority</Text>
              <View style={styles.priorityOptions}>
                {priorities.map(priorityOption => (
                  <TouchableOpacity
                    key={priorityOption.value}
                    style={[
                      styles.priorityOption,
                      priority === priorityOption.value && styles.priorityOptionSelected
                    ]}
                    onPress={() => setPriority(priorityOption.value)}
                  >
                    <View style={[styles.priorityIndicator, { backgroundColor: priorityOption.color }]} />
                    <Text style={[
                      styles.priorityOptionText,
                      priority === priorityOption.value && styles.priorityOptionTextSelected
                    ]}>{priorityOption.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Starred */}
            <View style={styles.settingSection}>
              <TouchableOpacity
                style={styles.starredOption}
                onPress={() => setIsStarred(!isStarred)}
              >
                <Star 
                  size={20} 
                  color={isStarred ? Colors.light.nature.coral : Colors.light.gray[500]} 
                  fill={isStarred ? Colors.light.nature.coral : 'none'}
                />
                <Text style={styles.starredText}>Mark as starred</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.nature.coral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  recordingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  timer: {
    fontSize: 64,
    fontWeight: "300",
    color: Colors.light.text,
    fontVariant: ["tabular-nums"],
  },
  waveformContainer: {
    marginTop: 16,
  },
  waveformIconContainer: {
    padding: 8,
  },
  inputContainer: {
    marginBottom: 48,
  },
  input: {
    backgroundColor: Colors.light.nature.sand,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: Colors.light.gray[300],
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.gray[700],
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  metadataPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.nature.sky,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    marginBottom: 32,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  projectOptions: {
    gap: 8,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  projectOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  projectOptionText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  projectOptionTextSelected: {
    color: '#fff',
  },
  projectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addTagButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.nature.sage,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  tagRemove: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  typeOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  priorityOptions: {
    gap: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  priorityOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  priorityOptionText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  priorityOptionTextSelected: {
    color: '#fff',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  starredOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  starredText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
});
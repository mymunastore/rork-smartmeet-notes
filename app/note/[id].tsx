import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Audio } from "expo-av";
import { Play, Pause, Share2, Trash2 } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useNotes } from "@/hooks/use-notes-store";
import TranslationView from "@/components/TranslationView";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, deleteNote } = useNotes();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const note = notes.find((n) => n.id === id);
  
  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Note not found</Text>
      </View>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };
  
  const handlePlayPause = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else if (note.recordingUri) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: note.recordingUri },
          { shouldPlay: true }
        );
        
        setSound(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
      }
    } catch (error) {
      console.error("Failed to play audio:", error);
      Alert.alert("Error", "Failed to play audio recording.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShare = async () => {
    try {
      let message = `${note.title}\n\n`;
      
      if (note.summary) {
        message += `Summary:\n${note.summary}\n\n`;
      }
      
      if (note.transcript) {
        message += `Transcript:\n${note.transcript}`;
      }
      
      await Share.share({
        message,
        title: note.title,
      });
    } catch (error) {
      console.error("Failed to share note:", error);
      Alert.alert("Error", "Failed to share note.");
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (sound) {
                await sound.unloadAsync();
              }
              await deleteNote(note.id);
              router.back();
            } catch (error) {
              console.error("Failed to delete note:", error);
              Alert.alert("Error", "Failed to delete note.");
            }
          },
        },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container} testID="note-detail-screen">
      <View style={styles.header}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>{formatDate(note.createdAt)}</Text>
      </View>
      
      {note.recordingUri && (
        <View style={styles.audioPlayer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            disabled={isLoading}
            testID="play-pause-button"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : isPlaying ? (
              <Pause size={24} color="#fff" />
            ) : (
              <Play size={24} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.audioText}>
            {isPlaying ? "Playing audio..." : "Play recording"}
          </Text>
        </View>
      )}
      
      {note.isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.processingText}>
            Processing your recording...
          </Text>
        </View>
      ) : note.processingError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Processing Failed</Text>
          <Text style={styles.errorMessage}>{note.processingError}</Text>
        </View>
      ) : (
        <>
          {/* Translation View - Show if translated */}
          {note.isTranslated && (
            <View style={styles.section}>
              <TranslationView
                originalText={note.originalText}
                translatedText={note.translatedText}
                detectedLanguage={note.detectedLanguage}
                isTranslated={note.isTranslated}
                confidence={note.confidence}
              />
            </View>
          )}
          
          {note.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Summary</Text>
              <View style={styles.card}>
                <Text style={styles.summaryText}>{note.summary}</Text>
              </View>
            </View>
          )}
          
          {note.transcript && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📝 {note.isTranslated ? 'English Transcript' : 'Transcript'}
              </Text>
              <View style={styles.card}>
                <Text style={styles.transcriptText}>{note.transcript}</Text>
              </View>
            </View>
          )}
        </>
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          testID="share-button"
        >
          <Share2 size={20} color={Colors.light.primary} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          testID="delete-button"
        >
          <Trash2 size={20} color={Colors.light.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: Colors.light.gray[600],
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.light.gray[100],
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  audioText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  processingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    fontSize: 16,
    color: Colors.light.gray[600],
    marginTop: 16,
    textAlign: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.gray[700],
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  shareButton: {
    backgroundColor: Colors.light.gray[100],
  },
  shareButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: Colors.light.gray[100],
  },
  deleteButtonText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.error,
    textAlign: "center",
    marginTop: 32,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: Colors.light.error + "10",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.error + "30",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.error,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.light.error,
    lineHeight: 20,
  },
});
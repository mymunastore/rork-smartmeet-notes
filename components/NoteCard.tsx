import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FileText } from "lucide-react-native";
import React, { memo } from "react";
import Colors from "@/constants/colors";
import { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
}

const NoteCard = memo(function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePress = () => {
    router.push(`/note/${note.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      testID={`note-card-${note.id}`}
    >
      <View style={styles.iconContainer}>
        <FileText color={Colors.light.nature.ocean} size={24} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.date}>{formatDate(note.createdAt)}</Text>
          <View style={styles.separator} />
          <Text style={styles.duration}>{formatDuration(note.duration)}</Text>
          {note.isProcessing && (
            <View style={styles.processingBadge}>
              <Text style={styles.processingText}>���� Processing</Text>
            </View>
          )}
          {note.processingError && (
            <View style={styles.errorBadge}>
              <Text style={styles.errorText}>⚠️ Error</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default NoteCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.nature.sage,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.nature.sky,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  date: {
    fontSize: 13,
    color: Colors.light.gray[600],
    fontWeight: "500",
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.nature.sage,
    marginHorizontal: 8,
  },
  duration: {
    fontSize: 13,
    color: Colors.light.gray[600],
    fontWeight: "500",
  },
  processingBadge: {
    backgroundColor: Colors.light.nature.lavender,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  processingText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  errorBadge: {
    backgroundColor: Colors.light.nature.coral,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
});
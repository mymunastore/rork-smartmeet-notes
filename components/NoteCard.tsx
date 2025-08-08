import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FileText, Star, Clock, AlertCircle } from "lucide-react-native";
import React, { memo, useCallback, useMemo } from "react";
import Colors from "@/constants/colors";
import { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
}

const NoteCard = memo(function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();
  
  // Memoize formatted values to prevent recalculation
  const formattedDate = useMemo(() => {
    const date = new Date(note.createdAt);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [note.createdAt]);

  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(note.duration / 60);
    const remainingSeconds = Math.floor(note.duration % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, [note.duration]);

  const handlePress = useCallback(() => {
    router.push(`/note/${note.id}`);
  }, [router, note.id]);
  
  // Determine card status and styling
  const cardStatus = useMemo(() => {
    if (note.processingError) return 'error';
    if (note.isProcessing) return 'processing';
    if (note.isStarred) return 'starred';
    return 'normal';
  }, [note.processingError, note.isProcessing, note.isStarred]);
  
  const statusIcon = useMemo(() => {
    switch (cardStatus) {
      case 'error':
        return <AlertCircle color={Colors.light.error} size={16} />;
      case 'processing':
        return <Clock color={Colors.light.nature.coral} size={16} />;
      case 'starred':
        return <Star color={Colors.light.accent} size={16} fill={Colors.light.accent} />;
      default:
        return null;
    }
  }, [cardStatus]);

  const cardStyle = useMemo(() => [
    styles.card,
    cardStatus === 'starred' && styles.starredCard,
    cardStatus === 'error' && styles.errorCard,
    cardStatus === 'processing' && styles.processingCard,
  ], [cardStatus]);

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
      testID={`note-card-${note.id}`}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <FileText color={Colors.light.nature.ocean} size={24} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          {statusIcon && (
            <View style={styles.statusIconContainer}>
              {statusIcon}
            </View>
          )}
        </View>
        
        <View style={styles.metaContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <View style={styles.separator} />
          <Text style={styles.duration}>{formattedDuration}</Text>
          {note.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagCount}>+{note.tags.length}</Text>
            </View>
          )}
        </View>
        
        {/* Progress indicator for processing notes */}
        {note.isProcessing && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>Processing...</Text>
          </View>
        )}
        
        {/* Error message for failed processing */}
        {note.processingError && (
          <Text style={styles.errorMessage} numberOfLines={1}>
            {note.processingError}
          </Text>
        )}
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
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.nature.sage,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  starredCard: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.nature.sand,
  },
  errorCard: {
    borderColor: Colors.light.error,
    backgroundColor: '#FFF5F5',
  },
  processingCard: {
    borderColor: Colors.light.nature.coral,
    backgroundColor: '#FFF9F5',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  statusIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
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
  tagsContainer: {
    backgroundColor: Colors.light.nature.sage,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  tagCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
    gap: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.light.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.nature.coral,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: Colors.light.nature.coral,
    fontWeight: '500',
  },
  errorMessage: {
    fontSize: 11,
    color: Colors.light.error,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FileText, Star, Clock, AlertCircle, Languages, Zap } from "lucide-react-native";
import React, { memo, useCallback, useMemo } from "react";
import Colors from "@/constants/colors";
import { Note } from "@/types/note";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { LinearGradient } from "expo-linear-gradient";

interface NoteCardProps {
  note: Note;
}

const NoteCard = memo(function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();
  
  // Memoize formatted values to prevent recalculation
  const formattedDate = useMemo(() => {
    const date = new Date(note.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
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
  
  // Memoize preview text for better performance
  const previewText = useMemo(() => {
    if (note.summary) {
      return note.summary.substring(0, 120) + (note.summary.length > 120 ? '...' : '');
    }
    if (note.transcript) {
      return note.transcript.substring(0, 120) + (note.transcript.length > 120 ? '...' : '');
    }
    return 'Processing...';
  }, [note.summary, note.transcript]);
  
  // Memoize priority color
  const priorityColor = useMemo(() => {
    switch (note.priority) {
      case 'high': return Colors.light.nature.coral;
      case 'medium': return Colors.light.nature.sage;
      case 'low': return Colors.light.gray[400];
      default: return Colors.light.nature.sage;
    }
  }, [note.priority]);
  
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
      activeOpacity={0.8}
    >
      {/* Priority indicator */}
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
      
      <View style={styles.iconContainer}>
        {note.isStarred ? (
          <LinearGradient
            colors={[Colors.light.accent, Colors.light.nature.coral]}
            style={styles.iconGradient}
          >
            <Star color="#fff" size={20} fill="#fff" />
          </LinearGradient>
        ) : (
          <FileText color={Colors.light.nature.ocean} size={24} />
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          <View style={styles.statusContainer}>
            {note.priority === 'high' && (
              <Zap size={14} color={Colors.light.nature.coral} fill={Colors.light.nature.coral} />
            )}
            {statusIcon && <View>{statusIcon}</View>}
          </View>
        </View>
        
        {/* Preview text */}
        <Text style={styles.previewText} numberOfLines={2}>
          {previewText}
        </Text>
        
        <View style={styles.metaContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <View style={styles.separator} />
          <Text style={styles.duration}>{formattedDuration}</Text>
          
          {/* Tags indicator */}
          {note.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagCount}>{note.tags.length}</Text>
            </View>
          )}
          
          {/* Translation indicator */}
          {note.isTranslated && note.detectedLanguage && (
            <View style={styles.translationIndicator}>
              <Languages size={10} color={"#fff"} />
              <Text style={styles.translationText}>
                {SUPPORTED_LANGUAGES.find(lang => lang.code === note.detectedLanguage)?.flag || '🌐'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Enhanced progress indicator for processing notes */}
        {note.isProcessing && (
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={[Colors.light.nature.coral, Colors.light.accent]}
              style={styles.progressBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={[styles.progressFill, { width: '70%' }]} />
            </LinearGradient>
            <Text style={styles.progressText}>AI Processing...</Text>
          </View>
        )}
        
        {/* Error message for failed processing */}
        {note.processingError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={12} color={Colors.light.error} />
            <Text style={styles.errorMessage} numberOfLines={1}>
              {note.processingError}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default NoteCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.nature.sage,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
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
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.light.nature.sky,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginLeft: 4,
  },
  iconGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: Colors.light.gray[600],
    lineHeight: 20,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginTop: 12,
    gap: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.nature.coral,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: Colors.light.error,
    fontStyle: 'italic',
    flex: 1,
  },
  translationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.nature.sage,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
    marginLeft: 8,
  },
  translationText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
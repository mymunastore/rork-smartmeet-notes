import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FileText, Star, Clock, AlertCircle, Languages, Zap } from "lucide-react-native";
import React, { memo, useCallback, useMemo } from "react";
import { Note } from "@/types/note";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/use-theme";

interface NoteCardProps {
  note: Note;
}

const NoteCard = memo(function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
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
      case 'high': return colors.nature.coral;
      case 'medium': return colors.nature.sage;
      case 'low': return colors.gray[400];
      default: return colors.nature.sage;
    }
  }, [note.priority, colors]);
  
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
        return <AlertCircle color={colors.error} size={16} />;
      case 'processing':
        return <Clock color={colors.nature.coral} size={16} />;
      case 'starred':
        return <Star color={colors.accent} size={16} fill={colors.accent} />;
      default:
        return null;
    }
  }, [cardStatus, colors]);

  const cardStyle = useMemo(() => [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.nature.sage },
    cardStatus === 'starred' && { borderColor: colors.accent, backgroundColor: colors.nature.sand },
    cardStatus === 'error' && { borderColor: colors.error, backgroundColor: isDark ? colors.gray[800] : '#FFF5F5' },
    cardStatus === 'processing' && { borderColor: colors.nature.coral, backgroundColor: isDark ? colors.gray[800] : '#FFF9F5' },
  ], [cardStatus, colors, isDark]);

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
            colors={[colors.accent, colors.nature.coral]}
            style={styles.iconGradient}
          >
            <Star color="#fff" size={20} fill="#fff" />
          </LinearGradient>
        ) : (
          <FileText color={colors.nature.ocean} size={24} />
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {note.title}
          </Text>
          <View style={styles.statusContainer}>
            {note.priority === 'high' && (
              <Zap size={14} color={colors.nature.coral} fill={colors.nature.coral} />
            )}
            {statusIcon}
          </View>
        </View>
        
        {/* Preview text */}
        <Text style={[styles.previewText, { color: colors.gray[600] }]} numberOfLines={2}>
          {previewText}
        </Text>
        
        <View style={styles.metaContainer}>
          <Text style={[styles.date, { color: colors.gray[600] }]}>{formattedDate}</Text>
          <View style={[styles.separator, { backgroundColor: colors.nature.sage }]} />
          <Text style={[styles.duration, { color: colors.gray[600] }]}>{formattedDuration}</Text>
          
          {/* Tags indicator */}
          {note.tags.length > 0 && (
            <View style={[styles.tagsContainer, { backgroundColor: colors.nature.sage }]}>
              <Text style={styles.tagCount}>{note.tags.length}</Text>
            </View>
          )}
          
          {/* Translation indicator */}
          {note.isTranslated && note.detectedLanguage && (
            <View style={[styles.translationIndicator, { backgroundColor: colors.nature.sage }]}>
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
              colors={[colors.nature.coral, colors.accent]}
              style={styles.progressBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={[styles.progressFill, { width: '70%' }]} />
            </LinearGradient>
            <Text style={[styles.progressText, { color: colors.nature.coral }]}>AI Processing...</Text>
          </View>
        )}
        
        {/* Error message for failed processing */}
        {note.processingError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={12} color={colors.error} />
            <Text style={[styles.errorMessage, { color: colors.error }]} numberOfLines={1}>
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
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

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
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
    flex: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
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
    fontWeight: "500",
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  duration: {
    fontSize: 13,
    fontWeight: "500",
  },
  tagsContainer: {
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
    fontStyle: 'italic',
    flex: 1,
  },
  translationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
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
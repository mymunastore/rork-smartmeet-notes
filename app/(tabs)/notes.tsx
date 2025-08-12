import { useRouter } from "expo-router";
import React, { useState, useMemo, useCallback, useRef } from "react";
import { 
  ActivityIndicator, 
  StyleSheet, 
  Text, 
  View,
  RefreshControl,
  Animated,
  Platform
} from "react-native";
import { Plus, TrendingUp, Zap } from "lucide-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { useNotes } from "@/hooks/use-notes-store";
import NoteCard from "@/components/NoteCard";
import EmptyNotesList from "@/components/EmptyNotesList";
import AdvancedSearch from "@/components/AdvancedSearch";

export default function NotesScreen() {
  const router = useRouter();
  const { notes, isLoading, processingCount, searchNotes, completedNotes, starredNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<{
    projectId?: string;
    tags?: string[];
    meetingType?: string;
    priority?: string;
    isStarred?: boolean;
  }>({});
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Memoized filtered notes using the enhanced search function
  const filteredNotes = useMemo(() => {
    return searchNotes(searchQuery, activeFilters);
  }, [searchNotes, searchQuery, activeFilters]);
  
  // Memoized statistics for better performance
  const notesStats = useMemo(() => {
    const total = notes.length;
    const completed = completedNotes.length;
    const starred = starredNotes.length;
    const processing = processingCount;
    
    return {
      total,
      completed,
      starred,
      processing,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [notes.length, completedNotes.length, starredNotes.length, processingCount]);

  const handleNewRecording = useCallback(() => {
    router.push("/recording");
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Add haptic feedback on mobile
    if (Platform.OS !== 'web') {
      try {
        const Haptics = await import('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    
    // Simulate refresh with actual data reload
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);
  
  const renderNoteCard = useCallback(({ item, index }: { item: typeof notes[0]; index: number }) => {
    return (
      <Animated.View
        style={{
          opacity: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0.95],
            extrapolate: 'clamp',
          }),
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [0, -2],
              extrapolate: 'clamp',
            })
          }]
        }}
      >
        <NoteCard note={item} />
      </Animated.View>
    );
  }, [scrollY]);
  
  const keyExtractor = useCallback((item: typeof notes[0]) => item.id, []);
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        Animated.timing(headerOpacity, {
          toValue: offsetY > 50 ? 0.8 : 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="notes-screen">
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={[Colors.light.background, 'rgba(247, 250, 252, 0.95)']}
          style={styles.headerGradient}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🌿 My Notes</Text>
            <View style={styles.badges}>
              <LinearGradient
                colors={[Colors.light.nature.sage, Colors.light.nature.ocean]}
                style={styles.natureBadge}
              >
                <Zap size={12} color="#fff" />
                <Text style={styles.natureBadgeText}>AI Powered</Text>
              </LinearGradient>
            </View>
          </View>
          
          {/* Enhanced Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notesStats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notesStats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notesStats.starred}</Text>
              <Text style={styles.statLabel}>Starred</Text>
            </View>
            {notesStats.processing > 0 && (
              <>
                <View style={styles.statSeparator} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.light.nature.coral }]}>
                    {notesStats.processing}
                  </Text>
                  <Text style={styles.statLabel}>Processing</Text>
                </View>
              </>
            )}
          </View>
          
          <Text style={styles.subtitle}>
            Your AI-powered meeting transcriptions and summaries
            {notesStats.completionRate > 0 && (
              <Text style={styles.completionText}>
                {' • '}{notesStats.completionRate.toFixed(0)}% completion rate
              </Text>
            )}
          </Text>
        </LinearGradient>
      </Animated.View>
      
      <AdvancedSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFiltersChange={setActiveFilters}
      />
      
      <Animated.FlatList
        data={filteredNotes}
        keyExtractor={keyExtractor}
        renderItem={renderNoteCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyNotesList />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
            progressBackgroundColor={Colors.light.background}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={8}
        initialNumToRender={6}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 120, // Updated height for new NoteCard design
          offset: 120 * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        testID="notes-list"
      />
      
      <Animated.View 
        style={[
          styles.fabContainer,
          {
            transform: [{
              scale: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0.9],
                extrapolate: 'clamp',
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewRecording}
          testID="new-recording-button"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.secondary]}
            style={styles.fabGradient}
          >
            <Plus color="#fff" size={28} />
            <TrendingUp 
              color="rgba(255,255,255,0.6)" 
              size={16} 
              style={styles.fabSecondaryIcon} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 8,
    zIndex: 10,
  },
  headerGradient: {
    padding: 20,
    paddingBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.light.primary,
    marginRight: 12,
  },
  natureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  natureBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.light.nature.sage,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.gray[600],
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statSeparator: {
    width: 1,
    height: 24,
    backgroundColor: Colors.light.border,
    marginHorizontal: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.gray[600],
    lineHeight: 20,
    textAlign: 'center',
  },
  completionText: {
    color: Colors.light.nature.sage,
    fontWeight: '600',
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 30,
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  fabSecondaryIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
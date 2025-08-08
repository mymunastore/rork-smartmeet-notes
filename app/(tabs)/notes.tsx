import { useRouter } from "expo-router";
import React, { useState, useMemo, useCallback } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  View,
  RefreshControl
} from "react-native";
import { Plus } from "lucide-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import Colors from "@/constants/colors";
import { useNotes } from "@/hooks/use-notes-store";
import NoteCard from "@/components/NoteCard";
import EmptyNotesList from "@/components/EmptyNotesList";
import AdvancedSearch from "@/components/AdvancedSearch";

export default function NotesScreen() {
  const router = useRouter();
  const { notes, isLoading, processingCount, searchNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<{
    projectId?: string;
    tags?: string[];
    meetingType?: string;
    priority?: string;
    isStarred?: boolean;
  }>({});

  // Memoized filtered notes using the enhanced search function
  const filteredNotes = useMemo(() => {
    return searchNotes(searchQuery, activeFilters);
  }, [searchNotes, searchQuery, activeFilters]);

  const handleNewRecording = useCallback(() => {
    router.push("/recording");
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // In a real app, you might want to reload notes from storage here
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const renderNoteCard = useCallback(({ item }: { item: typeof notes[0] }) => (
    <NoteCard note={item} />
  ), []);
  
  const keyExtractor = useCallback((item: typeof notes[0]) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="notes-screen">
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🌿 My Notes</Text>
          <View style={styles.natureBadge}>
            <Text style={styles.natureBadgeText}>AI Powered</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Your recorded meetings and summaries
          {processingCount > 0 && (
            <Text style={styles.processingText}> • {processingCount} processing</Text>
          )}
        </Text>
      </View>
      
      <AdvancedSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFiltersChange={setActiveFilters}
      />
      
      <FlatList
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
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        getItemLayout={(data, index) => ({
          length: 88, // Approximate height of NoteCard
          offset: 88 * index,
          index,
        })}
        testID="notes-list"
      />
      
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewRecording}
          testID="new-recording-button"
        >
          <Plus color="#fff" size={28} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.light.primary,
    marginRight: 12,
  },
  natureBadge: {
    backgroundColor: Colors.light.nature.sage,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  natureBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray[600],
    lineHeight: 22,
  },
  processingText: {
    color: Colors.light.nature.coral,
    fontWeight: "500",
  },
  listContent: {
    flexGrow: 1,
  },
  fabContainer: {
    position: "absolute",
    right: 24,
    bottom: 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
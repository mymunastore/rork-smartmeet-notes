import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Search, Filter, X, Star, Tag } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useNotes } from '@/hooks/use-notes-store';

interface AdvancedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: {
    projectId?: string;
    tags?: string[];
    meetingType?: string;
    priority?: string;
    isStarred?: boolean;
  }) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  searchQuery,
  onSearchChange,
  onFiltersChange,
}) => {
  const { projects, allTags } = useNotes();
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<{
    projectId?: string;
    tags: string[];
    meetingType?: string;
    priority?: string;
    isStarred?: boolean;
  }>({
    tags: [],
  });

  const handleFilterChange = useCallback((newFilters: typeof activeFilters) => {
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters = { tags: [] };
    setActiveFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const toggleTag = useCallback((tag: string) => {
    const newTags = activeFilters.tags.includes(tag)
      ? activeFilters.tags.filter(t => t !== tag)
      : [...activeFilters.tags, tag];
    
    handleFilterChange({ ...activeFilters, tags: newTags });
  }, [activeFilters, handleFilterChange]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.projectId) count++;
    if (activeFilters.tags.length > 0) count++;
    if (activeFilters.meetingType) count++;
    if (activeFilters.priority) count++;
    if (activeFilters.isStarred) count++;
    return count;
  };

  const meetingTypes = [
    { value: 'meeting', label: '🤝 Meeting' },
    { value: 'call', label: '📞 Call' },
    { value: 'interview', label: '💼 Interview' },
    { value: 'lecture', label: '🎓 Lecture' },
    { value: 'other', label: '📝 Other' },
  ];

  const priorities = [
    { value: 'high', label: 'High Priority', color: Colors.light.nature.coral },
    { value: 'medium', label: 'Medium Priority', color: Colors.light.nature.sage },
    { value: 'low', label: 'Low Priority', color: Colors.light.gray[400] },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.light.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes, transcripts, summaries..."
            placeholderTextColor={Colors.light.gray[500]}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              style={styles.clearButton}
            >
              <X size={16} color={Colors.light.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, getActiveFilterCount() > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={getActiveFilterCount() > 0 ? '#fff' : Colors.light.gray[600]} />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {activeFilters.projectId && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                📁 {projects.find(p => p.id === activeFilters.projectId)?.name || 'Project'}
              </Text>
              <TouchableOpacity
                onPress={() => handleFilterChange({ ...activeFilters, projectId: undefined })}
              >
                <X size={14} color={Colors.light.gray[600]} />
              </TouchableOpacity>
            </View>
          )}
          
          {activeFilters.tags.map(tag => (
            <View key={tag} style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>🏷️ {tag}</Text>
              <TouchableOpacity onPress={() => toggleTag(tag)}>
                <X size={14} color={Colors.light.gray[600]} />
              </TouchableOpacity>
            </View>
          ))}
          
          {activeFilters.meetingType && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                {meetingTypes.find(t => t.value === activeFilters.meetingType)?.label || 'Type'}
              </Text>
              <TouchableOpacity
                onPress={() => handleFilterChange({ ...activeFilters, meetingType: undefined })}
              >
                <X size={14} color={Colors.light.gray[600]} />
              </TouchableOpacity>
            </View>
          )}
          
          {activeFilters.priority && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>⚡ {activeFilters.priority}</Text>
              <TouchableOpacity
                onPress={() => handleFilterChange({ ...activeFilters, priority: undefined })}
              >
                <X size={14} color={Colors.light.gray[600]} />
              </TouchableOpacity>
            </View>
          )}
          
          {activeFilters.isStarred && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>⭐ Starred</Text>
              <TouchableOpacity
                onPress={() => handleFilterChange({ ...activeFilters, isStarred: undefined })}
              >
                <X size={14} color={Colors.light.gray[600]} />
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔍 Advanced Filters</Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.light.gray[600]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Projects Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>📁 Projects</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    !activeFilters.projectId && styles.filterOptionActive
                  ]}
                  onPress={() => handleFilterChange({ ...activeFilters, projectId: undefined })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    !activeFilters.projectId && styles.filterOptionTextActive
                  ]}>All Projects</Text>
                </TouchableOpacity>
                
                {projects.map(project => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.filterOption,
                      activeFilters.projectId === project.id && styles.filterOptionActive
                    ]}
                    onPress={() => handleFilterChange({ ...activeFilters, projectId: project.id })}
                  >
                    <View style={[styles.projectColor, { backgroundColor: project.color }]} />
                    <Text style={[
                      styles.filterOptionText,
                      activeFilters.projectId === project.id && styles.filterOptionTextActive
                    ]}>{project.name}</Text>
                    <Text style={styles.projectNoteCount}>({project.noteCount})</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>🏷️ Tags</Text>
              <View style={styles.tagContainer}>
                {allTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagChip,
                      activeFilters.tags.includes(tag) && styles.tagChipActive
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Tag size={14} color={activeFilters.tags.includes(tag) ? '#fff' : Colors.light.gray[600]} />
                    <Text style={[
                      styles.tagChipText,
                      activeFilters.tags.includes(tag) && styles.tagChipTextActive
                    ]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Meeting Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>📝 Meeting Type</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    !activeFilters.meetingType && styles.filterOptionActive
                  ]}
                  onPress={() => handleFilterChange({ ...activeFilters, meetingType: undefined })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    !activeFilters.meetingType && styles.filterOptionTextActive
                  ]}>All Types</Text>
                </TouchableOpacity>
                
                {meetingTypes.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.filterOption,
                      activeFilters.meetingType === type.value && styles.filterOptionActive
                    ]}
                    onPress={() => handleFilterChange({ ...activeFilters, meetingType: type.value })}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      activeFilters.meetingType === type.value && styles.filterOptionTextActive
                    ]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>⚡ Priority</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    !activeFilters.priority && styles.filterOptionActive
                  ]}
                  onPress={() => handleFilterChange({ ...activeFilters, priority: undefined })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    !activeFilters.priority && styles.filterOptionTextActive
                  ]}>All Priorities</Text>
                </TouchableOpacity>
                
                {priorities.map(priority => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.filterOption,
                      activeFilters.priority === priority.value && styles.filterOptionActive
                    ]}
                    onPress={() => handleFilterChange({ ...activeFilters, priority: priority.value })}
                  >
                    <View style={[styles.priorityIndicator, { backgroundColor: priority.color }]} />
                    <Text style={[
                      styles.filterOptionText,
                      activeFilters.priority === priority.value && styles.filterOptionTextActive
                    ]}>{priority.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Starred Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>⭐ Starred</Text>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  activeFilters.isStarred && styles.filterOptionActive
                ]}
                onPress={() => handleFilterChange({ 
                  ...activeFilters, 
                  isStarred: activeFilters.isStarred ? undefined : true 
                })}
              >
                <Star 
                  size={16} 
                  color={activeFilters.isStarred ? '#fff' : Colors.light.gray[600]} 
                  fill={activeFilters.isStarred ? '#fff' : 'none'}
                />
                <Text style={[
                  styles.filterOptionText,
                  activeFilters.isStarred && styles.filterOptionTextActive
                ]}>Show only starred notes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.light.nature.coral,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    marginTop: 12,
  },
  activeFiltersContent: {
    paddingHorizontal: 4,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.nature.sky,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500',
  },
  clearAllButton: {
    backgroundColor: Colors.light.nature.coral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  filterOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  projectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  projectNoteCount: {
    fontSize: 12,
    color: Colors.light.gray[500],
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  tagChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tagChipText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500',
  },
  tagChipTextActive: {
    color: '#fff',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  clearButtonText: {
    color: Colors.light.gray[700],
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedSearch;
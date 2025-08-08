import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Note, Project, NotificationSettings } from "@/types/note";
import { useUserProfile } from "@/hooks/use-user-profile";
import backgroundProcessor from "@/utils/background-processor";
import performanceMonitor from "@/utils/performance-monitor";
import cacheManager from "@/utils/cache-manager";
import { Alert, Platform } from "react-native";

const STORAGE_KEY = "ai-note-taker-notes";
const PROJECTS_STORAGE_KEY = "ai-note-taker-projects";
const SETTINGS_STORAGE_KEY = "ai-note-taker-settings";

export const [NotesProvider, useNotes] = createContextHook(() => {
  const { preferences } = useUserProfile();
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [processingQueue, setProcessingQueue] = useState<Set<string>>(new Set());
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    transcriptionComplete: true,
    summaryReady: true,
    processingError: true,
    dailyDigest: false,
    weeklyReport: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    performanceMonitor.startTimer('notes-load');
    
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cachedNotes = await cacheManager.get<Note[]>('notes-data');
      const cachedProjects = await cacheManager.get<Project[]>('projects-data');
      const cachedSettings = await cacheManager.get<NotificationSettings>('settings-data');
      
      if (cachedNotes && cachedProjects && cachedSettings) {
        console.log('📦 Loading data from cache');
        setNotes(cachedNotes);
        setProjects(cachedProjects);
        setNotificationSettings(cachedSettings);
        setIsLoading(false);
        performanceMonitor.endTimer('notes-load');
        return;
      }
      
      // Load from AsyncStorage if cache miss
      console.log('💾 Loading data from storage');
      const [storedNotes, storedProjects, storedSettings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(PROJECTS_STORAGE_KEY),
        AsyncStorage.getItem(SETTINGS_STORAGE_KEY)
      ]);
      
      // Process notes
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        // Migrate old notes to new format
        const migratedNotes = parsedNotes.map((note: any) => ({
          ...note,
          updatedAt: note.updatedAt || note.createdAt,
          tags: note.tags || [],
          isStarred: note.isStarred || false,
          meetingType: note.meetingType || 'other',
          priority: note.priority || 'medium',
        }));
        setNotes(migratedNotes);
        
        // Cache the processed notes
        await cacheManager.set('notes-data', migratedNotes, { ttl: 10 * 60 * 1000 }); // 10 minutes
        
        // Check for notes that were processing when app was closed
        const processingNotes = migratedNotes.filter((note: Note) => note.isProcessing);
        if (processingNotes.length > 0) {
          console.log(`🔄 Found ${processingNotes.length} notes that were processing`);
          processingNotes.forEach((note: Note) => {
            if (note.recordingUri && !note.transcript) {
              console.log(`▶️ Resuming processing for note: ${note.id}`);
              setProcessingQueue(prev => new Set([...prev, note.id]));
            }
          });
        }
      }
      
      // Process projects
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);
        await cacheManager.set('projects-data', parsedProjects, { ttl: 10 * 60 * 1000 });
      }
      
      // Process settings
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setNotificationSettings(parsedSettings);
        await cacheManager.set('settings-data', parsedSettings, { ttl: 10 * 60 * 1000 });
      }
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    } finally {
      setIsLoading(false);
      performanceMonitor.endTimer('notes-load');
    }
  }, []);

  const saveNotes = useCallback(async (updatedNotes: Note[]) => {
    try {
      // Optimize storage by removing large audio URIs for completed notes
      const optimizedNotes = updatedNotes.map(note => {
        if (!note.isProcessing && note.transcript && note.summary) {
          // Keep only essential data for completed notes
          const { recordingUri, ...essentialNote } = note;
          return essentialNote;
        }
        return note;
      });
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(optimizedNotes));
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  }, []);

  const addNote = useCallback(async (note: Note) => {
    const noteWithDefaults = {
      ...note,
      updatedAt: new Date().toISOString(),
      tags: note.tags || [],
      isStarred: note.isStarred || false,
      meetingType: note.meetingType || 'other',
      priority: note.priority || 'medium',
    };
    
    const updatedNotes = [noteWithDefaults, ...notes];
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
    
    // Update project note count
    if (noteWithDefaults.projectId) {
      await updateProjectNoteCount(noteWithDefaults.projectId, 1);
    }
    
    // Add to processing queue if needed
    if (noteWithDefaults.isProcessing) {
      setProcessingQueue(prev => new Set([...prev, noteWithDefaults.id]));
      
      // Start background processing with user's language preference
      const language = preferences.transcription.autoDetectLanguage 
        ? 'auto' 
        : preferences.transcription.defaultLanguage;
      
      backgroundProcessor.processNote(noteWithDefaults, updateNote, language)
        .catch(error => {
          console.error('Background processing failed:', error);
        });
    }
    
    return noteWithDefaults;
  }, [notes, saveNotes]);

  const updateNote = useCallback(async (updatedNote: Note) => {
    const noteWithTimestamp = {
      ...updatedNote,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedNotes = notes.map((note) => 
      note.id === noteWithTimestamp.id ? noteWithTimestamp : note
    );
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
    
    // Remove from processing queue if completed
    if (!noteWithTimestamp.isProcessing) {
      setProcessingQueue(prev => {
        const newQueue = new Set(prev);
        newQueue.delete(noteWithTimestamp.id);
        return newQueue;
      });
      
      // Show notification if enabled
      if (notificationSettings.transcriptionComplete && noteWithTimestamp.transcript) {
        showNotification('Transcription Complete', `"${noteWithTimestamp.title}" has been transcribed.`);
      }
      if (notificationSettings.summaryReady && noteWithTimestamp.summary) {
        showNotification('Summary Ready', `Summary for "${noteWithTimestamp.title}" is ready.`);
      }
    }
    
    // Show error notification if enabled
    if (noteWithTimestamp.processingError && notificationSettings.processingError) {
      showNotification('Processing Error', `Failed to process "${noteWithTimestamp.title}".`);
    }
    
    return noteWithTimestamp;
  }, [notes, saveNotes, notificationSettings]);

  const deleteNote = useCallback(async (id: string) => {
    const noteToDelete = notes.find(note => note.id === id);
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
    
    // Update project note count
    if (noteToDelete?.projectId) {
      await updateProjectNoteCount(noteToDelete.projectId, -1);
    }
    
    // Remove from processing queue
    setProcessingQueue(prev => {
      const newQueue = new Set(prev);
      newQueue.delete(id);
      return newQueue;
    });
  }, [notes, saveNotes]);
  
  // Project management functions
  const addProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'noteCount'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      noteCount: 0,
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
    return newProject;
  }, [projects]);
  
  const updateProject = useCallback(async (updatedProject: Project) => {
    const projectWithTimestamp = {
      ...updatedProject,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = projects.map(project => 
      project.id === projectWithTimestamp.id ? projectWithTimestamp : project
    );
    setProjects(updatedProjects);
    await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
    return projectWithTimestamp;
  }, [projects]);
  
  const deleteProject = useCallback(async (id: string) => {
    // Move notes from this project to no project
    const updatedNotes = notes.map(note => 
      note.projectId === id ? { ...note, projectId: undefined, updatedAt: new Date().toISOString() } : note
    );
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
    
    // Delete the project
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
  }, [notes, projects, saveNotes]);
  
  const updateProjectNoteCount = useCallback(async (projectId: string, delta: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          noteCount: Math.max(0, project.noteCount + delta),
          updatedAt: new Date().toISOString(),
        };
      }
      return project;
    });
    setProjects(updatedProjects);
    await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
  }, [projects]);
  
  // Notification settings
  const updateNotificationSettings = useCallback(async (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, []);
  
  // Show notification helper
  const showNotification = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      // For web, use browser notifications if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
      }
    } else {
      // For mobile, use Alert for now (in production, use expo-notifications)
      Alert.alert(title, message);
    }
  }, []);
  
  // Search and filter functions
  const searchNotes = useCallback((query: string, filters?: {
    projectId?: string;
    tags?: string[];
    meetingType?: string;
    priority?: string;
    isStarred?: boolean;
  }) => {
    let filteredNotes = notes;
    
    // Apply text search
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(lowercaseQuery) ||
        (note.transcript && note.transcript.toLowerCase().includes(lowercaseQuery)) ||
        (note.summary && note.summary.toLowerCase().includes(lowercaseQuery)) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.projectId) {
        filteredNotes = filteredNotes.filter(note => note.projectId === filters.projectId);
      }
      if (filters.tags && filters.tags.length > 0) {
        filteredNotes = filteredNotes.filter(note => 
          filters.tags!.some(tag => note.tags.includes(tag))
        );
      }
      if (filters.meetingType) {
        filteredNotes = filteredNotes.filter(note => note.meetingType === filters.meetingType);
      }
      if (filters.priority) {
        filteredNotes = filteredNotes.filter(note => note.priority === filters.priority);
      }
      if (filters.isStarred !== undefined) {
        filteredNotes = filteredNotes.filter(note => note.isStarred === filters.isStarred);
      }
    }
    
    return filteredNotes;
  }, [notes]);
  
  // Export functions
  const exportNote = useCallback(async (noteId: string, options: { format: 'txt' | 'json' }) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found');
    
    let content = '';
    
    if (options.format === 'txt') {
      content = `Title: ${note.title}\n`;
      content += `Date: ${new Date(note.createdAt).toLocaleString()}\n`;
      content += `Duration: ${Math.floor(note.duration / 60)}:${(note.duration % 60).toString().padStart(2, '0')}\n`;
      if (note.projectId) {
        const project = projects.find(p => p.id === note.projectId);
        content += `Project: ${project?.name || 'Unknown'}\n`;
      }
      if (note.tags.length > 0) {
        content += `Tags: ${note.tags.join(', ')}\n`;
      }
      content += `\n--- TRANSCRIPT ---\n${note.transcript || 'No transcript available'}\n`;
      content += `\n--- SUMMARY ---\n${note.summary || 'No summary available'}\n`;
      if (note.actionItems && note.actionItems.length > 0) {
        content += `\n--- ACTION ITEMS ---\n${note.actionItems.map(item => `• ${item}`).join('\n')}\n`;
      }
    } else if (options.format === 'json') {
      content = JSON.stringify(note, null, 2);
    }
    
    return content;
  }, [notes, projects]);
  
  // Memoized computed values
  const processingCount = useMemo(() => processingQueue.size, [processingQueue]);
  const completedNotes = useMemo(() => notes.filter(note => !note.isProcessing), [notes]);
  const processingNotes = useMemo(() => notes.filter(note => note.isProcessing), [notes]);
  const starredNotes = useMemo(() => notes.filter(note => note.isStarred), [notes]);
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);

  return {
    // Notes
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    processingCount,
    completedNotes,
    processingNotes,
    processingQueue,
    starredNotes,
    allTags,
    searchNotes,
    exportNote,
    
    // Projects
    projects,
    addProject,
    updateProject,
    deleteProject,
    
    // Settings
    notificationSettings,
    updateNotificationSettings,
  };
});
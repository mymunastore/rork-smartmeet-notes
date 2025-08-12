import { safeStorage } from "@/utils/safe-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback } from "react";
import { UserProfile, UserPreferences, DEFAULT_USER_PREFERENCES } from "@/types/user";
import { Platform } from "react-native";

const USER_PROFILE_KEY = "scribe-user-profile";
const USER_PREFERENCES_KEY = "scribe-user-preferences";

// Mock user for demo purposes
const createMockUser = (): UserProfile => ({
  id: "user-1",
  email: "user@example.com",
  name: "John Doe",
  bio: "AI enthusiast and productivity lover",
  phone: "+1 (555) 123-4567",
  company: "Tech Innovations Inc.",
  jobTitle: "Product Manager",
  preferences: DEFAULT_USER_PREFERENCES,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const [UserProfileProvider, useUserProfile] = createContextHook(() => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedProfile = await safeStorage.getItem(USER_PROFILE_KEY);
      
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
      } else {
        // Create mock user for demo
        const mockUser = createMockUser();
        setUserProfile(mockUser);
        await safeStorage.setItem(USER_PROFILE_KEY, JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Fallback to mock user
      const mockUser = createMockUser();
      setUserProfile(mockUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserPreferences = useCallback(async () => {
    try {
      const storedPreferences = await safeStorage.getItem(USER_PREFERENCES_KEY);
      
      if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences);
        setPreferences({ ...DEFAULT_USER_PREFERENCES, ...parsedPreferences });
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
    loadUserPreferences();
  }, [loadUserProfile, loadUserPreferences]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    try {
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      setUserProfile(updatedProfile);
      await safeStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
      
      console.log("User profile updated successfully");
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  }, [userProfile]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = {
        ...preferences,
        ...updates,
      };

      setPreferences(updatedPreferences);
      await safeStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updatedPreferences));

      // Also update the user profile with new preferences
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          preferences: updatedPreferences,
          updatedAt: new Date().toISOString(),
        };
        setUserProfile(updatedProfile);
        await safeStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
      }

      console.log("User preferences updated successfully");
    } catch (error) {
      console.error("Failed to update user preferences:", error);
    }
  }, [preferences, userProfile]);

  const uploadProfilePicture = useCallback(async (imageUri: string) => {
    // In a real app, you would upload to a server
    // For demo purposes, we'll just store the local URI
    if (Platform.OS === 'web') {
      // For web, we might convert to base64 or handle differently
      console.log("Web profile picture upload not implemented in demo");
      return;
    }

    await updateUserProfile({ profilePicture: imageUri });
  }, [updateUserProfile]);

  const resetToDefaults = useCallback(async () => {
    try {
      await updatePreferences(DEFAULT_USER_PREFERENCES);
      console.log("Preferences reset to defaults");
    } catch (error) {
      console.error("Failed to reset preferences:", error);
    }
  }, [updatePreferences]);

  return {
    userProfile,
    preferences,
    isLoading,
    updateUserProfile,
    updatePreferences,
    uploadProfilePicture,
    resetToDefaults,
  };
});
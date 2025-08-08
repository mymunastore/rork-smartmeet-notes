import { TranscriptionSettings } from "@/types/note";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  recording: RecordingSettings;
  transcription: TranscriptionSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  transcriptionComplete: boolean;
  summaryReady: boolean;
  weeklyDigest: boolean;
  systemUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface RecordingSettings {
  autoStart: boolean;
  quality: 'low' | 'medium' | 'high';
  autoSummary: boolean;
  backgroundRecording: boolean;
  maxRecordingDuration: number; // in minutes
}

export interface PrivacySettings {
  biometricLock: boolean;
  autoDeleteAfterDays: number;
  shareAnalytics: boolean;
  cloudSync: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'auto',
  language: 'en',
  notifications: {
    transcriptionComplete: true,
    summaryReady: true,
    weeklyDigest: false,
    systemUpdates: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  recording: {
    autoStart: false,
    quality: 'medium',
    autoSummary: true,
    backgroundRecording: false,
    maxRecordingDuration: 120,
  },
  transcription: {
    defaultLanguage: 'en',
    autoDetectLanguage: true,
    enableRealTimeTranscription: false,
    confidenceThreshold: 0.8,
    fallbackLanguage: 'en',
  },
  privacy: {
    biometricLock: false,
    autoDeleteAfterDays: 0, // 0 means never delete
    shareAnalytics: false,
    cloudSync: false,
  },
};
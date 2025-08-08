export interface Note {
  id: string;
  title: string;
  recordingUri?: string;
  transcript?: string;
  summary?: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  isProcessing: boolean;
  processingError?: string;
  projectId?: string;
  tags: string[];
  language?: string;
  detectedLanguage?: string;
  confidence?: number;
  realTimeTranscript?: string;
  actionItems?: string[];
  keyPoints?: string[];
  participants?: string[];
  meetingType?: 'meeting' | 'call' | 'interview' | 'lecture' | 'other';
  priority?: 'low' | 'medium' | 'high';
  isStarred: boolean;
  // Translation fields
  originalText?: string;
  translatedText?: string;
  isTranslated?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  noteCount: number;
}

export interface ExportOptions {
  format: 'txt' | 'pdf' | 'docx' | 'json';
  includeTranscript: boolean;
  includeSummary: boolean;
  includeMetadata: boolean;
  includeActionItems: boolean;
}

export interface NotificationSettings {
  transcriptionComplete: boolean;
  summaryReady: boolean;
  processingError: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL?: boolean;
}

export interface TranscriptionSettings {
  defaultLanguage: string;
  autoDetectLanguage: boolean;
  enableRealTimeTranscription: boolean;
  confidenceThreshold: number;
  fallbackLanguage: string;
}
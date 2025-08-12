import { Platform } from "react-native";
import cacheManager from './cache-manager';
import performanceMonitor from './performance-monitor';

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
};

// Exponential backoff retry function
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === config.maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt),
        config.maxDelay
      );
      
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Translation function using AI API
export async function translateText(
  text: string,
  fromLanguage: string,
  toLanguage: string = 'en'
): Promise<string> {
  const cacheKey = `translation_${btoa(text).slice(0, 32)}_${fromLanguage}_${toLanguage}`;
  
  // Check cache first
  const cached = await cacheManager.get<string>(cacheKey);
  if (cached) {
    console.log('📦 Using cached translation');
    return cached;
  }
  
  return withRetry(async () => {
    performanceMonitor.startTimer('translation-api');
    
    try {
      console.log(`🌐 Translating from ${fromLanguage} to ${toLanguage}`);
      
      const messages = [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text from ${fromLanguage} to ${toLanguage}. Maintain the original meaning, tone, and context. Only return the translated text, no explanations or additional content.`
        },
        {
          role: "user",
          content: text
        }
      ];
      
      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Translation API Error:', errorText);
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.completion) {
        console.error('Invalid translation response:', data);
        throw new Error('Invalid response from translation service');
      }
      
      const translatedText = data.completion.trim();
      
      console.log("✅ Translation completed:", translatedText.substring(0, 50) + "...");
      
      // Cache the result for 24 hours
      await cacheManager.set(cacheKey, translatedText, { 
        ttl: 24 * 60 * 60 * 1000,
        persistToDisk: true 
      });
      
      return translatedText;
    } finally {
      performanceMonitor.endTimer('translation-api');
    }
  });
}

// Enhanced transcription with automatic language detection and translation
export async function transcribeAudio(
  audioUri: string, 
  language?: string,
  autoTranslateToEnglish: boolean = true
): Promise<{ 
  text: string; 
  language: string;
  detectedLanguage?: string; 
  confidence?: number;
  originalText?: string;
  translatedText?: string;
  isTranslated?: boolean;
}> {
  const cacheKey = `transcription_${audioUri}_${language || 'auto'}_${autoTranslateToEnglish}`;
  
  // Check cache first
  const cached = await cacheManager.get<{ 
    text: string; 
    language: string;
    detectedLanguage?: string; 
    confidence?: number;
    originalText?: string;
    translatedText?: string;
    isTranslated?: boolean;
  }>(cacheKey);
  if (cached) {
    console.log('📦 Using cached transcription');
    return cached;
  }
  
  return withRetry(async () => {
    performanceMonitor.startTimer('transcription-api');
    
    try {
      console.log("🎤 Transcribing audio with auto-language detection:", language || 'auto-detect');
      
      const formData = new FormData();
      
      if (Platform.OS === "web") {
        // For web, fetch the file and append it
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append("audio", blob, 'recording.webm');
      } else {
        // For native platforms
        const uriParts = audioUri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        
        const audioFile = {
          uri: audioUri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`
        };
        
        // @ts-ignore - React Native's FormData accepts this format
        formData.append("audio", audioFile);
      }
      
      // Only add language parameter if explicitly specified (not auto-detect)
      if (language && language !== 'auto' && language !== 'auto-detect') {
        formData.append("language", language);
      }
      
      const response = await fetch("https://toolkit.rork.com/stt/transcribe/", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Transcription completed:", {
        text: data.text?.substring(0, 50) + "...",
        detectedLanguage: data.language
      });
      
      let result = {
        text: data.text || '',
        language: data.language || 'unknown',
        detectedLanguage: data.language,
        confidence: data.confidence || 1.0,
        originalText: data.text || '',
        translatedText: undefined as string | undefined,
        isTranslated: false,
      };
      
      // Auto-translate to English if detected language is not English and translation is requested
      if (autoTranslateToEnglish && data.language && data.language !== 'en' && data.text && data.text.trim()) {
        try {
          console.log(`🌐 Auto-translating from ${data.language} to English...`);
          const translatedText = await translateText(data.text, data.language, 'en');
          result = {
            ...result,
            text: translatedText, // Main text becomes the English translation
            translatedText,
            isTranslated: true,
          };
          console.log("✅ Auto-translation completed:", translatedText.substring(0, 50) + "...");
        } catch (translationError) {
          console.warn("⚠️ Auto-translation failed, using original text:", translationError);
          // Keep original text if translation fails
        }
      }
      
      // Cache the result for 1 hour
      await cacheManager.set(cacheKey, result, { 
        ttl: 60 * 60 * 1000,
        persistToDisk: true 
      });
      
      return result;
    } finally {
      performanceMonitor.endTimer('transcription-api');
    }
  });
}

export async function generateSummary(
  transcript: string, 
  language?: string
): Promise<string> {
  // Create cache key based on transcript hash and language
  const transcriptHash = btoa(transcript).slice(0, 32); // Simple hash
  const cacheKey = `summary_${transcriptHash}_${language || 'auto'}`;
  
  // Check cache first
  const cached = await cacheManager.get<string>(cacheKey);
  if (cached) {
    console.log('📦 Using cached summary');
    return cached;
  }
  
  return withRetry(async () => {
    performanceMonitor.startTimer('summary-api');
    
    try {
      console.log("🧠 Generating summary for language:", language || 'auto');
      
      const languageInstruction = language && language !== 'auto' && language !== 'en' 
        ? ` Please respond in the same language as the transcript (${language}).`
        : '';
      
      const messages = [
        {
          role: "system",
          content: `You are an AI assistant that creates concise, well-structured summaries of meeting transcripts. Focus on key points, action items, and decisions. Use bullet points where appropriate. Keep summaries clear and professional.${languageInstruction}`
        },
        {
          role: "user",
          content: `Please summarize this meeting transcript: ${transcript}`
        }
      ];
      
      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Summary API Error:', errorText);
        throw new Error(`Summary generation failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.completion) {
        console.error('Invalid summary response:', data);
        throw new Error('Invalid response from summary service');
      }
      
      console.log("✅ Summary generated:", data.completion.substring(0, 50) + "...");
      
      // Cache the result for 24 hours
      await cacheManager.set(cacheKey, data.completion, { 
        ttl: 24 * 60 * 60 * 1000,
        persistToDisk: true 
      });
      
      return data.completion;
    } finally {
      performanceMonitor.endTimer('summary-api');
    }
  });
}

// Health check function
export async function checkAPIHealth(): Promise<{
  transcription: boolean;
  summary: boolean;
  latency: number;
}> {
  const startTime = Date.now();
  
  try {
    // Test transcription endpoint with a simple request
    const transcriptionResponse = await fetch("https://toolkit.rork.com/stt/transcribe/", {
      method: "OPTIONS",
      signal: AbortSignal.timeout(5000)
    });
    
    // Test summary endpoint
    const summaryResponse = await fetch("https://toolkit.rork.com/text/llm/", {
      method: "OPTIONS",
      signal: AbortSignal.timeout(5000)
    });
    
    const latency = Date.now() - startTime;
    
    return {
      transcription: transcriptionResponse.status < 500,
      summary: summaryResponse.status < 500,
      latency
    };
  } catch (error) {
    console.warn('API health check failed:', error);
    return {
      transcription: false,
      summary: false,
      latency: Date.now() - startTime
    };
  }
}

// Get API usage statistics
export function getAPIStats(): {
  cacheStats: ReturnType<typeof cacheManager.getStats>;
  performanceStats: ReturnType<typeof performanceMonitor.getSummary>;
} {
  return {
    cacheStats: cacheManager.getStats(),
    performanceStats: performanceMonitor.getSummary()
  };
}
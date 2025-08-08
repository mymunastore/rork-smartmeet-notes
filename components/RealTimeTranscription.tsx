import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Mic, MicOff, Globe, Languages } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { translateText } from '@/utils/api';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';

interface RealTimeTranscriptionProps {
  isRecording: boolean;
  onTranscriptUpdate: (transcript: string) => void;
  autoTranslateToEnglish?: boolean;
}

const RealTimeTranscription: React.FC<RealTimeTranscriptionProps> = ({
  isRecording,
  onTranscriptUpdate,
  autoTranslateToEnglish = true,
}) => {
  const [transcript, setTranscript] = useState<string>('');
  const [originalTranscript, setOriginalTranscript] = useState<string>('');
  const [translatedTranscript, setTranslatedTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const recognitionRef = useRef<any>(null);
  const translationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'auto'; // Auto-detect language
      
      recognitionRef.current.onresult = async (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        
        const fullTranscript = originalTranscript + finalTranscript + interimTranscript;
        setOriginalTranscript(fullTranscript);
        
        // Detect language from the speech recognition result
        if (event.results[0] && event.results[0][0].lang) {
          const detectedLang = event.results[0][0].lang.split('-')[0]; // Get language code
          setDetectedLanguage(detectedLang);
        }
        
        // Auto-translate if enabled and language is not English
        if (autoTranslateToEnglish && finalTranscript && detectedLanguage !== 'en') {
          // Clear previous timeout
          if (translationTimeoutRef.current) {
            clearTimeout(translationTimeoutRef.current);
          }
          
          // Debounce translation to avoid too many API calls
          translationTimeoutRef.current = setTimeout(async () => {
            try {
              setIsTranslating(true);
              const translated = await translateText(fullTranscript, detectedLanguage, 'en');
              setTranslatedTranscript(translated);
              setIsTranslated(true);
              setTranscript(translated); // Show translated version by default
              onTranscriptUpdate(translated);
            } catch (error) {
              console.error('Real-time translation failed:', error);
              setTranscript(fullTranscript); // Fallback to original
              onTranscriptUpdate(fullTranscript);
            } finally {
              setIsTranslating(false);
            }
          }, 2000); // Wait 2 seconds after user stops speaking
        } else {
          setTranscript(fullTranscript);
          onTranscriptUpdate(fullTranscript);
        }
        
        // Auto-scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isRecording) {
          // Restart recognition if still recording
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setIsListening(true);
            } catch (error) {
              console.error('Failed to restart recognition:', error);
            }
          }, 100);
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [autoTranslateToEnglish, detectedLanguage, originalTranscript, onTranscriptUpdate]);

  useEffect(() => {
    if (Platform.OS === 'web' && recognitionRef.current) {
      if (isRecording && !isListening) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
        }
      } else if (!isRecording && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isRecording, isListening]);

  const formatTranscript = (text: string) => {
    if (!text) return 'Start speaking to see real-time transcription...';
    
    // Add punctuation and formatting
    return text
      .replace(/\b(um|uh|er)\b/gi, '') // Remove filler words
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };
  
  const getLanguageName = (code: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : code.toUpperCase();
  };
  
  const toggleTranscriptView = () => {
    if (isTranslated) {
      setShowOriginal(!showOriginal);
      setTranscript(showOriginal ? translatedTranscript : originalTranscript);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          {isListening ? (
            <Mic size={16} color={Colors.light.nature.ocean} />
          ) : (
            <MicOff size={16} color={Colors.light.gray[500]} />
          )}
          <Text style={[styles.statusText, isListening && styles.listeningText]}>
            {isListening ? 'Listening...' : 'Not listening'}
          </Text>
          
          {/* Language Detection Indicator */}
          {detectedLanguage && detectedLanguage !== 'en' && (
            <View style={styles.languageIndicator}>
              <Globe size={12} color={Colors.light.nature.sage} />
              <Text style={styles.languageText}>{getLanguageName(detectedLanguage)}</Text>
            </View>
          )}
          
          {/* Translation Status */}
          {isTranslating && (
            <View style={styles.translatingIndicator}>
              <Languages size={12} color={Colors.light.nature.coral} />
              <Text style={styles.translatingText}>Translating...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.rightHeader}>
          <Text style={styles.wordCount}>
            {transcript.split(' ').filter(word => word.length > 0).length} words
          </Text>
          
          {/* Toggle between original and translated */}
          {isTranslated && (
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={toggleTranscriptView}
            >
              <Text style={styles.toggleButtonText}>
                {showOriginal ? 'EN' : getLanguageName(detectedLanguage).slice(0, 2).toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.transcriptContainer}
        contentContainerStyle={styles.transcriptContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.transcript}>
          {formatTranscript(showOriginal ? originalTranscript : transcript)}
        </Text>
        
        {/* Show translation status */}
        {isTranslated && !showOriginal && (
          <View style={styles.translationBadge}>
            <Languages size={12} color={Colors.light.nature.sage} />
            <Text style={styles.translationBadgeText}>
              Translated from {getLanguageName(detectedLanguage)}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {Platform.OS !== 'web' && (
        <View style={styles.webOnlyNotice}>
          <Text style={styles.webOnlyText}>
            Real-time transcription with auto-translation is available on web only
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.nature.sand,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.gray[600],
    marginLeft: 6,
    fontWeight: '500',
  },
  listeningText: {
    color: Colors.light.nature.ocean,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordCount: {
    fontSize: 12,
    color: Colors.light.gray[500],
    fontWeight: '500',
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.nature.sage,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  languageText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  translatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.nature.coral,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  translatingText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  translationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.nature.sky,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  translationBadgeText: {
    fontSize: 11,
    color: Colors.light.text,
    fontWeight: '500',
  },
  transcriptContainer: {
    flex: 1,
    maxHeight: 200,
  },
  transcriptContent: {
    flexGrow: 1,
  },
  transcript: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
    fontWeight: '400',
  },
  webOnlyNotice: {
    backgroundColor: Colors.light.nature.lavender,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  webOnlyText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RealTimeTranscription;
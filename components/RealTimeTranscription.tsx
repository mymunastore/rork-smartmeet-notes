import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface RealTimeTranscriptionProps {
  isRecording: boolean;
  onTranscriptUpdate: (transcript: string) => void;
}

const RealTimeTranscription: React.FC<RealTimeTranscriptionProps> = ({
  isRecording,
  onTranscriptUpdate,
}) => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
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
        
        const fullTranscript = transcript + finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        onTranscriptUpdate(fullTranscript);
        
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
    };
  }, []);

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
        </View>
        <Text style={styles.wordCount}>
          {transcript.split(' ').filter(word => word.length > 0).length} words
        </Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.transcriptContainer}
        contentContainerStyle={styles.transcriptContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.transcript}>
          {formatTranscript(transcript)}
        </Text>
      </ScrollView>
      
      {Platform.OS !== 'web' && (
        <View style={styles.webOnlyNotice}>
          <Text style={styles.webOnlyText}>
            Real-time transcription is available on web only
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
  wordCount: {
    fontSize: 12,
    color: Colors.light.gray[500],
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
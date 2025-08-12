import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Sparkles, HelpCircle, Lightbulb } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { useChat } from '@/hooks/use-chat-store';
import { Note } from '@/types/note';

interface QuickChatActionsProps {
  note?: Note;
  style?: any;
}

export default function QuickChatActions({ note, style }: QuickChatActionsProps) {
  const router = useRouter();
  const { addSystemMessage } = useChat();

  const askAboutNote = () => {
    if (!note) return;
    
    addSystemMessage(`User asked about note: "${note.title}"`);
    router.push('/(tabs)/chat');
  };

  const getHelp = () => {
    addSystemMessage("I need help using Scribe AI. Can you guide me through the main features and how to get the most out of the app?");
    router.push('/(tabs)/chat');
  };

  const getSuggestions = () => {
    const message = note 
      ? `Based on my note "${note.title}", can you suggest some productivity tips or related actions I should consider?`
      : "Can you give me some productivity tips for better note-taking and meeting management?";
    
    addSystemMessage(message);
    router.push('/(tabs)/chat');
  };

  const openChat = () => {
    router.push('/(tabs)/chat');
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>🤖 AI Assistant</Text>
      <Text style={styles.subtitle}>Get instant help and insights</Text>
      
      <View style={styles.actionsGrid}>
        {note && (
          <TouchableOpacity style={styles.actionButton} onPress={askAboutNote}>
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.secondary]}
              style={styles.gradientButton}
            >
              <MessageCircle size={20} color="white" />
              <Text style={styles.buttonText}>Ask About Note</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.actionButton} onPress={getSuggestions}>
          <LinearGradient
            colors={[Colors.light.accent, Colors.light.primary]}
            style={styles.gradientButton}
          >
            <Lightbulb size={20} color="white" />
            <Text style={styles.buttonText}>Get Suggestions</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={getHelp}>
          <LinearGradient
            colors={[Colors.light.secondary, Colors.light.accent]}
            style={styles.gradientButton}
          >
            <HelpCircle size={20} color="white" />
            <Text style={styles.buttonText}>Get Help</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={openChat}>
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.accent]}
            style={styles.gradientButton}
          >
            <Sparkles size={20} color="white" />
            <Text style={styles.buttonText}>Open Chat</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
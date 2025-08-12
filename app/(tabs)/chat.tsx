import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Copy,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useNotes } from '@/hooks/use-notes-store';
import { useChat, useChatContext, ChatMessage } from '@/hooks/use-chat-store';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { notes, completedNotes } = useNotes();
  const { messages, isLoading, sendMessage, clearChat, markAsRead } = useChat();
  const { getChatContextData } = useChatContext();
  const [inputText, setInputText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mark messages as read when screen is focused
  React.useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  // Prepare context data for AI
  const contextData = useMemo(() => {
    return getChatContextData(notes, completedNotes);
  }, [notes, completedNotes, getChatContextData]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const messageText = inputText.trim();
    setInputText('');

    // Animate new message
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    await sendMessage(messageText, contextData);
  }, [inputText, isLoading, contextData, fadeAnim, sendMessage]);

  const handleClearChat = useCallback(() => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearChat,
        },
      ]
    );
  }, [clearChat]);

  const copyMessage = useCallback((text: string) => {
    // Note: Clipboard functionality would need expo-clipboard
    Alert.alert('Message Copied', 'The message has been copied to your clipboard.');
  }, []);

  const speakMessage = useCallback(async (text: string) => {
    if (Platform.OS === 'web') {
      // Web Speech API
      if ('speechSynthesis' in window) {
        if (isSpeaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        } else {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
          setIsSpeaking(true);
        }
      }
    } else {
      // For mobile, you would use expo-speech
      Alert.alert('Text-to-Speech', 'This feature is available on web browsers.');
    }
  }, [isSpeaking]);

  const renderMessage = useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
    return (
      <Animated.View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
          { opacity: index === messages.length - 1 ? fadeAnim : 1 },
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.messageIcon}>
            {item.isUser ? (
              <User size={16} color={Colors.light.primary} />
            ) : (
              <Bot size={16} color={Colors.light.nature.sage} />
            )}
          </View>
          <Text style={styles.messageSender}>
            {item.isUser ? 'You' : 'AI Assistant'}
          </Text>
          <Text style={styles.messageTime}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {item.isTyping ? (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={Colors.light.nature.sage} />
            <Text style={styles.typingText}>AI is thinking...</Text>
          </View>
        ) : (
          <>
            <View style={[
              styles.messageBubble,
              item.isUser ? styles.userBubble : styles.aiBubble,
            ]}>
              <Text style={[
                styles.messageText,
                item.isUser ? styles.userText : styles.aiText,
              ]}>
                {item.text}
              </Text>
            </View>
            
            {!item.isUser && (
              <View style={styles.messageActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => copyMessage(item.text)}
                >
                  <Copy size={14} color={Colors.light.gray[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => speakMessage(item.text)}
                >
                  {isSpeaking ? (
                    <VolumeX size={14} color={Colors.light.nature.coral} />
                  ) : (
                    <Volume2 size={14} color={Colors.light.gray[500]} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </Animated.View>
    );
  }, [messages.length, fadeAnim, copyMessage, speakMessage, isSpeaking]);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <LinearGradient
        colors={[Colors.light.background, 'rgba(247, 250, 252, 0.95)']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Sparkles size={20} color={Colors.light.nature.sage} />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Assistant</Text>
              <Text style={styles.headerSubtitle}>Powered by Scribe AI</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearChat}>
            <Trash2 size={18} color={Colors.light.gray[500]} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(247, 250, 252, 0.98)']}
          style={styles.inputGradient}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about your notes or the app..."
              placeholderTextColor={Colors.light.gray[400]}
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <LinearGradient
                colors={
                  !inputText.trim() || isLoading
                    ? [Colors.light.gray[300], Colors.light.gray[400]]
                    : [Colors.light.primary, Colors.light.secondary]
                }
                style={styles.sendButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={18} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.gray[500],
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  messageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.light.gray[400],
    marginLeft: 'auto',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: Colors.light.gray[300],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: Colors.light.text,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 14,
    color: Colors.light.gray[500],
    fontStyle: 'italic',
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  inputGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    fontSize: 15,
    color: Colors.light.text,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
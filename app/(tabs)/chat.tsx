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
  AlertCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotes } from '@/hooks/use-notes-store';
import { useChat, useChatContext, ChatMessage } from '@/hooks/use-chat-store';
import { useTheme } from '@/hooks/use-theme';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { notes, completedNotes } = useNotes();
  const { messages, isLoading, sendMessage, clearChat, markAsRead } = useChat();
  const { getChatContextData } = useChatContext();
  const [inputText, setInputText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Debug logging
  React.useEffect(() => {
    console.log('🎨 Chat Screen Theme Debug:', {
      isDark,
      colorsBackground: colors.background,
      colorsText: colors.text,
      colorsCard: colors.card,
      messageCount: messages.length
    });
  }, [isDark, colors, messages.length]);

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
    setHasError(false);

    // Animate new message
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      await sendMessage(messageText, contextData);
    } catch (error) {
      console.error('Failed to send message:', error);
      setHasError(true);
      Alert.alert(
        'Message Failed',
        'Failed to send your message. Please check your connection and try again.',
        [{ text: 'OK', onPress: () => setHasError(false) }]
      );
    }
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
        <View style={[
          styles.messageHeader,
          item.isUser ? styles.userMessageHeader : styles.aiMessageHeader,
        ]}>
          <View style={[styles.messageIcon, { backgroundColor: item.isUser ? `${colors.primary}20` : `${colors.nature.sage}20` }]}>
            {item.isUser ? (
              <User size={16} color={colors.primary} />
            ) : (
              <Bot size={16} color={colors.nature.sage} />
            )}
          </View>
          <Text style={[styles.messageSender, { color: colors.text }]}>
            {item.isUser ? 'You' : 'AI Assistant'}
          </Text>
          <Text style={[styles.messageTime, { color: colors.gray[500] }]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {item.isTyping ? (
          <View style={[
            styles.typingContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
            <ActivityIndicator size="small" color={colors.nature.sage} />
            <Text style={[styles.typingText, { color: colors.gray[500] }]}>AI is thinking...</Text>
          </View>
        ) : (
          <>
            <View style={[
              styles.messageBubble,
              item.isUser 
                ? { ...styles.userBubble, backgroundColor: colors.primary }
                : { ...styles.aiBubble, backgroundColor: colors.card, borderColor: colors.border },
            ]}>
              <Text style={[
                styles.messageText,
                { color: item.isUser ? '#FFFFFF' : colors.text },
              ]}>
                {item.text}
              </Text>
            </View>
            
            {!item.isUser && (
              <View style={styles.messageActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.gray[200] }]}
                  onPress={() => copyMessage(item.text)}
                >
                  <Copy size={14} color={colors.gray[600]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.gray[200] }]}
                  onPress={() => speakMessage(item.text)}
                >
                  {isSpeaking ? (
                    <VolumeX size={14} color={colors.nature.coral} />
                  ) : (
                    <Volume2 size={14} color={colors.gray[600]} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </Animated.View>
    );
  }, [messages.length, fadeAnim, copyMessage, speakMessage, isSpeaking, colors]);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.background, `${colors.background}F2`]}
        style={[styles.header, { borderBottomColor: colors.border }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: `${colors.nature.sage}1A` }]}>
              <Sparkles size={20} color={colors.nature.sage} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
              <Text style={[styles.headerSubtitle, { color: colors.gray[500] }]}>Powered by Scribe AI</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.clearButton, { backgroundColor: `${colors.error}1A` }]} onPress={handleClearChat}>
            <Trash2 size={18} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.nature.sage}1A` }]}>
            <Sparkles size={32} color={colors.nature.sage} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Welcome to AI Assistant</Text>
          <Text style={[styles.emptySubtitle, { color: colors.gray[500] }]}>
            Ask me anything about your notes, transcriptions, or how to use the app!
          </Text>
        </View>
      ) : (
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
      )}
      
      {hasError && (
        <View style={[styles.errorBanner, { backgroundColor: `${colors.error}1A`, borderColor: colors.error }]}>
          <AlertCircle size={16} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            Connection issue. Please check your internet and try again.
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
        <LinearGradient
          colors={[`${colors.background}F2`, `${colors.background}FA`]}
          style={styles.inputGradient}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about your notes or the app..."
              placeholderTextColor={colors.gray[400]}
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
                    ? [colors.gray[300], colors.gray[400]]
                    : [colors.primary, colors.secondary]
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
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 20,
    width: '100%',
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
    width: '100%',
  },
  userMessageHeader: {
    justifyContent: 'flex-end',
  },
  aiMessageHeader: {
    justifyContent: 'flex-start',
  },
  messageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 11,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    minWidth: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 6,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingBottom: 0,
  },
  inputGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
});
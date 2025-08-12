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

import { useNotes } from '@/hooks/use-notes-store';
import { useChat, useChatContext, ChatMessage } from '@/hooks/use-chat-store';
import { useTheme } from '@/hooks/use-theme';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
          <View style={[styles.messageIcon, { backgroundColor: `${item.isUser ? colors.primary : colors.nature.sage}1A` }]}>
            {item.isUser ? (
              <User size={16} color={colors.primary} />
            ) : (
              <Bot size={16} color={colors.nature.sage} />
            )}
          </View>
          <Text style={[styles.messageSender, { color: colors.text }]}>
            {item.isUser ? 'You' : 'AI Assistant'}
          </Text>
          <Text style={[styles.messageTime, { color: colors.gray[400] }]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {item.isTyping ? (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={colors.nature.sage} />
            <Text style={[styles.typingText, { color: colors.gray[500] }]}>AI is thinking...</Text>
          </View>
        ) : (
          <>
            <View style={[
              styles.messageBubble,
              item.isUser ? { ...styles.userBubble, backgroundColor: colors.primary } : { ...styles.aiBubble, backgroundColor: colors.card, shadowColor: colors.gray[300] },
            ]}>
              <Text style={[
                styles.messageText,
                item.isUser ? styles.userText : { color: colors.text },
              ]}>
                {item.text}
              </Text>
            </View>
            
            {!item.isUser && (
              <View style={styles.messageActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: `${colors.gray[500]}1A` }]}
                  onPress={() => copyMessage(item.text)}
                >
                  <Copy size={14} color={colors.gray[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: `${colors.gray[500]}1A` }]}
                  onPress={() => speakMessage(item.text)}
                >
                  {isSpeaking ? (
                    <VolumeX size={14} color={colors.nature.coral} />
                  ) : (
                    <Volume2 size={14} color={colors.gray[500]} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 11,
    marginLeft: 'auto',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
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

  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 14,
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
  },
  inputContainer: {
    borderTopWidth: 1,
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
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 15,
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
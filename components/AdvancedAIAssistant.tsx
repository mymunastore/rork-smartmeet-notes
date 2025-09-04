import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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
  Dimensions,
  ScrollView,
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
  Mic,
  MicOff,
  FileText,
  Zap,
  Brain,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useNotes } from '@/hooks/use-notes-store';
import { useChat, useChatContext, ChatMessage } from '@/hooks/use-chat-store';
import { useTheme } from '@/hooks/use-theme';

const { width: screenWidth } = Dimensions.get('window');

// Quick action suggestions
const QUICK_ACTIONS = [
  { id: '1', text: 'Summarize my recent notes', icon: FileText, color: '#4299E1' },
  { id: '2', text: 'Help me organize my thoughts', icon: Brain, color: '#38A169' },
  { id: '3', text: 'Create a to-do list from my notes', icon: Zap, color: '#ED8936' },
  { id: '4', text: 'Find patterns in my recordings', icon: Sparkles, color: '#9F7AEA' },
];

// AI capabilities showcase
const AI_CAPABILITIES = [
  {
    title: 'Smart Analysis',
    description: 'Analyze your notes for insights, patterns, and key themes',
    icon: Brain,
    gradient: ['#667eea', '#764ba2'],
  },
  {
    title: 'Content Generation',
    description: 'Generate summaries, action items, and structured content',
    icon: Sparkles,
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    title: 'Voice Interaction',
    description: 'Talk to your AI assistant using voice commands',
    icon: Mic,
    gradient: ['#4facfe', '#00f2fe'],
  },
];

interface AdvancedAIAssistantProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function AdvancedAIAssistant({ onClose, isModal = false }: AdvancedAIAssistantProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { notes, completedNotes } = useNotes();
  const { messages, isLoading, sendMessage, clearChat, markAsRead } = useChat();
  const { getChatContextData } = useChatContext();
  
  const [inputText, setInputText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showQuickActions, setShowQuickActions] = useState<boolean>(true);
  const [showCapabilities, setShowCapabilities] = useState<boolean>(false);
  
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation effects
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // Pulse animation for recording
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRecording, pulseAnim]);

  // Mark messages as read when screen is focused
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  // Prepare context data for AI
  const contextData = useMemo(() => {
    return getChatContextData(notes, completedNotes);
  }, [notes, completedNotes, getChatContextData]);

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || isLoading) return;

    if (!messageText) setInputText('');
    setHasError(false);
    setShowQuickActions(false);

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate new message
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      await sendMessage(textToSend, contextData);
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

  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[0]) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleSendMessage(action.text);
  }, [handleSendMessage]);

  const handleVoiceToggle = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
    Alert.alert(
      'Voice Recording',
      isRecording ? 'Voice recording stopped' : 'Voice recording started',
      [{ text: 'OK' }]
    );
  }, [isRecording]);

  const handleClearChat = useCallback(() => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearChat();
            setShowQuickActions(true);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  }, [clearChat]);

  const copyMessage = useCallback((text: string) => {
    // TODO: Implement clipboard functionality with expo-clipboard
    Alert.alert('Message Copied', 'The message has been copied to your clipboard.');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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

  const renderQuickAction = useCallback(({ item }: { item: typeof QUICK_ACTIONS[0] }) => {
    const IconComponent = item.icon;
    return (
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleQuickAction(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}20` }]}>
          <IconComponent size={16} color={item.color} />
        </View>
        <Text style={[styles.quickActionText, { color: colors.text }]} numberOfLines={2}>
          {item.text}
        </Text>
      </TouchableOpacity>
    );
  }, [colors, handleQuickAction]);

  const renderCapability = useCallback(({ item }: { item: typeof AI_CAPABILITIES[0] }) => {
    const IconComponent = item.icon;
    return (
      <View style={[styles.capabilityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient
          colors={item.gradient as [string, string]}
          style={styles.capabilityGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconComponent size={24} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.capabilityContent}>
          <Text style={[styles.capabilityTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.capabilityDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  }, [colors]);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);
  const quickActionKeyExtractor = useCallback((item: typeof QUICK_ACTIONS[0]) => item.id, []);
  const capabilityKeyExtractor = useCallback((item: typeof AI_CAPABILITIES[0]) => item.title, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
          transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
        }
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Enhanced Header */}
        <LinearGradient
          colors={isDark ? [colors.background, colors.backgroundSecondary || colors.card] : [colors.background, colors.backgroundSecondary || colors.card]}
          style={[styles.header, { borderBottomColor: colors.border }]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerIconGradient}
              >
                <Sparkles size={20} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Powered by Advanced AI</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: `${colors.info}1A` }]} 
                onPress={() => setShowCapabilities(!showCapabilities)}
              >
                {showCapabilities ? (
                  <ChevronUp size={18} color={colors.info} />
                ) : (
                  <ChevronDown size={18} color={colors.info} />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: `${colors.error}1A` }]} 
                onPress={handleClearChat}
              >
                <Trash2 size={18} color={colors.error} />
              </TouchableOpacity>
              {isModal && onClose && (
                <TouchableOpacity 
                  style={[styles.headerButton, { backgroundColor: `${colors.gray[500]}1A` }]} 
                  onPress={onClose}
                >
                  <Settings size={18} color={colors.gray[500]} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* AI Capabilities Showcase */}
        {showCapabilities && (
          <View style={[styles.capabilitiesSection, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What I Can Do</Text>
            <FlatList
              data={AI_CAPABILITIES}
              renderItem={renderCapability}
              keyExtractor={capabilityKeyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.capabilitiesList}
            />
          </View>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <ScrollView style={styles.emptyStateContainer} contentContainerStyle={styles.emptyState}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.emptyIcon}
            >
              <Sparkles size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Welcome to AI Assistant</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              I&apos;m here to help you with your notes, transcriptions, and productivity. Ask me anything or try one of the suggestions below!
            </Text>
          </ScrollView>
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

        {/* Quick Actions */}
        {showQuickActions && messages.length <= 1 && (
          <View style={[styles.quickActionsSection, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <FlatList
              data={QUICK_ACTIONS}
              renderItem={renderQuickAction}
              keyExtractor={quickActionKeyExtractor}
              numColumns={2}
              contentContainerStyle={styles.quickActionsList}
              scrollEnabled={false}
            />
          </View>
        )}
        
        {hasError && (
          <View style={[styles.errorBanner, { backgroundColor: `${colors.error}1A`, borderColor: colors.error }]}>
            <AlertCircle size={16} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              Connection issue. Please check your internet and try again.
            </Text>
          </View>
        )}

        {/* Enhanced Input */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
          <LinearGradient
            colors={isDark ? [colors.background, colors.backgroundSecondary || colors.card] : [colors.backgroundSecondary || colors.card, colors.background]}
            style={styles.inputGradient}
          >
            <View style={styles.inputRow}>
              <Animated.View style={[styles.voiceButton, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                  style={[
                    styles.voiceButtonInner,
                    { backgroundColor: isRecording ? colors.error : colors.primary }
                  ]}
                  onPress={handleVoiceToggle}
                  activeOpacity={0.8}
                >
                  {isRecording ? (
                    <MicOff size={20} color="#FFFFFF" />
                  ) : (
                    <Mic size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </Animated.View>
              
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything about your notes or the app..."
                placeholderTextColor={colors.gray[400]}
                multiline
                maxLength={1000}
                editable={!isLoading}
                onSubmitEditing={() => handleSendMessage()}
                blurOnSubmit={false}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    !inputText.trim() || isLoading
                      ? [colors.gray[300], colors.gray[400]]
                      : ['#667eea', '#764ba2']
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  headerIconGradient: {
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  capabilitiesSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  capabilitiesList: {
    paddingHorizontal: 20,
  },
  capabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: screenWidth * 0.8,
  },
  capabilityGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  capabilityContent: {
    flex: 1,
  },
  capabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  capabilityDescription: {
    fontSize: 14,
    lineHeight: 20,
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
  quickActionsSection: {
    paddingVertical: 16,
  },
  quickActionsList: {
    paddingHorizontal: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quickActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  emptyStateContainer: {
    flex: 1,
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
  voiceButton: {
    alignSelf: 'flex-end',
  },
  voiceButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignSelf: 'flex-end',
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
});
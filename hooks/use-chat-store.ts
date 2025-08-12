import React, { useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { safeStorage } from '@/utils/safe-storage';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const CHAT_STORAGE_KEY = '@scribe_ai_chat_messages';
const INITIAL_MESSAGE: ChatMessage = {
  id: '1',
  text: "Hi! I'm your AI assistant for Scribe AI. I can help you with your notes, transcriptions, and answer questions about the app. How can I assist you today?",
  isUser: false,
  timestamp: new Date(),
};

export const [ChatProvider, useChat] = createContextHook(() => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Load messages from storage on init
  React.useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await safeStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
          const parsedMessages = JSON.parse(stored).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(parsedMessages.length > 0 ? parsedMessages : [INITIAL_MESSAGE]);
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
    };
    loadMessages();
  }, []);

  // Save messages to storage whenever they change
  React.useEffect(() => {
    const saveMessages = async () => {
      try {
        await safeStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save chat messages:', error);
      }
    };
    saveMessages();
  }, [messages]);

  const sendMessage = useCallback(async (text: string, contextData?: any) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const typingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are an AI assistant for Scribe AI, a voice transcription and note-taking app. 

${contextData ? `User's current data:
- Total notes: ${contextData.totalNotes || 0}
- Completed notes: ${contextData.completedNotes || 0}

Recent notes:
${contextData.recentNotes || 'No recent notes'}

` : ''}You can help with:
1. Questions about their notes and transcriptions
2. App features and how to use them
3. General productivity and note-taking advice
4. Troubleshooting and support

Be helpful, concise, and friendly. If asked about specific notes, reference the data provided above.`;

      const apiMessages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: text.trim(),
        },
      ];

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.completion.trim();

      // Remove typing indicator and add AI response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            text: aiResponse,
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });

      // Increment unread count
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const addSystemMessage = useCallback((text: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
    setUnreadCount(prev => prev + 1);
  }, []);

  return {
    messages,
    isLoading,
    unreadCount,
    sendMessage,
    clearChat,
    markAsRead,
    addSystemMessage,
  };
});

// Helper hook to get chat context data from notes
export function useChatContext() {
  return {
    getChatContextData: (notes: any[], completedNotes: any[]) => {
      const recentNotes = notes
        .slice(0, 5)
        .map(note => `Title: ${note.title}\nSummary: ${note.summary || 'No summary'}\nTranscript: ${note.transcript?.substring(0, 200) || 'No transcript'}...`)
        .join('\n\n');
      
      return {
        recentNotes,
        totalNotes: notes.length,
        completedNotes: completedNotes.length,
      };
    },
  };
}
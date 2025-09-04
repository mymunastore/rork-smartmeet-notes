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

    // Retry logic for API calls
    const makeAPIRequest = async (attempt: number = 1): Promise<string> => {
      const maxRetries = 3;
      
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

        // Create timeout controller for cross-platform compatibility
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Chat request timeout after 30 seconds');
          controller.abort();
        }, 30000);
        
        const response = await fetch('https://toolkit.rork.com/text/llm/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: apiMessages }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('AI API Error Response:', response.status, response.statusText, errorText);
          throw new Error(`AI request failed: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data || !data.completion) {
          console.error('Invalid API response:', data);
          throw new Error('Invalid response from AI service');
        }
        
        return data.completion.trim();
      } catch (error) {
        console.error(`Chat API attempt ${attempt} failed:`, error);
        
        // Handle different types of errors
        if (error instanceof Error) {
          // Don't retry on abort errors (timeout)
          if (error.name === 'AbortError' || error.message.includes('aborted')) {
            throw new Error('Request timed out. Please try again with a shorter message.');
          }
          
          // Retry on server errors
          if (attempt < maxRetries && (error.message.includes('500') || error.message.includes('502') || error.message.includes('503') || error.message.includes('Network request failed'))) {
            console.log(`Retrying chat request (attempt ${attempt + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            return makeAPIRequest(attempt + 1);
          }
        }
        
        throw error;
      }
    };

    try {
      const aiResponse = await makeAPIRequest();

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
      
      let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error instanceof Error) {
        if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
          errorMessage = "The AI service is temporarily unavailable. Please try again in a few minutes.";
        } else if (error.message.includes('timeout') || error.name === 'AbortError' || error.message.includes('aborted')) {
          errorMessage = "The request timed out. Please try again with a shorter message.";
        } else if (error.message.includes('network') || error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          errorMessage = "Network connection issue. Please check your internet connection and try again.";
        } else if (error.message.includes('400')) {
          errorMessage = "Invalid request. Please try rephrasing your message.";
        }
      }
      
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            text: errorMessage,
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
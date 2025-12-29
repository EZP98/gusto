// useConversations Hook - Manages chat conversations with localStorage persistence

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '../types/chat';
import { STORAGE_KEYS } from '../types/chat';
import { parseRecipeFromText } from '../utils/recipeParser';
import { generateQuickReplies } from '../utils/quickReplies';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateTitle(firstMessage: string): string {
  // Take first 30 chars, clean up
  const clean = firstMessage.slice(0, 30).trim();
  return `${clean}${firstMessage.length > 30 ? '...' : ''}`;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(STORAGE_KEYS.conversations);
      const savedActiveId = localStorage.getItem(STORAGE_KEYS.activeConversationId);

      if (savedConversations) {
        const parsed = JSON.parse(savedConversations) as Conversation[];
        setConversations(parsed);
      }

      if (savedActiveId) {
        setActiveId(savedActiveId);
      }
    } catch (e) {
      console.error('Error loading conversations from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when conversations change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
    } catch (e) {
      console.error('Error saving conversations to localStorage:', e);
    }
  }, [conversations, isLoaded]);

  // Save active ID when it changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      if (activeId) {
        localStorage.setItem(STORAGE_KEYS.activeConversationId, activeId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.activeConversationId);
      }
    } catch (e) {
      console.error('Error saving active conversation ID:', e);
    }
  }, [activeId, isLoaded]);

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeId) || null;

  // Create a new conversation
  const createConversation = useCallback((): string => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'Nuova chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveId(newConversation.id);

    return newConversation.id;
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));

    if (activeId === id) {
      setActiveId(null);
    }
  }, [activeId]);

  // Set active conversation
  const setActiveConversation = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  // Add a message to the active conversation (returns message ID for streaming)
  const addMessage = useCallback((
    role: 'user' | 'assistant',
    content: string,
    conversationId?: string
  ): string => {
    const targetId = conversationId || activeId;
    const msgId = generateId();

    // For user messages, parse recipe/quick replies immediately
    // For assistant messages during streaming, these will be added by finalizeMessage
    const parsedRecipe = role === 'user' ? undefined :
      (content ? parseRecipeFromText(content) ?? undefined : undefined);
    const quickReplies = role === 'user' ? undefined :
      (content ? generateQuickReplies(content, parsedRecipe || null) : undefined);

    const newMessage: Message = {
      id: msgId,
      role,
      content,
      timestamp: Date.now(),
      parsedRecipe,
      quickReplies,
    };

    setConversations(prev => {
      return prev.map(conv => {
        if (conv.id === targetId) {
          const updatedMessages = [...conv.messages, newMessage];

          // Update title from first user message
          let newTitle = conv.title;
          if (role === 'user' && conv.messages.length === 0) {
            newTitle = generateTitle(content);
          }

          return {
            ...conv,
            messages: updatedMessages,
            title: newTitle,
            updatedAt: Date.now(),
          };
        }
        return conv;
      });
    });

    return msgId;
  }, [activeId]);

  // Update message content during streaming
  const updateMessageContent = useCallback((
    messageId: string,
    content: string,
    conversationId?: string
  ) => {
    const targetId = conversationId || activeId;

    setConversations(prev => prev.map(conv => {
      if (conv.id === targetId) {
        return {
          ...conv,
          messages: conv.messages.map(msg =>
            msg.id === messageId ? { ...msg, content } : msg
          ),
        };
      }
      return conv;
    }));
  }, [activeId]);

  // Finalize message after streaming (parse recipe + quick replies)
  const finalizeMessage = useCallback((
    messageId: string,
    content: string,
    conversationId?: string
  ) => {
    const targetId = conversationId || activeId;
    const parsedRecipe = parseRecipeFromText(content) ?? undefined;
    const quickReplies = generateQuickReplies(content, parsedRecipe || null);

    setConversations(prev => prev.map(conv => {
      if (conv.id === targetId) {
        return {
          ...conv,
          messages: conv.messages.map(msg =>
            msg.id === messageId
              ? { ...msg, content, parsedRecipe, quickReplies }
              : msg
          ),
          updatedAt: Date.now(),
        };
      }
      return conv;
    }));
  }, [activeId]);

  // Get messages for the active conversation
  const messages = activeConversation?.messages || [];

  // Get history for API calls (role + content only)
  const getHistoryForApi = useCallback((): Array<{ role: string; content: string }> => {
    return messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  // Clear all conversations
  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveId(null);
  }, []);

  return {
    conversations,
    activeConversation,
    activeId,
    messages,
    isLoaded,
    createConversation,
    deleteConversation,
    setActiveConversation,
    addMessage,
    updateMessageContent,
    finalizeMessage,
    getHistoryForApi,
    clearAll,
  };
}

// useConversations Hook - Manages chat conversations with cloud DB only (no localStorage)

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '../types/chat';
import { parseRecipeFromText } from '../utils/recipeParser';
import { generateQuickReplies } from '../utils/quickReplies';
import { authFetch } from './useAuth';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateTitle(firstMessage: string): string {
  // Take first 30 chars, clean up
  const clean = firstMessage.slice(0, 30).trim();
  return `${clean}${firstMessage.length > 30 ? '...' : ''}`;
}

export function useConversations(token: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from cloud on mount when authenticated
  useEffect(() => {
    if (!token) {
      // Not authenticated - clear conversations
      setConversations([]);
      setActiveId(null);
      setIsLoaded(true);
      return;
    }

    // Load from cloud
    const loadConversations = async () => {
      try {
        const response = await authFetch('/api/conversations');
        if (response.ok) {
          const data = await response.json();
          if (data.conversations && Array.isArray(data.conversations)) {
            setConversations(data.conversations);
          }
        }
      } catch (e) {
        console.error('Error loading conversations:', e);
      }
      setIsLoaded(true);
    };

    loadConversations();
  }, [token]);

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeId) || null;

  // Create a new conversation (also saves to cloud)
  const createConversation = useCallback(async (): Promise<string> => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'Nuova chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveId(newConversation.id);

    // Save to cloud if authenticated
    if (token) {
      try {
        await authFetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newConversation.id,
            title: newConversation.title,
          }),
        });
      } catch (e) {
        console.error('Error creating conversation on cloud:', e);
      }
    }

    return newConversation.id;
  }, [token]);

  // Delete a conversation (also deletes from cloud)
  const deleteConversation = useCallback(async (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));

    if (activeId === id) {
      setActiveId(null);
    }

    // Delete from cloud if authenticated
    if (token) {
      try {
        await authFetch(`/api/conversations/${id}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.error('Error deleting conversation from cloud:', e);
      }
    }
  }, [activeId, token]);

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
  // If toolRecipe is provided (from tool use), use that instead of parsing from text
  const finalizeMessage = useCallback((
    messageId: string,
    content: string,
    conversationId?: string,
    toolRecipe?: {
      name: string;
      time?: string;
      servings?: string;
      ingredients: string[];
      steps: string[];
      tips?: string[];
    }
  ) => {
    const targetId = conversationId || activeId;

    // Use tool recipe if provided, otherwise parse from text
    const parsedRecipe = toolRecipe
      ? {
          name: toolRecipe.name,
          time: toolRecipe.time,
          servings: toolRecipe.servings,
          ingredients: toolRecipe.ingredients,
          steps: toolRecipe.steps,
          tips: toolRecipe.tips,
        }
      : (parseRecipeFromText(content) ?? undefined);

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

  // Save conversation to cloud (call after adding messages when authenticated)
  const saveConversationToCloud = useCallback(async (conversationId: string) => {
    if (!token) return;

    const conv = conversations.find(c => c.id === conversationId);
    if (!conv || conv.messages.length === 0) return;

    try {
      // Save all messages (the API should handle duplicates)
      for (const msg of conv.messages) {
        await authFetch(`/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: {
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
              parsedRecipe: msg.parsedRecipe,
              quickReplies: msg.quickReplies,
            }
          }),
        });
      }

      // Update title if changed
      if (conv.title !== 'Nuova chat') {
        await authFetch(`/api/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: conv.title }),
        });
      }
    } catch (e) {
      console.error('Error saving to cloud:', e);
    }
  }, [conversations, token]);

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
    saveConversationToCloud,
  };
}

import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ZinePage,
  ZineText,
  ZineButton,
  ZineInput,
  HandDrawnFrame,
  DoubleFrame,
  HandArrow
} from '../../components/ui/ZineUI';
import { GustoLogo } from '../../components/ui/GustoLogo';
import { FormattedMessage } from '../../components/ui/FormattedMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  { text: 'Come si fa la carbonara?' },
  { text: 'Cosa posso cucinare in 20 minuti?' },
  { text: 'Come si preparano gli scialatielli?' },
  { text: 'Suggeriscimi un piatto con il pollo' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const initialMessageSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Handle initial message from homepage
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialMessageSent.current) {
      initialMessageSent.current = true;
      setTimeout(() => {
        handleSend(state.initialMessage);
      }, 100);
    }
  }, [location.state]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      // Build history from previous messages
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history
        })
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  accumulatedContent += data.delta.text;
                  setStreamingContent(accumulatedContent);
                }
              } catch {
                // Ignore parse errors for non-JSON lines
              }
            }
          }
        }
      }

      // Add completed message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: accumulatedContent,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Mi dispiace, c\'è stato un errore. Riprova tra poco.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ZinePage style={{ paddingBottom: '100px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <GustoLogo size={48} />
          <ZineText size="xl" style={{ display: 'block', marginTop: '8px' }}>
            Chiedi a Gusto
          </ZineText>
        </div>

        {/* Messages */}
        {messages.length === 0 && !streamingContent ? (
          <div>
            {/* Welcome */}
            <DoubleFrame style={{ background: '#FAF7F2', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
              <ZineText size="lg" style={{ display: 'block', marginBottom: '8px' }}>
                Ciao! Sono Gusto
              </ZineText>
              <ZineText size="md" style={{ color: '#6B6560', lineHeight: 1.5 }}>
                Chiedimi ricette, consigli di cucina, o cosa fare con gli ingredienti che hai.
              </ZineText>
            </DoubleFrame>

            {/* Suggestions */}
            <ZineText size="md" style={{ display: 'block', marginBottom: '16px', color: '#8B857C' }}>
              prova a chiedere...
            </ZineText>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion.text)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <HandDrawnFrame style={{ padding: '12px 16px' }}>
                    <ZineText size="md">{suggestion.text}</ZineText>
                  </HandDrawnFrame>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {message.role === 'assistant' && (
                  <div style={{ marginRight: '12px', flexShrink: 0 }}>
                    <GustoLogo size={32} />
                  </div>
                )}

                <div style={{
                  maxWidth: '85%',
                  padding: '16px',
                  background: message.role === 'user' ? '#2D2A26' : '#FAF7F2',
                  border: message.role === 'assistant' ? '1.5px solid #2D2A26' : 'none',
                  borderRadius: '4px'
                }}>
                  {message.role === 'user' ? (
                    <ZineText
                      size="md"
                      style={{
                        color: '#FAF7F2',
                        lineHeight: 1.5
                      }}
                    >
                      {message.content}
                    </ZineText>
                  ) : (
                    <FormattedMessage
                      content={message.content}
                      style={{ color: '#2D2A26' }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {streamingContent && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ marginRight: '12px', flexShrink: 0 }}>
                  <GustoLogo size={32} />
                </div>
                <div style={{
                  maxWidth: '85%',
                  padding: '16px',
                  background: '#FAF7F2',
                  border: '1.5px solid #2D2A26',
                  borderRadius: '4px'
                }}>
                  <FormattedMessage
                    content={streamingContent}
                    style={{ color: '#2D2A26' }}
                  />
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !streamingContent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <GustoLogo size={32} />
                <HandDrawnFrame style={{ padding: '12px 16px' }}>
                  <ZineText size="md" style={{ color: '#8B857C' }}>
                    sto pensando...
                  </ZineText>
                </HandDrawnFrame>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* Input */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FAF7F2',
        borderTop: '1.5px solid #2D2A26',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <ZineInput
              placeholder="scrivi qui la tua domanda..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <ZineButton
            onClick={() => handleSend()}
            variant="primary"
          >
            <HandArrow direction="right" size={20} />
          </ZineButton>
        </div>
      </div>
    </ZinePage>
  );
}

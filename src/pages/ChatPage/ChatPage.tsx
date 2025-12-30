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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  { icon: '', text: 'Dammi una ricetta veloce per la cena' },
  { icon: '', text: 'Cosa posso cucinare in 20 minuti?' },
  { icon: '', text: 'Suggeriscimi un piatto con il pollo' },
  { icon: '', text: 'Ho solo verdure, cosa preparo?' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const initialMessageSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial message from homepage
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialMessageSent.current) {
      initialMessageSent.current = true;
      // Small delay to ensure component is mounted
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

    // TODO: Replace with real API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(messageText),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (query: string): string => {
    if (query.toLowerCase().includes('carbonara')) {
      return `Pasta alla Carbonara 🍝

Ingredienti per 4 persone:
• 400g spaghetti
• 200g guanciale
• 4 tuorli d'uovo
• 100g pecorino romano
• Pepe nero q.b.

Procedimento:
1. Taglia il guanciale a listarelle
2. Rosolalo in padella senza olio
3. Cuoci la pasta al dente
4. Mescola tuorli + pecorino + pepe
5. Unisci pasta e guanciale (fuori dal fuoco!)
6. Aggiungi la crema e manteca

★ Consiglio: mai la panna! La cremosità viene dall'uovo.`;
    }

    if (query.toLowerCase().includes('veloce') || query.toLowerCase().includes('20 minuti')) {
      return `Ecco alcune idee veloci:

1. Aglio, Olio e Peperoncino → 15 min
2. Frittata di verdure → 15 min
3. Bruschette miste → 10 min
4. Pasta al tonno → 20 min
5. Uova strapazzate con toast → 10 min

Vuoi la ricetta dettagliata di qualcuna?`;
    }

    if (query.toLowerCase().includes('pollo')) {
      return `Con il pollo puoi preparare:

🍗 Pollo alla cacciatora
   → classico con pomodoro e olive

🍗 Pollo al limone
   → leggero e profumato

🍗 Pollo al curry
   → per un tocco esotico

🍗 Petto impanato
   → croccante e amato da tutti

Quale ti ispira?`;
    }

    return `Ciao! Sono Gusto

Posso aiutarti con:
• Ricette classiche o creative
• Suggerimenti basati sui tuoi ingredienti
• Tecniche di cucina
• Sostituzioni per ingredienti mancanti

Cosa ti piacerebbe cucinare oggi?`;
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
        {messages.length === 0 ? (
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
                  <HandDrawnFrame style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{suggestion.icon}</span>
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
                  maxWidth: '80%',
                  padding: '16px',
                  background: message.role === 'user' ? '#2D2A26' : '#FAF7F2',
                  border: message.role === 'assistant' ? '1.5px solid #2D2A26' : 'none',
                  borderRadius: '4px'
                }}>
                  <ZineText
                    size="md"
                    style={{
                      color: message.role === 'user' ? '#FAF7F2' : '#2D2A26',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5
                    }}
                  >
                    {message.content}
                  </ZineText>
                </div>
              </div>
            ))}

            {isLoading && (
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

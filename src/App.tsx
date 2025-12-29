import { useState, useEffect } from 'react';
import {
  ZinePage,
  ZineText,
  ZineRecipeCard,
  ZineNoteCard,
  ZinePhotoCard,
  HandDrawnFrame,
  Underline,
  SketchStar,
  SketchHeart
} from './components/ui/ZineUI';
import {
  UserMessage,
  AIMessage,
  LoadingDots,
  DashedBox,
  QuickReply,
  QuickReplies,
  RecipeInChat,
  ConversationListItem,
  NewChatButton,
  tokens
} from './components/ui/ChatComponents';
import { useConversations } from './hooks/useConversations';
import { getInitialQuickReplies } from './utils/quickReplies';
import { extractIntroText } from './utils/recipeParser';
import {
  SketchEgg,
  SketchTomato,
  SketchPasta,
  SketchBasil,
  SketchCheese,
  SketchBowl,
  SketchAvocado,
  SketchBread,
  SketchMilk,
  SketchCarrot
} from './components/ui/SketchIllustrations';

// Hamburger Icon
const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D2A26" strokeWidth="2">
    <path d="M4 6H20M4 12H20M4 18H20" strokeLinecap="round"/>
  </svg>
);

// Close Icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D2A26" strokeWidth="2">
    <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round"/>
  </svg>
);

// Nav Icons
const NavChat = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={active ? "#2D2A26" : "#A8A4A0"} strokeWidth="1.5">
    <path d="M4 6Q4 4 6 4H20Q22 4 22 6V16Q22 18 20 18H10L4 22V6Z" strokeLinecap="round"/>
    <path d="M8 10H18M8 14H14" strokeLinecap="round"/>
  </svg>
);

const NavBook = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={active ? "#2D2A26" : "#A8A4A0"} strokeWidth="1.5">
    <path d="M4 4H11Q13 4 13 6V22Q13 20 11 20H4V4Z" strokeLinecap="round"/>
    <path d="M22 4H15Q13 4 13 6V22Q13 20 15 20H22V4Z" strokeLinecap="round"/>
  </svg>
);

const NavPantry = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={active ? "#2D2A26" : "#A8A4A0"} strokeWidth="1.5">
    {/* Scaffali dispensa */}
    <rect x="3" y="3" width="20" height="20" rx="1"/>
    <path d="M3 10H23M3 17H23"/>
    <circle cx="8" cy="6.5" r="1.5"/>
    <circle cx="14" cy="6.5" r="1.5"/>
    <rect x="6" y="12" width="4" height="3" rx="0.5"/>
    <rect x="12" cy="12" width="4" height="3" rx="0.5"/>
    <circle cx="9" cy="20" r="1.5"/>
    <circle cx="16" cy="20" r="1.5"/>
  </svg>
);

// Camera Icon
const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="6" width="20" height="14" rx="2"/>
    <circle cx="12" cy="13" r="4"/>
    <path d="M7 6V4.5C7 4.22 7.22 4 7.5 4H16.5C16.78 4 17 4.22 17 4.5V6"/>
  </svg>
);

// Types
type Screen = 'home' | 'chat' | 'recipes' | 'pantry';

interface Recipe {
  id: number;
  name: string;
  note: string;
  time: string;
  Illustration: React.ComponentType<{ size?: number }>;
}

interface PantryItem {
  name: string;
  qty: string;
  Illustration: React.ComponentType<{ size?: number }>;
  expiring: boolean;
}

interface ShoppingItem {
  text: string;
  checked: boolean;
}

// Hook per rilevare mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default function App() {
  const isMobile = useIsMobile();
  const [screen, setScreen] = useState<Screen>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([0, 2]);

  // Conversations hook with localStorage persistence
  const {
    conversations,
    activeId,
    messages,
    createConversation,
    deleteConversation,
    setActiveConversation,
    addMessage,
    updateMessageContent,
    finalizeMessage,
    getHistoryForApi,
  } = useConversations();
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    { text: 'comprare uova', checked: true },
    { text: 'prendere il basilico', checked: true },
    { text: 'cercare ricetta torta', checked: false },
    { text: 'mozzarella fresca', checked: false },
  ]);

  const recipes: Recipe[] = [
    { id: 0, name: 'Uova in Purgatorio', note: 'comfort food della domenica', time: '15 min', Illustration: SketchEgg },
    { id: 1, name: 'Pasta al Pomodoro', note: 'la semplicità che vince', time: '20 min', Illustration: SketchPasta },
    { id: 2, name: 'Buddha Bowl', note: 'un arcobaleno di sapori', time: '25 min', Illustration: SketchBowl },
    { id: 3, name: 'Toast Avocado', note: 'colazione healthy', time: '10 min', Illustration: SketchAvocado },
    { id: 4, name: 'Bruschetta', note: 'antipasto classico', time: '15 min', Illustration: SketchTomato },
  ];

  const [pantryItems, setPantryItems] = useState<PantryItem[]>([
    { name: 'Uova', qty: '6', Illustration: SketchEgg, expiring: false },
    { name: 'Latte', qty: '1L', Illustration: SketchMilk, expiring: true },
    { name: 'Pomodori', qty: '4', Illustration: SketchTomato, expiring: false },
    { name: 'Formaggio', qty: '200g', Illustration: SketchCheese, expiring: false },
    { name: 'Carote', qty: '3', Illustration: SketchCarrot, expiring: false },
    { name: 'Basilico', qty: '1 mazzo', Illustration: SketchBasil, expiring: true },
    { name: 'Avocado', qty: '2', Illustration: SketchAvocado, expiring: true },
    { name: 'Pane', qty: '1', Illustration: SketchBread, expiring: true },
  ]);

  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [menuMode, setMenuMode] = useState(false);
  const [dietMode, setDietMode] = useState<string>('none');
  const [dietDropdownOpen, setDietDropdownOpen] = useState(false);

  const dietOptions = [
    { value: 'none', label: 'Nessuna dieta' },
    { value: 'lowcarb', label: 'Low carb' },
    { value: 'keto', label: 'Keto' },
    { value: 'vegetarian', label: 'Vegetariano' },
    { value: 'vegan', label: 'Vegano' },
    { value: 'glutenfree', label: 'Senza glutine' },
    { value: 'lactosefree', label: 'Senza lattosio' },
    { value: 'highprotein', label: 'Proteico' },
  ];

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleShoppingItem = (index: number) => {
    setShoppingList(prev => prev.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    ));
  };

  // Ingredient icon mapping
  const getIngredientIcon = (name: string): React.ComponentType<{ size?: number }> => {
    const lower = name.toLowerCase();
    if (lower.includes('uov') || lower.includes('egg')) return SketchEgg;
    if (lower.includes('latte') || lower.includes('milk')) return SketchMilk;
    if (lower.includes('pomodor') || lower.includes('tomato')) return SketchTomato;
    if (lower.includes('formaggio') || lower.includes('cheese') || lower.includes('parmigiano') || lower.includes('mozzarella')) return SketchCheese;
    if (lower.includes('carot') || lower.includes('carrot')) return SketchCarrot;
    if (lower.includes('basilico') || lower.includes('basil')) return SketchBasil;
    if (lower.includes('avocado')) return SketchAvocado;
    if (lower.includes('pane') || lower.includes('bread')) return SketchBread;
    if (lower.includes('pasta') || lower.includes('spaghetti')) return SketchPasta;
    return SketchBowl; // default
  };

  // Handle photo upload and AI analysis
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzingPhoto(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        // Call vision API
        const response = await fetch('/api/analyze-pantry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        if (!response.ok) throw new Error('Vision API error');

        const data = await response.json();

        if (data.ingredients && Array.isArray(data.ingredients)) {
          // Add new ingredients to pantry
          const newItems: PantryItem[] = data.ingredients.map((ing: { name: string; qty: string }) => ({
            name: ing.name,
            qty: ing.qty || '?',
            Illustration: getIngredientIcon(ing.name),
            expiring: false,
          }));

          setPantryItems(prev => {
            // Avoid duplicates by name
            const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
            const unique = newItems.filter(item => !existingNames.has(item.name.toLowerCase()));
            return [...prev, ...unique];
          });
        }

        setIsAnalyzingPhoto(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo analysis error:', error);
      setIsAnalyzingPhoto(false);
    }
  };

  const sendMessage = async (customMessage?: string) => {
    const msgToSend = customMessage || message.trim();
    if (!msgToSend || isLoading) return;

    // Create new conversation if none active
    let convId = activeId;
    if (!convId) {
      convId = createConversation();
    }

    // Always navigate to chat screen when sending a message
    setScreen('chat');

    setMessage('');
    addMessage('user', msgToSend, convId);
    setIsLoading(true);

    // Create empty AI message for streaming
    const aiMsgId = addMessage('assistant', '', convId);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgToSend,
          history: getHistoryForApi(),
          menuMode: menuMode,
          dietMode: dietMode
        }),
      });

      if (!response.ok) throw new Error('API error');

      // Read SSE stream with smooth display
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let displayedText = '';
      let buffer = '';
      const CHARS_PER_UPDATE = 2; // Characters to show per update
      const UPDATE_INTERVAL = 15; // ms between updates
      let isStreamDone = false;
      let displayLoopRunning = false;

      // Smooth display function - keeps running while streaming or has text to show
      const displayLoop = () => {
        if (displayedText.length < fullText.length) {
          // Add characters for typewriter effect
          const nextChars = fullText.slice(displayedText.length, displayedText.length + CHARS_PER_UPDATE);
          displayedText += nextChars;
          updateMessageContent(aiMsgId, displayedText, convId);
          setTimeout(displayLoop, UPDATE_INTERVAL);
        } else if (!isStreamDone) {
          // Stream still active but caught up - keep polling
          setTimeout(displayLoop, UPDATE_INTERVAL);
        } else {
          displayLoopRunning = false;
        }
      };

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                // Handle Anthropic streaming format
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  fullText += data.delta.text;
                  // Start display loop on first real content
                  if (!displayLoopRunning) {
                    displayLoopRunning = true;
                    displayLoop();
                  }
                }
              } catch {
                // Skip non-JSON lines
              }
            }
          }
        }

        // Mark stream as done
        isStreamDone = true;

        // Wait for display to catch up
        while (displayedText.length < fullText.length) {
          await new Promise(r => setTimeout(r, UPDATE_INTERVAL));
          const nextChars = fullText.slice(displayedText.length, displayedText.length + CHARS_PER_UPDATE);
          displayedText += nextChars;
          updateMessageContent(aiMsgId, displayedText, convId);
        }
      }

      // Finalize message with recipe parsing and quick replies
      if (fullText) {
        finalizeMessage(aiMsgId, fullText, convId);
      } else {
        // Fallback if no text received
        updateMessageContent(aiMsgId, 'Mi dispiace, non ho ricevuto risposta.', convId);
      }
    } catch (error) {
      console.error('Chat error:', error);
      updateMessageContent(aiMsgId, 'Mi dispiace, c\'è stato un problema. Riprova tra poco!', convId);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick reply click
  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  // Start new conversation
  const handleNewConversation = () => {
    createConversation();
    setScreen('chat');
  };

  const navItems = [
    { id: 'chat' as Screen, label: 'Chat', Icon: NavChat },
    { id: 'recipes' as Screen, label: 'Ricette', Icon: NavBook },
    { id: 'pantry' as Screen, label: 'Dispensa', Icon: NavPantry },
  ];

  return (
    <ZinePage style={{ padding: 0, minHeight: '100vh' }}>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={{
          width: 240,
          borderRight: '1px solid #E8E4DE',
          padding: '32px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          background: '#FAF7F2',
          zIndex: 100,
          overflowY: 'auto'
        }}>
          <div
            style={{ marginBottom: 24, cursor: 'pointer' }}
            onClick={() => setScreen('home')}
          >
            <ZineText size="xl" style={{ display: 'block' }}>Chef AI</ZineText>
            <Underline width={80} />
          </div>

          {/* New Chat Button */}
          <NewChatButton onClick={handleNewConversation} />

          {/* Conversation List */}
          {conversations.length > 0 && (
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              {conversations.slice(0, 8).map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  title={conv.title}
                  isActive={conv.id === activeId && screen === 'chat'}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    setScreen('chat');
                  }}
                  onDelete={() => deleteConversation(conv.id)}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: '#E8E4DE', margin: '8px 0' }} />

          {/* Nav Items */}
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setScreen(id)}
              style={{
                background: screen === id ? '#F0EBE3' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                width: '100%',
                textAlign: 'left'
              }}
            >
              <Icon active={screen === id} />
              <ZineText size="md" style={{ color: screen === id ? '#2D2A26' : '#8B857C' }}>{label}</ZineText>
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #E8E4DE' }}>
            <ZineText size="xs" style={{ color: '#A8A4A0', display: 'block', textAlign: 'center' }}>
              powered by AI
            </ZineText>
          </div>
        </aside>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 200
            }}
          />
          {/* Menu Panel */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: 260,
            background: '#FAF7F2',
            zIndex: 201,
            padding: '24px',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <ZineText size="lg">Menu</ZineText>
              <button
                onClick={() => setMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <CloseIcon />
              </button>
            </div>

            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { setScreen(id); setMenuOpen(false); }}
                style={{
                  background: screen === id ? '#F0EBE3' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  borderRadius: 8,
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: 8
                }}
              >
                <Icon active={screen === id} />
                <ZineText size="lg" style={{ color: screen === id ? '#2D2A26' : '#8B857C' }}>{label}</ZineText>
              </button>
            ))}

            <div style={{ marginTop: 'auto', position: 'absolute', bottom: 32, left: 24, right: 24 }}>
              <div style={{ borderTop: '1px solid #E8E4DE', paddingTop: 16 }}>
                <ZineText size="xs" style={{ color: '#A8A4A0', display: 'block', textAlign: 'center' }}>
                  Chef AI - powered by AI
                </ZineText>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Wrapper - CENTRATO nella pagina */}
      <div style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{
          padding: '20px 24px 16px'
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isMobile ? (
              <>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => setScreen('home')}
                >
                  <ZineText size="lg" style={{ display: 'block' }}>Chef AI</ZineText>
                </div>
                <button
                  onClick={() => setMenuOpen(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <HamburgerIcon />
                </button>
              </>
            ) : (
              <>
                <div>
                  <ZineText size="xl" style={{ display: 'block' }}>
                    {screen === 'home' && 'Cosa cuciniamo?'}
                    {screen === 'chat' && 'Chat con Chef AI'}
                    {screen === 'recipes' && 'Le tue ricette'}
                    {screen === 'pantry' && 'La tua dispensa'}
                  </ZineText>
                  <Underline width={screen === 'home' ? 170 : screen === 'chat' ? 160 : 130} />
                </div>
                <SketchStar size={24} />
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '24px 20px 32px' : '48px 40px'
        }}>

        {/* ============ HOME ============ */}
        {screen === 'home' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Chat Input - Dashed Box Style */}
            <div style={{
              border: '1.5px dashed #C4C0B9',
              borderRadius: 2,
              padding: 20,
              marginBottom: 28,
              background: 'white'
            }}>
              <ZineText size="md" style={{ color: '#8B857C', display: 'block', marginBottom: 16 }}>
                Dimmi cosa hai voglia di mangiare, cosa c'è nel frigo, o chiedi un consiglio...
              </ZineText>

              <div style={{
                borderTop: '1px solid #C4C0B9',
                paddingTop: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12
              }}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder='es: "ho delle uova e pomodori"'
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontFamily: "'Caveat', cursive",
                    fontSize: 18,
                    color: '#2D2A26',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading}
                  style={{
                    background: isLoading ? '#8B857C' : '#2D2A26',
                    color: '#FAF7F2',
                    border: 'none',
                    borderRadius: 20,
                    padding: '10px 20px',
                    fontFamily: "'Caveat', cursive",
                    fontSize: 16,
                    cursor: isLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0
                  }}
                >
                  {isLoading ? 'Penso...' : 'Chiedi'} <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4 }}><path d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13" stroke="#FAF7F2" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>

            {/* Suggeriti */}
            <ZineText size="lg" underline style={{ display: 'block', marginBottom: 20 }}>
              suggeriti per te
            </ZineText>

            {recipes.slice(0, 3).map(r => (
              <ZineRecipeCard
                key={r.id}
                title={r.name}
                note={r.note}
                time={r.time}
                Illustration={r.Illustration}
                annotations={favorites.includes(r.id) ? ['preferita'] : []}
              />
            ))}

            {/* In scadenza */}
            <ZineNoteCard highlight="in scadenza!" style={{ marginTop: 8, background: '#FFFBF0' }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
                {pantryItems.filter(i => i.expiring).map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <item.Illustration size={36} />
                    <ZineText size="sm">{item.name}</ZineText>
                  </div>
                ))}
              </div>
            </ZineNoteCard>
          </div>
        )}

        {/* ============ CHAT ============ */}
        {screen === 'chat' && (
          <div style={{
            maxWidth: 600,
            margin: '0 auto',
            paddingBottom: 100
          }}>
            {/* Chat Messages */}
            <div style={{ flex: 1 }}>
              {messages.length === 0 && !isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{
                    fontFamily: tokens.fonts.hand,
                    fontSize: 22,
                    color: tokens.colors.inkLight,
                    marginBottom: 12
                  }}>
                    Inizia una conversazione!
                  </p>
                  <p style={{
                    fontFamily: tokens.fonts.hand,
                    fontSize: 17,
                    color: tokens.colors.inkFaded,
                    marginBottom: 24
                  }}>
                    Chiedimi una ricetta, consigli sugli ingredienti, o cosa cucinare stasera...
                  </p>
                  {/* Initial Quick Replies */}
                  <QuickReplies>
                    {getInitialQuickReplies().map((reply, i) => (
                      <QuickReply key={i} onClick={() => handleQuickReply(reply)}>
                        {reply}
                      </QuickReply>
                    ))}
                  </QuickReplies>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isLastMessage = i === messages.length - 1;
                    const isStreaming = isLoading && isLastMessage && msg.role === 'assistant';

                    return msg.role === 'user' ? (
                      <UserMessage key={msg.id}>{msg.content}</UserMessage>
                    ) : (
                      <div key={msg.id}>
                        {/* Show intro text only if there's a parsed recipe, otherwise full content */}
                        {msg.parsedRecipe ? (
                          <>
                            {extractIntroText(msg.content) && (
                              <AIMessage>{extractIntroText(msg.content)}</AIMessage>
                            )}
                            <RecipeInChat
                              title={msg.parsedRecipe.name}
                              time={msg.parsedRecipe.time}
                              servings={msg.parsedRecipe.servings}
                              ingredients={msg.parsedRecipe.ingredients.map(ing => ({ name: ing }))}
                              steps={msg.parsedRecipe.steps}
                            />
                          </>
                        ) : (
                          <AIMessage isStreaming={isStreaming}>{msg.content}</AIMessage>
                        )}

                        {/* Show quick replies for the last AI message (only when not loading) */}
                        {isLastMessage && msg.quickReplies && msg.quickReplies.length > 0 && !isLoading && (
                          <QuickReplies>
                            {msg.quickReplies.map((reply, ri) => (
                              <QuickReply key={ri} onClick={() => handleQuickReply(reply)}>
                                {reply}
                              </QuickReply>
                            ))}
                          </QuickReplies>
                        )}
                      </div>
                    );
                  })}
                  {/* Show loading dots only when waiting for first chunk */}
                  {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content && (
                    <LoadingDots />
                  )}
                </>
              )}
            </div>

          </div>
        )}

        {/* ============ RICETTE ============ */}
        {screen === 'recipes' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Preferite */}
            {favorites.length > 0 && (
              <>
                <ZineText size="md" style={{ color: '#8B857C', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <SketchHeart size={18} /> preferite
                </ZineText>
                <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, marginBottom: 24 }}>
                  {recipes.filter(r => favorites.includes(r.id)).map((r, idx) => (
                    <ZinePhotoCard
                      key={r.id}
                      Illustration={r.Illustration}
                      caption={r.name}
                      note={r.time}
                      rotation={idx % 2 === 0 ? 2 : -2}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Tutte */}
            <ZineText size="lg" underline style={{ display: 'block', marginBottom: 20 }}>
              tutte le ricette
            </ZineText>

            {recipes.map(r => (
              <div key={r.id} style={{ position: 'relative' }}>
                <ZineRecipeCard title={r.name} note={r.note} time={r.time} Illustration={r.Illustration} />
                <button
                  onClick={() => toggleFavorite(r.id)}
                  style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', zIndex: 1 }}
                >
                  <svg width="22" height="22" viewBox="0 0 20 20" fill={favorites.includes(r.id) ? "#2D2A26" : "none"}>
                    <path
                      d="M10 17 Q4 12 4 8 Q4 4 7 4 Q9 4 10 6 Q11 4 13 4 Q16 4 16 8 Q16 12 10 17"
                      stroke="#2D2A26"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}

            <HandDrawnFrame style={{ marginTop: 8, textAlign: 'center', cursor: 'pointer' }}>
              <ZineText size="md" style={{ color: '#8B857C' }}>+ aggiungi ricetta</ZineText>
            </HandDrawnFrame>
          </div>
        )}

        {/* ============ DISPENSA ============ */}
        {screen === 'pantry' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Photo Upload Button */}
            <div style={{
              border: '2px dashed #2D2A26',
              borderRadius: 12,
              padding: 24,
              marginBottom: 28,
              textAlign: 'center',
              background: isAnalyzingPhoto ? '#F0EBE3' : 'transparent',
              cursor: isAnalyzingPhoto ? 'wait' : 'pointer',
              position: 'relative'
            }}>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                disabled={isAnalyzingPhoto}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: isAnalyzingPhoto ? 'wait' : 'pointer'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <CameraIcon />
                <ZineText size="lg" style={{ color: '#2D2A26' }}>
                  {isAnalyzingPhoto ? 'Analizzo la foto...' : 'Scatta una foto'}
                </ZineText>
                <ZineText size="sm" style={{ color: '#8B857C' }}>
                  L'AI riconosce gli ingredienti automaticamente
                </ZineText>
              </div>
            </div>

            {/* Stats - Corner Box Style */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
              {/* Stat Box 1 */}
              <div style={{ position: 'relative', padding: '24px 20px', flex: 1, textAlign: 'center' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  viewBox="0 0 150 100" preserveAspectRatio="none" fill="none">
                  <path d="M3 12 L3 3 L12 3" stroke="#2D2A26" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M138 3 L147 3 L147 12" stroke="#2D2A26" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M147 88 L147 97 L138 97" stroke="#2D2A26" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M12 97 L3 97 L3 88" stroke="#2D2A26" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 42, color: '#2D2A26', lineHeight: 1 }}>
                  {pantryItems.length}
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: '#8B857C', marginTop: 4 }}>
                  ingredienti
                </div>
              </div>
              {/* Stat Box 2 */}
              <div style={{ position: 'relative', padding: '24px 20px', flex: 1, textAlign: 'center' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  viewBox="0 0 150 100" preserveAspectRatio="none" fill="none">
                  <path d="M3 12 L3 3 L12 3" stroke="#2D2A26" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M138 3 L147 3 L147 12" stroke="#2D2A26" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M147 88 L147 97 L138 97" stroke="#2D2A26" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M12 97 L3 97 L3 88" stroke="#2D2A26" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 42, color: '#2D2A26', lineHeight: 1 }}>
                  {pantryItems.filter(i => i.expiring).length}
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: '#8B857C', marginTop: 4 }}>
                  in scadenza
                </div>
              </div>
            </div>

            {/* Usa Presto - Dashed Box */}
            <div style={{
              border: '1.5px dashed #C4C0B9',
              background: '#FEF9E7',
              padding: 20,
              marginBottom: 32
            }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ position: 'relative', display: 'inline-block', padding: '3px 12px' }}>
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                    viewBox="0 0 100 32" preserveAspectRatio="none" fill="none">
                    <ellipse cx="50" cy="16" rx="48" ry="14" stroke="#2D2A26" strokeWidth="1.2"/>
                  </svg>
                  <span style={{ position: 'relative', fontFamily: "'Caveat', cursive", fontSize: 16, color: '#2D2A26' }}>
                    usa presto!
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {pantryItems.filter(i => i.expiring).map(item => (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 60 }}>
                    <item.Illustration size={28} />
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#2D2A26' }}>{item.name}</span>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: '#C4C0B9' }}>{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In Dispensa - Line style */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 20 }}>
                <ZineText size="lg" style={{ display: 'block' }}>in dispensa</ZineText>
                <svg width="80" height="6" viewBox="0 0 80 6" style={{ display: 'block', marginTop: 6 }}>
                  <path d="M0 3 Q10 0 20 3 Q30 6 40 3 Q50 0 60 3 Q70 6 80 3" stroke="#C4C0B9" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 16px' }}>
                {pantryItems.map(item => (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%',
                      paddingBottom: 16,
                      marginBottom: 8,
                      borderBottom: '1.5px solid #2D2A26',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: 56,
                    }}>
                      <item.Illustration size={36} />
                    </div>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#8B857C' }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Lista spesa - Dashed Box */}
            <section>
              <div style={{ marginBottom: 20 }}>
                <ZineText size="lg" style={{ display: 'block' }}>lista della spesa</ZineText>
                <svg width="100" height="6" viewBox="0 0 100 6" style={{ display: 'block', marginTop: 6 }}>
                  <path d="M0 3 Q12.5 0 25 3 Q37.5 6 50 3 Q62.5 0 75 3 Q87.5 6 100 3" stroke="#C4C0B9" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <div style={{ border: '1.5px dashed #C4C0B9', padding: 20 }}>
                {shoppingList.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => toggleShoppingItem(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: i < shoppingList.length - 1 ? 10 : 0,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      border: '1.5px solid #2D2A26',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.checked && (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M2 9 L6 13 L14 3" stroke="#2D2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: 17,
                      color: item.checked ? '#8B857C' : '#2D2A26',
                      textDecoration: item.checked ? 'line-through' : 'none',
                    }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
        </main>

        {/* Fixed Chat Input - Only on chat screen */}
        {screen === 'chat' && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            left: 0,
            right: 0,
            padding: isMobile ? '0 20px' : '0 40px',
            zIndex: 50
          }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <DashedBox style={{
                background: tokens.colors.white,
                flexDirection: 'column',
                gap: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                {/* Options Row - Menu Mode + Diet */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 14,
                  marginBottom: 4,
                  borderBottom: '1px dashed #E8E4DE',
                  flexWrap: 'wrap'
                }}>
                  {/* Menu Mode Toggle - Radio Style */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => setMenuMode(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="7" stroke="#2D2A26" strokeWidth="1.5" fill="none"/>
                        {!menuMode && <circle cx="9" cy="9" r="4" fill="#2D2A26"/>}
                      </svg>
                      <ZineText size="sm" style={{ color: !menuMode ? '#2D2A26' : '#A8A4A0' }}>
                        Piatto
                      </ZineText>
                    </button>
                    <button
                      onClick={() => setMenuMode(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="7" stroke="#2D2A26" strokeWidth="1.5" fill="none"/>
                        {menuMode && <circle cx="9" cy="9" r="4" fill="#2D2A26"/>}
                      </svg>
                      <ZineText size="sm" style={{ color: menuMode ? '#2D2A26' : '#A8A4A0' }}>
                        Menu
                      </ZineText>
                    </button>
                  </div>

                  {/* Diet Dropdown - Custom hand-drawn, opens upward */}
                  <div style={{ position: 'relative' }}>
                    {/* Dropdown Panel - Opens Upward */}
                    {dietDropdownOpen && (
                      <>
                        {/* Backdrop to close */}
                        <div
                          onClick={() => setDietDropdownOpen(false)}
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 99
                          }}
                        />
                        {/* Options Panel */}
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          right: 0,
                          marginBottom: 8,
                          minWidth: 150,
                          zIndex: 100,
                          background: '#FFFFFF',
                          borderRadius: 4
                        }}>
                          {/* Hand-drawn frame with fill */}
                          <svg
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%'
                            }}
                            viewBox="0 0 150 280"
                            preserveAspectRatio="none"
                            fill="none"
                          >
                            <path
                              d="M6 10 Q3 4 10 4 L140 6 Q147 4 146 12 L144 268 Q146 276 138 274 L12 272 Q4 274 6 266 Z"
                              stroke="#2D2A26"
                              strokeWidth="1.5"
                              fill="#FFFFFF"
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Options */}
                          <div style={{ position: 'relative', zIndex: 1, padding: '10px 6px' }}>
                            {dietOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  setDietMode(opt.value);
                                  setDietDropdownOpen(false);
                                }}
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  textAlign: 'left',
                                  background: 'transparent',
                                  border: 'none',
                                  padding: '8px 12px',
                                  fontFamily: "'Caveat', cursive",
                                  fontSize: 16,
                                  color: dietMode === opt.value ? '#2D2A26' : '#A8A4A0',
                                  fontWeight: dietMode === opt.value ? 600 : 400,
                                  cursor: 'pointer'
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Trigger Button */}
                    <button
                      onClick={() => setDietDropdownOpen(!dietDropdownOpen)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        position: 'relative'
                      }}
                    >
                      {/* Hand-drawn frame around button */}
                      <svg
                        style={{
                          position: 'absolute',
                          top: -4,
                          left: -6,
                          width: 'calc(100% + 12px)',
                          height: 'calc(100% + 8px)',
                          pointerEvents: 'none'
                        }}
                        viewBox="0 0 100 28"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <path
                          d="M3 5 Q1 2 5 2 L93 3 Q98 2 97 7 L96 21 Q98 26 93 25 L7 24 Q2 25 3 20 Z"
                          stroke="#2D2A26"
                          strokeWidth="1.2"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                      <ZineText size="sm" style={{
                        color: dietMode === 'none' ? '#A8A4A0' : '#2D2A26',
                        padding: '2px 4px'
                      }}>
                        {dietOptions.find(o => o.value === dietMode)?.label}
                      </ZineText>
                      {/* Arrow */}
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginRight: 2 }}>
                        <path
                          d={dietDropdownOpen ? "M3 8 L6 4 L9 8" : "M3 4 L6 8 L9 4"}
                          stroke="#2D2A26"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Input Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={menuMode ? 'Descrivi il menu che vuoi...' : 'Scrivi un messaggio...'}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontFamily: tokens.fonts.hand,
                      fontSize: 18,
                      color: tokens.colors.ink,
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading}
                    style={{
                      background: isLoading ? tokens.colors.inkLight : tokens.colors.ink,
                      color: tokens.colors.paper,
                      border: 'none',
                      borderRadius: 20,
                      padding: '10px 20px',
                      fontFamily: tokens.fonts.hand,
                      fontSize: 16,
                      cursor: isLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0
                    }}
                  >
                    {isLoading ? 'Penso...' : 'Invia'} <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4 }}><path d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13" stroke="#FAF7F2" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </DashedBox>
            </div>
          </div>
        )}

        {/* Chat FAB - visible only on recipes and pantry screens */}
        {(screen === 'recipes' || screen === 'pantry') && (
          <button
            onClick={() => setScreen('chat')}
            style={{
              position: 'fixed',
              bottom: isMobile ? 24 : 32,
              right: isMobile ? 24 : 32,
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#2D2A26',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100
            }}
          >
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none" stroke="#FAF7F2" strokeWidth="1.5">
              <path d="M4 6Q4 4 6 4H20Q22 4 22 6V16Q22 18 20 18H10L4 22V6Z" strokeLinecap="round"/>
              <path d="M8 10H18M8 14H14" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </ZinePage>
  );
}

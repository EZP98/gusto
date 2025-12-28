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

const NavFridge = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={active ? "#2D2A26" : "#A8A4A0"} strokeWidth="1.5">
    <rect x="5" y="2" width="16" height="22" rx="2"/>
    <path d="M5 10H21"/>
    <path d="M17 5V8M17 13V18"/>
  </svg>
);

// Types
type Screen = 'home' | 'recipes' | 'fridge';

interface Recipe {
  id: number;
  name: string;
  note: string;
  time: string;
  Illustration: React.ComponentType<{ size?: number }>;
}

interface FridgeItem {
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
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([0, 2]);
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

  const fridgeItems: FridgeItem[] = [
    { name: 'Uova', qty: '6', Illustration: SketchEgg, expiring: false },
    { name: 'Latte', qty: '1L', Illustration: SketchMilk, expiring: true },
    { name: 'Pomodori', qty: '4', Illustration: SketchTomato, expiring: false },
    { name: 'Formaggio', qty: '200g', Illustration: SketchCheese, expiring: false },
    { name: 'Carote', qty: '3', Illustration: SketchCarrot, expiring: false },
    { name: 'Basilico', qty: '1 mazzo', Illustration: SketchBasil, expiring: true },
    { name: 'Avocado', qty: '2', Illustration: SketchAvocado, expiring: true },
    { name: 'Pane', qty: '1', Illustration: SketchBread, expiring: true },
  ];

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleShoppingItem = (index: number) => {
    setShoppingList(prev => prev.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    ));
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Navigate to chat screen when sending a message
    if (screen !== 'home') {
      setScreen('home');
    }

    const userMessage = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Mi dispiace, c\'è stato un problema. Riprova tra poco!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'home' as Screen, label: 'Chat', Icon: NavChat },
    { id: 'recipes' as Screen, label: 'Ricette', Icon: NavBook },
    { id: 'fridge' as Screen, label: 'Frigo', Icon: NavFridge },
  ];

  return (
    <ZinePage style={{ padding: 0, minHeight: '100vh' }}>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={{
          width: 220,
          borderRight: '1px solid #E8E4DE',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          background: '#FAF7F2',
          zIndex: 100
        }}>
          <div style={{ marginBottom: 32 }}>
            <ZineText size="xl" style={{ display: 'block' }}>Chef AI</ZineText>
            <Underline width={80} />
          </div>

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
                <ZineText size="lg" style={{ display: 'block' }}>Chef AI</ZineText>
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
                    {screen === 'recipes' && 'Le tue ricette'}
                    {screen === 'fridge' && 'Il tuo frigo'}
                  </ZineText>
                  <Underline width={screen === 'home' ? 170 : 130} />
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
                  onClick={sendMessage}
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
                  {isLoading ? 'Penso...' : 'Chiedi'} <span style={{ fontSize: 14 }}>✨</span>
                </button>
              </div>
            </div>

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 16,
                      padding: 16,
                      background: msg.role === 'user' ? '#F0EBE3' : 'white',
                      border: msg.role === 'assistant' ? '1.5px dashed #C4C0B9' : 'none',
                      borderRadius: 4
                    }}
                  >
                    <ZineText size="xs" style={{ color: '#8B857C', display: 'block', marginBottom: 8 }}>
                      {msg.role === 'user' ? 'Tu' : 'Chef AI'}
                    </ZineText>
                    <ZineText size="md" style={{ display: 'block', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {msg.content}
                    </ZineText>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ padding: 16, border: '1.5px dashed #C4C0B9', borderRadius: 4 }}>
                    <ZineText size="xs" style={{ color: '#8B857C', display: 'block', marginBottom: 8 }}>
                      Chef AI
                    </ZineText>
                    <ZineText size="md" style={{ color: '#8B857C' }}>
                      Sto pensando...
                    </ZineText>
                  </div>
                )}
              </div>
            )}

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
                annotations={favorites.includes(r.id) ? ['preferita ♥'] : []}
              />
            ))}

            {/* In scadenza */}
            <ZineNoteCard highlight="⚡ in scadenza!" style={{ marginTop: 8, background: '#FFFBF0' }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
                {fridgeItems.filter(i => i.expiring).map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <item.Illustration size={36} />
                    <ZineText size="sm">{item.name}</ZineText>
                  </div>
                ))}
              </div>
            </ZineNoteCard>
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

        {/* ============ FRIGO ============ */}
        {screen === 'fridge' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
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
                  {fridgeItems.length}
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
                  {fridgeItems.filter(i => i.expiring).length}
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
                {fridgeItems.filter(i => i.expiring).map(item => (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 60 }}>
                    <item.Illustration size={28} />
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#2D2A26' }}>{item.name}</span>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: '#C4C0B9' }}>{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nel Frigo - Line style */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 20 }}>
                <ZineText size="lg" style={{ display: 'block' }}>nel frigo</ZineText>
                <svg width="80" height="6" viewBox="0 0 80 6" style={{ display: 'block', marginTop: 6 }}>
                  <path d="M0 3 Q10 0 20 3 Q30 6 40 3 Q50 0 60 3 Q70 6 80 3" stroke="#C4C0B9" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 16px' }}>
                {fridgeItems.map(item => (
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

            {/* Suggerimento ricette - Dashed Box with pill tags */}
            <div style={{ border: '1.5px dashed #C4C0B9', padding: 20, marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10 L14 10 M10 6 L15 10 L10 14" stroke="#2D2A26" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: '#2D2A26' }}>
                  con questi puoi fare:
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {['Frittata', 'Bruschetta', 'Toast'].map((recipe, i) => (
                  <span key={i} style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 15,
                    color: '#2D2A26',
                    padding: '6px 14px',
                    border: '1.2px solid #2D2A26',
                    borderRadius: 20,
                  }}>
                    {recipe}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        </main>

        {/* Chat FAB - visible on recipes and fridge screens */}
        {screen !== 'home' && (
          <button
            onClick={() => setScreen('home')}
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

import { useState, useEffect } from 'react';
import {
  ZinePage,
  ZineText,
  ZineRecipeCard,
  ZineNoteCard,
  Underline,
  UnderlinedText
} from './components/ui/ZineUI';
import { GustoLogo } from './components/ui/GustoLogo';
import {
  UserMessage,
  AIMessage,
  DashedBox,
  QuickReply,
  QuickReplies,
  RecipeInChat,
  RecipeTips,
  MenuInChat,
  ConversationListItem,
  NewChatButton,
  tokens
} from './components/ui/ChatComponents';
import { useConversations } from './hooks/useConversations';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useRecipes } from './hooks/useRecipes';
import { useMenus } from './hooks/useMenus';
import { usePantry } from './hooks/usePantry';
import { AuthModal } from './components/auth/AuthModal';
import { UserMenu, LoginButton } from './components/auth/UserMenu';
import { useI18nStandalone } from './hooks/useI18n';
import { LanguageSelector } from './components/ui/LanguageSelector';
import { formatInlineText } from './components/ui/FormattedMessage';
import { getInitialQuickReplies } from './utils/quickReplies';
import { extractIntroText } from './utils/recipeParser';
import { shareRecipe } from './utils/share';
import { SharePage } from './pages/SharePage';
import PricingPage from './pages/PricingPage/PricingPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import { useSubscription } from './hooks/useSubscription';
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
import {
  IconChat,
  IconRicette,
  IconDispensa,
  IconCamera,
  IconMondo
} from './components/ui/GustoIcons';
import { getWeeklyThemes } from './config/cuisineThemes';
import { GlobeModal } from './components/globe/GlobeModal';
import { ShareModal } from './components/ShareModal';

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

// Hand-drawn border for active nav item (like modal style)
const NavItemBorder = () => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    }}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    fill="none"
  >
    <path
      d="M2 4 Q0 0 4 2 L96 2 Q100 0 98 4 L98 96 Q100 100 96 98 L4 98 Q0 100 2 96 Z"
      stroke="#2D2A26"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

// Wavy separator line (replaces borderBottom dashed)
const ZineWavySeparator = ({ width = 100, color = '#C4C0B9' }: { width?: number | string; color?: string }) => (
  <svg
    width={width}
    height="6"
    viewBox="0 0 100 6"
    style={{ display: 'block' }}
    preserveAspectRatio="none"
  >
    <path
      d="M0 3 Q8 1 16 3 Q24 5 32 3 Q40 1 48 3 Q56 5 64 3 Q72 1 80 3 Q88 5 96 3 L100 3"
      stroke={color}
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

// Nav Icons - using GustoIcons with active state
const NavChat = ({ active }: { active: boolean }) => (
  <IconChat size={26} color={active ? "#2D2A26" : "#A8A4A0"} fill={active ? "#FAF7F2" : "transparent"} />
);

const NavBook = ({ active }: { active: boolean }) => (
  <IconRicette size={26} color={active ? "#2D2A26" : "#A8A4A0"} fill={active ? "#FAF7F2" : "transparent"} />
);

const NavPantry = ({ active }: { active: boolean }) => (
  <IconDispensa size={26} color={active ? "#2D2A26" : "#A8A4A0"} fill={active ? "#FAF7F2" : "transparent"} />
);

const NavMondo = ({ active }: { active: boolean }) => (
  <IconMondo size={26} color={active ? "#2D2A26" : "#A8A4A0"} fill={active ? "#FAF7F2" : "transparent"} />
);

// Camera Icon - wrapper for consistent styling
const CameraIcon = () => (
  <IconCamera size={24} color="currentColor" fill="transparent" />
);

// Types
type Screen = 'home' | 'chat' | 'recipes' | 'pantry' | 'mondo' | 'share' | 'pricing' | 'settings';

// UI representation of pantry item (includes illustration component)
interface PantryItemUI {
  id: string;
  name: string;
  qty: string;
  Illustration: React.ComponentType<{ size?: number }>;
  expiring: boolean;
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

// Hook per history-based routing (URL puliti senza #)
function useRouter() {
  const [route, setRoute] = useState(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setRoute(path);
  };

  // Parse route to get screen and optional ID
  const parseRoute = (): { screen: Screen; id?: string } => {
    const parts = route.split('/').filter(Boolean);

    if (parts.length === 0 || parts[0] === 'home') {
      return { screen: 'home' };
    }

    if (parts[0] === 'chat') {
      return { screen: 'chat', id: parts[1] };
    }

    if (parts[0] === 'recipes') {
      return { screen: 'recipes', id: parts[1] };
    }

    if (parts[0] === 'pantry') {
      return { screen: 'pantry' };
    }

    if (parts[0] === 'share') {
      return { screen: 'share', id: parts[1] };
    }

    if (parts[0] === 'pricing') {
      return { screen: 'pricing' };
    }

    if (parts[0] === 'settings') {
      return { screen: 'settings' };
    }

    if (parts[0] === 'mondo') {
      return { screen: 'mondo' };
    }

    return { screen: 'home' };
  };

  const { screen, id } = parseRoute();

  return { screen, routeId: id, navigate, route };
}

export default function App() {
  const isMobile = useIsMobile();
  const { screen, routeId, navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [globeModalOpen, setGlobeModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalUrl, setShareModalUrl] = useState('');
  const [shareModalRecipeName, setShareModalRecipeName] = useState('');
  const isOnline = useOnlineStatus();

  // Helper to open auth modal with scroll to top
  const openAuthModal = () => {
    window.scrollTo(0, 0);
    setAuthModalOpen(true);
  };

  // Callback for shareRecipe to show modal on desktop
  const handleShowShareModal = (url: string, recipeName: string) => {
    setShareModalUrl(url);
    setShareModalRecipeName(recipeName);
    setShareModalOpen(true);
  };

  // Auth hook
  const { user, token, isAuthenticated, login, register, logout } = useAuth();

  // Subscription hook
  const {
    refreshUsage,
  } = useSubscription(isAuthenticated);

  // Recipes hook
  const {
    recipes: savedRecipesRaw,
    saveRecipe,
    deleteRecipe,
    toggleFavorite: toggleRecipeFavorite,
    isRecipeSaved,
  } = useRecipes(token);

  // Ensure recipes are always arrays (defensive against undefined)
  const savedRecipes = savedRecipesRaw || [];

  // State for tracking which recipe is being saved
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);

  // Menus hook
  const {
    menus: savedMenus,
    saveMenu,
    deleteMenu,
    isMenuSaved,
  } = useMenus(token);

  // State for tracking which menu is being saved
  const [savingMenuId, setSavingMenuId] = useState<string | null>(null);

  // Pantry hook
  const {
    items: pantryItemsAPI,
    addItems: addPantryItems,
    deleteItem: deletePantryItem,
  } = usePantry(token);

  // Convert API pantry items to UI format (with illustrations)
  const pantryItems: PantryItemUI[] = pantryItemsAPI.map(item => ({
    id: item.id,
    name: item.name,
    qty: item.quantity || '?',
    Illustration: getIngredientIcon(item.name),
    expiring: item.expiring,
  }));

  // i18n hook
  const { language, setLanguage, t, languageNames, availableLanguages } = useI18nStandalone();

  // Conversations hook - cloud DB only (requires auth)
  const {
    conversations,
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
    saveConversationToCloud,
  } = useConversations(token);

  // Sync URL → State: when URL has conversation ID, update state
  useEffect(() => {
    if (screen === 'chat' && routeId && routeId !== activeId) {
      const conv = conversations.find(c => c.id === routeId);
      if (conv) {
        setActiveConversation(routeId);
      } else if (isLoaded && conversations.length > 0) {
        // Conversation not found (after loading complete) - redirect to chat list
        navigate('/chat');
      }
    }
    // If on /chat without ID, clear active conversation
    if (screen === 'chat' && !routeId && activeId) {
      setActiveConversation(null);
    }
  }, [screen, routeId, conversations, activeId, setActiveConversation, navigate, isLoaded]);

  // Select a conversation
  const selectConversation = (convId: string) => {
    navigate(`/chat/${convId}`);
  };

  // Delete a conversation with navigation
  const handleDeleteConversation = async (convId: string) => {
    const wasActive = activeId === convId;
    await deleteConversation(convId);
    if (wasActive && screen === 'chat') {
      navigate('/chat');
    }
  };

  // Simple login/register handlers (conversations auto-load via hook)
  const handleLogin = async (email: string, password: string) => {
    return await login(email, password);
  };

  const handleRegister = async (email: string, password: string, name?: string) => {
    return await register(email, password, name);
  };

  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [dishSuggestions, setDishSuggestions] = useState<Array<{
    name: string;
    description: string;
    difficulty: string;
    time: string;
    mainIngredients: string[];
  }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [menuMode, setMenuMode] = useState(false);
  const [stellatoMode, setStellatoMode] = useState(false);
  const [recuperoMode, setRecuperoMode] = useState(false);
  const [dietMode, setDietMode] = useState<string>('none');
  const [dietDropdownOpen, setDietDropdownOpen] = useState(false);

  // Diet options with translations
  const dietOptions = [
    { value: 'none', label: t('diet.none') },
    { value: 'lowcarb', label: t('diet.lowcarb') },
    { value: 'keto', label: t('diet.keto') },
    { value: 'vegetarian', label: t('diet.vegetarian') },
    { value: 'vegan', label: t('diet.vegan') },
    { value: 'glutenfree', label: t('diet.glutenfree') },
    { value: 'lactosefree', label: t('diet.lactosefree') },
    { value: 'highprotein', label: t('diet.highprotein') },
  ];

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

  // Handle photo capture (add to array, max 3)
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Require authentication
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (capturedPhotos.length >= 3) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setCapturedPhotos(prev => [...prev, base64]);
    };
    reader.readAsDataURL(file);

    // Reset input to allow same file
    event.target.value = '';
  };

  // Remove a photo from the array
  const handleRemovePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Analyze all captured photos
  const handleAnalyzePhotos = async () => {
    if (capturedPhotos.length === 0) return;

    setIsAnalyzingPhoto(true);

    try {
      const response = await fetch('/api/analyze-pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: capturedPhotos }),
      });

      if (!response.ok) throw new Error('Vision API error');

      const data = await response.json();

      if (data.ingredients && Array.isArray(data.ingredients)) {
        // Save ingredients to cloud
        const newItems = data.ingredients.map((ing: { name: string; qty: string }) => ({
          name: ing.name,
          quantity: ing.qty || '?',
          expiring: false,
        }));

        await addPantryItems(newItems);

        // Clear captured photos
        setCapturedPhotos([]);

        // Automatically get dish suggestions
        if (newItems.length > 0) {
          handleGetSuggestions([...pantryItems.map(i => i.name), ...newItems.map((i: { name: string }) => i.name)]);
        }
      }
    } catch (error) {
      console.error('Photo analysis error:', error);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Get dish suggestions based on pantry items
  const handleGetSuggestions = async (ingredients?: string[]) => {
    const ingredientNames = ingredients || pantryItems.map(i => i.name);
    if (ingredientNames.length === 0) return;

    setIsLoadingSuggestions(true);

    try {
      const response = await fetch('/api/suggest-dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredientNames,
          language,
          count: 10,
        }),
      });

      if (!response.ok) throw new Error('Suggestions API error');

      const data = await response.json();

      if (data.dishes && Array.isArray(data.dishes)) {
        setDishSuggestions(data.dishes);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // When user clicks on a dish, get full recipe in chat
  const handleDishClick = (dishName: string) => {
    const msg = language === 'it'
      ? `Dammi la ricetta completa per: ${dishName}`
      : language === 'en'
      ? `Give me the complete recipe for: ${dishName}`
      : language === 'fr'
      ? `Donne-moi la recette complète pour: ${dishName}`
      : language === 'es'
      ? `Dame la receta completa de: ${dishName}`
      : language === 'ja'
      ? `${dishName}の完全なレシピを教えて`
      : `给我${dishName}的完整食谱`;

    sendMessage(msg);
  };

  const sendMessage = async (customMessage?: string) => {
    const msgToSend = customMessage || message.trim();
    if (!msgToSend || isLoading) return;

    // Check offline status
    if (!isOnline) {
      const offlineMsg = {
        it: 'Sei offline. Controlla la connessione.',
        en: 'You are offline. Check your connection.',
        fr: 'Vous êtes hors ligne. Vérifiez votre connexion.',
        es: 'Estás sin conexión. Comprueba tu conexión.',
        ja: 'オフラインです。接続を確認してください。',
        'zh-TW': '您已離線。請檢查網路連線。',
      }[language] || 'You are offline. Check your connection.';
      alert(offlineMsg);
      return;
    }

    // Require authentication to send messages
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    // Create new conversation if none active
    let convId = activeId;
    if (!convId) {
      convId = await createConversation();
    }

    // Navigate to chat with conversation ID
    navigate(`/chat/${convId}`);

    setMessage('');
    addMessage('user', msgToSend, convId);
    setIsLoading(true);

    // Create empty AI message for streaming
    const aiMsgId = addMessage('assistant', '', convId);

    // Timeout controller (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: msgToSend,
          history: getHistoryForApi(),
          menuMode: menuMode,
          stellatoMode: stellatoMode,
          recuperoMode: recuperoMode,
          dietMode: dietMode,
          language: language
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limit (usage exceeded)
      if (response.status === 429) {
        const data = await response.json();
        const limitMsg = {
          it: 'Hai raggiunto il limite giornaliero di messaggi. Passa a Pro per continuare!',
          en: 'You\'ve reached your daily message limit. Upgrade to Pro to continue!',
          fr: 'Vous avez atteint votre limite quotidienne de messages. Passez à Pro!',
          es: 'Has alcanzado el límite diario de mensajes. Pasa a Pro para continuar!',
          ja: '1日のメッセージ上限に達しました。Proにアップグレードしてください！',
          'zh-TW': '您已達到每日訊息上限。升級至 Pro 以繼續！',
        }[language] || data.message;
        updateMessageContent(aiMsgId, limitMsg, convId);
        setIsLoading(false);
        refreshUsage();
        return;
      }

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

      // Tool use tracking
      let toolUseJson = '';
      let isInToolUse = false;
      let currentToolName = '';
      let quickRepliesFromAI: string[] = [];
      let toolRecipe: {
        name: string;
        icon?: string;
        category?: string;
        time?: string;
        servings?: string;
        difficulty?: 'facile' | 'media' | 'difficile';
        ingredients: string[];
        steps: string[];
        tips?: string[];
      } | null = null;
      let toolMenu: {
        name: string;
        occasion?: string;
        courses: Array<{ type: string; name: string; description?: string }>;
        winePairing?: string;
        totalTime?: string;
        servings?: string;
      } | null = null;

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
        // Listen for offline during streaming
        let wentOffline = false;
        const offlineHandler = () => {
          wentOffline = true;
          controller.abort();
        };
        window.addEventListener('offline', offlineHandler);

        try {
          while (true) {
            // Timeout each read (10 seconds of no data = stalled)
            const readPromise = reader.read();
            const timeoutPromise = new Promise<{ done: true; value: undefined }>((_, reject) =>
              setTimeout(() => reject(new Error('Stream timeout')), 10000)
            );

            const { done, value } = await Promise.race([readPromise, timeoutPromise]);
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                // Handle text content
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  fullText += data.delta.text;
                  // Start display loop on first real content
                  if (!displayLoopRunning) {
                    displayLoopRunning = true;
                    displayLoop();
                  }
                }

                // Handle tool use start - capture tool name
                if (data.type === 'content_block_start' && data.content_block?.type === 'tool_use') {
                  isInToolUse = true;
                  currentToolName = data.content_block.name || '';
                  toolUseJson = '';
                }

                // Handle tool use input JSON delta
                if (data.type === 'content_block_delta' && data.delta?.type === 'input_json_delta') {
                  toolUseJson += data.delta.partial_json || '';
                }

                // Handle tool use stop - parse based on tool name
                if (data.type === 'content_block_stop' && isInToolUse) {
                  isInToolUse = false;
                  try {
                    const parsed = JSON.parse(toolUseJson);
                    if (currentToolName === 'display_recipe' && parsed.name && parsed.ingredients && parsed.steps) {
                      toolRecipe = parsed;
                    } else if (currentToolName === 'display_menu' && parsed.name && parsed.courses && Array.isArray(parsed.courses)) {
                      toolMenu = parsed;
                    } else if (currentToolName === 'suggest_quick_replies' && parsed.replies && Array.isArray(parsed.replies)) {
                      quickRepliesFromAI = parsed.replies.slice(0, 4);
                    }
                  } catch (e) {
                    console.error('Failed to parse tool use JSON:', e);
                  }
                  currentToolName = '';
                }
              } catch {
                // Skip non-JSON lines
              }
            }
          }
          } // end while (true)
        } catch (streamError) {
          // Handle stream interruption (offline or timeout during streaming)
          console.error('Stream error:', streamError);

          if (wentOffline) {
            // Went offline during streaming - show partial + offline message
            const offlineMsg = {
              it: '\n\n[Connessione persa. Risposta parziale.]',
              en: '\n\n[Connection lost. Partial response.]',
              fr: '\n\n[Connexion perdue. Réponse partielle.]',
              es: '\n\n[Conexión perdida. Respuesta parcial.]',
              ja: '\n\n[接続が切断されました。部分的な応答。]',
              'zh-TW': '\n\n[連線中斷。部分回應。]',
            }[language] || '\n\n[Connection lost. Partial response.]';
            fullText += offlineMsg;
          } else {
            // Stream timeout - show partial + timeout message
            const timeoutMsg = {
              it: '\n\n[Risposta interrotta. Riprova!]',
              en: '\n\n[Response interrupted. Try again!]',
              fr: '\n\n[Réponse interrompue. Réessayez!]',
              es: '\n\n[Respuesta interrumpida. ¡Inténtalo de nuevo!]',
              ja: '\n\n[応答が中断されました。再試行してください。]',
              'zh-TW': '\n\n[回應中斷。請重試！]',
            }[language] || '\n\n[Response interrupted. Try again!]';
            fullText += timeoutMsg;
          }
        } finally {
          window.removeEventListener('offline', offlineHandler);
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

      // Finalize message - use tool recipe/menu if available, otherwise parse from text
      // Pass AI-generated quick replies if available
      if (fullText || toolRecipe || toolMenu) {
        finalizeMessage(
          aiMsgId,
          fullText,
          convId,
          toolRecipe || undefined,
          { language, menuMode, stellatoMode, recuperoMode },
          quickRepliesFromAI.length > 0 ? quickRepliesFromAI : undefined,
          toolMenu || undefined
        );
      } else {
        // Fallback if no text received
        updateMessageContent(aiMsgId, 'Mi dispiace, non ho ricevuto risposta.', convId);
      }

      // Save to cloud if authenticated
      // Use setTimeout to wait for React state update after finalizeMessage
      if (token) {
        setTimeout(() => saveConversationToCloud(convId), 300);
      }
    } catch (error) {
      console.error('Chat error:', error);

      // Multilingual error messages
      const errorMessages = {
        generic: {
          it: 'Mi dispiace, c\'è stato un problema. Riprova tra poco!',
          en: 'Sorry, there was an issue. Please try again!',
          fr: 'Désolé, il y a eu un problème. Réessayez bientôt!',
          es: 'Lo siento, hubo un problema. ¡Inténtalo de nuevo!',
          ja: '問題が発生しました。もう一度お試しください。',
          'zh-TW': '抱歉，發生了問題。請稍後再試！',
        },
        timeout: {
          it: 'La richiesta ha impiegato troppo tempo. Riprova!',
          en: 'The request took too long. Please try again!',
          fr: 'La requête a pris trop de temps. Réessayez!',
          es: 'La solicitud tardó demasiado. ¡Inténtalo de nuevo!',
          ja: 'リクエストに時間がかかりすぎました。再試行してください。',
          'zh-TW': '請求時間過長。請重試！',
        },
        offline: {
          it: 'Sembra che tu sia offline. Controlla la connessione.',
          en: 'You appear to be offline. Check your connection.',
          fr: 'Vous semblez être hors ligne. Vérifiez votre connexion.',
          es: 'Parece que estás sin conexión. Comprueba tu conexión.',
          ja: 'オフラインのようです。接続を確認してください。',
          'zh-TW': '您似乎已離線。請檢查網路連線。',
        },
      };

      let errorMsg = errorMessages.generic[language as keyof typeof errorMessages.generic] || errorMessages.generic.en;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMsg = errorMessages.timeout[language as keyof typeof errorMessages.timeout] || errorMessages.timeout.en;
        } else if (!navigator.onLine) {
          errorMsg = errorMessages.offline[language as keyof typeof errorMessages.offline] || errorMessages.offline.en;
        }
      }

      updateMessageContent(aiMsgId, errorMsg, convId);
    } finally {
      setIsLoading(false);
      refreshUsage(); // Update usage count after message
    }
  };

  // Handle quick reply click
  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  // Start new conversation
  const handleNewConversation = async () => {
    const newId = await createConversation();
    navigate(`/chat/${newId}`);
  };

  const navItems = [
    { id: 'chat' as Screen, label: t('nav.chat'), Icon: NavChat },
    { id: 'recipes' as Screen, label: t('nav.recipes'), Icon: NavBook },
    { id: 'pantry' as Screen, label: t('nav.pantry'), Icon: NavPantry },
    { id: 'mondo' as Screen, label: t('nav.mondo'), Icon: NavMondo },
  ];

  // Share page - standalone public view (no auth, no nav)
  if (screen === 'share' && routeId) {
    return <SharePage shareId={routeId} onGoToApp={() => navigate('/')} />;
  }

  // Pricing page
  if (screen === 'pricing') {
    return (
      <PricingPage
        isAuthenticated={isAuthenticated}
        onOpenAuth={openAuthModal}
        onNavigate={navigate}
      />
    );
  }

  // Settings page
  if (screen === 'settings') {
    return (
      <SettingsPage
        user={user}
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
        onLogout={logout}
      />
    );
  }

  return (
    <ZinePage style={{ padding: 0, minHeight: '100vh', background: screen === 'mondo' ? 'none' : '#FAF7F2' }}>

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
            style={{ marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
            onClick={() => navigate('/')}
          >
            <GustoLogo size={32} />
            <div>
              <ZineText size="xl" style={{ display: 'block' }}>Gusto</ZineText>
              <Underline width={60} />
            </div>
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
                  onClick={() => selectConversation(conv.id)}
                  onDelete={() => handleDeleteConversation(conv.id)}
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
              onClick={() => navigate(`/${id}`)}
              style={{
                position: 'relative',
                background: 'transparent',
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
              {screen === id && <NavItemBorder />}
              <Icon active={screen === id} />
              <ZineText size="md" style={{ color: screen === id ? '#2D2A26' : '#8B857C' }}>{label}</ZineText>
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #E8E4DE' }}>
            {/* User + Language on same row */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
              {isAuthenticated && user ? (
                <UserMenu user={user} onLogout={logout} onNavigate={navigate} t={t} />
              ) : (
                <LoginButton onClick={() => openAuthModal()} t={t} />
              )}
              <LanguageSelector
                currentLanguage={language}
                languages={availableLanguages}
                languageNames={languageNames}
                onSelect={setLanguage}
              />
            </div>
            <ZineText size="xs" style={{ color: '#A8A4A0', display: 'block', textAlign: 'center' }}>
              {t('misc.poweredByAi')}
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
          {/* Menu Panel - Fullscreen on mobile */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            background: '#FAF7F2',
            zIndex: 201,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
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
                onClick={() => { navigate(`/${id}`); setMenuOpen(false); }}
                style={{
                  position: 'relative',
                  background: 'transparent',
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
                {screen === id && <NavItemBorder />}
                <Icon active={screen === id} />
                <ZineText size="lg" style={{ color: screen === id ? '#2D2A26' : '#8B857C' }}>{label}</ZineText>
              </button>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
              <div style={{ borderTop: '1px solid #E8E4DE', paddingTop: 16 }}>
                {/* User + Language on same row */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                  {isAuthenticated && user ? (
                    <UserMenu user={user} onLogout={logout} onNavigate={navigate} t={t} />
                  ) : (
                    <LoginButton onClick={() => openAuthModal()} t={t} />
                  )}
                  <LanguageSelector
                    currentLanguage={language}
                    languages={availableLanguages}
                    languageNames={languageNames}
                    onSelect={setLanguage}
                  />
                </div>
                <ZineText size="xs" style={{ color: '#A8A4A0', display: 'block', textAlign: 'center' }}>
                  Gusto - {t('misc.poweredByAi')}
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
        flexDirection: 'column',
        background: screen === 'mondo' ? 'transparent' : undefined
      }}>
        {/* Header */}
        <header style={{
          padding: '20px 24px 16px'
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isMobile ? (
              <>
                <div
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                  onClick={() => navigate('/')}
                >
                  <GustoLogo size={24} />
                  <ZineText size="lg" style={{ display: 'block' }}>Gusto</ZineText>
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
                    {screen === 'home' && t('header.home')}
                    {screen === 'chat' && t('header.chat')}
                    {screen === 'recipes' && t('header.recipes')}
                    {screen === 'pantry' && t('header.pantry')}
                    {screen === 'mondo' && t('nav.mondo')}
                  </ZineText>
                </div>
                <GustoLogo size={28} />
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1,
          overflow: screen === 'mondo' ? 'visible' : 'auto',
          padding: screen === 'mondo' ? 0 : (isMobile ? '24px 20px 32px' : '48px 40px')
        }}>

        {/* ============ HOME ============ */}
        {screen === 'home' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Chat Input - Same as Chat page */}
            <DashedBox style={{
              background: tokens.colors.white,
              flexDirection: 'column',
              gap: 12,
              marginBottom: 28
            }}>
              {/* Options Row - Menu Mode + Skills + Diet */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                paddingBottom: 10,
                flexWrap: 'wrap'
              }}>
                {/* Left side: Mode + Skills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
                        {t('chat.dish')}
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
                        {t('chat.menu')}
                      </ZineText>
                    </button>
                  </div>

                  {/* Skill Pills - Toggle Style */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Stellato Pill */}
                    <button
                      onClick={() => setStellatoMode(!stellatoMode)}
                      title={t('skill.stellatoDesc')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        border: stellatoMode ? '1.5px solid #2D2A26' : '1.5px dashed #C4C0B9',
                        borderRadius: 16,
                        background: stellatoMode ? '#2D2A26' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: "'Caveat', cursive",
                        fontSize: 15,
                        color: stellatoMode ? '#FAF7F2' : '#8B857C',
                        transition: 'all 0.15s',
                        overflow: 'hidden'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1L9.5 5.5L14 6L10.5 9.5L12 14L8 11L4 14L5.5 9.5L2 6L6.5 5.5Z"
                          stroke={stellatoMode ? '#FAF7F2' : '#8B857C'}
                          strokeWidth="1.2"
                          fill={stellatoMode ? '#FAF7F2' : 'none'}
                          strokeLinejoin="round"/>
                      </svg>
                      {t('skill.stellato')}
                    </button>

                    {/* Recupero Pill */}
                    <button
                      onClick={() => setRecuperoMode(!recuperoMode)}
                      title={t('skill.recuperoDesc')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        border: recuperoMode ? '1.5px solid #2D2A26' : '1.5px dashed #C4C0B9',
                        borderRadius: 16,
                        background: recuperoMode ? '#2D2A26' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: "'Caveat', cursive",
                        fontSize: 15,
                        color: recuperoMode ? '#FAF7F2' : '#8B857C',
                        transition: 'all 0.15s',
                        overflow: 'hidden'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8C2 4.7 4.7 2 8 2C10.2 2 12.1 3.2 13.2 5"
                          stroke={recuperoMode ? '#FAF7F2' : '#8B857C'}
                          strokeWidth="1.2"
                          strokeLinecap="round"/>
                        <path d="M14 8C14 11.3 11.3 14 8 14C5.8 14 3.9 12.8 2.8 11"
                          stroke={recuperoMode ? '#FAF7F2' : '#8B857C'}
                          strokeWidth="1.2"
                          strokeLinecap="round"/>
                        <path d="M13 2V5.5H9.5" stroke={recuperoMode ? '#FAF7F2' : '#8B857C'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 14V10.5H6.5" stroke={recuperoMode ? '#FAF7F2' : '#8B857C'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('skill.recupero')}
                    </button>
                  </div>
                </div>

                {/* Diet Dropdown - Custom hand-drawn */}
                <div style={{ position: 'relative' }}>
                  {/* Dropdown Panel - Opens Downward on home */}
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
                          zIndex: 999
                        }}
                      />
                      {/* Options Panel */}
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 8,
                        minWidth: 150,
                        zIndex: 1000,
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
              <ZineWavySeparator width="100%" color="#E8E4DE" />

              {/* Input Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={menuMode ? t('chat.menuPlaceholder') : t('chat.inputPlaceholder')}
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
                  {isLoading ? t('chat.thinking') : t('chat.send')} <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4 }}><path d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13" stroke="#FAF7F2" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
              </div>
            </DashedBox>

            {/* Suggeriti - Show saved recipes or hint to explore */}
            {savedRecipes.length > 0 ? (
              <>
                <ZineText size="lg" underline style={{ display: 'block', marginBottom: 20 }}>
                  {t('home.suggested')}
                </ZineText>
                {savedRecipes.slice(0, 3).map(r => (
                  <ZineRecipeCard
                    key={r.id}
                    title={r.name}
                    note={r.note || ''}
                    time={r.time || ''}
                    iconSvg={r.iconSvg}
                    Illustration={r.iconSvg ? undefined : SketchBowl}
                    annotations={r.isFavorite ? [t('misc.favorite')] : []}
                  />
                ))}
              </>
            ) : (
              <div style={{
                border: '1.5px dashed #C4C0B9',
                borderRadius: 8,
                padding: 24,
                textAlign: 'center',
                marginBottom: 20
              }}>
                <ZineText size="md" style={{ color: '#8B857C' }}>
                  {t('recipes.emptyHint') || 'Chiedi una ricetta in chat e salvala qui'}
                </ZineText>
              </div>
            )}

            {/* In scadenza - Only show if there are expiring items */}
            {pantryItems.filter(i => i.expiring).length > 0 && (
              <ZineNoteCard highlight={t('home.expiring')} style={{ marginTop: 8, background: '#FFFBF0' }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
                  {pantryItems.filter(i => i.expiring).map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <item.Illustration size={36} />
                      <ZineText size="sm">{item.name}</ZineText>
                    </div>
                  ))}
                </div>
              </ZineNoteCard>
            )}
          </div>
        )}

        {/* ============ CHAT ============ */}
        {screen === 'chat' && (
          <div style={{
            maxWidth: 600,
            margin: '0 auto',
            paddingBottom: 220
          }}>
            {/* Show conversation list when no active conversation */}
            {!activeId ? (
              <div style={{ padding: '20px 0' }}>
                {/* New Chat Button */}
                <button
                  onClick={async () => {
                    const newId = await createConversation();
                    navigate(`/chat/${newId}`);
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    marginBottom: 24,
                    background: tokens.colors.cream,
                    border: `2px dashed ${tokens.colors.inkFaded}`,
                    borderRadius: 12,
                    fontFamily: tokens.fonts.hand,
                    fontSize: 18,
                    color: tokens.colors.ink,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = tokens.colors.paper;
                    e.currentTarget.style.borderColor = tokens.colors.ink;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = tokens.colors.cream;
                    e.currentTarget.style.borderColor = tokens.colors.inkFaded;
                  }}
                >
                  <span style={{ fontSize: 22 }}>+</span>
                  {t('chat.newChat')}
                </button>

                {/* Conversation List */}
                {conversations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ marginBottom: 16, opacity: 0.5 }}>
                      <path d="M10 15Q10 10 15 10H45Q50 10 50 15V35Q50 40 45 40H25L10 50V15Z" stroke={tokens.colors.inkFaded} strokeWidth="2" strokeLinecap="round"/>
                      <path d="M20 22H40M20 30H32" stroke={tokens.colors.inkFaded} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p style={{
                      fontFamily: tokens.fonts.hand,
                      fontSize: 18,
                      color: tokens.colors.inkFaded,
                      marginBottom: 8
                    }}>
                      {t('chat.noConversations')}
                    </p>
                    <p style={{
                      fontFamily: tokens.fonts.hand,
                      fontSize: 15,
                      color: tokens.colors.inkFaded,
                      opacity: 0.7
                    }}>
                      {t('chat.startFirst')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{
                      fontFamily: tokens.fonts.hand,
                      fontSize: 14,
                      color: tokens.colors.inkFaded,
                      marginBottom: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}>
                      {t('chat.recentChats')}
                    </p>
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        style={{
                          padding: '14px 16px',
                          marginBottom: 8,
                          background: tokens.colors.paper,
                          borderRadius: 10,
                          cursor: 'pointer',
                          border: `1px solid ${tokens.colors.inkFaded}20`,
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = tokens.colors.cream;
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = tokens.colors.paper;
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontFamily: tokens.fonts.hand,
                            fontSize: 16,
                            color: tokens.colors.ink,
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {conv.title}
                          </p>
                          <p style={{
                            fontFamily: tokens.fonts.hand,
                            fontSize: 13,
                            color: tokens.colors.inkFaded,
                            margin: '4px 0 0 0'
                          }}>
                            {conv.messages?.length ?? 0} {(conv.messages?.length ?? 0) === 1 ? 'messaggio' : 'messaggi'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 6,
                            cursor: 'pointer',
                            opacity: 0.4,
                            transition: 'opacity 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4L12 12M12 4L4 12" stroke={tokens.colors.inkFaded} strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
            /* Active Chat View */
            <div style={{ flex: 1 }}>
              {/* Back button */}
              <button
                onClick={() => { setActiveConversation(null); navigate('/chat'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  marginBottom: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: tokens.fonts.hand,
                  fontSize: 15,
                  color: tokens.colors.inkLight,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {t('chat.allChats')}
              </button>

              {messages.length === 0 && !isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{
                    fontFamily: tokens.fonts.hand,
                    fontSize: 22,
                    color: tokens.colors.inkLight,
                    marginBottom: 12
                  }}>
                    {t('chat.startConversation')}
                  </p>
                  <p style={{
                    fontFamily: tokens.fonts.hand,
                    fontSize: 19,
                    color: tokens.colors.inkFaded,
                    marginBottom: 24
                  }}>
                    {t('chat.askMe')}
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
                        {/* Show intro text only if there's a parsed recipe/menu, otherwise full content */}
                        {msg.parsedRecipe ? (
                          <>
                            {extractIntroText(msg.content) && (
                              <AIMessage>{extractIntroText(msg.content)}</AIMessage>
                            )}
                            <RecipeInChat
                              title={msg.parsedRecipe.name}
                              time={msg.parsedRecipe.time}
                              servings={msg.parsedRecipe.servings}
                              difficulty={msg.parsedRecipe.difficulty}
                              category={msg.parsedRecipe.category}
                              iconSvg={msg.parsedRecipe.iconSvg}
                              ingredients={msg.parsedRecipe.ingredients.map(ing => ({ name: ing }))}
                              steps={msg.parsedRecipe.steps}
                              tips={msg.parsedRecipe.tips}
                              onSave={isAuthenticated ? async () => {
                                setSavingRecipeId(msg.id);
                                await saveRecipe({
                                  name: msg.parsedRecipe!.name,
                                  time: msg.parsedRecipe!.time,
                                  servings: msg.parsedRecipe!.servings,
                                  ingredients: msg.parsedRecipe!.ingredients,
                                  steps: msg.parsedRecipe!.steps,
                                  tips: msg.parsedRecipe!.tips,
                                });
                                setSavingRecipeId(null);
                              } : undefined}
                              onShare={() => shareRecipe({
                                name: msg.parsedRecipe!.name,
                                time: msg.parsedRecipe!.time,
                                servings: msg.parsedRecipe!.servings,
                                ingredients: msg.parsedRecipe!.ingredients,
                                steps: msg.parsedRecipe!.steps,
                                tips: msg.parsedRecipe!.tips,
                              }, handleShowShareModal)}
                              isSaved={isRecipeSaved(msg.parsedRecipe.name)}
                              isSaving={savingRecipeId === msg.id}
                            />
                          </>
                        ) : msg.parsedMenu ? (
                          <>
                            {extractIntroText(msg.content) && (
                              <AIMessage>{extractIntroText(msg.content)}</AIMessage>
                            )}
                            <MenuInChat
                              name={msg.parsedMenu.name}
                              occasion={msg.parsedMenu.occasion}
                              courses={msg.parsedMenu.courses}
                              winePairing={msg.parsedMenu.winePairing}
                              totalTime={msg.parsedMenu.totalTime}
                              servings={msg.parsedMenu.servings}
                              onSave={isAuthenticated ? async () => {
                                setSavingMenuId(msg.id);
                                await saveMenu({
                                  name: msg.parsedMenu!.name,
                                  occasion: msg.parsedMenu!.occasion,
                                  courses: msg.parsedMenu!.courses.map(c => ({
                                    type: c.type,
                                    name: c.name,
                                    description: c.description,
                                  })),
                                  winePairing: msg.parsedMenu!.winePairing,
                                });
                                setSavingMenuId(null);
                              } : undefined}
                              isSaved={isMenuSaved(msg.parsedMenu.name)}
                              isSaving={savingMenuId === msg.id}
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
                </>
              )}
            </div>
            )}
          </div>
        )}

        {/* ============ RICETTE ============ */}
        {screen === 'recipes' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Recipe Detail View */}
            {routeId && (() => {
              const recipe = savedRecipes.find(r => r.id === routeId);
              if (!recipe) return null;
              return (
                <div>
                  {/* Back button */}
                  <button
                    onClick={() => navigate('/recipes')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 0',
                      marginBottom: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: tokens.fonts.hand,
                      fontSize: 15,
                      color: tokens.colors.inkLight,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 4L6 8L10 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('recipes.all')}
                  </button>

                  {/* Recipe Title - LEFT aligned */}
                  <div style={{ marginBottom: 16 }}>
                    <ZineText size="xl" style={{ display: 'block' }}>
                      {recipe.name}
                    </ZineText>
                    {/* Hand-drawn underline */}
                    <svg width="60" height="8" viewBox="0 0 60 8" style={{ marginTop: 8 }}>
                      <path
                        d="M2 4 Q15 2 30 5 Q45 8 58 4"
                        stroke={tokens.colors.ink}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Time and servings - LEFT aligned with icons */}
                  {(recipe.time || recipe.servings) && (
                    <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
                      {recipe.time && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2 L8 14 M2 8 L14 8 M4 4 L12 12 M12 4 L4 12" stroke={tokens.colors.inkLight} strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          <ZineText size="sm" style={{ color: tokens.colors.inkLight }}>
                            {recipe.time}
                          </ZineText>
                        </div>
                      )}
                      {recipe.servings && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="5" r="3" stroke={tokens.colors.inkLight} strokeWidth="1.5" fill="none"/>
                            <path d="M4 18 Q4 12 10 12 Q16 12 16 18" stroke={tokens.colors.inkLight} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                          </svg>
                          <ZineText size="sm" style={{ color: tokens.colors.inkLight }}>
                            {recipe.servings}
                          </ZineText>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ingredients - with asterisks, no box */}
                  <div style={{ marginBottom: 16 }}>
                    <UnderlinedText>
                      <ZineText size="lg" style={{ fontWeight: 'bold' }}>
                        {t('recipe.ingredients') || 'Ingredienti'}
                      </ZineText>
                    </UnderlinedText>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    {(recipe.ingredients || []).map((ing, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: 8,
                        fontFamily: tokens.fonts.hand,
                        fontSize: 19,
                        color: tokens.colors.ink,
                      }}>
                        <span style={{ marginTop: 2 }}>*</span>
                        <span style={{ lineHeight: 1.5 }}>{ing}</span>
                      </div>
                    ))}
                  </div>

                  {/* Steps */}
                  <div style={{ marginBottom: 16 }}>
                    <UnderlinedText>
                      <ZineText size="lg" style={{ fontWeight: 'bold' }}>
                        {t('recipe.steps') || 'Preparazione'}
                      </ZineText>
                    </UnderlinedText>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    {(recipe.steps || []).map((step, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        marginBottom: 16,
                      }}>
                        <span style={{
                          fontFamily: tokens.fonts.hand,
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: tokens.colors.ink,
                          minWidth: 24,
                        }}>
                          {i + 1}.
                        </span>
                        <p style={{
                          fontFamily: tokens.fonts.hand,
                          fontSize: 19,
                          color: tokens.colors.ink,
                          margin: 0,
                          lineHeight: 1.6,
                          flex: 1,
                        }}>
                          {formatInlineText(step)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Tips/Consigli */}
                  {recipe.tips && recipe.tips.length > 0 && (
                    <RecipeTips tips={recipe.tips} />
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button
                      onClick={() => toggleRecipeFavorite(recipe.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px 16px',
                        background: recipe.isFavorite ? tokens.colors.cream : 'transparent',
                        border: `1.5px dashed ${tokens.colors.inkFaded}`,
                        borderRadius: 8,
                        fontFamily: tokens.fonts.hand,
                        fontSize: 19,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill={recipe.isFavorite ? tokens.colors.ink : "none"}>
                        <path d="M10 17 Q4 12 4 8 Q4 4 7 4 Q9 4 10 6 Q11 4 13 4 Q16 4 16 8 Q16 12 10 17" stroke={tokens.colors.ink} strokeWidth="1.5"/>
                      </svg>
                      {recipe.isFavorite ? (t('recipe.favorited') || 'Preferita') : (t('recipe.favorite') || 'Preferisci')}
                    </button>
                    <button
                      onClick={() => shareRecipe({
                        name: recipe.name,
                        time: recipe.time,
                        servings: recipe.servings,
                        ingredients: recipe.ingredients || [],
                        steps: recipe.steps || [],
                        tips: recipe.tips,
                      }, handleShowShareModal)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px 16px',
                        background: 'transparent',
                        border: `1.5px dashed ${tokens.colors.inkFaded}`,
                        borderRadius: 8,
                        fontFamily: tokens.fonts.hand,
                        fontSize: 19,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.ink} strokeWidth="1.5">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('recipe.share') || 'Condividi'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Recipes List View */}
            {!routeId && (
              <>
            {/* Empty State - not logged in */}
            {!isAuthenticated && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <SketchBowl size={64} />
                <ZineText size="lg" style={{ display: 'block', marginTop: 16, color: '#8B857C' }}>
                  {t('recipes.loginRequired') || 'Accedi per salvare le ricette'}
                </ZineText>
                <button
                  onClick={() => openAuthModal()}
                  style={{
                    marginTop: 20,
                    padding: '10px 24px',
                    background: '#2D2A26',
                    color: '#FAF7F2',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: "'Caveat', cursive",
                    fontSize: 19,
                    cursor: 'pointer'
                  }}
                >
                  {t('auth.login')}
                </button>
              </div>
            )}

            {/* Empty State - logged in but no recipes */}
            {isAuthenticated && savedRecipes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <SketchBowl size={64} />
                <ZineText size="lg" style={{ display: 'block', marginTop: 16, color: '#8B857C' }}>
                  {t('recipes.empty') || 'Nessuna ricetta salvata'}
                </ZineText>
                <ZineText size="sm" style={{ display: 'block', marginTop: 8, color: '#A8A4A0' }}>
                  {t('recipes.emptyHint') || 'Chiedi una ricetta in chat e salvala qui'}
                </ZineText>
                <button
                  onClick={() => navigate('/chat')}
                  style={{
                    marginTop: 20,
                    padding: '10px 24px',
                    background: '#2D2A26',
                    color: '#FAF7F2',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: "'Caveat', cursive",
                    fontSize: 19,
                    cursor: 'pointer'
                  }}
                >
                  {t('nav.chat')}
                </button>
              </div>
            )}

            {/* Scopri - Weekly themes with flags */}
            <div style={{ marginBottom: 28 }}>
              <ZineText size="md" style={{ color: '#8B857C', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#8B857C" strokeWidth="1.5"/>
                  <path d="M10 6 L10 10 L13 13" stroke="#8B857C" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {t('recipes.dailyRecipes')}
              </ZineText>
              <div style={{ display: 'flex', gap: 12 }}>
                {getWeeklyThemes().map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => sendMessage(theme.prompt)}
                    style={{
                      position: 'relative',
                      padding: '16px',
                      flex: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {/* Hand-drawn border */}
                    <svg
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                      }}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      <path
                        d="M2 4 Q0 0 4 2 L96 2 Q100 0 98 4 L98 96 Q100 100 96 98 L4 98 Q0 100 2 96 Z"
                        stroke="#2D2A26"
                        strokeWidth="0.8"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Flag icon */}
                    <theme.Flag size={32} />
                    {/* Country name */}
                    <span style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: 16,
                      color: '#2D2A26',
                      textAlign: 'center',
                    }}>
                      {theme.country}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Esplora il Mondo - Globe section */}
            <DashedBox
              style={{
                marginBottom: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 24px',
              }}
            >
              <div onClick={() => setGlobeModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
              {/* Globe icon */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="24" cy="24" r="18" stroke="#2D2A26" strokeWidth="1.5" fill="none"/>
                <ellipse cx="24" cy="24" rx="9" ry="18" stroke="#2D2A26" strokeWidth="1" fill="none"/>
                <path d="M6 24 L42 24" stroke="#2D2A26" strokeWidth="1"/>
                <path d="M9 14 L39 14 M9 34 L39 34" stroke="#2D2A26" strokeWidth="0.5"/>
                <circle cx="24" cy="24" r="3" fill="#2D2A26" opacity="0.2"/>
              </svg>
              {/* Text */}
              <div style={{ flex: 1 }}>
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 22,
                  color: '#2D2A26',
                  display: 'block',
                }}>
                  Esplora il Mondo
                </span>
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 14,
                  color: '#8B857C',
                }}>
                  Scopri piatti tipici da ogni paese
                </span>
              </div>
              {/* Arrow */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M9 6 L15 12 L9 18" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              </div>
            </DashedBox>

            {/* Recipes content - only show if logged in and has recipes */}
            {isAuthenticated && savedRecipes.length > 0 && (
              <>
                {/* Tutte */}
                <ZineText size="lg" style={{ display: 'block', marginBottom: 20 }}>
                  {t('recipes.all')}
                </ZineText>

                {savedRecipes.map(r => (
                  <div
                    key={r.id}
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => navigate(`/recipes/${r.id}`)}
                  >
                    <ZineRecipeCard
                      title={r.name}
                      note={r.note || ((r.ingredients?.length ?? 0) > 0 ? `${r.ingredients.length} ingredienti` : '')}
                      time={r.time || ''}
                      iconSvg={r.iconSvg}
                      Illustration={r.iconSvg ? undefined : SketchBowl}
                    />
                    <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 2 }}>
                      {/* Favorite button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleRecipeFavorite(r.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        <svg width="22" height="22" viewBox="0 0 20 20" fill={r.isFavorite ? "#2D2A26" : "none"}>
                          <path
                            d="M10 17 Q4 12 4 8 Q4 4 7 4 Q9 4 10 6 Q11 4 13 4 Q16 4 16 8 Q16 12 10 17"
                            stroke="#2D2A26"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRecipe(r.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#C4C0B9" strokeWidth="1.5">
                          <path d="M6 6L14 14M6 14L14 6" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* I tuoi menu */}
            {isAuthenticated && savedMenus.length > 0 && (
              <>
                <ZineText size="lg" style={{ display: 'block', marginTop: 32, marginBottom: 20 }}>
                  I tuoi menu
                </ZineText>

                {savedMenus.map(menu => (
                  <div
                    key={menu.id}
                    style={{ position: 'relative', marginBottom: 12 }}
                  >
                    {/* Menu Card */}
                    <DashedBox style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        {/* Menu icon */}
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2D2A26" strokeWidth="1.2" style={{ flexShrink: 0, marginTop: 2 }}>
                          <path d="M3 3h18v18H3z" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 7h10M7 11h10M7 15h6" strokeLinecap="round"/>
                        </svg>
                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontFamily: "'Caveat', cursive",
                            fontSize: 22,
                            fontWeight: 600,
                            color: '#2D2A26',
                            marginBottom: 4,
                          }}>
                            {menu.name}
                          </div>
                          {menu.occasion && (
                            <div style={{
                              fontFamily: "'Caveat', cursive",
                              fontSize: 16,
                              color: '#8B857C',
                              fontStyle: 'italic',
                              marginBottom: 8,
                            }}>
                              {menu.occasion}
                            </div>
                          )}
                          <div style={{
                            fontFamily: "'Caveat', cursive",
                            fontSize: 15,
                            color: '#A8A4A0',
                          }}>
                            {menu.courses.length} portate
                          </div>
                        </div>
                      </div>
                    </DashedBox>
                    {/* Delete button */}
                    <button
                      onClick={() => deleteMenu(menu.id)}
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        zIndex: 2,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#C4C0B9" strokeWidth="1.5">
                        <path d="M6 6L14 14M6 14L14 6" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </>
            )}
              </>
            )}
          </div>
        )}

        {/* ============ DISPENSA ============ */}
        {screen === 'pantry' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Photo Capture Section */}
            <div style={{ marginBottom: 28 }}>
              {/* Photo thumbnails */}
              {capturedPhotos.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: 'wrap',
                }}>
                  {capturedPhotos.map((photo, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '2px solid #2D2A26',
                        }}
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#2D2A26',
                          color: '#FAF7F2',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add photo button */}
              {capturedPhotos.length < 3 && !isAnalyzingPhoto && (
                <div style={{
                  position: 'relative',
                  padding: capturedPhotos.length > 0 ? 16 : 24,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}>
                  {/* Simple hand-drawn border (same as scopri cards) */}
                  <svg
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                    }}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M2 4 Q0 0 4 2 L96 2 Q100 0 98 4 L98 96 Q100 100 96 98 L4 98 Q0 100 2 96 Z"
                      stroke="#2D2A26"
                      strokeWidth="0.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <CameraIcon />
                    <ZineText size="lg" style={{ color: '#2D2A26' }}>
                      {capturedPhotos.length === 0 ? t('pantry.takePhoto') : t('pantry.addAnotherPhoto') || 'Aggiungi altra foto'}
                    </ZineText>
                    <ZineText size="sm" style={{ color: '#8B857C' }}>
                      {capturedPhotos.length === 0
                        ? t('pantry.aiRecognizes')
                        : `${capturedPhotos.length}/3 ${t('pantry.photos') || 'foto'}`}
                    </ZineText>
                  </div>
                </div>
              )}

              {/* Analyze button */}
              {capturedPhotos.length > 0 && (
                <button
                  onClick={handleAnalyzePhotos}
                  disabled={isAnalyzingPhoto}
                  style={{
                    width: '100%',
                    marginTop: 16,
                    padding: '14px 20px',
                    background: isAnalyzingPhoto ? '#A8A4A0' : '#2D2A26',
                    color: '#FAF7F2',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: "'Caveat', cursive",
                    fontSize: 20,
                    cursor: isAnalyzingPhoto ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  {isAnalyzingPhoto ? (
                    <>
                      <span style={{ animation: 'spin 1s linear infinite' }}>*</span>
                      {t('pantry.analyzing')}
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z" strokeLinejoin="round"/>
                      </svg>
                      {t('pantry.analyzePhotos') || 'Analizza e suggerisci piatti'}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Dish Suggestions */}
            {(dishSuggestions.length > 0 || isLoadingSuggestions) && (
              <section style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 16 }}>
                  <ZineText size="lg" style={{ display: 'block' }}>
                    {t('pantry.dishSuggestions') || 'Piatti suggeriti'}
                  </ZineText>
                  <svg width="120" height="6" viewBox="0 0 120 6" style={{ display: 'block', marginTop: 6 }}>
                    <path d="M0 3 Q15 0 30 3 Q45 6 60 3 Q75 0 90 3 Q105 6 120 3" stroke="#C4C0B9" strokeWidth="1" fill="none"/>
                  </svg>
                </div>

                {isLoadingSuggestions ? (
                  <div style={{ textAlign: 'center', padding: 32 }}>
                    <ZineText size="md" style={{ color: '#8B857C' }}>
                      {t('pantry.loadingSuggestions') || 'Sto pensando ai piatti...'}
                    </ZineText>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {dishSuggestions.map((dish, index) => (
                      <button
                        key={index}
                        onClick={() => handleDishClick(dish.name)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '16px 20px',
                          background: '#FFFFFF',
                          border: '1.5px solid #E8E4DE',
                          borderRadius: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2D2A26'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E8E4DE'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                          <ZineText size="lg" style={{ color: '#2D2A26', fontWeight: 500 }}>
                            {dish.name}
                          </ZineText>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{
                              fontFamily: "'Caveat', cursive",
                              fontSize: 13,
                              color: '#8B857C',
                              background: '#F5F1EA',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}>
                              {dish.time}
                            </span>
                            <span style={{
                              fontFamily: "'Caveat', cursive",
                              fontSize: 13,
                              color: dish.difficulty === 'facile' || dish.difficulty === 'easy' ? '#4A7C59' :
                                     dish.difficulty === 'media' || dish.difficulty === 'medium' ? '#B8860B' : '#8B4513',
                              background: '#F5F1EA',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}>
                              {dish.difficulty}
                            </span>
                          </div>
                        </div>
                        <ZineText size="sm" style={{ color: '#8B857C', marginTop: 6 }}>
                          {dish.description}
                        </ZineText>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {dish.mainIngredients.slice(0, 4).map((ing, i) => (
                            <span key={i} style={{
                              fontFamily: "'Caveat', cursive",
                              fontSize: 12,
                              color: '#2D2A26',
                              background: '#FAF7F2',
                              border: '1px dashed #C4C0B9',
                              padding: '2px 6px',
                              borderRadius: 3,
                            }}>
                              {ing}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Clear suggestions */}
                <button
                  onClick={() => setDishSuggestions([])}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #C4C0B9',
                    borderRadius: 6,
                    fontFamily: "'Caveat', cursive",
                    fontSize: 15,
                    color: '#8B857C',
                    cursor: 'pointer',
                  }}
                >
                  {t('misc.clear') || 'Nascondi suggerimenti'}
                </button>
              </section>
            )}

            {/* Empty State */}
            {pantryItems.length === 0 && !isAnalyzingPhoto && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <SketchBowl size={64} />
                <ZineText size="lg" style={{ display: 'block', marginTop: 16, color: '#8B857C' }}>
                  {t('pantry.empty')}
                </ZineText>
                <ZineText size="sm" style={{ display: 'block', marginTop: 8, color: '#A8A4A0' }}>
                  {t('pantry.emptyHint')}
                </ZineText>
              </div>
            )}

            {/* Content only shows when there are items */}
            {pantryItems.length > 0 && (
              <>
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
                      {t('pantry.ingredients')}
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
                      {t('pantry.expiring')}
                    </div>
                  </div>
                </div>

                {/* Usa Presto - Only show if there are expiring items */}
                {pantryItems.filter(i => i.expiring).length > 0 && (
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
                          {t('pantry.useNow')}
                        </span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {pantryItems.filter(i => i.expiring).map(item => (
                        <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 60 }}>
                          <item.Illustration size={28} />
                          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#2D2A26' }}>{item.name}</span>
                          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: '#C4C0B9' }}>{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In Dispensa - Line style */}
                <section style={{ marginBottom: 32 }}>
                  <div style={{ marginBottom: 20 }}>
                    <ZineText size="lg" style={{ display: 'block' }}>{t('pantry.inPantry')}</ZineText>
                    <svg width="80" height="6" viewBox="0 0 80 6" style={{ display: 'block', marginTop: 6 }}>
                      <path d="M0 3 Q10 0 20 3 Q30 6 40 3 Q50 0 60 3 Q70 6 80 3" stroke="#C4C0B9" strokeWidth="1" fill="none"/>
                    </svg>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 16px' }}>
                    {pantryItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {/* Delete button */}
                        <button
                          onClick={() => deletePantryItem(item.id)}
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            background: '#FAF7F2',
                            border: '1px solid #E8E4DE',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#8B857C" strokeWidth="1.5">
                            <path d="M2 2L8 8M2 8L8 2" strokeLinecap="round"/>
                          </svg>
                        </button>
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

                  {/* Ask AI what to cook button */}
                  <button
                    onClick={() => handleGetSuggestions()}
                    disabled={isLoadingSuggestions}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      marginTop: 20,
                      padding: '12px 20px',
                      background: isLoadingSuggestions ? '#A8A4A0' : '#2D2A26',
                      color: '#FAF7F2',
                      border: 'none',
                      borderRadius: 8,
                      fontFamily: "'Caveat', cursive",
                      fontSize: 18,
                      cursor: isLoadingSuggestions ? 'wait' : 'pointer'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z" strokeLinejoin="round"/>
                    </svg>
                    {isLoadingSuggestions ? (t('pantry.loadingSuggestions') || 'Caricamento...') : t('pantry.suggestDishes')}
                  </button>
                </section>
              </>
            )}

          </div>
        )}

        {/* ============ MONDO ============ */}
        {screen === 'mondo' && (
          <GlobeModal
            isOpen={true}
            onClose={() => {}}
            onSelectCountry={() => {}}
            onAskQuestion={(question) => {
              navigate('/chat');
              setTimeout(() => sendMessage(question), 100);
            }}
            inline={true}
          />
        )}
        </main>

        {/* Fixed Chat Input - Only on chat screen with active conversation */}
        {screen === 'chat' && activeId && (
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
                {/* Options Row - Menu Mode + Skills + Diet */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 10,
                  flexWrap: 'wrap'
                }}>
                  {/* Left side: Mode + Skills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
                          {t('chat.dish')}
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
                          {t('chat.menu')}
                        </ZineText>
                      </button>
                    </div>

                    {/* Skill Pills - Toggle Style */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Stellato Pill */}
                      <button
                        onClick={() => setStellatoMode(!stellatoMode)}
                        title={t('skill.stellatoDesc')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 12px',
                          border: stellatoMode ? '1.5px solid #2D2A26' : '1.5px dashed #C4C0B9',
                          borderRadius: 16,
                          background: stellatoMode ? '#2D2A26' : 'transparent',
                          cursor: 'pointer',
                          fontFamily: "'Caveat', cursive",
                          fontSize: 15,
                          color: stellatoMode ? '#FAF7F2' : '#8B857C',
                          transition: 'all 0.15s',
                          overflow: 'hidden'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1L9.5 5.5L14 6L10.5 9.5L12 14L8 11L4 14L5.5 9.5L2 6L6.5 5.5Z"
                            stroke={stellatoMode ? '#FAF7F2' : '#8B857C'}
                            strokeWidth="1.2"
                            fill={stellatoMode ? '#FAF7F2' : 'none'}
                            strokeLinejoin="round"/>
                        </svg>
                        {t('skill.stellato')}
                      </button>

                      {/* Recupero Pill */}
                      <button
                        onClick={() => setRecuperoMode(!recuperoMode)}
                        title={t('skill.recuperoDesc')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 12px',
                          border: recuperoMode ? '1.5px solid #2D2A26' : '1.5px dashed #C4C0B9',
                          borderRadius: 16,
                          background: recuperoMode ? '#2D2A26' : 'transparent',
                          cursor: 'pointer',
                          fontFamily: "'Caveat', cursive",
                          fontSize: 15,
                          color: recuperoMode ? '#FAF7F2' : '#8B857C',
                          transition: 'all 0.15s',
                          overflow: 'hidden'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M2 8C2 4.7 4.7 2 8 2C10.2 2 12.1 3.2 13.2 5"
                            stroke={recuperoMode ? '#FAF7F2' : '#8B857C'}
                            strokeWidth="1.2"
                            strokeLinecap="round"/>
                          <path d="M14 8C14 11.3 11.3 14 8 14C5.8 14 3.9 12.8 2.8 11"
                            stroke={recuperoMode ? '#FAF7F2' : '#8B857C'}
                            strokeWidth="1.2"
                            strokeLinecap="round"/>
                          <path d="M13 2V5.5H9.5" stroke={recuperoMode ? '#FAF7F2' : '#8B857C'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 14V10.5H6.5" stroke={recuperoMode ? '#FAF7F2' : '#8B857C'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {t('skill.recupero')}
                      </button>
                    </div>
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
                            zIndex: 999
                          }}
                        />
                        {/* Options Panel */}
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          right: 0,
                          marginBottom: 8,
                          minWidth: 150,
                          zIndex: 1000,
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
                <ZineWavySeparator width="100%" color="#E8E4DE" />

                {/* Input Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={menuMode ? t('chat.menuPlaceholder') : t('chat.inputPlaceholder')}
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
                    {isLoading ? t('chat.thinking') : t('chat.send')} <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4 }}><path d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13" stroke="#FAF7F2" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </DashedBox>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        t={t}
      />

      {/* Globe Modal */}
      <GlobeModal
        isOpen={globeModalOpen}
        onClose={() => setGlobeModalOpen(false)}
        onSelectCountry={(country) => {
          sendMessage(`Suggeriscimi un piatto tipico della cucina ${country.toLowerCase()}a con la ricetta completa`);
        }}
        onAskQuestion={(question) => {
          setGlobeModalOpen(false);
          sendMessage(question);
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareModalUrl}
        recipeName={shareModalRecipeName}
      />
    </ZinePage>
  );
}

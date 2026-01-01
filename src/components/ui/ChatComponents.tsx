// ============================================
// 💬 CHEF AI - CHAT COMPONENTS
// Componenti per la conversazione con l'AI
// ============================================

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { RECIPE_CATEGORIES, type RecipeCategory } from '../../config/recipeCategories';
import { getRecipeIcon, hasRecipeIcon } from '../../config/recipeIcons';
import { UnderlinedText } from './ZineUI';

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

export const tokens = {
  colors: {
    ink: '#2D2A26',
    inkLight: '#8B857C',
    inkFaded: '#C4C0B9',
    paper: '#FAF7F2',
    paperDark: '#E8E4DE',
    cream: '#F5F1EA',
    white: '#FFFFFF',
  },
  fonts: {
    hand: "'Caveat', cursive",
  },
};

// Helper per rimuovere markdown dal testo
const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // **bold** → bold
    .replace(/\*(.*?)\*/g, '$1')       // *italic* → italic
    .replace(/__(.*?)__/g, '$1')       // __bold__ → bold
    .replace(/_(.*?)_/g, '$1');        // _italic_ → italic
};

// ============================================
// 🖼️ DECORAZIONI
// ============================================

export const Asterisk = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const Brace = ({ height = 40 }: { height?: number }) => (
  <svg width="10" height={height} viewBox={`0 0 10 ${height}`} fill="none" style={{ flexShrink: 0 }}>
    <path d={`M8 2 Q2 2 2 ${height*0.25} L2 ${height*0.45} Q2 ${height*0.5} 0 ${height*0.5} Q2 ${height*0.5} 2 ${height*0.55} L2 ${height*0.75} Q2 ${height-2} 8 ${height-2}`} stroke={tokens.colors.inkLight} strokeWidth="1" fill="none" strokeLinecap="round"/>
  </svg>
);

// ============================================
// 🍳 FOOD ICONS
// Derived from RECIPE_CATEGORIES config (single source of truth)
// ============================================

// Build FoodIcons from config
export const FoodIcons = Object.fromEntries(
  Object.entries(RECIPE_CATEGORIES).map(([key, value]) => [key, value.icon])
) as Record<RecipeCategory, React.FC<{ size?: number }>>;

// ============================================
// 📦 BOX COMPONENTS
// ============================================

interface BoxProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

// Box con angoli sketch ⌐ ⌐
export const SketchBox: React.FC<BoxProps> = ({ children, style = {} }) => (
  <div style={{ position: 'relative', padding: 16, ...style }}>
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 200 100" preserveAspectRatio="none" fill="none">
      <path d="M4 12 L4 4 L12 4" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M188 4 L196 4 L196 12" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M196 88 L196 96 L188 96" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12 96 L4 96 L4 88" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
    {children}
  </div>
);

// Box tratteggiato
export const DashedBox: React.FC<BoxProps> = ({ children, style = {} }) => (
  <div style={{ border: `1.5px dashed ${tokens.colors.inkFaded}`, borderRadius: 4, padding: 14, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

// ============================================
// 💬 CHAT COMPONENTS
// ============================================

interface MessageProps {
  children: React.ReactNode;
}

/**
 * Messaggio dell'utente
 * Box tratteggiato allineato a destra
 */
export const UserMessage: React.FC<MessageProps> = ({ children }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 20
  }}>
    <DashedBox style={{
      maxWidth: '80%',
      background: tokens.colors.white
    }}>
      <p style={{
        fontFamily: tokens.fonts.hand,
        fontSize: 17,
        color: tokens.colors.ink,
        margin: 0,
        lineHeight: 1.4,
      }}>
        {children}
      </p>
    </DashedBox>
  </div>
);

/**
 * Messaggio dell'AI
 * Con rendering Markdown e cursore opzionale per streaming
 */
interface AIMessageProps extends MessageProps {
  isStreaming?: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({ children, isStreaming }) => (
  <div style={{ marginBottom: 16 }} className="ai-message">
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p style={{
            fontFamily: tokens.fonts.hand,
            fontSize: 19,
            color: tokens.colors.ink,
            margin: '0 0 12px 0',
            lineHeight: 1.5,
          }}>
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong style={{ fontWeight: 700 }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em style={{ fontStyle: 'italic' }}>{children}</em>
        ),
        h2: ({ children }) => (
          <h2 style={{
            fontFamily: tokens.fonts.hand,
            fontSize: 24,
            color: tokens.colors.ink,
            margin: '20px 0 12px 0',
            fontWeight: 700,
          }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 style={{
            fontFamily: tokens.fonts.hand,
            fontSize: 21,
            color: tokens.colors.ink,
            margin: '16px 0 10px 0',
            fontWeight: 700,
          }}>
            {children}
          </h3>
        ),
        ul: ({ children }) => (
          <ul style={{
            fontFamily: tokens.fonts.hand,
            fontSize: 18,
            color: tokens.colors.ink,
            margin: '8px 0',
            paddingLeft: 20,
            listStyleType: 'disc',
          }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol style={{
            fontFamily: tokens.fonts.hand,
            fontSize: 18,
            color: tokens.colors.ink,
            margin: '8px 0',
            paddingLeft: 20,
          }}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li style={{
            marginBottom: 6,
            lineHeight: 1.5,
          }}>
            {children}
          </li>
        ),
      }}
    >
      {typeof children === 'string' ? children : String(children)}
    </ReactMarkdown>
    {isStreaming && (
      <>
        {/* Hand-drawn animated dots */}
        <span className="streaming-dots" style={{ display: 'inline-flex', gap: 4, marginLeft: 4, verticalAlign: 'middle' }}>
          <svg width="6" height="6" viewBox="0 0 8 8" fill="none" className="dot dot-1">
            <circle cx="4" cy="4" r="2.5" stroke={tokens.colors.inkLight} strokeWidth="1" fill="none"/>
          </svg>
          <svg width="6" height="6" viewBox="0 0 8 8" fill="none" className="dot dot-2">
            <circle cx="4" cy="4" r="2.5" stroke={tokens.colors.inkLight} strokeWidth="1" fill="none"/>
          </svg>
          <svg width="6" height="6" viewBox="0 0 8 8" fill="none" className="dot dot-3">
            <circle cx="4" cy="4" r="2.5" stroke={tokens.colors.inkLight} strokeWidth="1" fill="none"/>
          </svg>
        </span>
        <style>{`
          @keyframes dotPulse {
            0%, 60%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            30% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
          .streaming-dots .dot {
            animation: dotPulse 1.2s ease-in-out infinite;
          }
          .streaming-dots .dot-1 {
            animation-delay: 0s;
          }
          .streaming-dots .dot-2 {
            animation-delay: 0.2s;
          }
          .streaming-dots .dot-3 {
            animation-delay: 0.4s;
          }
        `}</style>
      </>
    )}
  </div>
);

// ============================================
// 🍳 RECIPE COMPONENTS
// ============================================

interface RecipeCardInlineProps {
  icon?: RecipeCategory;
  title: string;
  description?: string;
  time?: string;
  difficulty?: string;
  onClick?: () => void;
}

/**
 * Card ricetta inline nella chat
 * Con icona, titolo, descrizione, tempo e difficoltà
 */
export const RecipeCardInline: React.FC<RecipeCardInlineProps> = ({
  icon = 'bowl',
  title,
  description,
  time,
  difficulty,
  onClick
}) => {
  const IconComponent = FoodIcons[icon];

  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: 12,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <SketchBox style={{ background: tokens.colors.white }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconComponent size={32} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{
              fontFamily: tokens.fonts.hand,
              fontSize: 20,
              color: tokens.colors.ink,
              margin: 0,
              marginBottom: 2,
            }}>
              {title}
            </h4>
            {description && (
              <p style={{
                fontFamily: tokens.fonts.hand,
                fontSize: 14,
                color: tokens.colors.inkLight,
                fontStyle: 'italic',
                margin: 0,
                marginBottom: 6,
              }}>
                {description}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {time && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Asterisk size={10} />
                  <span style={{ fontFamily: tokens.fonts.hand, fontSize: 13, color: tokens.colors.inkFaded }}>
                    {time}
                  </span>
                </span>
              )}
              {difficulty && (
                <span style={{ fontFamily: tokens.fonts.hand, fontSize: 13, color: tokens.colors.inkFaded }}>
                  • {difficulty}
                </span>
              )}
            </div>
          </div>
        </div>
      </SketchBox>
    </div>
  );
};

/**
 * Lista di ricette
 * Wrapper per più RecipeCardInline
 */
export const RecipeList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginTop: 12, marginBottom: 16 }}>
    {children}
  </div>
);

/**
 * Tip/consiglio della nonna
 * Con parentesi graffa a sinistra
 */
export const Tip: React.FC<MessageProps> = ({ children }) => (
  <div style={{
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 16,
  }}>
    <Brace height={36} />
    <p style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 15,
      color: tokens.colors.inkLight,
      fontStyle: 'italic',
      margin: 0,
      lineHeight: 1.4,
      flex: 1,
    }}>
      {children}
    </p>
  </div>
);

// ============================================
// 🔘 QUICK REPLIES
// ============================================

interface QuickReplyProps {
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * Quick Reply button
 * Pill cliccabile
 */
export const QuickReply: React.FC<QuickReplyProps> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 15,
      color: tokens.colors.ink,
      padding: '8px 16px',
      border: `1.2px solid ${tokens.colors.ink}`,
      borderRadius: 20,
      background: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}
  >
    {children}
  </button>
);

/**
 * Container per quick replies
 */
export const QuickReplies: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 16,
  }}>
    {children}
  </div>
);

// ============================================
// ⏳ LOADING & DIVIDER
// ============================================

/**
 * Loading dots animati
 */
export const LoadingDots: React.FC = () => (
  <div style={{ display: 'flex', gap: 6, padding: '16px 0' }}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: tokens.colors.inkFaded,
          animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
    `}</style>
  </div>
);

/**
 * Divider semplice
 */
export const Divider: React.FC = () => (
  <div style={{
    height: 1,
    background: tokens.colors.inkFaded,
    margin: '20px 0',
    opacity: 0.5,
  }} />
);

// ============================================
// 🍳 RECIPE DETAIL COMPONENTS
// ============================================

interface RecipeHeaderProps {
  title: string;
  description?: string;
  time?: string;
  difficulty?: string;
  servings?: number | string;
  icon?: string; // New: AI-selected specific icon (e.g., "Spaghetti", "Risotto")
  category?: RecipeCategory; // Legacy: fallback category for icon selection
  iconSvg?: string;  // Deprecated: kept for backwards compatibility
}

/**
 * Header della ricetta con titolo e meta info
 */
export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  title,
  description,
  time,
  difficulty,
  servings,
  icon,
  category,
  iconSvg,
}) => {
  // Priority: AI-selected icon > category-based icon > legacy iconSvg > default bowl
  const getIcon = () => {
    if (icon && hasRecipeIcon(icon)) {
      return getRecipeIcon(icon);
    }
    if (category && FoodIcons[category]) {
      return FoodIcons[category];
    }
    return FoodIcons.bowl;
  };
  const IconComponent = getIcon();

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        {/* Priority: AI icon > category icon > legacy iconSvg > default */}
        {icon && hasRecipeIcon(icon) ? (
          <IconComponent size={48} />
        ) : category ? (
          <IconComponent size={48} />
        ) : iconSvg ? (
          <div
            dangerouslySetInnerHTML={{ __html: iconSvg }}
            style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        ) : (
          <FoodIcons.bowl size={48} />
        )}
        <div>
          <h2 style={{
            fontFamily: tokens.fonts.hand,
            fontSize: 28,
            color: tokens.colors.ink,
            margin: 0,
          }}>
            {title}
          </h2>
          {description && (
            <p style={{
              fontFamily: tokens.fonts.hand,
              fontSize: 16,
              color: tokens.colors.inkLight,
              fontStyle: 'italic',
              margin: 0,
              marginTop: 4,
            }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {time && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Asterisk size={14} />
            <span style={{ fontFamily: tokens.fonts.hand, fontSize: 15, color: tokens.colors.inkLight }}>
              {time}
            </span>
          </div>
        )}
        {difficulty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: tokens.fonts.hand, fontSize: 15, color: tokens.colors.inkLight }}>
              {difficulty}
            </span>
          </div>
        )}
        {servings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Hand-drawn person icon */}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="5" r="3" stroke={tokens.colors.inkLight} strokeWidth="1.5" fill="none"/>
              <path d="M4 18 Q4 12 10 12 Q16 12 16 18" stroke={tokens.colors.inkLight} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: tokens.fonts.hand, fontSize: 15, color: tokens.colors.inkLight }}>
              {typeof servings === 'number'
                ? `${servings} ${servings > 1 ? 'persone' : 'persona'}`
                : servings}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 🥗 INGREDIENTS
// ============================================

interface Ingredient {
  amount?: string;
  unit?: string;
  name: string;
}

interface IngredientItemProps extends Ingredient {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

/**
 * Singolo ingrediente con checkbox
 */
export const IngredientItem: React.FC<IngredientItemProps> = ({
  amount,
  unit,
  name,
  checked = false,
  onChange
}) => (
  <div
    onClick={() => onChange?.(!checked)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 0',
      cursor: onChange ? 'pointer' : 'default',
    }}
  >
    <div style={{
      width: 18,
      height: 18,
      border: `1.5px solid ${tokens.colors.ink}`,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M2 8.5 L6 12.5 L14 3.5" stroke={tokens.colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
    <span style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 17,
      color: checked ? tokens.colors.inkLight : tokens.colors.ink,
      textDecoration: checked ? 'line-through' : 'none',
    }}>
      {amount && <strong>{amount}</strong>}
      {unit && ` ${unit}`}
      {(amount || unit) && ' '}{name}
    </span>
  </div>
);

interface IngredientsListProps {
  ingredients?: Ingredient[];
  checkedItems?: number[];
  onToggle?: (index: number, checked: boolean) => void;
}

/**
 * Lista ingredienti con titolo
 */
export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients = [],
  checkedItems = [],
  onToggle
}) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ marginBottom: 16 }}>
      <UnderlinedText>
        <span style={{
          fontFamily: tokens.fonts.hand,
          fontSize: 20,
          fontWeight: 'bold',
          color: tokens.colors.ink,
        }}>
          Ingredienti
        </span>
      </UnderlinedText>
    </div>
    <DashedBox>
      {ingredients.map((ing, i) => (
        <IngredientItem
          key={i}
          amount={ing.amount}
          unit={ing.unit}
          name={ing.name}
          checked={checkedItems.includes(i)}
          onChange={(checked) => onToggle?.(i, checked)}
        />
      ))}
    </DashedBox>
  </div>
);

// ============================================
// 📋 STEPS
// ============================================

interface Step {
  text: string;
  tip?: string;
}

interface RecipeStepProps {
  number: number;
  text: string;
  tip?: string | null;
}

/**
 * Singolo step della ricetta
 */
export const RecipeStep: React.FC<RecipeStepProps> = ({ number, text, tip }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  }}>
    {/* Numero step - stile SharePage */}
    <span style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 20,
      fontWeight: 'bold',
      color: tokens.colors.ink,
      minWidth: 24,
    }}>
      {number}.
    </span>

    <div style={{ flex: 1 }}>
      <p style={{
        fontFamily: tokens.fonts.hand,
        fontSize: 17,
        color: tokens.colors.ink,
        margin: 0,
        lineHeight: 1.5,
      }}>
        {stripMarkdown(text)}
      </p>

      {/* Tip opzionale per questo step */}
      {tip && (
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          marginTop: 10,
        }}>
          <Brace height={28} />
          <p style={{
            fontFamily: tokens.fonts.hand,
            fontSize: 14,
            color: tokens.colors.inkLight,
            fontStyle: 'italic',
            margin: 0,
          }}>
            {tip}
          </p>
        </div>
      )}
    </div>
  </div>
);

interface StepsListProps {
  steps?: (string | Step)[];
}

/**
 * Lista step con titolo
 */
export const StepsList: React.FC<StepsListProps> = ({ steps = [] }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ marginBottom: 16 }}>
      <UnderlinedText>
        <span style={{
          fontFamily: tokens.fonts.hand,
          fontSize: 20,
          fontWeight: 'bold',
          color: tokens.colors.ink,
        }}>
          Preparazione
        </span>
      </UnderlinedText>
    </div>
    {steps.map((step, i) => (
      <RecipeStep
        key={i}
        number={i + 1}
        text={typeof step === 'string' ? step : step.text}
        tip={typeof step === 'object' ? step.tip : null}
      />
    ))}
  </div>
);

/**
 * Nota finale della ricetta - stile SharePage (box giallo)
 */
export const RecipeNote: React.FC<MessageProps> = ({ children }) => (
  <div style={{
    marginTop: 20,
    padding: 16,
    background: '#FFF9E6',
    borderRadius: 8,
    border: '1px dashed #E8D5A3',
  }}>
    <div style={{ marginBottom: 8 }}>
      <span style={{
        fontFamily: tokens.fonts.hand,
        fontSize: 16,
        fontWeight: 'bold',
        color: tokens.colors.ink,
      }}>
        Consigli
      </span>
    </div>
    <p style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 15,
      color: tokens.colors.inkLight,
      fontStyle: 'italic',
      margin: 0,
      lineHeight: 1.5,
    }}>
      {children}
    </p>
  </div>
);

// ============================================
// 🍳 RECIPE DETAIL (COMPLETE)
// ============================================

interface RecipeDetailProps {
  icon?: string; // New: AI-selected specific icon (e.g., "Spaghetti", "Risotto")
  category?: RecipeCategory;  // Legacy: fallback category for icon selection
  iconSvg?: string;   // Deprecated: kept for backwards compatibility
  title: string;
  description?: string;
  time?: string;
  difficulty?: string;
  servings?: number | string;
  ingredients?: Ingredient[];
  steps?: (string | Step)[];
  note?: string;
  checkedIngredients?: number[];
  onIngredientToggle?: (index: number, checked: boolean) => void;
}

/**
 * Ricetta completa - tutto insieme
 */
export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  icon,
  category,
  iconSvg,
  title,
  description,
  time,
  difficulty,
  servings,
  ingredients = [],
  steps = [],
  note,
  checkedIngredients = [],
  onIngredientToggle,
}) => (
  <div>
    <RecipeHeader
      icon={icon}
      category={category}
      iconSvg={iconSvg}
      title={title}
      description={description}
      time={time}
      difficulty={difficulty}
      servings={servings}
    />

    <Divider />

    <IngredientsList
      ingredients={ingredients}
      checkedItems={checkedIngredients}
      onToggle={onIngredientToggle}
    />

    <StepsList steps={steps} />

    {note && <RecipeNote>{note}</RecipeNote>}
  </div>
);

interface RecipeInChatProps extends Omit<RecipeDetailProps, 'checkedIngredients' | 'onIngredientToggle'> {
  onSave?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
}

/**
 * Ricetta inline nella chat (versione espansa)
 * Mostra ricetta completa dentro la conversazione
 * Senza cornice pesante - solo separatori leggeri
 * Include bottone per salvare nel ricettario e condividere
 */
export const RecipeInChat: React.FC<RecipeInChatProps> = ({
  onSave,
  onShare,
  isSaved = false,
  isSaving = false,
  ...props
}) => (
  <div style={{
    marginBottom: 24,
    paddingTop: 8,
    paddingBottom: 8,
  }}>
    <RecipeDetail {...props} />

    {/* Action buttons */}
    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
      {/* Save to cookbook button */}
      {onSave && (
        <button
          onClick={onSave}
          disabled={isSaved || isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            flex: 1,
            padding: '10px 16px',
            background: 'transparent',
            color: '#2D2A26',
            border: isSaved ? '1.5px solid #2D2A26' : '1.5px dashed #C4C0B9',
            borderRadius: 8,
            fontFamily: "'Caveat', cursive",
            fontSize: 17,
            cursor: isSaved || isSaving ? 'default' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isSaving ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="8" cy="8" r="6" stroke="#2D2A26" strokeWidth="2" strokeDasharray="20 10" />
              </svg>
              Salvo...
            </>
          ) : isSaved ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6 11L13 4" stroke="#2D2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Salvata
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 17 Q4 12 4 8 Q4 4 7 4 Q9 4 10 6 Q11 4 13 4 Q16 4 16 8 Q16 12 10 17"
                  stroke="#2D2A26"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Salva
            </>
          )}
        </button>
      )}

      {/* Share button */}
      {onShare && (
        <button
          onClick={onShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            flex: 1,
            padding: '10px 16px',
            background: 'transparent',
            color: '#2D2A26',
            border: '1.5px dashed #C4C0B9',
            borderRadius: 8,
            fontFamily: "'Caveat', cursive",
            fontSize: 17,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D2A26" strokeWidth="1.5">
            <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08261 9.19071C7.54305 8.46589 6.6892 8 5.72727 8C4.22104 8 3 9.34315 3 11C3 12.6569 4.22104 14 5.72727 14C6.6892 14 7.54305 13.5341 8.08261 12.8093L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.0381 14 16.1842 14.4659 15.6446 15.1907L8.70455 11.3706C8.71951 11.2492 8.72727 11.1255 8.72727 11C8.72727 10.8745 8.71951 10.7508 8.70455 10.6294L15.6446 6.80929C16.1842 7.53411 17.0381 8 18 8Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Condividi
        </button>
      )}
    </div>
  </div>
);

// ============================================
// 📦 AI RESPONSE BLOCK
// ============================================

interface Recipe {
  icon?: RecipeCategory;
  title?: string;
  name?: string;
  description?: string;
  time?: string;
  difficulty?: string;
}

interface AIResponseBlockProps {
  message?: string;
  recipes?: Recipe[];
  tip?: string;
  quickReplies?: string[];
  onRecipeClick?: (recipe: Recipe) => void;
  onQuickReplyClick?: (reply: string) => void;
}

/**
 * Contenitore per un blocco di risposta AI completo
 * Raggruppa messaggio + ricette + tip + quick replies
 */
export const AIResponseBlock: React.FC<AIResponseBlockProps> = ({
  message,
  recipes = [],
  tip,
  quickReplies = [],
  onRecipeClick,
  onQuickReplyClick,
}) => (
  <div style={{ marginBottom: 24 }}>
    {/* Messaggio principale */}
    {message && <AIMessage>{message}</AIMessage>}

    {/* Lista ricette */}
    {recipes.length > 0 && (
      <RecipeList>
        {recipes.map((recipe, i) => (
          <RecipeCardInline
            key={i}
            icon={recipe.icon}
            title={recipe.title || recipe.name || ''}
            description={recipe.description}
            time={recipe.time}
            difficulty={recipe.difficulty}
            onClick={() => onRecipeClick?.(recipe)}
          />
        ))}
      </RecipeList>
    )}

    {/* Tip della nonna */}
    {tip && <Tip>{tip}</Tip>}

    {/* Quick replies */}
    {quickReplies.length > 0 && (
      <QuickReplies>
        {quickReplies.map((reply, i) => (
          <QuickReply key={i} onClick={() => onQuickReplyClick?.(reply)}>
            {reply}
          </QuickReply>
        ))}
      </QuickReplies>
    )}
  </div>
);

// ============================================
// 📋 CONVERSATION LIST
// ============================================

interface ConversationListItemProps {
  title: string;
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

/**
 * Item nella lista conversazioni
 */
export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  title,
  isActive = false,
  onClick,
  onDelete,
}) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      borderRadius: 8,
      cursor: 'pointer',
      background: 'transparent',
    }}
  >
    <span style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 15,
      color: isActive ? tokens.colors.ink : tokens.colors.inkLight,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
    }}>
      {title}
    </span>
    {onDelete && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          opacity: 0.5,
          transition: 'opacity 0.15s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 4 L12 12 M12 4 L4 12" stroke={tokens.colors.inkLight} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    )}
  </div>
);

/**
 * Bottone "Nuova Chat"
 */
export const NewChatButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      padding: '12px 14px',
      background: 'transparent',
      border: `1.5px dashed ${tokens.colors.inkFaded}`,
      borderRadius: 8,
      cursor: 'pointer',
      fontFamily: tokens.fonts.hand,
      fontSize: 15,
      color: tokens.colors.inkLight,
      transition: 'all 0.15s',
    }}
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2 L8 14 M2 8 L14 8" stroke={tokens.colors.inkLight} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    Nuova chat
  </button>
);

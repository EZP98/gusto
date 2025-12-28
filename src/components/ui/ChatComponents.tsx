// ============================================
// 💬 CHEF AI - CHAT COMPONENTS
// Componenti per la conversazione con l'AI
// ============================================

import React from 'react';

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const tokens = {
  colors: {
    ink: '#2D2A26',
    inkLight: '#8B857C',
    inkFaded: '#C4C0B9',
    paper: '#FAF7F2',
    paperDark: '#E8E4DE',
    white: '#FFFFFF',
  },
  fonts: {
    hand: "'Caveat', cursive",
  },
};

// ============================================
// 🖼️ DECORAZIONI
// ============================================

const Asterisk = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const Brace = ({ height = 40 }: { height?: number }) => (
  <svg width="10" height={height} viewBox={`0 0 10 ${height}`} fill="none" style={{ flexShrink: 0 }}>
    <path d={`M8 2 Q2 2 2 ${height*0.25} L2 ${height*0.45} Q2 ${height*0.5} 0 ${height*0.5} Q2 ${height*0.5} 2 ${height*0.55} L2 ${height*0.75} Q2 ${height-2} 8 ${height-2}`} stroke={tokens.colors.inkLight} strokeWidth="1" fill="none" strokeLinecap="round"/>
  </svg>
);

// ============================================
// 🍳 FOOD ICONS
// ============================================

const FoodIcons: Record<string, React.FC<{ size?: number }>> = {
  egg: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="18" rx="8" ry="11" stroke={tokens.colors.ink} strokeWidth="1.2"/>
    </svg>
  ),
  pasta: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="10" y="4" width="12" height="24" rx="1" stroke={tokens.colors.ink} strokeWidth="1.2"/>
      <path d="M14 10 L14 22 M18 10 L18 22" stroke={tokens.colors.ink} strokeWidth="1"/>
    </svg>
  ),
  bowl: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 14 Q4 26 16 26 Q28 26 28 14" stroke={tokens.colors.ink} strokeWidth="1.2"/>
      <ellipse cx="16" cy="14" rx="12" ry="4" stroke={tokens.colors.ink} strokeWidth="1.2"/>
    </svg>
  ),
  tomato: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="18" r="10" stroke={tokens.colors.ink} strokeWidth="1.2"/>
      <path d="M16 8 L16 5" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  bread: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M6 18 Q6 10 16 10 Q26 10 26 18 L26 24 L6 24 Z" stroke={tokens.colors.ink} strokeWidth="1.2"/>
    </svg>
  ),
  cheese: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 24 L16 6 L28 24 Z" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="12" cy="20" r="2" stroke={tokens.colors.ink} strokeWidth="1"/>
      <circle cx="20" cy="18" r="1.5" stroke={tokens.colors.ink} strokeWidth="1"/>
    </svg>
  ),
  salad: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 16 Q4 26 16 26 Q28 26 28 16" stroke={tokens.colors.ink} strokeWidth="1.2"/>
      <ellipse cx="16" cy="16" rx="12" ry="4" stroke={tokens.colors.ink} strokeWidth="1.2"/>
    </svg>
  ),
  pizza: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4 L4 28 L28 28 Z" stroke={tokens.colors.ink} strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="12" cy="20" r="2" stroke={tokens.colors.ink} strokeWidth="1"/>
      <circle cx="18" cy="22" r="1.5" stroke={tokens.colors.ink} strokeWidth="1"/>
    </svg>
  ),
};

// ============================================
// 📦 BOX COMPONENTS
// ============================================

interface BoxProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const SketchBox: React.FC<BoxProps> = ({ children, style = {} }) => (
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

const DashedBox: React.FC<BoxProps> = ({ children, style = {} }) => (
  <div style={{ border: `1.5px dashed ${tokens.colors.inkFaded}`, borderRadius: 4, padding: 14, ...style }}>
    {children}
  </div>
);

// ============================================
// 💬 CHAT COMPONENTS
// ============================================

interface MessageProps {
  children: React.ReactNode;
}

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

export const AIMessage: React.FC<MessageProps> = ({ children }) => (
  <div style={{ marginBottom: 16 }}>
    <p style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 19,
      color: tokens.colors.ink,
      margin: 0,
      lineHeight: 1.5,
    }}>
      {children}
    </p>
  </div>
);

// ============================================
// 🍳 RECIPE COMPONENTS
// ============================================

interface RecipeCardInlineProps {
  icon?: string;
  title: string;
  description?: string;
  time?: string;
  difficulty?: string;
  onClick?: () => void;
}

export const RecipeCardInline: React.FC<RecipeCardInlineProps> = ({
  icon = 'bowl',
  title,
  description,
  time,
  difficulty,
  onClick
}) => {
  const IconComponent = FoodIcons[icon] || FoodIcons.bowl;

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

export const RecipeList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginTop: 12, marginBottom: 16 }}>
    {children}
  </div>
);

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
  servings?: number;
  icon?: string;
}

const DifficultyDots: React.FC<{ level?: number; max?: number }> = ({ level = 1, max = 3 }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: `1.2px solid ${tokens.colors.ink}`,
          background: i < level ? tokens.colors.ink : 'transparent',
        }}
      />
    ))}
  </div>
);

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  title,
  description,
  time,
  difficulty,
  servings,
  icon = 'bowl'
}) => {
  const IconComponent = FoodIcons[icon] || FoodIcons.bowl;
  const difficultyLevel = difficulty === 'facile' ? 1 : difficulty === 'media' ? 2 : 3;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <IconComponent size={48} />
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
            <DifficultyDots level={difficultyLevel} />
            <span style={{ fontFamily: tokens.fonts.hand, fontSize: 15, color: tokens.colors.inkLight }}>
              {difficulty}
            </span>
          </div>
        )}
        {servings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>👤</span>
            <span style={{ fontFamily: tokens.fonts.hand, fontSize: 15, color: tokens.colors.inkLight }}>
              {servings} {servings > 1 ? 'persone' : 'persona'}
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

export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients = [],
  checkedItems = [],
  onToggle
}) => (
  <div style={{ marginBottom: 28 }}>
    <h3 style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 20,
      color: tokens.colors.ink,
      marginBottom: 12,
    }}>
      Ingredienti
    </h3>
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
  tip?: string;
}

export const RecipeStep: React.FC<RecipeStepProps> = ({ number, text, tip }) => (
  <div style={{
    display: 'flex',
    gap: 14,
    marginBottom: 20,
  }}>
    <div style={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      border: `1.5px solid ${tokens.colors.ink}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontFamily: tokens.fonts.hand,
      fontSize: 16,
      color: tokens.colors.ink,
    }}>
      {number}
    </div>

    <div style={{ flex: 1 }}>
      <p style={{
        fontFamily: tokens.fonts.hand,
        fontSize: 17,
        color: tokens.colors.ink,
        margin: 0,
        lineHeight: 1.5,
      }}>
        {text}
      </p>

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

export const StepsList: React.FC<StepsListProps> = ({ steps = [] }) => (
  <div style={{ marginBottom: 28 }}>
    <h3 style={{
      fontFamily: tokens.fonts.hand,
      fontSize: 20,
      color: tokens.colors.ink,
      marginBottom: 16,
    }}>
      Preparazione
    </h3>
    {steps.map((step, i) => (
      <RecipeStep
        key={i}
        number={i + 1}
        text={typeof step === 'string' ? step : step.text}
        tip={typeof step === 'object' ? step.tip : undefined}
      />
    ))}
  </div>
);

export const RecipeNote: React.FC<MessageProps> = ({ children }) => (
  <SketchBox style={{ background: `${tokens.colors.paperDark}40`, marginTop: 20 }}>
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16 }}>📝</span>
      <p style={{
        fontFamily: tokens.fonts.hand,
        fontSize: 15,
        color: tokens.colors.inkLight,
        fontStyle: 'italic',
        margin: 0,
        lineHeight: 1.4,
      }}>
        {children}
      </p>
    </div>
  </SketchBox>
);

// ============================================
// 🍳 RECIPE DETAIL (COMPLETE)
// ============================================

interface RecipeDetailProps {
  icon?: string;
  title: string;
  description?: string;
  time?: string;
  difficulty?: string;
  servings?: number;
  ingredients?: Ingredient[];
  steps?: (string | Step)[];
  note?: string;
  checkedIngredients?: number[];
  onIngredientToggle?: (index: number, checked: boolean) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  icon,
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

export const RecipeInChat: React.FC<Omit<RecipeDetailProps, 'checkedIngredients' | 'onIngredientToggle'>> = (props) => (
  <div style={{ marginBottom: 24 }}>
    <SketchBox style={{ background: tokens.colors.white, padding: 20 }}>
      <RecipeDetail {...props} />
    </SketchBox>
  </div>
);

// ============================================
// 📦 AI RESPONSE BLOCK
// ============================================

interface Recipe {
  icon?: string;
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

export const AIResponseBlock: React.FC<AIResponseBlockProps> = ({
  message,
  recipes = [],
  tip,
  quickReplies = [],
  onRecipeClick,
  onQuickReplyClick,
}) => (
  <div style={{ marginBottom: 24 }}>
    {message && <AIMessage>{message}</AIMessage>}

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

    {tip && <Tip>{tip}</Tip>}

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
// 📤 EXPORTS
// ============================================

export { tokens, FoodIcons, SketchBox, DashedBox, Asterisk, Brace };

// ============================================
// CHEF UI COMPONENTS
// Specialized UI components for cooking app
// ============================================

import type { ReactNode, CSSProperties, ComponentType } from 'react';

// ============================================
// THEME & CONSTANTS
// ============================================

export const theme = {
  colors: {
    ink: '#2D2A26',
    paper: '#FAF7F2',
    paperDark: '#F0EBE3',
    muted: '#8B857C',
    mutedLight: '#A8A4A0',
    accent: '#E8E4DE',
    warning: '#FFFBF0',
    success: '#F0F8F0',
  },
  fonts: {
    handwritten: "'Caveat', cursive",
  },
  sizes: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 26,
    xl: 34,
    xxl: 42,
  },
};

// ============================================
// BASE TYPES
// ============================================

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface BaseProps {
  style?: CSSProperties;
  className?: string;
}

// ============================================
// TYPOGRAPHY
// ============================================

interface TextProps extends BaseProps {
  children: ReactNode;
  size?: Size | number;
  color?: string;
  italic?: boolean;
  crossed?: boolean;
  block?: boolean;
}

export const Text = ({
  children,
  size = 'md',
  color = theme.colors.ink,
  italic = false,
  crossed = false,
  block = false,
  style = {}
}: TextProps) => {
  const fontSize = typeof size === 'number' ? size : theme.sizes[size];

  return (
    <span style={{
      fontFamily: theme.fonts.handwritten,
      fontSize,
      color,
      fontStyle: italic ? 'italic' : 'normal',
      textDecoration: crossed ? 'line-through' : 'none',
      display: block ? 'block' : 'inline',
      ...style
    }}>
      {children}
    </span>
  );
};

interface HeadingProps extends BaseProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  subtitle?: string;
}

export const Heading = ({ children, level = 2, subtitle, style = {} }: HeadingProps) => {
  const sizes = { 1: 42, 2: 34, 3: 26 };

  return (
    <div style={{ marginBottom: 16, ...style }}>
      <div style={{
        fontFamily: theme.fonts.handwritten,
        fontSize: sizes[level],
        color: theme.colors.ink,
        lineHeight: 1.2,
      }}>
        {children}
      </div>
      {subtitle && (
        <Text size="sm" color={theme.colors.muted} style={{ marginTop: 4 }}>
          {subtitle}
        </Text>
      )}
    </div>
  );
};

// ============================================
// DECORATIVE ELEMENTS
// ============================================

export const Underline = ({ width = 100, style = {} }: { width?: number | string; style?: CSSProperties }) => {
  const w = typeof width === 'number' ? width : 100;
  return (
    <svg width={width} height="8" viewBox={`0 0 ${w} 8`} style={style} fill="none">
      <path
        d={`M2 5 Q${w/4} 2 ${w/2} 5 Q${w*0.75} 8 ${w-2} 4`}
        stroke={theme.colors.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Squiggle = ({ width = 100 }: { width?: number }) => (
  <svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none">
    <path
      d={`M2 6 Q${width * 0.15} 2 ${width * 0.25} 6 Q${width * 0.35} 10 ${width * 0.5} 6 Q${width * 0.65} 2 ${width * 0.75} 6 Q${width * 0.85} 10 ${width - 2} 6`}
      stroke={theme.colors.ink}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const Divider = ({ style = {} }: BaseProps) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '24px 0',
    ...style
  }}>
    <div style={{ flex: 1, height: 1, background: theme.colors.accent }} />
    <Star size={12} />
    <div style={{ flex: 1, height: 1, background: theme.colors.accent }} />
  </div>
);

// ============================================
// ICONS
// ============================================

export const Star = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13" stroke={theme.colors.ink} strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const Heart = ({ size = 20, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? theme.colors.ink : 'none'}>
    <path
      d="M10 17 Q4 12 4 8 Q4 4 7 4 Q9 4 10 6 Q11 4 13 4 Q16 4 16 8 Q16 12 10 17"
      stroke={theme.colors.ink}
      strokeWidth="1.5"
      fill={filled ? theme.colors.ink : 'none'}
      strokeLinecap="round"
    />
  </svg>
);

export const Check = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M2 9 L6 13 L14 3" stroke={theme.colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const X = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 3 L13 13 M13 3 L3 13" stroke={theme.colors.ink} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const Arrow = ({ direction = 'right', size = 24 }: { direction?: 'left' | 'right' | 'up' | 'down'; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    style={{
      transform: direction === 'left' ? 'scaleX(-1)' :
                 direction === 'down' ? 'rotate(90deg)' :
                 direction === 'up' ? 'rotate(-90deg)' : 'none'
    }}>
    <path d="M4 12 Q8 11 12 12 Q16 13 20 12" stroke={theme.colors.ink} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 8 Q18 10 20 12 Q18 14 16 16" stroke={theme.colors.ink} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const Plus = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M10 4 L10 16 M4 10 L16 10" stroke={theme.colors.ink} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const Menu = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={theme.colors.ink} strokeWidth="2">
    <path d="M4 6H20M4 12H20M4 18H20" strokeLinecap="round"/>
  </svg>
);

export const Clock = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={theme.colors.ink} strokeWidth="1.5"/>
    <path d="M10 5 L10 10 L13 12" stroke={theme.colors.ink} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const Fire = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M10 2 Q6 8 6 12 Q6 18 10 18 Q14 18 14 12 Q14 8 10 2" stroke={theme.colors.ink} strokeWidth="1.5" fill="none"/>
    <path d="M10 10 Q8 12 8 14 Q8 16 10 16 Q12 16 12 14 Q12 12 10 10" stroke={theme.colors.ink} strokeWidth="1"/>
  </svg>
);

export const Leaf = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M4 16 Q4 8 10 4 Q16 8 16 16" stroke={theme.colors.ink} strokeWidth="1.5" fill="none"/>
    <path d="M10 4 L10 16" stroke={theme.colors.ink} strokeWidth="1"/>
  </svg>
);

// ============================================
// FRAMES & CONTAINERS
// ============================================

interface FrameProps extends BaseProps {
  children: ReactNode;
}

export const Frame = ({ children, style = {} }: FrameProps) => (
  <div style={{ position: 'relative', padding: 16, ...style }}>
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 200 200"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M8 12 Q4 8 12 6 L185 8 Q194 6 192 14 L190 186 Q192 194 184 192 L14 188 Q6 190 8 182 Z"
        stroke={theme.colors.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    {children}
  </div>
);

export const DoubleFrame = ({ children, style = {} }: FrameProps) => (
  <div style={{ position: 'relative', padding: 20, ...style }}>
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 200 200"
      preserveAspectRatio="none"
      fill="none"
    >
      <path d="M4 8 L192 6 Q196 6 196 10 L194 190 Q194 196 188 194 L10 192 Q4 192 6 186 Z" stroke={theme.colors.ink} strokeWidth="1" />
      <path d="M14 18 L184 16 Q188 16 186 22 L184 180 Q184 186 178 184 L18 182 Q12 182 14 176 Z" stroke={theme.colors.ink} strokeWidth="1" />
    </svg>
    {children}
  </div>
);

export const CornerFrame = ({ children, style = {} }: FrameProps) => (
  <div style={{ padding: 20, position: 'relative', background: theme.colors.paper, ...style }}>
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', top: 0, left: 0 }}>
      <path d="M0 15 L0 0 L15 0" stroke={theme.colors.ink} strokeWidth="1" fill="none"/>
    </svg>
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', top: 0, right: 0, transform: 'scaleX(-1)' }}>
      <path d="M0 15 L0 0 L15 0" stroke={theme.colors.ink} strokeWidth="1" fill="none"/>
    </svg>
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', bottom: 0, left: 0, transform: 'scaleY(-1)' }}>
      <path d="M0 15 L0 0 L15 0" stroke={theme.colors.ink} strokeWidth="1" fill="none"/>
    </svg>
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', bottom: 0, right: 0, transform: 'scale(-1)' }}>
      <path d="M0 15 L0 0 L15 0" stroke={theme.colors.ink} strokeWidth="1" fill="none"/>
    </svg>
    {children}
  </div>
);

export const CircleHighlight = ({ children, style = {} }: FrameProps) => (
  <span style={{ position: 'relative', display: 'inline-block', padding: '4px 12px', ...style }}>
    <svg
      style={{ position: 'absolute', top: -4, left: -4, width: 'calc(100% + 8px)', height: 'calc(100% + 8px)', pointerEvents: 'none' }}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      fill="none"
    >
      <ellipse cx="50" cy="20" rx="46" ry="16" stroke={theme.colors.ink} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    {children}
  </span>
);

// ============================================
// RECIPE COMPONENTS
// ============================================

interface RecipeCardProps extends BaseProps {
  title: string;
  description?: string;
  time?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  Illustration?: ComponentType<{ size?: number }>;
  favorite?: boolean;
  onFavoriteClick?: () => void;
  onClick?: () => void;
}

export const RecipeCard = ({
  title,
  description,
  time,
  difficulty,
  Illustration,
  favorite = false,
  onFavoriteClick,
  onClick,
  style = {}
}: RecipeCardProps) => {
  const difficultyColors = {
    easy: '#4CAF50',
    medium: '#FF9800',
    hard: '#F44336',
  };

  return (
    <div style={{ position: 'relative', marginBottom: 20, ...style }}>
      <Frame style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <div onClick={onClick} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {Illustration && (
            <div style={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: theme.colors.paperDark,
              borderRadius: 8,
            }}>
              <Illustration size={56} />
            </div>
          )}

          <div style={{ flex: 1 }}>
            <Text size="lg" block style={{ marginBottom: 4 }}>{title}</Text>

            {description && (
              <Text size="sm" color={theme.colors.muted} italic block style={{ marginBottom: 8 }}>
                {description}
              </Text>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {time && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} />
                  <Text size="xs" color={theme.colors.muted}>{time}</Text>
                </div>
              )}

              {difficulty && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Fire size={14} />
                  <Text size="xs" color={difficultyColors[difficulty]}>{difficulty}</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </Frame>

      {onFavoriteClick && (
        <button
          onClick={(e) => { e.stopPropagation(); onFavoriteClick(); }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <Heart size={22} filled={favorite} />
        </button>
      )}
    </div>
  );
};

interface RecipeStepProps extends BaseProps {
  step: number;
  children: ReactNode;
  completed?: boolean;
  onToggle?: () => void;
}

export const RecipeStep = ({ step, children, completed = false, onToggle, style = {} }: RecipeStepProps) => (
  <div
    onClick={onToggle}
    style={{
      display: 'flex',
      gap: 16,
      marginBottom: 20,
      cursor: onToggle ? 'pointer' : 'default',
      opacity: completed ? 0.5 : 1,
      ...style
    }}
  >
    <div style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: `2px solid ${theme.colors.ink}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      background: completed ? theme.colors.ink : 'transparent',
    }}>
      {completed ? (
        <Check size={16} />
      ) : (
        <Text size="sm" color={theme.colors.ink}>{step}</Text>
      )}
    </div>
    <div style={{ flex: 1, paddingTop: 4 }}>
      <Text size="md" crossed={completed}>{children}</Text>
    </div>
  </div>
);

// ============================================
// INGREDIENT COMPONENTS
// ============================================

interface IngredientProps extends BaseProps {
  name: string;
  amount?: string;
  unit?: string;
  Illustration?: ComponentType<{ size?: number }>;
  expiring?: boolean;
  onClick?: () => void;
}

export const IngredientCard = ({
  name,
  amount,
  unit,
  Illustration,
  expiring = false,
  onClick,
  style = {}
}: IngredientProps) => (
  <div
    onClick={onClick}
    style={{
      textAlign: 'center',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}
  >
    <Frame style={{
      padding: 12,
      marginBottom: 4,
      background: expiring ? theme.colors.warning : 'transparent',
    }}>
      {Illustration && <Illustration size={48} />}
    </Frame>
    <Text size="sm" block>{name}</Text>
    {(amount || unit) && (
      <Text size="xs" color={theme.colors.muted} block>
        {amount}{unit && ` ${unit}`}
      </Text>
    )}
    {expiring && (
      <Text size="xs" color="#E65100" block style={{ marginTop: 2 }}>
        in scadenza!
      </Text>
    )}
  </div>
);

interface IngredientListItemProps extends BaseProps {
  name: string;
  amount?: string;
  checked?: boolean;
  onToggle?: () => void;
}

export const IngredientListItem = ({
  name,
  amount,
  checked = false,
  onToggle,
  style = {}
}: IngredientListItemProps) => (
  <div
    onClick={onToggle}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${theme.colors.accent}`,
      cursor: onToggle ? 'pointer' : 'default',
      ...style
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 18,
        height: 18,
        border: `1.5px solid ${theme.colors.ink}`,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {checked && <Check size={12} />}
      </div>
      <Text size="md" crossed={checked} color={checked ? theme.colors.mutedLight : theme.colors.ink}>
        {name}
      </Text>
    </div>
    {amount && (
      <Text size="sm" color={theme.colors.muted}>{amount}</Text>
    )}
  </div>
);

// ============================================
// NUTRITION & INFO
// ============================================

interface NutritionBadgeProps extends BaseProps {
  label: string;
  value: string;
}

export const NutritionBadge = ({ label, value, style = {} }: NutritionBadgeProps) => (
  <div style={{
    textAlign: 'center',
    padding: '12px 16px',
    background: theme.colors.paperDark,
    borderRadius: 8,
    ...style
  }}>
    <Text size="lg" block>{value}</Text>
    <Text size="xs" color={theme.colors.muted} block>{label}</Text>
  </div>
);

interface TagProps extends BaseProps {
  children: ReactNode;
  variant?: 'default' | 'vegetarian' | 'vegan' | 'glutenFree';
}

export const Tag = ({ children, variant = 'default', style = {} }: TagProps) => {
  const colors = {
    default: { bg: theme.colors.paperDark, text: theme.colors.ink },
    vegetarian: { bg: '#E8F5E9', text: '#2E7D32' },
    vegan: { bg: '#F3E5F5', text: '#7B1FA2' },
    glutenFree: { bg: '#FFF3E0', text: '#E65100' },
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      background: colors[variant].bg,
      borderRadius: 12,
      ...style
    }}>
      {variant === 'vegetarian' && <Leaf size={12} />}
      <Text size="xs" color={colors[variant].text}>{children}</Text>
    </span>
  );
};

// ============================================
// FORM ELEMENTS
// ============================================

interface ButtonProps extends BaseProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style = {}
}: ButtonProps) => {
  const sizes = { sm: 16, md: 20, lg: 24 };
  const paddings = { sm: '8px 16px', md: '12px 24px', lg: '16px 32px' };

  const variants = {
    primary: { bg: theme.colors.ink, color: theme.colors.paper, border: theme.colors.ink },
    secondary: { bg: 'transparent', color: theme.colors.ink, border: theme.colors.ink },
    ghost: { bg: 'transparent', color: theme.colors.ink, border: 'transparent' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: theme.fonts.handwritten,
        fontSize: sizes[size],
        padding: paddings[size],
        background: variants[variant].bg,
        color: variants[variant].color,
        border: `2px solid ${variants[variant].border}`,
        borderRadius: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'transform 0.2s',
        ...style
      }}
    >
      {children}
    </button>
  );
};

interface InputProps extends BaseProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  multiline?: boolean;
  rows?: number;
}

export const Input = ({
  placeholder,
  value,
  onChange,
  onSubmit,
  multiline = false,
  rows = 3,
  style = {}
}: InputProps) => {
  const baseStyle: CSSProperties = {
    width: '100%',
    fontFamily: theme.fonts.handwritten,
    fontSize: 20,
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${theme.colors.ink}`,
    outline: 'none',
    color: theme.colors.ink,
    resize: 'none',
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        style={baseStyle}
      />
    );
  }

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
      style={baseStyle}
    />
  );
};

// ============================================
// LAYOUT COMPONENTS
// ============================================

interface PageProps extends BaseProps {
  children: ReactNode;
}

export const Page = ({ children, style = {} }: PageProps) => (
  <div style={{
    background: theme.colors.paper,
    minHeight: '100vh',
    position: 'relative',
    ...style
  }}>
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      opacity: 0.02,
      pointerEvents: 'none',
      zIndex: 0
    }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  </div>
);

interface SectionProps extends BaseProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}

export const Section = ({ children, title, action, style = {} }: SectionProps) => (
  <div style={{ marginBottom: 32, ...style }}>
    {(title || action) && (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        {title && (
          <div>
            <Text size="lg">{title}</Text>
            <Underline width={title.length * 12} />
          </div>
        )}
        {action}
      </div>
    )}
    {children}
  </div>
);

interface GridProps extends BaseProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
}

export const Grid = ({ children, columns = 3, gap = 16, style = {} }: GridProps) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    ...style
  }}>
    {children}
  </div>
);

// ============================================
// FEEDBACK COMPONENTS
// ============================================

interface AlertProps extends BaseProps {
  children: ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'error';
  icon?: ReactNode;
}

export const Alert = ({ children, variant = 'info', icon, style = {} }: AlertProps) => {
  const colors = {
    info: theme.colors.paperDark,
    warning: theme.colors.warning,
    success: theme.colors.success,
    error: '#FFEBEE',
  };

  return (
    <CornerFrame style={{ background: colors[variant], ...style }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {icon && <div style={{ flexShrink: 0 }}>{icon}</div>}
        <div>{children}</div>
      </div>
    </CornerFrame>
  );
};

interface EmptyStateProps extends BaseProps {
  Illustration?: ComponentType<{ size?: number }>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ Illustration, title, description, action, style = {} }: EmptyStateProps) => (
  <div style={{ textAlign: 'center', padding: 40, ...style }}>
    {Illustration && (
      <div style={{ marginBottom: 16, opacity: 0.5 }}>
        <Illustration size={80} />
      </div>
    )}
    <Text size="lg" block style={{ marginBottom: 8 }}>{title}</Text>
    {description && (
      <Text size="sm" color={theme.colors.muted} block style={{ marginBottom: 16 }}>
        {description}
      </Text>
    )}
    {action}
  </div>
);

// ============================================
// QUOTE COMPONENT
// ============================================

interface QuoteProps extends BaseProps {
  children: ReactNode;
  author?: string;
}

export const Quote = ({ children, author, style = {} }: QuoteProps) => (
  <div style={{
    display: 'flex',
    gap: 12,
    padding: '16px 0',
    borderTop: `1px solid ${theme.colors.accent}`,
    borderBottom: `1px solid ${theme.colors.accent}`,
    ...style
  }}>
    <Text size="xl" color={theme.colors.muted}>"</Text>
    <div style={{ flex: 1 }}>
      <Text size="md" italic block style={{ lineHeight: 1.6 }}>
        {children}
      </Text>
      {author && (
        <Text size="sm" color={theme.colors.muted} block style={{ marginTop: 8 }}>
          — {author}
        </Text>
      )}
    </div>
    <Text size="xl" color={theme.colors.muted}>"</Text>
  </div>
);

// ============================================
// EXPORT ALL
// ============================================

export default {
  theme,
  // Typography
  Text,
  Heading,
  // Decorative
  Underline,
  Squiggle,
  Divider,
  // Icons
  Star,
  Heart,
  Check,
  X,
  Arrow,
  Plus,
  Menu,
  Clock,
  Fire,
  Leaf,
  // Frames
  Frame,
  DoubleFrame,
  CornerFrame,
  CircleHighlight,
  // Recipe
  RecipeCard,
  RecipeStep,
  // Ingredients
  IngredientCard,
  IngredientListItem,
  // Info
  NutritionBadge,
  Tag,
  // Form
  Button,
  Input,
  // Layout
  Page,
  Section,
  Grid,
  // Feedback
  Alert,
  EmptyState,
  Quote,
};

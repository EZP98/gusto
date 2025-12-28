import type { ReactNode } from 'react';

// ============================================
// 🎨 ZINE STYLE UI LIBRARY
// ============================================

// ============================================
// HAND-DRAWN SVG FRAMES & ELEMENTS
// ============================================

interface FrameProps {
  children: ReactNode;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
}

export const HandDrawnFrame = ({ children, width = '100%', height = 'auto', style = {} }: FrameProps) => (
  <div style={{ position: 'relative', width, height, padding: '16px', ...style }}>
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 200 200"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M8 12 Q4 8 12 6 L185 8 Q194 6 192 14 L190 186 Q192 194 184 192 L14 188 Q6 190 8 182 Z"
        stroke="#2D2A26"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 8 Q2 12 6 16" stroke="#2D2A26" strokeWidth="1" fill="none"/>
      <path d="M194 8 Q198 12 194 16" stroke="#2D2A26" strokeWidth="1" fill="none"/>
    </svg>
    {children}
  </div>
);

export const DoubleFrame = ({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) => (
  <div style={{ position: 'relative', padding: '20px', ...style }}>
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 200 200"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M4 8 L192 6 Q196 6 196 10 L194 190 Q194 196 188 194 L10 192 Q4 192 6 186 Z"
        stroke="#2D2A26"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M14 18 L184 16 Q188 16 186 22 L184 180 Q184 186 178 184 L18 182 Q12 182 14 176 Z"
        stroke="#2D2A26"
        strokeWidth="1"
        fill="none"
      />
    </svg>
    {children}
  </div>
);

export const Underline = ({ width = 100, style = {} }: { width?: number | string; style?: React.CSSProperties }) => {
  const w = typeof width === 'number' ? width : 100;
  return (
    <svg width={width} height="8" viewBox={`0 0 ${w} 8`} style={style} fill="none">
      <path
        d={`M2 5 Q${w/4} 2 ${w/2} 5 Q${w*0.75} 8 ${w-2} 4`}
        stroke="#2D2A26"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const CircleHighlight = ({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) => (
  <span style={{ position: 'relative', display: 'inline-block', padding: '4px 12px', ...style }}>
    <svg
      style={{ position: 'absolute', top: '-4px', left: '-4px', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)', pointerEvents: 'none' }}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      fill="none"
    >
      <ellipse
        cx="50" cy="20" rx="46" ry="16"
        stroke="#2D2A26"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
    {children}
  </span>
);

export const HandArrow = ({ direction = 'right', size = 24 }: { direction?: 'left' | 'right' | 'up' | 'down'; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    style={{
      transform: direction === 'left' ? 'scaleX(-1)' :
                 direction === 'down' ? 'rotate(90deg)' :
                 direction === 'up' ? 'rotate(-90deg)' : 'none'
    }}>
    <path d="M4 12 Q8 11 12 12 Q16 13 20 12" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 8 Q18 10 20 12 Q18 14 16 16" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const SketchStar = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13" stroke="#2D2A26" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const SketchHeart = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M10 17 Q4 12 4 8 Q4 4 7 4 Q9 4 10 6 Q11 4 13 4 Q16 4 16 8 Q16 12 10 17"
      stroke="#2D2A26"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const SketchCheck = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M2 9 L6 13 L14 3" stroke="#2D2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SketchX = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 3 L13 13 M13 3 L3 13" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const SketchBrace = ({ height = 60, side = 'left' }: { height?: number; side?: 'left' | 'right' }) => (
  <svg width="12" height={height} viewBox={`0 0 12 ${height}`} fill="none"
    style={{ transform: side === 'right' ? 'scaleX(-1)' : 'none' }}>
    <path
      d={`M10 2 Q2 2 2 ${height/4} Q2 ${height/2} 6 ${height/2} Q2 ${height/2} 2 ${height*0.75} Q2 ${height-2} 10 ${height-2}`}
      stroke="#2D2A26"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

// ============================================
// TYPOGRAPHY
// ============================================

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface ZineTextProps {
  children: ReactNode;
  size?: TextSize | number;
  underline?: boolean;
  crossed?: boolean;
  style?: React.CSSProperties;
}

const textSizes: Record<TextSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 26,
  xl: 34,
  xxl: 42
};

export const ZineText = ({ children, size = 'md', underline = false, crossed = false, style = {} }: ZineTextProps) => {
  const fontSize = typeof size === 'number' ? size : textSizes[size];

  return (
    <span style={{
      fontFamily: "'Caveat', cursive",
      fontSize,
      color: '#2D2A26',
      textDecoration: crossed ? 'line-through' : 'none',
      position: 'relative',
      display: 'inline',
      ...style
    }}>
      {children}
      {underline && (
        <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0 }}>
          <Underline width="100%" />
        </span>
      )}
    </span>
  );
};

export const UnderlinedText = ({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) => (
  <span style={{ position: 'relative', display: 'inline-block', ...style }}>
    <ZineText>{children}</ZineText>
    <Underline width={100} style={{ position: 'absolute', bottom: '-2px', left: 0 }} />
  </span>
);

export const ZineTitle = ({ children, subtitle, style = {} }: { children: ReactNode; subtitle?: string; style?: React.CSSProperties }) => (
  <div style={{ marginBottom: '16px', ...style }}>
    <h2 style={{
      fontFamily: "'Caveat', cursive",
      fontSize: 32,
      fontWeight: 400,
      color: '#2D2A26',
      lineHeight: 1.2,
      margin: 0
    }}>
      {children}
    </h2>
    {subtitle && (
      <p style={{
        fontFamily: "'Caveat', cursive",
        fontSize: 18,
        color: '#8B857C',
        marginTop: 4
      }}>
        {subtitle}
      </p>
    )}
  </div>
);

// ============================================
// FOOD ILLUSTRATIONS
// ============================================

interface IllustrationProps {
  size?: number;
}

export const SketchEggs = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 18 L42 18 L42 40 L6 40 Z" stroke="#2D2A26" strokeWidth="1.5" fill="none"/>
    <path d="M6 18 L6 14 Q6 12 10 12 L38 12 Q42 12 42 14 L42 18" stroke="#2D2A26" strokeWidth="1.5" fill="none"/>
    <ellipse cx="16" cy="29" rx="6" ry="8" stroke="#2D2A26" strokeWidth="1" fill="#FAF7F2"/>
    <ellipse cx="32" cy="29" rx="6" ry="8" stroke="#2D2A26" strokeWidth="1" fill="#FAF7F2"/>
    <ellipse cx="24" cy="30" rx="6" ry="8" stroke="#2D2A26" strokeWidth="1" fill="#FAF7F2"/>
  </svg>
);

export const SketchTomato = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="28" r="14" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M24 14 Q26 10 24 6" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 14 Q18 10 20 8" stroke="#2D2A26" strokeWidth="1" strokeLinecap="round"/>
    <path d="M28 14 Q30 10 28 8" stroke="#2D2A26" strokeWidth="1" strokeLinecap="round"/>
    <path d="M18 16 Q24 12 30 16" stroke="#2D2A26" strokeWidth="1" fill="none"/>
  </svg>
);

export const SketchPasta = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="10" y="6" width="28" height="38" rx="2" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <rect x="14" y="14" width="20" height="22" stroke="#2D2A26" strokeWidth="1" fill="none"/>
    <path d="M18 16 L18 34" stroke="#2D2A26" strokeWidth="1.5"/>
    <path d="M22 16 L22 34" stroke="#2D2A26" strokeWidth="1.5"/>
    <path d="M26 16 L26 34" stroke="#2D2A26" strokeWidth="1.5"/>
    <path d="M30 16 L30 34" stroke="#2D2A26" strokeWidth="1.5"/>
    <text x="24" y="11" textAnchor="middle" fontSize="6" fill="#2D2A26" fontFamily="Caveat">PASTA</text>
  </svg>
);

export const SketchBasil = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 44 Q24 30 24 16" stroke="#2D2A26" strokeWidth="1.5"/>
    <ellipse cx="16" cy="24" rx="8" ry="5" stroke="#2D2A26" strokeWidth="1" fill="#FAF7F2" transform="rotate(-20 16 24)"/>
    <ellipse cx="32" cy="22" rx="8" ry="5" stroke="#2D2A26" strokeWidth="1" fill="#FAF7F2" transform="rotate(20 32 22)"/>
    <ellipse cx="18" cy="12" rx="6" ry="4" stroke="#2D2A26" strokeWidth="1" fill="#FAF7F2" transform="rotate(-30 18 12)"/>
    <ellipse cx="30" cy="10" rx="6" ry="4" stroke="#2D2A26" strokeWidth="1" fill="#FAF7F2" transform="rotate(25 30 10)"/>
    <path d="M16 24 L12 22" stroke="#2D2A26" strokeWidth="0.5"/>
    <path d="M32 22 L36 20" stroke="#2D2A26" strokeWidth="0.5"/>
  </svg>
);

export const SketchCheese = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 38 L40 38 L40 16 L8 38" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M8 38 L40 16 L24 8 Z" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <circle cx="20" cy="28" r="4" stroke="#2D2A26" strokeWidth="1"/>
    <circle cx="32" cy="22" r="3" stroke="#2D2A26" strokeWidth="1"/>
    <circle cx="16" cy="34" r="2" stroke="#2D2A26" strokeWidth="1"/>
  </svg>
);

export const SketchBowl = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 20 Q6 40 24 40 Q42 40 42 20" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <ellipse cx="24" cy="20" rx="18" ry="6" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M12 20 Q16 16 20 20 Q24 24 28 20 Q32 16 36 20" stroke="#2D2A26" strokeWidth="1" fill="none"/>
  </svg>
);

export const SketchAvocado = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="26" rx="12" ry="16" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <ellipse cx="24" cy="28" rx="6" ry="8" stroke="#2D2A26" strokeWidth="1"/>
    <circle cx="24" cy="30" r="4" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
  </svg>
);

export const SketchBread = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="16" rx="14" ry="6" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M10 16 L10 36 Q10 40 24 40 Q38 40 38 36 L38 16" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M16 14 Q20 10 24 14" stroke="#2D2A26" strokeWidth="1" fill="none"/>
    <path d="M24 14 Q28 10 32 14" stroke="#2D2A26" strokeWidth="1" fill="none"/>
  </svg>
);

export const SketchMilk = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M16 10 L16 6 Q16 4 18 4 L30 4 Q32 4 32 6 L32 10 L34 14 L34 42 Q34 44 32 44 L16 44 Q14 44 14 42 L14 14 Z"
      stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M16 22 L32 22" stroke="#2D2A26" strokeWidth="1"/>
    <rect x="18" y="26" width="12" height="10" stroke="#2D2A26" strokeWidth="1" fill="none"/>
  </svg>
);

export const SketchCarrot = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 44 Q20 30 24 12" stroke="#2D2A26" strokeWidth="4" strokeLinecap="round"/>
    <path d="M24 12 Q20 6 18 2" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 12 Q24 4 24 0" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 12 Q28 6 30 2" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M21 20 L27 20" stroke="#2D2A26" strokeWidth="0.75"/>
    <path d="M22 28 L26 28" stroke="#2D2A26" strokeWidth="0.75"/>
    <path d="M23 36 L25 36" stroke="#2D2A26" strokeWidth="0.75"/>
  </svg>
);

export const SketchChef = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* Chef hat */}
    <path d="M12 18 Q12 6 24 6 Q36 6 36 18" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M12 18 L12 24 L36 24 L36 18" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    {/* Face */}
    <circle cx="24" cy="32" r="8" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    {/* Eyes */}
    <circle cx="21" cy="31" r="1" fill="#2D2A26"/>
    <circle cx="27" cy="31" r="1" fill="#2D2A26"/>
    {/* Smile */}
    <path d="M21 34 Q24 36 27 34" stroke="#2D2A26" strokeWidth="1" fill="none"/>
  </svg>
);

export const SketchClock = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="16" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M24 12 L24 24 L32 28" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="24" r="2" fill="#2D2A26"/>
  </svg>
);

export const SketchCalendar = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="6" y="10" width="36" height="32" rx="2" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M6 18 L42 18" stroke="#2D2A26" strokeWidth="1.5"/>
    <path d="M14 6 L14 14" stroke="#2D2A26" strokeWidth="2" strokeLinecap="round"/>
    <path d="M34 6 L34 14" stroke="#2D2A26" strokeWidth="2" strokeLinecap="round"/>
    {/* Grid */}
    <circle cx="16" cy="26" r="2" fill="#2D2A26"/>
    <circle cx="24" cy="26" r="2" fill="#2D2A26"/>
    <circle cx="32" cy="26" r="2" fill="#2D2A26"/>
    <circle cx="16" cy="34" r="2" fill="#2D2A26"/>
    <circle cx="24" cy="34" r="2" fill="#2D2A26"/>
  </svg>
);

export const SketchBook = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 8 L8 40 Q8 42 10 42 L38 42 Q40 42 40 40 L40 8 Q40 6 38 6 L10 6 Q8 6 8 8" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M14 6 L14 42" stroke="#2D2A26" strokeWidth="1"/>
    {/* Lines */}
    <path d="M18 14 L34 14" stroke="#2D2A26" strokeWidth="1"/>
    <path d="M18 20 L34 20" stroke="#2D2A26" strokeWidth="1"/>
    <path d="M18 26 L30 26" stroke="#2D2A26" strokeWidth="1"/>
  </svg>
);

export const SketchOnion = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="28" rx="14" ry="12" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <ellipse cx="24" cy="28" rx="10" ry="8" stroke="#2D2A26" strokeWidth="1" fill="none"/>
    <ellipse cx="24" cy="28" rx="6" ry="5" stroke="#2D2A26" strokeWidth="0.75" fill="none"/>
    <path d="M24 16 Q26 12 24 8" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 16 Q20 10 22 6" stroke="#2D2A26" strokeWidth="1" strokeLinecap="round"/>
    <path d="M26 16 Q28 10 26 6" stroke="#2D2A26" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const SketchLemon = ({ size = 48 }: IllustrationProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="24" rx="16" ry="10" stroke="#2D2A26" strokeWidth="1.5" fill="#FAF7F2"/>
    <path d="M8 24 Q4 24 2 22" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M40 24 Q44 24 46 22" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 20 Q24 18 32 20" stroke="#2D2A26" strokeWidth="0.75" fill="none"/>
  </svg>
);

// ============================================
// DECORATIVE ELEMENTS
// ============================================

export const SketchCircle = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#2D2A26" strokeWidth="1.5" fill="none" strokeDasharray="2 4"/>
  </svg>
);

export const SketchSquiggle = ({ width = 100 }: { width?: number }) => (
  <svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none">
    <path
      d={`M2 6 Q${width * 0.15} 2 ${width * 0.25} 6 Q${width * 0.35} 10 ${width * 0.5} 6 Q${width * 0.65} 2 ${width * 0.75} 6 Q${width * 0.85} 10 ${width - 2} 6`}
      stroke="#2D2A26"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// ============================================
// CARD COMPONENTS
// ============================================

interface ZineRecipeCardProps {
  title: string;
  note?: string;
  time?: string;
  Illustration?: React.ComponentType<IllustrationProps>;
  annotations?: string[];
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const ZineRecipeCard = ({ title, note, time, Illustration, annotations = [], onClick, style = {} }: ZineRecipeCardProps) => (
  <div
    style={{ position: 'relative', marginBottom: '24px', cursor: onClick ? 'pointer' : 'default', ...style }}
    onClick={onClick}
  >
    <HandDrawnFrame>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {Illustration && (
          <div style={{
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Illustration size={64} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <ZineText size="lg" style={{ display: 'block', marginBottom: '4px' }}>
            {title}
          </ZineText>

          {note && (
            <ZineText size="sm" style={{ color: '#6B6560', display: 'block', marginBottom: '8px', fontStyle: 'italic' }}>
              {note}
            </ZineText>
          )}

          {time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SketchStar size={12} />
              <ZineText size="xs" style={{ color: '#8B857C' }}>{time}</ZineText>
            </div>
          )}
        </div>
      </div>
    </HandDrawnFrame>

    {annotations.map((note, i) => (
      <div key={i} style={{
        position: 'absolute',
        right: '-100px',
        top: `${20 + i * 30}px`,
        transform: 'rotate(-3deg)',
        display: 'none' // Hidden on mobile
      }}>
        <ZineText size="xs" style={{ color: '#8B857C' }}>
          <HandArrow direction="left" size={14} /> {note}
        </ZineText>
      </div>
    ))}
  </div>
);

interface ZineNoteCardProps {
  title?: string;
  children: ReactNode;
  highlight?: string;
  style?: React.CSSProperties;
}

export const ZineNoteCard = ({ title, children, highlight, style = {} }: ZineNoteCardProps) => (
  <div style={{
    padding: '20px',
    position: 'relative',
    background: '#FAF7F2',
    ...style
  }}>
    {/* Corner marks */}
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', top: 0, left: 0 }}>
      <path d="M0 15 L0 0 L15 0" stroke="#2D2A26" strokeWidth="1" fill="none"/>
    </svg>
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', top: 0, right: 0, transform: 'scaleX(-1)' }}>
      <path d="M0 15 L0 0 L15 0" stroke="#2D2A26" strokeWidth="1" fill="none"/>
    </svg>
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', bottom: 0, left: 0, transform: 'scaleY(-1)' }}>
      <path d="M0 15 L0 0 L15 0" stroke="#2D2A26" strokeWidth="1" fill="none"/>
    </svg>
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', bottom: 0, right: 0, transform: 'scale(-1)' }}>
      <path d="M0 15 L0 0 L15 0" stroke="#2D2A26" strokeWidth="1" fill="none"/>
    </svg>

    {title && (
      <ZineText size="lg" underline style={{ display: 'block', marginBottom: '12px' }}>
        {title}
      </ZineText>
    )}

    {highlight && (
      <div style={{ marginBottom: '12px' }}>
        <CircleHighlight>
          <ZineText size="md">{highlight}</ZineText>
        </CircleHighlight>
      </div>
    )}

    {children}
  </div>
);

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface ZineChecklistProps {
  items: ChecklistItem[];
  onToggle?: (index: number) => void;
  style?: React.CSSProperties;
}

export const ZineChecklist = ({ items = [], onToggle, style = {} }: ZineChecklistProps) => (
  <div style={style}>
    {items.map((item, i) => (
      <div
        key={i}
        onClick={() => onToggle?.(i)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
          cursor: onToggle ? 'pointer' : 'default'
        }}
      >
        <div style={{
          width: '18px',
          height: '18px',
          border: '1.5px solid #2D2A26',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {item.checked && <SketchCheck size={12} />}
        </div>
        <ZineText
          size="sm"
          crossed={item.checked}
          style={{ color: item.checked ? '#A8A4A0' : '#2D2A26' }}
        >
          {item.text}
        </ZineText>
      </div>
    ))}
  </div>
);

// Photo card con polaroid effect sketch
interface ZinePhotoCardProps {
  Illustration?: React.ComponentType<{ size?: number }>;
  caption?: string;
  note?: string;
  rotation?: number;
  style?: React.CSSProperties;
}

export const ZinePhotoCard = ({ Illustration, caption, note, rotation = 0, style = {} }: ZinePhotoCardProps) => (
  <div style={{ display: 'inline-block', transform: `rotate(${rotation}deg)`, flexShrink: 0, ...style }}>
    <DoubleFrame style={{ background: '#FAF7F2', padding: '12px' }}>
      <div style={{
        width: '100px',
        height: '100px',
        background: '#F0EBE3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
      }}>
        {Illustration && <Illustration size={64} />}
      </div>
      {caption && (
        <ZineText size="sm" style={{ display: 'block', textAlign: 'center' }}>
          {caption}
        </ZineText>
      )}
    </DoubleFrame>
    {note && (
      <div style={{ marginTop: '8px', marginLeft: '12px', transform: 'rotate(3deg)' }}>
        <ZineText size="xs" style={{ color: '#6B6560' }}>{note}</ZineText>
      </div>
    )}
  </div>
);

export const ZineQuote = ({ children, author, style = {} }: { children: ReactNode; author?: string; style?: React.CSSProperties }) => (
  <div style={{ display: 'flex', gap: '8px', ...style }}>
    <SketchBrace height={60} side="left" />
    <div style={{ flex: 1 }}>
      <ZineText size="md" style={{ fontStyle: 'italic', lineHeight: 1.6, display: 'block' }}>
        "{children}"
      </ZineText>
      {author && (
        <ZineText size="sm" style={{ color: '#8B857C', marginTop: '8px', display: 'block' }}>
          — {author}
        </ZineText>
      )}
    </div>
  </div>
);

// ============================================
// LAYOUT
// ============================================

export const ZinePage = ({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: '#FAF7F2',
    minHeight: '100vh',
    position: 'relative',
    ...style
  }}>
    {/* Paper texture overlay */}
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

// ============================================
// BUTTON
// ============================================

interface ZineButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  style?: React.CSSProperties;
}

export const ZineButton = ({ children, onClick, variant = 'primary', style = {} }: ZineButtonProps) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: "'Caveat', cursive",
      fontSize: 20,
      padding: '12px 24px',
      background: variant === 'primary' ? '#2D2A26' : 'transparent',
      color: variant === 'primary' ? '#FAF7F2' : '#2D2A26',
      border: '2px solid #2D2A26',
      borderRadius: '4px',
      cursor: 'pointer',
      position: 'relative',
      transition: 'transform 0.2s',
      ...style
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(-1deg)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
  >
    {children}
  </button>
);

// ============================================
// INPUT
// ============================================

interface ZineInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

export const ZineInput = ({ placeholder, value, onChange, onKeyDown, style = {} }: ZineInputProps) => (
  <div style={{ position: 'relative', ...style }}>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        width: '100%',
        fontFamily: "'Caveat', cursive",
        fontSize: 20,
        padding: '12px 16px',
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid #2D2A26',
        outline: 'none',
        color: '#2D2A26'
      }}
    />
  </div>
);

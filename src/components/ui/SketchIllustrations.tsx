// ============================================
// SKETCH ILLUSTRATIONS SET
// Hand-drawn style for cooking/recipe app
// ============================================

// Color palette
const COLORS = {
  stroke: '#2D2A26',
  fill: '#FAF7F2',
  accent: '#E8E4DE',
};

// Base style props
const baseProps = {
  fill: 'none',
  stroke: COLORS.stroke,
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// ============================================
// PROTEINS & DAIRY
// ============================================

export const SketchEgg = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="26" rx="12" ry="16" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="28" rx="6" ry="8" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchEggCarton = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 18 L42 18 L42 38 L6 38 Z" {...baseProps} fill={COLORS.fill} />
    <path d="M6 18 L6 14 Q6 12 10 12 L38 12 Q42 12 42 14 L42 18" {...baseProps} />
    <ellipse cx="14" cy="28" rx="5" ry="7" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
    <ellipse cx="26" cy="28" rx="5" ry="7" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
    <ellipse cx="38" cy="28" rx="5" ry="7" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
  </svg>
);

export const SketchCheese = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 36 L24 8 L42 36 Z" {...baseProps} fill={COLORS.fill} />
    <circle cx="18" cy="28" r="3" {...baseProps} strokeWidth="1" />
    <circle cx="28" cy="32" r="2" {...baseProps} strokeWidth="1" />
    <circle cx="32" cy="26" r="2.5" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchMilk = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M14 14 L14 8 L34 8 L34 14" {...baseProps} />
    <path d="M12 14 L14 14 L14 42 L34 42 L34 14 L36 14 L36 18 L34 18 L34 42 L14 42 L14 18 L12 18 Z" {...baseProps} fill={COLORS.fill} />
    <path d="M18 24 Q24 20 30 24" {...baseProps} strokeWidth="1" />
    <rect x="18" y="28" width="12" height="8" rx="1" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchButter = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="8" y="18" width="32" height="20" rx="2" {...baseProps} fill={COLORS.fill} />
    <path d="M8 24 L40 24" {...baseProps} strokeWidth="1" />
    <path d="M28 18 L28 38" {...baseProps} strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

export const SketchChicken = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="28" rx="14" ry="12" {...baseProps} fill={COLORS.fill} />
    <path d="M32 18 Q36 14 34 10 Q38 12 36 18" {...baseProps} strokeWidth="1" />
    <circle cx="30" cy="22" r="1.5" fill={COLORS.stroke} />
    <path d="M34 24 L38 23 L34 26" {...baseProps} strokeWidth="1" />
    <path d="M14 36 L12 42 M18 38 L17 42 M22 38 L22 42" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchFish = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 24 Q14 14 28 14 Q42 14 42 24 Q42 34 28 34 Q14 34 8 24" {...baseProps} fill={COLORS.fill} />
    <path d="M4 24 L10 18 L10 30 Z" {...baseProps} fill={COLORS.fill} />
    <circle cx="34" cy="22" r="2" fill={COLORS.stroke} />
    <path d="M16 20 Q20 24 16 28" {...baseProps} strokeWidth="1" />
    <path d="M22 20 Q26 24 22 28" {...baseProps} strokeWidth="1" />
  </svg>
);

// ============================================
// VEGETABLES
// ============================================

export const SketchTomato = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="28" r="14" {...baseProps} fill={COLORS.fill} />
    <path d="M24 14 Q26 10 24 6" {...baseProps} />
    <path d="M20 14 Q18 10 20 8" {...baseProps} strokeWidth="1" />
    <path d="M28 14 Q30 10 28 8" {...baseProps} strokeWidth="1" />
    <path d="M18 16 Q24 12 30 16" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
  </svg>
);

export const SketchCarrot = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 44 Q20 30 22 20 Q24 16 26 20 Q28 30 24 44" {...baseProps} fill={COLORS.fill} />
    <path d="M22 20 Q20 14 22 8 M24 18 Q24 12 26 6 M26 20 Q28 14 30 10" {...baseProps} strokeWidth="1" />
    <path d="M22 28 L26 28 M21 34 L27 34" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchOnion = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="30" rx="14" ry="12" {...baseProps} fill={COLORS.fill} />
    <path d="M24 18 L24 6" {...baseProps} />
    <path d="M20 18 Q24 14 28 18" {...baseProps} strokeWidth="1" />
    <path d="M16 28 Q24 20 32 28" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchGarlic = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="30" rx="12" ry="14" {...baseProps} fill={COLORS.fill} />
    <path d="M24 16 L24 8 L26 6" {...baseProps} />
    <path d="M18 28 Q24 22 30 28" {...baseProps} strokeWidth="1" />
    <path d="M20 34 L24 26 L28 34" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchPepper = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M20 14 Q16 20 16 30 Q16 42 24 42 Q32 42 32 30 Q32 20 28 14" {...baseProps} fill={COLORS.fill} />
    <path d="M20 14 Q22 10 24 14 Q26 10 28 14" {...baseProps} />
    <path d="M24 10 L24 4" {...baseProps} />
  </svg>
);

export const SketchBroccoli = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M22 44 L22 28 M26 44 L26 28" {...baseProps} />
    <circle cx="16" cy="20" r="8" {...baseProps} fill={COLORS.fill} />
    <circle cx="32" cy="20" r="8" {...baseProps} fill={COLORS.fill} />
    <circle cx="24" cy="14" r="8" {...baseProps} fill={COLORS.fill} />
    <circle cx="20" cy="24" r="6" {...baseProps} fill={COLORS.fill} />
    <circle cx="28" cy="24" r="6" {...baseProps} fill={COLORS.fill} />
  </svg>
);

export const SketchMushroom = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 24 Q8 10 24 10 Q40 10 40 24 Z" {...baseProps} fill={COLORS.fill} />
    <path d="M18 24 L18 40 Q18 42 24 42 Q30 42 30 40 L30 24" {...baseProps} fill={COLORS.fill} />
    <circle cx="18" cy="18" r="2" {...baseProps} strokeWidth="1" />
    <circle cx="28" cy="16" r="2.5" {...baseProps} strokeWidth="1" />
    <circle cx="32" cy="22" r="1.5" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchLeaf = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 44 Q24 30 24 20" {...baseProps} />
    <path d="M10 20 Q10 8 24 8 Q38 8 38 20 Q38 32 24 44 Q10 32 10 20" {...baseProps} fill={COLORS.fill} />
    <path d="M24 12 L24 36" {...baseProps} strokeWidth="1" />
    <path d="M18 18 L24 24 M30 18 L24 24 M18 28 L24 34 M30 28 L24 34" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchBasil = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 44 L24 24" {...baseProps} />
    <ellipse cx="16" cy="26" rx="10" ry="6" transform="rotate(-30 16 26)" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="32" cy="26" rx="10" ry="6" transform="rotate(30 32 26)" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="14" rx="8" ry="5" {...baseProps} fill={COLORS.fill} />
    <path d="M16 26 L12 26 M32 26 L36 26 M24 14 L24 10" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchAvocado = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="26" rx="14" ry="18" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="30" rx="8" ry="10" {...baseProps} strokeWidth="1" />
    <circle cx="24" cy="32" r="5" {...baseProps} fill={COLORS.fill} />
  </svg>
);

export const SketchPotato = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="28" rx="16" ry="12" {...baseProps} fill={COLORS.fill} />
    <circle cx="18" cy="24" r="1" fill={COLORS.stroke} />
    <circle cx="28" cy="26" r="1" fill={COLORS.stroke} />
    <circle cx="22" cy="32" r="1" fill={COLORS.stroke} />
    <circle cx="32" cy="30" r="1" fill={COLORS.stroke} />
  </svg>
);

// ============================================
// PASTA & GRAINS
// ============================================

export const SketchPasta = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="12" y="6" width="24" height="36" rx="2" {...baseProps} fill={COLORS.fill} />
    <rect x="16" y="14" width="16" height="20" {...baseProps} strokeWidth="1" />
    <path d="M20 16 L20 32 M24 16 L24 32 M28 16 L28 32" {...baseProps} />
  </svg>
);

export const SketchRice = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M10 38 L10 20 Q10 14 16 14 L32 14 Q38 14 38 20 L38 38" {...baseProps} fill={COLORS.fill} />
    <path d="M6 38 L42 38" {...baseProps} />
    <ellipse cx="18" cy="24" rx="2" ry="4" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
    <ellipse cx="26" cy="26" rx="2" ry="4" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
    <ellipse cx="32" cy="24" rx="2" ry="4" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
    <ellipse cx="22" cy="32" rx="2" ry="4" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
  </svg>
);

export const SketchBread = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 28 Q8 16 24 16 Q40 16 40 28 L40 38 L8 38 Z" {...baseProps} fill={COLORS.fill} />
    <path d="M14 26 Q18 22 22 26 M26 26 Q30 22 34 26" {...baseProps} strokeWidth="1" />
    <path d="M8 38 L40 38" {...baseProps} />
  </svg>
);

export const SketchFlour = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M12 12 L12 40 L36 40 L36 12 Q36 8 30 8 L18 8 Q12 8 12 12" {...baseProps} fill={COLORS.fill} />
    <path d="M12 16 L36 16" {...baseProps} strokeWidth="1" />
    <text x="24" y="30" textAnchor="middle" fontSize="8" fill={COLORS.stroke} fontFamily="serif">1kg</text>
  </svg>
);

// ============================================
// COOKWARE
// ============================================

export const SketchPan = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="22" cy="28" rx="16" ry="10" {...baseProps} fill={COLORS.fill} />
    <path d="M38 28 L46 24" {...baseProps} strokeWidth={2} />
    <path d="M10 22 Q22 18 34 22" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchPot = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="38" rx="16" ry="6" {...baseProps} fill={COLORS.fill} />
    <path d="M8 20 L8 38 M40 20 L40 38" {...baseProps} />
    <ellipse cx="24" cy="20" rx="16" ry="6" {...baseProps} fill={COLORS.fill} />
    <path d="M4 20 L8 20 M40 20 L44 20" {...baseProps} strokeWidth={2} />
    <path d="M20 8 Q20 14 18 16 M24 6 Q24 12 24 16 M28 8 Q28 14 30 16" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchBowl = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 20 Q6 40 24 40 Q42 40 42 20" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="20" rx="18" ry="6" {...baseProps} fill={COLORS.fill} />
    <path d="M12 20 Q18 16 24 20 Q30 24 36 20" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchPlate = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="30" rx="20" ry="8" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="28" rx="14" ry="5" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchKnife = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 40 L22 26 L22 8 Q24 6 26 8 L26 26 L40 40" {...baseProps} fill={COLORS.fill} />
    <path d="M22 26 L26 26" {...baseProps} />
    <path d="M20 40 L28 40" {...baseProps} strokeWidth={2} />
  </svg>
);

export const SketchSpatula = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="20" y="4" width="8" height="20" rx="1" {...baseProps} fill={COLORS.fill} />
    <path d="M16 24 L16 42 Q16 44 24 44 Q32 44 32 42 L32 24 Z" {...baseProps} fill={COLORS.fill} />
    <path d="M20 30 L28 30 M20 36 L28 36" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchWhisk = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="22" y="4" width="4" height="12" rx="1" {...baseProps} fill={COLORS.fill} />
    <path d="M14 44 Q14 20 24 16 Q34 20 34 44" {...baseProps} />
    <path d="M18 44 Q18 24 24 20 Q30 24 30 44" {...baseProps} />
    <path d="M22 44 Q22 28 24 24 Q26 28 26 44" {...baseProps} />
  </svg>
);

export const SketchCuttingBoard = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="6" y="10" width="36" height="28" rx="3" {...baseProps} fill={COLORS.fill} />
    <circle cx="12" cy="16" r="2" {...baseProps} strokeWidth="1" />
    <path d="M6 20 L42 20" {...baseProps} strokeWidth="1" strokeDasharray="4 2" />
  </svg>
);

// ============================================
// CONDIMENTS & EXTRAS
// ============================================

export const SketchSalt = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="14" y="14" width="20" height="28" rx="2" {...baseProps} fill={COLORS.fill} />
    <path d="M14 20 L34 20" {...baseProps} strokeWidth="1" />
    <circle cx="20" cy="10" r="1" fill={COLORS.stroke} />
    <circle cx="24" cy="10" r="1" fill={COLORS.stroke} />
    <circle cx="28" cy="10" r="1" fill={COLORS.stroke} />
    <text x="24" y="32" textAnchor="middle" fontSize="8" fill={COLORS.stroke}>S</text>
  </svg>
);

export const SketchPepperShaker = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="14" y="14" width="20" height="28" rx="2" {...baseProps} fill={COLORS.fill} />
    <path d="M14 20 L34 20" {...baseProps} strokeWidth="1" />
    <circle cx="22" cy="10" r="1.5" fill={COLORS.stroke} />
    <circle cx="26" cy="10" r="1.5" fill={COLORS.stroke} />
    <text x="24" y="32" textAnchor="middle" fontSize="8" fill={COLORS.stroke}>P</text>
  </svg>
);

export const SketchOil = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M18 14 L18 8 Q18 4 24 4 Q30 4 30 8 L30 14" {...baseProps} />
    <path d="M14 14 L14 42 Q14 44 24 44 Q34 44 34 42 L34 14 Z" {...baseProps} fill={COLORS.fill} />
    <path d="M18 24 Q24 20 30 24 Q24 28 18 24" {...baseProps} strokeWidth="1" fill={COLORS.accent} />
  </svg>
);

export const SketchHoney = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M16 16 L16 40 Q16 44 24 44 Q32 44 32 40 L32 16" {...baseProps} fill={COLORS.fill} />
    <rect x="14" y="10" width="20" height="6" rx="1" {...baseProps} fill={COLORS.fill} />
    <path d="M20 24 L28 24 M18 30 L30 30 M20 36 L28 36" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchLemon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="26" rx="14" ry="12" {...baseProps} fill={COLORS.fill} />
    <path d="M24 14 L24 10 Q26 8 24 6" {...baseProps} />
    <path d="M16 26 L24 26 M24 26 L32 26 M24 18 L24 26 M24 26 L24 34" {...baseProps} strokeWidth="1" />
  </svg>
);

// ============================================
// SWEETS & DRINKS
// ============================================

export const SketchCake = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="8" y="24" width="32" height="18" rx="2" {...baseProps} fill={COLORS.fill} />
    <path d="M8 30 Q24 26 40 30" {...baseProps} strokeWidth="1" />
    <rect x="12" y="16" width="24" height="8" rx="1" {...baseProps} fill={COLORS.fill} />
    <path d="M24 8 L24 16 M20 10 L20 16 M28 10 L28 16" {...baseProps} />
    <circle cx="20" cy="8" r="2" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
    <circle cx="24" cy="6" r="2" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
    <circle cx="28" cy="8" r="2" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
  </svg>
);

export const SketchCoffee = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M10 18 L10 38 Q10 42 20 42 L28 42 Q38 42 38 38 L38 18" {...baseProps} fill={COLORS.fill} />
    <path d="M38 22 Q44 22 44 28 Q44 34 38 34" {...baseProps} />
    <path d="M6 18 L42 18" {...baseProps} />
    <path d="M18 10 Q18 14 16 16 M24 8 Q24 12 24 16 M30 10 Q30 14 32 16" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchWine = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M14 20 Q14 8 24 8 Q34 8 34 20 Q34 28 24 32 Q14 28 14 20" {...baseProps} fill={COLORS.fill} />
    <path d="M24 32 L24 40" {...baseProps} />
    <path d="M16 44 L32 44" {...baseProps} />
    <path d="M18 44 L18 40 L30 40 L30 44" {...baseProps} fill={COLORS.fill} />
    <path d="M16 18 Q24 22 32 18" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchIceCream = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M16 24 L24 44 L32 24" {...baseProps} fill={COLORS.fill} />
    <circle cx="16" cy="18" r="8" {...baseProps} fill={COLORS.fill} />
    <circle cx="32" cy="18" r="8" {...baseProps} fill={COLORS.fill} />
    <circle cx="24" cy="12" r="8" {...baseProps} fill={COLORS.fill} />
  </svg>
);

// ============================================
// MEALS & DISHES
// ============================================

export const SketchPizza = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="18" {...baseProps} fill={COLORS.fill} />
    <circle cx="24" cy="24" r="14" {...baseProps} strokeWidth="1" />
    <circle cx="18" cy="20" r="3" {...baseProps} strokeWidth="1" />
    <circle cx="28" cy="18" r="2.5" {...baseProps} strokeWidth="1" />
    <circle cx="26" cy="28" r="3" {...baseProps} strokeWidth="1" />
    <circle cx="16" cy="28" r="2" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchBurger = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 20 Q8 12 24 12 Q40 12 40 20 Z" {...baseProps} fill={COLORS.fill} />
    <rect x="6" y="20" width="36" height="4" rx="1" {...baseProps} fill={COLORS.fill} />
    <path d="M8 24 Q12 28 16 24 Q20 28 24 24 Q28 28 32 24 Q36 28 40 24" {...baseProps} strokeWidth="1" />
    <rect x="6" y="28" width="36" height="4" rx="1" {...baseProps} fill={COLORS.fill} />
    <path d="M8 32 Q8 38 24 38 Q40 38 40 32" {...baseProps} fill={COLORS.fill} />
  </svg>
);

export const SketchSalad = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 26 Q6 40 24 40 Q42 40 42 26" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="26" rx="18" ry="6" {...baseProps} fill={COLORS.fill} />
    <path d="M14 22 Q18 18 22 22 M26 20 Q30 16 34 20" {...baseProps} strokeWidth="1" />
    <circle cx="20" cy="26" r="2" {...baseProps} strokeWidth="1" />
    <circle cx="28" cy="24" r="2" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchSoup = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 22 Q8 40 24 40 Q40 40 40 22" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="22" rx="16" ry="6" {...baseProps} fill={COLORS.fill} />
    <path d="M14 12 Q14 18 12 20 M24 10 Q24 16 24 20 M34 12 Q34 18 36 20" {...baseProps} strokeWidth="1" />
    <circle cx="18" cy="28" r="2" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
    <circle cx="28" cy="30" r="2" {...baseProps} strokeWidth="1" fill={COLORS.fill} />
  </svg>
);

export const SketchTaco = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 32 Q6 20 24 20 Q42 20 42 32 Q36 36 24 36 Q12 36 6 32" {...baseProps} fill={COLORS.fill} />
    <path d="M10 28 Q14 24 18 28 M22 26 Q26 22 30 26 M34 28 Q38 24 40 28" {...baseProps} strokeWidth="1" />
    <circle cx="16" cy="30" r="2" {...baseProps} strokeWidth="1" />
    <circle cx="32" cy="30" r="2" {...baseProps} strokeWidth="1" />
  </svg>
);

export const SketchSushi = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="32" rx="16" ry="8" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="28" rx="16" ry="8" {...baseProps} fill={COLORS.fill} />
    <ellipse cx="24" cy="26" rx="10" ry="4" {...baseProps} strokeWidth="1" />
    <path d="M18 26 Q24 24 30 26" {...baseProps} strokeWidth="1" />
  </svg>
);

// ============================================
// ICON GRID COMPONENT
// ============================================

export const IllustrationGrid = () => {
  const allIcons = [
    { name: 'Egg', Component: SketchEgg },
    { name: 'Egg Carton', Component: SketchEggCarton },
    { name: 'Cheese', Component: SketchCheese },
    { name: 'Milk', Component: SketchMilk },
    { name: 'Butter', Component: SketchButter },
    { name: 'Chicken', Component: SketchChicken },
    { name: 'Fish', Component: SketchFish },
    { name: 'Tomato', Component: SketchTomato },
    { name: 'Carrot', Component: SketchCarrot },
    { name: 'Onion', Component: SketchOnion },
    { name: 'Garlic', Component: SketchGarlic },
    { name: 'Pepper', Component: SketchPepper },
    { name: 'Broccoli', Component: SketchBroccoli },
    { name: 'Mushroom', Component: SketchMushroom },
    { name: 'Leaf', Component: SketchLeaf },
    { name: 'Basil', Component: SketchBasil },
    { name: 'Avocado', Component: SketchAvocado },
    { name: 'Potato', Component: SketchPotato },
    { name: 'Pasta', Component: SketchPasta },
    { name: 'Rice', Component: SketchRice },
    { name: 'Bread', Component: SketchBread },
    { name: 'Flour', Component: SketchFlour },
    { name: 'Pan', Component: SketchPan },
    { name: 'Pot', Component: SketchPot },
    { name: 'Bowl', Component: SketchBowl },
    { name: 'Plate', Component: SketchPlate },
    { name: 'Knife', Component: SketchKnife },
    { name: 'Spatula', Component: SketchSpatula },
    { name: 'Whisk', Component: SketchWhisk },
    { name: 'Cutting Board', Component: SketchCuttingBoard },
    { name: 'Salt', Component: SketchSalt },
    { name: 'Pepper Shaker', Component: SketchPepperShaker },
    { name: 'Oil', Component: SketchOil },
    { name: 'Honey', Component: SketchHoney },
    { name: 'Lemon', Component: SketchLemon },
    { name: 'Cake', Component: SketchCake },
    { name: 'Coffee', Component: SketchCoffee },
    { name: 'Wine', Component: SketchWine },
    { name: 'Ice Cream', Component: SketchIceCream },
    { name: 'Pizza', Component: SketchPizza },
    { name: 'Burger', Component: SketchBurger },
    { name: 'Salad', Component: SketchSalad },
    { name: 'Soup', Component: SketchSoup },
    { name: 'Taco', Component: SketchTaco },
    { name: 'Sushi', Component: SketchSushi },
  ];

  return (
    <div style={{ padding: 40, background: '#FAF7F2', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: 48, color: '#2D2A26', marginBottom: 8, textAlign: 'center' }}>
        Sketch Illustrations
      </h1>
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: 24, color: '#8B857C', marginBottom: 40, textAlign: 'center' }}>
        45 hand-drawn icons for cooking apps
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 16,
        maxWidth: 900,
        margin: '0 auto'
      }}>
        {allIcons.map(({ name, Component }) => (
          <div key={name} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 16,
            background: 'white',
            borderRadius: 12,
            border: '1px solid #E8E4DE'
          }}>
            <Component size={48} />
            <span style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 14,
              color: '#6B6560',
              marginTop: 8,
              textAlign: 'center'
            }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IllustrationGrid;

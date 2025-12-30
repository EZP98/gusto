import { useState, useEffect } from 'react';

// ============================================
// GUSTO LOGO COMPONENTS
// Egg with crack - stile zine
// ============================================

// Design tokens
const tokens = {
  colors: {
    ink: '#2D2A26',
    paper: '#FAF7F2',
    yolk: '#F5C842',
    inkLight: '#8B857C'
  }
};

interface LogoProps {
  size?: number;
  color?: string;
}

// Main logo: Egg with zigzag crack
export const GustoLogo = ({ size = 48, color = tokens.colors.ink }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* Egg shape */}
    <ellipse
      cx="24"
      cy="26"
      rx="14"
      ry="18"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    {/* Zigzag crack */}
    <path
      d="M18 18 L22 23 L17 28 L23 33 L19 38"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Full logo with text
export const GustoLogoFull = ({ size = 48, color = tokens.colors.ink }: LogoProps) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <GustoLogo size={size} color={color} />
    <span style={{
      fontFamily: "'Caveat', cursive",
      fontSize: size * 0.6,
      color,
      fontWeight: 400
    }}>
      Gusto
    </span>
  </div>
);

// Outline version (for dark backgrounds)
export const GustoLogoOutline = ({ size = 48, color = tokens.colors.paper }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse
      cx="24"
      cy="26"
      rx="14"
      ry="18"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M18 18 L22 23 L17 28 L23 33 L19 38"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Minimal version (just the egg, no crack)
export const GustoLogoMinimal = ({ size = 48, color = tokens.colors.ink }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse
      cx="24"
      cy="26"
      rx="14"
      ry="18"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

// Animated version for loading states
export const GustoLogoAnimated = ({ size = 48, color = tokens.colors.ink }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="gusto-logo-animated">
    <style>
      {`
        .gusto-logo-animated ellipse {
          animation: eggWiggle 2s ease-in-out infinite;
          transform-origin: center;
        }
        .gusto-logo-animated path {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: crackDraw 2s ease-out forwards;
        }
        @keyframes eggWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        @keyframes crackDraw {
          to { stroke-dashoffset: 0; }
        }
      `}
    </style>
    <ellipse
      cx="24"
      cy="26"
      rx="14"
      ry="18"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M18 18 L22 23 L17 28 L23 33 L19 38"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// ============================================
// SPLASH SCREEN
// 6-phase animation: egg cracks and reveals yolk
// ============================================

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // total duration in ms
}

export const SplashScreen = ({ onComplete, duration = 2500 }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const phaseTime = duration / 6;
    const intervals: ReturnType<typeof setTimeout>[] = [];

    // Progress through phases
    for (let i = 1; i <= 6; i++) {
      intervals.push(setTimeout(() => setPhase(i), phaseTime * i));
    }

    // Complete callback
    const completeTimeout = setTimeout(() => {
      onComplete?.();
    }, duration + 300);

    return () => {
      intervals.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
  }, [duration, onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: tokens.colors.paper,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <style>
        {`
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-3deg); }
            75% { transform: rotate(3deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-20px); opacity: 0; }
          }
          @keyframes slideRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(20px); opacity: 0; }
          }
          @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes starPop {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            100% { transform: scale(1) rotate(360deg); opacity: 1; }
          }
        `}
      </style>

      <div style={{
        position: 'relative',
        width: 160,
        height: 200,
        animation: phase < 3 ? 'wiggle 0.3s ease-in-out infinite' : 'none'
      }}>
        {/* Phase 0-2: Whole egg wiggling */}
        {phase < 3 && (
          <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
            <ellipse
              cx="80"
              cy="110"
              rx="50"
              ry="70"
              stroke={tokens.colors.ink}
              strokeWidth="2"
              fill={tokens.colors.paper}
            />
            {/* Crack appears in phase 1 */}
            {phase >= 1 && (
              <path
                d="M55 70 L70 90 L50 110 L72 130 L58 150"
                stroke={tokens.colors.ink}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ animation: 'fadeIn 0.3s ease-out' }}
              />
            )}
            {/* More cracks in phase 2 */}
            {phase >= 2 && (
              <path
                d="M105 65 L90 85 L110 105 L88 125 L102 145"
                stroke={tokens.colors.ink}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ animation: 'fadeIn 0.3s ease-out' }}
              />
            )}
          </svg>
        )}

        {/* Phase 3-4: Egg splits */}
        {phase >= 3 && phase < 5 && (
          <>
            {/* Left shell */}
            <svg
              width="80"
              height="200"
              viewBox="0 0 80 200"
              fill="none"
              style={{
                position: 'absolute',
                left: 0,
                animation: 'slideLeft 0.5s ease-out forwards'
              }}
            >
              <path
                d="M80 40 Q30 40 30 110 Q30 180 80 180"
                stroke={tokens.colors.ink}
                strokeWidth="2"
                fill={tokens.colors.paper}
              />
            </svg>

            {/* Right shell */}
            <svg
              width="80"
              height="200"
              viewBox="0 0 80 200"
              fill="none"
              style={{
                position: 'absolute',
                right: 0,
                animation: 'slideRight 0.5s ease-out forwards'
              }}
            >
              <path
                d="M0 40 Q50 40 50 110 Q50 180 0 180"
                stroke={tokens.colors.ink}
                strokeWidth="2"
                fill={tokens.colors.paper}
              />
            </svg>
          </>
        )}

        {/* Phase 4+: Yolk appears */}
        {phase >= 4 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'popIn 0.4s ease-out forwards'
          }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill={tokens.colors.yolk}
                stroke={tokens.colors.ink}
                strokeWidth="2"
              />
              {/* Shine */}
              <ellipse
                cx="30"
                cy="30"
                rx="8"
                ry="6"
                fill={tokens.colors.paper}
                opacity="0.6"
              />
            </svg>
          </div>
        )}

        {/* Phase 5+: Stars around */}
        {phase >= 5 && (
          <>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const radius = 90;
              const x = 80 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
              return (
                <svg
                  key={i}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    position: 'absolute',
                    left: x - 8,
                    top: y - 8,
                    animation: `starPop 0.3s ease-out ${i * 0.05}s forwards`,
                    opacity: 0
                  }}
                >
                  <path
                    d="M8 1 L8 15 M1 8 L15 8 M3 3 L13 13 M13 3 L3 13"
                    stroke={tokens.colors.ink}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              );
            })}
          </>
        )}
      </div>

      {/* Text appears at phase 5+ */}
      {phase >= 5 && (
        <div style={{
          marginTop: 32,
          animation: 'fadeIn 0.5s ease-out forwards'
        }}>
          <span style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 48,
            color: tokens.colors.ink,
            fontWeight: 400
          }}>
            Gusto
          </span>
        </div>
      )}
    </div>
  );
};

export default GustoLogo;

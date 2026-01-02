import { useState, useRef, useMemo, useEffect } from 'react';

// Importo i dati dal file principale (li estrarremo dopo se necessario)
// Per ora usiamo una versione semplificata inline

interface GlobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry: (country: string, city?: string) => void;
}

// Tokens
const tokens = {
  ink: '#2D2A26',
  paper: '#FAF7F2',
  ocean: '#FDF9F3',
  land: '#F0EBE1',
  highlight: '#E07A5F',
  muted: '#A8A4A0'
};

// Dati semplificati - solo i paesi con cucine nel nostro sistema
const cuisineCountries = [
  { name: 'Italy', nameIt: 'Italia', center: [12.5, 42.5] },
  { name: 'France', nameIt: 'Francia', center: [2.5, 47] },
  { name: 'Spain', nameIt: 'Spagna', center: [-3.5, 40] },
  { name: 'Germany', nameIt: 'Germania', center: [10.5, 51] },
  { name: 'United Kingdom', nameIt: 'Regno Unito', center: [-2, 54] },
  { name: 'Greece', nameIt: 'Grecia', center: [22, 39] },
  { name: 'Portugal', nameIt: 'Portogallo', center: [-8, 39.5] },
  { name: 'Japan', nameIt: 'Giappone', center: [138, 36] },
  { name: 'China', nameIt: 'Cina', center: [105, 35] },
  { name: 'India', nameIt: 'India', center: [79, 22] },
  { name: 'Thailand', nameIt: 'Thailandia', center: [101, 15] },
  { name: 'Vietnam', nameIt: 'Vietnam', center: [106, 16] },
  { name: 'South Korea', nameIt: 'Corea', center: [127.5, 36] },
  { name: 'Mexico', nameIt: 'Messico', center: [-102, 24] },
  { name: 'Brazil', nameIt: 'Brasile', center: [-53, -10] },
  { name: 'Argentina', nameIt: 'Argentina', center: [-65, -35] },
  { name: 'Peru', nameIt: 'Peru', center: [-76, -10] },
  { name: 'Morocco', nameIt: 'Marocco', center: [-6, 32] },
  { name: 'Turkey', nameIt: 'Turchia', center: [35, 39] },
  { name: 'Lebanon', nameIt: 'Libano', center: [35.8, 33.8] },
  { name: 'United States of America', nameIt: 'USA', center: [-98, 39] },
];

// Proiezione semplice per punti
const project = (lat: number, lng: number, rotX: number, rotY: number, radius: number) => {
  const lambda = (lng + rotX) * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const gamma = rotY * Math.PI / 180;

  let x = Math.cos(phi) * Math.sin(lambda);
  let y = -Math.sin(phi);
  let z = Math.cos(phi) * Math.cos(lambda);

  const y2 = y * Math.cos(gamma) - z * Math.sin(gamma);
  const z2 = y * Math.sin(gamma) + z * Math.cos(gamma);

  return { x: x * radius, y: y2 * radius, visible: z2 > 0, depth: z2 };
};

export function GlobeModal({ isOpen, onClose, onSelectCountry }: GlobeModalProps) {
  const [rotationX, setRotationX] = useState(10);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  const size = 320;
  const radius = size * 0.42;
  const center = size / 2;

  // Auto-rotate quando non si trascina
  useEffect(() => {
    if (!isOpen || isDragging) return;
    const interval = setInterval(() => {
      setRotationX(r => r + 0.3);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, isDragging]);

  // Calcola posizioni paesi
  const countryPoints = useMemo(() => {
    return cuisineCountries.map(country => {
      const proj = project(country.center[1], country.center[0], rotationX, rotationY, radius);
      return { ...country, proj };
    }).filter(c => c.proj.visible && c.proj.depth > 0.3);
  }, [rotationX, rotationY, radius]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setRotationX(r => r + dx * 0.5);
    setRotationY(r => Math.max(-60, Math.min(60, r - dy * 0.5)));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setRotationX(r => r + dx * 0.5);
    setRotationY(r => Math.max(-60, Math.min(60, r - dy * 0.5)));
  };

  const handleCountryClick = (country: typeof cuisineCountries[0]) => {
    onSelectCountry(country.nameIt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(45, 42, 38, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tokens.paper,
          borderRadius: 16,
          padding: 24,
          maxWidth: 400,
          width: '100%',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
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
            d="M1 2 Q0 0 2 1 L98 1 Q100 0 99 2 L99 98 Q100 100 98 99 L2 99 Q0 100 1 98 Z"
            stroke={tokens.ink}
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: tokens.ink,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 28,
            color: tokens.ink,
            margin: '0 0 16px 0',
            textAlign: 'center',
          }}
        >
          Esplora il Mondo
        </h2>

        {/* Globe */}
        <div
          style={{
            width: size,
            height: size,
            margin: '0 auto',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Ocean */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={tokens.ocean}
              stroke={tokens.ink}
              strokeWidth={1.5}
            />

            {/* Grid lines */}
            {[-60, -30, 0, 30, 60].map(lat => {
              const points: string[] = [];
              for (let lng = -180; lng <= 180; lng += 10) {
                const p = project(lat, lng, rotationX, rotationY, radius);
                if (p.visible) {
                  points.push(`${center + p.x},${center + p.y}`);
                }
              }
              return points.length > 1 ? (
                <polyline
                  key={`lat-${lat}`}
                  points={points.join(' ')}
                  fill="none"
                  stroke={tokens.muted}
                  strokeWidth={0.3}
                  opacity={0.5}
                />
              ) : null;
            })}

            {/* Country points */}
            <g transform={`translate(${center}, ${center})`}>
              {countryPoints.map(country => (
                <g
                  key={country.name}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCountryClick(country)}
                  onMouseEnter={() => setHoveredCountry(country.nameIt)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  {/* Dot */}
                  <circle
                    cx={country.proj.x}
                    cy={country.proj.y}
                    r={hoveredCountry === country.nameIt ? 8 : 6}
                    fill={hoveredCountry === country.nameIt ? tokens.highlight : tokens.land}
                    stroke={tokens.ink}
                    strokeWidth={1.5}
                    style={{ transition: 'all 0.15s' }}
                  />
                  {/* Label */}
                  <text
                    x={country.proj.x}
                    y={country.proj.y + 16}
                    textAnchor="middle"
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: 11,
                      fill: tokens.ink,
                      pointerEvents: 'none',
                      opacity: hoveredCountry === country.nameIt ? 1 : 0.7,
                    }}
                  >
                    {country.nameIt}
                  </text>
                </g>
              ))}
            </g>

            {/* Globe border */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={tokens.ink}
              strokeWidth={2}
            />
          </svg>
        </div>

        {/* Hint */}
        <p
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 14,
            color: tokens.muted,
            textAlign: 'center',
            margin: '12px 0 0 0',
          }}
        >
          {hoveredCountry
            ? `Clicca per scoprire la cucina ${hoveredCountry.toLowerCase()}a`
            : 'Trascina per ruotare, clicca un paese'
          }
        </p>
      </div>
    </div>
  );
}

import React, { useState, useRef, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import CulinaryPanel from './CulinaryPanel';
import { countriesData } from './countriesData';

// Design colors - warm paper aesthetic (identical to SVG version)
const colors = {
  ink: '#2D2A26',
  paper: '#FAF7F2',
  ocean: '#FDF9F3',
  land: '#F0EBE1',
  landHover: '#E8E0D3',
  highlight: '#E07A5F',
  border: '#C5B9A8'
};

// Generate equirectangular texture from country data
function generateGlobeTexture(countries, highlightedCountry = null, selectedCountry = null) {
  const width = 2048;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill ocean background
  ctx.fillStyle = colors.ocean;
  ctx.fillRect(0, 0, width, height);

  // Convert lng/lat to pixel coordinates (equirectangular projection)
  const lngLatToPixel = (lng, lat) => {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // Draw each country
  for (const country of countries) {
    if (!country.p) continue;

    // Determine fill color based on state
    let fillColor = colors.land;
    if (selectedCountry === country.n) {
      fillColor = colors.highlight;
    } else if (highlightedCountry === country.n) {
      fillColor = colors.landHover;
    }

    // Draw each polygon of the country
    for (const polygon of country.p) {
      if (polygon.length < 3) continue;

      ctx.beginPath();
      const [startX, startY] = lngLatToPixel(polygon[0][0], polygon[0][1]);
      ctx.moveTo(startX, startY);

      for (let i = 1; i < polygon.length; i++) {
        const [x, y] = lngLatToPixel(polygon[i][0], polygon[i][1]);
        ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  return canvas;
}

// Point-in-polygon test (ray casting algorithm)
function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

// Find country at given coordinates
function findCountryAtPoint(lng, lat, countries) {
  for (const country of countries) {
    if (!country.p) continue;
    for (const polygon of country.p) {
      if (pointInPolygon([lng, lat], polygon)) {
        return country;
      }
    }
  }
  return null;
}

// Globe mesh with texture
function GlobeMesh({
  texture,
  onCountryClick,
  onCountryHover,
  setGlobeMesh
}) {
  const meshRef = useRef();
  const { camera, raycaster, pointer } = useThree();

  useEffect(() => {
    if (meshRef.current) {
      setGlobeMesh(meshRef.current);
    }
  }, [setGlobeMesh]);

  const handlePointerMove = useCallback((event) => {
    if (!meshRef.current) return;

    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv;
      // UV: x=0-1 around sphere (lng), y=0 south pole to 1 north pole (lat)
      const lng = (uv.x - 0.5) * 360;
      const lat = (uv.y - 0.5) * 180;
      const country = findCountryAtPoint(lng, lat, countriesData);
      onCountryHover(country ? country.n : null);
    } else {
      onCountryHover(null);
    }
  }, [raycaster, onCountryHover]);

  const handleClick = useCallback((event) => {
    if (!meshRef.current) return;

    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv;
      const lng = (uv.x - 0.5) * 360;
      const lat = (uv.y - 0.5) * 180;
      const country = findCountryAtPoint(lng, lat, countriesData);
      if (country) {
        onCountryClick(country.n);
      }
    }
  }, [raycaster, onCountryClick]);

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={() => onCountryHover(null)}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

// Auto-rotate controller
function AutoRotate({ enabled, speed = 0.15 }) {
  const { camera } = useThree();

  useFrame(() => {
    if (enabled) {
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), speed * 0.001);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

// Main 3D scene
function GlobeScene({
  selectedCountry,
  hoveredCountry,
  onSelectCountry,
  onHoverCountry,
  autoRotate
}) {
  const [globeMesh, setGlobeMesh] = useState(null);

  // Generate texture whenever highlight state changes
  const texture = useMemo(() => {
    const canvas = generateGlobeTexture(countriesData, hoveredCountry, selectedCountry);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [hoveredCountry, selectedCountry]);

  return (
    <>
      <GlobeMesh
        texture={texture}
        onCountryClick={onSelectCountry}
        onCountryHover={onHoverCountry}
        setGlobeMesh={setGlobeMesh}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={4}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
      />

      <AutoRotate enabled={autoRotate && !selectedCountry} />
    </>
  );
}

// Main exported component
export default function GustoGlobe3D({
  isOpen = true,
  onClose,
  onSelectCountry: onSelectCountryProp,
  onAskQuestion,
  inline = false
}) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const handleSelectCountry = useCallback((country) => {
    setSelectedCountry(country);
    if (onSelectCountryProp) {
      onSelectCountryProp(country);
    }
  }, [onSelectCountryProp]);

  if (!isOpen) return null;

  // Inline mode - globe integrato nell'app senza container
  if (inline) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        width: '100%',
        padding: '20px 0'
      }}>
        <div
          style={{
            width: 'min(500px, 90vw)',
            height: 'min(500px, 90vw)',
            background: 'transparent'
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 3], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
            flat
          >
            <Suspense fallback={null}>
              <GlobeScene
                selectedCountry={selectedCountry}
                hoveredCountry={hoveredCountry}
                onSelectCountry={handleSelectCountry}
                onHoverCountry={setHoveredCountry}
                autoRotate={true}
              />
            </Suspense>
          </Canvas>
        </div>

        {selectedCountry && (
          <div style={{
            width: '100%',
            maxWidth: 500,
            background: 'white',
            borderRadius: 16,
            border: `2px solid ${colors.ink}`,
            padding: 20
          }}>
            <CulinaryPanel
              country={selectedCountry}
              onClose={() => setSelectedCountry(null)}
              onAskQuestion={(question, context) => {
                if (onAskQuestion) onAskQuestion(question, context);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  const canvasSize = Math.min(window.innerWidth - 40, 500);

  // Modal mode
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      background: colors.paper,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 20
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&display=swap');
      `}</style>

      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 700
      }}>
        <h1 style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 32,
          color: colors.ink,
          margin: 0
        }}>
          Gusto World
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 28,
              cursor: 'pointer',
              color: colors.ink,
              lineHeight: 1
            }}
          >
            x
          </button>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div
          style={{
            width: canvasSize,
            height: canvasSize,
            borderRadius: 16,
            border: `2px solid ${colors.ink}`,
            overflow: 'hidden',
            background: colors.paper,
            flexShrink: 0
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 3], fov: 45 }}
            style={{ background: colors.paper }}
            gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
            flat
          >
            <Suspense fallback={null}>
              <GlobeScene
                selectedCountry={selectedCountry}
                hoveredCountry={hoveredCountry}
                onSelectCountry={handleSelectCountry}
                onHoverCountry={setHoveredCountry}
                autoRotate={true}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Info Panel */}
        <div style={{
          width: 280,
          minHeight: 200,
          background: 'white',
          borderRadius: 16,
          border: `2px solid ${colors.ink}`,
          padding: 20,
          fontFamily: "'Caveat', cursive"
        }}>
          {selectedCountry ? (
            <CulinaryPanel
              country={selectedCountry}
              onClose={() => setSelectedCountry(null)}
              onAskQuestion={(question, context) => {
                if (onAskQuestion) {
                  onAskQuestion(question, context);
                }
                if (onClose) onClose();
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: colors.ink, opacity: 0.6 }}>
              <p style={{ fontSize: 48, margin: '20px 0' }}>🌍</p>
              <p style={{ fontSize: 20 }}>
                Clicca su un paese per scoprire i piatti tipici!
              </p>
              {hoveredCountry && (
                <p style={{
                  fontSize: 24,
                  marginTop: 16,
                  opacity: 1,
                  color: colors.highlight
                }}>
                  {hoveredCountry}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <p style={{
        fontFamily: "'Caveat', cursive",
        fontSize: 16,
        color: colors.ink,
        opacity: 0.5
      }}>
        trascina per ruotare - scroll per zoom - clicca paese
      </p>
    </div>
  );
}

import React, { useState, useRef, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import CulinaryPanel from './CulinaryPanel';

// Design colors - warm paper aesthetic
const colors = {
  ink: '#2D2A26',
  paper: '#FAF7F2',
  ocean: '#FDF9F3',
  land: '#D4C4B0',
  landHover: '#C9B8A1',
  highlight: '#E07A5F',
  border: '#B8A992'
};

// Convert lat/lng to 3D position on sphere
function latLngToVector3(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

// Convert GeoJSON to 3D points for point cloud rendering
function geoJsonToPoints(features, radius) {
  const points = [];
  const countryBounds = []; // Store country info for hit detection

  features.forEach((feature) => {
    const geometry = feature.geometry;
    const countryName = feature.properties?.NAME || feature.properties?.ADMIN || 'Unknown';
    if (!geometry) return;

    const countryPoints = [];

    const processCoordinates = (coords) => {
      for (let i = 0; i < coords.length; i++) {
        const [lng, lat] = coords[i];
        const [x, y, z] = latLngToVector3(lat, lng, radius);
        points.push(x, y, z);
        countryPoints.push({ lat, lng });
      }
    };

    const processPolygon = (polygon) => {
      polygon.forEach((ring) => processCoordinates(ring));
    };

    if (geometry.type === 'Polygon') {
      processPolygon(geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon) => processPolygon(polygon));
    }

    if (countryPoints.length > 0) {
      // Calculate centroid for hit detection
      const avgLat = countryPoints.reduce((sum, p) => sum + p.lat, 0) / countryPoints.length;
      const avgLng = countryPoints.reduce((sum, p) => sum + p.lng, 0) / countryPoints.length;
      countryBounds.push({
        name: countryName,
        centroid: { lat: avgLat, lng: avgLng },
        points: countryPoints
      });
    }
  });

  return {
    points: new Float32Array(points),
    countries: countryBounds
  };
}

// Generate ocean grid points
function generateOceanPoints(radius) {
  const points = [];
  const step = 6; // degrees

  for (let lat = -80; lat <= 80; lat += step) {
    for (let lng = -180; lng < 180; lng += step) {
      const [x, y, z] = latLngToVector3(lat, lng, radius);
      points.push(x, y, z);
    }
  }

  return new Float32Array(points);
}

// Find closest country to a lat/lng point
function findClosestCountry(lat, lng, countries) {
  let closest = null;
  let minDist = Infinity;

  for (const country of countries) {
    // Simple distance check to centroid
    const dLat = country.centroid.lat - lat;
    const dLng = country.centroid.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (dist < minDist && dist < 15) { // Within 15 degrees
      minDist = dist;
      closest = country.name;
    }
  }

  return closest;
}

// Point-in-polygon for more accurate detection
function pointInCountry(lat, lng, country) {
  // Check if point is within any polygon ring of the country
  for (let i = 0; i < country.points.length - 1; i++) {
    const p1 = country.points[i];
    const p2 = country.points[i + 1];
    // Simple proximity check
    const dist = Math.sqrt(Math.pow(lat - p1.lat, 2) + Math.pow(lng - p1.lng, 2));
    if (dist < 5) return true;
  }
  return false;
}

// Globe content component
function GlobeContent({ geoData, selectedCountry, hoveredCountry, onSelectCountry, onHoverCountry }) {
  const globeRef = useRef();
  const sphereRef = useRef();
  const { raycaster, camera } = useThree();
  const radius = 1;
  const currentSpeed = useRef(0.1);

  // Process GeoJSON data
  const { landPoints, oceanPoints, countries } = useMemo(() => {
    if (!geoData?.features) {
      return { landPoints: new Float32Array(0), oceanPoints: generateOceanPoints(radius * 0.99), countries: [] };
    }
    const { points, countries } = geoJsonToPoints(geoData.features, radius);
    return {
      landPoints: points,
      oceanPoints: generateOceanPoints(radius * 0.99),
      countries
    };
  }, [geoData]);

  // Auto rotate
  useFrame((_, delta) => {
    if (globeRef.current) {
      const targetSpeed = selectedCountry ? 0.02 : 0.1;
      currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.02;
      globeRef.current.rotation.y += delta * currentSpeed.current;
    }
  });

  // Handle click on globe
  const handleClick = useCallback((event) => {
    if (!sphereRef.current) return;

    const intersects = raycaster.intersectObject(sphereRef.current);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      // Convert 3D point back to lat/lng
      const r = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
      const lat = Math.asin(point.y / r) * (180 / Math.PI);
      const lng = Math.atan2(point.z, -point.x) * (180 / Math.PI) - 180;

      // Find country at this position
      const country = findClosestCountry(lat, lng, countries);
      if (country) {
        onSelectCountry(country);
      }
    }
  }, [raycaster, countries, onSelectCountry]);

  // Handle hover
  const handlePointerMove = useCallback((event) => {
    if (!sphereRef.current) return;

    const intersects = raycaster.intersectObject(sphereRef.current);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const r = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
      const lat = Math.asin(point.y / r) * (180 / Math.PI);
      const lng = Math.atan2(point.z, -point.x) * (180 / Math.PI) - 180;

      const country = findClosestCountry(lat, lng, countries);
      onHoverCountry(country);
    } else {
      onHoverCountry(null);
    }
  }, [raycaster, countries, onHoverCountry]);

  return (
    <group ref={globeRef}>
      {/* Ocean background points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[oceanPoints, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.012}
          color={colors.border}
          transparent
          opacity={0.3}
          sizeAttenuation
        />
      </points>

      {/* Land points (countries) */}
      {landPoints.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[landPoints, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.015}
            color={colors.land}
            transparent
            opacity={0.9}
            sizeAttenuation
          />
        </points>
      )}

      {/* Invisible sphere for raycasting/click detection */}
      <mesh
        ref={sphereRef}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => onHoverCountry(null)}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
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
  const [geoData, setGeoData] = useState(null);

  // Load GeoJSON data
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch(console.error);
  }, []);

  const handleSelectCountry = useCallback((country) => {
    setSelectedCountry(country);
    if (onSelectCountryProp) {
      onSelectCountryProp(country);
    }
  }, [onSelectCountryProp]);

  if (!isOpen) return null;

  // Inline mode - globe integrato nell'app
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
            background: colors.paper,
            borderRadius: 16
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 2.8], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
            flat
          >
            <Suspense fallback={null}>
              <GlobeContent
                geoData={geoData}
                selectedCountry={selectedCountry}
                hoveredCountry={hoveredCountry}
                onSelectCountry={handleSelectCountry}
                onHoverCountry={setHoveredCountry}
              />
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={1.8}
                maxDistance={4}
                rotateSpeed={0.5}
                zoomSpeed={0.5}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Hovered country indicator */}
        {hoveredCountry && !selectedCountry && (
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 24,
            color: colors.highlight
          }}>
            {hoveredCountry}
          </div>
        )}

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
            camera={{ position: [0, 0, 2.8], fov: 45 }}
            style={{ background: colors.paper }}
            gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
            flat
          >
            <Suspense fallback={null}>
              <GlobeContent
                geoData={geoData}
                selectedCountry={selectedCountry}
                hoveredCountry={hoveredCountry}
                onSelectCountry={handleSelectCountry}
                onHoverCountry={setHoveredCountry}
              />
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={1.8}
                maxDistance={4}
                rotateSpeed={0.5}
                zoomSpeed={0.5}
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

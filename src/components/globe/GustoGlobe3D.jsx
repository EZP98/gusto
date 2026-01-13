import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import CulinaryPanel from './CulinaryPanel';

// Design colors - warm paper aesthetic
const colors = {
  ink: '#2D2A26',
  paper: '#FAF7F2',
  ocean: '#FDF9F3',
  land: '#F0EBE1',
  landHover: '#E8E0D3',
  highlight: '#E07A5F',
  border: '#C5B9A8'
};

// Main exported component
export default function GustoGlobe3D({
  isOpen = true,
  onClose,
  onSelectCountry: onSelectCountryProp,
  onAskQuestion,
  inline = false
}) {
  const globeRef = useRef();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [geoData, setGeoData] = useState({ features: [] });

  // Load GeoJSON data
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch(console.error);
  }, []);

  // Disable zoom
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.enableZoom = false;
    }
  }, [geoData]);


  const handleSelectCountry = useCallback((polygon) => {
    if (polygon) {
      const name = polygon.properties?.NAME || polygon.properties?.ADMIN;
      setSelectedCountry(name);
      if (onSelectCountryProp) {
        onSelectCountryProp(name);
      }
    }
  }, [onSelectCountryProp]);

  const handleHoverCountry = useCallback((polygon) => {
    const name = polygon?.properties?.NAME || polygon?.properties?.ADMIN || null;
    setHoveredCountry(name);
  }, []);

  const getPolygonColor = useCallback((d) => {
    const name = d.properties?.NAME || d.properties?.ADMIN;
    if (selectedCountry === name) return colors.highlight;
    if (hoveredCountry === name) return colors.landHover;
    return colors.land;
  }, [selectedCountry, hoveredCountry]);

  // Globe material (ocean color)
  const globeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: colors.ocean });
  }, []);

  if (!isOpen) return null;

  const globeSize = inline ? 'min(700px, 90vw)' : Math.min(window.innerWidth - 40, 700);

  const globeElement = (
    <Globe
      ref={globeRef}
      width={typeof globeSize === 'string' ? 700 : globeSize}
      height={typeof globeSize === 'string' ? 700 : globeSize}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl={null}
      showGlobe={true}
      showAtmosphere={false}
      globeMaterial={globeMaterial}
      enablePointerInteraction={true}

      // Polygon styling
      polygonsData={geoData.features}
      polygonCapColor={getPolygonColor}
      polygonSideColor={() => colors.land}
      polygonStrokeColor={() => colors.border}
      polygonAltitude={0.005}
      polygonsTransitionDuration={200}

      // Interactivity
      onPolygonClick={handleSelectCountry}
      onPolygonHover={handleHoverCountry}
    />
  );

  // Inline mode
  if (inline) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 24,
        width: '100%',
        padding: '20px 0',
        position: 'relative'
      }}>
        <div style={{
          width: globeSize,
          height: globeSize,
          background: colors.paper,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {globeElement}
        </div>

        {hoveredCountry && !selectedCountry && (
          <div style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Caveat', cursive",
            fontSize: 24,
            color: colors.highlight
          }}>
            {hoveredCountry}
          </div>
        )}

        {selectedCountry && (
          <div style={{
            position: 'absolute',
            top: 20,
            right: 20,
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
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
            ×
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
        <div style={{
          width: globeSize,
          height: globeSize,
          borderRadius: 16,
          border: `2px solid ${colors.ink}`,
          overflow: 'hidden',
          background: colors.paper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {globeElement}
        </div>

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

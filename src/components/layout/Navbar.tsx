import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ZineText,
  HandDrawnFrame,
  SketchChef,
  SketchBook,
  SketchCalendar,
  SketchX
} from '../ui/ZineUI';

const navItems = [
  { path: '/', label: 'home', Icon: SketchChef },
  { path: '/recipes', label: 'ricette', Icon: SketchBook },
  { path: '/meal-planner', label: 'planner', Icon: SketchCalendar },
  { path: '/chat', label: 'chef AI', Icon: SketchChef },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Nav */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#FAF7F2',
        borderBottom: '1.5px solid #2D2A26',
        padding: '12px 24px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SketchChef size={32} />
            <ZineText size="lg">Chef AI</ZineText>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: 'flex', gap: '24px' }} className="hidden md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    textDecoration: 'none',
                    position: 'relative'
                  }}
                >
                  <ZineText
                    size="md"
                    style={{
                      color: isActive ? '#2D2A26' : '#8B857C'
                    }}
                  >
                    {item.label}
                  </ZineText>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: '#2D2A26'
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
            className="md:hidden"
          >
            <ZineText size="lg">☰</ZineText>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#FAF7F2',
          zIndex: 100,
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <SketchX size={24} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            {navItems.map((item) => {
              const Icon = item.Icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <HandDrawnFrame style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={24} />
                    <ZineText size="lg">{item.label}</ZineText>
                  </HandDrawnFrame>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: '60px' }} />
    </>
  );
}

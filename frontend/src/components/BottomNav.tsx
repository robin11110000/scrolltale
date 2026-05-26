import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const TABS = [
  {
    id: 'discover',
    label: 'Discover',
    icon: '⚡',
    path: '/',
    match: (p: string) => p === '/' || p.startsWith('/series'),
  },
  {
    id: 'library',
    label: 'Library',
    icon: '📚',
    path: '/profile?tab=library',
    match: (p: string, s: string) => p.startsWith('/profile') && s.includes('library'),
  },
  {
    id: 'creator',
    label: 'Creator',
    icon: '✍️',
    path: '/creator',
    match: (p: string) => p.startsWith('/creator'),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    path: '/profile',
    match: (p: string, s: string) => p.startsWith('/profile') && !s.includes('library'),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <nav style={{
        width: '100%',
        maxWidth: 430,
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,20,147,0.2)',
        display: 'flex',
        padding: '10px 0 20px',
        pointerEvents: 'all',
      }}>
        {TABS.map((tab) => {
          const isActive = tab.match(pathname, search);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '4px 0',
                position: 'relative',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  style={{
                    position: 'absolute',
                    top: -10,
                    width: 36,
                    height: 3,
                    background: '#FF1493',
                    borderRadius: 999,
                    boxShadow: '0 0 10px rgba(255,20,147,0.7)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#FF1493' : '#555',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

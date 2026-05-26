import { useNavigate, useLocation } from 'react-router-dom';

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
        maxWidth: 1200,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        padding: '10px 0 16px',
        pointerEvents: 'all',
        margin: '0 24px',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
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
                gap: 4,
                padding: '4px 0',
                position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  width: 32,
                  height: 3,
                  background: 'var(--accent)',
                  borderRadius: 999,
                }} />
              )}
              <span style={{
                fontSize: 18,
                lineHeight: 1,
                opacity: isActive ? 1 : 0.5,
                transition: 'opacity 0.2s',
              }}>
                {tab.icon}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
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

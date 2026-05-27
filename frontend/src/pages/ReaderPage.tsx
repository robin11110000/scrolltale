import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_SERIES } from '../data/series';

interface Panel {
  id: string;
  bg: string;
  shapeColor: string;
  speaker: string;
  dialogue: string;
}

const DIALOGUE_BANKS: { speaker: string; text: string }[][] = [
  [
    { speaker: 'Narrator', text: 'The city never sleeps. Neither do its oldest secrets.' },
    { speaker: 'Maya', text: '"I won\'t stop. Not now. Not ever."' },
    { speaker: 'Narrator', text: 'The signal cut through the noise like a blade through silence.' },
    { speaker: 'Kai', text: '"You don\'t know what you\'ve found."' },
    { speaker: 'Maya', text: '"Then tell me."' },
    { speaker: 'Narrator', text: 'Three seconds that felt like a lifetime.' },
    { speaker: 'Kai', text: '"This changes everything. For both of us."' },
    { speaker: 'Narrator', text: 'She looked up at the neon-soaked sky and made her choice.' },
    { speaker: 'Maya', text: '"Let\'s go. Before they realise we\'re gone."' },
    { speaker: 'Narrator', text: 'The night was only just beginning.' },
  ],
  [
    { speaker: 'Narrator', text: 'Midnight. The last greenhouse in the city.' },
    { speaker: 'Rei', text: '"Why are you still here?"' },
    { speaker: 'Jun', text: '"Because the flowers close at dawn and I\'m not done looking."' },
    { speaker: 'Narrator', text: 'Something shifted in that moment — soft and irreversible.' },
    { speaker: 'Rei', text: '"You always say the strangest things."' },
    { speaker: 'Jun', text: '"You always listen."' },
    { speaker: 'Narrator', text: 'The petals opened in the dark. They always do.' },
    { speaker: 'Rei', text: '"I didn\'t expect this."' },
    { speaker: 'Jun', text: '"Neither did I."' },
    { speaker: 'Narrator', text: 'Some things grow best without sunlight.' },
  ],
  [
    { speaker: 'Narrator', text: 'This universe should not exist. She knew that the moment she stepped through.' },
    { speaker: 'Zara', text: '"The coordinates are wrong. Everything is wrong."' },
    { speaker: 'Narrator', text: 'The void called back. It always does to those who listen.' },
    { speaker: 'Echo', text: '"You were expected."' },
    { speaker: 'Zara', text: '"By who?"' },
    { speaker: 'Echo', text: '"By everything that was left behind."' },
    { speaker: 'Narrator', text: 'She reached for the signal and felt it reach back.' },
    { speaker: 'Zara', text: '"I came here to close the gate."' },
    { speaker: 'Echo', text: '"We know. That\'s why we opened it."' },
    { speaker: 'Narrator', text: 'The truth was stranger than any dead world she\'d walked.' },
  ],
];

function makePanels(seriesId: string): Panel[] {
  const series = ALL_SERIES.find(s => s.id === seriesId);
  const accent = series?.accentColor ?? '#7c3aed';
  const bankIndex = ALL_SERIES.findIndex(s => s.id === seriesId) % DIALOGUE_BANKS.length;
  const bank = DIALOGUE_BANKS[bankIndex];

  const bgPairs = [
    ['#030003', '#120015'],
    ['#000808', '#001a1a'],
    ['#050000', '#160000'],
    ['#000503', '#001510'],
    ['#030300', '#0d0d00'],
    ['#000003', '#00000d'],
    ['#030003', '#0d0011'],
    ['#000a0a', '#002020'],
    ['#050000', `${accent}18`],
    ['#000005', `${accent}12`],
  ];

  return bank.map((d, i) => ({
    id: `panel-${i}`,
    bg: `linear-gradient(180deg, ${bgPairs[i % bgPairs.length][0]} 0%, ${bgPairs[i % bgPairs.length][1]} 100%)`,
    shapeColor: accent,
    speaker: d.speaker,
    dialogue: d.text,
  }));
}

export default function ReaderPage() {
  const { seriesId, episodeId } = useParams<{ seriesId: string; episodeId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [showNext, setShowNext] = useState(false);

  const series = ALL_SERIES.find(s => s.id === seriesId);
  const epIndex = series ? series.episodes.findIndex(e => e.id === episodeId) : -1;
  const episode = epIndex >= 0 ? series!.episodes[epIndex] : null;
  const nextEp = epIndex >= 0 && epIndex < series!.episodes.length - 1
    ? series!.episodes[epIndex + 1]
    : null;

  const panels = seriesId ? makePanels(seriesId) : [];

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? Math.min(scrolled / total, 1) : 0;
      setProgress(p);
      setShowNext(p > 0.88);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [episodeId]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Progress bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'var(--surface)',
        zIndex: 100,
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'var(--gradient)',
          transition: 'width 0.12s linear',
        }} />
      </div>

      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 3,
        left: 0,
        right: 0,
        zIndex: 90,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 10,
          paddingBottom: 10,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <button
            onClick={() => navigate(`/series/${seriesId}`)}
            aria-label="Back to series"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 999,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 18,
            }}
          >
            ←
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text)',
              lineHeight: 1.2,
            }}>
              {episode?.title ?? 'Reading...'}
            </p>
            <p style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 2,
            }}>
              {series?.title} · EP {episode?.number}
            </p>
          </div>
          <div style={{ width: 36 }} />
        </div>
      </div>

      {/* Panels */}
      <div style={{ paddingTop: 56, maxWidth: 680, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
        {panels.map((panel, i) => (
          <div
            key={panel.id}
            style={{
              margin: '8px 0',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: panel.bg,
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '24px',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            {/* Decorative shapes */}
            <div style={{
              position: 'absolute',
              top: '18%',
              left: i % 2 === 0 ? '12%' : '60%',
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: `${panel.shapeColor}12`,
              border: `1px solid ${panel.shapeColor}28`,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              top: '45%',
              right: i % 2 === 0 ? '8%' : '55%',
              width: 130,
              height: 2,
              background: `${panel.shapeColor}30`,
              transform: `rotate(${i % 2 === 0 ? -12 : 12}deg)`,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '35%',
              left: '30%',
              width: 40,
              height: 40,
              borderRadius: 8,
              background: `${panel.shapeColor}08`,
              border: `1px solid ${panel.shapeColor}18`,
              transform: 'rotate(22deg)',
              pointerEvents: 'none',
            }} />

            <div style={{
              position: 'absolute',
              top: 14,
              right: 16,
              fontSize: 11,
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: '0.06em',
            }}>
              {String(i + 1).padStart(2, '0')} / {panels.length}
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <p style={{
                fontSize: 10,
                color: panel.shapeColor,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 6,
                fontWeight: 600,
              }}>
                {panel.speaker}
              </p>
              <p style={{
                fontSize: 15,
                color: '#e0e0e0',
                lineHeight: 1.65,
                fontStyle: panel.speaker === 'Narrator' ? 'italic' : 'normal',
              }}>
                {panel.dialogue}
              </p>
            </div>
          </div>
        ))}

        {/* End card */}
        <AnimatePresence>
          {showNext && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                margin: '24px 0 100px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 12,
                color: 'var(--accent-light)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>
                You finished this episode
              </p>
              {nextEp ? (
                <>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 18,
                    color: 'var(--text)',
                    marginBottom: 20,
                    lineHeight: 1.3,
                  }}>
                    Next: {nextEp.title}
                  </p>
                  <motion.button
                    onClick={() => navigate(`/read/${seriesId}/${nextEp.id}`)}
                    whileHover={{ boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'var(--accent)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#fff',
                      cursor: 'pointer',
                      marginBottom: 12,
                    }}
                  >
                    Read Next Episode →
                  </motion.button>
                </>
              ) : (
                <p style={{
                  fontSize: 15,
                  color: 'var(--text-muted)',
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}>
                  You're all caught up! More episodes dropping soon.
                </p>
              )}
              <button
                onClick={() => navigate(`/series/${seriesId}`)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  padding: '10px 22px',
                  borderRadius: 999,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Back to series
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

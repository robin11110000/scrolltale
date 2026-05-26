import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoins } from '../context/CoinContext';
import { ALL_SERIES, type Episode } from '../data/series';

/* ── Animated coin counter ────────────────────────────────────────────────── */
function AnimatedCoinCount({ value }: { value: number }) {
  const display = useRef(value);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const start = display.current;
    const end = value;
    if (start === end) return;
    const duration = 550;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      display.current = Math.round(start + (end - start) * eased);
      forceRender(n => n + 1);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <>{display.current.toLocaleString()}</>;
}

/* ── Unlock modal ─────────────────────────────────────────────────────────── */
function UnlockModal({
  episode,
  seriesId,
  onClose,
}: {
  episode: Episode;
  seriesId: string;
  onClose: () => void;
}) {
  const { balance, spendCoins } = useCoins();
  const canAfford = balance >= episode.coinCost;
  const [phase, setPhase] = useState<'idle' | 'unlocking' | 'done' | 'broke'>('idle');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleUnlock = () => {
    if (!canAfford) { setPhase('broke'); return; }
    setPhase('unlocking');
    const ok = spendCoins(episode.coinCost, `${seriesId}:${episode.id}`);
    if (ok) {
      setTimeout(() => { setPhase('done'); setTimeout(onClose, 1100); }, 600);
    } else {
      setPhase('broke');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 88,
      }}
    >
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 90, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        style={{
          background: '#141414',
          border: '1px solid rgba(255,20,147,0.3)',
          borderRadius: 24,
          padding: '28px 24px 24px',
          width: 'calc(100% - 32px)',
          maxWidth: 400,
          boxShadow: '0 0 60px rgba(255,20,147,0.18)',
        }}
      >
        {phase === 'done' ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', padding: '10px 0' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{ fontSize: 52, marginBottom: 14 }}
            >
              🎉
            </motion.div>
            <p style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 20,
              color: '#FF1493', marginBottom: 6,
            }}>episode unlocked!</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#555' }}>
              it's yours forever ✨
            </p>
          </motion.div>
        ) : (
          <>
            <p style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18,
              color: '#fff', marginBottom: 4,
            }}>
              unlock episode {episode.number}
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#555',
              marginBottom: 20,
            }}>
              {episode.title}
            </p>

            {/* Cost / Balance row */}
            <div style={{
              background: '#0d0d0d',
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#444', marginBottom: 4 }}>
                  episode cost
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 22,
                  color: '#FF1493', fontVariantNumeric: 'tabular-nums',
                }}>
                  🪙 {episode.coinCost}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#444', marginBottom: 4 }}>
                  your balance
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 22,
                  color: canAfford ? '#fff' : '#cc3333',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  🪙 <AnimatedCoinCount value={balance} />
                </p>
              </div>
            </div>

            {phase === 'broke' && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#cc3333',
                  textAlign: 'center', marginBottom: 12,
                }}
              >
                not enough coins — head to Profile to top up
              </motion.p>
            )}

            <motion.button
              onClick={handleUnlock}
              disabled={phase === 'unlocking'}
              whileHover={canAfford ? { boxShadow: '0 0 36px rgba(255,20,147,0.75)' } : {}}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                padding: '16px',
                background: canAfford ? '#FF1493' : '#1a1a1a',
                border: 'none',
                borderRadius: 16,
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                color: canAfford ? '#fff' : '#444',
                cursor: canAfford ? 'pointer' : 'not-allowed',
                boxShadow: canAfford ? '0 0 20px rgba(255,20,147,0.4)' : 'none',
                letterSpacing: '0.04em',
                transition: 'background 0.2s',
              }}
            >
              {phase === 'unlocking'
                ? 'unlocking...'
                : canAfford
                ? `unlock for 🪙 ${episode.coinCost}`
                : 'not enough coins'}
            </motion.button>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: '#444',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                cursor: 'pointer',
                marginTop: 6,
              }}
            >
              cancel
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Episode row ──────────────────────────────────────────────────────────── */
function EpisodeRow({
  episode,
  seriesId,
  isOwned,
  isJustUnlocked,
  onLocked,
}: {
  episode: Episode;
  seriesId: string;
  isOwned: boolean;
  isJustUnlocked: boolean;
  onLocked: () => void;
}) {
  const navigate = useNavigate();
  const accessible = episode.isFree || isOwned;

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (accessible) navigate(`/read/${seriesId}/${episode.id}`);
        else onLocked();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid #111',
        cursor: 'pointer',
        gap: 14,
      }}
    >
      {/* Number chip */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: accessible ? 'rgba(255,20,147,0.1)' : '#0d0d0d',
        border: `1px solid ${accessible ? 'rgba(255,20,147,0.3)' : '#1a1a1a'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: 13,
        color: accessible ? '#FF1493' : '#333',
      }}>
        {episode.number}
      </div>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 500,
          fontSize: 15,
          color: accessible ? '#fff' : '#444',
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {episode.title}
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#333' }}>
          Episode {episode.number}
        </p>
      </div>

      {/* Badge */}
      <div style={{ flexShrink: 0 }}>
        {isJustUnlocked ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            style={{
              background: '#FF1493',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 10,
              padding: '4px 10px',
              borderRadius: 999,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
              boxShadow: '0 0 12px rgba(255,20,147,0.55)',
            }}
          >
            Owned
          </motion.span>
        ) : isOwned ? (
          <span style={{
            background: 'rgba(255,20,147,0.14)',
            color: '#FF1493',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 10,
            padding: '4px 10px',
            borderRadius: 999,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
          }}>
            Owned
          </span>
        ) : episode.isFree ? (
          <span style={{
            background: 'rgba(0,200,80,0.12)',
            color: '#00cc55',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 10,
            padding: '4px 10px',
            borderRadius: 999,
            letterSpacing: '0.05em',
          }}>
            Free
          </span>
        ) : (
          <span style={{
            background: '#0d0d0d',
            color: '#555',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 999,
            border: '1px solid #222',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            🪙 {episode.coinCost}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── Series page ──────────────────────────────────────────────────────────── */
export default function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ownedEpisodes } = useCoins();
  const [unlocking, setUnlocking] = useState<Episode | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<Set<string>>(new Set());

  const series = ALL_SERIES.find(s => s.id === id);

  if (!series) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, color: '#555', marginBottom: 20 }}>
          series not found
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent', border: 'none',
            color: '#FF1493', fontFamily: 'Inter, sans-serif',
            fontSize: 14, cursor: 'pointer',
          }}
        >
          ← back to discover
        </button>
      </div>
    );
  }

  const handleModalClose = () => {
    if (unlocking) {
      const key = `${series.id}:${unlocking.id}`;
      if (ownedEpisodes.has(key)) {
        setJustUnlocked(prev => new Set([...prev, key]));
        setTimeout(() => {
          setJustUnlocked(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }, 4000);
      }
    }
    setUnlocking(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: 90 }}>
      {/* Banner */}
      <div style={{
        height: 248,
        background: series.bannerGradient,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '20px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 20,
          }}
          aria-label="Go back"
        >
          ←
        </button>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            background: 'rgba(255,20,147,0.2)',
            border: '1px solid rgba(255,20,147,0.45)',
            color: '#FF1493',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 999,
            letterSpacing: '0.07em',
            textTransform: 'uppercase' as const,
            display: 'inline-block',
            marginBottom: 10,
          }}>
            {series.genre}
          </span>
          <h1 style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 26,
            color: '#fff',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 24px rgba(0,0,0,0.9)',
            marginBottom: 4,
          }}>
            {series.title}
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
          }}>
            by {series.author}
          </p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Description */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: '#888',
          lineHeight: 1.75,
          marginBottom: 20,
        }}>
          {series.description}
        </p>

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Episodes', value: String(series.episodes.length) },
            { label: 'Free', value: String(series.episodes.filter(e => e.isFree).length) },
            { label: 'Per ep', value: '🪙 10' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: 14,
                padding: '12px 8px',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: '#FF1493',
                marginBottom: 4,
              }}>{s.value}</p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#444',
                letterSpacing: '0.04em',
                textTransform: 'uppercase' as const,
              }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Episode list header */}
        <h2 style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: '#FF1493',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          marginBottom: 6,
        }}>
          Episodes
        </h2>

        {series.episodes.map(ep => {
          const key = `${series.id}:${ep.id}`;
          return (
            <EpisodeRow
              key={ep.id}
              episode={ep}
              seriesId={series.id}
              isOwned={ownedEpisodes.has(key)}
              isJustUnlocked={justUnlocked.has(key)}
              onLocked={() => setUnlocking(ep)}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {unlocking && (
          <UnlockModal
            episode={unlocking}
            seriesId={series.id}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

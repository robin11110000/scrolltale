import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from "thirdweb/react";
import { useCoins } from '../context/CoinContext';
import { useWallet, client, wallets } from '../context/WalletContext';
import { ALL_SERIES, type Episode, type PassTier } from '../data/series';

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

function PassCard({
  tier,
  pass,
  seriesId,
  seriesGradient,
  onBuy,
  isOwned,
  isPurchasing,
}: {
  tier: 'reader' | 'patron';
  pass: PassTier | null;
  seriesId: string;
  seriesGradient: string;
  onBuy: () => void;
  isOwned: boolean;
  isPurchasing: boolean;
}) {
  const { isConnected } = useWallet();
  const { hasAccess } = useCoins();

  if (!pass) {
    return (
      <div style={{
        background: seriesGradient,
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        opacity: 0.5,
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            color: '#fff',
            marginBottom: 4,
          }}>
            {tier === 'reader' ? 'Reader Pass' : 'Patron Pass'}
          </h3>
          <p style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 16,
          }}>
            Coming Soon
          </p>
          <span style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 999,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            display: 'inline-block',
          }}>
            Not available
          </span>
        </div>
      </div>
    );
  }
  
  const canAccess = hasAccess(seriesId, tier);
  const isAccessible = isOwned || canAccess;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: seriesGradient,
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        cursor: isAccessible ? 'default' : 'pointer',
        border: isAccessible ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
      }}
      onClick={isAccessible ? undefined : onBuy}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: '#fff',
              marginBottom: 4,
            }}>
              {pass.label}
            </h3>
            <p style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {tier === 'patron' ? 'Full Access + Bonus' : 'All Episodes'}
            </p>
          </div>
          
          {isAccessible && (
            <span style={{
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 999,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Owned
            </span>
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              color: '#fff',
              marginBottom: 2,
            }}>
              {pass.priceEth} ETH
            </p>
            <p style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
            }}>
              + 5% creator royalty on resale
            </p>
          </div>

          {!isAccessible && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isPurchasing || !isConnected}
              style={{
                background: isPurchasing ? 'rgba(255,255,255,0.1)' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 16px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 13,
                color: isPurchasing ? 'rgba(255,255,255,0.6)' : '#000',
                cursor: isPurchasing || !isConnected ? 'not-allowed' : 'pointer',
                opacity: !isConnected ? 0.6 : 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isPurchasing && isConnected) onBuy();
              }}
            >
              {isPurchasing ? 'Minting...' : !isConnected ? 'Connect Wallet' : 'Buy Pass'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

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
  const { isConnected, address, connecting } = useWallet();
  const canAfford = balance >= episode.coinCost;
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'unlocking' | 'done' | 'broke'>('idle');

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
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 32,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 0 80px rgba(124,58,237,0.08)',
        }}
      >
        {phase === 'done' ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', padding: '16px 0' }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
              color: 'var(--accent-light)', marginBottom: 6,
            }}>Episode unlocked!</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              It's yours forever.
            </p>
          </motion.div>
        ) : (
          <>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
              color: 'var(--text)', marginBottom: 4,
            }}>
              Unlock Episode {episode.number}
            </p>
            <p style={{
              fontSize: 13, color: 'var(--text-muted)',
              marginBottom: isConnected ? 16 : 24,
            }}>
              {episode.title}
            </p>

            {isConnected && address && (
              <div style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 16px',
                marginBottom: 20,
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px rgba(16,185,129,0.4)',
                }} />
                <span style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginRight: 8,
                }}>
                  Connected:
                </span>
                <code style={{
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: 'var(--text)',
                  background: 'rgba(124,58,237,0.1)',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </code>
              </div>
            )}

            <div style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid var(--border)',
            }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Episode cost
                </p>
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
                  color: 'var(--accent-light)', fontVariantNumeric: 'tabular-nums',
                }}>
                  🪙 {episode.coinCost}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Your balance
                </p>
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
                  color: canAfford ? 'var(--text)' : '#cc3333',
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
                  fontSize: 13, color: '#cc3333',
                  textAlign: 'center', marginBottom: 12,
                }}
              >
                Not enough coins — head to Profile to top up.
              </motion.p>
            )}

            {!isConnected ? (
              <div style={{ width: '100%' }}>
                <ConnectButton
                  client={client}
                  connectModal={{ 
                    size: "compact",
                    title: "Connect to Unlock Episode",
                    showThirdwebBranding: false
                  }}
                  wallets={wallets}
                  connectButton={{
                    style: {
                      width: '100%',
                      padding: '14px',
                      background: 'var(--accent)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 0 0 rgba(124,58,237,0)',
                    }
                  }}
                />
                <style jsx>{`
                  button:hover {
                    box-shadow: 0 0 30px rgba(124,58,237,0.5) !important;
                  }
                `}</style>
              </div>
            ) : (
              <motion.button
                onClick={handleUnlock}
                disabled={phase === 'unlocking'}
                whileHover={canAfford ? { boxShadow: '0 0 30px rgba(124,58,237,0.5)' } : {}}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: canAfford ? 'var(--accent)' : 'var(--surface)',
                  border: canAfford ? 'none' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 14,
                  color: canAfford ? '#fff' : 'var(--text-muted)',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                }}
              >
                {phase === 'unlocking'
                  ? 'Unlocking...'
                  : canAfford
                  ? `Unlock for 🪙 ${episode.coinCost}`
                  : 'Not enough coins'}
              </motion.button>
            )}

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              Cancel
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

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
  const { hasAccess } = useCoins();
  
  const hasReaderPass = hasAccess(seriesId, 'reader');
  const hasPatronPass = hasAccess(seriesId, 'patron');
  const unlockedByPass = hasReaderPass || hasPatronPass;
  
  // Check if episode is accessible
  const accessible = episode.isFree || isOwned || 
    (unlockedByPass && !episode.isPatronOnly) || 
    (hasPatronPass && episode.isPatronOnly);

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.99 }}
      onClick={() => {
        if (accessible) navigate(`/read/${seriesId}/${episode.id}`);
        else onLocked();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        gap: 14,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-sm)',
        background: accessible ? 'var(--accent-subtle)' : 'var(--surface)',
        border: `1px solid ${accessible ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 13,
        color: accessible ? 'var(--accent-light)' : 'var(--text-muted)',
      }}>
        {episode.number}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 14,
          color: accessible ? 'var(--text)' : 'var(--text-muted)',
          marginBottom: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {episode.title}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Episode {episode.number}
        </p>
      </div>

      <div style={{ flexShrink: 0 }}>
        {isJustUnlocked ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 999,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Owned
          </motion.span>
        ) : isOwned ? (
          <span style={{
            background: 'var(--accent-subtle)',
            color: 'var(--accent-light)',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 999,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Owned
          </span>
        ) : unlockedByPass && !episode.isPatronOnly ? (
          <span style={{
            background: 'rgba(16,185,129,0.1)',
            color: '#10b981',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 999,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Unlocked by Pass
          </span>
        ) : hasPatronPass && episode.isPatronOnly ? (
          <span style={{
            background: 'rgba(251,191,36,0.1)',
            color: '#f59e0b',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 999,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Patron Bonus
          </span>
        ) : episode.isPatronOnly ? (
          <span style={{
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 999,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}>
            Patron Only
          </span>
        ) : episode.isFree ? (
          <span style={{
            background: 'rgba(16,185,129,0.1)',
            color: '#10b981',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 999,
            letterSpacing: '0.05em',
          }}>
            Free
          </span>
        ) : (
          <span style={{
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 999,
            border: '1px solid var(--border)',
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

export default function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ownedEpisodes, ownedPasses, buyPass } = useCoins();
  const [unlocking, setUnlocking] = useState<Episode | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<Set<string>>(new Set());
  const [purchasingPass, setPurchasingPass] = useState<string | null>(null);

  const series = ALL_SERIES.find(s => s.id === id);

  if (!series) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-muted)', marginBottom: 20 }}>
            Series not found
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--accent-light)', fontSize: 14, cursor: 'pointer',
            }}
          >
            ← Back to discover
          </button>
        </div>
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

  const handleBuyPass = async (tier: 'reader' | 'patron') => {
    if (!series || !id) return;
    
    setPurchasingPass(tier);
    try {
      const result = await buyPass(id, tier);
      if (result.success && result.txHash) {
        // Show success state - could add a success modal here
        console.log('Pass purchased successfully!', result.txHash);
      } else {
        // Show error state
        console.error('Pass purchase failed:', result.error);
      }
    } catch (error) {
      console.error('Pass purchase error:', error);
    } finally {
      setPurchasingPass(null);
    }
  };

  return (
    <div className="page">
      {/* Banner */}
      <div style={{
        height: 320,
        background: series.bannerGradient,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)',
        }} />
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 20,
            left: 24,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 18,
            zIndex: 10,
          }}
          aria-label="Go back"
        >
          ←
        </button>
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: 32 }}>
          <span style={{
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.35)',
            color: 'var(--accent-light)',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            padding: '3px 10px',
            borderRadius: 999,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: 12,
          }}>
            {series.genre}
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 32,
            color: 'var(--text)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>
            {series.title}
          </h1>
          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
          }}>
            by {series.author}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        {/* Description */}
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.75,
          marginBottom: 24,
          maxWidth: 640,
        }}>
          {series.description}
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Episodes', value: String(series.episodes.length) },
            { label: 'Free', value: String(series.episodes.filter(e => e.isFree).length) },
            { label: 'Cost per episode', value: '🪙 10' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--accent-light)',
                marginBottom: 4,
              }}>{s.value}</p>
              <p style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Series Passes */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 16,
            color: 'var(--text)',
            marginBottom: 4,
          }}>
            Series Passes
          </h2>
          <p style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 16,
          }}>
            Tradeable NFTs that unlock episodes · Creator royalties on resale
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            <PassCard
              tier="reader"
              pass={series.passes.reader}
              seriesId={series.id}
              seriesGradient={series.coverGradient}
              onBuy={() => handleBuyPass('reader')}
              isOwned={ownedPasses.has(series.id) && ownedPasses.get(series.id)?.tier === 'reader'}
              isPurchasing={purchasingPass === 'reader'}
            />
            <PassCard
              tier="patron"
              pass={series.passes.patron}
              seriesId={series.id}
              seriesGradient={series.coverGradient}
              onBuy={() => handleBuyPass('patron')}
              isOwned={ownedPasses.has(series.id) && ownedPasses.get(series.id)?.tier === 'patron'}
              isPurchasing={purchasingPass === 'patron'}
            />
          </div>
        </div>

        {/* Episodes list */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--text)',
          marginBottom: 4,
        }}>
          Episodes
        </h2>
        <p style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}>
          {series.episodes.filter(e => e.isFree).length} free · {series.episodes.filter(e => !e.isFree).length} paid
        </p>

        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--surface)',
        }}>
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

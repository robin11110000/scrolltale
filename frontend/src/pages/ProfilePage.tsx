import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoins } from '../context/CoinContext';
import { ALL_SERIES } from '../data/series';

const COIN_PACKS = [
  { id: 'pack-100', coins: 100, price: '$0.99', popular: false },
  { id: 'pack-500', coins: 500, price: '$4.99', popular: false },
  { id: 'pack-1200', coins: 1200, price: '$10.99', popular: true },
  { id: 'pack-2500', coins: 2500, price: '$20.99', popular: false },
];

function CoinPackModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

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
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 88,
      }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        style={{
          background: '#141414',
          border: '1px solid rgba(255,20,147,0.25)',
          borderRadius: 24,
          padding: '24px',
          width: 'calc(100% - 32px)',
          maxWidth: 400,
          boxShadow: '0 0 50px rgba(255,20,147,0.12)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}>
          <div>
            <p style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 18,
              color: '#fff',
              marginBottom: 3,
            }}>
              Buy Coins 🪙
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: '#444',
            }}>
              unlock more episodes
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1a1a1a',
              border: '1px solid #222',
              borderRadius: 999,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#555',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Packs grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 16,
        }}>
          {COIN_PACKS.map(pack => (
            <motion.div
              key={pack.id}
              onClick={() => setSelected(pack.id)}
              whileTap={{ scale: 0.96 }}
              style={{
                background: selected === pack.id ? 'rgba(255,20,147,0.1)' : '#0d0d0d',
                border: `1px solid ${selected === pack.id ? 'rgba(255,20,147,0.6)' : '#1a1a1a'}`,
                borderRadius: 16,
                padding: '16px 14px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              {pack.popular && (
                <span style={{
                  position: 'absolute',
                  top: -9,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#FF1493',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 9,
                  padding: '2px 8px',
                  borderRadius: 999,
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap' as const,
                  textTransform: 'uppercase' as const,
                  boxShadow: '0 0 10px rgba(255,20,147,0.4)',
                }}>
                  Popular
                </span>
              )}
              <p style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 22,
                color: '#FF1493',
                marginBottom: 2,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {pack.coins.toLocaleString()}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#444',
                marginBottom: 10,
              }}>
                coins
              </p>
              <p style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 600,
                fontSize: 16,
                color: '#fff',
              }}>
                {pack.price}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon button */}
        <button
          disabled
          data-locus-checkout="coin-pack"
          style={{
            width: '100%',
            padding: '14px',
            background: '#1a1a1a',
            border: '1px solid #222',
            borderRadius: 16,
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: '#444',
            cursor: 'not-allowed',
            letterSpacing: '0.04em',
          }}
        >
          Coming Soon
        </button>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          color: '#2a2a2a',
          textAlign: 'center',
          marginTop: 10,
          lineHeight: 1.6,
        }}>
          Finish Stripe onboarding in the Payments tab to enable purchases.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { balance, ownedEpisodes, totalSpent, episodesRead, seriesFollowing } = useCoins();
  const [showCoinModal, setShowCoinModal] = useState(false);
  const defaultTab = location.search.includes('library') ? 'library' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'library'>(defaultTab as 'profile' | 'library');

  // Update tab if URL changes (e.g. Library nav tap)
  useEffect(() => {
    setActiveTab(location.search.includes('library') ? 'library' : 'profile');
  }, [location.search]);

  const ownedList = Array.from(ownedEpisodes)
    .map(key => {
      const [seriesId, epId] = key.split(':');
      const series = ALL_SERIES.find(s => s.id === seriesId);
      const episode = series?.episodes.find(e => e.id === epId);
      return series && episode ? { series, episode, key } : null;
    })
    .filter(Boolean) as { series: (typeof ALL_SERIES)[0]; episode: { id: string; number: number; title: string }; key: string }[];

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 0' }}>
        {/* Avatar + name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF1493 0%, #cc0070 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 22,
            color: '#fff',
            boxShadow: '0 0 22px rgba(255,20,147,0.4)',
            flexShrink: 0,
          }}>
            RK
          </div>
          <div>
            <p style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 18,
              color: '#fff',
              marginBottom: 4,
            }}>
              rk_reader
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: '#444',
            }}>
              joined March 2025
            </p>
          </div>
        </div>

        {/* Coin balance card */}
        <div style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,20,147,0.22)',
          borderRadius: 20,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          boxShadow: '0 0 24px rgba(255,20,147,0.06)',
        }}>
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              color: '#444',
              marginBottom: 5,
              letterSpacing: '0.04em',
              textTransform: 'uppercase' as const,
            }}>
              coin balance
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 28,
              color: '#FF1493',
              fontVariantNumeric: 'tabular-nums',
            }}>
              🪙 {balance.toLocaleString()}
            </p>
          </div>
          <motion.button
            onClick={() => setShowCoinModal(true)}
            whileHover={{ boxShadow: '0 0 22px rgba(255,20,147,0.55)' }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '11px 20px',
              background: '#FF1493',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(255,20,147,0.3)',
              letterSpacing: '0.04em',
            }}
          >
            Buy Coins
          </motion.button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'Eps Read', value: episodesRead + ownedList.length },
            { label: 'Following', value: seriesFollowing },
            { label: '🪙 Spent', value: totalSpent },
          ].map(stat => (
            <div
              key={stat.label}
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
                fontSize: 18,
                color: '#fff',
                marginBottom: 4,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {stat.value}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#333',
                letterSpacing: '0.03em',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: 16,
          padding: 4,
          marginBottom: 20,
        }}>
          {(['profile', 'library'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                navigate(tab === 'library' ? '/profile?tab=library' : '/profile', { replace: true });
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === tab ? '#FF1493' : 'transparent',
                border: 'none',
                borderRadius: 12,
                fontFamily: 'Sora, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                color: activeTab === tab ? '#fff' : '#444',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                boxShadow: activeTab === tab ? '0 0 12px rgba(255,20,147,0.3)' : 'none',
                letterSpacing: '0.02em',
              }}
            >
              {tab === 'library' ? '📚 Library' : '👤 Profile'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '0 20px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'library' ? (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {ownedList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <p style={{ fontSize: 40, marginBottom: 14 }}>📚</p>
                  <p style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: 16,
                    color: '#333',
                    marginBottom: 8,
                  }}>
                    your library is empty
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#2a2a2a',
                    lineHeight: 1.6,
                  }}>
                    unlock episodes to see them here
                  </p>
                </div>
              ) : (
                ownedList.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/read/${item.series.id}/${item.episode.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 0',
                      borderBottom: '1px solid #0d0d0d',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: item.series.coverGradient,
                      flexShrink: 0,
                      border: '1px solid rgba(255,20,147,0.1)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#fff',
                        marginBottom: 3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {item.series.title}
                      </p>
                      <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        color: '#555',
                      }}>
                        EP {item.episode.number} — {item.episode.title}
                      </p>
                    </div>
                    <span style={{
                      background: 'rgba(255,20,147,0.13)',
                      color: '#FF1493',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 10,
                      padding: '3px 9px',
                      borderRadius: 999,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      flexShrink: 0,
                    }}>
                      Owned
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Reading stats card */}
              <div style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: 20,
                padding: '20px',
                marginBottom: 16,
              }}>
                <p style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#FF1493',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  marginBottom: 16,
                }}>
                  Reading Stats
                </p>
                {[
                  { label: 'Total episodes read', value: episodesRead + ownedList.length },
                  { label: 'Series following', value: seriesFollowing },
                  { label: 'Coins spent on episodes', value: `🪙 ${totalSpent}` },
                  { label: 'Coins remaining', value: `🪙 ${balance.toLocaleString()}` },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 0',
                      borderBottom: i < 3 ? '1px solid #111' : 'none',
                    }}
                  >
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      color: '#666',
                    }}>
                      {row.label}
                    </p>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: 15,
                      color: '#FF1493',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Branding footer */}
              <div style={{ textAlign: 'center', padding: '24px 0 40px' }}>
                <p style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#FF1493',
                  marginBottom: 8,
                  letterSpacing: '-0.02em',
                }}>
                  Scrolltale
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: '#2a2a2a',
                  lineHeight: 1.7,
                  maxWidth: 280,
                  margin: '0 auto',
                }}>
                  a creator-first webtoon platform built for the readers who scroll past midnight,
                  with transparent on-chain payouts and chapters that stay yours forever
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCoinModal && <CoinPackModal onClose={() => setShowCoinModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

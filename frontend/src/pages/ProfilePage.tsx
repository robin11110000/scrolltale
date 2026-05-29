import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from 'thirdweb/react';
import { useCoins } from '../context/CoinContext';
import { client, wallets } from '../context/WalletContext';
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
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(10px)',
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
          padding: 28,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 0 60px rgba(124,58,237,0.06)',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text)',
              marginBottom: 3,
            }}>
              Buy Coins 🪙
            </p>
            <p style={{
              fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              Unlock more episodes
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

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
                background: selected === pack.id ? 'rgba(124,58,237,0.08)' : 'var(--surface)',
                border: `1px solid ${selected === pack.id ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
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
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                }}>
                  Popular
                </span>
              )}
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 22,
                color: 'var(--accent-light)',
                marginBottom: 2,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {pack.coins.toLocaleString()}
              </p>
              <p style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                marginBottom: 10,
              }}>
                coins
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 16,
                color: 'var(--text)',
              }}>
                {pack.price}
              </p>
            </motion.div>
          ))}
        </div>

        <ConnectButton
          client={client}
          connectModal={{ size: "compact" }}
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
              fontSize: 14,
              color: '#fff',
              cursor: 'pointer',
            },
          }}
        />
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
    <div className="page">
      <div className="container" style={{ paddingTop: 32 }}>
        {/* Avatar + name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 20,
            color: '#fff',
            flexShrink: 0,
          }}>
            RK
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text)',
              marginBottom: 4,
            }}>
              rk_reader
            </p>
            <p style={{
              fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              Joined March 2025
            </p>
          </div>
        </div>

        {/* Coin balance */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div>
            <p style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginBottom: 4,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Coin Balance
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 28,
              color: 'var(--accent-light)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              🪙 {balance.toLocaleString()}
            </p>
          </div>
          <motion.button
            onClick={() => setShowCoinModal(true)}
            whileHover={{ boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 13,
              color: '#fff',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            Buy Coins
          </motion.button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Eps Read', value: episodesRead + ownedList.length },
            { label: 'Following', value: seriesFollowing },
            { label: '🪙 Spent', value: totalSpent },
          ].map(stat => (
            <div
              key={stat.label}
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
                color: 'var(--text)',
                marginBottom: 4,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: 10,
                color: 'var(--text-muted)',
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
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
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
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 13,
                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              {tab === 'library' ? '📚 Library' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Tab content */}
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
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <p style={{ fontSize: 40, marginBottom: 16 }}>📚</p>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                  }}>
                    Your library is empty
                  </p>
                  <p style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}>
                    Unlock episodes to see them here.
                  </p>
                </div>
              ) : (
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: 'var(--surface)',
                }}>
                  {ownedList.map((item, i) => (
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
                        padding: '16px 20px',
                        borderBottom: i < ownedList.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-sm)',
                        background: item.series.coverGradient,
                        flexShrink: 0,
                        border: '1px solid rgba(124,58,237,0.08)',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'var(--text)',
                          marginBottom: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.series.title}
                        </p>
                        <p style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                        }}>
                          EP {item.episode.number} — {item.episode.title}
                        </p>
                      </div>
                      <span style={{
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent-light)',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: 999,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        flexShrink: 0,
                      }}>
                        Owned
                      </span>
                    </motion.div>
                  ))}
                </div>
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
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                marginBottom: 24,
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'var(--text)',
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
                      padding: '12px 0',
                      borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <p style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                    }}>
                      {row.label}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 15,
                      color: 'var(--accent-light)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', padding: '32px 0 60px' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 22,
                  color: 'var(--accent-light)',
                  marginBottom: 8,
                  letterSpacing: '-0.02em',
                }}>
                  Scrolltale
                </p>
                <p style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  maxWidth: 360,
                  margin: '0 auto',
                }}>
                  A creator-first webtoon platform built for the readers who scroll past midnight, with transparent on-chain payouts and chapters that stay yours forever.
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

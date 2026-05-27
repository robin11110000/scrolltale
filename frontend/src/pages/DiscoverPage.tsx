import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoins } from '../context/CoinContext';
import { ALL_SERIES, GENRES, type GenreFilter, type Series } from '../data/series';

function SeriesCard({ series, onClick }: { series: Series; onClick: () => void }) {
  const hasFree = series.episodes.some(e => e.isFree);
  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid var(--border)',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
    >
      <div style={{
        height: 200,
        background: series.coverGradient,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '12px',
      }}>
        {hasFree && (
          <span style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(124, 58, 237, 0.9)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            padding: '3px 10px',
            borderRadius: 999,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(4px)',
          }}>
            Free
          </span>
        )}
        <span style={{
          background: 'rgba(0,0,0,0.7)',
          color: 'var(--accent-light)',
          fontSize: 10,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          padding: '3px 10px',
          borderRadius: 999,
          letterSpacing: '0.05em',
          backdropFilter: 'blur(4px)',
        }}>
          {series.genre}
        </span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 15,
          color: 'var(--text)',
          marginBottom: 4,
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {series.title}
        </p>
        <p style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          marginBottom: 2,
        }}>
          {series.author}
        </p>
        <p style={{
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          {series.episodes.length} episodes
        </p>
      </div>
    </motion.div>
  );
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { balance } = useCoins();
  const [activeGenre, setActiveGenre] = useState<GenreFilter>('All');

  const filtered =
    activeGenre === 'All'
      ? ALL_SERIES
      : ALL_SERIES.filter(s => s.genre === activeGenre);

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32 }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 36,
                color: 'var(--text)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 8,
              }}>
                Scrolltale
              </h1>
              <p style={{
                fontSize: 15,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: 480,
              }}>
                A webtoon platform built for creators and readers who stay up past midnight.
              </p>
            </div>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>🪙</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--accent-light)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats row — ethereum.org style */}
          <div style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'Series', value: String(ALL_SERIES.length) },
              { label: 'Total Episodes', value: String(ALL_SERIES.reduce((s, se) => s + se.episodes.length, 0)) },
              { label: 'Free to Read', value: String(ALL_SERIES.reduce((s, se) => s + se.episodes.filter(e => e.isFree).length, 0)) },
              { label: 'Creators', value: new Set(ALL_SERIES.map(s => s.author)).size },
            ].map(stat => (
              <div key={stat.label}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 20,
                  color: 'var(--accent-light)',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1.2,
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.03em',
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section header + genre filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 18,
            color: 'var(--text)',
          }}>
            Discover
          </h2>
          <div style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {GENRES.map(genre => {
              const active = genre === activeGenre;
              return (
                <motion.button
                  key={genre}
                  onClick={() => setActiveGenre(genre)}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    flexShrink: 0,
                    padding: '7px 16px',
                    borderRadius: 999,
                    border: active ? 'none' : '1px solid var(--border)',
                    background: active ? 'var(--accent)' : 'var(--surface)',
                    color: active ? '#fff' : 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {genre}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Series grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((series, i) => (
              <motion.div
                key={series.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <SeriesCard
                  series={series}
                  onClick={() => navigate(`/series/${series.id}`)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              color: 'var(--text-muted)',
              marginBottom: 8,
            }}>
              No series in this genre yet
            </p>
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted)',
            }}>
              More coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

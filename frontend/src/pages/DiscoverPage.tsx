import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoins } from '../context/CoinContext';
import { ALL_SERIES, GENRES, type GenreFilter, type Series } from '../data/series';

function CoinChip({ balance }: { balance: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: '#0d0d0d',
      border: '1px solid rgba(255,20,147,0.35)',
      borderRadius: 999,
      padding: '6px 14px',
      boxShadow: '0 0 10px rgba(255,20,147,0.1)',
    }}>
      <span style={{ fontSize: 14 }}>🪙</span>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: 14,
        color: '#FF1493',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {balance.toLocaleString()}
      </span>
    </div>
  );
}

function SeriesCard({ series, onClick }: { series: Series; onClick: () => void }) {
  const hasFree = series.episodes.some(e => e.isFree);
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, boxShadow: '0 0 22px rgba(255,20,147,0.28)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        background: '#0d0d0d',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #1a1a1a',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Cover */}
      <div style={{
        height: 175,
        background: series.coverGradient,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '10px',
      }}>
        <span style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: hasFree ? 'rgba(255,20,147,0.92)' : 'rgba(0,0,0,0.75)',
          border: hasFree ? 'none' : '1px solid rgba(255,20,147,0.4)',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 10,
          padding: '3px 9px',
          borderRadius: 999,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}>
          {hasFree ? 'FREE' : '🪙 10'}
        </span>
        <span style={{
          background: 'rgba(0,0,0,0.65)',
          color: '#FF1493',
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          fontWeight: 600,
          padding: '3px 9px',
          borderRadius: 999,
          letterSpacing: '0.05em',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}>
          {series.genre}
        </span>
      </div>
      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          color: '#fff',
          marginBottom: 4,
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {series.title}
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          color: '#666',
          marginBottom: 4,
        }}>
          {series.author}
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          color: '#333',
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
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: 90 }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid #0d0d0d',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: 22,
          color: '#FF1493',
          letterSpacing: '-0.02em',
        }}>
          Scrolltale
        </span>
        <CoinChip balance={balance} />
      </div>

      {/* Welcome */}
      <div style={{ padding: '20px 20px 14px' }}>
        <p style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.02em',
          marginBottom: 5,
        }}>
          welcome back, ready to read? 🌙
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: '#555',
        }}>
          discover something new tonight
        </p>
      </div>

      {/* Genre pills */}
      <div style={{
        overflowX: 'auto',
        padding: '0 20px 16px',
        display: 'flex',
        gap: 8,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      } as React.CSSProperties}>
        {GENRES.map(genre => {
          const active = genre === activeGenre;
          return (
            <motion.button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              whileTap={{ scale: 0.94 }}
              style={{
                flexShrink: 0,
                padding: '8px 17px',
                borderRadius: 999,
                border: active ? 'none' : '1px solid #1e1e1e',
                background: active ? '#FF1493' : '#0d0d0d',
                color: active ? '#fff' : '#666',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: active ? '0 0 14px rgba(255,20,147,0.45)' : 'none',
                transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {genre}
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
      }}>
        <AnimatePresence mode="popLayout">
          {filtered.map((series, i) => (
            <motion.div
              key={series.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05, duration: 0.28 }}
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
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#333' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, color: '#444' }}>
            no series in this genre yet
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#2a2a2a', marginTop: 6 }}>
            more coming soon!
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EPISODE_REVENUE = [
  { ep: 'EP 1', coins: 842 },
  { ep: 'EP 2', coins: 1203 },
  { ep: 'EP 3', coins: 967 },
  { ep: 'EP 4', coins: 1445 },
  { ep: 'EP 5', coins: 1100 },
  { ep: 'EP 6', coins: 1670 },
  { ep: 'EP 7', coins: 890 },
  { ep: 'EP 8', coins: 1340 },
];

const CREATOR_SERIES = [
  { title: 'Neon Requiem', episodes: 8, earnings: 7230, gradient: 'linear-gradient(135deg, #0a0012 0%, #2d0042 100%)' },
  { title: 'Static Hearts', episodes: 5, earnings: 3150, gradient: 'linear-gradient(135deg, #0a080a 0%, #181310 100%)' },
  { title: 'Drift Signal', episodes: 10, earnings: 2070, gradient: 'linear-gradient(135deg, #100000 0%, #2a0000 100%)' },
];

const MOCK_TX = [
  { hash: '0xa3f2...91bc', ep: 'EP 6', amount: '+340', time: '2h ago' },
  { hash: '0x7b1a...22ef', ep: 'EP 4', amount: '+120', time: '5h ago' },
  { hash: '0xcd99...55aa', ep: 'EP 6', amount: '+220', time: '8h ago' },
  { hash: '0x11f0...87de', ep: 'EP 3', amount: '+180', time: '1d ago' },
];

const TOTAL = CREATOR_SERIES.reduce((s, c) => s + c.earnings, 0);
const PAYOUT_THRESHOLD = 5000;

function BarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [tooltip, setTooltip] = useState<number | null>(null);
  const maxCoins = Math.max(...EPISODE_REVENUE.map(e => e.coins));

  return (
    <div
      ref={ref}
      style={{
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: 20,
        padding: '20px',
        marginBottom: 20,
      }}
    >
      {/* Header row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <p style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: '#FF1493',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
        }}>
          Per-Episode Revenue
        </p>
        {TOTAL > PAYOUT_THRESHOLD && (
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              background: 'rgba(255,20,147,0.14)',
              border: '1px solid rgba(255,20,147,0.5)',
              color: '#FF1493',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 10,
              padding: '4px 12px',
              borderRadius: 999,
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap' as const,
            }}
          >
            ● PAYOUT READY
          </motion.span>
        )}
      </div>

      {/* Bars */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        height: 110,
        position: 'relative',
      }}>
        {EPISODE_REVENUE.map((ep, i) => {
          const pct = (ep.coins / maxCoins) * 100;
          return (
            <div
              key={ep.ep}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
              onTouchStart={() => setTooltip(i)}
              onTouchEnd={() => setTimeout(() => setTooltip(null), 2200)}
            >
              {/* Tooltip */}
              {tooltip === i && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    bottom: `${pct}%`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#FF1493',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 10,
                    padding: '4px 8px',
                    borderRadius: 8,
                    whiteSpace: 'nowrap' as const,
                    zIndex: 10,
                    marginBottom: 8,
                    boxShadow: '0 0 12px rgba(255,20,147,0.5)',
                  }}
                >
                  🪙 {ep.coins.toLocaleString()}
                </motion.div>
              )}
              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={inView ? { height: `${pct}%` } : { height: 0 }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, #FF1493 0%, #cc0070 100%)',
                  borderRadius: '6px 6px 3px 3px',
                  boxShadow: '0 0 8px rgba(255,20,147,0.3)',
                  minHeight: 4,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X labels */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {EPISODE_REVENUE.map(ep => (
          <div key={ep.ep} style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            fontSize: 9,
            color: '#333',
            letterSpacing: '0.04em',
          }}>
            {ep.ep}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreatorPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid #0d0d0d',
      }}>
        <p style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: 22,
          color: '#fff',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}>
          Creator Studio ✍️
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: '#444',
        }}>
          your creative empire, at a glance
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Earnings', value: `🪙 ${TOTAL.toLocaleString()}` },
            { label: 'Subscribers', value: '847' },
            { label: 'Published', value: '23 eps' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                flex: 1,
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: 16,
                padding: '14px 8px',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                color: '#FF1493',
                marginBottom: 5,
                lineHeight: 1.2,
              }}>
                {stat.value}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#3a3a3a',
                letterSpacing: '0.04em',
                textTransform: 'uppercase' as const,
              }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bar chart */}
        <BarChart />

        {/* My Series */}
        <h2 style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: '#FF1493',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          marginBottom: 12,
        }}>
          My Series
        </h2>
        {CREATOR_SERIES.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 + 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: '1px solid #0d0d0d',
              gap: 14,
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: s.gradient,
              flexShrink: 0,
              border: '1px solid rgba(255,20,147,0.12)',
            }} />
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                color: '#fff',
                marginBottom: 3,
              }}>
                {s.title}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: '#444',
              }}>
                {s.episodes} episodes
              </p>
            </div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: '#FF1493',
              fontVariantNumeric: 'tabular-nums',
            }}>
              🪙 {s.earnings.toLocaleString()}
            </p>
          </motion.div>
        ))}

        {/* Publish CTA */}
        <motion.button
          whileHover={{ boxShadow: '0 0 32px rgba(255,20,147,0.55)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%',
            padding: '16px',
            background: '#FF1493',
            border: 'none',
            borderRadius: 16,
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,20,147,0.3)',
            letterSpacing: '0.04em',
            marginTop: 20,
            marginBottom: 24,
          }}
        >
          + Publish New Episode
        </motion.button>

        {/* On-chain payouts */}
        <h2 style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: '#FF1493',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          marginBottom: 6,
        }}>
          On-Chain Payouts
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#444',
          marginBottom: 14,
          lineHeight: 1.6,
        }}>
          Transparent. Every coin tracked.
        </p>

        <div style={{
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {MOCK_TX.map((tx, i) => (
            <motion.div
              key={tx.hash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 + 0.4 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: i < MOCK_TX.length - 1 ? '1px solid #111' : 'none',
                gap: 10,
              }}
            >
              <span style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#333',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {tx.hash}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#444',
                flexShrink: 0,
              }}>
                {tx.ep}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 12,
                color: '#FF1493',
                flexShrink: 0,
              }}>
                {tx.amount} 🪙
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#2a2a2a',
                flexShrink: 0,
              }}>
                {tx.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

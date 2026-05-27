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
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        marginBottom: 24,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--text)',
        }}>
          Per-Episode Revenue
        </p>
        {TOTAL > PAYOUT_THRESHOLD && (
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.4)',
              color: 'var(--accent-light)',
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 999,
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}
          >
            ● Payout Ready
          </motion.span>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        height: 120,
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
              {tooltip === i && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    bottom: `${pct}%`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    marginBottom: 8,
                  }}
                >
                  🪙 {ep.coins.toLocaleString()}
                </motion.div>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={inView ? { height: `${pct}%` } : { height: 0 }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  background: 'var(--gradient)',
                  borderRadius: '4px 4px 2px 2px',
                  minHeight: 4,
                }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {EPISODE_REVENUE.map(ep => (
          <div key={ep.ep} style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 9,
            color: 'var(--text-muted)',
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
    <div className="page">
      <div className="container" style={{ paddingTop: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 28,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}>
            Creator Studio
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
          }}>
            Your creative empire, at a glance.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Earnings', value: `🪙 ${TOTAL.toLocaleString()}` },
            { label: 'Subscribers', value: '847' },
            { label: 'Published', value: '23 eps' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 24px',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--accent-light)',
                marginBottom: 4,
                lineHeight: 1.2,
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <BarChart />

        {/* My Series */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--text)',
          marginBottom: 16,
        }}>
          My Series
        </h2>
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--surface)',
          marginBottom: 24,
        }}>
          {CREATOR_SERIES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 + 0.2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: i < CREATOR_SERIES.length - 1 ? '1px solid var(--border)' : 'none',
                gap: 14,
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-sm)',
                background: s.gradient,
                flexShrink: 0,
                border: '1px solid rgba(124,58,237,0.1)',
              }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'var(--text)',
                  marginBottom: 2,
                }}>
                  {s.title}
                </p>
                <p style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}>
                  {s.episodes} episodes
                </p>
              </div>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--accent-light)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                🪙 {s.earnings.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Publish CTA */}
        <motion.button
          whileHover={{ boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
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
            marginBottom: 32,
          }}
        >
          + Publish New Episode
        </motion.button>

        {/* On-chain payouts */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--text)',
          marginBottom: 4,
        }}>
          On-Chain Payouts
        </h2>
        <p style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}>
          Transparent. Every coin tracked.
        </p>

        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--surface)',
          marginBottom: 24,
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
                padding: '14px 20px',
                borderBottom: i < MOCK_TX.length - 1 ? '1px solid var(--border)' : 'none',
                gap: 12,
              }}
            >
              <span style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: 'var(--text-muted)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {tx.hash}
              </span>
              <span style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                flexShrink: 0,
              }}>
                {tx.ep}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--accent-light)',
                flexShrink: 0,
              }}>
                {tx.amount} 🪙
              </span>
              <span style={{
                fontSize: 11,
                color: 'var(--text-muted)',
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

import { useState, useEffect, useRef } from 'react';
import './styles.css';

// ── Types ──────────────────────────────────────────────────────────────────
type Role = 'reader' | 'creator' | null;

// ── useScrolled ────────────────────────────────────────────────────────────
function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return scrolled;
}

// ── WaitlistForm ───────────────────────────────────────────────────────────
function WaitlistForm({ id }: { id: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate a 600ms network round-trip, then always succeed
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', animation: 'fadeIn 0.4s ease' }}>
        <span className="success-checkmark" style={{
          display: 'block',
          fontSize: 52,
          color: '#FF1493',
          marginBottom: 16,
          lineHeight: 1,
        }}>✓</span>
        <p style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: 22,
          color: '#FF1493',
          marginBottom: 10,
        }}>you're on the list 🌙</p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          color: '#777',
          fontSize: 15,
          lineHeight: 1.65,
        }}>we'll be in touch soon. spread the word 🖤</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Waitlist signup" style={{ width: '100%', maxWidth: 480 }}>
      <input
        id={`email-${id}`}
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
        className="waitlist-input"
        autoComplete="email"
        aria-label="Email address"
        style={{
          display: 'block',
          width: '100%',
          padding: '15px 20px',
          background: '#111',
          color: '#fff',
          border: '1.5px solid #2a2a2a',
          borderRadius: 16,
          fontSize: 16,
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          marginBottom: error ? 8 : 12,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      />
      {error && (
        <p role="alert" style={{
          color: '#FF1493',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
          marginBottom: 10,
          marginTop: -4,
        }}>
          {error}
        </p>
      )}

      {/* Role toggle */}
      <div role="group" aria-label="I am a" style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        {(['reader', 'creator'] as const).map((r) => {
          const active = role === r;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={active}
              onClick={() => setRole(active ? null : r)}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 999,
                border: active ? 'none' : '1.5px solid #2a2a2a',
                background: active ? '#FF1493' : '#0d0d0d',
                color: active ? '#fff' : '#666',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
              }}
            >
              {r === 'reader' ? '📖 reader' : '✍️ creator'}
            </button>
          );
        })}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="waitlist-btn"
        style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          background: '#FF1493',
          color: '#fff',
          border: 'none',
          borderRadius: 16,
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          cursor: loading ? 'wait' : 'pointer',
          boxShadow: '0 0 20px rgba(255,20,147,0.3)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
          opacity: loading ? 0.75 : 1,
        }}
      >
        {loading ? '...' : 'join the waitlist →'}
      </button>
    </form>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────
function Nav() {
  const scrolled = useScrolled();
  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        background: scrolled ? 'rgba(0,0,0,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,20,147,0.08)' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <a href="#" aria-label="Scrolltale home" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: 22,
          color: '#FF1493',
          letterSpacing: '-0.02em',
        }}>Scrolltale</span>
      </a>
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      aria-label="Hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(100px, 12vw, 140px) 24px 80px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Ambient background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <h1 style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(52px, 8.5vw, 96px)',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: '#fff',
          marginBottom: 28,
        }}>
          stories that{' '}
          <span className="scroll-word">scroll</span>
          {' '}with you.{' '}
          <br />
          payouts that&nbsp;don't&nbsp;lie.
        </h1>

        <p className="hero-sub" style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(16px, 2vw, 18px)',
          lineHeight: 1.65,
          color: '#888',
          maxWidth: 580,
          margin: '0 auto 44px',
        }}>
          a creator-first webtoon platform built for the readers who scroll past midnight,
          with transparent on-chain payouts and chapters that stay yours forever
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <WaitlistForm id="hero" />
        </div>
      </div>
    </section>
  );
}

// ── WhyScrolltale ──────────────────────────────────────────────────────────
const readerBullets = [
  'Free episodes to start — no credit card required.',
  'Own what you unlock — chapters are yours forever.',
  'No coin devaluation — your coins hold their value.',
  'Read offline, anytime, on any device.',
];

const creatorBullets = [
  'Transparent on-chain payouts — see every cent.',
  'Set your own prices per episode, full control.',
  'No opaque revenue splits — what you earn, you keep.',
  'Direct connection to your readers, always.',
];

function WhyCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="why-card" style={{
      background: '#0d0d0d',
      border: '1.5px solid #1a1a1a',
      borderRadius: 24,
      padding: 'clamp(28px, 4vw, 44px) clamp(24px, 3vw, 36px)',
      boxShadow: 'inset 0 0 50px rgba(255,20,147,0.02)',
      flex: 1,
      minWidth: 0,
    }}>
      <h3 style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: 20,
        color: '#fff',
        marginBottom: 28,
        letterSpacing: '-0.01em',
      }}>{title}</h3>
      <ul style={{ listStyle: 'none' }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: i < bullets.length - 1 ? 16 : 0,
          }}>
            <span aria-hidden="true" style={{
              color: '#FF1493',
              fontSize: 16,
              marginTop: 3,
              flexShrink: 0,
              lineHeight: 1,
            }}>—</span>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              lineHeight: 1.65,
              color: '#bbb',
              margin: 0,
            }}>{b}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhyScrolltale() {
  return (
    <section id="why" aria-labelledby="why-heading" style={{
      padding: 'clamp(60px, 8vw, 120px) 24px',
      maxWidth: 1080,
      margin: '0 auto',
    }}>
      <h2 id="why-heading" style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: 'clamp(28px, 4vw, 48px)',
        letterSpacing: '-0.02em',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 52,
      }}>why scrolltale?</h2>

      <div style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <WhyCard title="for readers 📖" bullets={readerBullets} />
        <WhyCard title="for creators ✍️" bullets={creatorBullets} />
      </div>
    </section>
  );
}

// ── HowItWorks ─────────────────────────────────────────────────────────────
interface StepData {
  title: string;
  desc: string;
}

const readerSteps: StepData[] = [
  { title: 'Discover', desc: 'Browse thousands of webtoons across every genre — romance, thriller, fantasy, and more.' },
  { title: 'Unlock with coins', desc: 'Pay only for what you want to read. Your coins are yours — no expiry, no devaluation.' },
  { title: 'Own forever', desc: 'Your unlocked chapters live in your wallet, always accessible, always yours.' },
];

const creatorSteps: StepData[] = [
  { title: 'Publish', desc: 'Upload your webtoon, set episode prices, and reach readers worldwide in minutes.' },
  { title: 'Set your price', desc: 'Full control over your earnings per episode. No platform dictates your rates.' },
  { title: 'Get paid transparently', desc: 'On-chain payouts with zero hidden fees. See every transaction, every cent.' },
];

function StepsRow({ steps, label, visible }: { steps: StepData[]; label: string; visible: boolean }) {
  return (
    <div style={{ marginBottom: 72 }}>
      <h3 style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: 20,
        color: '#FF1493',
        marginBottom: 40,
        letterSpacing: '-0.01em',
      }}>{label}</h3>

      <div style={{
        display: 'flex',
        gap: 'clamp(24px, 4vw, 56px)',
        flexWrap: 'wrap',
        position: 'relative',
      }}>
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 200,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
              transition: `opacity 0.55s ease ${i * 150}ms, transform 0.55s ease ${i * 150}ms`,
            }}
          >
            <div style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 64,
              color: '#FF1493',
              lineHeight: 1,
              marginBottom: 18,
              letterSpacing: '-0.03em',
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <h4 style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 600,
              fontSize: 18,
              color: '#fff',
              marginBottom: 10,
            }}>{s.title}</h4>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              lineHeight: 1.65,
              color: '#777',
            }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how" aria-labelledby="how-heading" style={{
      padding: 'clamp(60px, 8vw, 120px) 24px',
      maxWidth: 1080,
      margin: '0 auto',
    }}>
      <h2 id="how-heading" style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: 'clamp(28px, 4vw, 48px)',
        letterSpacing: '-0.02em',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 72,
      }}>how it works</h2>

      <div ref={sectionRef}>
        <StepsRow steps={readerSteps} label="for readers" visible={visible} />
        <StepsRow steps={creatorSteps} label="for creators" visible={visible} />
      </div>
    </section>
  );
}

// ── CheckoutModal ───────────────────────────────────────────────────────────
interface CheckoutModalProps {
  plan: { name: string; price: string };
  onClose: () => void;
}

function CheckoutModal({ plan, onClose }: CheckoutModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [purchased, setPurchased] = useState(false);

  // Close on outside click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Demo checkout"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background: '#0d0d0d',
        border: '1.5px solid #FF1493',
        borderRadius: 24,
        padding: 'clamp(28px, 5vw, 44px)',
        width: '100%',
        maxWidth: 440,
        position: 'relative',
        boxShadow: '0 0 48px rgba(255,20,147,0.22)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close demo checkout"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: '1px solid #2a2a2a',
            color: '#666',
            width: 36,
            height: 36,
            borderRadius: 999,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s ease, color 0.2s ease',
          }}
        >
          ×
        </button>

        {/* Header */}
        <h2 style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: 22,
          color: '#FF1493',
          marginBottom: 6,
          paddingRight: 44,
        }}>Scrolltale Checkout (Demo)</h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#555',
          marginBottom: 28,
          letterSpacing: '0.02em',
        }}>no real charges — purely a UI preview</p>

        {purchased ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <div style={{
              fontSize: 56,
              color: '#FF1493',
              lineHeight: 1,
              marginBottom: 16,
              animation: 'fadeIn 0.35s ease',
            }}>✓</div>
            <p style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 20,
              color: '#FF1493',
              marginBottom: 10,
            }}>purchase simulated! 🌙</p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#555',
              lineHeight: 1.65,
            }}>this is a demo — real payments coming soon</p>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Plan summary */}
            <div style={{
              background: '#141414',
              border: '1px solid #1a1a1a',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#aaa' }}>{plan.name}</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, color: '#FF1493' }}>{plan.price}</span>
            </div>

            {/* Card number */}
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength={19}
              className="waitlist-input"
              aria-label="Card number"
              style={{
                display: 'block',
                width: '100%',
                padding: '14px 18px',
                background: '#111',
                color: '#fff',
                border: '1.5px solid #2a2a2a',
                borderRadius: 14,
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                marginBottom: 12,
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box',
              }}
            />

            {/* Expiry + CVV row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <input
                type="text"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength={7}
                className="waitlist-input"
                aria-label="Expiry date"
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  background: '#111',
                  color: '#fff',
                  border: '1.5px solid #2a2a2a',
                  borderRadius: 14,
                  fontSize: 15,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  minWidth: 0,
                }}
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={4}
                className="waitlist-input"
                aria-label="CVV"
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  background: '#111',
                  color: '#fff',
                  border: '1.5px solid #2a2a2a',
                  borderRadius: 14,
                  fontSize: 15,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  minWidth: 0,
                }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={() => setPurchased(true)}
              className="waitlist-btn"
              style={{
                display: 'block',
                width: '100%',
                padding: '16px',
                background: '#FF1493',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(255,20,147,0.30)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              complete purchase (demo)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── PricingPreview ──────────────────────────────────────────────────────────
const coinPacks = [
  { coins: 100, price: '$0.99' },
  { coins: 500, price: '$4.99' },
  { coins: 1200, price: '$10.99' },
  { coins: 2500, price: '$20.99' },
  { coins: 6500, price: '$50.99' },
];

const subscriptions = [
  { tier: 'Basic', price: '$3.99/mo' },
  { tier: 'Standard', price: '$9.99/mo' },
  { tier: 'Plus', price: '$19.99/mo' },
  { tier: 'Pro', price: '$49.99/mo' },
];

function PricingCard({ children, plan, onDemoCheckout }: {
  children: React.ReactNode;
  plan: { name: string; price: string };
  onDemoCheckout: (plan: { name: string; price: string }) => void;
}) {
  return (
    <div className="pricing-card" style={{
      background: '#0d0d0d',
      border: '1.5px solid rgba(255,20,147,0.22)',
      borderRadius: 20,
      padding: '28px 22px',
      position: 'relative',
      boxShadow: '0 0 24px rgba(255,20,147,0.07)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Coming soon badge */}
      <span style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: '#FF1493',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: '0.06em',
        padding: '4px 10px',
        borderRadius: 999,
        textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const,
      }}>coming soon</span>
      {children}
      <button
        onClick={() => onDemoCheckout(plan)}
        style={{
          marginTop: 'auto',
          paddingTop: 16,
          background: 'transparent',
          border: 'none',
          color: '#FF1493',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          textAlign: 'left' as const,
          padding: '14px 0 0',
          transition: 'opacity 0.2s ease',
          opacity: 0.8,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
      >
        try demo checkout →
      </button>
    </div>
  );
}

function PricingPreview() {
  const [checkoutPlan, setCheckoutPlan] = useState<{ name: string; price: string } | null>(null);

  return (
    <section id="pricing" aria-labelledby="pricing-heading" style={{
      padding: 'clamp(60px, 8vw, 120px) 24px',
      maxWidth: 1080,
      margin: '0 auto',
    }}>
      {/* Section heading + badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 64,
        flexWrap: 'wrap',
      }}>
        <h2 id="pricing-heading" style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 'clamp(28px, 4vw, 48px)',
          letterSpacing: '-0.02em',
          color: '#fff',
        }}>pricing</h2>
        <span style={{
          background: '#FF1493',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 12,
          padding: '6px 16px',
          borderRadius: 999,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}>coming soon</span>
      </div>

      {/* Coin packs */}
      <h3 style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: 20,
        color: '#fff',
        marginBottom: 24,
      }}>🪙 coin packs</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: 16,
        marginBottom: 56,
      }}>
        {coinPacks.map((p) => (
          <PricingCard
            key={p.coins}
            plan={{ name: `${p.coins.toLocaleString()} coins`, price: p.price }}
            onDemoCheckout={setCheckoutPlan}
          >
            <div style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 30,
              color: '#FF1493',
              lineHeight: 1,
              marginTop: 20,
              marginBottom: 4,
            }}>{p.coins.toLocaleString()}</div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              color: '#555',
              fontSize: 13,
              marginBottom: 12,
              letterSpacing: '0.04em',
            }}>coins</div>
            <div style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 600,
              fontSize: 20,
              color: '#fff',
            }}>{p.price}</div>
          </PricingCard>
        ))}
      </div>

      {/* Subscriptions */}
      <h3 style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: 20,
        color: '#fff',
        marginBottom: 24,
      }}>⭐ subscription tiers</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {subscriptions.map((s) => (
          <PricingCard
            key={s.tier}
            plan={{ name: `${s.tier} subscription`, price: s.price }}
            onDemoCheckout={setCheckoutPlan}
          >
            <div style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 22,
              color: '#fff',
              marginTop: 20,
              marginBottom: 8,
            }}>{s.tier}</div>
            <div style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 600,
              fontSize: 26,
              color: '#FF1493',
            }}>{s.price}</div>
          </PricingCard>
        ))}
      </div>

      {checkoutPlan && (
        <CheckoutModal plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
      )}
    </section>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'what is scrolltale?',
    a: 'Scrolltale is a decentralized webtoon platform where readers own the episodes they unlock and creators receive transparent on-chain payouts. No middlemen, no opaque splits.',
  },
  {
    q: 'how do coins work?',
    a: "Coins are Scrolltale's in-platform currency. You buy coin packs once and spend them to unlock individual episodes. Your coins never devalue and unused coins stay in your account forever.",
  },
  {
    q: 'how do creators get paid?',
    a: 'Every payout is recorded on-chain so creators can see exactly how much they earned, when, and from which episodes. No black-box revenue splits — just transparent, direct payments.',
  },
  {
    q: 'when does scrolltale launch?',
    a: "We're building in public and launching soon. Join the waitlist to be first in line and get early access before anyone else.",
  },
  {
    q: 'how do I join as a creator?',
    a: 'Sign up on the waitlist and select "I\'m a creator." We\'ll reach out with early creator onboarding details and priority access to publishing tools.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: `1.5px solid ${open ? 'rgba(255,20,147,0.38)' : '#1a1a1a'}`,
      borderRadius: 16,
      marginBottom: 10,
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
      background: '#0d0d0d',
    }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left' as const,
          gap: 16,
        }}
      >
        <span>{q}</span>
        <span aria-hidden="true" style={{
          color: '#FF1493',
          fontSize: 22,
          fontWeight: 700,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.22s ease',
          flexShrink: 0,
          lineHeight: 1,
          display: 'inline-block',
        }}>+</span>
      </button>

      <div style={{
        maxHeight: open ? '400px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{
          padding: '0 24px 22px',
          color: '#888',
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          lineHeight: 1.7,
        }}>
          {a}
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" style={{
      padding: 'clamp(60px, 8vw, 120px) 24px',
      maxWidth: 720,
      margin: '0 auto',
    }}>
      <h2 id="faq-heading" style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: 'clamp(28px, 4vw, 48px)',
        letterSpacing: '-0.02em',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 52,
      }}>questions?</h2>

      {faqs.map((f, i) => (
        <FAQItem key={i} q={f.q} a={f.a} />
      ))}
    </section>
  );
}

// ── FinalCTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section id="waitlist" aria-labelledby="cta-heading" style={{
      padding: 'clamp(80px, 10vw, 140px) 24px',
      textAlign: 'center',
      background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,20,147,0.07) 0%, transparent 70%)',
      borderTop: '1px solid #111',
    }}>
      <h2 id="cta-heading" style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(40px, 6.5vw, 80px)',
        letterSpacing: '-0.03em',
        lineHeight: 1.05,
        color: '#fff',
        marginBottom: 20,
      }}>be first to scroll.</h2>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 17,
        lineHeight: 1.65,
        color: '#666',
        maxWidth: 460,
        margin: '0 auto 48px',
      }}>
        join the waitlist and get early access before anyone else. your spot is waiting.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <WaitlistForm id="cta" />
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  const socialLinks = [
    { label: 'Twitter / X', href: '#', symbol: '𝕏' },
    { label: 'Instagram', href: '#', symbol: 'IG' },
    { label: 'Discord', href: '#', symbol: 'DC' },
  ];

  return (
    <footer style={{
      padding: 'clamp(40px, 6vw, 64px) 24px',
      borderTop: '1px solid #111',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: 26,
        color: '#FF1493',
        marginBottom: 12,
        letterSpacing: '-0.02em',
      }}>Scrolltale</div>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        color: '#444',
        maxWidth: 420,
        margin: '0 auto 28px',
        lineHeight: 1.65,
      }}>
        a creator-first webtoon platform built for the readers who scroll past midnight.
      </p>

      {/* Social links */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
        {socialLinks.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            className="social-icon"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: 12,
              border: '1.5px solid #222',
              color: '#555',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 12,
              textDecoration: 'none',
              transition: 'border-color 0.2s ease, color 0.2s ease',
            }}
          >
            {s.symbol}
          </a>
        ))}
      </div>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        color: '#2a2a2a',
        letterSpacing: '0.04em',
      }}>
        © Scrolltale. all rights reserved.
      </p>
    </footer>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <WhyScrolltale />
      <HowItWorks />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

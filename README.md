# Scrolltale

> *stories that scroll with you. payouts that don't lie.*

A decentralized webtoon platform where artists publish serialized comics with transparent on-chain payouts, and readers own the episodes they unlock. This repo contains the full-stack interactive demo — a functional-looking webtoon reader SPA that showcases the platform's core experience.

---

## What's inside

```
scrolltale/
├── frontend/          # React + Vite SPA (the reader app)
│   └── src/
│       ├── pages/     # Discover, Series, Reader, Creator, Profile
│       ├── components/# BottomNav and shared UI
│       ├── context/   # CoinContext — global coin + owned-episode state
│       ├── data/      # series.ts — all 6 demo series + episode data
│       └── styles.css # Global reset, keyframes, phone-frame shell
├── backend/           # Express API
│   └── src/
│       └── server.ts  # /api/health + /api/waitlist + static file serving
├── Dockerfile         # Multi-stage: builds frontend, serves everything on :8080
└── README.md
```

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 6, TypeScript, React Router v6, Framer Motion |
| Backend | Express 5, TypeScript, tsx (no compile step) |
| Database | Postgres via `pg` (optional — gracefully disabled in preview) |
| Container | Node 20 Alpine, multi-stage Docker build |
| Fonts | Sora (headings), Inter (body) — loaded from Google Fonts |

---

## Design system

| Token | Value |
|---|---|
| Background | `#000000` (true black) |
| Accent | `#FF1493` (hot neon pink) |
| Text | `#ffffff` / `#e0e0e0` |
| Heading font | Sora 700 |
| Body font | Inter 400 |
| Border radius | `1rem` – `1.5rem` everywhere, no sharp edges |
| Glow | `0 0 16px rgba(255,20,147,0.5)` on CTAs and hover states |

Dark mode only. Mobile-first at 430px (phone-frame shell in the demo).

---

## Features in the demo

### Reader flow
- **Discover page** — genre filter tabs (All / Action / Romance / Fantasy / Slice of Life / Horror), 6 demo series rendered as cards with unique gradient covers
- **Series page** — episode list with free/locked state, coin cost per episode, unlock modal with coin deduction animation and owned badge
- **Reader page** — vertical scroll reader with a hot-pink progress bar at the top, chapter navigation

### Creator flow
- **Creator dashboard** — animated earnings chart (Framer Motion), mock payout log with on-chain transaction hashes

### Profile
- **Reader profile** — coin balance display, owned episode library, coin pack purchase modal (100 / 500 / 1200 / 2500 / 6500 coins)

### Global state
- `CoinContext` — starts at 350 coins, shared across all views. Spending coins on episodes deducts the balance and marks episodes as owned permanently for that session.

### Waitlist API
- `POST /api/waitlist` — accepts `{ email, role: "reader" | "creator" }`, persists to Postgres when `DATABASE_URL` is set, acknowledges gracefully without a DB in preview mode.

---

## Demo series

| Title | Genre | Author |
|---|---|---|
| Neon Requiem | Action | Yuki Tanaka |
| Midnight Bloom | Romance | Sera Moon |
| Void Walker | Fantasy | Kaz Rem |
| Static Hearts | Slice of Life | Jo Hwang |
| Crimson Protocol | Action | Nyx Adler |
| Soft Apocalypse | Romance | Mila Vance |

First 3 episodes of every series are free. Episodes 4+ cost 10 coins each.

---

## Running locally

### Prerequisites
- Node 20+
- Docker (optional, for the full container build)

### Development (hot reload)

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev        # starts Express on :8080

# Terminal 2 — frontend
cd frontend
npm install
npm run dev        # starts Vite dev server, proxies /api to :8080
```

Open the Vite URL in your browser. The phone-frame shell renders at 430px.

### Production build (Docker)

```bash
docker build -t scrolltale .
docker run -p 8080:8080 scrolltale
```

Open `http://localhost:8080`. The frontend is compiled and served statically by Express.

### With Postgres (waitlist persistence)

```bash
docker run \
  -e DATABASE_URL="postgresql://user:pass@host:5432/scrolltale" \
  -p 8080:8080 \
  scrolltale
```

The server creates the `waitlist` table on startup if it doesn't exist. Without `DATABASE_URL`, signups are logged to stdout only.

---

## API reference

### `GET /api/health`
Returns `{ ok: true, service: "scrolltale-api" }`. Used as the container health check.

### `POST /api/waitlist`
Adds an email to the waitlist.

**Request body:**
```json
{
  "email": "reader@example.com",
  "role": "reader"
}
```
`role` is optional — accepts `"reader"` or `"creator"`. Any other value is stored as `null`.

**Response (success):**
```json
{ "ok": true, "message": "you're on the list" }
```

**Response (error):**
```json
{ "error": "email is required" }
```

---

## Planned features (not yet built)

- On-chain episode ownership (wallet connect, NFT minting per unlocked episode)
- Real coin purchase flow (Stripe / crypto payment rails)
- Creator upload and publishing tools
- Subscription tiers (Basic $3.99/mo, Standard $9.99/mo, Plus $19.99/mo, Pro $49.99/mo)
- Transparent payout dashboard with real on-chain transaction data
- Social features (comments, bookmarks, follow creator)

---

## Pricing (coming soon)

**Coin packs (one-time)**

| Pack | Price |
|---|---|
| 100 coins | $0.99 |
| 500 coins | $4.99 |
| 1,200 coins | $10.99 |
| 2,500 coins | $20.99 |
| 6,500 coins | $50.99 |

**Subscription tiers**

| Tier | Price |
|---|---|
| Basic | $3.99 / mo |
| Standard | $9.99 / mo |
| Plus | $19.99 / mo |
| Pro | $49.99 / mo |

---

## Brand

- **Tagline:** a creator-first webtoon platform built for the readers who scroll past midnight, with transparent on-chain payouts and chapters that stay yours forever
- **Audience:** gen-z webtoon readers worldwide, indie comic artists frustrated with opaque platform payouts
- **Vibe:** dark-mode-native, late-night neon, rebellious creator energy, soft and rounded, no sharp edges anywhere
- **Voice:** friendly and welcoming, conversational, warm — *"welcome back, ready to read?"*

---

## License

Private — all rights reserved. Not open for redistribution.

# Scrolltale

> *stories that scroll with you. payouts that don't lie.*

A decentralized webtoon platform where readers own their access as NFT series passes, and creators earn royalties on every resale — forever. Built on **Base Sepolia** with thirdweb. Submitted to the Locus Founder hackathon.

🔗 **Live demo:** [https://scrolltale-weld.vercel.app/](https://scrolltale-weld.vercel.app/)
📜 **Smart contract:** [`0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920`](https://sepolia.basescan.org/address/0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920) on Base Sepolia

> **Note:** This is a hackathon build, actively being iterated. A few flows (creator publishing, in-app marketplace, fiat pricing) are scripted or simplified for the demo and are called out below. The core loop — minting a real on-chain pass that gates content — is fully functional.

---

## The idea

Web2 webtoon platforms take 30-50% cuts and "subscriptions" disappear the moment you stop paying. Scrolltale flips both:

- **Readers own a series pass NFT** — one mint unlocks the whole series. It's an asset they hold, not access they rent. Tradeable on any marketplace, resellable like a used manga volume.
- **Creators earn the primary sale plus a 5% royalty** baked into the smart contract — automatically routed on every secondary trade, forever, with no platform skimming the middle.
- **Two tiers per series** — Reader Pass for the story, Patron Pass for early access, bonus content, and supporter status.

It's Patreon, except the "subscription" is an asset the fan actually owns and can sell.

---

## What the NFTs actually are

This is the part worth being precise about, because it's the heart of the project.

**Each pass is a single NFT that represents access to an entire series — not one NFT per episode, and not the comic art itself.** Think of it like a manga volume: the volume is a physical object you own and can resell; the story printed inside is what you actually read. The two are separate.

- **The pass NFT** lives on-chain. It stores ownership, the tier, the creator's royalty terms, and a pointer to its metadata. It's tiny — a few hundred bytes. This is the "ticket."
- **The episode panels** live off-chain (hardcoded gradients in this demo; Arweave in production). Putting full webtoon art on-chain would cost a fortune in gas, so no serious NFT project does that. The pass just grants the right to view content stored elsewhere.

So owning a pass is on-chain proof that this wallet bought access to a series. The app checks `balanceOf(wallet, tokenId)` and unlocks every episode if the balance is > 0. The pass is the product; the panels are what the product unlocks.

One pass per series tier — not per episode — is also why readers don't need to buy 80 separate NFTs to finish a series. One mint, whole series.

---

## Reader Pass vs Patron Pass

| | Reader Pass | Patron Pass |
|---|---|---|
| Price | 0.001 ETH | 0.005 ETH |
| Access | All standard episodes | Everything in Reader, plus: |
| Early access | — | Read new episodes before Reader holders |
| Bonus content | — | Exclusive chapters, author cuts, side stories |
| Status | — | Credited as a supporter in the series |
| Collectibility | Standard | Scarcer, higher secondary-market value |

The Patron tier isn't "one extra episode for 5x the price" — it's the deluxe edition. Same logic as a signed limited-print manga box set: you're paying for early access, status, and scarcity, not page count. (In this demo the Patron perks are represented rather than fully built out; see the roadmap.)

---

## How it works on-chain

Every series has up to two pass NFTs on a single shared ERC-1155 contract:

| What lives on-chain | What lives off-chain |
|---|---|
| Pass ownership (ERC-1155 token balance) | Episode panels (gradients in v1; Arweave in v2) |
| Pass metadata (name, image, attributes) | Reader app UI, paywall logic |
| Royalty terms (5% on resale) | Series catalog, episode list |
| Mint transactions, transfer events | Off-chain coin balance (fallback) |

**The flow:**

1. Reader connects a wallet (MetaMask, Coinbase, Rabby, Rainbow, Zerion via thirdweb)
2. Reader clicks "Buy Pass" → `claimTo()` is called on the Edition Drop contract → wallet popup → testnet ETH → ERC-1155 mint
3. Frontend reads `balanceOf(wallet, tokenId)` → if > 0, every episode of that series unlocks
4. If the reader resells the pass on a marketplace, 5% routes to the creator wallet via the contract's royalty config

---

## Smart contract details

**Contract address (Base Sepolia):** [`0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920`](https://sepolia.basescan.org/address/0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920)

**Standard:** ERC-1155 with claim conditions, lazy minting, and royalty config (thirdweb's `DropERC1155`). One shared contract for the whole platform; each token ID is one tier of one series.

**Royalty:** 5% to the creator wallet on secondary sales.

**Current token IDs:**

| Token ID | Pass | Price |
|---|---|---|
| 0 | Neon Requiem · Reader Pass | 0.001 ETH |
| 1 | Neon Requiem · Patron Pass | 0.005 ETH |
| 2 | Midnight Bloom · Reader Pass | 0.001 ETH |

More token IDs are lazy-minted as the catalog grows. Series without on-chain passes fall back to the off-chain coin system.

### A note on pricing in ETH

Passes are priced in testnet ETH for hackathon simplicity — it's the native token on Base Sepolia and needs no extra setup. In production, passes would be priced in **USDC** (so a pass reads as "$2", not a fluctuating ETH amount) with a **fiat on-ramp** so readers can pay by card without ever touching a wallet or token. The ETH pricing here is a demo shortcut, not the intended consumer UX.

---

## Why Base Sepolia + ERC-1155

- **Base Sepolia** — cheap, fast, Ethereum-compatible L2 testnet. Free gas via faucet, broad wallet support, works out of the box with thirdweb.
- **ERC-1155 (not 721)** — one contract holds every pass tier as a separate token ID, instead of deploying a contract per series. Fungible-within-tier (every Reader Pass is interchangeable) maps perfectly to the pass model and keeps minting cheap.
- **Storage split** — pass metadata on IPFS via thirdweb (free, auto-pinned); episode art off-chain. Production migrates art to Arweave for permanence (pay once, stored long-term — even if Scrolltale disappears, holders keep readable content).

---

## Tech stack

| Layer | Tech |
|---|---|
| **Smart contract** | thirdweb DropERC1155 (Edition Drop) on Base Sepolia |
| **Wallet & auth** | thirdweb v5 SDK, MetaMask / Coinbase Wallet / Rabby / Rainbow / Zerion |
| **Frontend** | React 19, Vite 6, TypeScript, React Router v6, Framer Motion |
| **Backend** | Express 5, TypeScript, JWT session tokens, signed wallet challenges |
| **Database** | Postgres via `pg` (waitlist — optional, gracefully disabled in preview) |
| **Hosting** | Vercel (frontend) |
| **Fonts** | Sora (display), Inter (body) |

---

## Features in the demo

### Reader flow
- **Discover** — 6 series across genres, each with unique cover gradients
- **Series page** — Reader + Patron pass cards above the episode list. Buy buttons trigger real on-chain mints; owned passes show a BaseScan link.
- **Tier-gated content** — Patron-only bonus chapters are locked for Reader holders and unlock for Patron holders, gated by which token the wallet holds.
- **Reader** — vertical scroll reader with progress bar and chapter navigation.

### Creator flow
- **Dashboard** — revenue breakdown (primary sales + royalty income), payout log.
- **Publish** — modal walks through the upload-to-IPFS + lazy-mint sequence. *Scripted in this build; full on-chain publishing is on the roadmap.*

### Profile & library
- **Your Passes** — owned pass NFTs with token IDs and marketplace links.
- **Coin balance** — off-chain fallback for series without on-chain passes yet.

### Wallet auth
- Sign-in with wallet (challenge/signature -> JWT), persisted across reloads.

---

## Demo series

| Title | Genre | Author | On-chain |
|---|---|---|---|
| Neon Requiem | Action | Yuki Tanaka | Reader + Patron |
| Midnight Bloom | Romance | Sera Moon | Reader |
| Void Walker | Fantasy | Kaz Rem | Coming soon |
| Static Hearts | Slice of Life | Jo Hwang | Coming soon |
| Crimson Protocol | Action | Nyx Adler | Coming soon |
| Soft Apocalypse | Romance | Mila Vance | Coming soon |

First 3 episodes of every series are free. Series with on-chain passes unlock everything for pass holders.

---

## Running locally

### Prerequisites
- Node 20+
- A wallet with Base Sepolia testnet ETH ([Coinbase faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
- A thirdweb Client ID ([dashboard](https://thirdweb.com/dashboard/settings/api-keys))

### Environment setup

Create `frontend/.env`:

```bash
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
VITE_EDITION_DROP_ADDRESS=0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920
VITE_CHAIN_ID=84532
```

> When deploying to Vercel, set these same three variables in **Project -> Settings -> Environment Variables** (Production + Preview), then redeploy — Vercel does not read your local `.env`.

### Development (hot reload)

```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev    # Express on :8080

# Terminal 2 — frontend
cd frontend && npm install && npm run dev   # Vite on :5173, proxies /api to :8080
```

Connect a wallet on Base Sepolia, grab testnet ETH from the faucet, and buy a pass.

### Production build (Docker, single origin)

```bash
docker build -t scrolltale .
docker run -p 8080:8080 scrolltale
```

Express serves the compiled SPA and the API under `/api/*` on port 8080.

---

## API reference

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Health check |
| `POST /api/auth/challenge` | Generate a signing challenge for a wallet |
| `POST /api/auth/verify` | Verify a signature, issue a JWT session |
| `GET /api/auth/me` | Resolve the wallet from a JWT (`Authorization: Bearer`) |
| `POST /api/waitlist` | Email signup with optional `reader`/`creator` role |

---

## Design system

| Token | Value |
|---|---|
| Background | `#000000` |
| Surface | `#0a0a0a` |
| Accent | `#7c3aed` (electric purple) |
| Accent light | `#a78bfa` |
| Border radius | `8px` / `12px` / `16px` / `20px` |
| Heading font | Sora 700 |
| Body font | Inter 400 |

Dark mode only. Mobile-first, responsive to desktop.

---

## Status & roadmap

This is an in-progress hackathon build. Some flows are simplified for the demo and will be refined in the next iteration (continuing once Locus Founder build credits are available again):

**Simplified in this build**
- Creator publishing is a scripted walkthrough, not a live upload-and-mint pipeline yet
- Patron perks (early access, supporter credits) are represented in the UI, not fully wired
- Episode panels are placeholder gradients, not real uploaded art

**Planned next**
- **Real creator publishing** — upload art -> IPFS, auto lazy-mint both pass tiers
- **USDC pricing + fiat on-ramp** — passes priced as dollars, payable by card via thirdweb Pay
- **Arweave storage** for permanent episode art
- **In-app secondary marketplace** with enforced creator royalties
- **Gasless onboarding** — thirdweb in-app wallets so non-crypto readers can start without a wallet
- **Mainnet launch** on Base
- **Subscription-style passes** — time-bound access NFTs alongside per-series passes

---

## Brand

- **Tagline:** stories that scroll with you. payouts that don't lie.
- **Audience:** gen-z webtoon readers worldwide; indie comic artists tired of opaque platform payouts.
- **Vibe:** dark-mode-native, late-night neon, rebellious creator energy — soft, rounded, no sharp edges.
- **Voice:** friendly, conversational, warm — *"welcome back, ready to read?"*

---

## Acknowledgements

Built for the [Locus Founder](https://locusfounder.com) hackathon.

- **thirdweb** — wallet auth, contract templates, deployment tooling
- **Base** — fast, cheap L2 testnet for rapid iteration
- **OpenSea / marketplace testnets** — secondary trading and royalty testing

---

## License

Private — all rights reserved. Not open for redistribution.

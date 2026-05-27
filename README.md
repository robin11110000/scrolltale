# Scrolltale

> *stories that scroll with you. payouts that don't lie.*

A decentralized webtoon platform where readers own their access as NFT series passes, and creators earn royalties on every resale — forever. Built on **Base Sepolia** with thirdweb. Submitted to the Locus Founder hackathon.

🔗 **Live demo:** [your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)
🎥 **Demo video:** [link to your Loom / YouTube]
📜 **Smart contract:** [`0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920`](https://sepolia.basescan.org/address/0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920) on Base Sepolia

---

## The idea

Web2 webtoon platforms take 30-50% cuts and "subscriptions" disappear when you stop paying. Scrolltale flips both:

- **Readers own a series pass NFT** — one mint unlocks the whole series. Tradeable on OpenSea. Resellable like a used manga volume.
- **Creators earn primary sales plus a 5% royalty** baked into the smart contract — automatically routed on every secondary trade, forever, with no middleman.
- **Two tiers per series**: Reader Pass for casual fans, Patron Pass for superfans who want bonus chapters and credits.

It's Patreon, except the subscription is an asset the fan actually owns.

---

## How it works on-chain

Every series has up to two pass NFTs on a single shared ERC-1155 contract:

| What lives on-chain | What lives off-chain |
|---|---|
| Pass ownership (ERC-1155 token balance) | Episode panels (hardcoded gradients in v1; Arweave in v2) |
| Pass metadata (name, image, attributes) | Reader app UI, paywall logic |
| Royalty enforcement (5% on resale) | Series catalog, episode list |
| Mint transactions, transfer events | Coin balance, off-chain spend |

**The flow:**

1. Reader connects wallet → signs auth message → JWT session created
2. Reader clicks "Buy Reader Pass" → `claimTo()` called on the Edition Drop contract → MetaMask popup → 0.001 ETH testnet → ERC-1155 mint
3. Frontend reads `balanceOf(wallet, tokenId)` → access granted to all episodes of that series
4. If reader sells the pass on OpenSea, 5% routes to the creator wallet via the contract's royalty config

---

## Tech stack

| Layer | Tech |
|---|---|
| **Smart contract** | thirdweb DropERC1155 (Edition Drop) on Base Sepolia |
| **Wallet & auth** | thirdweb v5 SDK, MetaMask / Coinbase Wallet / Rabby / Rainbow / Zerion |
| **Frontend** | React 19, Vite 6, TypeScript, React Router v6, Framer Motion |
| **Backend** | Express 5, TypeScript, JWT session tokens, signed wallet challenges |
| **Database** | Postgres via `pg` (waitlist persistence — optional, gracefully disabled in preview) |
| **Hosting** | Vercel (frontend), backend served as same-origin via Express in production |
| **Fonts** | Sora (display), Inter (body) |

---

## Smart contract details

**Contract address (Base Sepolia):** [`0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920`](https://sepolia.basescan.org/address/0x39bD486eB16BCb20670bE2BBCFE9317BC0aF1920)

**Standard:** ERC-1155 with claim conditions, lazy minting, and royalty enforcement (thirdweb's `DropERC1155`)

**Royalty:** 5% to creator wallet on every secondary sale

**Current token IDs:**

| Token ID | Pass | Price |
|---|---|---|
| 0 | Neon Requiem · Reader Pass | 0.001 ETH |
| 1 | Neon Requiem · Patron Pass | 0.005 ETH |
| 2 | Midnight Bloom · Reader Pass | 0.001 ETH |

More token IDs will be lazy-minted as the catalog grows.

---

## Features in the demo

### Reader flow
- **Discover page** — 6 series across genres (Action, Romance, Fantasy, Slice of Life), each with unique cover gradients
- **Series page** — pass cards at the top (Reader + Patron tiers) above the episode list. Buy buttons trigger real on-chain transactions. Owned passes show token ID and BaseScan link.
- **Tier-gated content** — Patron-only bonus chapters render greyed-out for Reader holders, accessible for Patron holders. Smart contract checks which tier you hold.
- **Reader page** — vertical scroll reader with hot-pink progress bar, chapter navigation, end-of-episode cards

### Creator flow
- **Creator dashboard** — animated revenue breakdown chart (primary sales + royalty income), mock payout log with on-chain tx hashes
- **Publish flow** — modal walks through the upload-to-IPFS + lazy-mint sequence (scripted in v1, fully on-chain in v2)

### Profile & library
- **"Your Passes"** — owned pass NFTs with token IDs, mint tx hashes, and direct OpenSea Testnet links for secondary trading
- **Coin balance** — fallback per-episode purchases for series without on-chain passes yet
- **Reading stats** — episodes read, series followed, coins spent

### Wallet auth
- **Sign-in with wallet** — challenge/signature flow, JWT session, persists across page loads via localStorage
- **Supported wallets** — MetaMask, Coinbase Wallet, Rabby, Rainbow, Zerion (via thirdweb)

---

## Demo series

| Title | Genre | Author | On-chain |
|---|---|---|---|
| Neon Requiem | Action | Yuki Tanaka | ✅ Reader + Patron |
| Midnight Bloom | Romance | Sera Moon | ✅ Reader |
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

### Development (hot reload)

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev        # Express on :8080

# Terminal 2 — frontend
cd frontend
npm install
npm run dev        # Vite on :5173, proxies /api to :8080
```

Open the Vite URL, connect a wallet on Base Sepolia, claim some testnet ETH from the faucet if needed, and buy a pass.

### Production build (Docker, single origin)

```bash
docker build -t scrolltale .
docker run -p 8080:8080 scrolltale
```

Open `http://localhost:8080`. Express serves the compiled SPA and the API under `/api/*`.

### With Postgres (waitlist persistence)

```bash
docker run \
  -e DATABASE_URL="postgresql://user:pass@host:5432/scrolltale" \
  -p 8080:8080 \
  scrolltale
```

The server creates the `waitlist` table on startup. Without `DATABASE_URL`, signups are logged to stdout only.

---

## Deploying to Vercel

The frontend is deployed on Vercel. Two paths:

### Option A — frontend only (current setup)
Vercel hosts the React app; the backend runs separately (Railway, Fly, or any Node host).

1. In Vercel project settings, set the root directory to `frontend/`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables:
   - `VITE_THIRDWEB_CLIENT_ID`
   - `VITE_EDITION_DROP_ADDRESS`
   - `VITE_CHAIN_ID`
5. If the backend is hosted elsewhere, set `API_PROXY_TARGET` in Vite config to that URL

### Option B — full Docker (production parity)
Use the multi-stage `Dockerfile` to deploy to Fly.io, Railway, or any container host. Vercel for static frontend only is simpler for hackathon scope.

---

## API reference

### `GET /api/health`
Health check. Returns `{ ok: true, service: "scrolltale-api" }`.

### `POST /api/auth/challenge`
Generate a signing challenge for wallet authentication.

```json
{ "address": "0x46298..." }
```

Returns:
```json
{ "message": "Sign this message to authenticate...", "timestamp": 1716489600000 }
```

### `POST /api/auth/verify`
Verify a signed challenge and issue a JWT session token.

```json
{ "address": "0x46298...", "message": "...", "signature": "0x..." }
```

Returns:
```json
{ "success": true, "sessionToken": "eyJ...", "address": "0x46298...", "expiresIn": "7d" }
```

### `GET /api/auth/me`
Get the current authenticated wallet from a JWT.

Headers: `Authorization: Bearer <sessionToken>`

### `POST /api/waitlist`
Email signup with optional role.

```json
{ "email": "reader@example.com", "role": "reader" }
```

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

Dark mode only. Designed mobile-first; responsive up to desktop.

---

## What's next (post-hackathon roadmap)

- **Arweave for episode panels** — permanence guarantee: even if Scrolltale shuts down, holders still own readable content
- **Creator publishing UI** — full upload flow for new series + automated lazy-minting of pass tiers
- **In-app secondary marketplace** — list/buy passes without leaving Scrolltale, with creator royalties enforced
- **Gasless onboarding** — ERC-2771 forwarders + thirdweb in-app wallets for non-crypto-native readers
- **Mainnet launch** — migration to Base mainnet with real ETH pricing, fiat on-ramp via thirdweb Pay
- **Subscription tier passes** — monthly access NFTs that auto-renew or expire, separate from per-series passes

---

## Brand

- **Tagline:** stories that scroll with you. payouts that don't lie.
- **Audience:** gen-z webtoon readers worldwide, indie comic artists frustrated with opaque platform payouts
- **Vibe:** dark-mode-native, late-night neon, rebellious creator energy, soft and rounded, no sharp edges anywhere
- **Voice:** friendly and welcoming, conversational, warm — *"welcome back, ready to read?"*

---

## Acknowledgements

Built for the [Locus Founder](https://locusfounder.com) hackathon.

- **thirdweb** — wallet auth, smart contract templates, deployment dashboard
- **Base** — fast and cheap L2 testnet for hackathon iteration
- **OpenSea Testnet** — secondary market for testing pass transfers and royalties

---

## License

Private — all rights reserved. Not open for redistribution.

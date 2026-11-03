# BlueFire Platform

BlueFire funds atmospheric-water machines on-chain. Each physical machine is one
isolated smart contract on Rootstock (RSK); investors fund it and receive an
ERC-721 position NFT, operators deposit water-sales revenue, and investors claim
their pro-rata share.

Live: **https://bluefire.ink** (Rootstock **testnet**).

The repo has three parts:

| Folder       | What it is                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| `frontend/`  | Next.js 15 (App Router, React 19, Tailwind 4, GSAP). Public landing page at `/`, auth pages, and the Admin / Investor / Operator dashboards. Brand guide renders at `/brand`. |
| `backend/`   | NestJS 11 API on MongoDB (Mongoose). JWT auth with roles, Brevo email, Cloudinary uploads, ethers v6 reads of the contracts. |
| `contracts/` | Foundry project: `BlueFireFactory` + `UnitProjectERC721` (Solidity 0.8.26). |

## Roles

- **Investor** (default for every signup): browse projects, fund them with a wallet, track the portfolio, claim revenue.
- **Operator**: sees their assigned project, submits performance data and resource requests, deposits revenue on-chain.
- **Admin**: creates projects (with images), assigns operators, reviews operator requests, deploys/syncs projects on-chain, analytics.

Admin is never granted through the API. Promote a user directly in MongoDB:

```js
db.users.updateOne({ email: "someone@example.com" }, { $addToSet: { roles: "Admin" } })
```

Roles are re-read from the DB on every request; the user has to log in again for the UI to show the new role.

## Local development

Prerequisites: Node.js 20+, a local MongoDB, and [Foundry](https://book.getfoundry.sh/) for the contracts.

```bash
git clone --recurse-submodules https://github.com/hdolivares/blue-fire-platform.git
cd blue-fire-platform
```

**Backend** (API on `http://localhost:3001`)

```bash
cd backend
npm install
# create backend/.env (see below)
npm run seed        # optional: dev admin + sample projects; refuses to run when NODE_ENV=production
npm run start:dev
```

**Frontend** (on `http://localhost:8080`)

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

The API has **no global `/api` prefix**. In production the reverse proxy serves it under `/api` and strips the prefix, so locally you point the frontend straight at the API port.

### Environment variables

`.env` files are gitignored. Never commit real values.

**`backend/.env`**

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `DATABASE_URL` | yes | e.g. `mongodb://localhost:27017/bluefire` (use an authenticated user in production) |
| `JWT_SECRET` | yes | Long random string (`openssl rand -hex 48`) |
| `FRONTEND_URL` | yes | CORS origin and base URL for email links, e.g. `http://localhost:8080` |
| `PORT` / `HOST` | no | Default `3001` / `127.0.0.1` (the API binds to loopback unless `HOST` says otherwise) |
| `NODE_ENV` | no | `production` on the server |
| `BREVO_API_KEY` | for email | Password-reset and weekly status emails |
| `EMAIL_SENDER_ADDRESS` / `EMAIL_SENDER_NAME` | no | Default `noreply@bluefire.ink` (must be a verified Brevo sender) |
| `STATUS_REPORT_EMAIL` | no | Recipient of the weekly status email (Mondays 09:00) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | for uploads | Project images. The app reads these three, not `CLOUDINARY_URL` |
| `BLOCKCHAIN_RPC_URL` | no | Default: public Rootstock testnet node |
| `BLOCKCHAIN_CHAIN_ID` | no | Default `31` (RSK testnet) |
| `BLUE_FIRE_FACTORY_ADDRESS` | no | Default: the testnet factory below |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seed only | Credentials for the dev admin created by `npm run seed` |

**`frontend/.env.local`** (or `.env.production` on the server)

| Variable | Notes |
| -------- | ----- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` locally, `/api` in production |
| `NEXT_PUBLIC_RPC_URL` | Optional; default is the public Rootstock testnet node |

### Useful commands

```bash
# backend
npm run build && npm run start:prod
npm run lint
npm test                 # note: several scaffold specs from the Nest template are stale

# frontend
npm run build && npm start
npm run lint

# contracts
cd contracts
forge build
forge test               # add --gas-report or use `forge coverage`
```

## Smart contracts

- **`BlueFireFactory`** deploys one `UnitProjectERC721` per machine (minimal-proxy clones of a single implementation), owns admin actions (escrow approval, operator assignment, transfer gating).
- **`UnitProjectERC721`** holds the funding, escrow and revenue accounting for one machine and mints position NFTs to investors.

Lifecycle: `SEEKING_FUNDING → FUNDED → OPERATIONAL → CLOSED`. Funding stops at the cap; the admin approves and releases escrow to the beneficiary; then the operator can deposit revenue (`payWaterRevenue`) and investors `claim(tokenId)`.

Revenue uses an accumulator so claims are O(1):

```
accRevenuePerShare += revenueDeposit * 1e18 / totalFunded
pending(tokenId)    = funded[tokenId] * accRevenuePerShare / 1e18 - rewardDebt[tokenId]
```

NFT transfers are disabled by default and can be enabled per project; unclaimed rewards travel with the token.

**RSK testnet deployment (chain 31)**

| Contract | Address |
| -------- | ------- |
| BlueFireFactory | `0x9f715843A5bcF6d8afBa99FAed3d8F5634a3310b` |
| UnitProjectERC721 implementation | `0x460B288FA286Fff723A4F3B219241Ab184df9163` |

To redeploy: `PRIVATE_KEY=... forge script script/Deploy.s.sol --rpc-url <rpc> --broadcast`, then update `frontend/src/contracts/contract-address.json` and `BLUE_FIRE_FACTORY_ADDRESS`. ABIs used by the apps live in `backend/src/contracts/` and `frontend/src/contracts/`.

## API overview

All routes require a valid JWT (`Authorization: Bearer <token>`) unless marked public. Role checks are enforced by global guards.

| Area | Routes | Access |
| ---- | ------ | ------ |
| Auth | `POST /auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` | Public, rate-limited |
| Projects | `GET /projects`, `/projects/:id`, `/projects/enhanced/all`, `/projects/blockchain/:id` | Public |
| | `POST /projects`, `PATCH /projects/:id/blockchain`, `POST /projects/:id/sync`, `/projects/sync/all` | Admin |
| Performance | `GET /performance/:projectId`, `/performance/:projectId/historical` | Public |
| Investments | `POST /investments`, `GET /investments/:projectId/positions` … | Investor |
| Investors | `GET /investors/my-portfolio`, `/investors/portfolio-summary` | Investor |
| Operators | `GET /operators/my-project`, `POST /operator-requests`, `GET /operator-requests/my-requests` | Operator |
| Admin | `/admin/*` (dashboard, investors, projects, operator assignment, analytics), `/alerts/*` | Admin |

## Deployment

Production runs on a single VPS:

- **Caddy** terminates TLS for `bluefire.ink`; `handle_path /api/*` proxies to the API (stripping `/api`), everything else goes to Next.js.
- **PM2** runs `bluefire-api` (`node dist/main`) and `bluefire-web` (`next start`) as an unprivileged `deploy` user, both bound to `127.0.0.1`.
- **MongoDB** runs on the same box, localhost-only, with authentication enabled.
- Only ports 22/80/443 are open.

Update the server:

```bash
cd ~/blue-fire-platform && git pull
cd backend  && npm ci && npm run build
cd ../frontend && npm ci && npm run build
pm2 restart bluefire-api bluefire-web
```

Stop the frontend before rebuilding it, or build into a clean checkout: running `next build` while a dev server shares `.next` corrupts it.

## Security notes

The original server was compromised in 2025 through an unpatched Next.js RCE while the app ran as root. Since then:

- Next.js/React are kept on patched releases. Re-check `npm audit --omit=dev` in both apps before each deploy.
- Every API route is authenticated by default; public routes are opt-in with `@Public()`. Signup always creates an Investor. Login/signup/reset are rate-limited per IP, and signup has a honeypot field.
- Passwords are bcrypt-hashed; reset tokens are stored as SHA-256 hashes and expire. JWTs are HS256.
- The API sends Helmet headers and generic 500 errors in production; the frontend sends a CSP, HSTS and frame-blocking headers.
- Services run as a non-root user, bound to localhost, behind Caddy; MongoDB requires auth.
- All secrets from the old server were rotated. Secrets live only in the server's `.env` files.

Known follow-ups: the JWT is kept in `localStorage` (an httpOnly cookie would be stronger), and the CSP still allows `'unsafe-inline'` scripts for Next's bootstrap.

## License

MIT

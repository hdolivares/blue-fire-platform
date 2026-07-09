# BlueFire — Security Hardening & Redeploy Checklist

This document records the security review performed after the December compromise
(root access → UID‑0 backdoor user → `wget` cryptominer), the code fixes applied,
and the **infrastructure steps you must complete on the new server** before going
live again.

---

## 1. How the compromise most likely happened

- **Primary vector — Next.js 15.3.5 unauthenticated RCE** (App Router / React
  Server Components; publicly tracked as "React2Shell", and flagged *critical* by
  `npm audit`). An unauthenticated request achieves remote code execution in the
  Next.js process. **Because the app ran as `root`**, that RCE was instant root —
  which matches exactly what we observed (no `child_process` anywhere in the app,
  yet a root‑level miner + backdoor user).
- **Force multipliers:** the app ran as **root**, there was **no host firewall**,
  **MongoDB had no authentication**, and **SSH allowed root + password login**.
  Any one of these turns a foothold into full takeover.

**Assume every secret that lived on the old droplet is compromised** (see §4).

---

## 2. Code fixes applied (in this repo)

### Dependencies
- **Next.js → 15.5.20**, **react/react-dom → 19.2.x** (patches the RCE and the
  image‑optimizer / RSC / request‑smuggling advisories), **axios → 1.18.x**.
- **`helmet`** added to the backend; `npm audit fix` run on both packages.
- **Removed unused `nodemailer`** (the app sends mail via Brevo) — clears its
  SMTP‑injection advisories at zero risk.
- **Production dependency audit** is now clean except for one chain (below);
  all remaining `npm audit` findings are **dev/build tooling** (webpack, babel,
  swc, eslint, decompress) that is **not loaded by `node dist/main`** in
  production and is not part of the network attack surface.

> **One prioritized follow‑up (breaking, needs email testing):** the Brevo email
> SDK (`@getbrevo/brevo@2.5.0`) pulls the deprecated `request` HTTP client, which
> carries `form‑data` (critical) and `tough‑cookie` (moderate) advisories. These
> are internal to Brevo's HTTPS calls (app‑controlled, `@IsEmail`‑validated
> fields → **not externally exploitable** against our endpoints), so they were
> **not** force‑upgraded blind. Fix by migrating to **`@getbrevo/brevo@6+`**
> (renames the SDK init/`setApiKey` API — update `email.service.ts`) and then
> **send a real password‑reset email to confirm** before shipping.

### Backend authorization (was the weakest area)
- **Global auth is now default‑on.** `CommonModule` registers `ControllerAuthGuard`
  + `ControllerRolesGuard` as global guards, so every route requires a valid JWT
  unless explicitly `@Public()`. Previously auth was opt‑in and the bare `@Roles()`
  decorator attached **no guard**, leaving several endpoints wide open.
- **Privilege escalation closed.** `RegisterUserDto` no longer accepts a `roles`
  field; `UsersService.register` forces `roles: ['Investor']` server‑side. (Anyone
  could previously register as Admin.)
- **`projects` endpoints locked down.** `POST /projects` (create) and
  `PATCH /projects/:id/blockchain`, `POST /:id/sync`, `POST /sync/all` are now
  `@AdminOnly()`; `POST /:id/sync-after-transaction` is now `@Authenticated()`.
  (Previously an anonymous user could repoint a project's on‑chain contract
  address.) Frontend callers were updated to send the JWT.
- **Upload limits** on `POST /projects`: image‑only `fileFilter`, 8 MB × 8 files.
- **Input validation:** `CreateInvestmentDto` (positive, bounded amount);
  **IDOR fixed** on `GET /operator-requests/:id` (operators can only read their own).

### Backend hardening
- **Rate limiting is no longer bypassable** — Express `trust proxy` is set and the
  limiter uses `req.ip` instead of the client‑spoofable `X‑Forwarded‑For` header.
- **Password reset works and is secure** — the token is now SHA‑256 hashed on both
  store and lookup (it previously stored bcrypt but looked up sha256 → always failed).
- **No internal error leakage** — the global exception filter returns a generic
  message for unexpected errors in production (full detail is logged only).
- **NoSQL regex/ReDoS removed** — email lookups use an exact, collation‑based match
  instead of interpolating input into a `RegExp`.
- **JWT algorithm pinned** to `HS256` (sign + verify).
- **PII no longer logged** on every login; **RPC access tokens removed** from
  `frontend/` and `backend/src/config/blockchain.ts` (default is the public
  tokenless Rootstock node).
- **Seed script refuses to run in production** and its admin password comes from
  `SEED_ADMIN_PASSWORD` (no committed default).

### Frontend hardening
- **Security headers** via `next.config.ts`: CSP (scoped to self + Rootstock RPC +
  Cloudinary/Unsplash images), `X‑Frame‑Options: DENY`, `X‑Content‑Type‑Options`,
  `Referrer‑Policy`, `Permissions‑Policy`, HSTS; `poweredByHeader: false`.

### Known residuals (accepted / low‑risk — see follow‑ups)
- JWT is stored in `localStorage` (XSS→token theft). Mitigated by the CSP; the
  stronger fix is an httpOnly cookie — a larger change, deferred.
- The CSP uses `'unsafe-inline'` for scripts/styles (Next inline bootstrap). A
  nonce‑based CSP via middleware is the stronger follow‑up.
- `GET /alerts/user/:userId` still takes the id from the path (IDOR) — but the data
  is mock/in‑memory today; it now at least requires authentication.
- `POST /projects` create still uses a permissive body (multipart). Safe because
  it's now Admin‑only; a strict `CreateProjectDto` is a nice follow‑up.

---

## 3. Infrastructure checklist — DO THIS ON THE NEW SERVER

The code is necessary but **not sufficient**. Complete all of these:

- [ ] **Do NOT run the app as root.** Create a dedicated non‑login service user
      (e.g. `bluefire`) and run pm2/systemd under it:
      `adduser --system --group --no-create-home bluefire` and run the Node
      processes as that user. A future app‑layer bug then cannot become root.
- [ ] **Host firewall.** Use a DigitalOcean Cloud Firewall (preferred) or `ufw`:
      allow only `22` (SSH), `80`, `443`. Do **not** expose `3001` (backend) or
      `8080` (frontend) to the internet — only nginx should reach them
      (`localhost`). `ufw default deny incoming; ufw allow 22,80,443/tcp; ufw enable`.
- [ ] **MongoDB: enable auth + bind to localhost.** Set `security.authorization: enabled`
      and `net.bindIp: 127.0.0.1` in `/etc/mongod.conf`, create a DB user with a
      strong password, and put credentials in `DATABASE_URL`
      (`mongodb://user:pass@127.0.0.1:27017/bluefire?authSource=admin`).
- [ ] **SSH: key‑only, no root.** In `/etc/ssh/sshd_config`: `PermitRootLogin no`,
      `PasswordAuthentication no`; deploy via a sudo user with an SSH key. This
      closes the brute‑force vector.
- [ ] **fail2ban** for SSH (and optionally nginx) to throttle brute force.
- [ ] **Keep Next.js patched.** Subscribe to Next.js security releases; a
      root‑running or unpatched Next is what got exploited. Run `npm audit` in CI.
- [ ] **Never run `npm run seed`** against the production database.
- [ ] **Automatic security updates** (`unattended-upgrades`).
- [ ] Optional but recommended: run the app behind the DO firewall on a private
      network, add nginx `limit_req` on `/api/auth/*`, and enable nginx access logs.

---

## 4. Rotate every secret (assume all leaked)

Because the old box had root compromise, rotate **all** of these and put the new
values only in the new server's env (never commit them):

- [ ] `JWT_SECRET` (invalidates all existing tokens — expected).
- [ ] **MongoDB** credentials.
- [ ] **Cloudinary** API key + secret.
- [ ] **Brevo** API key.
- [ ] Both **Rootstock RPC** access tokens (the keyed URLs previously in
      `config/blockchain.ts`).
- [ ] Retire the old **`admin_password_123`** account; create a fresh admin with a
      strong password (and change it after first login).
- [ ] Any wallet keys/mnemonics that were ever present in the server environment.

---

## 5. Verify before going live

- [ ] `cd backend && npm run build` and `cd frontend && npm run build` both pass.
- [ ] Confirm `next` ≥ 15.5.x and `react`/`react-dom` ≥ 19.1.2 in the deployed lockfiles.
- [ ] Smoke test: register (should create an **Investor**, never an Admin), login,
      load dashboards, and confirm `PATCH /projects/:id/blockchain` returns 401/403
      without an admin token.
- [ ] `curl -I https://<domain>` shows the new security headers and no `X‑Powered‑By`.
- [ ] `ss -ltnp` on the server shows `3001`/`8080` bound to `127.0.0.1` only.

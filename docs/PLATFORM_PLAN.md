# StudySphere — Production-Readiness & Platform Plan

> Written for: you, working in this repo. Not a team-facing doc.
>
> Constraint assumed throughout: **everything runs on free tiers.** Where a free
> tier changes the right answer, that is called out rather than hidden.
>
> Reference repos studied for patterns: `toskie-backend` (NestJS), `toskie-web`
> (Next.js), `one-cx` (Next.js + Strapi). Each borrowed pattern names its source
> so you can go read the original.

---

## 0. How to read this

The project works. Nothing below is "your app is broken." It is the gap between
_a working app_ and _an app that can be operated_ — which is the gap the three
reference repos have already crossed, and the one that actually shows up in
interviews and in production.

Sections 1–2 are findings (evidence, with file references). Section 3 is the
target architecture. Section 4 is the plan, in phases. Section 5 is the order to
do it in. Section 6 is what to deliberately skip.

Effort figures are focused-work estimates for one person who already knows the
codebase.

---

## 1. Audit — where the project stands today

### 1.1 Frontend (`src/`, Vite + React 19)

Stack: Vite 6, React 19, TypeScript (partial), Tailwind 4, React Router 7, Redux
Toolkit (3 slices) **+** Zustand (auth) **+** TanStack Query, react-hook-form +
Zod, axios.

Already good:

- `src/lib/axiosClient.ts` — one client, `withCredentials`, a 401 interceptor that
  only bounces on protected paths. The comments explain _why_, which is rare.
- `src/providers/query-provider.tsx` — sane `staleTime`/`gcTime`, `retryUnlessAuth`
  so auth failures don't retry 3×.
- `src/providers/auth-initializer.tsx` — query cache mirrored into the store,
  `queryFn` kept side-effect free.
- Zod schemas separated in `src/zod-validations/`, typed service layer in
  `src/services/`, hooks in `src/hooks/use-*-query.ts`. This is a clean shape.
- SEO/robots handling in `vite.config.js` + `src/lib/seo/robots.js` — staging
  `noindex` is already thought through, including the non-JS-crawler case.

Gaps:

- **No route-level code splitting.** `src/App.jsx` eagerly imports ~25 route
  components at the top. Every visitor downloads the instructor dashboard,
  Chart.js, react-player and Swiper before the homepage paints.
- **No error boundary anywhere.** `grep -rn "ErrorBoundary\|componentDidCatch" src`
  returns nothing. One render-time throw blanks the whole app.
- **No tests.** No test file exists in the repo.
- **Three state systems.** Redux (cart, course, viewCourse) + Zustand (auth) +
  React Query (server state). Not wrong, but undocumented — nothing says which to
  reach for.
- **Bundle is 8.5 MB.** `dist/assets/TimelineImage-*.png` is 572 KB,
  `Instructor-*.png` 414 KB, all unoptimized PNG. `src/assets/Images/banner.mp4`
  is bundled, not CDN'd. `react-player` v2 pulls a chunk per provider
  (DailyMotion, Kaltura, Mixcloud, SoundCloud, Streamable, Mux…), none of which
  this app uses.
- **Mixed `.jsx` / `.tsx`.** TypeScript is configured and used in the newer files;
  the older ones are untyped JS. The boundary is arbitrary.

### 1.2 Backend (`server/`, Express 4 + Mongoose)

Stack: Express 4 (CommonJS), Mongoose 8, JWT in an httpOnly cookie, bcrypt,
Cloudinary, Razorpay, nodemailer, node-cron.

Already good:

- `server/config/authCookie.js` — cookie TTL and JWT TTL owned in one place, with
  the drift bug that caused it documented. This is exactly the right instinct.
- `server/middlewares/auth.js` — cookie-only credential, no bearer fallback; role
  guards correctly return **403**, not 401.
- `server/controllers/Auth.js` — `accountType` is allowlisted rather than trusted;
  password hash stripped from responses; OTP email normalised.
- Razorpay signature **is** verified with an HMAC compare in `verifyPayment`.
- CORS origins are an explicit allowlist from env, not `*`.

Gaps — the big ones:

| Gap                       | Evidence                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| No rate limiting anywhere | `/auth/sendotp`, `/auth/login`, `/auth/reset-password-token` unthrottled |
| No security headers       | no `helmet`, no CSP, no HSTS                                             |
| No global error handler   | an async throw outside a `try` takes the process down                    |
| No health endpoint        | `/` returns 200 unconditionally — it cannot fail, so it proves nothing   |
| No structured logging     | every `console.log` is commented out; there is no replacement            |
| No index on `User.email`  | `grep -n "unique" server/models/*.js` returns nothing                    |
| No refresh token          | 2-hour absolute session, then a hard 401                                 |
| No migrations             | index/schema changes have no mechanism                                   |
| No tests                  | —                                                                        |
| No Docker                 | —                                                                        |
| No CI/CD                  | there is no `.github/` directory at all                                  |
| Secrets undocumented      | `server/.env` exists; `server/.env.example` does not                     |

### 1.3 What the reference repos have that this doesn't

Condensed, so you can see the shape of the target:

- **toskie-backend** — refresh-token rotation with reuse detection, Redis-backed
  throttling, `/health` + `/health/ready`, `/metrics`, boot-time config
  assertions, strict migrations in the deploy, artifact-based deploys with
  health-polled verification, a manual approval gate for prod, PM2 config with
  its failure modes documented, CI that provisions the schema from zero.
- **toskie-web** — a BFF layer so cookies never touch client JS, single-flight
  refresh + retry in the axios interceptor, a _typed_ analytics event vocabulary,
  Jest + Testing Library + `jest-axe`, husky/lint-staged, SonarJS lint rules.
- **one-cx** — GTM dataLayer choke point with per-domain typed event helpers,
  RudderStack behind a first-party proxy, multi-stage Docker with a migrating
  entrypoint, GHCR image builds, branch→environment mapping (develop→staging,
  release→UAT, main→prod), pre-flight secret verification, health-polled deploys,
  auto-rollback, Teams notifications.

---

## 2. Concrete defects found while reading

These are specific and worth fixing regardless of the rest of the plan.

**2.1 — Double HTTP response in the payment flow.**
`server/controllers/Payments.js`: `enrollStudent(courses, userId, res)` writes
responses itself (`res.status(400)`, `res.status(500)`), and `verifyPayment` then
does `return res.status(200).json(...)` unconditionally after awaiting it. When
`enrollStudent` takes an error branch, the second write throws
`ERR_HTTP_HEADERS_SENT`. With no global error handler (2.4), that is an unhandled
rejection.
_Fix:_ make `enrollStudent` return a result object and let the controller own the
single response.

**2.2 — Payment enrollment is not atomic.**
Same function: the loop enrols course-by-course and `return`s a 500 on the first
mail failure. A two-course cart can end with course 1 enrolled, course 2 not, and
the student told the payment failed — after Razorpay has already captured. Mail
delivery sits in the same `try` block as enrolment, so a provider hiccup fails a
successful payment.
_Fix:_ enrol all courses in a Mongo transaction, then queue the emails separately
(Phase 2). Never let mail failure roll back money.

**2.3 — `User.email` has no unique index.**
`server/models/User.js` — `email` is `required` and `trim`, not `unique`. Signup
does `findOne` then `create`, which is check-then-act: two concurrent signups on
the same address both pass. Also every login is a collection scan.
_Fix:_ unique index via a migration (Phase 10), plus handle the duplicate-key
error in `signUp`.

**2.4 — No global error handler.**
`server/index.js` mounts routes and listens. Express 4 does not catch rejected
promises in async handlers; anything thrown outside a controller's `try` becomes
an unhandled rejection, which on Node 20+ terminates the process.
_Fix:_ `express-async-errors` (or a wrapper) + a terminal error middleware +
`process.on('unhandledRejection' | 'uncaughtException')` logging before exit.

**2.5 — Password-reset token is stored in plaintext.**
`server/controllers/ResetPassword.js` writes `crypto.randomBytes(20).toString('hex')`
straight into `User.token`. Anyone with read access to the database can take over
any account with a live reset.
_Fix:_ store `sha256(token)` and compare hashes — exactly what
`toskie-backend/src/modules/admin-core/services/admin-core-refresh-token.service.ts`
does with refresh tokens.

**2.6 — OTP is brute-forceable.**
6 numeric digits, 5-minute window, plaintext in the `OTP` collection, **no attempt
counter and no send throttle**. Nothing stops 100 k guesses, and nothing stops an
attacker using `/sendotp` as an email bomb against a third party — which on a free
mail tier also burns your daily quota.
_Fix:_ move OTP to Redis with a hashed value, a 5-attempt cap and a resend
cooldown (Phase 2). Rate-limit the endpoint (Phase 0).

**2.7 — Account enumeration.**
Login returns "User is not registered, please signup first"; reset returns
"Your email: x is not registered with us"; `/sendotp` returns 409 "User already
registered". Together these confirm which addresses hold accounts.
_Fix:_ generic messages on login and reset ("If that account exists, we've sent a
link"). `/sendotp` genuinely needs to differentiate for UX — rate-limit it instead.

**2.8 — CSRF is open in production.**
`getAuthCookieOptions()` sets `sameSite: 'none'` in prod because the SPA and API
are on different sites. The browser therefore attaches the session cookie to
cross-site POSTs, and every state-changing route is reachable from any page the
user visits.
_Fix:_ see Phase 0.4 — the cheapest real fix is putting both on the same
registrable domain so `sameSite: 'lax'` becomes viable.

**2.9 — Razorpay receipt IDs can collide.**
`receipt: Math.random(Date.now()).toString()` — `Math.random()` ignores its
argument. This is `Math.random().toString()`, a float, and Razorpay treats
`receipt` as your idempotency handle.
_Fix:_ `crypto.randomUUID()`.

**2.10 — Mail is sent from a Mongoose pre-save hook.**
`server/models/OTP.js` sends the verification email inside `pre('save')`. The
request blocks on SMTP, and a mail failure aborts the save — so a slow provider
looks like a database error. A model doing I/O is also untestable without a mail
server.
_Fix:_ send from the controller (immediate), or queue it (Phase 2).

**2.11 — `nodemon` is a production dependency.**
`server/package.json` lists it under `dependencies`. It ships to prod and bloats
the image.

---

## 3. Target architecture — free tier

### 3.1 Topology

```
                       ┌───────────────────────────┐
  Browser  ──────────▶ │  Cloudflare Pages (SPA)   │   free, unlimited bandwidth
                       │  studysphere.pages.dev    │
                       └─────────────┬─────────────┘
                                     │ same registrable domain
                                     ▼
                       ┌───────────────────────────┐
                       │  API — Express container  │   Cloud Run (scale-to-zero)
                       │  api.studysphere.dev      │   or Render / Oracle VM
                       └───┬──────────┬────────┬───┘
                           │          │        │
              ┌────────────▼──┐  ┌────▼────┐  ┌▼─────────────┐
              │ MongoDB Atlas │  │ Upstash │  │  Cloudinary  │
              │   M0 (free)   │  │  Redis  │  │    (free)    │
              └───────────────┘  └─────────┘  └──────────────┘

  GitHub Actions ─▶ build + test ─▶ GHCR image ─▶ deploy ─▶ health poll ─▶ notify
  Scheduled Action ─▶ POST /internal/jobs/prune-users   (replaces node-cron)
  Scheduled Action ─▶ mongodump ─▶ Cloudflare R2        (Atlas M0 has no backups)
```

### 3.2 Platform choices, with the limits that actually bite

Free tiers change. Verify current numbers before committing; the _shape_ of the
advice holds.

| Need                | Pick                              | Free-tier reality                                                                                                                                    |
| ------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| SPA hosting         | **Cloudflare Pages**              | Unlimited bandwidth, ~500 builds/mo. Best free static host. Vercel Hobby is fine too but is non-commercial-use only.                                 |
| API hosting         | **Google Cloud Run**              | ~2M requests/mo always-free, scales to zero, takes a container directly. Cold start ~1–2 s. Needs a billing account attached but stays free.         |
| API alt. (simplest) | **Render** free web service       | 512 MB, **spins down after 15 min idle** → ~50 s cold start, and `node-cron` never fires. 750 instance-hours/mo ≈ one service running continuously.  |
| API alt. (control)  | **Oracle Cloud Always Free**      | 4 ARM cores / 24 GB RAM, always free, a real VM — this is what makes the Kubernetes phase possible. ARM capacity is often hard to get; plan retries. |
| Database            | **MongoDB Atlas M0**              | 512 MB, shared. **No automated backups** — see Phase 10.3. It _is_ a replica set, so transactions work (matters for Phase 1).                        |
| Redis               | **Upstash**                       | Command-metered free tier. Fine for rate limiting, OTP and caching. **Not** fine for BullMQ — blocking queue reads burn the quota. See Phase 2.5.    |
| Registry            | **GHCR**                          | Free for public images; private has limits.                                                                                                          |
| CI                  | **GitHub Actions**                | Unlimited minutes on public repos; ~2000 min/mo on private.                                                                                          |
| Errors              | **Sentry**                        | ~5 k errors/mo, 1 user. Enough.                                                                                                                      |
| Metrics / logs      | **Grafana Cloud**                 | ~10 k metric series, ~50 GB logs, 14-day retention.                                                                                                  |
| Uptime              | **UptimeRobot**                   | 50 monitors, 5-min interval. Doubles as a keep-warm ping if you land on Render.                                                                      |
| Object storage      | **Cloudflare R2**                 | 10 GB, no egress fees. For database dumps.                                                                                                           |
| Email               | **Brevo** (300/day) / **Resend**  | Gmail SMTP will rate-limit and eventually flag you. Move off it.                                                                                     |
| Product analytics   | **PostHog Cloud**                 | ~1M events/mo, includes session replay, funnels and feature flags. Simpler than self-hosting RudderStack.                                            |
| Web analytics       | **GA4 via GTM**                   | Free.                                                                                                                                                |
| Feature flags       | **PostHog flags** / **Flagsmith** | Avoids a second vendor.                                                                                                                              |

### 3.3 Environments

Three, mapped to branches — the model `one-cx` uses:

| Env            | Branch / trigger  | Frontend                           | API             | Data                                       |
| -------------- | ----------------- | ---------------------------------- | --------------- | ------------------------------------------ |
| **local**      | —                 | `vite` on :5173                    | `nodemon` :4000 | docker-compose (Mongo replica set + Redis) |
| **staging**    | push to `develop` | Pages preview, `VITE_STAGING=true` | GHCR `:develop` | separate Atlas DB + Upstash DB             |
| **production** | tag `v*.*.*`      | Pages production                   | GHCR `:vX.Y.Z`  | production Atlas + Upstash                 |

Staging must be a **separate database**, not a separate collection. You already
have the `VITE_STAGING` noindex plumbing — reuse it.

---

## 4. The plan

Each item: what, why, how, and where the pattern comes from.

---

### Phase 0 — Security & correctness hardening

_Before anything is publicly hosted. ~2–3 days._

**0.1 Fix the defects in §2.** Start with 2.1, 2.3, 2.4, 2.5, 2.9 — each is under
an hour and each is a real failure mode.

**0.2 Rate limiting.** `express-rate-limit`, in-memory for now (Redis store in
Phase 2.1). Tiers:

```js
// server/middlewares/rateLimit.js
const strict = { windowMs: 15 * 60_000, limit: 5 }; // login, reset-password-token
const otp = { windowMs: 60 * 60_000, limit: 3 }; // sendotp — per email AND per IP
const general = { windowMs: 15 * 60_000, limit: 300 }; // everything else
```

Key OTP limits on **both** IP and target email, or an attacker rotates IPs to bomb
one inbox. Requires `app.set('trust proxy', 1)` — see 0.5.

**0.3 Security headers.** `helmet()` with a real CSP. Start report-only, read the
reports, then enforce. Allowlist: Razorpay checkout, Cloudinary, your API origin,
GTM (Phase 8).

**0.4 Close the CSRF hole (2.8).** In preference order:

1. **Put the SPA and API on the same registrable domain.** `studysphere.dev` and
   `api.studysphere.dev` are _same-site_, so `sameSite: 'lax'` works and the
   cross-site attack surface disappears. A domain is the one thing here that isn't
   free (~₹800/yr), or use a provider that offers a free subdomain. This is the fix
   that solves the problem rather than papering over it.
2. If they must stay cross-site: double-submit CSRF token (`csrf-csrf`), plus an
   `Origin`/`Referer` check on every state-changing method.

**0.5 `app.set('trust proxy', 1)`.** Every free host puts a proxy in front. Without
this `req.ip` is the proxy's address, so every anonymous caller shares one
rate-limit bucket. Use `1`, not `true` — `true` trusts the whole client-controlled
`X-Forwarded-For` chain and lets anyone reset their own bucket.
_(Source: the comment block in `toskie-backend/src/main.ts` — it explains this
better than most docs.)_

**0.6 Body and upload limits.** `express.json({ limit: '100kb' })` and
`express-fileupload({ limits: { fileSize: 50 * 1024 * 1024 }, abortOnLimit: true })`.
Today there is no upload ceiling, which is a disk-fill vector on a 512 MB box.

**0.7 Boot-time config assertions.** Refuse to start on a missing or unsafe config
rather than failing on the first request:

```js
// server/config/assertEnv.js
// - required keys present
// - JWT_SECRET is >= 32 chars and not the example value
// - NODE_ENV === 'production' implies CORS_ORIGINS has no localhost
// - fail with the offending key name, then process.exit(1)
```

_(Source: `assertAdminCoreSecretIsolated` / `assertNodeEnvConsistent` in
`toskie-backend/src/main.ts`.)_

**0.8 `server/.env.example`.** Every key, with a comment on what breaks without it.
The root `.env.example` is already good — match its standard.

**0.9 Graceful shutdown.** `SIGTERM` → stop accepting connections → drain → close
Mongo/Redis → exit. Cloud Run and Kubernetes both send SIGTERM; without a handler
you drop in-flight requests on every deploy.

---

### Phase 1 — Session & refresh tokens

_~2 days. The item you named first, and the biggest UX win._

Today: a 2-hour JWT, no renewal. A student watching a long course gets a hard 401
mid-lecture. `src/lib/axiosClient.ts` even says so: _"There is no refresh endpoint
on this API, so a 401 is terminal."_

**Design** (Mongo adaptation of `toskie-backend`'s model):

```
access_token   JWT, 15 min, httpOnly cookie, path=/
refresh_token  64 random bytes base64url, 30 days,
               httpOnly cookie, path=/api/v1/auth/refresh
```

```js
// server/models/RefreshToken.js
{
  user:       { type: ObjectId, ref: 'User', index: true },
  tokenHash:  { type: String, unique: true },          // sha256 — never the raw token
  expiresAt:  { type: Date, index: { expires: 0 } },   // TTL index = automatic cleanup
  revokedAt:  { type: Date, default: null },
  replacedBy: { type: ObjectId, ref: 'RefreshToken', default: null },
  userAgent:  String,
  ipAddress:  String,
}
```

**`POST /api/v1/auth/refresh`:**

1. Hash the presented token, look it up.
2. Not found → 401.
3. `revokedAt !== null` → **reuse detected.** Revoke every token for that user, log
   it, 401. This is what turns a stolen token from permanent access into a one-shot
   that locks both parties out and surfaces the breach.
4. Expired → 401.
5. Otherwise rotate: issue a new pair, mark the old one revoked with `replacedBy`,
   **inside a transaction**, so two concurrent refreshes cannot both succeed.

> **Free-tier detail that will bite you:** Mongo transactions require a replica
> set. Atlas M0 _is_ one, so production is fine — but a plain `mongo:7` container
> locally is standalone and `session.withTransaction` will throw. Your
> docker-compose (Phase 3) must start Mongo with `--replSet rs0` and run
> `rs.initiate()`, or local and prod diverge exactly where it hurts most.

**Client** — port `toskie-web/src/lib/authRefresh.ts` and its `axiosClient.ts`
interceptor. Two properties matter:

- **Single-flight.** A page firing five queries at once must produce _one_ refresh,
  not five racing rotations. A module-level `refreshPromise` gives you that in ~15
  lines.
- **Only tear down on a definitive rejection.** A network blip or 5xx during
  refresh must _not_ log the user out — the access token may still be valid. Only a
  401/403 _from the refresh endpoint itself_ ends the session. toskie-web learned
  this from a "browser Back during a call logs me out" bug; the reasoning is in the
  header comment of `src/app/api/auth/refresh/route.ts`.

**Also ship:**

- `POST /auth/logout` revokes the presented refresh token (today it only clears the
  cookie — the token stays valid server-side).
- `GET /auth/sessions` + `DELETE /auth/sessions/:id` — "signed in on 3 devices",
  revoke one or all. Falls out of the table almost for free and is a genuinely good
  portfolio feature.

---

### Phase 2 — Redis

_~2 days._

**2.1 Rate-limit store.** Move Phase 0.2 to `rate-limit-redis`. In-memory counters
reset on every restart — and on a scale-to-zero host that is _every idle period_,
so an attacker resets their own bucket by waiting. It is also the only way limits
work across more than one instance.
_(toskie-backend hit exactly this: throttler counters were in-memory until Redis
was wired in.)_

**2.2 OTP storage — replaces the `OTP` collection.** Fixes 2.6 wholesale:

```
otp:<email>          → { hash: sha256(otp), attempts: 0 }   EX 300
otp:cooldown:<email> → 1                                     EX 60
```

Hashed at rest, 5 attempts then the key is deleted, 60 s resend cooldown, expiry
handled by Redis instead of a Mongo TTL monitor. Delete `server/models/OTP.js` and
its pre-save mail hook (2.10) with it.

**2.3 Read-through cache for public reads.** The catalog, category lists and
published-course lists are read constantly and change rarely.

```js
// 60s TTL, explicit invalidation on publish/edit/delete
async function cached(key, ttl, loader) {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit);
  } catch (e) {
    logger.warn({ key, err: e.message }, 'redis read failed; falling through');
  }
  const fresh = await loader();
  try {
    await redis.set(key, JSON.stringify(fresh), 'EX', ttl);
  } catch {}
  return fresh;
}
```

**Fail open.** Every Redis call is wrapped so a Redis outage degrades to "slower"
rather than "down". This is the single most important property of the pattern —
copy it from
`toskie-backend/src/modules/admin-core/services/admin-core-permission-cache.service.ts`.

On Atlas M0 (shared CPU) this is not a micro-optimisation: caching the catalog is
the difference between a snappy homepage and a visibly slow one.

**2.4 Rating aggregates.** `avgRating` is recomputed per course per request today.
Cache it, invalidate on new review.

**2.5 Background jobs — read this before reaching for BullMQ.**

BullMQ is the obvious answer for decoupling mail (2.2, 2.10) from requests. But
BullMQ workers use **blocking Redis reads in a loop**, and Upstash's free tier is
**command-metered** — a single idle worker can exhaust a day's quota. Two honest
options:

- **On Upstash free:** skip BullMQ. Use a Mongo-backed outbox — write
  `{ to, template, payload, status, attempts, nextAttemptAt }` and drain it from a
  scheduled GitHub Action (Phase 4.5) hitting a protected endpoint. Slower, but
  free, durable, retryable and observable.
- **On an Oracle Always Free VM:** run your own Redis container and use BullMQ
  properly, with a dashboard.

Either way, **mail must leave the request path.** That is what fixes "payment
succeeded but the student saw an error" (2.2).

---

### Phase 3 — Containerisation

_~1.5 days._

**3.1 `server/Dockerfile`** — multi-stage, non-root, signal-correct:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init \
 && addgroup -S app && adduser -S app -G app
COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --chown=app:app . .
USER app
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
```

`dumb-init` (or `tini`) matters: as PID 1, Node does not get default signal
handlers, so `SIGTERM` is ignored and every deploy waits out a 10 s kill timeout.

**3.2 `Dockerfile` for the SPA** — build stage runs `vite build`, runtime is
`nginx:alpine` with an SPA fallback (`try_files $uri /index.html`).

> **The build-time trap.** `VITE_*` variables are **inlined at build time**. They
> must be `ARG`s in the Dockerfile and passed as `--build-arg` per environment.
> Setting them in the runtime environment bakes `undefined` into the bundle and
> produces a silently broken app. one-cx shipped production with analytics dead for
> exactly this reason — see the comment block in `one-cx/Dockerfile`.
>
> This also means **one image cannot serve both staging and production.** Either
> build twice, or move the config to a runtime-fetched `/config.json`.

**3.3 `docker-compose.yml`** — the whole stack locally:

```yaml
services:
  mongo:
    image: mongo:7
    # --replSet is REQUIRED: Phase 1's rotation uses transactions, and a
    # standalone mongo throws on session.withTransaction(). Without this,
    # local and production diverge precisely where it matters.
    command: ['--replSet', 'rs0', '--bind_ip_all']
    healthcheck:
      test: ['CMD', 'mongosh', '--quiet', '--eval', 'rs.status().ok || rs.initiate()']
      interval: 5s
      retries: 20
    volumes: [mongodata:/data/db]
    ports: ['27017:27017']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    healthcheck: { test: ['CMD', 'redis-cli', 'ping'], interval: 5s, retries: 10 }

  api:
    build: { context: ./server, target: runner }
    depends_on:
      mongo: { condition: service_healthy }
      redis: { condition: service_healthy }
    env_file: ./server/.env
    environment:
      MONGODB_URL: mongodb://mongo:27017/studysphere?replicaSet=rs0
      REDIS_URL: redis://redis:6379
    ports: ['4000:4000']

volumes: { mongodata }
```

Use `depends_on: condition: service_healthy`, not bare `depends_on` — the latter
waits for the container to _start_, not to be _ready_, so the API races Mongo and
crash-loops on a cold `docker compose up`.

**3.4 `.dockerignore`.** `node_modules`, `.git`, `dist`, `.env`, `coverage`.
Without it the build context includes 5 MB of images and your `.env`.

**3.5 Make compose the documented way to run the project.** README:
`docker compose up` and you have Mongo + Redis + API. Right now onboarding needs a
local Mongo, a hand-built `.env`, and knowledge that isn't written down anywhere.

---

### Phase 4 — CI/CD with GitHub Actions

_~2–3 days. Unlimited minutes if the repo is public._

There is no `.github/` directory today. Everything below is new.

**4.1 `ci.yml`** — on every PR and push to `develop`/`main`:

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

Jobs: `npm ci` (with `cache: npm`) → `format:check` → `lint` → `type-check` →
`test` → `build` → `npm audit --audit-level=high`. You already have
`npm run validate` doing the first three — CI is mostly wiring.

Add a **service-container job** that boots Mongo + Redis and runs the backend
integration tests against them (Phase 6.1).
`toskie-backend/.github/workflows/ci.yml` is the model: it provisions from zero on
every PR _specifically because_ a never-exercised path had rotted silently for
months.

**4.2 `deploy-staging.yml`** — on push to `develop`:

1. **Pre-flight secret check.** Assert every required secret is non-empty and fail
   with the offending name _before_ spending five minutes on a build. one-cx even
   detects the Variables-vs-Secrets mix-up, which looks identical in the UI and
   silently yields an empty string. ~20 lines, saves hours.
2. Build SPA with staging vars (`VITE_STAGING=true`) → deploy to Cloudflare Pages.
3. Build API image with staging build-args → push GHCR `:develop`.
4. Trigger the host's deploy (Cloud Run `deploy`, or a Render deploy hook).
5. **Poll `/health/ready` until 200, up to ~90 s** — do not `sleep 10 && curl`. A
   container that boots and then crash-loops reads as healthy for exactly the window
   a fixed sleep samples. toskie's prod workflow was cut to ship `/health` and then
   didn't call it; the polling loop is the fix.
6. Notify (Slack/Discord webhook — both free).

**4.3 `deploy-prod.yml`** — on tag `v*.*.*`, plus `workflow_dispatch` with a ref
input:

- `environment: production` for scoped secrets.
- **A manual approval gate.** GitHub's built-in Required Reviewers needs a paid plan
  on private repos; `trstringer/manual-approval` gives the same gate free by opening
  an issue and waiting for an `approve` comment. Needs `issues: write`.
  _(This is exactly what toskie-backend does, and the workflow comment explains why.)_
- Migrations run **strict** — a failed migration aborts the deploy before restart.
  toskie swallowed migration failures for a while "because the app will handle schema
  sync"; it doesn't, and that is how drift reached production unnoticed.
- Health-poll, then notify.
- `workflow_dispatch` is not optional: a GitHub Actions incident can drop a push
  event entirely, leaving no run to re-run and no button to press.

**4.4 Supply chain.** `codeql.yml` (free on public repos), `dependency-review.yml`
on PRs, `dependabot.yml` for npm + github-actions.

> Read `toskie-web/.github/dependabot.yml` before enabling it — it's disabled
> there, with reasons: grouped minor/patch PRs kept re-bumping packages whose newer
> minors carried runtime regressions, clobbering deliberate pins. Enable it, but pin
> the packages you've been burned by and add them to `ignore`.

**4.5 Scheduled workflows** — these replace `node-cron`, which cannot work on a
scale-to-zero host (Cloud Run has no process when idle; Render free spins down):

```yaml
# .github/workflows/cron-prune-users.yml
on:
  schedule: [{ cron: '30 19 * * *' }] # 01:00 IST — cron is UTC
  workflow_dispatch:
```

It POSTs to `/internal/jobs/prune-inactive-users` with a shared secret header. Move
the body of `server/jobs/deleteInactiveUsers.js` into that endpoint; keep
`node-cron` only for local/VM runs, selected by env.

Also schedule: the database backup (Phase 10.3), and the mail-outbox drain if you
took the outbox route (2.5).

**4.6 Branch protection.** Require CI green + 1 review on `develop` and `main`. Add
`CODEOWNERS`, a PR template, and `commitlint` for Conventional Commits — which then
drives automatic tags and changelog via `release-please`, which then triggers
`deploy-prod.yml`. That closes the loop: merge to `main` → version bump PR → tag →
approval → production.

---

### Phase 5 — Observability

_~2 days. This is what turns "it's down" into "I know why."_

**5.1 Health endpoints.** Port `toskie-backend/src/shared/health/health.routes.ts`
almost verbatim; the design decisions in it are all earned:

- **`GET /health` — liveness. Shallow on purpose.** It answers "is this process
  running" and checks _nothing else_. A liveness probe that fails during a Mongo
  blip triggers restart loops and turns a brief dependency outage into a full one.
- **`GET /health/ready` — readiness.** Pings Mongo and Redis, **each bounded by a
  2 s timeout** so one hung dependency can't hold the response open. Returns 503 when
  any check fails. **Cache the result ~10 s** — this route bypasses rate limiting,
  and uncached it lets anonymous traffic drive a DB round trip per request.

Your current `GET /` returns 200 unconditionally. It cannot fail, so it proves
nothing — and both the deploy health-poll (4.2) and the Kubernetes probes (Phase 9)
depend on these being real.

**5.2 Structured logging.** `pino` + `pino-http`. Every `console.log` in the server
is currently commented out, which means production has no observability at all —
and the commented lines will rot.

- JSON to stdout in production, `pino-pretty` in dev.
- **Redact** `req.headers.cookie`, `req.headers.authorization`, `password`, `otp`,
  `token`. Non-negotiable — you are one careless log line from putting session
  cookies in a log aggregator.
- `x-request-id` (generate if absent), a child logger per request, and return the id
  in error responses so a user-reported error maps to a log line.

**5.3 Sentry.** `@sentry/node` on the API, `@sentry/react` on the SPA.

- Wrap the app in Sentry's `ErrorBoundary` — this also fixes the "no error boundary
  anywhere" gap from §1.1.
- Upload source maps from CI, and **do not deploy them** (`sourcemap: 'hidden'`) or
  you're publishing your source.
- `tracesSampleRate` low (0.1), `replaysSessionSampleRate: 0` with
  `replaysOnErrorSampleRate: 1.0` — the free tier is ~5 k errors/mo and replay quota
  is separate and smaller.

**5.4 Uptime monitoring.** UptimeRobot on `/health/ready`, 5-min interval, email
alert. On Render free this doubles as a keep-warm ping — one service pinged
continuously is ~744 h/mo against a 750 h budget, so it fits, but only for one
service.

**5.5 Metrics (optional, learning-value).** `prom-client` → `/metrics`, scraped by
Grafana Cloud's free tier via Alloy. Default Node metrics plus request
duration/count by route and status. Register `/metrics` directly on the Express
instance so it bypasses rate limiting — toskie does exactly this, for the same reason.

**5.6 Web vitals.** `web-vitals` → GA4/PostHog. LCP on the homepage is going to be
ugly until Phase 7; measure it first so the improvement is visible.

---

### Phase 6 — Testing & code quality

_~3–4 days for meaningful coverage._

Zero tests today. Don't chase a coverage percentage — cover the paths where a bug
costs money or locks users out.

**6.1 Backend: Jest + supertest + `mongodb-memory-server`.** Priority order:

1. **Auth** — signup validation, duplicate email (2.3), login, `changePassword`,
   logout revocation.
2. **Refresh rotation (Phase 1)** — happy path, expired, revoked-token reuse triggers
   family revocation, two concurrent refreshes produce one winner.
   `toskie-backend/src/modules/admin-core/__tests__/admin-core-refresh-token.service.spec.ts`
   is a ready-made test list.
3. **Payments** — signature verification accepts valid and rejects tampered;
   enrolment is atomic; mail failure does not fail the payment (2.1, 2.2).
4. **Role guards** — Student cannot reach Instructor routes; guards return 403, not 401.
5. **Rate limits and OTP attempt capping.**

`mongodb-memory-server` can start a replica set (`ReplSet` mode), which you need for
the transaction tests.

**6.2 Frontend: Vitest + Testing Library.** Use **Vitest**, not Jest — this is a Vite
project and it reuses `vite.config.js`. Add `msw` to mock the API, and `vitest-axe`
for a11y assertions on the auth and checkout pages.
_(toskie-web runs `jest-axe`; a11y regressions are otherwise invisible until someone
complains.)_

**6.3 E2E: Playwright.** One spec covering the money path — signup → OTP → login →
browse catalog → add to cart → checkout (Razorpay test mode) → open the course →
mark a lecture complete. Run it in CI against the compose stack. This one test
catches more real breakage than fifty unit tests.

**6.4 husky + lint-staged.** You have prettier and eslint configured but nothing
enforcing them. ~20 minutes:

```jsonc
// package.json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"],
  "*.{json,md,css,yml}": ["prettier --write"]
}
```

`.husky/pre-commit`: `npx lint-staged && npm run type-check`
`.husky/commit-msg`: `npx commitlint --edit $1`

**6.5 Stronger lint.** Add `eslint-plugin-sonarjs` (catches genuine bug patterns, not
style) and `eslint-plugin-jsx-a11y`. Both are in toskie-web's config. Also
`eslint-plugin-security` on the server.

**6.6 Finish the TypeScript migration.** `.jsx` and `.tsx` are mixed with no rule
about which is which. Convert the rest — start with `App.jsx`, `Navbar.jsx`,
`Footer.jsx` and the `core/Dashboard/*` components, then turn on `strict` and
`noUncheckedIndexedAccess`.

---

### Phase 7 — Performance & frontend delivery

_~2 days. Highest user-visible payoff per hour spent._

**7.1 Route-level code splitting.** The single biggest win. `src/App.jsx` eagerly
imports ~25 route components:

```jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ViewCourse = lazy(() => import('./pages/ViewCourse'));
const AddCourse = lazy(() => import('./components/core/Dashboard/AddCourse'));
// … wrap <Routes> in <Suspense fallback={<RouteSkeleton />}>
```

Instructor-only code (Chart.js, the course builder) should never reach a student's
browser at all.

**7.2 Vendor chunking.** `build.rollupOptions.output.manualChunks` — split
`react`/`react-dom`, `@reduxjs/toolkit` + `react-redux`, `chart.js` +
`react-chartjs-2`, `swiper`, `react-player`. Cheap long-term caching: a React
upgrade shouldn't invalidate your app chunk.

**7.3 Fix `react-player`.** The build emits a chunk per provider — DailyMotion,
Kaltura, Mixcloud, SoundCloud, Streamable, Mux, Facebook, Preview — none of which
this app uses. Import the specific player, or move to a lighter alternative.

**7.4 Images.** `src/assets/Images` is 5.2 MB of unoptimized PNG
(`TimelineImage.png` 572 KB, `Instructor.png` 414 KB, `FoundingStory.png` 176 KB).
Convert to WebP/AVIF with PNG fallback (`vite-plugin-image-optimizer`), add explicit
`width`/`height` to stop layout shift, and `loading="lazy"` below the fold. Expect a
3–4 MB reduction.

**7.5 Move `banner.mp4` out of the bundle.** It's in `src/assets/Images/` and
therefore in your build output. You already pay for Cloudinary — serve it from there
with a poster image and `preload="none"`.

**7.6 Error boundary.** A top-level one plus per-route boundaries, so one broken
dashboard widget doesn't blank the page. Wire it to Sentry (5.3).

**7.7 `rollup-plugin-visualizer`.** Generate a treemap in CI and attach it to the PR.
You cannot fix 8.5 MB you can't see.

**7.8 Lighthouse CI.** `treosh/lighthouse-ci-action` on PRs with a performance budget
that fails the build on regression. Free.

**7.9 Cache headers + preconnect.** Vite content-hashes assets already — set
`Cache-Control: public, max-age=31536000, immutable` on `/assets/*` and `no-cache` on
`index.html` via `_headers` (Cloudflare Pages). Add `<link rel="preconnect">` for the
API origin, Cloudinary and Razorpay.

---

### Phase 8 — Analytics (GTM / GA4 / product analytics)

_~2 days._

There is no analytics of any kind today. The architecture that matters is _one choke
point and a typed vocabulary_ — without those, tracking rots within a month and
nobody trusts the dashboards.

**8.1 GTM container + dataLayer choke point.** Port `one-cx/src/lib/gtm/gtm.ts`:

```ts
// src/lib/analytics/dataLayer.ts — the ONLY place anything is pushed
export function pushEvent(event: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}
```

GA4 then rides on GTM at zero code cost, and marketing can add tags without a deploy.

**8.2 A typed event vocabulary.** This is the part that makes it durable. Port the
shape of `toskie-web/src/lib/analytics/events.ts`:

```ts
export const EVENTS = {
  SIGN_UP_STARTED: 'sign_up_started',
  OTP_REQUESTED: 'otp_requested',
  SIGN_UP_COMPLETED: 'sign_up_completed',
  LOGIN_COMPLETED: 'login_completed',
  COURSE_VIEWED: 'course_viewed',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  LECTURE_STARTED: 'lecture_started',
  LECTURE_COMPLETED: 'lecture_completed',
  COURSE_COMPLETED: 'course_completed',
  REVIEW_SUBMITTED: 'review_submitted',
  // instructor side
  COURSE_CREATED: 'course_created',
  COURSE_PUBLISHED: 'course_published',
} as const;

// payload typed per event — a misspelled name or a drifted property
// becomes a build error rather than a silently-wrong report
export interface EventProperties {
  /* … */
}
export function trackEvent<E extends EventName>(n: E, p: EventProperties[E]): void;
```

Event names are case-sensitive and cannot be renamed after the fact in most tools. A
typo ships permanently. Make it a compile error.

**8.3 Product analytics: PostHog.** Free tier covers ~1M events/mo _and_ includes
funnels, retention, session replay and feature flags — one vendor instead of four.
Self-hosted RudderStack is the alternative if you specifically want the CDP
experience on your CV; it is more infrastructure than this app justifies, and on free
hosting you'd be running it on the Oracle VM.

**8.4 First-touch attribution.** Port `toskie-web/src/lib/analytics/attribution.ts`.
UTM parameters and the landing referrer are only readable on the _first_ page of a
session — after one client-side navigation they're gone and unrecoverable. Capture
into `sessionStorage` once, register as super-properties.

**8.5 Identity.** `identify()` on login with `accountType`, enrolled-course count,
signup date. `reset()` on logout, or the next anonymous visitor on that browser
inherits the previous user's identity.

**8.6 Gate it.** `VITE_ENABLE_ANALYTICS` **plus** a production-hostname check —
one-cx gates on the live hostname specifically so a staging build that inherits the
prod env still can't emit events. Staging traffic in production funnels is worse than
no analytics.

**8.7 Ecommerce events.** `purchase` with `value`, `currency: 'INR'` and `items[]` in
GA4's schema — it's the one event with real reporting built on top of it.

**8.8 Consent.** If you have any EU traffic you need a consent banner gating
non-essential tags. GTM's Consent Mode handles this; `klaro` and `cookieconsent` are
free.

**8.9 Write the tracking plan down.** A table in `docs/ANALYTICS.md`: event, when it
fires, properties, which question it answers. Any event that can't name the question
it answers should not be shipped. toskie-web keeps this in `AGENTS.md` with a
mandatory pre-flight checklist.

---

### Phase 9 — Kubernetes

_~3–5 days. Be honest with yourself about why._

**This app does not need Kubernetes.** One Express process against Atlas serves this
load with room to spare, and K8s adds a control plane, an ingress, secret management
and a GitOps loop to operate. Do it because you asked for it and because it is the
most valuable single thing on this list for your CV — not because the app is
straining.

**9.1 Where it can actually run free:**

| Option                            | Notes                                                                                                                                     |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **k3d / kind**, local             | Free, instant, perfect for writing and testing manifests. Start here.                                                                     |
| **Oracle OKE** on Always Free ARM | Control plane free, worker nodes on Always Free shapes. The only genuinely free _real_ cluster. ARM capacity is often unavailable; retry. |
| **k3s** on one Always Free ARM VM | Simpler than OKE, one node, bundled Traefik + local-path storage. 4 cores / 24 GB is generous for this.                                   |

Civo, DigitalOcean and Linode have no free tier. GKE gives one free zonal control
plane but you still pay for nodes.

**9.2 Manifests** (`k8s/base/`), leaning on what earlier phases built:

- `Deployment` for the API — `replicas: 2`, `resources.requests/limits`,
  `securityContext: { runAsNonRoot: true, readOnlyRootFilesystem: true }`.
- **Probes pointing at Phase 5.1's endpoints:** `livenessProbe` → `/health` (shallow,
  so a Mongo blip can't restart-loop you), `readinessProbe` → `/health/ready` (deep,
  so traffic is withheld while a dependency is down). This is precisely why liveness
  was built shallow.
- `Service` (ClusterIP) + `Ingress` (Traefik on k3s, or nginx-ingress).
- `ConfigMap` for non-secrets; `Secret` for the rest — **sealed-secrets** or **SOPS**
  so encrypted secrets can live in git. A plain `Secret` manifest is base64, not
  encryption; do not commit one.
- `HorizontalPodAutoscaler` on CPU, `PodDisruptionBudget` `minAvailable: 1` so a node
  drain doesn't take the API down.
- `cert-manager` + Let's Encrypt for free TLS.
- **Stateful services stay managed.** Mongo on Atlas, Redis on Upstash or a
  single-node container. Do not self-host a database you care about on a free box
  with no backups.

**9.3 Kustomize overlays,** not Helm, to start: `base/` + `overlays/staging/` +
`overlays/production/`, differing only in replica count, resources and image tag.
Write the Helm chart afterwards as a second exercise — you'll appreciate what it does
once you've felt the thing it replaces.

**9.4 GitOps with ArgoCD** (free, open source). This is the part that impresses: CI
builds the image → pushes GHCR → bumps the tag in the overlay → ArgoCD notices and
syncs. Deployment becomes a git commit; drift is detected and reverted; the cluster's
desired state is reviewable in a PR.

**9.5 If you want the full stack:** `Trivy` image scanning in CI, network policies
(default-deny, then allow), a ServiceMonitor for Prometheus, and `k6` for load testing
so the HPA has something to react to.

---

### Phase 10 — Data & operations

_~1.5 days. Unglamorous; this is what saves you at 2 a.m._

**10.1 Migrations.** `migrate-mongo`. Mongoose is schemaless from the database's point
of view, so index and shape changes currently have _no_ mechanism at all —
`User.email`'s unique index (2.3) is migration #1.

Run migrations from the container entrypoint (one-cx's pattern — the release can never
serve traffic against an older schema) or as a strict CI step before the restart
(toskie's). Either way: **strict**. A failed migration must stop the deploy.

**10.2 Index audit.** Beyond `User.email`: `Course.status`, `Course.instructor`,
`RatingAndReview.course`, `CourseProgress.{userId,courseID}` (compound),
`RefreshToken.tokenHash` (unique) and `RefreshToken.expiresAt` (TTL). On Atlas M0's
shared CPU, a missing index is felt immediately.

**10.3 Backups — a real gap on the free tier.** **Atlas M0 has no automated backups.**
A bad migration or a wrong `deleteMany` is unrecoverable today.

```yaml
# .github/workflows/backup.yml — daily
# mongodump --uri=$ATLAS_URI --archive --gzip
#   → upload to Cloudflare R2 (10 GB free, no egress fees)
#   → prune anything older than 30 days
```

And borrow toskie's paranoia: **assert the dump is larger than a floor** before
declaring success. Their prod deploy aborts if the backup is under 100 KB, because
that signature once meant `pg_dump` had been pointed at the wrong (empty) database and
"backup succeeded" was a lie.

Then — actually restore one, into a scratch database, once. An untested backup is a
hypothesis.

**10.4 Seed script.** `npm run seed` producing categories, an instructor, a student and
two published courses. Makes local dev, E2E tests and demos reproducible.

**10.5 Runbook** (`docs/RUNBOOK.md`): how to roll back, how to restore a backup, how to
rotate `JWT_SECRET` (and that doing so invalidates every session — which is sometimes
exactly what you want), what each alert means and what to do about it.

---

### Phase 11 — Documentation & repo hygiene

_~1 day. Cheap, and it's what a reviewer sees first._

- **README rewrite.** The current one is a feature list — good for a demo, not for a
  contributor. Add: architecture diagram, `docker compose up` quickstart, an env
  variable table, the branch/deploy model, and a link to this plan.
- `server/.env.example` (missing entirely).
- `CONTRIBUTING.md`, `SECURITY.md`, PR + issue templates, `CODEOWNERS`.
- **`docs/adr/`** — one short file per significant decision. You already write
  excellent _why_ comments (`authCookie.js`, `axiosClient.ts`, `middlewares/auth.js`);
  ADRs are the same instinct at architecture scale. Start with: why httpOnly cookies
  over localStorage; why Redux _and_ Zustand _and_ React Query; why Mongo over Postgres.
- **API documentation.** OpenAPI 3 spec + Swagger UI, or a Bruno/Hoppscotch collection
  in the repo. There is no API reference today.
- `CHANGELOG.md` via `release-please`, which also produces the tags that trigger
  `deploy-prod.yml`.
- Consider a `CLAUDE.md`/`AGENTS.md` at the root capturing the conventions — the
  reference repos all have one and it measurably improves agent-assisted work.

---

## 5. Suggested order

Dependencies matter more than priority. Health endpoints (5.1) gate the deploy
health-poll (4.2) _and_ the K8s probes (9.2). Docker (3) gates K8s (9). Tests (6)
should exist before CI (4) has something to enforce.

| Order | Phase                                 | Why here                                          | Effort |
| ----- | ------------------------------------- | ------------------------------------------------- | ------ |
| 1     | **0 — Security & defects**            | Never host the §2 list publicly                   | 2–3 d  |
| 2     | **5.1–5.2 — Health + logging**        | Everything downstream depends on these            | 0.5 d  |
| 3     | **1 — Refresh tokens**                | Biggest UX fix; you named it first                | 2 d    |
| 4     | **3 — Docker + compose**              | Makes local == CI == prod                         | 1.5 d  |
| 5     | **6.1 / 6.4 — Tests + hooks**         | CI needs something to run                         | 2 d    |
| 6     | **4 — CI/CD**                         | Every later change is then verified automatically | 2–3 d  |
| 7     | **2 — Redis**                         | Rate limits + OTP + cache                         | 2 d    |
| 8     | **7 — Performance**                   | Fast, visible, demo-able                          | 2 d    |
| 9     | **5.3–5.6 — Sentry, uptime, metrics** | Now you can see production                        | 1.5 d  |
| 10    | **10 — Migrations + backups**         | Before the data matters                           | 1.5 d  |
| 11    | **8 — Analytics**                     | Needs stable prod + real traffic                  | 2 d    |
| 12    | **6.2 / 6.3 — Vitest + Playwright**   | Broaden coverage                                  | 2 d    |
| 13    | **9 — Kubernetes**                    | Everything it needs now exists                    | 3–5 d  |
| 14    | **11 — Docs**                         | Continuously; finished here                       | 1 d    |

Roughly 25–30 focused days. Phases 1–6 (~10 days) capture most of the real value; the
rest is depth and demonstrable range.

**One branch per phase**, matching your existing `feature/*` + PR-to-`develop` habit.
Each phase should land green.

---

## 6. Deliberately out of scope

Saying no is part of a plan:

- **Microservices.** A single Express app is correct at this size. Splitting it buys
  distributed-transaction problems and nothing else.
- **Kafka / RabbitMQ.** Redis (or the Mongo outbox) covers every queueing need here.
  toskie-backend runs RabbitMQ because it has genuine cross-service fan-out; you don't.
- **Self-hosted Mongo or Postgres.** Atlas M0 is free, backed up by someone else's
  on-call, and already a replica set. Self-hosting on a free VM means you own
  durability with no backups — strictly worse.
- **Multi-region / CDN for the API.** Cloudflare Pages already CDNs the SPA. The API is
  one region; that's right until you have users elsewhere.
- **Service mesh (Istio/Linkerd).** Real operational cost, zero benefit at two pods.
- **Terraform.** Arguable. For a single free VM it's overhead — but if the goal is the
  skill, a small module for the Oracle VM + OKE cluster is a reasonable Phase 9 add-on.
  Do it for the learning, not the need.
- **Switching off MERN.** The stack is fine. Every problem in §1 and §2 is a gap in
  _practice_, not in technology choice.

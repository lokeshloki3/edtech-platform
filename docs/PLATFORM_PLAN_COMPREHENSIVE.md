# StudySphere — Production-Readiness & Platform Plan

> Written for: you, working in this repo. Not a team-facing doc.
>
> Constraint assumed throughout: **everything runs on free tiers.** Where a free
> tier changes the right answer, that is called out rather than hidden.
>
> Source repos swept for patterns: **toskie-backend** (NestJS/GraphQL),
> **toskie-web** (Next.js), **toskie-admin** (Next.js admin console), **one-cx**
> (Next.js + Strapi + RAG chatbot). Every borrowed pattern names its origin file
> so you can go read the original — those repos' comments explain the _why_
> better than any summary.

---

## 0. How to read this

The project works. Nothing below says otherwise. This is the gap between _a
working app_ and _an app that can be operated, found, measured and extended_ —
the gap the four reference repos have already crossed.

| §                            | What it is                                                     |
| ---------------------------- | -------------------------------------------------------------- |
| **1** Audit                  | What you have; what the reference repos have that you don't    |
| **2** Defects                | Specific bugs found while reading, with evidence               |
| **3** The structural finding | The one architectural decision that constrains everything else |
| **4** Target architecture    | Free-tier topology and the limits that actually bite           |
| **5** The plan               | 18 phases: what, why, how, source pattern                      |
| **6** Sequencing             | Dependency order, not priority order                           |
| **7** Out of scope           | Deliberate noes                                                |
| **8** Pattern catalog        | Every pattern → its source file → does it apply here           |

Effort figures assume one person who already knows this codebase.

---

## 1. Audit

### 1.1 Frontend (`src/`, Vite + React 19)

Stack: Vite 6, React 19, TypeScript (partial), Tailwind 4, React Router 7, Redux
Toolkit (3 slices) **+** Zustand (auth) **+** TanStack Query, react-hook-form +
Zod, axios.

**Already good — don't undo:**

- [src/lib/axiosClient.ts](../src/lib/axiosClient.ts) — one client,
  `withCredentials`, a 401 interceptor that only bounces on protected paths, and
  a `CREDENTIAL_CHECK_PATHS` carve-out so a wrong password isn't treated as an
  expired session. The comments explain _why_, which is rare.
- [src/providers/query-provider.tsx](../src/providers/query-provider.tsx) — sane
  `staleTime`/`gcTime`, `retryUnlessAuth` so auth failures don't retry 3×.
- [src/providers/auth-initializer.tsx](../src/providers/auth-initializer.tsx) —
  query cache mirrored into the store, `queryFn` kept side-effect free, and a
  deliberate distinction between "anonymous visitor" (silent) and "couldn't reach
  the server" (toast).
- Zod schemas in `src/zod-validations/`, typed services in `src/services/`, hooks
  in `src/hooks/use-*-query.ts`. This is a clean, conventional shape.
- Staging `noindex` plumbing in [vite.config.js](../vite.config.js) +
  `src/lib/seo/robots.js`, including the non-JS-crawler case. Genuinely thoughtful.
- `react-markdown` is used **without** `rehype-raw`, so instructor-authored course
  descriptions cannot inject HTML. That is the safe default — see 2.14 for the
  trap to avoid.

**Gaps:**

- **No route-level code splitting.** [src/App.jsx](../src/App.jsx) eagerly imports
  ~25 route components. Every visitor downloads the instructor dashboard, Chart.js,
  react-player and Swiper before the homepage paints.
- **No error boundary anywhere.** `grep -rn "ErrorBoundary\|componentDidCatch" src`
  returns nothing. One render-time throw blanks the app.
- **No tests.** Not one test file.
- **Bundle is 8.5 MB.** `TimelineImage.png` 572 KB, `Instructor.png` 414 KB, all
  unoptimized PNG; `banner.mp4` is bundled rather than CDN'd; `react-player` v2
  emits a chunk per provider (DailyMotion, Kaltura, Mixcloud, SoundCloud,
  Streamable, Mux, Facebook) none of which this app uses.
- **One `<title>` for the entire site.** [index.html](../index.html) has no
  description, no canonical, no Open Graph, no `theme-color`. See §3 — this is the
  single largest missed opportunity in the project.
- **`public/` contains one file** (`vite.svg`). No favicon set, no OG image, no
  web manifest, no `robots.txt` committed (it's plugin-generated), no sitemap.
- **Route authorization is rendering-time.** `App.jsx` conditionally _renders_
  routes based on `user?.accountType`, so a wrong-role user gets a 404 rather than
  a 403, and adding a role means editing the router.
- **Mixed `.jsx` / `.tsx`** with no rule about which is which.
- **Three state systems** (Redux / Zustand / React Query) with nothing documenting
  which to reach for.

### 1.2 Backend (`server/`, Express 4 + Mongoose)

**Already good:**

- `server/config/authCookie.js` — cookie TTL and JWT TTL owned in one place, with
  the drift bug that caused it documented. Exactly the right instinct.
- `server/middlewares/auth.js` — cookie-only credential, no bearer fallback; role
  guards correctly return **403**, not 401.
- `server/controllers/Auth.js` — `accountType` allowlisted rather than trusted;
  password hash stripped from responses; emails normalised.
- Razorpay signature **is** HMAC-verified in `verifyPayment`.
- CORS origins are an explicit env-driven allowlist, not `*`.

**Gaps:**

| Gap                        | Evidence                                                                 |
| -------------------------- | ------------------------------------------------------------------------ |
| No rate limiting           | `/auth/sendotp`, `/auth/login`, `/auth/reset-password-token` unthrottled |
| No security headers        | no `helmet`, no CSP, no HSTS                                             |
| No global error handler    | an async throw outside a `try` takes the process down                    |
| No health endpoint         | `/` returns 200 unconditionally — it cannot fail, so it proves nothing   |
| No structured logging      | every `console.log` is commented out; nothing replaced them              |
| No index on `User.email`   | `grep -n "unique" server/models/*.js` returns nothing                    |
| No refresh token           | 2-hour absolute session, then a hard 401                                 |
| No migrations              | index/schema changes have no mechanism                                   |
| No API contract            | no OpenAPI, no generated client, no shared validation with the frontend  |
| No tests, no Docker, no CI | there is no `.github/` directory at all                                  |
| No admin surface           | README: _"Create Admin account via backend (Postman)"_                   |
| Secrets undocumented       | `server/.env` exists; `server/.env.example` does not                     |

### 1.3 Pattern inventory — what the four reference repos have

This is the full sweep, grouped by theme. §8 maps each one to its source file and
whether it applies here.

**Auth & session** — refresh-token rotation with reuse detection and family
revocation (toskie-backend); single-flight refresh + retry-once interceptors
(toskie-web, toskie-admin); non-destructive refresh failure; BFF routes so cookies
never touch client JS; edge middleware route gating (toskie-admin); route policy
as data with validated redirect targets (toskie-web); canonical error-code taxonomy
mapped to user copy (toskie-admin); permission-driven navigation and a
`useHasPermission` hook; Redis-cached permission lookups; admin JWT secret asserted
distinct from the user JWT secret at boot.

**Infrastructure** — multi-stage Docker with non-root users and a migrating
entrypoint (one-cx); docker-compose with Postgres/Mongo/Redis and healthchecks
(toskie-backend); GHCR image builds; Coolify webhook deploys; PM2 ecosystem config
with its failure modes documented; branch→environment mapping (develop→staging,
release→UAT, main→prod); artifact-based deploys rather than git-pull-on-box;
`startOrReload` rather than delete+start.

**CI/CD** — schema-provisioned-from-zero CI (toskie-backend); pre-flight secret
verification that detects the Variables-vs-Secrets mix-up (one-cx); free manual
approval gate via `trstringer/manual-approval`; strict migrations that abort the
deploy; health-**polled** verification rather than `sleep && curl`; auto-rollback;
Teams/Slack notification steps; `workflow_dispatch` as an incident fallback;
Dependabot deliberately disabled with reasons.

**Observability** — shallow `/health` + deep `/health/ready` with per-check
timeouts and a short response cache; Prometheus `/metrics` registered outside the
guard chain; Grafana Cloud + Alloy (which superseded a self-hosted
Prometheus/Loki/Promtail stack); CloudWatch agent config; disk alarms; PM2 log
rotation (an unrotated log family once filled a disk and silently killed OTP
delivery).

**SEO & discoverability** — `robots.ts` with an explicit disallow list;
database-driven `sitemap.ts` with a stated bar for inclusion; JSON-LD for Person,
Service, Breadcrumb, Organization and AggregateRating with the schema.org
placement rules respected; meta-description normalisation with length clamping and
a minimum-quality threshold; programmatic skill × city × area landing pages with a
thin-content indexing gate and a global launch flag; hreflang + self-referential
canonicals + region prefixes (one-cx); 307-vs-308 redirect discipline; a
human-readable sitemap page as an internal linking hub.

**Analytics** — GTM dataLayer choke point with per-domain typed event helpers
(one-cx); a typed event vocabulary where a misspelled event is a build error
(toskie-web); first-touch UTM attribution; a first-party reverse proxy for the
analytics data plane to defeat ad blockers, with the `/sourceConfig` control-plane
split that silently kills all events if you get it wrong; a Mixpanel Lexicon upload
script so the data dictionary lives next to the code; scroll-depth and engagement
tracking hooks; LogRocket session replay; Statsig feature flags.

**Quality** — husky + lint-staged running eslint, prettier and `--findRelatedTests`;
`commitlint`; `jest-axe` accessibility assertions; `eslint-plugin-sonarjs` plus a
self-contained "sonar-check" skill that produces a tiered Markdown report with no
SonarQube server; GraphQL codegen with `codegen:check` wired into `validate` so
schema drift is a build failure; a full enterprise security audit report with
severity tiers and a "refuted by verifiers" section (one-cx).

**Product & data** — per-version human-readable release notes (toskie-web ships
v1.0.0 → v1.11.0); ADR-style plans/specs folders; FCM web push with a service
worker whose deep-link switch mirrors the app's; socket.io managers for calls and
notifications; `.well-known` deep-link files with forced Content-Type; Postgres
advisory locks to serialise a cron crawl against an admin button; per-query CMS
fallbacks so one unreachable service degrades instead of 500ing every page; a
pgvector RAG chatbot with a daily token budget; AI writer services with per-task
rate limits; data masking and DPDP privacy specs.

---

## 2. Defects found while reading

Specific, evidenced, and worth fixing regardless of the rest of the plan.

**2.1 — Double HTTP response in the payment flow.**
`server/controllers/Payments.js`: `enrollStudent(courses, userId, res)` writes
responses itself (`res.status(400)`, `res.status(500)`), and `verifyPayment` then
does `return res.status(200).json(...)` unconditionally after awaiting it. On an
error branch the second write throws `ERR_HTTP_HEADERS_SENT` — an unhandled
rejection, given 2.4.
_Fix:_ have `enrollStudent` return a result; the controller owns the one response.

**2.2 — Payment enrollment is not atomic.**
The same loop enrols course-by-course and returns 500 on the first mail failure. A
two-course cart can end with course 1 enrolled, course 2 not, and the student told
the payment failed — after Razorpay captured. Mail is in the same `try` as
enrolment, so a provider hiccup fails a successful payment.
_Fix:_ enrol in a transaction; queue mail separately (Phase 2). Never let mail
failure roll back money.

**2.3 — `User.email` has no unique index.**
`server/models/User.js` — `required` and `trim`, not `unique`. Signup is
`findOne`-then-`create`: two concurrent signups on one address both pass. Every
login is also a collection scan.

**2.4 — No global error handler.**
`server/index.js` mounts routes and listens. Express 4 doesn't catch rejected
promises in async handlers; anything thrown outside a controller's `try` becomes an
unhandled rejection, which on Node 20+ terminates the process.

**2.5 — Password-reset token stored in plaintext.**
`server/controllers/ResetPassword.js` writes `crypto.randomBytes(20).toString('hex')`
straight into `User.token`. Database read access = account takeover for anyone with
a live reset.
_Fix:_ store `sha256(token)`; compare hashes.

**2.6 — OTP is brute-forceable.**
6 numeric digits, 5-minute window, plaintext in the `OTP` collection, **no attempt
counter and no send throttle**. Nothing stops mass guessing, and nothing stops
`/sendotp` being used as an email bomb against a third party — which also burns
your free mail quota.

**2.7 — Account enumeration.**
Login: "User is not registered, please signup first". Reset: "Your email: x is not
registered with us". `/sendotp`: 409 "User already registered". Together they
confirm which addresses hold accounts.

**2.8 — CSRF is open in production.**
`getAuthCookieOptions()` sets `sameSite: 'none'` in prod because the SPA and API are
different sites, so the browser attaches the session cookie to cross-site POSTs and
every state-changing route is reachable from any page the user visits.
_Fix:_ Phase 0.4 — and the fix is free, see §4.1.

**2.9 — Razorpay receipt IDs can collide.**
`receipt: Math.random(Date.now()).toString()` — `Math.random()` ignores its
argument. Razorpay treats `receipt` as your idempotency handle.
_Fix:_ `crypto.randomUUID()`.

**2.10 — Mail sent from a Mongoose pre-save hook.**
`server/models/OTP.js` sends inside `pre('save')`. The request blocks on SMTP, a
mail failure aborts the save (so a slow provider looks like a database error), and
the model can't be tested without a mail server.

**2.11 — `nodemon` is a production dependency.**
`server/package.json` lists it under `dependencies`.

**2.12 — Unvalidated post-login redirect target.**
`src/components/core/Auth/LoginForm.tsx:29` does
`navigate(searchParams.get('from') ?? '/dashboard/my-profile')` with no validation,
and `from` is attacker-controllable via a crafted `/login?from=…` link.
React Router's `navigate()` treats a string as a path, so an absolute or
protocol-relative URL does **not** currently escape the origin — this is contained,
not exploited. But it is one refactor to `window.location.href = from` away from a
real open redirect, and today it will still bounce a user to any internal route an
attacker names.
_Fix:_ port toskie-web's `resolveSurveyRedirectPath` — validate the target against
an allowlist of prefixes and fall back to a safe default.

**2.13 — The inactive-user cron has no lock.**
`server/jobs/deleteInactiveUsers.js` runs on a `node-cron` schedule with no mutual
exclusion. One instance today, so it's latent — but it becomes a double-delete the
moment you run two replicas (Phase 15) or the scheduled Action (Phase 5.5) overlaps
a manual run.
_Fix:_ Redis `SET NX EX`, or a `locks` collection with a unique index and a TTL.
one-cx solves the identical problem with a Postgres advisory lock.

**2.14 — A trap to not walk into.**
`react-markdown` currently renders instructor-authored course descriptions
**safely**, because raw HTML is disabled by default. If anyone ever adds
`rehype-raw` to get richer formatting, that becomes stored XSS executing in a
logged-in student's session. one-cx shipped exactly this bug (audit finding M12:
_stored XSS via CMS `code` block containing "iframe"_). If you need rich text,
sanitize with `rehype-sanitize` — don't just enable raw.

---

## 3. The structural finding: this app is invisible to search

Everything in §2 is a bug. This is a decision, and it's the one that constrains the
most.

StudySphere is a **course marketplace**. For a course marketplace, the course
detail pages _are_ the product's organic surface — they're what ranks, what gets
shared, and what brings students who aren't already looking for you. Google's
`Course` structured data is a first-class rich result with its own carousel
treatment in search.

Right now:

- [index.html](../index.html) declares one `<title>` — "StudySphere" — and no meta
  description, for every URL in the app.
- There is no sitemap, no canonical tags, no Open Graph, no JSON-LD.
- Every page is client-rendered. A crawler that doesn't execute JavaScript sees an
  empty `<div id="root">`.
- Sharing a course link to WhatsApp or LinkedIn produces a blank card.

Compare toskie-web: a database-driven `sitemap.ts`, per-route `generateMetadata`,
`Person`/`Service`/`Breadcrumb` JSON-LD, and 76 programmatically generated skill ×
city landing pages gated on a talent-count threshold. That's a deliberate organic
acquisition channel. StudySphere has none.

**Three ways out, in increasing order of cost:**

| Option                                           | Gets you                                                                                  | Cost                                                           |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **A. `react-helmet-async` + prerender at build** | Per-route titles/descriptions/OG/JSON-LD; static routes prerendered                       | ~1 day. Course pages stay dynamic → still weak.                |
| **B. Prerender middleware at the edge**          | Cloudflare Worker detects crawlers, serves a cached rendered snapshot                     | ~2 days. Works, but it's a workaround with a cache to operate. |
| **C. Migrate the public surface to Next.js**     | Real SSR/ISR for home, catalog and course pages; the toskie-web playbook applies verbatim | ~1–2 weeks. Dashboard can stay a client-only island.           |

**My recommendation: A now, C when you're ready.** Do option A in Phase 9 — it's a
day, it fixes social sharing immediately, and it makes every later step cheaper.
Then treat C as its own project: move only `/`, `/catalog/:category` and
`/courses/:courseId` to Next.js App Router. Those three routes are ~100% of your
organic value, and the authenticated dashboard genuinely doesn't need SSR. You've
already got two Next.js reference repos to copy conventions from.

Option B is the right call only if you're certain you'll never migrate.

---

## 4. Target architecture — free tier

### 4.1 Topology (and the free CSRF fix)

The important change from the obvious design: **put the API behind the same origin
as the SPA.** Cloudflare Pages Functions (or a `_worker.js`) can proxy `/api/*` to
the backend. That single move:

- makes the session cookie **same-site**, so `sameSite: 'lax'` works and §2.8's
  CSRF hole closes — with no domain purchase;
- removes CORS entirely (no allowlist to maintain, no preflight);
- hides the backend origin from the browser;
- gives you toskie-web's BFF benefits without a BFF framework.

```
                       ┌────────────────────────────────────┐
  Browser  ──────────▶ │  Cloudflare Pages                  │  free, unlimited bandwidth
                       │  ├── /            → SPA (static)   │
                       │  └── /api/*       → proxy ──┐      │  same-origin ⇒ SameSite=Lax
                       └─────────────────────────────┼──────┘
                                                     ▼
                                     ┌───────────────────────────┐
                                     │  API — Express container  │  Cloud Run (scale-to-zero)
                                     └──┬──────────┬─────────┬───┘
                                        │          │         │
                         ┌──────────────▼┐  ┌──────▼──┐  ┌───▼──────────┐
                         │ MongoDB Atlas │  │ Upstash │  │  Cloudinary  │
                         │   M0 (free)   │  │  Redis  │  │    (free)    │
                         └───────────────┘  └─────────┘  └──────────────┘

  GitHub Actions ─▶ test ─▶ GHCR image ─▶ deploy ─▶ health poll ─▶ notify
  Scheduled Action ─▶ POST /internal/jobs/prune-users   (replaces node-cron)
  Scheduled Action ─▶ mongodump ─▶ Cloudflare R2        (Atlas M0 has no backups)
  Scheduled Action ─▶ ping /health/ready                (uptime + keep-warm)
```

### 4.2 Platform choices, with the limits that bite

Free tiers change. Verify current numbers; the _shape_ of the advice holds.

| Need                | Pick                             | Free-tier reality                                                                                                                                   |
| ------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| SPA + edge proxy    | **Cloudflare Pages + Functions** | Unlimited bandwidth, ~500 builds/mo, 100k function invocations/day. The proxy in §4.1 is what makes this the right pick over Vercel/Netlify.        |
| API hosting         | **Google Cloud Run**             | ~2M requests/mo always-free, scales to zero, takes a container directly. Cold start ~1–2 s. Needs a billing account attached but stays free.        |
| API alt. (simplest) | **Render** free web service      | 512 MB, **spins down after 15 min idle** → ~50 s cold start, and `node-cron` never fires. 750 instance-hours/mo ≈ one service running continuously. |
| API alt. (control)  | **Oracle Cloud Always Free**     | 4 ARM cores / 24 GB RAM, always free, a real VM — this is what makes Phase 15 possible. ARM capacity is often unavailable; plan for retries.        |
| Database            | **MongoDB Atlas M0**             | 512 MB shared. **No automated backups** (Phase 16.3). It _is_ a replica set, so transactions work — which Phase 1 needs.                            |
| Redis               | **Upstash**                      | Command-metered. Fine for rate limiting, OTP, caching, locks. **Not** fine for BullMQ — blocking reads burn the quota. See Phase 2.5.               |
| Registry            | **GHCR**                         | Free for public images.                                                                                                                             |
| CI                  | **GitHub Actions**               | Unlimited minutes on public repos; ~2000 min/mo private.                                                                                            |
| Errors              | **Sentry**                       | ~5 k errors/mo, 1 user.                                                                                                                             |
| Metrics / logs      | **Grafana Cloud**                | ~10 k series, ~50 GB logs, 14-day retention.                                                                                                        |
| Uptime              | **UptimeRobot**                  | 50 monitors, 5-min interval. Doubles as keep-warm on Render.                                                                                        |
| Object storage      | **Cloudflare R2**                | 10 GB, no egress fees. For database dumps.                                                                                                          |
| Email               | **Brevo** (300/day) / **Resend** | Gmail SMTP will rate-limit and eventually flag you. Move off it.                                                                                    |
| Product analytics   | **PostHog Cloud**                | ~1M events/mo — events, funnels, session replay _and_ feature flags in one free tier.                                                               |
| Web analytics       | **GA4 via GTM**                  | Free.                                                                                                                                               |
| Push notifications  | **Firebase Cloud Messaging**     | Free, unlimited. Phase 12.                                                                                                                          |
| LLM (Phase 14)      | **Google Gemini** free tier      | Generous free quota. Groq and Cerebras also have free inference tiers. OpenAI does not.                                                             |

### 4.3 Environments

| Env            | Trigger           | Frontend                           | API             | Data                                       |
| -------------- | ----------------- | ---------------------------------- | --------------- | ------------------------------------------ |
| **local**      | —                 | `vite` :5173                       | `nodemon` :4000 | docker-compose (Mongo replica set + Redis) |
| **staging**    | push to `develop` | Pages preview, `VITE_STAGING=true` | GHCR `:develop` | separate Atlas DB + Upstash DB             |
| **production** | tag `v*.*.*`      | Pages production                   | GHCR `:vX.Y.Z`  | production Atlas + Upstash                 |

Staging must be a **separate database**, not a separate collection.

---

## 5. The plan

---

### Phase 0 — Security & correctness hardening

_Before anything is publicly hosted. ~2–3 days._

**0.1 Fix §2.** Start with 2.1, 2.3, 2.4, 2.5, 2.9, 2.12 — each under an hour.

**0.2 Rate limiting.** `express-rate-limit` (Redis store in Phase 2.1):

```js
// server/middlewares/rateLimit.js
const strict = { windowMs: 15 * 60_000, limit: 5 }; // login, reset-password-token
const otp = { windowMs: 60 * 60_000, limit: 3 }; // sendotp — per email AND per IP
const general = { windowMs: 15 * 60_000, limit: 300 };
```

Key OTP limits on **both** IP and target email, or an attacker rotates IPs to bomb
one inbox.

> one-cx's `src/lib/http/rateLimit.ts` carries the lesson in its header: every
> limit there used to be keyed on a **client-supplied session id**, which is not a
> rate limit at all — rotate the id and every request lands in a fresh bucket. For
> their chat endpoint that meant unmetered access to a paid LLM. Key on something
> the client cannot choose.

**0.3 Security headers.** `helmet()` with a real CSP. Start report-only, read the
reports, then enforce. Allowlist Razorpay checkout, Cloudinary, GTM (Phase 10).

**0.4 Close the CSRF hole (2.8)** via the same-origin proxy in §4.1, then flip the
cookie to `sameSite: 'lax'`. If you keep the split-origin setup instead, you need a
double-submit token (`csrf-csrf`) **and** an `Origin`/`Referer` check on every
state-changing method.

**0.5 `app.set('trust proxy', 1)`.** Every free host puts a proxy in front; without
this `req.ip` is the proxy's address and every anonymous caller shares one
rate-limit bucket. Use `1`, not `true` — `true` trusts the whole client-controlled
`X-Forwarded-For` chain and lets anyone reset their own bucket.
_(The comment block in `toskie-backend/src/main.ts` explains this better than most
docs.)_

**0.6 Body and upload limits.** `express.json({ limit: '100kb' })` and
`express-fileupload({ limits: { fileSize: 50 * 1024 * 1024 }, abortOnLimit: true })`.
There is no upload ceiling today — a disk-fill vector on a 512 MB box, and one-cx's
audit finding H7 verbatim.

**0.7 Boot-time config assertions.** Refuse to start on missing or unsafe config:
required keys present; `JWT_SECRET` ≥ 32 chars and not the example value;
`NODE_ENV === 'production'` implies no localhost in `CORS_ORIGINS`. Fail with the
offending key name and `exit(1)`.
_Pattern: `one-cx/src/lib/config/env.ts` (typed, lazy, named-key errors) and
`assertAdminCoreSecretIsolated` in `toskie-backend/src/main.ts`._

**0.8 `server/.env.example`.** Every key, with what breaks without it.

**0.9 Graceful shutdown.** `SIGTERM` → stop accepting → drain → close Mongo/Redis →
exit. Cloud Run and Kubernetes both send SIGTERM; without a handler you drop
in-flight requests on every deploy.

---

### Phase 1 — Session & refresh tokens

_~2 days._

Today: a 2-hour JWT, no renewal. A student watching a long course gets a hard 401
mid-lecture. [src/lib/axiosClient.ts](../src/lib/axiosClient.ts) says so outright:
_"There is no refresh endpoint on this API, so a 401 is terminal."_

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

1. Hash the presented token; look it up. Not found → 401.
2. `revokedAt !== null` → **reuse detected.** Revoke every token for that user, log
   it, 401. This turns a stolen token from permanent access into a one-shot that
   locks both parties out and surfaces the breach.
3. Expired → 401.
4. Otherwise rotate inside a **transaction**, so two concurrent refreshes cannot
   both succeed.

> **Free-tier detail that will bite you:** Mongo transactions need a replica set.
> Atlas M0 _is_ one, so production is fine — but a plain `mongo:7` container is
> standalone and `session.withTransaction` throws. Your compose file (Phase 4) must
> run `--replSet rs0`, or local and prod diverge exactly where it hurts most.

**Client** — both toskie-web and toskie-admin solve this the same way, in ~15 lines
(`src/lib/authRefresh.ts`, `src/lib/auth/refresh-once.ts`). Two properties matter:

- **Single-flight.** Five parallel queries hitting 401 must produce _one_ refresh,
  not five racing rotations. A module-level `inFlight` promise does it.
- **Only tear down on a definitive rejection.** A network blip or 5xx during refresh
  must not log the user out — the access token may still be valid. Only a 401/403
  _from the refresh endpoint itself_ ends the session. toskie-web learned this from
  a "browser Back during a call logs me out" bug; the reasoning is in the header of
  `src/app/api/auth/refresh/route.ts`, and it is the single most-copied comment in
  this plan.

**Also ship:** `POST /auth/logout` that actually revokes (today it only clears the
cookie — the token stays valid server-side), and `GET /auth/sessions` +
`DELETE /auth/sessions/:id` for "signed in on 3 devices". The table gives you that
almost free, and it's a genuinely good portfolio feature.

---

### Phase 2 — Redis

_~2 days._

**2.1 Rate-limit store.** Move Phase 0.2 to `rate-limit-redis`. In-memory counters
reset on every restart — on a scale-to-zero host that's _every idle period_, so an
attacker resets their own bucket by waiting. It's also the only way limits work
across instances. one-cx's audit finding H4 is the other half of this: an unbounded
in-memory bucket `Map` is itself a memory leak under scanning traffic.

**2.2 OTP storage — replaces the `OTP` collection.** Fixes 2.6 wholesale:

```
otp:<email>          → { hash: sha256(otp), attempts: 0 }   EX 300
otp:cooldown:<email> → 1                                     EX 60
```

Hashed at rest, 5 attempts then the key dies, 60 s resend cooldown. Delete
`server/models/OTP.js` and its pre-save mail hook (2.10) with it.

**2.3 Read-through cache for public reads.** Catalog, categories and published-course
lists are read constantly and change rarely.

```js
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

**Fail open.** Every Redis call wrapped, so an outage degrades to "slower" rather
than "down". This is the most important property of the pattern — copy it from
`toskie-backend/.../admin-core-permission-cache.service.ts`. On Atlas M0's shared
CPU this isn't a micro-optimisation.

**2.4 Rating aggregates.** `avgRating` is recomputed per course per request. Cache;
invalidate on new review.

**2.5 Distributed locks (fixes 2.13).** `SET lock:prune-users <id> NX EX 300`, release
by comparing the value. Needed the moment the scheduled Action can overlap a manual
run or a second replica exists.

**2.6 Background jobs — read this before reaching for BullMQ.**

BullMQ is the obvious answer for getting mail off the request path. But BullMQ
workers use **blocking Redis reads in a loop**, and Upstash's free tier is
**command-metered** — one idle worker can exhaust a day's quota.

- **On Upstash free:** skip BullMQ. Use a Mongo-backed outbox —
  `{ to, template, payload, status, attempts, nextAttemptAt }` — drained by a
  scheduled Action (Phase 5.5) hitting a protected endpoint. Slower, but free,
  durable, retryable and observable.
- **On an Oracle Always Free VM:** run your own Redis and use BullMQ properly.

Either way, **mail must leave the request path.** That's what fixes "payment
succeeded but the student saw an error" (2.2).

---

### Phase 3 — API contract & type safety

_~2 days. The gap nobody notices until a response shape changes._

toskie-admin generates its entire typed client from the GraphQL schema and wires
`codegen:check` into `npm run validate`, so **schema drift is a build failure**.
StudySphere has hand-written types in `src/types/*.ts` that agree with the Express
controllers only by convention — and your git history has a
`fix/course-details-response-shape` branch, which is what that costs.

**3.1 Share the Zod schemas.** You already have `src/zod-validations/`. The server
has a parallel hand-rolled `server/utils/validateAuth.js`. Extract the schemas to a
`shared/` folder both import, and validate with the _same_ schema on both sides.
One definition, no drift, and the client stops sending bodies the server will reject.

**3.2 Generate the client from an OpenAPI spec.** Write `openapi.yaml` (or generate
it from route annotations), then `openapi-typescript` for types and `openapi-fetch`
for a typed client. `npm run openapi:check` in `validate` fails the build when the
spec and the code disagree — the REST equivalent of `codegen:check`.

**3.3 A canonical error taxonomy.** Port `toskie-admin/src/lib/errors/bff-errors.ts`:
a closed union of error codes, thrown by the API, mapped to user-facing copy in one
`messages.ts`. Today the server returns raw `error.message` in several places
(leaking internals — `sendOTP`'s 500 handler does exactly this) and differently
worded messages for the same condition elsewhere.

**3.4 One response envelope.** You already mostly use
`{ success, message, data }` — write it down as a type, apply it everywhere, and
make the client's error handler depend on it rather than on `error.response.data`
shape-sniffing.

---

### Phase 4 — Containerisation

_~1.5 days._

**4.1 `server/Dockerfile`** — multi-stage, non-root, signal-correct:

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

`dumb-init` matters: as PID 1, Node gets no default signal handlers, so `SIGTERM`
is ignored and every deploy waits out a 10 s kill timeout.

**4.2 A migrating entrypoint.** one-cx's `docker-entrypoint.sh` runs the schema
migration and only then execs the server, exiting non-zero on failure — so a
release can never serve traffic against a schema older than its code, and a bad
deploy fails its health check instead of serving a broken app.

**4.3 SPA Dockerfile** — `vite build` stage → `nginx:alpine` with
`try_files $uri /index.html`.

> **The build-time trap.** `VITE_*` variables are **inlined at build time**. They
> must be `ARG`s and passed as `--build-arg` per environment; setting them in the
> runtime environment bakes `undefined` into the bundle. one-cx shipped production
> with analytics silently dead for exactly this reason — see the comment block in
> `one-cx/Dockerfile`. It also means **one image cannot serve both staging and
> production**: build twice, or move config to a runtime-fetched `/config.json`.

**4.4 `docker-compose.yml`:**

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

`condition: service_healthy`, not bare `depends_on` — the latter waits for the
container to _start_, not to be _ready_, so the API races Mongo and crash-loops on
a cold `docker compose up`.

**4.5 `.dockerignore`** — `node_modules`, `.git`, `dist`, `.env`, `coverage`.
Without it the build context ships 5 MB of images and your `.env`.

**4.6 Make compose the documented way to run the project.**

---

### Phase 5 — CI/CD

_~2–3 days. Unlimited minutes if the repo is public._

**5.1 `ci.yml`** — every PR and push to `develop`/`main`:

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

`npm ci` (cached) → `format:check` → `lint` → `type-check` → `openapi:check` →
`test` → `build` → `npm audit --audit-level=high`. `npm run validate` already does
the first three.

Add a **service-container job** booting Mongo + Redis for the integration tests.
`toskie-backend/.github/workflows/ci.yml` is the model — it provisions the schema
from zero on every PR _specifically because_ a never-exercised path had rotted
silently for months.

**5.2 `deploy-staging.yml`** — push to `develop`:

1. **Pre-flight secret check.** Assert every required secret is non-empty and fail
   with the offending name _before_ a five-minute build. one-cx even detects the
   Variables-vs-Secrets mix-up, which looks identical in the UI and silently yields
   an empty string. ~20 lines; saves hours.
2. Build SPA with staging vars → Cloudflare Pages.
3. Build API image with staging build-args → GHCR `:develop`.
4. Trigger the deploy.
5. **Poll `/health/ready` until 200, up to ~90 s** — never `sleep 10 && curl`. A
   container that boots then crash-loops reads as healthy for exactly the window a
   fixed sleep samples. toskie cut a release specifically to ship `/health` and then
   didn't call it; the polling loop is the fix.
6. Notify (Slack/Discord webhook, both free).

**5.3 `deploy-prod.yml`** — on tag `v*.*.*`, plus `workflow_dispatch` with a ref input:

- `environment: production` for scoped secrets.
- **Free manual approval gate.** GitHub's Required Reviewers needs a paid plan on
  private repos; `trstringer/manual-approval` gives the same gate by opening an
  issue and waiting for an `approve` comment. Needs `issues: write`.
- **Strict migrations** — a failure aborts before restart. toskie swallowed
  migration failures for a while "because the app will handle schema sync"; it
  doesn't, and that's how drift reached production unnoticed.
- Health-poll, then notify.
- `workflow_dispatch` is not optional: an Actions incident can drop a push event
  entirely, leaving no run to re-run and no button to press.
- **Rollback step** on failure — one-cx's UAT job keeps `.next.backup` and restores
  it. The container equivalent is redeploying the previous image tag.

**5.4 Supply chain.** `codeql.yml` (free on public repos), `dependency-review.yml`,
`dependabot.yml` for npm + actions.

> Read `toskie-web/.github/dependabot.yml` first — it's **disabled** there, with
> reasons: grouped minor/patch PRs kept re-bumping packages whose newer minors
> carried runtime regressions, clobbering deliberate pins. Enable it, but pin what
> has burned you and add those to `ignore`.

**5.5 Scheduled workflows** — these replace `node-cron`, which cannot work on a
scale-to-zero host:

```yaml
# .github/workflows/cron-prune-users.yml
on:
  schedule: [{ cron: '30 19 * * *' }] # 01:00 IST — cron is UTC
  workflow_dispatch:
```

POSTs to `/internal/jobs/prune-inactive-users` with a shared secret header. Move the
body of `server/jobs/deleteInactiveUsers.js` there; keep `node-cron` for local/VM
runs only, selected by env. Take the lock from 2.5 before doing any work.

Also scheduled: the database backup (16.3), the mail-outbox drain (2.6), and a
sitemap ping to Search Console (Phase 9).

**5.6 Branch protection & conventions.** Require CI green + 1 review on `develop`
and `main`; `CODEOWNERS`; PR template; `commitlint` for Conventional Commits →
`release-please` for tags and changelog → which triggers `deploy-prod.yml`. That
closes the loop: merge to `main` → version PR → tag → approval → production.

---

### Phase 6 — Observability

_~2 days. This is what turns "it's down" into "I know why."_

**6.1 Health endpoints.** Port `toskie-backend/src/shared/health/health.routes.ts`
almost verbatim; every decision in it is earned:

- **`GET /health` — liveness, shallow on purpose.** Answers "is this process
  running" and checks _nothing else_. A liveness probe that fails during a Mongo
  blip triggers restart loops and turns a brief dependency outage into a full one.
- **`GET /health/ready` — readiness.** Pings Mongo and Redis, **each bounded by a
  2 s timeout** so one hung dependency can't hold the response open. 503 when any
  check fails. **Cache ~10 s** — this route bypasses rate limiting and would
  otherwise let anonymous traffic drive a DB round trip per request.

Your `GET /` returns 200 unconditionally — it cannot fail, so it proves nothing.
The deploy health-poll (5.2) and the K8s probes (15.2) both depend on these being real.

**6.2 Structured logging.** `pino` + `pino-http`.

- JSON to stdout in prod, `pino-pretty` in dev.
- **Redact** `req.headers.cookie`, `authorization`, `password`, `otp`, `token`.
  Non-negotiable — you are one careless log line from putting session cookies into a
  log aggregator.
- `x-request-id` (generate if absent), child logger per request, id returned in
  error responses so a user report maps to a log line.

**6.3 Sentry.** `@sentry/node` + `@sentry/react`, wrapping the app in Sentry's
`ErrorBoundary` (which also closes §1.1's gap). Upload source maps from CI and
**don't deploy them** (`sourcemap: 'hidden'`). `tracesSampleRate: 0.1`,
`replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 1.0`.

**6.4 Uptime monitoring.** UptimeRobot on `/health/ready`. On Render free this
doubles as keep-warm — one service pinged continuously is ~744 h/mo against a 750 h
budget, so it fits, but only for one service.

**6.5 Metrics.** `prom-client` → `/metrics`, scraped by Grafana Cloud via Alloy.
Register it directly on the Express instance so it bypasses rate limiting — toskie
does exactly this, for the same reason.

**6.6 Log volume is an operational hazard.** toskie's `ecosystem.config.js` carries
a long comment about PM2 deriving log filenames from the process id: a
delete-and-start deploy minted a fresh id each time, log families piled up to 1.6 GB,
filled the disk, and **silently broke RabbitMQ OTP delivery**. The lesson generalises
beyond PM2: logs fill disks, and a full disk breaks things that look unrelated. Set
retention wherever your logs land.

**6.7 Web vitals.** `web-vitals` → GA4/PostHog. Measure LCP before Phase 8 so the
improvement is visible.

---

### Phase 7 — Testing & code quality

_~3–4 days for meaningful coverage._

**7.1 Backend: Jest + supertest + `mongodb-memory-server`**, in priority order:

1. **Auth** — signup validation, duplicate email (2.3), login, `changePassword`,
   logout revocation.
2. **Refresh rotation** — happy path, expired, revoked-token reuse revokes the
   family, two concurrent refreshes produce one winner.
   `toskie-backend/.../__tests__/admin-core-refresh-token.service.spec.ts` is a
   ready-made test list.
3. **Payments** — signature accepted/rejected, enrolment atomic, mail failure
   doesn't fail the payment (2.1, 2.2).
4. **Role guards** — Student can't reach Instructor routes; 403 not 401.
5. **Rate limits and OTP attempt capping.**

`mongodb-memory-server` can start a replica set, which the transaction tests need.

**7.2 Frontend: Vitest + Testing Library.** Use **Vitest**, not Jest — this is a
Vite project and it reuses `vite.config.js`. Add `msw` for API mocking and
`vitest-axe` for a11y assertions.

**7.3 E2E: Playwright.** One spec for the money path — signup → OTP → login →
catalog → cart → checkout (Razorpay test mode) → open course → mark lecture
complete. Run against the compose stack in CI. This catches more real breakage than
fifty unit tests.

**7.4 husky + lint-staged.** You have prettier and eslint configured and nothing
enforcing them. ~20 minutes:

```jsonc
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"],
  "*.{json,md,css,yml}": ["prettier --write"]
}
```

`.husky/pre-commit`: `npx lint-staged && npm run type-check`
`.husky/commit-msg`: `npx commitlint --edit $1`

**7.5 Stronger lint.** `eslint-plugin-sonarjs` (real bug patterns, not style),
`eslint-plugin-jsx-a11y`, and `eslint-plugin-security` on the server.

**7.6 A local Sonar report.** toskie-web's `.claude/skills/sonar-check/` is
self-contained: a dedicated `eslint.sonar.config.mjs` (separate so it never affects
`npm run lint`) plus a generator that classifies findings into tiers and writes a
Markdown report — full-project SonarQube-style analysis with **no server and no
account**. Copy the folder; it's ~2 hours to adapt.

**7.7 Finish the TypeScript migration.** Start with `App.jsx`, `Navbar.jsx`,
`Footer.jsx`, `core/Dashboard/*`; then enable `strict` and `noUncheckedIndexedAccess`.

---

### Phase 8 — Performance & frontend delivery

_~2 days. Highest user-visible payoff per hour._

**8.1 Route-level code splitting** — the single biggest win:

```jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ViewCourse = lazy(() => import('./pages/ViewCourse'));
const AddCourse = lazy(() => import('./components/core/Dashboard/AddCourse'));
// … wrap <Routes> in <Suspense fallback={<RouteSkeleton />}>
```

Instructor-only code (Chart.js, the course builder) should never reach a student's
browser.

**8.2 Vendor chunking.** `manualChunks` splitting react/react-dom, RTK + react-redux,
chart.js + react-chartjs-2, swiper, react-player. A React upgrade shouldn't
invalidate your app chunk.

**8.3 Fix `react-player`.** Import the specific player instead of the barrel; the
build currently emits a chunk per provider you don't use.

**8.4 Images.** 5.2 MB of unoptimized PNG. Convert to WebP/AVIF
(`vite-plugin-image-optimizer`), add explicit `width`/`height` to stop layout shift,
`loading="lazy"` below the fold. Expect a 3–4 MB reduction.

**8.5 Move `banner.mp4` out of the bundle** to Cloudinary, with a poster and
`preload="none"`.

**8.6 Error boundaries** — top-level plus per-route, wired to Sentry.

**8.7 `rollup-plugin-visualizer`** — treemap in CI, attached to the PR. You can't fix
8.5 MB you can't see.

**8.8 Lighthouse CI** — `treosh/lighthouse-ci-action` on PRs with a budget that fails
on regression.

**8.9 Cache headers + preconnect.** `Cache-Control: public, max-age=31536000, immutable`
on `/assets/*`, `no-cache` on `index.html`, via Cloudflare Pages `_headers`.
`<link rel="preconnect">` for Cloudinary and Razorpay (the API is now same-origin).

**8.10 N+1 reads.** one-cx's audit finding H8 was _"every article page refetches the
entire blog collection"_. Check the equivalent here: does the catalog page fetch all
courses and filter client-side? Does `CourseDetails` pull the full instructor
document? Cheap to check, cheap to fix, and it compounds on Atlas M0.

---

### Phase 9 — SEO & discoverability

_~3 days for option A; a separate project for option C. Read §3 first._

This phase is the largest gap between StudySphere and toskie-web, and for a course
marketplace it's the one with the clearest revenue line attached.

**9.1 Per-route metadata.** `react-helmet-async`, driven by a small
`buildPageMetadata()` helper so every route declares title, description, canonical,
Open Graph and Twitter card. Today every URL is "StudySphere" with no description.

**9.2 Meta-description discipline.** Port
`toskie-web/src/lib/seo/metaDescription.ts` — it solves a problem you have exactly:
course descriptions are **instructor-authored free text**, so they arrive with
newlines (which turn into a ragged attribute) and at arbitrary length (Google renders
~155–160 chars and truncates mid-word). The module collapses whitespace, clamps on a
word boundary, and — the clever part — has a **minimum length below which it prefers
generated boilerplate**, because a two-word description is a worse snippet than a
templated sentence naming the course and category.

**9.3 JSON-LD structured data.** The highest-leverage single item in this phase:

- **`Course`** on course detail pages — a first-class Google rich result with
  carousel treatment. `name`, `description`, `provider`, `offers`, `aggregateRating`,
  `hasCourseInstance`.
- **`BreadcrumbList`** on catalog and course pages.
- **`Organization`** in the app shell (logo, sameAs).
- **`VideoObject`** for lecture previews.
- **`FAQPage`** if you add course FAQs.

Copy the **escaping** from `toskie-web/src/components/JsonLd.tsx` — it escapes `<`
and `>` before `dangerouslySetInnerHTML`, because JSON-LD containing a `</script>`
sequence otherwise breaks out of the tag.

And copy the **judgement** from `toskie-web/src/lib/seo/schema.ts`: `aggregateRating`
is not valid on every type, out-of-range values get rejected, and a "0 stars with 12
reviews" default leaking through is worse than omitting it. That file also states
plainly that self-hosted ratings about your own listings are treated as self-serving
and are rich-result ineligible — the goal is a correct entity graph and a clean
Search Console, not stars.

**9.4 `sitemap.xml`, generated from the database.** Static routes + every published
course + every category with at least one published course. toskie-web's rule for
inclusion is worth adopting verbatim:

> _"Every crawlable route that carries its OWN title, description and
> self-referential canonical belongs here. The test is deliberately that narrow: a
> page listed in the sitemap is a claim that it is worth indexing, and a page
> inheriting the root layout's generic metadata is not — submitting several of those
> earns 'Duplicate, Google chose a different canonical' rather than rankings."_

Serve it from an Express route (`GET /sitemap.xml`) with a cache, since your SPA host
is static. Degrade to the static routes if the database is unreachable rather than
500ing — toskie-web wraps its profile query in exactly that try/catch.

**9.5 `robots.txt` for production.** You have staging covered. Production needs an
explicit disallow list for authenticated areas (`/dashboard`, `/view-course`,
`/login`, `/signup`, `/verify-email`, `/update-password`) and an `allow` plus a
`Sitemap:` line for everything else. toskie-web's `src/app/robots.ts` is the template,
including the staging branch you already have.

**9.6 Programmatic landing pages.** `/courses/:category`, and later
`/courses/:category/:level`. Two disciplines from toskie-web make this work rather
than generate a penalty:

- **A thin-content gate.** `isIndexablePage(courseCount >= N)` — pages below the
  threshold still _render_ (a visitor who lands there sees something useful) but carry
  `noindex, follow` and stay out of the sitemap.
- **A global launch flag.** `LANDING_PAGES_READY` keeps the whole tier `noindex`
  until it's worth indexing. toskie-web's comment on that constant is a model of
  honesty — it records that turning it on opened 76 pages out of 3,204 skills, that 62
  of those have exactly one talent, and that "Crawled – currently not indexed" is the
  _expected_ outcome for a good share of them.

**9.7 Open Graph images.** A blank WhatsApp card is a real conversion cost for a
product whose links get shared. Generate per-course OG images (course title +
instructor + thumbnail) — `@vercel/og`/Satori at build time, or a Cloudinary
transformation URL, which is free and needs no code.

**9.8 Redirect discipline.** When a route moves, use **307, not 308**. toskie-web's
`next.config.ts` explains why: a 308 is cached by the browser indefinitely, so a
rollback keeps sending users to a path that no longer exists — a break no server-side
revert can reach. Promote to 308 only once the destination has settled.

**9.9 A human-readable sitemap page.** `/sitemap` listing categories and courses.
toskie-web lists theirs in the XML sitemap because it's a genuine internal-linking hub
in its own right.

**9.10 Register with Search Console and Bing Webmaster Tools**, submit the sitemap,
and add a scheduled Action to ping it on publish. Without this you're optimising blind.

---

### Phase 10 — Analytics

_~2 days._

No analytics of any kind today. The architecture that matters is **one choke point and
a typed vocabulary** — without them, tracking rots within a month and nobody trusts
the dashboards.

**10.1 GTM container + dataLayer choke point.** Port `one-cx/src/lib/gtm/gtm.ts`:

```ts
// src/lib/analytics/dataLayer.ts — the ONLY place anything is pushed
export function pushEvent(event: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}
```

GA4 then rides on GTM at zero code cost, and tags can be added without a deploy.

**10.2 A typed event vocabulary** — the part that makes it durable. Port the shape of
`toskie-web/src/lib/analytics/events.ts`:

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
  COURSE_CREATED: 'course_created',
  COURSE_PUBLISHED: 'course_published',
} as const;

// payload typed per event — a misspelled name or a drifted property
// is a build error, not a silently-wrong report nobody notices for a month
export interface EventProperties {
  /* … */
}
export function trackEvent<E extends EventName>(n: E, p: EventProperties[E]): void;
```

Event names are case-sensitive and **cannot be renamed after the fact** in most tools.
A typo ships permanently. Make it a compile error.

**10.3 Product analytics: PostHog.** One free tier covers ~1M events/mo, funnels,
retention, session replay _and_ feature flags — one vendor instead of four. Self-hosted
RudderStack is the alternative if you specifically want CDP experience on your CV; it's
more infrastructure than this app justifies, and on free hosting it'd live on the Oracle VM.

**10.4 First-touch attribution.** Port `toskie-web/src/lib/analytics/attribution.ts`.
UTM parameters and the landing referrer are readable only on the _first_ page of a
session — after one client-side navigation they're gone and unrecoverable. Capture once
into `sessionStorage`, register as super-properties.

**10.5 Identity.** `identify()` on login with `accountType`, enrolled-course count,
signup date. `reset()` on logout, or the next anonymous visitor on that browser inherits
the previous user's identity.

**10.6 Gate it.** `VITE_ENABLE_ANALYTICS` **plus** a production-hostname check — one-cx
gates on the live hostname specifically so a staging build that inherits the prod env
still can't emit events. Staging traffic in production funnels is worse than no analytics.

**10.7 Engagement depth.** Port one-cx's `useScrollDepthTracking` and
`useEngagementTracking`. For an edtech site, "how far down the course page did they get
before bouncing" is a directly actionable number.

**10.8 Ecommerce events.** `purchase` with `value`, `currency: 'INR'` and `items[]` in
GA4's schema — the one event with real reporting built on top of it.

**10.9 A first-party analytics proxy (later).** one-cx serves events from
`data.one-cx.com` through an nginx reverse proxy so ad blockers don't drop them. With
Cloudflare Pages Functions you already have the proxy layer from §4.1, so this is nearly
free to add.

> **The one thing you must not break**, from `one-cx/deploy/rudder-proxy/README.md`: the
> SDK fetches `/sourceConfig` from the **control plane** and `/v1/*` from the **data
> plane**. Route `/sourceConfig` to the data plane and it 404s, the SDK never loads its
> config, and **no events are ever sent — silently**.

**10.10 A data dictionary next to the code.** toskie-web's `scripts/mixpanel-lexicon.mjs`
uploads event definitions to Mixpanel's Lexicon. The value isn't the tool — it's that the
definitions live in the repo, so the caveats ("`course_completed` means all lectures
marked, not a certificate issued") sit where people read the numbers.

**10.11 Write the tracking plan down** in `docs/ANALYTICS.md`: event, when it fires,
properties, which question it answers. Any event that can't name its question shouldn't
ship. toskie-web keeps this in `AGENTS.md` behind a mandatory pre-flight checklist.

---

### Phase 11 — Authorization & admin

_~4 days. The README currently says "Create Admin account via backend (Postman)."_

**11.1 Move authorization out of the router.** `App.jsx` conditionally _renders_ routes
by `accountType`, so a wrong-role user gets a 404, not a 403, and adding a role means
editing the router. Port `toskie-web/src/lib/routePolicy.ts`: routes and their required
capability as **data**, with a `<RequireRole>` / `<RequirePermission>` wrapper. This also
gives you the validated redirect target that fixes 2.12.

**11.2 A permission model.** Three hardcoded account types works until it doesn't —
"instructor who can also moderate reviews" has no home today. toskie-admin's shape:
roles → permissions, a `useHasPermission` hook, and a permission-driven sidebar so the
nav can't offer what the user can't do. Server-side, the permission lookup is
Redis-cached with a 60 s TTL and invalidated on role change — a read-through cache in
front of an otherwise per-request join.

**11.3 Server-side enforcement stays authoritative.** Client-side gating is UX only.
Every protected route needs its guard regardless of what the nav shows.

**11.4 An admin surface.** Today: no UI for categories, course moderation, user
management or refunds. This is a legitimate standalone project and the most
portfolio-visible item after Kubernetes. toskie-admin is a complete, readable template —
Next.js + Apollo + generated types + TanStack Table + RBAC + `driver.js` product tours +
CSV export via `papaparse`.

**11.5 An audit trail.** Who published which course, who deleted whom, who changed a
role. `{ actorId, action, targetType, targetId, metadata, at }`. toskie-backend records
refresh-token replay detection into exactly this — an audit log is where you find out
_how_ something happened.

---

### Phase 12 — Realtime & notifications

_~3 days. Genuinely on-theme for edtech._

**12.1 Web push via FCM.** Free and unlimited. Use cases that fit: new lecture in an
enrolled course, instructor replied to a review, course you saved went on sale, cart
abandoned.

> A trap from `toskie-web/public/firebase-messaging-sw.js`: a service worker **cannot
> import from the app bundle**, so its deep-link switch and the in-app one have to be
> edited together — a notification type added in the app and not the SW silently opens
> the home page instead. Their comment records exactly that happening to an admin
> broadcast. Also: the notification `icon` must be a **raster ≥192×192**, not an SVG —
> Chrome on Android drops SVG and shows a generic bell.

**12.2 In-app notification centre.** A bell with unread counts, backed by a
`Notification` collection. Socket.io for live delivery when the tab is open, push when
it isn't.

**12.3 Socket.io, if you add live features.** Q&A on a lecture, "12 students watching
now", instructor office hours. If you ever run more than one instance you need the Redis
adapter — without it `server.to(room).emit()` only reaches clients on the emitting
process, and events vanish when the emitter and the client are on different instances.
`toskie-backend/src/main.ts` wires this with a fallback to the in-memory adapter.

**12.4 A web manifest + installability.** There's no `manifest.json` today. An
installable course app with offline access to already-watched lecture metadata is a real
edtech feature, and a PWA is free. Add `manifest.webmanifest`, the icon set, `theme-color`,
and a Workbox service worker caching the app shell.

---

### Phase 13 — Accessibility

_~2 days. Currently unmeasured, and the app is full of high-risk surfaces._

Accordions, modals, a custom video player, star-rating widgets, sliders, a multi-step
course builder and OTP inputs are exactly the components that go wrong.

**13.1 `eslint-plugin-jsx-a11y`** in the lint config (catches the static half for free).

**13.2 `vitest-axe` assertions** on the auth pages, checkout and the course player.
toskie-web and toskie-admin both run `jest-axe`; without it, a11y regressions are
invisible until someone complains.

**13.3 Focus management.** Modals trap focus and restore it on close; route changes move
focus to the `<h1>`; a skip-to-content link. Your `useScrollToTop` hook already runs on
navigation — focus belongs in the same place.

**13.4 Keyboard paths.** The video player, the accordion and `ConfirmationModal` must be
fully operable without a mouse.

**13.5 `prefers-reduced-motion`** for Swiper autoplay and `react-type-animation`. The
homepage type animation is a vestibular trigger.

**13.6 Colour contrast** against the dark theme, and never colour alone for state — the
completed-lecture highlight in the accordion needs a second signal (icon or text).

---

### Phase 14 — AI features

_~1 week. The most differentiated thing you can add, and it demos well._

Both toskie and one-cx ship real LLM features; the operational patterns are more
interesting than the prompts.

**14.1 Instructor writing assistant.** Generate or refine course descriptions, section
titles, learning outcomes from a title + a few bullets. toskie has a whole family of
these (`bio.service.ts`, `post-content.service.ts`, `refine.service.ts`) behind a
`base-task.service.ts` with shared budget and rate-limit handling.

**14.2 A study assistant over course content.** RAG over lecture transcripts and course
descriptions. one-cx's chatbot is the full blueprint: pgvector retrieval, a chunker, an
ingest pipeline, a crawler, and a `kb_sync_log`. On Mongo, Atlas Vector Search exists on
M0 with limits; otherwise store embeddings and do cosine similarity in application code
at this scale.

**14.3 Auto-generated quizzes** from a lecture transcript. Genuinely useful for an edtech
product, and a clean scoped feature.

**14.4 The operational patterns that matter more than the model:**

- **A daily token budget** with a hard stop. one-cx's `DAILY_TOKEN_BUDGET` is set
  deliberately low on staging so a test loop can't run up a real bill.
- **Per-task rate limits** keyed on user id, not a client-supplied value (§0.2's lesson).
- **A timeout on generation** — one-cx audit finding M8 was its absence.
- **Prompt templates in the database, versioned**, not inlined in code.
- **Moderation on output** before it reaches a student.
- **Advisory locks** around ingest so a nightly job and an admin "re-index" button can't
  run concurrently (2.13's pattern).
- **Atomic re-ingest.** one-cx finding H5: a non-atomic re-ingest destroyed the knowledge
  base on any mid-run failure. Build the new index beside the old, then swap.

**14.5 Free inference.** Google Gemini's free tier is generous; Groq and Cerebras also
offer free tiers. Put the provider behind an interface — toskie's
`ai-provider.interface.ts` — so switching is a config change.

---

### Phase 15 — Kubernetes

_~3–5 days. Be honest with yourself about why._

**This app does not need Kubernetes.** One Express process against Atlas serves this load
with room to spare. Do it because you asked and because it's the most CV-valuable single
item here — not because the app is straining.

**15.1 Where it can actually run free:**

| Option                            | Notes                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **k3d / kind**, local             | Free, instant, perfect for writing and testing manifests. Start here.                                                                |
| **Oracle OKE** on Always Free ARM | Control plane free, workers on Always Free shapes. The only genuinely free _real_ cluster. ARM capacity is often unavailable; retry. |
| **k3s** on one Always Free ARM VM | Simpler than OKE; bundled Traefik + local-path storage. 4 cores / 24 GB is generous here.                                            |

Civo, DigitalOcean and Linode have no free tier. GKE gives one free zonal control plane
but you still pay for nodes.

**15.2 Manifests** (`k8s/base/`), leaning on what earlier phases built:

- `Deployment` — `replicas: 2`, resource requests/limits,
  `securityContext: { runAsNonRoot: true, readOnlyRootFilesystem: true }`.
- **Probes pointing at Phase 6.1:** `livenessProbe` → `/health` (shallow, so a Mongo blip
  can't restart-loop you), `readinessProbe` → `/health/ready` (deep, so traffic is
  withheld while a dependency is down). This is _why_ liveness was built shallow.
- `Service` + `Ingress` (Traefik on k3s, or nginx-ingress).
- `ConfigMap` for non-secrets; **sealed-secrets** or **SOPS** for the rest so encrypted
  secrets can live in git. A plain `Secret` manifest is base64, not encryption.
- `HorizontalPodAutoscaler` on CPU; `PodDisruptionBudget` `minAvailable: 1` so a node
  drain doesn't take the API down.
- `CronJob` for the prune and backup jobs — the in-cluster answer to Phase 5.5.
- `cert-manager` + Let's Encrypt for free TLS.
- **Stateful services stay managed.** Mongo on Atlas, Redis on Upstash. Don't self-host a
  database you care about on a free box with no backups.

**15.3 Kustomize overlays,** not Helm, to start: `base/` + `overlays/staging/` +
`overlays/production/` differing only in replicas, resources and image tag. Write the Helm
chart afterwards — you'll appreciate what it does once you've felt the thing it replaces.

**15.4 GitOps with ArgoCD** (free, OSS). This is the impressive part: CI builds the image →
pushes GHCR → bumps the tag in the overlay → ArgoCD syncs. Deployment becomes a git commit;
drift is detected and reverted; desired state is reviewable in a PR.

**15.5 If you want the full stack:** `Trivy` image scanning in CI, default-deny network
policies, a ServiceMonitor for Prometheus, and `k6` load tests so the HPA has something to
react to.

---

### Phase 16 — Data, privacy & operations

_~2 days. Unglamorous; this is what saves you at 2 a.m._

**16.1 Migrations.** `migrate-mongo`. Mongoose is schemaless from the database's point of
view, so index and shape changes have _no_ mechanism today — `User.email`'s unique index
(2.3) is migration #1. Run them from the container entrypoint (one-cx) or as a strict CI
step before restart (toskie). Either way, **strict**: a failure stops the deploy.

**16.2 Index audit.** Beyond `User.email`: `Course.status`, `Course.instructor`,
`RatingAndReview.course`, `CourseProgress.{userId,courseID}` (compound),
`RefreshToken.tokenHash` (unique), `RefreshToken.expiresAt` (TTL). On Atlas M0's shared
CPU a missing index is felt immediately.

**16.3 Backups — a real free-tier gap.** **Atlas M0 has no automated backups.** A bad
migration or a wrong `deleteMany` is unrecoverable today.

```yaml
# .github/workflows/backup.yml — daily
# mongodump --uri=$ATLAS_URI --archive --gzip
#   → Cloudflare R2 (10 GB free, no egress fees)
#   → prune > 30 days
```

Borrow toskie's paranoia: **assert the dump exceeds a size floor** before declaring
success. Their prod deploy aborts if the backup is under 100 KB, because that signature
once meant `pg_dump` had been pointed at the wrong (empty) database and "backup succeeded"
was a lie.

Then **actually restore one**, into a scratch database, once. An untested backup is a
hypothesis.

**16.4 Seed script.** `npm run seed` → categories, an instructor, a student, two published
courses. Makes local dev, E2E and demos reproducible.

**16.5 Privacy and data protection.** You handle Indian users' personal data and payments,
which puts you in DPDP Act scope.

- A **data-deletion flow that is publicly reachable**, not only linked from inside the
  app — the app stores require it and toskie-web deliberately sitemaps
  `/delete-account` for that reason. You have deletion; it's behind login.
- **PII redaction in logs** (6.2).
- **Data masking** for anything an admin sees that they don't need in full — toskie has a
  whole `DATA_MASKING.md` for this.
- A **privacy policy** that matches what you actually collect, especially once Phase 10
  lands.
- **Retention** — how long do you keep `UserDeletionLog`, OTP records, analytics?

**16.6 Runbook** (`docs/RUNBOOK.md`): how to roll back, restore a backup, rotate
`JWT_SECRET` (and that doing so invalidates every session — sometimes exactly what you
want), what each alert means and what to do.

---

### Phase 17 — Release engineering & documentation

_~1.5 days, then continuous. Cheap, and it's what a reviewer sees first._

**17.1 Human-readable release notes.** toskie-web ships `docs/release-notes/v1.0.0.md`
through `v1.11.0.md`, each with author, version, scope, type, environment, date, an
overview, and changes grouped by feature area — written for a person, not a changelog
parser. Sample line: _"Accepting a message request now opens the conversation. It
previously stayed on the request screen showing 'Chat not found'."_ That's the register to
aim for. `CHANGELOG.md` via `release-please` handles the machine-readable half.

**17.2 A README that onboards.** The current one is a feature list — good for a demo, not
for a contributor. Add an architecture diagram, `docker compose up` quickstart, an env
variable table, the branch/deploy model, and a link to this plan.

**17.3 `docs/adr/`.** One short file per significant decision. You already write excellent
_why_ comments (`authCookie.js`, `axiosClient.ts`, `middlewares/auth.js`) — ADRs are the
same instinct at architecture scale. Start with: why httpOnly cookies over localStorage;
why Redux _and_ Zustand _and_ React Query; why Mongo over Postgres; and (after §3) why the
public surface moved to SSR.

**17.4 Plans and specs folders.** toskie-admin and one-cx both keep
`docs/plans/YYYY-MM-DD-thing.md` and `docs/specs/YYYY-MM-DD-thing-design.md`. Writing the
design before the code is how the good comments in those repos came to exist.

**17.5 A repeatable security audit.** one-cx's `ENTERPRISE_AUDIT_REPORT_2026-07-15.md` is
a template worth stealing: findings in severity tiers, each with a mechanism and a fix, a
"clean / no confirmed findings" section, a **"refuted by verifiers"** section, and a
"highest-leverage fix first" summary. §2 of this document is your first pass — run it
again each quarter.

**17.6 API documentation.** OpenAPI 3 + Swagger UI (Phase 3.2 gives you the spec), or a
Bruno/Hoppscotch collection in the repo. There is no API reference today.

**17.7 `CONTRIBUTING.md`, `SECURITY.md`, PR + issue templates, `CODEOWNERS`.**

**17.8 A root `CLAUDE.md`/`AGENTS.md`.** All four reference repos have one, and
toskie-admin's is the best model: commands, architecture, route structure, a component
inventory, design tokens, a canonical page template, and a post-implementation validation
checklist. It measurably improves agent-assisted work.

---

## 6. Sequencing

Dependencies matter more than priority. Health endpoints (6.1) gate the deploy health-poll
(5.2) _and_ the K8s probes (15.2). Docker (4) gates K8s (15). Tests (7) should exist before
CI (5) has something to enforce. The same-origin proxy (§4.1) unblocks the CSRF fix (0.4).

| #   | Phase                                 | Why here                                          | Effort |
| --- | ------------------------------------- | ------------------------------------------------- | ------ |
| 1   | **0 — Security & defects**            | Never host §2 publicly                            | 2–3 d  |
| 2   | **6.1–6.2 — Health + logging**        | Everything downstream depends on these            | 0.5 d  |
| 3   | **1 — Refresh tokens**                | Biggest UX fix                                    | 2 d    |
| 4   | **4 — Docker + compose**              | Makes local == CI == prod                         | 1.5 d  |
| 5   | **7.1 / 7.4 — Tests + hooks**         | CI needs something to run                         | 2 d    |
| 6   | **5 — CI/CD**                         | Every later change is then verified automatically | 2–3 d  |
| 7   | **2 — Redis**                         | Rate limits, OTP, cache, locks                    | 2 d    |
| 8   | **8 — Performance**                   | Fast, visible, demo-able                          | 2 d    |
| 9   | **9 — SEO**                           | Needs perf + prod first; biggest growth lever     | 3 d    |
| 10  | **6.3–6.7 — Sentry, uptime, metrics** | Now you can see production                        | 1.5 d  |
| 11  | **16 — Migrations, backups, privacy** | Before the data matters                           | 2 d    |
| 12  | **10 — Analytics**                    | Needs stable prod + real traffic                  | 2 d    |
| 13  | **3 — API contract**                  | Pays off as surface area grows                    | 2 d    |
| 14  | **7.2 / 7.3 — Vitest + Playwright**   | Broaden coverage                                  | 2 d    |
| 15  | **13 — Accessibility**                | Cheap once tests exist                            | 2 d    |
| 16  | **11 — AuthZ & admin**                | Unblocks running it as a real product             | 4 d    |
| 17  | **12 — Realtime & push**              | Retention features                                | 3 d    |
| 18  | **15 — Kubernetes**                   | Everything it needs now exists                    | 3–5 d  |
| 19  | **14 — AI features**                  | Differentiation, once the platform is solid       | 5 d    |
| 20  | **17 — Docs & release eng.**          | Continuously; formalised here                     | 1.5 d  |

**~45–55 focused days** for everything. Sensible stopping points:

- **Items 1–6 (~11 days)** — the app is safe to host, deploys itself and is verified. If
  you do nothing else, do this.
- **Items 1–12 (~20 days)** — plus fast, findable, observable and measured. This is a
  genuinely production-grade product.
- **Items 1–20** — plus the breadth (K8s, AI, admin, realtime, a11y) that makes it a
  portfolio centrepiece.

**One branch per phase**, matching your existing `feature/*` → PR → `develop` habit. Each
lands green.

---

## 7. Deliberately out of scope

- **Microservices.** A single Express app is correct at this size. Splitting it buys
  distributed-transaction problems and nothing else.
- **Kafka / RabbitMQ.** Redis or the Mongo outbox covers every queueing need here.
  toskie-backend runs RabbitMQ because it has genuine cross-service fan-out; you don't.
- **Self-hosted Mongo or Postgres.** Atlas M0 is free, on someone else's on-call, and
  already a replica set. Self-hosting on a free VM means owning durability with no
  backups — strictly worse.
- **Multi-region.** Cloudflare already CDNs the SPA. One API region is right until you
  have users elsewhere.
- **Service mesh (Istio/Linkerd).** Real cost, zero benefit at two pods.
- **A separate CMS.** one-cx needs Strapi because marketing owns its copy. Your About and
  Contact copy changes twice a year; a CMS is overhead. Revisit if you add a blog — and
  when you do, steal `withStrapiFallback`, which degrades each query independently so one
  unreachable CMS doesn't 500 every page.
- **Terraform.** Arguable. Overhead for a single free VM — but if the goal is the skill, a
  small module for the Oracle VM + OKE cluster is a fine Phase 15 add-on. For the learning,
  not the need.
- **Switching off MERN.** The stack is fine. Every problem in §1 and §2 is a gap in
  _practice_, not in technology choice. (§3 is the one genuine exception, and it's a
  rendering-strategy change, not a stack change.)

---

## 8. Pattern catalog

Every pattern found in the sweep, its source, and whether it applies here.
**A** = adopt · **L** = adapt (the idea, not the code) · **S** = skip, with reason.

| Pattern                                         | Source                                                                  |     | Note                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------- | --- | ------------------------------------------- |
| Refresh rotation + reuse detection              | `toskie-backend/.../admin-core-refresh-token.service.ts`                | A   | Phase 1                                     |
| Single-flight refresh                           | `toskie-web/src/lib/authRefresh.ts`, `toskie-admin/.../refresh-once.ts` | A   | Phase 1                                     |
| Non-destructive refresh failure                 | `toskie-web/src/app/api/auth/refresh/route.ts`                          | A   | The header comment is the whole lesson      |
| BFF so cookies never reach JS                   | `toskie-web/src/app/api/**`                                             | L   | §4.1 edge proxy gives the same benefit      |
| Edge middleware route gating                    | `toskie-admin/middleware.ts`                                            | L   | SPA equivalent: `<RequireRole>` + 11.1      |
| Route policy as data + validated redirect       | `toskie-web/src/lib/routePolicy.ts`                                     | A   | Fixes 2.12                                  |
| Error-code taxonomy → user copy                 | `toskie-admin/src/lib/errors/bff-errors.ts`                             | A   | Phase 3.3                                   |
| Permission-driven nav + `useHasPermission`      | `toskie-admin/src/config/sidebarConfig.ts`, `.../useHasPermission.ts`   | A   | Phase 11                                    |
| Redis-cached permissions, fail-open             | `toskie-backend/.../admin-core-permission-cache.service.ts`             | A   | Phase 2.3 + 11.2                            |
| Distinct secrets asserted at boot               | `toskie-backend/src/main.ts`                                            | A   | Phase 0.7                                   |
| Typed env module, fail-fast                     | `one-cx/src/lib/config/env.ts`                                          | A   | Phase 0.7                                   |
| `trust proxy` = 1, not `true`                   | `toskie-backend/src/main.ts`                                            | A   | Phase 0.5                                   |
| Rate limit keyed on non-client-controlled value | `one-cx/src/lib/http/rateLimit.ts`                                      | A   | Phase 0.2 — the header comment              |
| Redis throttler storage                         | `toskie-backend/src/root.module.ts`                                     | A   | Phase 2.1                                   |
| Distributed advisory lock                       | `one-cx/src/lib/db/advisoryLock.ts`                                     | A   | Phase 2.5, fixes 2.13                       |
| Multi-stage Docker, non-root                    | `one-cx/Dockerfile`                                                     | A   | Phase 4.1                                   |
| Migrating entrypoint                            | `one-cx/docker-entrypoint.sh`                                           | A   | Phase 4.2                                   |
| Build-arg discipline for inlined env            | `one-cx/Dockerfile`, `one-cx/.github/workflows/ci-cd.yml`               | A   | Phase 4.3 — the trap                        |
| compose w/ healthcheck gating                   | `toskie-backend/docker-compose.yml`                                     | A   | Phase 4.4 (+ `--replSet`)                   |
| Pre-flight secret verification                  | `one-cx/.github/workflows/ci-cd.yml`                                    | A   | Phase 5.2                                   |
| Free manual approval gate                       | `toskie-backend/.github/workflows/deploy-prod.yml`                      | A   | Phase 5.3                                   |
| Strict migrations abort the deploy              | both deploy workflows                                                   | A   | Phase 5.3 / 16.1                            |
| Health-**polled** deploy verification           | `toskie-backend/.../deploy-prod.yml`                                    | A   | Phase 5.2                                   |
| Rollback on failure                             | `one-cx/.github/workflows/ci-cd.yml` (UAT job)                          | A   | Phase 5.3                                   |
| Provision-from-zero CI                          | `toskie-backend/.github/workflows/ci.yml`                               | L   | Mongo has no schema; assert indexes instead |
| `workflow_dispatch` as incident fallback        | `toskie-backend/.../deploy-dev.yml`                                     | A   | Phase 5.3                                   |
| Dependabot disabled, with reasons               | `toskie-web/.github/dependabot.yml`                                     | A   | Phase 5.4 — read before enabling            |
| Shallow liveness / deep readiness               | `toskie-backend/src/shared/health/health.routes.ts`                     | A   | Phase 6.1 — the highest-value port          |
| `/metrics` outside the guard chain              | `toskie-backend/src/main.ts`                                            | A   | Phase 6.5                                   |
| Log rotation / disk-fill hazard                 | `toskie-backend/ecosystem.config.js`                                    | A   | Phase 6.6                                   |
| Grafana Cloud + Alloy over self-hosted          | `toskie-backend/observability/`                                         | A   | Phase 6.5 — their own compose is superseded |
| `robots.ts` with explicit disallow list         | `toskie-web/src/app/robots.ts`                                          | A   | Phase 9.5                                   |
| DB-driven sitemap with a stated bar             | `toskie-web/src/app/sitemap.ts`                                         | A   | Phase 9.4                                   |
| JSON-LD + script-tag escaping                   | `toskie-web/src/components/JsonLd.tsx`, `.../seo/schema.ts`             | A   | Phase 9.3 — `Course` is the win             |
| Meta-description clamp + quality floor          | `toskie-web/src/lib/seo/metaDescription.ts`                             | A   | Phase 9.2 — instructor free text            |
| Thin-content indexing gate + launch flag        | `toskie-web/src/lib/seo/skillLocation.ts`                               | A   | Phase 9.6                                   |
| 307-not-308 redirect discipline                 | `toskie-web/next.config.ts`                                             | A   | Phase 9.8                                   |
| hreflang + region prefixes                      | `one-cx/src/lib/region.ts`, `.../seo.ts`                                | S   | Single market for now                       |
| Human-readable sitemap page                     | `toskie-web/src/app/sitemap/page.tsx`                                   | A   | Phase 9.9                                   |
| dataLayer choke point                           | `one-cx/src/lib/gtm/gtm.ts`                                             | A   | Phase 10.1                                  |
| Typed event vocabulary                          | `toskie-web/src/lib/analytics/events.ts`                                | A   | Phase 10.2 — the durability lever           |
| First-touch UTM attribution                     | `toskie-web/src/lib/analytics/attribution.ts`                           | A   | Phase 10.4                                  |
| Prod-hostname analytics gate                    | `one-cx/src/components/providers/RudderProvider.tsx`                    | A   | Phase 10.6                                  |
| Scroll-depth / engagement hooks                 | `one-cx/src/hooks/useScrollDepthTracking.ts`                            | A   | Phase 10.7                                  |
| First-party analytics proxy                     | `one-cx/deploy/rudder-proxy/`                                           | L   | Phase 10.9 — mind the `/sourceConfig` split |
| Lexicon / data dictionary in repo               | `toskie-web/scripts/mixpanel-lexicon.mjs`                               | A   | Phase 10.10                                 |
| Session replay                                  | `one-cx/src/lib/logrocket.ts`                                           | L   | PostHog replay instead — same free tier     |
| Feature flags                                   | `one-cx` Statsig                                                        | L   | PostHog flags instead                       |
| GraphQL codegen + `codegen:check`               | `toskie-admin/codegen.ts`                                               | L   | REST equivalent: OpenAPI, Phase 3.2         |
| husky + lint-staged + related tests             | all four repos                                                          | A   | Phase 7.4                                   |
| `jest-axe` a11y assertions                      | `toskie-web`, `toskie-admin`                                            | A   | Phase 13.2                                  |
| Self-contained local Sonar report               | `toskie-web/.claude/skills/sonar-check/`                                | A   | Phase 7.6 — copy the folder                 |
| Tiered security audit report                    | `one-cx/ENTERPRISE_AUDIT_REPORT_*.md`                                   | A   | Phase 17.5 — §2 is pass one                 |
| Per-version human release notes                 | `toskie-web/docs/release-notes/`                                        | A   | Phase 17.1                                  |
| plans/ + specs/ before code                     | `toskie-admin/docs/`, `one-cx/docs/superpowers/`                        | A   | Phase 17.4                                  |
| Root `CLAUDE.md` / `AGENTS.md`                  | all four repos                                                          | A   | Phase 17.8                                  |
| FCM push + SW deep-link mirror                  | `toskie-web/public/firebase-messaging-sw.js`                            | A   | Phase 12.1 — note the SVG-icon trap         |
| socket.io + Redis adapter                       | `toskie-backend/src/main.ts`, `toskie-web/src/lib/socket/`              | L   | Phase 12.3, only if you add live features   |
| `.well-known` deep links + Content-Type         | `toskie-web/next.config.ts`                                             | S   | No mobile app yet                           |
| Per-query CMS fallback                          | `one-cx/src/lib/strapi/resilient.ts`                                    | L   | Same principle for Cloudinary/Razorpay      |
| RAG chatbot + token budget                      | `one-cx/src/lib/kb/`, `src/lib/ai/`                                     | L   | Phase 14.2                                  |
| AI task rate limits + provider interface        | `toskie-backend/src/modules/ai/`                                        | L   | Phase 14.4                                  |
| Data masking + DPDP                             | `toskie-backend/docs/DATA_MASKING.md`                                   | A   | Phase 16.5                                  |
| Publicly reachable account deletion             | `toskie-web/src/app/delete-account/`                                    | A   | Phase 16.5                                  |
| Audit trail                                     | `toskie-backend/.../admin-core-audit.service.ts`                        | A   | Phase 11.5                                  |
| Design tokens + component inventory doc         | `toskie-admin/CLAUDE.md`                                                | A   | Phase 17.8                                  |

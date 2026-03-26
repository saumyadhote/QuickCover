# QuickCover — Claude Context File

> This file is read at the start of every Claude Code session. Keep it updated as the project evolves.

---

## What This Project Is

**QuickCover** is a parametric income protection platform for India's gig delivery workers (Blinkit, Zepto, Swiggy Instamart). A ₹2–5 micro-surcharge on consumer orders funds automatic payouts when verified disruptions (rain, heat, AQI, curfew) hit a driver's zone. Submitted to **Guidewire DEVTrails 2026: Unicorn Chase**.

---

## Repo Structure

```
QuickCover/
├── mobile/              # React Native / Expo — worker-facing app
├── mock-backend/        # Node.js / Express — REST API
├── admin-frontend/      # React + Vite — ops dashboard
├── README.md
├── FINANCIAL_MODEL.md
└── CLAUDE.md            # ← this file
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Backend API | Render | https://quickcover.onrender.com |
| Admin Dashboard | Vercel | https://quick-cover-neon.vercel.app |
| Database | SQLite on Render (no DATABASE_URL set) | resets on redeploy |

- Render redeploys automatically on every push to `main`
- Vercel redeploys automatically on every push to `main`
- `DATABASE_URL` is intentionally removed from Render env — backend runs SQLite (zero-dependency demo mode)
- `WEATHER_API_KEY` is set on Render (OpenWeatherMap free tier)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Mobile | React Native, Expo, TypeScript |
| Admin | React, Vite, TypeScript, Tailwind CSS, lucide-react |
| Backend | Node.js, Express v5, better-sqlite3 (local), pg (prod) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| External APIs | OpenWeatherMap (weather + AQI) |
| Hosting | Render (backend), Vercel (admin), Expo Go (mobile) |

---

## Backend — Key Architecture

### Database (dual-mode)
- `DATABASE_URL` set → PostgreSQL (Supabase/Render)
- `DATABASE_URL` absent → SQLite (`quickcover.db` local file)
- Helper: `dbGet(sql, params)`, `dbRun(sql, params)` — unified across both modes
- `$1, $2` placeholders work for both (SQLite adapter translates them)

### Tables

**`state`** (single row, id=1 — global demo state)
- `isTripActive`, `disruptionType/Zone/Severity/Message/Timestamp`
- `claimStatus`: `'none' | 'processing' | 'approved' | 'paid'`
- `weeklyEarnings`, `weeklyProtected`, `currentMicroFee`, `currentRiskLevel`

**`trips`**
- `id`, `status` (`completed | disrupted | pending_review`), `earnings`, `protectedAmount`
- `timestamp` (ISO string), `hoursWorked` (REAL, nullable), `userId` (INTEGER, nullable)

**`users`**
- `id`, `name`, `email`, `passwordHash`, `phone`, `driverId`, `platform`, `createdAt`

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/status` | Current global state |
| GET | `/eligibility` | Per-user trip count vs 25-trip threshold |
| POST | `/accept-trip` | Start trip, calculate live micro-fee |
| POST | `/complete-trip` | End trip, record earnings, stamp userId |
| POST | `/trigger-disruption` | File claim with hours_worked, eligibility check |
| POST | `/refresh-forecast` | Force live pricing recalculation |
| POST | `/cron/evaluate-live-triggers` | Poll all zones, auto-create claims |
| POST | `/reset` | Reset all state (demo only) |
| POST | `/auth/register` | Create account, return JWT |
| POST | `/auth/login` | Login, return JWT |
| GET | `/auth/me` | Verify token, return user |

### Auth
- JWT payload: `{ userId, email }`
- `getUserIdFromRequest(req)` helper — optional auth, returns `null` if no/invalid token
- All trip-scoped queries filter by `userId` when token present; fall back to global for unauthenticated

### Pricing Engine (`live_parametric_triggers.js`)
- `check_live_weather(lat, lon)` — OpenWeatherMap `/weather`, thresholds: rain >15mm/hr, temp >43°C
- `check_live_aqi(lat, lon)` — OpenWeatherMap `/air_pollution`, threshold: CPCB AQI >300
- `calculate_live_dynamic_surcharge(lat, lon)` — composite risk score → ₹1.50–₹5.00
- `evaluate_all_zones(zones)` — batch check for cron endpoint
- Falls back to mock `runMockForecast()` when `WEATHER_API_KEY` absent
- Auto-runs every 15s via `setInterval`

### Operational Zones
```js
ZONE_A: Bengaluru — Koramangala / HSR  (12.9352, 77.6245)
ZONE_B: Mumbai — Bandra / Andheri      (19.0596, 72.8295)
ZONE_C: Delhi — Gurugram / Cyber City  (28.4595, 77.0266)
```

---

## Mobile App — Key Architecture

### Context
- `AuthContext` — JWT token, user object, login/register/logout, SecureStore persistence
- `MockDataContext` — polls `/status` + `/eligibility` every 12s, fast-polls every 2s during active claims
- All axios calls in `MockDataContext` send `Authorization: Bearer <token>` via `authHeaders()`

### Eligibility Gate
- `eligibility: { eligible: boolean, tripCount: number, required: 25 }` exposed from context
- Insurance button on home screen (`mobile/app/(tabs)/index.tsx`):
  - **Ineligible**: red banner, `ShieldX` icon, trip progress subtitle, red callout below
  - **Eligible**: gray "Insurance Standby" banner
  - **Active**: green "Insurance Active" banner
- `toggleTrip()` returns early (no-op) if `!eligible && !isTripActive`

### Key Files
- `mobile/app/(tabs)/index.tsx` — home screen, insurance button
- `mobile/app/(tabs)/claims.tsx` — claim filing form
- `mobile/app/(tabs)/coverage.tsx` — coverage details
- `mobile/context/MockDataContext.tsx` — state, polling, all backend calls
- `mobile/context/AuthContext.tsx` — auth, token storage
- `mobile/utils/apiUrl.ts` — resolves API URL per platform

---

## Admin Dashboard — Key Architecture

- All icons: **lucide-react only** — no Material Symbols / Google Fonts (breaks on Vercel CDN)
- Polls `/status` every 2s for live fee chart and ops feed
- `refreshForecast()` → POST `/refresh-forecast`
- Disruption simulator → POST `/trigger-disruption`
- Key file: `admin-frontend/src/App.tsx`

---

## Business Logic

### Payout Model
- **Rate**: ₹80/hr (derived from ₹450 full-shift ÷ 5.5hr avg shift)
- **Input**: `hours_worked` (1–8) in `/trigger-disruption` request body
- **Payout**: `hours_worked × ₹80`
- **Weather cross-check** (WEATHER type only):
  - API confirms disruption → full payout
  - API shows clear → 50% payout, flagged for review
  - API unreachable → full payout (don't penalise driver)

### Eligibility Threshold
- **25 trips in the last 7 days** (completed + disrupted only, not pending_review)
- Scoped to `userId` when JWT present
- Rationale: ~3–4 trips/day × 6 days, with room for one day off and a slow day

### Claim Flow
1. `/trigger-disruption` → `claimStatus: 'processing'`
2. 4s delay (AI verification simulation) → `claimStatus: 'approved'`, `weeklyProtected += payout`
3. 3s delay → `claimStatus: 'paid'`

---

## What Is Live vs. Mocked

| Component | Status | Notes |
|---|---|---|
| Backend API | ✅ Live on Render | SQLite, auto-seeded demo account |
| Auth | ✅ Live | JWT, 30-day expiry |
| Mobile app | ✅ Expo Go | Connects to Render |
| Admin dashboard | ✅ Vercel | Polls Render backend |
| ML pricing engine | ✅ Live | Real OpenWeatherMap data when key present |
| IMD weather trigger | 🟡 Mocked | `/trigger-disruption` simulates; live IMD is post-hackathon |
| UPI payout | 🟡 Mocked | Razorpay designed, not wired |
| Fraud detection | 🟡 Stub | Isolation Forest architecture defined, not trained |
| GenAI Vision Agent | 🟡 Stub | `process_claim_evidence_with_genai()` stub in server.js |

---

## Demo Account

| Field | Value |
|---|---|
| Email | `demo@quickcover.in` |
| Password | `demo1234` |
| Driver ID | `DEMO-2024-00001` |

Auto-seeded on every backend startup via `seedDemoAccount()`.

---

## Common Commands

```bash
# Run backend locally (SQLite mode)
cd mock-backend && node server.js

# Seed 25 trips for a user (replace token)
node -e "const axios=require('axios'); const T='TOKEN'; const run=async()=>{for(let i=1;i<=25;i++){await axios.post('https://quickcover.onrender.com/complete-trip',{},{headers:{Authorization:'Bearer '+T}});console.log('Trip',i);}}; run();"

# Check eligibility
curl https://quickcover.onrender.com/eligibility

# Check live pricing
curl -X POST https://quickcover.onrender.com/refresh-forecast
```

---

## Environment Variables

| Key | Where | Value |
|---|---|---|
| `WEATHER_API_KEY` | Render + local `.env` | OpenWeatherMap API key |
| `JWT_SECRET` | Render + local `.env` | `quickcover-prod-j8kLmN2xPqR5vW9y` |
| `PORT` | Render | `4000` |
| `NODE_ENV` | Render | `production` |
| `DATABASE_URL` | **NOT SET on Render** | Intentionally absent → SQLite mode |
| `VITE_API_URL` | Vercel | `https://quickcover.onrender.com` |

---

## Phase Status

- **Phase 1 (Foundation)** ✅ — auth, trip lifecycle, mobile app, admin dashboard
- **Phase 2 (Scale)** ✅ — live weather/AQI APIs, dynamic pricing, hourly reimbursement, eligibility gate, per-user trip scoping
- **Phase 3 (Post-Hackathon)** — live IMD API, Razorpay UPI, Isolation Forest training, GenAI adjudication, Blinkit webhook

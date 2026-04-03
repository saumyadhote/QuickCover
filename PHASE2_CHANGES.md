# QuickCover — Phase 2 Implementation Summary

> All changes implemented during the Phase 2 (Scale / Intelligence) sprint.
> Backend is live on Render. Admin dashboard is live on Vercel. Mobile connects via Expo Go.

---

## Overview

Phase 2 transformed QuickCover from a working prototype into a production-credible parametric insurance platform. The five core deliverables were the technical audit targets; five additional features were implemented to close gaps identified during development.

---

## 1. Registration & Authentication Flow

**Files:** `mock-backend/auth.js`, `mock-backend/database.js`

- `POST /auth/register` — creates a user account, hashes password with bcrypt (12 rounds), persists to `users` table (SQLite/PostgreSQL), returns a 30-day JWT
- `POST /auth/login` — verifies credentials, handles PostgreSQL case-sensitivity on column names (`passwordHash` / `passwordhash`), returns JWT
- `GET /auth/me` — validates token, returns current user profile
- Zone selection at registration (`zoneId`: ZONE_A/B/C) stored on `users` table
- Auto-seeded demo account (`demo@quickcover.in / demo1234`) on every backend startup with 25 qualifying trips pre-loaded

---

## 2. Insurance Policy Sessions

**Files:** `mock-backend/server.js`, `mock-backend/database.js`

- `policy_sessions` table created in both SQLite and PostgreSQL schemas
- On every `POST /accept-trip`, a `policy_sessions` record is inserted with: `userId`, `startTime`, `microFee` (live-calculated), `riskLevel`, `zoneId`, `status: 'active'`
- Sessions are closed (`status: 'completed'`) on `/complete-trip` and (`status: 'disrupted'`) on `/trigger-disruption`
- Zero-touch cron also closes sessions (`status: 'disrupted'`) when auto-creating claims
- Provides a per-worker auditable coverage record for every trip window

---

## 3. Live Dynamic Premium Calculation

**Files:** `mock-backend/live_parametric_triggers.js`

- `calculate_live_dynamic_surcharge(lat, lon)` — parallel calls to OpenWeatherMap `/weather` and `/air_pollution`
- Composite risk score from three signals:
  - Rain component: `rainfall_mm_hr / 40` (max 1.0), weight 55%
  - Heat component: `(temp - 30) / 20` above 30°C, weight 30%
  - AQI component: `cpcb_aqi / 500`, weight 15%
- Output: ₹1.50–₹5.00 surcharge + risk level (Low / Medium / High / Critical)
- Small jitter (±₹0.04) applied to simulate real-world micro-variance between polling intervals
- Falls back to mock forecast when `WEATHER_API_KEY` is absent — demo still functions
- Auto-runs every 15 seconds via `setInterval` in `server.js`

**New endpoint (Phase 2 addition):** `POST /pricing/zone`
- Returns live per-zone pricing without touching global state
- Used by the admin Pricing Engine tab zone dropdown

---

## 4. Parametric Triggers (4 Live Triggers)

**Files:** `mock-backend/live_parametric_triggers.js`, `mock-backend/server.js`

All triggers use real HTTP calls via `axios` + `process.env.WEATHER_API_KEY`. No hardcoded mock data on the trigger path.

| # | Trigger | Threshold | API | Implementation |
|---|---|---|---|---|
| 1 | Heavy Rainfall | >15 mm/hr | OpenWeatherMap `/weather` → `rain['1h']` | `check_live_weather()` |
| 2 | Extreme Heat | >43°C | OpenWeatherMap `/weather` → `main.temp` | `check_live_weather()` |
| 3 | Severe AQI | CPCB >300 | OpenWeatherMap `/air_pollution` → PM2.5 → CPCB linear interpolation | `check_live_aqi()` |
| 4 | Platform Outage | >90 min active | Admin webhook + DB check | `POST /admin/zone-outage` + cron |

### AQI Conversion
PM2.5 → CPCB AQI via 6-band linear interpolation table matching India's Central Pollution Control Board standards. OWM's 1–5 scale is not used directly.

### Platform Outage (4th Trigger)
- `POST /admin/zone-outage` — logs outage start or resolution per zone
- `GET /admin/zone-outages` — lists active outages with elapsed minutes and `will_trigger` flag
- Cron evaluation checks `zone_outages` table for outages ≥90 min and appends them to breached zones

---

## 5. Zero-Touch Claims Management

**Files:** `mock-backend/server.js` → `runTriggerEvaluation()`

`runTriggerEvaluation()` is the core automated claim engine:

1. Calls `evaluate_all_zones(OPERATIONAL_ZONES)` — parallel live API checks across all 3 zones
2. Checks `zone_outages` table for 4th-trigger outages ≥90 min
3. For each breached zone, queries `policy_sessions WHERE status = 'active' AND zoneId = <zone>`
4. Deduplicates: skips any worker with a `pending_review` or `processing` trip in the last 60 minutes
5. Inserts one `pending_review` trip per eligible worker, tagged with `userId`, `zoneId`, `disruptionType`
6. Closes the worker's active policy session (`status: 'disrupted'`)
7. Updates global `state` table disruption banner

**Runs automatically** every 60 seconds via `setInterval` when `WEATHER_API_KEY` is present.
**Manual trigger** available at `POST /cron/evaluate-live-triggers`.

---

## 6. Admin Dashboard — Zone Outage Manager

**Files:** `admin-frontend/src/App.tsx`

New panel added to the Overview tab:

- Per-zone Start Outage / Resolve buttons for ZONE_A, ZONE_B, ZONE_C
- Live elapsed-time display with countdown to 90-minute auto-claim threshold
- `will_trigger` status badge
- Polls `GET /admin/zone-outages` every 15 seconds
- All actions push timestamped events to the Live Operations Feed

---

## 7. Admin Dashboard — Zero-Touch Cron Eval Panel

**Files:** `admin-frontend/src/App.tsx`

New panel added to the Overview tab alongside the Zone Outage Manager:

- **Run Trigger Evaluation Now** button → `POST /cron/evaluate-live-triggers`
- Displays result: claims created, breached zones with disruption types
- Green (all clear) / Red (breach) result card with zone-level detail
- Confirms the 30-second API timeout for live weather lookups
- Note: also runs automatically every 60s server-side

---

## 8. Admin Dashboard — Per-Zone Pricing Engine

**Files:** `admin-frontend/src/App.tsx`, `mock-backend/server.js`

Zone selector dropdown added to the Pricing Engine tab:

- Dropdown: ZONE_A (Bengaluru), ZONE_B (Mumbai), ZONE_C (Delhi)
- On zone change: `POST /pricing/zone` fetches real-time surcharge, risk level, risk score, and raw drivers (`rainfall_mm_hr`, `temp_celsius`, `cpcb_aqi`)
- Hero card, risk classification, and fee decomposition bars all update to the selected zone's live values
- **Signal strip** shows raw API readings with threshold callouts ("heavy rain threshold breached", "AQI within acceptable range", etc.)
- LIVE / MOCK badge indicates data source
- Each zone returns a genuinely different price — Mumbai monsoon vs Delhi heat vs Bengaluru AQI

---

## 9. Shift-Level Payout Capping (Financial Safeguard)

**Files:** `mock-backend/server.js`, `mobile/context/MockDataContext.tsx`, `mobile/app/(tabs)/claims.tsx`

Prevents double-dipping during prolonged disruption events.

### Backend Logic

Before approving any claim in `/trigger-disruption`:

```
SELECT id FROM trips
WHERE "userId" = $1
  AND "disruptionType" = $2
  AND status = 'disrupted'
  AND timestamp >= <8 hours ago in UTC>
```

- **No prior payout found** → proceed with normal claim processing and payout
- **Prior payout found** → insert `coverage_honored` trip (audit record), set `claimStatus = 'coverage_honored'` in global state, return HTTP 200 immediately — no financial transfer, no setTimeout approval pipeline

All timestamps compared server-side in UTC. Device timezone cannot be exploited to game the 8-hour window. Unauthenticated requests skip the check (cannot scope to a specific driver).

### Mobile Context

`claimStatus` union type extended to include `'coverage_honored'`. The existing `setState(res.data.state)` call handles it correctly since the backend returns HTTP 200. Fast-poll stops naturally since `coverage_honored` is a terminal state (not `processing` or `approved`).

### Mobile UI — CoverageHonoredCard

When `claimStatus === 'coverage_honored'`, the `ClaimTimeline` is replaced by a green `CoverageHonoredCard`:

> "Shift Income Protection for this weather event has already been successfully fulfilled for your current shift. Your base trip earnings remain unaffected."

- Green shield icon, success-style card (not an error state)
- Shift window explanation strip: why no second transfer (8-hour cap rationale)
- "Report a different disruption?" prompt available — worker can still claim for a genuinely different event type (e.g., OUTAGE after a WEATHER payout)

---

## New API Endpoints Added in Phase 2

| Method | Path | Description |
|---|---|---|
| `POST` | `/pricing/zone` | Live pricing for a specific zone (no global state mutation) |
| `POST` | `/admin/zone-outage` | Start or resolve a platform outage for a zone |
| `GET` | `/admin/zone-outages` | List active outages with elapsed time and trigger status |
| `POST` | `/cron/evaluate-live-triggers` | Manual trigger of zero-touch claim evaluation |

---

## Database Schema Additions

| Table | Change |
|---|---|
| `policy_sessions` | New table — per-trip coverage records |
| `zone_outages` | New table — admin-logged platform outages |
| `trips.zoneId` | New column — zone tag for auto-claims |
| `trips.disruptionType` | New column — disruption type tag for dedup and cap checks |
| `state.lastPayoutAmount` | New column — last payout for admin display |

All additions are migration-safe: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for PostgreSQL, `try/catch` for SQLite.

---

## Environment Variables

No new environment variables were added in Phase 2. All features use `WEATHER_API_KEY` (existing) and `JWT_SECRET` (existing).

---

## End-to-End Demo Flow

```
1. Login (demo@quickcover.in / demo1234)
2. Accept trip → policy session created, live surcharge displayed
3. Complete trip → trip recorded, session closed
4. File disruption claim → eligibility check → 8-hour cap check → AI verification (4s) → approved → paid
5. File same disruption type again (within 8h) → CoverageHonoredCard shown, no double-payment
6. Admin: Zone Outage Manager → Start Outage on ZONE_A → Run Cron Eval → auto-claims created for active workers
7. Admin: Pricing Engine → switch zone dropdown → see different live fee per zone
```

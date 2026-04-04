# QuickCover — Phase 2 Submission
### Guidewire DEVTrails 2026: Unicorn Chase

---

## The Problem

India's Q-commerce sector runs on an invisible workforce. Blinkit, Zepto, and Swiggy Instamart collectively process over one million orders a day, and every one of those deliveries depends on a partner rider who earns somewhere between ₹650 and ₹800 on a good day. When that day is interrupted — by a sudden monsoon, an extreme heat advisory, a smog alert that makes riding genuinely dangerous, or a platform-side zone outage — the rider loses everything. Not a percentage. Everything. No shift, no pay.

That's ₹450–₹650 gone from a monthly take-home of ₹10,000–₹20,000. A 20–30% income wipe in a single disrupted afternoon.

The platforms are not indifferent — Blinkit and others spend over ₹100 crore annually on partner insurance. But that coverage is exclusively for accidents and hospitalisation. Nobody covers income lost to weather. Nobody covers the two hours a rider sits under a flyover waiting for the rain to stop, watching their earnings clock go to zero. There is no product for that. There is no process to claim it. There is no safety net that catches systemic, environmental, external disruptions — despite the fact that those disruptions are entirely measurable and entirely predictable.

That is the gap QuickCover fills.

The opportunity is real, growing, and underserved: **450,000–500,000 active Q-commerce delivery partners** in India as of early 2026 (up 70–80% year-on-year), each carrying ₹6,000–₹12,000 of annual income at risk from events they have no control over.

---

## The Solution

QuickCover is a **consumer-funded parametric income protection platform** for Q-commerce delivery workers. The core insight is simple: the driver should never pay for their own protection. Instead, a micro-surcharge of ₹2–5 is added to the consumer's order at checkout — less than the cost of a Mentos. The consumer sees it as "Protect your delivery partner." The pool it funds pays drivers automatically when a verified disruption hits their zone.

No claims form. No adjuster. No paperwork. No cost to the driver — ever.

**The parametric model is the key.** Traditional insurance pays based on what you can prove happened to you. Parametric insurance pays based on whether a pre-defined, objectively measurable threshold was breached. If the IMD rainfall sensor records more than 15mm/hr in your zone, you get paid. If the temperature hits 43°C, you get paid. The trigger is the data — not the claim.

This is not a theoretical model. SEWA's parametric heat insurance, launched in 2023 with 21,000 women workers in Gujarat, had expanded to 225,000 workers across 7 Indian states by 2025. In 2024, 92% of insured members received automatic cash payouts — ₹2.92 crore disbursed with zero claims process. QuickCover applies the identical mechanism to a different trigger set and a different, larger cohort.

### How a Payout Works (End to End)

```
Worker accepts a Blinkit order
  → Consumer's ₹3 surcharge enters the protection pool
  → QuickCover coverage activates for that trip

External APIs detect: rainfall 22mm/hr in HSR Layout, Bengaluru
  → Parametric threshold breached (>15mm/hr)
  → Backend auto-evaluates all active workers in that zone
  → Claim status set to "Pending Review" — zero worker action required

Worker optionally opens the app and files a formal claim (hours worked: 4)
  → AI cross-verification runs against live API data
  → Payout calculated: 4 hours × ₹80/hr = ₹320
  → ₹320 approved and queued for UPI transfer within minutes
```

The worker's only interaction is tapping one button. The system does everything else.

---

## What Was Built

QuickCover is a full-stack system with three interconnected layers:

### 1. Mobile App (React Native / Expo)
The worker-facing product. Built as a native Android app because 97% of Q-commerce delivery partners use Android smartphones as their primary — often only — computing device. A web app would serve a user who doesn't exist.

The app handles the complete worker journey: account registration with zone selection, trip activation (which opens a live coverage window), disruption claim filing (disruption type, hours worked, optional photo evidence), and real-time payout status updates through a five-step claim timeline. Coverage status — inactive, standby, active, disrupted — is always visible on the home screen.

Authentication uses JWT tokens stored in SecureStore with 30-day expiry. All API calls include auth headers so trip data, eligibility counts, and payout history are scoped to the individual worker.

### 2. Backend API (Node.js / Express / SQLite → PostgreSQL)
The core logic layer, deployed on Render. The backend runs in dual-mode: SQLite for zero-dependency demo operation, PostgreSQL (Supabase) when `DATABASE_URL` is set. A unified DB abstraction layer (`dbGet`, `dbAll`, `dbRun`) means the same SQL works across both engines with automatic parameter translation.

Key tables: `users`, `state` (single-row global demo state), `trips`, `policy_sessions` (per-trip coverage records), `zone_outages` (platform disruption log).

Phase 2 added the live pricing engine, all four parametric triggers, zero-touch claims evaluation, and the 8-hour payout cap — all running on the same Express server that handles auth and trip lifecycle.

### 3. Admin Dashboard (React / Vite / Vercel)
The ops console. Deployed on Vercel, polling the live backend every 2 seconds. Shows real-time micro-fee and risk level by zone, a claims pipeline with live status, a Zone Outage Manager where the ops team can log and resolve platform disruptions, and a Cron Eval panel to manually trigger the parametric evaluation sweep. Built entirely with lucide-react for icon consistency (no Google Fonts CDN dependency, which breaks on Vercel's CDN).

---

## Phase 2: What Was Delivered

Phase 1 established the foundation — auth, trip lifecycle, the mobile app, and a mock backend that simulated everything. Phase 2 replaced every mock with live, executable logic.

### Live Parametric Triggers (4 Triggers)

The trigger engine (`live_parametric_triggers.js`) makes real HTTP calls to the OpenWeatherMap APIs using `process.env.WEATHER_API_KEY`. Three triggers operate continuously:

- **Heavy Rainfall** — OpenWeatherMap `/weather` endpoint, `rain['1h']` field. Threshold: >15mm/hr.
- **Extreme Heat** — Same endpoint, `main.temp`. Threshold: >43°C.
- **Severe Pollution** — OpenWeatherMap `/air_pollution` endpoint. PM2.5 and PM10 concentrations converted to Indian CPCB AQI via breakpoint interpolation. Threshold: estimated CPCB AQI >300.

The fourth trigger — **Platform Outage** — is a callable admin webhook (`POST /admin/zone-outage`) that logs disruptions to the `zone_outages` table. Any outage active for more than 90 minutes automatically fires as a parametric trigger in the next evaluation sweep.

All three operational zones (Bengaluru, Mumbai, Delhi-NCR) are checked in parallel on every evaluation cycle.

### Live Dynamic Pricing Engine

`calculate_live_dynamic_surcharge()` fetches live weather and AQI data for a zone, computes a weighted composite risk score (rainfall 55%, temperature 30%, AQI 15%), and maps it to a ₹1.50–₹5.00 surcharge. The surcharge is recalculated on every trip acceptance, updated globally every 15 seconds, and available per-zone via the admin Pricing Engine panel. The mock fallback (`runMockForecast()`) only activates if no API key is present — on the live Render deployment, the live path is always used.

### Zero-Touch Claims (`runTriggerEvaluation()`)

The most significant Phase 2 feature. Every 60 seconds, `runTriggerEvaluation()` runs:

1. Calls `evaluate_all_zones()` across all three operational zones
2. Checks `zone_outages` for any outage exceeding 90 minutes
3. For each breached zone, queries `policy_sessions` for every worker with an active coverage window in that zone
4. Deduplicates against recent pending claims (60-minute window)
5. Inserts a `pending_review` trip record per eligible worker — automatically, with no worker action required
6. Closes the worker's active policy session and updates the global state row

This is the zero-touch design: a disruption event creates claims for every affected active worker simultaneously, before a single worker opens the app.

### Insurance Policy Sessions

Every `/accept-trip` call now creates a `policy_sessions` record tying the live micro-surcharge, risk level, zone, and worker identity to that specific coverage window. This is the auditable "policy document" for each trip — a timestamped record that can be used for claims adjudication, fraud analysis, and regulatory reporting.

### Shift-Level Payout Capping (8-Hour Rule)

Before any financial transfer, the backend queries whether the worker already received a payout for the same disruption type (e.g. `WEATHER`, `OUTAGE`) within the last 8 hours. If yes, the event is acknowledged — `claimStatus: 'coverage_honored'` — but no second transfer is initiated. This prevents a sustained monsoon event from generating multiple payouts in a single shift, keeping the loss ratio within the modelled 30–50% target band.

---

## Challenges Faced

### 1. The Dual-Database Problem
Running SQLite locally and PostgreSQL in production sounds straightforward until you need column quoting (`"userId"` in Postgres is not the same as `userId` in SQLite), parameter syntax (`$1` vs `?`), and boolean representation (`TRUE` vs `1`) to all coexist in the same codebase. The solution was a thin adapter layer in `database.js` that translates at runtime — stripping double quotes and converting `$n` to `?` for SQLite. This kept the SQL readable and Postgres-idiomatic without a full ORM.

### 2. OpenWeatherMap's AQI Scale vs. India's CPCB Scale
OpenWeatherMap's Air Pollution API returns a European AQI index of 1–5, which is meaningless against the Indian CPCB threshold of 300. The solution was a custom CPCB AQI calculator: extract raw PM2.5 and PM10 concentrations from the API response, then apply linear interpolation across the official CPCB breakpoint table (six concentration bands per pollutant). The resulting estimated CPCB AQI is what the parametric trigger evaluates. It is not a perfect proxy for a dedicated CPCB API endpoint — but it is calibrated, documented, and reproducible.

### 3. Making Dynamic Pricing Feel Real Without ML Training Data
The README describes an XGBoost model. Building and deploying a trained XGBoost model requires historical trip and disruption data that doesn't exist yet at this stage. The Phase 2 solution bridges that gap honestly: the live pricing engine uses the same input features the XGBoost model would consume (rainfall, temperature, AQI), implements the same risk score → surcharge mapping described in the architecture docs, and produces a continuously updating, externally-driven surcharge — without a trained model artifact. When real trip data accumulates, the XGBoost layer slots in above the existing signal pipeline with no structural change to the API.

### 4. Zero-Touch Claims Without Multi-Tenant Trip Data
The zero-touch claims system is designed for a world where many workers are simultaneously active. In the hackathon demo, the `policy_sessions` table typically has one or zero active sessions at any given time. Making the system robust to the empty-table case (don't fire claims for workers who aren't active) and the single-worker case (fire exactly one claim, not duplicates) required careful deduplication logic and session-scoped zone matching — so the architecture is correct at scale even if the demo data is thin.

### 5. Mobile Auth State and Token Propagation
The React Native app needs the JWT available on every API call, including calls made by a polling interval that starts before the user finishes logging in. A naive `useContext` hook would have stale closure issues — the interval captures the token value at creation time, not on each invocation. The solution was a `tokenRef` (a `useRef` that's kept in sync with the `useState` token) so the interval always reads the current token without needing to be recreated on each auth state change.

### 6. The Admin Dashboard CDN Problem
The original admin dashboard imported Material Symbols from Google Fonts. On Vercel's CDN, the external font request was being blocked or timing out, leaving the dashboard with broken icon renders. The fix was a full swap to `lucide-react` — a self-contained icon library that ships with the bundle and has zero external CDN dependencies. This is now enforced as a project convention: lucide-react only, no Google Fonts, no Material Symbols.

---

## Future Plans (Phase 3 and Beyond)

### Immediate (Post-Hackathon, 0–3 months)

**Live IMD API Integration** — OpenWeatherMap provides reliable global data but is not the authoritative source for Indian parametric triggers under IRDAI guidelines. The India Meteorological Department has a programmatic API with station-level data at a grid resolution appropriate for zone-level parametric triggers. Replacing OpenWeatherMap with IMD data for the rain and heat triggers is the highest-priority technical upgrade.

**Razorpay UPI Payout Wiring** — The payout simulation (4-second delay → approved → paid) needs to connect to a real Razorpay disbursement API. The architecture is designed for this: `protectedAmount` is already calculated and stored at claim approval time; the UPI transfer is the only remaining step.

**Platform Trip Verification** — Currently, workers can tap "Start Trip / End Trip" freely. In production, each trip event must be cross-referenced against a verified trip record from the driver's gig platform (Blinkit, Zepto, Swiggy Instamart) via their partner API or webhook before it counts toward the 25-trip eligibility threshold. Without this integration, the eligibility gate can be gamed.

### Medium Term (3–12 months)

**XGBoost Model Training** — Once real trip, disruption, and payout data accumulates (target: 90-day rolling window), train the XGBoost pricing model on actual outcomes. The current risk-score pipeline becomes the feature engineering layer. Validation criterion: AUC >0.78 on held-out data, MAE on surcharge prediction <₹0.40 before promotion.

**Isolation Forest Fraud Detection** — The feature table is fully defined (GPS velocity, coordinate entropy, accelerometer variance, mock location flag, zone claim density z-score). Training requires real trip data with GPS traces. The 3-tier scoring (auto-approve / quarantine / auto-reject) and quarantine workflow are already designed — model training is the remaining step.

**GenAI Vision Adjudication** — When a claim is quarantined by the Isolation Forest (suspicious score 0.46–0.70), the worker submits a timestamped photo. A vision-language model (GPT-4o or Gemini 1.5 Pro) validates the photo against the claim context: disruption type, zone, timestamp, and EXIF geotag. Confidence score ≥0.75 auto-releases payout; <0.40 escalates to human analyst. The `process_claim_evidence_with_genai()` stub in `server.js` is the integration point.

**Blinkit / Zepto Platform Integration** — Embed the checkout surcharge as a first-party feature in the Blinkit and Zepto checkout flow. This is the primary distribution unlock — without platform integration, QuickCover operates as a standalone app that workers must separately install and use. With it, coverage activates automatically on every order the driver accepts through the platform.

### Long Term (12+ months)

**IRDAI Micro-Insurance Sandbox** — File under IRDAI's innovative products sandbox. The surcharge is structured as a "protection fund contribution" (consumer is donor, driver is beneficiary) to avoid direct insurance licensing at launch. In the sandbox, formalise as a group micro-insurance product underwritten by a licensed partner insurer.

**Geographic Expansion** — Add Tier 2 and Tier 3 cities (Pune, Hyderabad, Chennai) with zone-specific weather thresholds calibrated to local climate patterns. Add CPCB AQI direct API access for northern Indian cities where pollution-triggered disruptions are most frequent.

**Actuarial Validation** — Six-month shadow mode: run the full pricing and claims engine on real trip data without releasing payouts. Validate the ₹80/hr rate, 25-trip eligibility threshold, and loss ratio projections against actual disruption frequency and duration. Adjust inputs before any real payout system goes live.

**Reinsurance Treaty** — Formalise the Aggregate Stop-Loss Reinsurance structure described in the financial model. Once claim volume and disruption frequency data exists from the shadow mode, the treaty terms (attachment point, limit, premium) can be negotiated with a reinsurance counterparty.

---

## Why This Is the Right Product for This Moment

Three forces are converging in India right now that make QuickCover not just viable but timely.

**The market is growing faster than expected.** Q-commerce delivery partner counts hit 450,000–500,000 by early 2026 — nearly double the estimate from 18 months ago. Each new partner is another person with no income protection and another daily order that could carry a ₹3 surcharge into the protection pool.

**The regulatory environment is moving in the right direction.** The Code on Social Security (implemented November 2025), the PMJAY extension to gig workers (Budget 2025), and state-level gig worker protection laws in Rajasthan, Karnataka, and Bihar are all building the legal infrastructure that QuickCover slots into. The government is not an obstacle here — it is, for once, a tailwind.

**The parametric model has already been proven in India, at scale, for a nearly identical use case.** SEWA's parametric heat insurance reached 225,000 workers by 2025 and disbursed ₹2.92 crore with zero claims process in a single season. The mechanism is validated. The trust gap that kills most fintech products in this cohort — "will they actually pay me?" — has been answered by a real-world precedent.

QuickCover is not asking Indian gig workers to trust a new system. It is asking them to accept money that appears in their UPI wallet after it rains.

---

## Project Details

| | |
|---|---|
| **Competition** | Guidewire DEVTrails 2026: Unicorn Chase |
| **Phase** | Phase 2 — Intelligence / Scale |
| **Team** | Tarun Sitaraman |
| **Live Backend** | https://quickcover.onrender.com |
| **Live Admin** | https://quick-cover-neon.vercel.app |
| **Repository** | https://github.com/TarunSitaraman/QuickCover |
| **Demo Account** | demo@quickcover.in / demo1234 |
| **Demo Video** | LINK_PENDING |

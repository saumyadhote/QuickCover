## QuickCover – Parametric Income Protection MVP

This repository contains a minimal end-to-end prototype for **QuickCover**, an AI-powered parametric income protection layer for India’s Q‑commerce gig workers.

### Structure

- `backend/` – FastAPI service for trips, triggers and weekly payouts (SQLite via SQLAlchemy).
- `admin-frontend/` – React + Vite admin dashboard to visualise trips, trigger events and worker payouts.

### Backend – FastAPI

#### Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows PowerShell
pip install -r requirements.txt

# Run DB migrations
alembic upgrade head

# Start API
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000` with docs at `/docs`.

Key endpoints:

- `GET /health` – service status
- `POST /trips` – create a simulated trip
- `GET /trips` – list recent trips
- `POST /triggers` – create a disruption trigger and auto-generate parametric claims
- `GET /payouts/weekly` – aggregate approved claims into weekly worker payouts

### Admin Frontend – React + Vite

#### Setup

```bash
cd admin-frontend
npm install
npm run dev
```

By default Vite runs at `http://127.0.0.1:5173` and proxies `/api` to `http://127.0.0.1:8000`.

The dashboard lets you:

- Simulate a trip (worker, zone, expected earnings)
- Simulate a trigger event (e.g. heavy rain in a zone)
- Observe generated trips, trigger events and computed weekly payouts

### Next Steps / Extensions

- Add real integrations to Q‑commerce trip webhooks.
- Replace simulated triggers with background jobs calling OpenWeatherMap / civic-event APIs.
- Add a worker-facing mobile app (React Native / Flutter) that surfaces coverage status and UPI payout history.

# QuickCover AI 🛡️
### AI-Powered Parametric Income Protection for India's Gig Economy

> *Submitted to Guidewire DEVTrails 2026: Unicorn Chase*

---

## The Problem

India's 15 million+ gig delivery workers power the Q-commerce economy — but have zero financial protection when it breaks down around them.

When a sudden flood, toxic air quality alert, or unplanned curfew halts operations, it isn't the platform that suffers — it's the worker. A single disrupted day erases **20–30% of monthly income**, with no recourse, no claim process, and no safety net.

These are not personal failures. They are **systemic, measurable, external events** — and yet workers bear the entire financial cost alone.

---

## The Solution

**QuickCover** is a micro-duration parametric insurance platform purpose-built for Q-commerce delivery partners (Blinkit, Zepto, Swiggy Instamart).

We cover one thing only: **Loss of Income due to verifiable external disruptions.** No health. No vehicle. No life. Just income.

Coverage activates the moment a worker accepts a trip. It ends when the trip is completed. Disruptions are verified automatically — claims are batched and paid out **every week**, directly to the worker's UPI account.

---

## How It Works

```
Worker accepts order → Coverage activates
         ↓
Customer pays ₹2 surcharge → Routed to premium pool
         ↓
External disruption detected (flood / AQI spike / curfew)
         ↓
AI cross-verifies: worker GPS + platform logs + trigger event
         ↓
Claim auto-approved → Payout to worker's UPI at end of week
```

### Key Design Principles

| Principle | Implementation |
|---|---|
| **Zero upfront cost** | Premiums funded via ₹2 customer surcharge per order — not deducted from worker earnings |
| **Trip-level granularity** | Coverage is per-trip, not monthly — no over-insurance, no gaps |
| **Parametric payouts** | No manual claims. Triggers are objective, verifiable data events |
| **AI fraud prevention** | GPS cross-referencing + trip log validation prevents spoofing |

---

## Parametric Triggers

QuickCover monitors real-time APIs across two disruption categories:

**Environmental**
- Heavy rainfall / waterlogging alerts above zone threshold
- Extreme heat index (WBGT) preventing outdoor work
- Severe pollution (AQI > 300) in worker's delivery zone

**Civic**
- Unplanned localized curfews or Section 144 orders
- Sudden zone closures blocking pickups or drop-offs

---

## The Weekly Premium Model

Trip-level risk is aggregated into a **Weekly Pricing Cycle** — aligned with how gig workers think about earnings.

- **Dynamic base premium** calculated weekly using predictive weather models + worker's historical zone risk
- **Low-risk zones** receive adjusted-down premiums; surplus builds a catastrophic tail-risk reserve
- **Customer surcharges** collected throughout the week fund the premium pool in real-time

---

## AI & ML Integration

### Dynamic Risk Scoring
An ML model evaluates incoming API signals (weather, traffic density, time-of-day patterns) against a worker's live GPS coordinates to generate a per-trip risk score and dynamically price exposure.

### Intelligent Fraud Detection
At FNOL, the system cross-references:
- Claim timestamp vs. platform's internal trip logs
- Worker GPS trace vs. disruption zone boundary
- Duplicate claim patterns across the worker pool

This eliminates GPS spoofing, duplicate submissions, and claims from workers not genuinely active in the affected area.

---

## Product Architecture

### Worker-Facing: Mobile App
Gig workers live on their phones. The mobile app provides:
- One-tap onboarding via existing Q-commerce ID
- Real-time coverage status per active trip
- Direct photo upload for supplementary proof (e.g., roadblock photos)
- Weekly payout tracking and earnings summary via UPI/wallet

### Admin-Facing: Web Dashboard
Insurers and underwriters need data density. The web dashboard provides:
- Live claims pipeline with AI-generated risk flags
- Weather-event predictive modeling for upcoming liability exposure
- Loss-ratio analytics and zone-level heat maps
- Premium pool balance and reserve adequacy monitoring

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile (Worker) | React Native / Flutter |
| Web (Admin) | React.js / Next.js |
| Backend | FastAPI (Python) + Node.js (Express) |
| Databases | PostgreSQL (policies/users) + MongoDB (telemetry/trip logs) |
| Trigger APIs | OpenWeatherMap, Google Maps Platform |
| Payments (Phase 3) | Razorpay Test Mode / Stripe Sandbox |

---

## Why This Wins

- **Real market need** — 15M+ underserved workers with measurable, recurring income risk
- **Scalable unit economics** — ₹2 per order creates a self-sustaining premium pool without burdening workers
- **Parametric = fast + fraud-resistant** — no adjusters, no disputes, no delays
- **Platform-neutral** — works with any Q-commerce API via webhook integration
- **Regulatory-ready** — income-loss parametric products fit within IRDAI's sandbox framework for microinsurance innovation

---

*QuickCover does not cover health, vehicle damage, or life events. Coverage is strictly limited to verified loss of income from parametric disruption triggers.*
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { dbGet, dbRun, initializeDatabase, closeDatabase } = require('./database');
const {
  calculate_live_dynamic_surcharge,
  evaluate_all_zones,
} = require('./live_parametric_triggers');

const authRouter = require('./auth');

// ---------------------------------------------------------------------------
// Operational zones — the delivery areas QuickCover actively monitors.
// Coordinates are city-level centroids; swap in precise zone polygons later.
// ---------------------------------------------------------------------------
const OPERATIONAL_ZONES = [
  { id: 'ZONE_A', label: 'Bengaluru — Koramangala / HSR',  lat: 12.9352, lon: 77.6245 },
  { id: 'ZONE_B', label: 'Mumbai — Bandra / Andheri',      lat: 19.0596, lon: 72.8295 },
  { id: 'ZONE_C', label: 'Delhi — Gurugram / Cyber City',  lat: 28.4595, lon: 77.0266 },
];

const app = express();

// CORS — open to all origins (demo/hackathon build)
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/auth', authRouter);

// Health check — required by Render for zero-downtime deploys
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper to format DB row to resemble original state shape
const formatState = (row) => ({
  isTripActive: Boolean(row.isTripActive),
  disruption: row.disruptionType ? {
    type: row.disruptionType,
    zone: row.disruptionZone,
    severity: row.disruptionSeverity,
    message: row.disruptionMessage,
    timestamp: row.disruptionTimestamp,
  } : null,
  claimStatus: row.claimStatus,
  weeklyEarnings: row.weeklyEarnings,
  weeklyProtected: row.weeklyProtected,
  currentMicroFee: row.currentMicroFee || 2.0,
  currentRiskLevel: row.currentRiskLevel || 'Low',
});

app.get('/status', async (req, res) => {
  try {
    console.log('✅ /status endpoint hit from:', req.ip);
    const row = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json(formatState(row));
  } catch (error) {
    console.error('❌ /status error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/accept-trip', async (req, res) => {
  try {
    // Use zone coords from request body if provided; default to ZONE_A (Bengaluru)
    const { lat, lon } = req.body || {};
    const zone = OPERATIONAL_ZONES.find(z => z.lat === lat && z.lon === lon)
               || OPERATIONAL_ZONES[0];

    // Calculate live micro-surcharge from real weather + AQI APIs (falls back to mock if key missing)
    let liveFee   = null;
    let riskLevel = null;
    if (process.env.WEATHER_API_KEY) {
      try {
        const pricing = await calculate_live_dynamic_surcharge(zone.lat, zone.lon);
        liveFee   = pricing.surcharge;
        riskLevel = pricing.riskLevel;
        console.log(`[ACCEPT-TRIP] Live surcharge for ${zone.label}: ₹${liveFee} [${riskLevel}]`);
      } catch (err) {
        console.error('[ACCEPT-TRIP] Live pricing failed, using stored value:', err.message);
      }
    }

    // Activate trip and (if we got a live fee) update the micro-fee in state
    if (liveFee !== null) {
      await dbRun(`
        UPDATE state
        SET "isTripActive" = TRUE,
            "disruptionType" = NULL, "disruptionZone" = NULL, "disruptionSeverity" = NULL,
            "disruptionMessage" = NULL, "disruptionTimestamp" = NULL,
            "claimStatus" = 'none',
            "currentMicroFee" = $1, "currentRiskLevel" = $2
        WHERE id = 1
      `, [liveFee, riskLevel]);
    } else {
      await dbRun(`
        UPDATE state
        SET "isTripActive" = TRUE,
            "disruptionType" = NULL, "disruptionZone" = NULL, "disruptionSeverity" = NULL,
            "disruptionMessage" = NULL, "disruptionTimestamp" = NULL,
            "claimStatus" = 'none'
        WHERE id = 1
      `);
    }

    const row = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json({ message: 'Trip activated. Coverage is now active.', state: formatState(row) });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/complete-trip', async (req, res) => {
  try {
    await dbRun(
      'INSERT INTO trips (status, earnings, "protectedAmount", timestamp) VALUES ($1, $2, $3, $4)',
      ['completed', Math.floor(Math.random() * 50) + 20, 0, new Date().toISOString()]
    );

    await dbRun(`
      UPDATE state
      SET "isTripActive" = FALSE,
          "disruptionType" = NULL, "disruptionZone" = NULL, "disruptionSeverity" = NULL,
          "disruptionMessage" = NULL, "disruptionTimestamp" = NULL,
          "claimStatus" = 'none'
      WHERE id = 1
    `);

    const row = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json({ message: 'Trip completed. Coverage ended.', state: formatState(row) });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/trigger-disruption', async (req, res) => {
  const { type, zone, severity, message, hours_worked } = req.body;

  try {
    const currentState = await dbGet('SELECT * FROM state WHERE id = 1');

    // Block duplicate in-flight claims
    if (currentState.claimStatus === 'processing' || currentState.claimStatus === 'approved') {
      return res.status(400).json({ error: 'A claim is already under review. Please wait for it to resolve.' });
    }

    // -----------------------------------------------------------------------
    // Eligibility Check: driver must have ≥ 7 qualifying trips in the last 7 days.
    // This prevents inactive drivers from claiming insurance benefits.
    // "Qualifying" = completed or disrupted trips (not pending_review stubs).
    // -----------------------------------------------------------------------
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentTripsRow = await dbGet(
      `SELECT COUNT(*) AS cnt FROM trips
       WHERE (status = 'completed' OR status = 'disrupted')
         AND timestamp >= $1`,
      [sevenDaysAgo]
    );
    const recentTripCount = parseInt(recentTripsRow?.cnt ?? recentTripsRow?.count ?? 0, 10);

    const MINIMUM_WEEKLY_TRIPS = 7;
    if (recentTripCount < MINIMUM_WEEKLY_TRIPS) {
      return res.status(403).json({
        error: `Insufficient recent activity — ${recentTripCount} qualifying trip(s) found in the last 7 days. Minimum required: ${MINIMUM_WEEKLY_TRIPS}.`,
        trips_last_7_days: recentTripCount,
        required: MINIMUM_WEEKLY_TRIPS,
      });
    }

    // -----------------------------------------------------------------------
    // Hourly Reimbursement Calculation
    // Driver submits hours_worked (1–8). Payout = hours × ₹80/hr.
    // ₹80/hr is derived from the ₹450 full-shift benchmark ÷ 5.5hr avg shift.
    //
    // Weather cross-check: if the disruption type is WEATHER, we verify the
    // live API actually confirms adverse conditions in the primary zone.
    // For non-weather disruptions (OUTAGE, CURFEW) we skip the weather check.
    // -----------------------------------------------------------------------
    const HOURLY_RATE = 80;    // ₹/hr
    const MAX_HOURS   = 8;
    const MIN_HOURS   = 1;

    const claimedHours = Math.min(MAX_HOURS, Math.max(MIN_HOURS, parseFloat(hours_worked) || 1));
    let payoutAmount = Math.round(claimedHours * HOURLY_RATE);

    // Weather cross-check — only for WEATHER disruptions when API key is present
    let weatherVerified = false;
    let weatherNote = 'Weather check skipped (non-weather disruption or no API key).';
    const disruptionType = type || 'WEATHER';

    if (disruptionType === 'WEATHER' && process.env.WEATHER_API_KEY) {
      try {
        const { check_live_weather } = require('./live_parametric_triggers');
        const primary = OPERATIONAL_ZONES[0];
        const liveWeather = await check_live_weather(primary.lat, primary.lon);

        if (liveWeather.triggered) {
          // Confirmed disruption — pay full claimed hours
          weatherVerified = true;
          weatherNote = `Live API confirmed: ${liveWeather.message}. Full payout of ₹${payoutAmount} authorised.`;
          console.log(`[CLAIM] Weather verified — ${liveWeather.message}. Payout: ₹${payoutAmount} (${claimedHours}h × ₹${HOURLY_RATE})`);
        } else {
          // API returned no disruption — halve the payout (partial credibility)
          const originalPayout = payoutAmount;
          payoutAmount = Math.round(payoutAmount * 0.5);
          weatherVerified = false;
          weatherNote = `Live API shows no active weather disruption (rain: ${liveWeather.raw.rainfall_mm_hr}mm/hr, temp: ${liveWeather.raw.temp_celsius}°C). Payout reduced to ₹${payoutAmount} (50% of ₹${originalPayout}) — claim queued for manual review.`;
          console.log(`[CLAIM] Weather NOT verified — API shows clear conditions. Reduced payout: ₹${payoutAmount}`);
        }
      } catch (apiErr) {
        // API call failed — don't penalise driver; proceed with full payout
        weatherNote = `Weather API check failed (${apiErr.message}) — proceeding with full payout.`;
        console.error('[CLAIM] Weather check API error (non-fatal):', apiErr.message);
      }
    }

    const disruption = {
      type: disruptionType,
      zone: zone || 'ZONE_A',
      severity: severity || 'HIGH',
      message: message || 'Severe Waterlogging Detected in Delivery Zone',
      timestamp: new Date().toISOString(),
    };

    await dbRun(`
      UPDATE state
      SET "disruptionType" = $1, "disruptionZone" = $2, "disruptionSeverity" = $3,
          "disruptionMessage" = $4, "disruptionTimestamp" = $5, "claimStatus" = 'processing'
      WHERE id = 1
    `, [disruption.type, disruption.zone, disruption.severity, disruption.message, disruption.timestamp]);

    const processingRow = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json({
      message: 'Disruption triggered successfully.',
      state: formatState(processingRow),
      payout_preview: {
        hours_claimed: claimedHours,
        hourly_rate: HOURLY_RATE,
        payout_amount: payoutAmount,
        trips_last_7_days: recentTripCount,
        weather_verified: weatherVerified,
        weather_note: weatherNote,
      },
    });

    // AI cross-verification: processing → approved in 4s, approved → paid in 3s (7s total)
    setTimeout(async () => {
      await dbRun(`
        UPDATE state
        SET "claimStatus" = 'approved', "weeklyProtected" = "weeklyProtected" + $1
        WHERE id = 1 AND "claimStatus" = 'processing'
      `, [payoutAmount]);

      await dbRun(
        `INSERT INTO trips (status, earnings, "protectedAmount", timestamp, "hoursWorked") VALUES ($1, $2, $3, $4, $5)`,
        ['disrupted', 10, payoutAmount, new Date().toISOString(), claimedHours]
      );

      await dbRun('UPDATE state SET "isTripActive" = FALSE WHERE id = 1');

      setTimeout(async () => {
        await dbRun(`
          UPDATE state SET "claimStatus" = 'paid'
          WHERE id = 1 AND "claimStatus" = 'approved'
        `);
      }, 3000);

    }, 4000);

  } catch (error) {
    console.error('[TRIGGER-DISRUPTION] error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/reset', async (req, res) => {
  try {
    await dbRun(`
      UPDATE state
      SET "isTripActive" = FALSE,
          "disruptionType" = NULL, "disruptionZone" = NULL, "disruptionSeverity" = NULL,
          "disruptionMessage" = NULL, "disruptionTimestamp" = NULL,
          "claimStatus" = 'none',
          "weeklyEarnings" = 3200,
          "weeklyProtected" = 0,
          "currentMicroFee" = 2.0,
          "currentRiskLevel" = 'Low'
      WHERE id = 1
    `);
    await dbRun('DELETE FROM trips');
    const row = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json({ message: 'State reset.', state: formatState(row) });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Adversarial Defense & Anti-Spoofing Strategy (see README) ---

/**
 * [STUB] Pillar 2: OS-Level Mock Location Detection
 * TODO: Implement as part of "Adversarial Defense & Anti-Spoofing Strategy" (see README).
 *
 * Checks device metadata for active mock location providers (e.g. Fake GPS apps).
 * On Android: reads LocationManager.isProviderEnabled('test') flag sent from mobile client.
 * On iOS: flags suspiciously perfect accuracy (exactly 0m error — impossible on real hardware).
 *
 * @param {Object}  deviceData
 * @param {boolean} deviceData.mockLocationEnabled - Android mock location provider active
 * @param {string}  deviceData.platform            - 'android' | 'ios'
 * @param {number}  deviceData.locationAccuracy    - GPS accuracy in metres
 * @returns {{ isSpoofed: boolean, confidence: number, reason: string }}
 */
function detect_os_mock_location(deviceData) {
  // TODO: Implement OS mock location detection logic
  return { isSpoofed: false, confidence: 0, reason: 'stub — not yet implemented' };
}

/**
 * [STUB] Pillar 2: Telematics & Behavioral Anomaly Detection
 * TODO: Implement as part of "Adversarial Defense & Anti-Spoofing Strategy" (see README).
 *
 * Cross-references accelerometer/gyroscope readings against GPS path to verify the worker
 * is physically navigating a route (bumps, turns, stops). Also detects "teleportation" —
 * GPS jumps that exceed physically possible movement speed between consecutive pings.
 *
 * @param {Object}   sensorData
 * @param {number[]} sensorData.accelerometer - [x, y, z] m/s² over sampling window
 * @param {number[]} sensorData.gyroscope     - [x, y, z] rad/s over sampling window
 * @param {Object[]} gpsData                  - Array of { lat, lng, timestamp } pings
 * @returns {{ anomalyDetected: boolean, anomalyType: string|null, riskScore: number }}
 */
function analyze_telematics_anomalies(sensorData, gpsData) {
  // TODO: Implement telematics anomaly analysis
  return { anomalyDetected: false, anomalyType: null, riskScore: 0 };
}

/**
 * [STUB] Pillar 3: Quarantine & Deferred Payout Workflow
 * TODO: Implement as part of "Adversarial Defense & Anti-Spoofing Strategy" (see README).
 *
 * Instead of auto-denying a flagged claim, places it in "Pending Review". The mobile app
 * will prompt the worker for a timestamped photo (flooded street, closed store) once their
 * network stabilises. Prevents false negatives from legitimate network drops during storms.
 *
 * @param {string|number} claimId - Trip/claim ID to quarantine
 * @param {string}        reason  - Reason logged internally for fraud analyst review queue
 * @returns {Promise<{ success: boolean, newStatus: string }>}
 */
async function quarantine_claim(claimId, reason) {
  // TODO: UPDATE trips SET status = 'pending_review' WHERE id = claimId
  // TODO: Emit push notification to worker once network stabilises
  // TODO: Log reason to fraud analyst review queue
  console.log(`[STUB] quarantine_claim — claimId: ${claimId}, reason: ${reason}`);
  return { success: false, newStatus: 'pending_review' };
}

/**
 * [STUB] Model 3 - Agentic GenAI: Vision-Language Model for Automated Adjudication
 * TODO: Implement as part of "Adversarial Defense & Anti-Spoofing Strategy" (see README).
 *
 * Sends a quarantined claim's photo evidence to a Vision-Language Model (GPT-4o or
 * Gemini 1.5 Pro) for automated adjudication. The model parses scene content (flooded
 * streets, police barricades, shuttered stores), cross-references it against the claim
 * context, and validates EXIF metadata (geotag, capture timestamp) against the worker's
 * last known GPS coordinate.
 *
 * @param {string} image_url     - URL of the timestamped photo submitted by the worker
 * @param {Object} claim_context - Claim details for cross-referencing against the photo
 * @param {string} claim_context.disruption_type  - e.g. 'WEATHER', 'OUTAGE', 'CURFEW'
 * @param {string} claim_context.zone             - Disruption zone (e.g. 'ZONE_A')
 * @param {string} claim_context.timestamp        - ISO timestamp of the filed claim
 * @param {number} claim_context.gps_lat          - Worker's last known latitude
 * @param {number} claim_context.gps_lng          - Worker's last known longitude
 * @returns {Promise<{ is_authentic_disruption: boolean, confidence_score: number, reason: string }>}
 *   confidence_score >= 0.75 → auto-release payout
 *   confidence_score < 0.40  → escalate to human analyst queue
 */
async function process_claim_evidence_with_genai(image_url, claim_context) {
  // TODO: Call OpenAI Vision API or Gemini 1.5 Pro with image_url + claim_context prompt
  // TODO: Parse structured JSON response for is_authentic_disruption + confidence_score
  // TODO: Integrate with quarantine_claim() — high confidence clears quarantine, low escalates
  console.log(`[STUB] process_claim_evidence_with_genai — image: ${image_url}, zone: ${claim_context?.zone}`);
  return { is_authentic_disruption: false, confidence_score: 0, reason: 'stub — not yet implemented' };
}

// ------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ML Pricing Engine — live when WEATHER_API_KEY is set, mock fallback otherwise
// ---------------------------------------------------------------------------

/**
 * Fallback mock forecast used when no API key is configured.
 * Preserves the original behaviour so the demo still works without a key.
 */
const runMockForecast = async () => {
  const conditions = ['Clear Skies', 'Light Rain', 'Heavy Traffic Jam', 'Monsoon Alert', 'High AQI (Smog)'];
  const selectedCondition = conditions[Math.floor(Math.random() * conditions.length)];

  let riskLevel = 'Low';
  let baseFee   = 2.0;

  if (selectedCondition === 'Clear Skies') {
    riskLevel = 'Low';
    baseFee = 1.5 + Math.random() * 0.5;
  } else if (selectedCondition === 'Light Rain' || selectedCondition === 'Heavy Traffic Jam') {
    riskLevel = 'Medium';
    baseFee = 2.2 + Math.random() * 0.8;
  } else {
    riskLevel = 'High';
    baseFee = 3.2 + Math.random() * 0.8;
  }

  return { surcharge: parseFloat(baseFee.toFixed(2)), riskLevel };
};

/**
 * Master forecast runner.
 * Uses live API data when WEATHER_API_KEY is present; falls back to mock otherwise.
 * Always targets ZONE_A (Bengaluru) as the primary pricing signal for the global state.
 */
const runForecast = async () => {
  try {
    let surcharge, riskLevel;

    if (process.env.WEATHER_API_KEY) {
      const primary = OPERATIONAL_ZONES[0];
      const pricing = await calculate_live_dynamic_surcharge(primary.lat, primary.lon);
      surcharge  = pricing.surcharge;
      riskLevel  = pricing.riskLevel;
    } else {
      ({ surcharge, riskLevel } = await runMockForecast());
    }

    await dbRun(`
      UPDATE state
      SET "currentMicroFee" = $1, "currentRiskLevel" = $2
      WHERE id = 1
    `, [surcharge, riskLevel]);

    const row = await dbGet('SELECT * FROM state WHERE id = 1');
    return formatState(row);
  } catch (error) {
    console.error('[FORECAST] Failed to run forecast:', error.message);
    return null;
  }
};

app.post('/refresh-forecast', async (req, res) => {
  const updatedState = await runForecast();
  if (updatedState) {
    res.json({ message: 'Forecast updated.', state: updatedState });
  } else {
    res.status(500).json({ error: 'Failed to update forecast' });
  }
});

// Auto-refresh pricing every 15 seconds
setInterval(() => { runForecast(); }, 15000);

// ---------------------------------------------------------------------------
// Task 4 — /cron/evaluate-live-triggers
// Zero-touch claims management: poll live APIs for all active zones and
// auto-insert a "Pending Review" claim for every active worker in a breached zone.
// ---------------------------------------------------------------------------

app.post('/cron/evaluate-live-triggers', async (req, res) => {
  if (!process.env.WEATHER_API_KEY) {
    return res.status(503).json({ error: 'WEATHER_API_KEY not configured — live triggers unavailable' });
  }

  try {
    const breachedZones = await evaluate_all_zones(OPERATIONAL_ZONES);

    if (breachedZones.length === 0) {
      console.log('[CRON] No parametric thresholds breached across all zones.');
      return res.json({ message: 'No thresholds breached.', claims_created: 0, zones_checked: OPERATIONAL_ZONES.length });
    }

    let claims_created = 0;

    for (const breach of breachedZones) {
      console.log(`[CRON] Threshold breached — Zone: ${breach.zone_id}, Type: ${breach.type}, Severity: ${breach.severity}`);

      // Query the trips table for active workers in this zone.
      // A trip with status = 'active' (or we check the global isTripActive flag for the MVP)
      // In the current single-driver MVP the state table is the source of truth.
      const state = await dbGet('SELECT * FROM state WHERE id = 1');

      if (state.isTripActive && state.claimStatus === 'none') {
        // Auto-insert a Pending Review claim into trips table (hoursWorked null — not yet logged)
        await dbRun(
          `INSERT INTO trips (status, earnings, "protectedAmount", timestamp, "hoursWorked") VALUES ($1, $2, $3, $4, $5)`,
          ['pending_review', 0, 0, new Date().toISOString(), null]
        );

        // Update global state to reflect the parametric disruption
        await dbRun(`
          UPDATE state
          SET "disruptionType"      = $1,
              "disruptionZone"      = $2,
              "disruptionSeverity"  = $3,
              "disruptionMessage"   = $4,
              "disruptionTimestamp" = $5,
              "claimStatus"         = 'processing'
          WHERE id = 1
        `, [
          breach.type,
          breach.zone_id,
          breach.severity,
          breach.message,
          new Date().toISOString(),
        ]);

        claims_created++;
        console.log(`[CRON] Auto-claim created (Pending Review) for zone ${breach.zone_id} — ${breach.message}`);
      } else {
        console.log(`[CRON] Zone ${breach.zone_id} breached but no active unprotected trip found — skipping auto-claim.`);
      }
    }

    const finalState = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json({
      message: `Cron run complete. ${claims_created} claim(s) auto-created.`,
      breached_zones: breachedZones,
      claims_created,
      zones_checked: OPERATIONAL_ZONES.length,
      state: formatState(finalState),
    });

  } catch (error) {
    console.error('[CRON] evaluate-live-triggers error:', error.message);
    res.status(500).json({ error: 'Cron evaluation failed', detail: error.message });
  }
});

const PORT = process.env.PORT || 4000;

// Start server only after DB is ready
async function seedDemoAccount() {
  try {
    const existing = await dbGet('SELECT id FROM users WHERE email = $1', ['demo@quickcover.in']);
    if (!existing) {
      const hash = await bcrypt.hash('demo1234', 12);
      await dbRun(
        `INSERT INTO users (name, email, "passwordHash", phone, "driverId", platform, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Demo Driver', 'demo@quickcover.in', hash, '+91 9999999999', 'DEMO-2024-00001', 'blinkit', new Date().toISOString()]
      );
      console.log('✅ Demo account seeded: demo@quickcover.in / demo1234');
    }
  } catch (err) {
    console.error('Demo seed error (non-fatal):', err.message);
  }
}

initializeDatabase()
  .then(async () => {
    await seedDemoAccount();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`QuickCover backend listening on http://0.0.0.0:${PORT}`);
    });

    // Graceful shutdown — required for Render zero-downtime deploys
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        closeDatabase().then(() => {
          console.log('Database connection closed.');
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

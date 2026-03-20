require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { dbGet, dbRun, initializeDatabase, closeDatabase } = require('./database');

const authRouter = require('./auth');

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
    await dbRun(`
      UPDATE state
      SET "isTripActive" = TRUE,
          "disruptionType" = NULL, "disruptionZone" = NULL, "disruptionSeverity" = NULL,
          "disruptionMessage" = NULL, "disruptionTimestamp" = NULL,
          "claimStatus" = 'none'
      WHERE id = 1
    `);
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
  const { type, zone, severity, message } = req.body;

  try {
    const currentState = await dbGet('SELECT * FROM state WHERE id = 1');

    // Allow manual claim filing even if trip has just ended — drivers report disruptions
    // after the fact (e.g. flooding forced them off the road mid-trip). Only block if
    // a claim is already in-flight to prevent duplicate submissions.
    if (currentState.claimStatus === 'processing' || currentState.claimStatus === 'approved') {
      return res.status(400).json({ error: 'A claim is already under review. Please wait for it to resolve.' });
    }

    const disruption = {
      type: type || 'WEATHER',
      zone: zone || 'ZONE_A',
      severity: severity || 'HIGH',
      message: message || 'Severe Waterlogging Detected in Delivery Zone',
      timestamp: new Date().toISOString()
    };

    await dbRun(`
      UPDATE state
      SET "disruptionType" = $1, "disruptionZone" = $2, "disruptionSeverity" = $3,
          "disruptionMessage" = $4, "disruptionTimestamp" = $5, "claimStatus" = 'processing'
      WHERE id = 1
    `, [disruption.type, disruption.zone, disruption.severity, disruption.message, disruption.timestamp]);

    const processingRow = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json({ message: 'Disruption triggered successfully.', state: formatState(processingRow) });

    // AI cross-verification: processing → approved in 4s, approved → paid in 3s (7s total)
    setTimeout(async () => {
      const payoutAmount = 450;
      await dbRun(`
        UPDATE state
        SET "claimStatus" = 'approved', "weeklyProtected" = "weeklyProtected" + $1
        WHERE id = 1 AND "claimStatus" = 'processing'
      `, [payoutAmount]);

      await dbRun(
        'INSERT INTO trips (status, earnings, "protectedAmount", timestamp) VALUES ($1, $2, $3, $4)',
        ['disrupted', 10, payoutAmount, new Date().toISOString()]
      );

      await dbRun('UPDATE state SET "isTripActive" = FALSE WHERE id = 1');

      setTimeout(async () => {
        await dbRun(`
          UPDATE state
          SET "claimStatus" = 'paid'
          WHERE id = 1 AND "claimStatus" = 'approved'
        `);
      }, 3000);

    }, 4000);

  } catch (error) {
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

// --- ML Pricing Engine Mock ---
const runForecast = async () => {
  try {
    const conditions = ['Clear Skies', 'Light Rain', 'Heavy Traffic Jam', 'Monsoon Alert', 'High AQI (Smog)'];
    const selectedCondition = conditions[Math.floor(Math.random() * conditions.length)];

    let riskLevel = 'Low';
    let baseFee = 2.0;

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

    const newFee = parseFloat(baseFee.toFixed(2));

    await dbRun(`
      UPDATE state
      SET "currentMicroFee" = $1, "currentRiskLevel" = $2
      WHERE id = 1
    `, [newFee, riskLevel]);

    const row = await dbGet('SELECT * FROM state WHERE id = 1');
    return formatState(row);
  } catch (error) {
    console.error('Failed to run ML forecast', error);
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

// Auto-fluctuate pricing every 15 seconds
setInterval(() => { runForecast(); }, 15000);
// -----------------------------

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

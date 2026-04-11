/**
 * fraud_scoring.js — QuickCover Anti-Spoofing & Fraud Detection Module
 *
 * Implements a 3-tier scoring system to defend against GPS spoofing, fake claims,
 * and fraud rings. Scores each claim 0.0–1.0:
 *
 *   Tier 1 (score 0.00–0.45) → Auto-Approve  — low risk, proceed to instant payout
 *   Tier 2 (score 0.46–0.70) → Quarantine    — set status 'pending_review', request photo
 *   Tier 3 (score 0.71–1.00) → Auto-Reject   — high risk, log to fraud analyst queue
 *
 * In production the GPS trace and sensor data would arrive from the mobile SDK;
 * in demo mode the caller passes what it has and missing fields default to clean.
 */

'use strict';

// ── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Pillar 1: OS-Level Mock Location Detection ───────────────────────────────
function scoreMockLocation(deviceData) {
  let score = 0;
  const flags = [];

  const { mockLocationEnabled = false, platform = 'android', locationAccuracy = 15 } = deviceData;

  // Android: developer enabled "Allow mock locations" in dev options
  if (mockLocationEnabled === true) {
    score += 0.40;
    flags.push('ANDROID_MOCK_LOCATION_ENABLED');
  }

  // iOS: real GPS cannot produce 0m accuracy — that's only possible in Simulator
  if (platform === 'ios' && locationAccuracy === 0) {
    score += 0.30;
    flags.push('IOS_PERFECT_ACCURACY_SIMULATOR');
  }

  // Suspiciously perfect accuracy on Android (<1m is physically impossible outdoors)
  if (platform === 'android' && locationAccuracy > 0 && locationAccuracy < 1) {
    score += 0.20;
    flags.push('ANDROID_IMPOSSIBLE_ACCURACY');
  }

  return { score, flags };
}

// ── Pillar 2: GPS Physics — Teleportation & Static Coordinate Detection ──────
function scoreGpsAnomalies(gpsCoordinates) {
  let score = 0;
  const flags = [];

  if (!Array.isArray(gpsCoordinates) || gpsCoordinates.length < 2) {
    return { score, flags };
  }

  // Teleportation check: speed between consecutive pings
  for (let i = 1; i < gpsCoordinates.length; i++) {
    const prev = gpsCoordinates[i - 1];
    const curr = gpsCoordinates[i];
    if (!prev.lat || !curr.lat || !prev.timestamp || !curr.timestamp) continue;

    const dtMs = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime();
    if (dtMs <= 0) continue;

    const distKm = haversineKm(prev.lat, prev.lng, curr.lat, curr.lng);
    const speedKmh = (distKm / dtMs) * 3_600_000;

    // Delivery bikes physically cannot exceed ~80 km/h in Indian urban traffic;
    // >150 km/h between pings = impossible = GPS spoofer jumping coordinates.
    if (speedKmh > 150) {
      score += 0.45;
      flags.push(`TELEPORTATION_${Math.round(speedKmh)}KMH`);
      break; // one clear teleport is enough evidence
    }
  }

  // Static coordinate check: all pings identical = Fake GPS app holding position
  const allSameLat = gpsCoordinates.every(p => p.lat === gpsCoordinates[0].lat);
  const allSameLng = gpsCoordinates.every(p => p.lng === gpsCoordinates[0].lng);
  if (allSameLat && allSameLng && gpsCoordinates.length >= 3) {
    score += 0.35;
    flags.push('STATIC_GPS_FROZEN_COORDINATES');
  }

  return { score, flags };
}

// ── Pillar 3: Behavioural Sanity Checks ──────────────────────────────────────
function scoreBehavioural(claimedHours, disruptionType) {
  let score = 0;
  const flags = [];

  // Claiming > 8 hours is impossible (shift cap enforced server-side too, but score it)
  if (claimedHours > 8) {
    score += 0.15;
    flags.push('CLAIMED_HOURS_EXCEED_SHIFT_MAX');
  }

  // Curfew at midnight with only 1h claimed is statistically unusual — soft flag
  if (disruptionType === 'CURFEW' && claimedHours === 1) {
    score += 0.05;
    flags.push('CURFEW_SINGLE_HOUR_UNUSUAL');
  }

  return { score, flags };
}

// ── Main Scoring Function ────────────────────────────────────────────────────
/**
 * Score a claim for fraud risk.
 *
 * @param {Object} opts
 * @param {boolean} [opts.mockLocationEnabled=false]  — Android mock location flag from device
 * @param {string}  [opts.platform='android']         — 'android' | 'ios'
 * @param {number}  [opts.locationAccuracy=15]        — GPS accuracy in metres
 * @param {Array}   [opts.gpsCoordinates=[]]          — [{lat, lng, timestamp}]
 * @param {number}  [opts.claimedHours=1]             — Hours submitted in claim
 * @param {string}  [opts.disruptionType='WEATHER']   — Disruption type
 *
 * @returns {{ score: number, tier: 'auto_approve'|'quarantine'|'auto_reject', flags: string[], reason: string }}
 */
function scoreClaim(opts = {}) {
  const {
    mockLocationEnabled = false,
    platform = 'android',
    locationAccuracy = 15,
    gpsCoordinates = [],
    claimedHours = 1,
    disruptionType = 'WEATHER',
  } = opts;

  const p1 = scoreMockLocation({ mockLocationEnabled, platform, locationAccuracy });
  const p2 = scoreGpsAnomalies(gpsCoordinates);
  const p3 = scoreBehavioural(claimedHours, disruptionType);

  const raw = p1.score + p2.score + p3.score;
  const score = parseFloat(Math.min(1.0, raw).toFixed(3));
  const allFlags = [...p1.flags, ...p2.flags, ...p3.flags];

  let tier;
  let reason;
  if (score <= 0.45) {
    tier = 'auto_approve';
    reason = allFlags.length === 0
      ? 'No anomalies detected. Claim passed all anti-spoofing checks.'
      : `Minor signal(s) detected (${allFlags.join(', ')}) but score is within auto-approve threshold.`;
  } else if (score <= 0.70) {
    tier = 'quarantine';
    reason = `Fraud score ${score} — flagged for photo evidence review. Detected: ${allFlags.join(', ')}.`;
  } else {
    tier = 'auto_reject';
    reason = `High fraud score ${score} — auto-rejected. Evidence: ${allFlags.join(', ')}.`;
  }

  return { score, tier, flags: allFlags, reason };
}

module.exports = { scoreClaim };

/**
 * genai_adjudication.js — QuickCover GenAI Vision Adjudication Layer
 *
 * Provides a unified interface for claim evidence adjudication using a
 * Vision-Language Model. Supports OpenAI GPT-4o and Google Gemini 1.5 Pro.
 * Falls back to deterministic simulation when no API key is configured.
 *
 * Provider selection (in order of precedence):
 *   1. GENAI_PROVIDER env var ('openai' | 'gemini')
 *   2. Auto-detect: GEMINI_API_KEY present  → gemini
 *   3. Auto-detect: OPENAI_API_KEY present  → openai
 *   4. Neither key set                       → mock (deterministic simulation)
 *
 * Required env vars per provider:
 *   OpenAI:  OPENAI_API_KEY  (required), OPENAI_MODEL  (default: 'gpt-4o')
 *   Gemini:  GEMINI_API_KEY  (required), GEMINI_MODEL  (default: 'gemini-2.0-flash')
 *
 * Image URL note:
 *   Both providers require a publicly accessible http/https URL. The mobile
 *   app's expo-image-picker returns a local file:// URI; in production, upload
 *   to object storage (e.g. Vercel Blob, S3) and pass the resulting URL here.
 *   Local URIs are silently skipped and the model falls back to text-only assessment.
 */

'use strict';

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Provider Detection ────────────────────────────────────────────────────────

function detectProvider() {
  const explicit = (process.env.GENAI_PROVIDER || '').toLowerCase();
  if (explicit === 'openai' || explicit === 'gemini') return explicit;
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return 'mock';
}

// ── Prompt Builder ────────────────────────────────────────────────────────────

/**
 * Builds the structured adjudication prompt for the VLM.
 * Including weather snapshot gives the model ground-truth context to compare
 * against the scene description, improving accuracy for WEATHER/FLOOD claims.
 */
function buildAdjudicationPrompt(claimContext) {
  const {
    disruption_type,
    zone,
    timestamp,
    gps_lat,
    gps_lng,
    weather_snapshot,
    image_present,
  } = claimContext;

  const gpsLine = (gps_lat != null && gps_lng != null)
    ? `- GPS coordinates: ${gps_lat.toFixed(5)}, ${gps_lng.toFixed(5)}`
    : '- GPS coordinates: not provided';

  const weatherLine = weather_snapshot
    ? `- Live weather for zone: rain ${weather_snapshot.rainfall_mm_hr}mm/hr, temp ${weather_snapshot.temp_celsius}°C`
    : '';

  const imageNote = image_present
    ? 'A photo of the disruption has been attached. Analyse the scene content, check for visual evidence of the reported disruption type, and assess whether the image appears authentic.'
    : 'No photo was provided. Base your assessment on the disruption type, zone, timestamp, GPS coordinates, and any available weather data.';

  return `You are an insurance claim adjudicator for QuickCover, a parametric income protection platform for gig delivery workers in India.

A delivery worker has filed a disruption claim. Evaluate whether the claim is authentic.

Claim details:
- Disruption type: ${disruption_type}
- Zone: ${zone}
- Timestamp: ${timestamp}
${gpsLine}
${weatherLine}

${imageNote}

Disruption types and their visual characteristics:
- WEATHER / FLOOD: waterlogged roads, stranded vehicles, rain in frame
- HEAT: bright outdoor scene, no shade, midday shadows
- POLLUTION: visible haze, reduced horizon visibility, milky sky
- OUTAGE: shuttered storefront, closed signage, no activity at pickup
- TRAFFIC: road blockade, police presence, stationary vehicles queued
- CURFEW: empty streets, law enforcement visible, barriers

Return a JSON object only (no markdown, no preamble, no extra text):
{
  "is_authentic_disruption": <boolean>,
  "confidence_score": <number 0.00 to 1.00>,
  "reason": "<1-2 sentences>"
}

Scoring thresholds:
- 0.75–1.00: clear evidence → payout released
- 0.40–0.74: insufficient evidence → escalate to human analyst
- 0.00–0.39: contradictory or no evidence → auto-reject`;
}

// ── Response Parser ───────────────────────────────────────────────────────────

/**
 * Parses the model's JSON output and validates the expected schema.
 * On any parse or validation failure, routes to manual review (never auto-approves
 * on a bad parse — fail safe in the conservative direction).
 *
 * @param {string} raw        Raw string from the model
 * @param {string} modelName  Model identifier for logging
 * @returns {{ is_authentic_disruption, confidence_score, reason, model, action }}
 */
function parseModelResponse(raw, modelName) {
  let parsed;
  try {
    // Strip markdown code fences if the model wrapped the JSON
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('[GENAI] JSON parse failed:', e.message, '| raw snippet:', raw.slice(0, 200));
    return {
      is_authentic_disruption: false,
      confidence_score: 0.50,
      reason: 'Model output could not be parsed — routed to manual review.',
      model: modelName,
      action: 'escalated_to_analyst',
    };
  }

  const confidence_score = parseFloat(parsed.confidence_score);
  if (
    typeof parsed.is_authentic_disruption !== 'boolean' ||
    isNaN(confidence_score) ||
    confidence_score < 0 ||
    confidence_score > 1 ||
    typeof parsed.reason !== 'string'
  ) {
    console.error('[GENAI] Schema validation failed — unexpected shape:', JSON.stringify(parsed).slice(0, 200));
    return {
      is_authentic_disruption: false,
      confidence_score: 0.50,
      reason: 'Model returned unexpected schema — routed to manual review.',
      model: modelName,
      action: 'escalated_to_analyst',
    };
  }

  const score = parseFloat(confidence_score.toFixed(3));
  return {
    is_authentic_disruption: parsed.is_authentic_disruption,
    confidence_score: score,
    reason: parsed.reason,
    model: modelName,
    action: score >= 0.75
      ? 'payout_released'
      : score >= 0.40
      ? 'escalated_to_analyst'
      : 'auto_rejected',
  };
}

// ── OpenAI Provider ───────────────────────────────────────────────────────────

async function callOpenAI(imageUrl, claimContext) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model  = process.env.OPENAI_MODEL || 'gpt-4o';

  const hasRemoteImage = Boolean((imageUrl && imageUrl.startsWith('http')) || claimContext.imageBase64);
  const prompt = buildAdjudicationPrompt({ ...claimContext, image_present: hasRemoteImage });

  // Build user message content — image first, then prompt text
  const userContent = [];
  if (hasRemoteImage) {
    if (claimContext.imageBase64) {
      userContent.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${claimContext.imageBase64}`, detail: 'low' } });
    } else {
      userContent.push({ type: 'image_url', image_url: { url: imageUrl, detail: 'low' } });
    }
  }
  userContent.push({ type: 'text', text: prompt });

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: userContent }],
      response_format: { type: 'json_object' },
      max_tokens: 256,
      temperature: 0.1,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  const raw = response.data.choices?.[0]?.message?.content ?? '{}';
  return parseModelResponse(raw, model);
}

// ── Gemini Provider ───────────────────────────────────────────────────────────

async function callGemini(imageUrl, claimContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const hasRemoteImage = Boolean((imageUrl && imageUrl.startsWith('http')) || claimContext.imageBase64);
  const prompt = buildAdjudicationPrompt({ ...claimContext, image_present: hasRemoteImage });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: 'application/json' } });

  const parts = [];
  parts.push(prompt);

  if (hasRemoteImage) {
    if (claimContext.imageBase64) {
      parts.push({
        inlineData: {
          data: claimContext.imageBase64,
          mimeType: 'image/jpeg'
        }
      });
    } else {
      try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64String = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        parts.push({
          inlineData: {
            data: base64String,
            mimeType
          }
        });
      } catch (e) {
        console.error('[GENAI] Failed to fetch image for Gemini inlineData:', e.message);
        // Fallback to text only if image fetch fails
      }
    }
  }

  const result = await model.generateContent(parts);
  const raw = result.response.text();
  return parseModelResponse(raw, modelName);
}

// ── Mock Fallback ─────────────────────────────────────────────────────────────

/**
 * Deterministic simulation used when no GenAI key is configured.
 * Produces the same response shape as real providers so the rest of the system
 * is unaffected and demo mode continues to work.
 */
function simulatedAdjudication(claimContext) {
  const baseScores = {
    WEATHER:   0.91,
    FLOOD:     0.88,
    HEAT:      0.85,
    POLLUTION: 0.83,
    OUTAGE:    0.79,
    TRAFFIC:   0.74,
    CURFEW:    0.95,
  };

  const reasons = {
    WEATHER:   'Scene contains waterlogged road surface consistent with reported rainfall. EXIF geotag matches claim zone.',
    FLOOD:     'Image shows submerged infrastructure and stationary vehicles. GPS coordinates verified against flood-affected grid cell.',
    HEAT:      'Outdoor scene brightness and shadow angle consistent with midday sun in reported zone. Thermographic inference supports elevated ambient temperature.',
    POLLUTION: 'Visible haze and reduced visibility consistent with CPCB AQI >300. Sky colour spectrum matches PM2.5 concentration range.',
    OUTAGE:    'Closed shutter visible at reported pickup location. No active delivery vehicles in frame. Timestamp matches zone outage window.',
    TRAFFIC:   'Road blockade and stationary traffic visible. Police/barrier presence detected. GPS trace consistent with worker halted at location.',
    CURFEW:    'Empty streets and law enforcement presence visible. Scene matches Section 144 enforcement pattern. Government advisory timestamp aligns.',
  };

  const disruptionType = (claimContext.disruption_type || 'WEATHER').toUpperCase();
  const base  = baseScores[disruptionType] ?? 0.72;
  const jitter = (Math.random() - 0.5) * 0.12;
  const score  = parseFloat(Math.min(0.99, Math.max(0.40, base + jitter)).toFixed(3));
  const is_authentic_disruption = score >= 0.75;

  const reason = is_authentic_disruption
    ? (reasons[disruptionType] ?? 'Visual evidence consistent with reported disruption. Metadata validated.')
    : 'Insufficient visual evidence to confirm disruption. Claim routed to manual analyst queue.';

  return {
    is_authentic_disruption,
    confidence_score: score,
    reason,
    model: 'simulated (set GEMINI_API_KEY or OPENAI_API_KEY for real adjudication)',
    action: score >= 0.75 ? 'payout_released' : score >= 0.40 ? 'escalated_to_analyst' : 'auto_rejected',
  };
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Adjudicate claim evidence using the configured GenAI provider.
 *
 * @param {string|null} imageUrl  — Publicly accessible http/https image URL, or null.
 *                                   Local file:// URIs are silently skipped (text-only assessment).
 * @param {Object} claimContext
 * @param {string}  claimContext.disruption_type   — 'WEATHER' | 'FLOOD' | 'HEAT' | etc.
 * @param {string}  claimContext.zone              — 'ZONE_A' | 'ZONE_B' | 'ZONE_C'
 * @param {string}  claimContext.timestamp         — ISO claim timestamp
 * @param {number}  [claimContext.gps_lat]         — Worker's last known latitude
 * @param {number}  [claimContext.gps_lng]         — Worker's last known longitude
 * @param {Object}  [claimContext.weather_snapshot] — { rainfall_mm_hr, temp_celsius }
 *
 * @returns {Promise<{
 *   is_authentic_disruption: boolean,
 *   confidence_score: number,
 *   reason: string,
 *   model: string,
 *   action: 'payout_released'|'escalated_to_analyst'|'auto_rejected',
 *   txnRef: string
 * }>}
 */
async function adjudicateClaimEvidence(imageUrl, claimContext) {
  const provider = detectProvider();
  const txnRef = `GENAI-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  console.log(
    `[GENAI] Provider: ${provider} | type: ${claimContext.disruption_type} | zone: ${claimContext.zone} | ref: ${txnRef}`
  );

  try {
    let result;
    if (provider === 'openai') {
      result = await callOpenAI(imageUrl, claimContext);
    } else if (provider === 'gemini') {
      result = await callGemini(imageUrl, claimContext);
    } else {
      result = simulatedAdjudication(claimContext);
    }

    console.log(
      `[GENAI] confidence=${result.confidence_score} | authentic=${result.is_authentic_disruption} | action=${result.action} | model=${result.model}`
    );
    return { ...result, txnRef };

  } catch (err) {
    // Provider call failed — fail safe: route to manual review, never auto-approve on error
    console.error(`[GENAI] Provider error (${provider}):`, err.response?.data || err.message);
    return {
      is_authentic_disruption: false,
      confidence_score: 0.50,
      reason: `GenAI provider unavailable (${err.message}) — claim routed to manual analyst review.`,
      model: `${provider} (error fallback)`,
      action: 'escalated_to_analyst',
      txnRef,
    };
  }
}

module.exports = { adjudicateClaimEvidence, detectProvider };

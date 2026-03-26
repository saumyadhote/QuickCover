/**
 * live_parametric_triggers.js
 * Phase 2 — Live external API integrations for parametric triggers and dynamic pricing.
 *
 * APIs used:
 *   - OpenWeatherMap Current Weather  (api.openweathermap.org/data/2.5/weather)
 *   - OpenWeatherMap Air Pollution     (api.openweathermap.org/data/2.5/air_pollution)
 *
 * Required env vars:
 *   WEATHER_API_KEY — OpenWeatherMap API key (free tier is sufficient)
 *
 * Parametric thresholds (matching README financial model):
 *   Rain      > 15 mm/hr  → "Heavy Rain"    disruption
 *   Heat      > 43 °C     → "Extreme Heat"  disruption
 *   AQI       > 300       → "Severe Pollution" disruption  (CPCB "Severe" band)
 */

const axios = require('axios');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

// ---------------------------------------------------------------------------
// Task 1 — Real Weather & Temperature
// ---------------------------------------------------------------------------

/**
 * Fetch live rainfall and temperature for a zone and evaluate parametric triggers.
 *
 * @param {number} zone_lat   Latitude of the delivery zone centre
 * @param {number} zone_lon   Longitude of the delivery zone centre
 * @returns {Promise<{
 *   triggered: boolean,
 *   type: string|null,
 *   severity: string|null,
 *   message: string|null,
 *   raw: { rainfall_mm_hr: number, temp_celsius: number }
 * }>}
 */
async function check_live_weather(zone_lat, zone_lon) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) throw new Error('WEATHER_API_KEY is not set in environment');

  const url = `${OWM_BASE}/weather`;
  const response = await axios.get(url, {
    params: { lat: zone_lat, lon: zone_lon, appid: apiKey, units: 'metric' },
    timeout: 8000,
  });

  const data = response.data;

  // OpenWeatherMap returns rain volume for the last 1 hour in `rain['1h']` (mm).
  // This is equivalent to mm/hr for our threshold comparison.
  const rainfall_mm_hr = data.rain?.['1h'] ?? 0;
  const temp_celsius   = data.main?.temp ?? 0;
  const city           = data.name ?? `${zone_lat},${zone_lon}`;

  console.log(`[WEATHER] ${city} — Rain: ${rainfall_mm_hr}mm/hr, Temp: ${temp_celsius}°C`);

  // --- Parametric trigger evaluation ---

  // Heavy rain threshold: > 15 mm/hr (README: IMD >15mm/hr in zone → ₹300–500/shift)
  if (rainfall_mm_hr > 15) {
    return {
      triggered: true,
      type: 'WEATHER',
      severity: rainfall_mm_hr > 30 ? 'CRITICAL' : 'HIGH',
      message: `Heavy Rainfall ${rainfall_mm_hr.toFixed(1)}mm/hr detected in ${city}`,
      raw: { rainfall_mm_hr, temp_celsius },
    };
  }

  // Extreme heat threshold: > 43°C (README: >43°C for 2+ hrs → ₹250–400/shift)
  if (temp_celsius > 43) {
    return {
      triggered: true,
      type: 'WEATHER',
      severity: temp_celsius > 46 ? 'CRITICAL' : 'HIGH',
      message: `Extreme Heat ${temp_celsius.toFixed(1)}°C detected in ${city}`,
      raw: { rainfall_mm_hr, temp_celsius },
    };
  }

  return {
    triggered: false,
    type: null,
    severity: null,
    message: null,
    raw: { rainfall_mm_hr, temp_celsius },
  };
}

// ---------------------------------------------------------------------------
// Task 2 — Real Air Quality (AQI)
// ---------------------------------------------------------------------------

/**
 * OpenWeatherMap Air Pollution API returns a European AQI index (1–5).
 * We also extract raw PM2.5 concentration and map it to the Indian CPCB AQI scale
 * so our threshold (>300 = Severe) is consistent with the README spec.
 *
 * CPCB AQI bands for PM2.5 (μg/m³ 24hr avg):
 *   Good        0–30    → AQI  0–50
 *   Satisfactory 31–60  → AQI 51–100
 *   Moderate    61–90   → AQI 101–200
 *   Poor        91–120  → AQI 201–300
 *   Very Poor  121–250  → AQI 301–400
 *   Severe     >250     → AQI 401–500
 *
 * @param {number} zone_lat
 * @param {number} zone_lon
 * @returns {Promise<{
 *   triggered: boolean,
 *   type: string|null,
 *   severity: string|null,
 *   message: string|null,
 *   raw: { owm_aqi: number, pm25: number, estimated_cpcb_aqi: number }
 * }>}
 */
async function check_live_aqi(zone_lat, zone_lon) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) throw new Error('WEATHER_API_KEY is not set in environment');

  const url = `${OWM_BASE}/air_pollution`;
  const response = await axios.get(url, {
    params: { lat: zone_lat, lon: zone_lon, appid: apiKey },
    timeout: 8000,
  });

  const components = response.data?.list?.[0]?.components ?? {};
  const owm_aqi    = response.data?.list?.[0]?.main?.aqi ?? 1; // 1=Good … 5=Very Poor
  const pm25       = components.pm2_5 ?? 0;

  // Linear interpolation to approximate CPCB AQI from PM2.5 concentration
  const estimated_cpcb_aqi = pm25_to_cpcb_aqi(pm25);

  console.log(`[AQI] OWM AQI: ${owm_aqi}, PM2.5: ${pm25}μg/m³, Est. CPCB AQI: ${estimated_cpcb_aqi}`);

  // Severe pollution threshold: estimated CPCB AQI > 300
  if (estimated_cpcb_aqi > 300) {
    return {
      triggered: true,
      type: 'POLLUTION',
      severity: estimated_cpcb_aqi > 400 ? 'CRITICAL' : 'HIGH',
      message: `Severe Air Pollution detected — AQI ${estimated_cpcb_aqi} (PM2.5: ${pm25.toFixed(1)}μg/m³)`,
      raw: { owm_aqi, pm25, estimated_cpcb_aqi },
    };
  }

  return {
    triggered: false,
    type: null,
    severity: null,
    message: null,
    raw: { owm_aqi, pm25, estimated_cpcb_aqi },
  };
}

/**
 * Approximate CPCB AQI from PM2.5 concentration (μg/m³) using linear interpolation
 * across the CPCB breakpoint table.
 *
 * @param {number} pm25  PM2.5 concentration in μg/m³
 * @returns {number}     Estimated CPCB AQI (0–500)
 */
function pm25_to_cpcb_aqi(pm25) {
  // [C_low, C_high, I_low, I_high]
  const breakpoints = [
    [0,    30,    0,   50],
    [30,   60,   51,  100],
    [60,   90,  101,  200],
    [90,  120,  201,  300],
    [120, 250,  301,  400],
    [250, 500,  401,  500],
  ];
  for (const [c_lo, c_hi, i_lo, i_hi] of breakpoints) {
    if (pm25 >= c_lo && pm25 <= c_hi) {
      return Math.round(((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo);
    }
  }
  return 500; // off-scale high
}

// ---------------------------------------------------------------------------
// Task 3 — Live Dynamic Premium Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the ₹1.50–₹5.00 micro-surcharge based on live API data.
 * Runs both weather and AQI checks in parallel, then combines signals
 * to produce a single risk score and surcharge.
 *
 * Surcharge mapping:
 *   Risk score 0.00–0.30  →  ₹1.50–₹2.00  (Low)
 *   Risk score 0.31–0.60  →  ₹2.00–₹3.50  (Medium)
 *   Risk score 0.61–0.80  →  ₹3.50–₹4.50  (High)
 *   Risk score 0.81–1.00  →  ₹4.50–₹5.00  (Critical)
 *
 * @param {number} zone_lat
 * @param {number} zone_lon
 * @returns {Promise<{
 *   surcharge: number,
 *   riskLevel: string,
 *   riskScore: number,
 *   drivers: { rainfall_mm_hr: number, temp_celsius: number, cpcb_aqi: number }
 * }>}
 */
async function calculate_live_dynamic_surcharge(zone_lat, zone_lon) {
  // Fetch both APIs in parallel — don't wait for one before starting the other
  const [weatherResult, aqiResult] = await Promise.all([
    check_live_weather(zone_lat, zone_lon).catch(err => {
      console.error('[PRICING] Weather API error:', err.message);
      return { triggered: false, raw: { rainfall_mm_hr: 0, temp_celsius: 25 } };
    }),
    check_live_aqi(zone_lat, zone_lon).catch(err => {
      console.error('[PRICING] AQI API error:', err.message);
      return { triggered: false, raw: { owm_aqi: 1, pm25: 0, estimated_cpcb_aqi: 50 } };
    }),
  ]);

  const { rainfall_mm_hr, temp_celsius } = weatherResult.raw;
  const { estimated_cpcb_aqi }           = aqiResult.raw;

  // --- Risk score components (each 0–1) ---

  // Rain: 0mm/hr = 0, 15mm/hr = 0.5 (trigger), 40mm/hr = 1.0
  const rain_score = Math.min(rainfall_mm_hr / 40, 1.0);

  // Heat: below 30°C = 0, 43°C = trigger (0.6), 50°C = 1.0
  const heat_score = temp_celsius < 30 ? 0 : Math.min((temp_celsius - 30) / 20, 1.0);

  // AQI: 0 = 0, 300 = trigger (0.6), 500 = 1.0
  const aqi_score = Math.min(estimated_cpcb_aqi / 500, 1.0);

  // Weighted composite: rain is most disruptive for Q-commerce, heat next, AQI last
  const riskScore = parseFloat(
    (rain_score * 0.55 + heat_score * 0.30 + aqi_score * 0.15).toFixed(4)
  );

  // Map risk score to ₹ surcharge and label
  let surcharge, riskLevel;
  if (riskScore <= 0.30) {
    surcharge = parseFloat((1.50 + riskScore * (2.00 - 1.50) / 0.30).toFixed(2));
    riskLevel = 'Low';
  } else if (riskScore <= 0.60) {
    surcharge = parseFloat((2.00 + (riskScore - 0.30) * (3.50 - 2.00) / 0.30).toFixed(2));
    riskLevel = 'Medium';
  } else if (riskScore <= 0.80) {
    surcharge = parseFloat((3.50 + (riskScore - 0.60) * (4.50 - 3.50) / 0.20).toFixed(2));
    riskLevel = 'High';
  } else {
    surcharge = parseFloat((4.50 + (riskScore - 0.80) * (5.00 - 4.50) / 0.20).toFixed(2));
    riskLevel = 'Critical';
  }

  // Cap at ₹5.00 (hard ceiling from README)
  surcharge = Math.min(surcharge, 5.00);

  console.log(
    `[PRICING] riskScore=${riskScore} (rain=${rain_score.toFixed(2)}, heat=${heat_score.toFixed(2)}, aqi=${aqi_score.toFixed(2)})` +
    ` → ₹${surcharge} [${riskLevel}]`
  );

  return {
    surcharge,
    riskLevel,
    riskScore,
    drivers: { rainfall_mm_hr, temp_celsius, cpcb_aqi: estimated_cpcb_aqi },
  };
}

// ---------------------------------------------------------------------------
// Task 4 — Evaluate all active zones against live thresholds
// ---------------------------------------------------------------------------

/**
 * Checks each operational zone against live APIs and returns any breached triggers.
 * Called by the /cron/evaluate-live-triggers endpoint in server.js.
 *
 * @param {Array<{ id: string, lat: number, lon: number }>} zones  List of active zones
 * @returns {Promise<Array<{
 *   zone_id: string,
 *   type: string,
 *   severity: string,
 *   message: string
 * }>>}  Only zones where a threshold was breached
 */
async function evaluate_all_zones(zones) {
  const triggered = [];

  await Promise.all(zones.map(async (zone) => {
    try {
      const [weatherResult, aqiResult] = await Promise.all([
        check_live_weather(zone.lat, zone.lon),
        check_live_aqi(zone.lat, zone.lon),
      ]);

      for (const result of [weatherResult, aqiResult]) {
        if (result.triggered) {
          triggered.push({
            zone_id:  zone.id,
            type:     result.type,
            severity: result.severity,
            message:  result.message,
          });
        }
      }
    } catch (err) {
      console.error(`[CRON] Zone ${zone.id} API check failed:`, err.message);
    }
  }));

  return triggered;
}

module.exports = {
  check_live_weather,
  check_live_aqi,
  calculate_live_dynamic_surcharge,
  evaluate_all_zones,
};

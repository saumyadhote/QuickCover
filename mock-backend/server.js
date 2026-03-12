const express = require('express');
const cors = require('cors');
const { dbGet, dbRun } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Helper to format DB row to resemble original state
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
    const row = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json(formatState(row));
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/accept-trip', async (req, res) => {
  try {
    await dbRun(`
      UPDATE state 
      SET isTripActive = 1, 
          disruptionType = NULL, disruptionZone = NULL, disruptionSeverity = NULL, 
          disruptionMessage = NULL, disruptionTimestamp = NULL,
          claimStatus = 'none'
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
    const currentState = await dbGet('SELECT * FROM state WHERE id = 1');
    
    // Log trip
    await dbRun(
      'INSERT INTO trips (status, earnings, protectedAmount, timestamp) VALUES (?, ?, ?, ?)',
      ['completed', parseInt(Math.random() * 50) + 20, 0, new Date().toISOString()]
    );

    // Update state
    await dbRun(`
      UPDATE state 
      SET isTripActive = 0, 
          disruptionType = NULL, disruptionZone = NULL, disruptionSeverity = NULL, 
          disruptionMessage = NULL, disruptionTimestamp = NULL,
          claimStatus = 'none'
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
    if (!currentState.isTripActive) {
      return res.status(400).json({ error: 'Cannot trigger disruption: No active trip.' });
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
      SET disruptionType = ?, disruptionZone = ?, disruptionSeverity = ?, 
          disruptionMessage = ?, disruptionTimestamp = ?, claimStatus = 'processing'
      WHERE id = 1
    `, [disruption.type, disruption.zone, disruption.severity, disruption.message, disruption.timestamp]);

    const processingRow = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json({ message: 'Disruption triggered successfully.', state: formatState(processingRow) });

    // Simulate AI cross-verification delay in background
    setTimeout(async () => {
      const payoutAmount = 450;
      await dbRun(`
        UPDATE state 
        SET claimStatus = 'approved', weeklyProtected = weeklyProtected + ?
        WHERE id = 1 AND isTripActive = 1 AND claimStatus = 'processing'
      `, [payoutAmount]);
      
      // Log disrupted trip
      await dbRun(
        'INSERT INTO trips (status, earnings, protectedAmount, timestamp) VALUES (?, ?, ?, ?)',
        ['disrupted', 10, payoutAmount, new Date().toISOString()]
      );
      
      // Auto-complete trip after disruption
      await dbRun('UPDATE state SET isTripActive = 0 WHERE id = 1');

      // Simulate the payout transfer completing
      setTimeout(async () => {
        await dbRun(`
          UPDATE state
          SET claimStatus = 'paid'
          WHERE id = 1 AND claimStatus = 'approved'
        `);
      }, 5000);

    }, 5000);

  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/reset', async (req, res) => {
  try {
    await dbRun(`
      UPDATE state 
      SET isTripActive = 0, 
          disruptionType = NULL, disruptionZone = NULL, disruptionSeverity = NULL, 
          disruptionMessage = NULL, disruptionTimestamp = NULL,
          claimStatus = 'none',
          weeklyEarnings = 3200,
          weeklyProtected = 0,
          currentMicroFee = 2.0,
          currentRiskLevel = 'Low'
      WHERE id = 1
    `);
    
    // Clear trips
    await dbRun('DELETE FROM trips');
    
    const row = await dbGet('SELECT * FROM state WHERE id = 1');
    res.json({ message: 'State reset.', state: formatState(row) });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- ML Pricing Engine Mock ---
const runForecast = async () => {
  try {
    // 1. Simulate external API calls (Traffic, IMD Weather, AQI)
    const conditions = ['Clear Skies', 'Light Rain', 'Heavy Traffic Jam', 'Monsoon Alert', 'High AQI (Smog)'];
    const selectedCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    let riskLevel = 'Low';
    let baseFee = 2.0;

    // 2. Simple Rules Engine evaluating external data
    if (selectedCondition === 'Clear Skies') {
      riskLevel = 'Low';
      baseFee = 1.5 + (Math.random() * 0.5); // 1.50 - 2.00
    } else if (selectedCondition === 'Light Rain' || selectedCondition === 'Heavy Traffic Jam') {
      riskLevel = 'Medium';
      baseFee = 2.2 + (Math.random() * 0.8); // 2.20 - 3.00
    } else {
      riskLevel = 'High';
      baseFee = 3.2 + (Math.random() * 0.8); // 3.20 - 4.00
    }

    // Format to 2 decimal places
    const newFee = parseFloat(baseFee.toFixed(2));

    await dbRun(`
      UPDATE state
      SET currentMicroFee = ?, currentRiskLevel = ?
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
    res.status(500).json({ error: 'Failed to forecast pricing engine' });
  }
});

// Automatically fluctuate the pricing market every 15 seconds
setInterval(() => {
  runForecast();
}, 15000);
// -----------------------------

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Mock Backend Console listening on port ${PORT}`);
});

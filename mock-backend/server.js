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
      const payoutAmount = 350;
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
          weeklyEarnings = 4500,
          weeklyProtected = 0
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

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Mock Backend Console listening on port ${PORT}`);
});

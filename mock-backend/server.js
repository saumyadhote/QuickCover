const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory state
let state = {
  isTripActive: false,
  disruption: null, 
  claimStatus: 'none',   // none, processing, approved, paid
  weeklyEarnings: 4500,  // Mock earnings
  weeklyProtected: 0,
};

app.get('/status', (req, res) => {
  res.json(state);
});

app.post('/accept-trip', (req, res) => {
  state.isTripActive = true;
  state.disruption = null;
  state.claimStatus = 'none';
  res.json({ message: 'Trip activated. Coverage is now active.', state });
});

app.post('/complete-trip', (req, res) => {
  state.isTripActive = false;
  state.disruption = null;
  res.json({ message: 'Trip completed. Coverage ended.', state });
});

app.post('/trigger-disruption', (req, res) => {
  const { type, zone, severity, message } = req.body;
  
  if (!state.isTripActive) {
    return res.status(400).json({ error: 'Cannot trigger disruption: No active trip.' });
  }

  state.disruption = {
    type: type || 'WEATHER',
    zone: zone || 'ZONE_A',
    severity: severity || 'HIGH',
    message: message || 'Severe Waterlogging Detected in Delivery Zone',
    timestamp: new Date().toISOString()
  };
  
  state.claimStatus = 'processing';

  // Simulate AI cross-verification delay
  setTimeout(() => {
    state.claimStatus = 'approved';
    state.weeklyProtected += 350; // Mock payout amount
  }, 5000);

  res.json({ message: 'Disruption triggered successfully.', state });
});

app.post('/reset', (req, res) => {
  state = {
    isTripActive: false,
    disruption: null,
    claimStatus: 'none',
    weeklyEarnings: 4500,
    weeklyProtected: 0,
  };
  res.json({ message: 'State reset.', state });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Mock Backend Console listening on port ${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  GET  /status`);
  console.log(`  POST /accept-trip`);
  console.log(`  POST /complete-trip`);
  console.log(`  POST /trigger-disruption`);
  console.log(`  POST /reset`);
});

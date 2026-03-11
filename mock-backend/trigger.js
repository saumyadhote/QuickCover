const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/trigger-disruption',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('--- Trigger Response ---');
    console.log(JSON.parse(data));
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Mock Payload simulating a parametric trigger
req.write(JSON.stringify({
  type: 'WEATHER',
  zone: 'ZONE_A',
  severity: 'CRITICAL',
  message: 'Severe Waterlogging Detected on Route'
}));

req.end();

console.log('Triggering parametric disruption...');

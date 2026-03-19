const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/accept-trip',
  method: 'POST',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('--- Trip Accepted ---');
    console.log(JSON.parse(data));
  });
});

req.on('error', (e) => console.error(e.message));
req.end();

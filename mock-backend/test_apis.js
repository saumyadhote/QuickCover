require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPIs() {
  console.log('--- QuickCover API Connection Test ---\n');

  // 1. Weather API
  try {
    console.log('Checking OpenWeatherMap API...');
    if (!process.env.WEATHER_API_KEY) throw new Error('WEATHER_API_KEY missing in .env');
    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat: 12.9352, lon: 77.6245, appid: process.env.WEATHER_API_KEY }
    });
    console.log('✅ OpenWeatherMap: OK (Connected, ' + weatherRes.data.weather[0].main + ')\n');
  } catch (err) {
    console.error('❌ OpenWeatherMap Failed:', err.response?.data?.message || err.message, '\n');
  }

  // 2. Gemini API
  try {
    console.log('Checking Google Gemini API...');
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing in .env');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent('Say "Hello World" exactly.');
    console.log('✅ Gemini API: OK (Response: ' + result.response.text().trim() + ')\n');
  } catch (err) {
    console.error('❌ Gemini API Failed:', err.message, '\n');
  }

  // 3. Razorpay API
  try {
    console.log('Checking Razorpay API...');
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) 
      throw new Error('RAZORPAY keys missing in .env');
    
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const rzpRes = await axios.post('https://api.razorpay.com/v1/orders', {
      amount: 100, // 1 INR
      currency: 'INR',
      receipt: 'test_validation'
    }, {
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }
    });
    console.log('✅ Razorpay API: OK (Generated Test Order ID: ' + rzpRes.data.id + ')\n');
  } catch (err) {
    console.error('❌ Razorpay API Failed:', err.response?.data || err.message, '\n');
  }
}

testAPIs();

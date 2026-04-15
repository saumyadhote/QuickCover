const fs = require('fs');
const { RandomForestRegression } = require('ml-random-forest');

// 1. Synthesize Historical Dummy Data
// Features: [rainfall_mm, temp_celsius, aqi_index, active_driver_count, hour_of_day]
// Target: Surcharge between 1.50 and 5.00
const generateDummyData = (numSamples) => {
  const X = [];
  const y = [];
  for (let i = 0; i < numSamples; i++) {
    const rainfall = Math.random() * 50; // 0 to 50 mm/hr
    const temp = 20 + Math.random() * 25; // 20 to 45 deg C
    const aqi = 50 + Math.random() * 450; // 50 to 500
    const drivers = 1000 + Math.random() * 4000;
    const hour = Math.floor(Math.random() * 24);

    let riskScore = 0;
    riskScore += Math.min(rainfall / 40, 1.0) * 0.55;
    riskScore += (temp < 30 ? 0 : Math.min((temp - 30) / 20, 1.0)) * 0.30;
    riskScore += Math.min(aqi / 500, 1.0) * 0.15;

    let surcharge;
    if (riskScore <= 0.30) {
      surcharge = 1.50 + riskScore * (2.00 - 1.50) / 0.30;
    } else if (riskScore <= 0.60) {
      surcharge = 2.00 + (riskScore - 0.30) * (3.50 - 2.00) / 0.30;
    } else if (riskScore <= 0.80) {
      surcharge = 3.50 + (riskScore - 0.60) * (4.50 - 3.50) / 0.20;
    } else {
      surcharge = 4.50 + (riskScore - 0.80) * (5.00 - 4.50) / 0.20;
    }
    surcharge = Math.min(Math.max(surcharge, 1.50), 5.00);

    X.push([rainfall, temp, aqi, drivers, hour]);
    y.push(surcharge);
  }
  return { X, y };
};

console.log('Generating dummy data...');
const { X, y } = generateDummyData(2000);

console.log('Training Random Forest Regression model...');
const options = {
  seed: 42,
  maxFeatures: 5,
  replacement: true,
  nEstimators: 50,
};
const regression = new RandomForestRegression(options);
regression.train(X, y);

console.log('Saving model to pricing_model.json...');
const modelJson = regression.toJSON();
fs.writeFileSync('pricing_model.json', JSON.stringify(modelJson));

console.log('Model saved successfully!');

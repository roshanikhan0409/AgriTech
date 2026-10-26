require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('./models/Resource');
const Alert = require('./models/Alert');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  if (!(await Resource.countDocuments())) {
    await Resource.insertMany([
      { name: 'Wheat Seeds (HD-2967)', category: 'seed', price: 45, unit: 'kg', stock: 500, description: 'High-yield wheat variety' },
      { name: 'Soybean Seeds', category: 'seed', price: 90, unit: 'kg', stock: 300 },
      { name: 'Urea', category: 'fertilizer', price: 6, unit: 'kg', stock: 2000, description: 'Nitrogen fertilizer' },
      { name: 'DAP', category: 'fertilizer', price: 27, unit: 'kg', stock: 1500, description: 'Phosphorus and nitrogen source' },
      { name: 'Neem Oil', category: 'pesticide', price: 350, unit: 'litre', stock: 120, description: 'Organic pest control' },
      { name: 'Knapsack Sprayer (16L)', category: 'equipment', price: 1800, unit: 'piece', stock: 40 },
    ]);
  }

  if (!(await Alert.countDocuments())) {
    await Alert.insertMany([
      { title: 'Fall armyworm activity reported', type: 'pest', severity: 'high', crops: ['maize', 'sorghum'], description: 'Scout fields for ragged leaf damage and frass in whorls.', treatment: 'Hand-pick egg masses; apply neem oil early; consult your local extension office for approved insecticides.' },
      { title: 'Yellow rust risk in cool, humid weather', type: 'disease', severity: 'medium', crops: ['wheat'], description: 'Look for yellow stripes on leaves.', treatment: 'Use resistant varieties and consult an expert for fungicide advice.' },
    ]);
  }
  
  await mongoose.disconnect();
})();

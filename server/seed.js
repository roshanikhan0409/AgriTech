require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Resource = require('./models/Resource');
const Alert = require('./models/Alert');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = [
    { name: 'Admin', email: 'admin@agritech.test', password: 'admin123', role: 'admin' },
    { name: 'Dr. Expert', email: 'expert@agritech.test', password: 'expert123', role: 'expert' },
    { name: 'Demo Farmer', email: 'farmer@agritech.test', password: 'farmer123', role: 'farmer' },
  ];
  for (const u of users) {
    if (!(await User.findOne({ email: u.email }))) await User.create(u);
  }

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

  console.log('Seed complete.\nAdmin:  admin@agritech.test / admin123\nExpert: expert@agritech.test / expert123\nFarmer: farmer@agritech.test / farmer123');
  await mongoose.disconnect();
})();

const mongoose = require('mongoose');

// Cached weather snapshots per farm (history + reduces external API calls)
const weatherSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    fetchedAt: { type: Date, default: Date.now },
    current: Object,
    daily: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeatherData', weatherSchema);

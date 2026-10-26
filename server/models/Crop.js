const mongoose = require('mongoose');

const soilReadingSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    moisture: { type: Number, min: 0, max: 100 }, // %
    ph: { type: Number, min: 0, max: 14 },
    nitrogen: { type: Number, min: 0 }, // kg/ha
    phosphorus: { type: Number, min: 0 },
    potassium: { type: Number, min: 0 },
  },
  { _id: true }
);

const resourceUsageSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['water', 'fertilizer', 'pesticide', 'seed', 'labour', 'other'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    cost: { type: Number, default: 0 },
  },
  { _id: true }
);

const cropSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    name: { type: String, required: [true, 'Crop name is required'], trim: true },
    variety: String,
    plantingDate: { type: Date, required: [true, 'Planting date is required'] },
    expectedHarvestDate: { type: Date, required: [true, 'Expected harvest date is required'] },
    area: { type: Number, min: 0 },
    stage: {
      type: String,
      enum: ['sowing', 'germination', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested'],
      default: 'sowing',
    },
    health: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
    expectedYield: { type: Number, default: 0 }, // quintal
    actualYield: { type: Number, default: 0 },
    soilReadings: [soilReadingSchema],
    resourceUsage: [resourceUsageSchema],
    activityLog: [{ date: { type: Date, default: Date.now }, note: String }],
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', cropSchema);

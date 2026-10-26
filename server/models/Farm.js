const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Farm name is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'] },
    latitude: { type: Number, required: [true, 'Latitude is required'], min: -90, max: 90 },
    longitude: { type: Number, required: [true, 'Longitude is required'], min: -180, max: 180 },
    size: { type: Number, required: [true, 'Size is required'], min: 0 },
    sizeUnit: { type: String, enum: ['acre', 'hectare'], default: 'acre' },
    soilType: { type: String, enum: ['clay', 'sandy', 'loamy', 'silty', 'black', 'red', 'other'], default: 'loamy' },
    irrigation: { type: String, default: 'rainfed' },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farm', farmSchema);

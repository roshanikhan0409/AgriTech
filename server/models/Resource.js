const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    category: { type: String, enum: ['seed', 'fertilizer', 'pesticide', 'equipment', 'other'], required: true },
    description: String,
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    unit: { type: String, default: 'kg' },
    stock: { type: Number, default: 0, min: 0 },
    approved: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);

const mongoose = require('mongoose');

// Admin/expert-published pest and disease alerts, optionally targeted by crop
const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'] },
    type: { type: String, enum: ['pest', 'disease', 'weather', 'general'], default: 'pest' },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    crops: [String], // crop names this alert applies to (lowercase); empty = all
    description: String,
    treatment: String,
    region: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);

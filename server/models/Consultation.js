const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    subject: { type: String, required: [true, 'Subject is required'] },
    question: { type: String, required: [true, 'Question is required'] },
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
    answer: String,
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answeredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);

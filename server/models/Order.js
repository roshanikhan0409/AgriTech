const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
        name: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true },
    address: { type: String, required: [true, 'Delivery address is required'] },
    status: { type: String, enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

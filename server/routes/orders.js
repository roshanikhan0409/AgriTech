const router = require('express').Router();
const { body } = require('express-validator');
const Order = require('../models/Order');
const Resource = require('../models/Resource');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/error');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  res.json(await Order.find(filter).populate('user', 'name email').sort('-createdAt'));
}));

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Add at least one item'),
    body('items.*.resource').notEmpty().withMessage('Item resource is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('address').trim().notEmpty().withMessage('Delivery address is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    // Prices come from the database, never from the client
    const lines = [];
    let total = 0;
    for (const it of req.body.items) {
      const r = await Resource.findOne({ _id: it.resource, approved: true });
      if (!r) return res.status(400).json({ message: 'An item in your cart is unavailable' });
      if (r.stock < it.quantity) return res.status(400).json({ message: `Not enough stock for ${r.name}` });
      lines.push({ resource: r._id, name: r.name, price: r.price, quantity: it.quantity });
      total += r.price * it.quantity;
    }
    // Decrement stock atomically per line; roll back on failure
    const done = [];
    try {
      for (const l of lines) {
        const upd = await Resource.updateOne({ _id: l.resource, stock: { $gte: l.quantity } }, { $inc: { stock: -l.quantity } });
        if (!upd.modifiedCount) throw new Error(`Not enough stock for ${l.name}`);
        done.push(l);
      }
    } catch (e) {
      for (const l of done) await Resource.updateOne({ _id: l.resource }, { $inc: { stock: l.quantity } });
      return res.status(400).json({ message: e.message });
    }
    const order = await Order.create({ user: req.user._id, items: lines, total, address: req.body.address });
    res.status(201).json(order);
  })
);

// Farmers can cancel their own placed orders; admins can set any status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const { status } = req.body;
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin) {
    if (String(order.user) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    if (status !== 'cancelled' || order.status !== 'placed') return res.status(400).json({ message: 'You can only cancel orders that are still placed' });
  }
  if (!['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  if (status === 'cancelled' && order.status !== 'cancelled') {
    for (const l of order.items) await Resource.updateOne({ _id: l.resource }, { $inc: { stock: l.quantity } });
  }
  order.status = status;
  await order.save();
  res.json(order);
}));

module.exports = router;

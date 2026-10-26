const router = require('express').Router();
const { body } = require('express-validator');
const Resource = require('../models/Resource');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/error');

router.use(protect);

const rules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').isIn(['seed', 'fertilizer', 'pesticide', 'equipment', 'other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// Farmers only see approved items; admins see everything
router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { approved: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) filter.name = { $regex: req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  res.json(await Resource.find(filter).sort('name'));
}));

router.post('/', authorize('admin'), rules, validate, asyncHandler(async (req, res) => {
  res.status(201).json(await Resource.create({ ...req.body, createdBy: req.user._id }));
}));

router.put('/:id', authorize('admin'), rules, validate, asyncHandler(async (req, res) => {
  const item = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Resource not found' });
  res.json(item);
}));

// Admin approval toggle
router.patch('/:id/approve', authorize('admin'), asyncHandler(async (req, res) => {
  const item = await Resource.findByIdAndUpdate(req.params.id, { approved: !!req.body.approved }, { new: true });
  if (!item) return res.status(404).json({ message: 'Resource not found' });
  res.json(item);
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const item = await Resource.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Resource not found' });
  res.json({ message: 'Resource deleted' });
}));

module.exports = router;

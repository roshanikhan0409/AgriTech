const router = require('express').Router();
const { body } = require('express-validator');
const Alert = require('../models/Alert');
const Crop = require('../models/Crop');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/error');

router.use(protect);

// Farmers get active alerts relevant to the crops they grow (or untargeted alerts).
router.get('/', asyncHandler(async (req, res) => {
  if (req.user.role !== 'farmer') {
    return res.json(await Alert.find().sort('-createdAt'));
  }
  const crops = await Crop.find({ owner: req.user._id, stage: { $ne: 'harvested' } }).select('name');
  const names = [...new Set(crops.map((c) => c.name.toLowerCase()))];
  const alerts = await Alert.find({
    active: true,
    $or: [{ crops: { $size: 0 } }, { crops: { $in: names } }],
  }).sort('-createdAt');
  res.json(alerts);
}));

const rules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').optional().isIn(['pest', 'disease', 'weather', 'general']).withMessage('Invalid type'),
  body('severity').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid severity'),
];

const normalize = (b) => ({ ...b, crops: (b.crops || []).map((c) => String(c).trim().toLowerCase()).filter(Boolean) });

router.post('/', authorize('admin', 'expert'), rules, validate, asyncHandler(async (req, res) => {
  res.status(201).json(await Alert.create({ ...normalize(req.body), createdBy: req.user._id }));
}));

router.put('/:id', authorize('admin', 'expert'), rules, validate, asyncHandler(async (req, res) => {
  const a = await Alert.findByIdAndUpdate(req.params.id, normalize(req.body), { new: true, runValidators: true });
  if (!a) return res.status(404).json({ message: 'Alert not found' });
  res.json(a);
}));

router.delete('/:id', authorize('admin', 'expert'), asyncHandler(async (req, res) => {
  const a = await Alert.findByIdAndDelete(req.params.id);
  if (!a) return res.status(404).json({ message: 'Alert not found' });
  res.json({ message: 'Alert deleted' });
}));

module.exports = router;

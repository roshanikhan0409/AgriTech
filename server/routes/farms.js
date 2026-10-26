const router = require('express').Router();
const { body } = require('express-validator');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/error');

router.use(protect);

const rules = [
  body('name').trim().notEmpty().withMessage('Farm name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('size').isFloat({ min: 0 }).withMessage('Size must be a positive number'),
];

const ownerFilter = (req) => (req.user.role === 'admin' ? {} : { owner: req.user._id });

router.get('/', asyncHandler(async (req, res) => {
  res.json(await Farm.find(ownerFilter(req)).sort('-createdAt'));
}));

router.post('/', rules, validate, asyncHandler(async (req, res) => {
  const farm = await Farm.create({ ...req.body, owner: req.user._id });
  res.status(201).json(farm);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const farm = await Farm.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!farm) return res.status(404).json({ message: 'Farm not found' });
  res.json(farm);
}));

router.put('/:id', rules, validate, asyncHandler(async (req, res) => {
  const { owner, ...data } = req.body;
  const farm = await Farm.findOneAndUpdate({ _id: req.params.id, ...ownerFilter(req) }, data, { new: true, runValidators: true });
  if (!farm) return res.status(404).json({ message: 'Farm not found' });
  res.json(farm);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const farm = await Farm.findOneAndDelete({ _id: req.params.id, ...ownerFilter(req) });
  if (!farm) return res.status(404).json({ message: 'Farm not found' });
  await Crop.deleteMany({ farm: farm._id });
  res.json({ message: 'Farm and its crops deleted' });
}));

module.exports = router;

const router = require('express').Router();
const { body } = require('express-validator');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/error');
const { soilRecommendations } = require('../utils/soil');

router.use(protect);

const ownerFilter = (req) => (req.user.role === 'admin' ? {} : { owner: req.user._id });

const rules = [
  body('name').trim().notEmpty().withMessage('Crop name is required'),
  body('farm').notEmpty().withMessage('Farm is required'),
  body('plantingDate').isISO8601().withMessage('Valid planting date is required'),
  body('expectedHarvestDate').isISO8601().withMessage('Valid expected harvest date is required'),
];

const findCrop = (req) => Crop.findOne({ _id: req.params.id, ...ownerFilter(req) });

router.get('/', asyncHandler(async (req, res) => {
  const filter = ownerFilter(req);
  if (req.query.farm) filter.farm = req.query.farm;
  res.json(await Crop.find(filter).populate('farm', 'name location').sort('-createdAt'));
}));

router.post('/', rules, validate, asyncHandler(async (req, res) => {
  const farm = await Farm.findOne({ _id: req.body.farm, owner: req.user._id });
  if (!farm) return res.status(400).json({ message: 'Farm not found or not yours' });
  if (new Date(req.body.expectedHarvestDate) <= new Date(req.body.plantingDate)) {
    return res.status(400).json({ message: 'Harvest date must be after planting date' });
  }
  const { soilReadings, resourceUsage, activityLog, ...data } = req.body;
  const crop = await Crop.create({ ...data, owner: req.user._id });
  res.status(201).json(crop);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const crop = await findCrop(req).populate('farm');
  if (!crop) return res.status(404).json({ message: 'Crop not found' });
  const latest = crop.soilReadings.length ? crop.soilReadings[crop.soilReadings.length - 1] : null;
  res.json({ ...crop.toObject(), recommendations: soilRecommendations(latest, crop.name) });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { owner, soilReadings, resourceUsage, activityLog, ...data } = req.body;
  const crop = await Crop.findOneAndUpdate({ _id: req.params.id, ...ownerFilter(req) }, data, { new: true, runValidators: true });
  if (!crop) return res.status(404).json({ message: 'Crop not found' });
  res.json(crop);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const crop = await Crop.findOneAndDelete({ _id: req.params.id, ...ownerFilter(req) });
  if (!crop) return res.status(404).json({ message: 'Crop not found' });
  res.json({ message: 'Crop deleted' });
}));

// ---- Soil readings ----
router.post(
  '/:id/soil',
  [
    body('moisture').optional().isFloat({ min: 0, max: 100 }).withMessage('Moisture must be 0-100'),
    body('ph').optional().isFloat({ min: 0, max: 14 }).withMessage('pH must be 0-14'),
    body('nitrogen').optional().isFloat({ min: 0 }).withMessage('Nitrogen must be positive'),
    body('phosphorus').optional().isFloat({ min: 0 }).withMessage('Phosphorus must be positive'),
    body('potassium').optional().isFloat({ min: 0 }).withMessage('Potassium must be positive'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const crop = await findCrop(req);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    crop.soilReadings.push(req.body);
    await crop.save();
    const latest = crop.soilReadings[crop.soilReadings.length - 1];
    res.status(201).json({ reading: latest, recommendations: soilRecommendations(latest, crop.name) });
  })
);

router.delete('/:id/soil/:readingId', asyncHandler(async (req, res) => {
  const crop = await findCrop(req);
  if (!crop) return res.status(404).json({ message: 'Crop not found' });
  crop.soilReadings.pull(req.params.readingId);
  await crop.save();
  res.json({ message: 'Reading removed' });
}));

// ---- Resource usage (water, fertilizer, ...) ----
router.post(
  '/:id/usage',
  [body('type').notEmpty().withMessage('Type is required'), body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be positive')],
  validate,
  asyncHandler(async (req, res) => {
    const crop = await findCrop(req);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    crop.resourceUsage.push(req.body);
    await crop.save();
    res.status(201).json(crop.resourceUsage[crop.resourceUsage.length - 1]);
  })
);

router.delete('/:id/usage/:usageId', asyncHandler(async (req, res) => {
  const crop = await findCrop(req);
  if (!crop) return res.status(404).json({ message: 'Crop not found' });
  crop.resourceUsage.pull(req.params.usageId);
  await crop.save();
  res.json({ message: 'Usage entry removed' });
}));

// ---- Activity log ----
router.post('/:id/log', [body('note').trim().notEmpty().withMessage('Note is required')], validate, asyncHandler(async (req, res) => {
  const crop = await findCrop(req);
  if (!crop) return res.status(404).json({ message: 'Crop not found' });
  crop.activityLog.push({ note: req.body.note });
  await crop.save();
  res.status(201).json(crop.activityLog);
}));

module.exports = router;

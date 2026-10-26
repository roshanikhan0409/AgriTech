const router = require('express').Router();
const { body } = require('express-validator');
const Consultation = require('../models/Consultation');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/error');

router.use(protect);

// Farmers see their own; experts/admins see all
router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'farmer' ? { farmer: req.user._id } : {};
  if (req.query.status) filter.status = req.query.status;
  res.json(await Consultation.find(filter).populate('farmer', 'name').populate('crop', 'name').populate('answeredBy', 'name').sort('-createdAt'));
}));

router.post(
  '/',
  authorize('farmer'),
  [body('subject').trim().notEmpty().withMessage('Subject is required'), body('question').trim().notEmpty().withMessage('Question is required')],
  validate,
  asyncHandler(async (req, res) => {
    const { subject, question, crop } = req.body;
    res.status(201).json(await Consultation.create({ subject, question, crop: crop || undefined, farmer: req.user._id }));
  })
);

router.patch('/:id/answer', authorize('expert', 'admin'), [body('answer').trim().notEmpty().withMessage('Answer is required')], validate, asyncHandler(async (req, res) => {
  const c = await Consultation.findByIdAndUpdate(
    req.params.id,
    { answer: req.body.answer, status: 'answered', answeredBy: req.user._id, answeredAt: new Date() },
    { new: true }
  );
  if (!c) return res.status(404).json({ message: 'Consultation not found' });
  res.json(c);
}));

router.patch('/:id/close', asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'farmer') filter.farmer = req.user._id;
  const c = await Consultation.findOneAndUpdate(filter, { status: 'closed' }, { new: true });
  if (!c) return res.status(404).json({ message: 'Consultation not found' });
  res.json(c);
}));

module.exports = router;

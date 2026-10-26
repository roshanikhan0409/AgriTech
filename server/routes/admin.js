const router = require('express').Router();
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Post = require('../models/Post');
const Consultation = require('../models/Consultation');
const Resource = require('../models/Resource');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', asyncHandler(async (req, res) => {
  const [users, farms, crops, orders, posts, openConsults, pendingResources] = await Promise.all([
    User.countDocuments(),
    Farm.countDocuments(),
    Crop.countDocuments(),
    Order.countDocuments(),
    Post.countDocuments(),
    Consultation.countDocuments({ status: 'open' }),
    Resource.countDocuments({ approved: false }),
  ]);
  res.json({ users, farms, crops, orders, posts, openConsults, pendingResources });
}));

router.get('/users', asyncHandler(async (req, res) => {
  res.json(await User.find().select('-password').sort('-createdAt'));
}));

router.patch('/users/:id', asyncHandler(async (req, res) => {
  const update = {};
  if (req.body.role) {
    if (!['farmer', 'admin', 'expert'].includes(req.body.role)) return res.status(400).json({ message: 'Invalid role' });
    update.role = req.body.role;
  }
  if (typeof req.body.active === 'boolean') update.active = req.body.active;
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot change your own role or status' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete yourself' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await Promise.all([Farm.deleteMany({ owner: user._id }), Crop.deleteMany({ owner: user._id })]);
  res.json({ message: 'User and their farm data deleted' });
}));

module.exports = router;

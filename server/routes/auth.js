const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/error');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const payload = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, language: u.language, phone: u.phone });

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, language } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    // Public registration always creates farmers; admins are seeded or promoted by an admin
    const user = await User.create({ name, email, password, phone, language, role: 'farmer' });
    res.status(201).json({ user: payload(user), token: sign(user._id) });
  })
);

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.matchPassword(req.body.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.active) return res.status(403).json({ message: 'Account is disabled' });
    res.json({ user: payload(user), token: sign(user._id) });
  })
);

router.get('/me', protect, (req, res) => res.json({ user: payload(req.user) }));

router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const { name, phone, language } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (language) user.language = language;
    await user.save();
    res.json({ user: payload(user) });
  })
);

module.exports = router;

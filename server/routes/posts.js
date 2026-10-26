const router = require('express').Router();
const { body } = require('express-validator');
const Post = require('../models/Post');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/error');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { hidden: false };
  res.json(await Post.find(filter).populate('author', 'name role').sort('-createdAt'));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name role').populate('comments.author', 'name role');
  if (!post || (post.hidden && req.user.role !== 'admin')) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
}));

router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required'), body('body').trim().notEmpty().withMessage('Body is required')],
  validate,
  asyncHandler(async (req, res) => {
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    res.status(201).json(await Post.create({ title: req.body.title, body: req.body.body, tags, author: req.user._id }));
  })
);

router.post('/:id/comments', [body('text').trim().notEmpty().withMessage('Comment cannot be empty')], validate, asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, hidden: false });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.comments.push({ author: req.user._id, text: req.body.text });
  await post.save();
  res.status(201).json(post.comments[post.comments.length - 1]);
}));

// Authors can delete their own posts; admins can delete any
router.delete('/:id', asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (req.user.role !== 'admin' && String(post.author) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
  await post.deleteOne();
  res.json({ message: 'Post deleted' });
}));

// Moderation: hide/unhide
router.patch('/:id/hide', authorize('admin'), asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { hidden: !!req.body.hidden }, { new: true });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
}));

module.exports = router;

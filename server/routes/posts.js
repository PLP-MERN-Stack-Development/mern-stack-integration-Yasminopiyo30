// posts.js - Routes for blog posts

const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const Category = require('../models/Category');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
router.get('/', advancedResults(Post), async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('category', 'name slug')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name avatar',
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
router.post(
  '/',
  [protect, authorize('admin')],
  [
    body('title').notEmpty().withMessage('Please provide a title'),
    body('content').notEmpty().withMessage('Please provide content'),
    body('category').notEmpty().withMessage('Please provide a category'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Check if category exists
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Category not found',
        });
      }

      // Create post
      const post = await Post.create({
        ...req.body,
        author: req.user.id,
      });

      // Increment category post count
      category.postCount += 1;
      await category.save();

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (err) {
      next(err);
    }
  }
);

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
router.put(
  '/:id',
  [protect, authorize('admin')],
  async (req, res, next) => {
    try {
      let post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      // Check if user owns the post (if not admin)
      if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this post',
        });
      }

      post = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (err) {
      next(err);
    }
  }
);

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
router.delete(
  '/:id',
  [protect, authorize('admin')],
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      // Check if user owns the post (if not admin)
      if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to delete this post',
        });
      }

      await post.remove();

      // Decrement category post count
      const category = await Category.findById(post.category);
      if (category) {
        category.postCount -= 1;
        if (category.postCount < 0) category.postCount = 0;
        await category.save();
      }

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (err) {
      next(err);
    }
  }
);

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
router.post(
  '/:id/comments',
  [protect],
  [
    body('content').notEmpty().withMessage('Please provide comment content'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      post.comments.push({
        content: req.body.content,
        user: req.user.id,
      });

      await post.save();

      const populatedPost = await Post.findById(post._id)
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'name avatar',
          },
        });

      res.status(201).json({
        success: true,
        data: populatedPost.comments[populatedPost.comments.length - 1],
      });
    } catch (err) {
      next(err);
    }
  }
);

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query',
      });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ],
    })
      .populate('author', 'name email')
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
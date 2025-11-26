// categories.js - Routes for blog categories

const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Post = require('../models/Post');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', advancedResults(Category), async (req, res, next) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
router.post(
  '/',
  [protect, authorize('admin')],
  [
    body('name').notEmpty().withMessage('Please provide a category name'),
    body('description').optional().isLength({ max: 200 }).withMessage('Description cannot be more than 200 characters'),
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

      const category = await Category.create(req.body);

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }
);

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put(
  '/:id',
  [protect, authorize('admin')],
  async (req, res, next) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found',
        });
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }
);

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete(
  '/:id',
  [protect, authorize('admin')],
  async (req, res, next) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found',
        });
      }

      // Check if category has posts
      const posts = await Post.find({ category: req.params.id });
      if (posts.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete category with existing posts',
        });
      }

      await category.remove();

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories'
    });
  }
});

// @route   GET /api/categories/active
// @desc    Get active categories
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const categories = await Category.getActiveCategories();
    res.json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching active categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch active categories'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    res.json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch category'
    });
  }
});

module.exports = router;

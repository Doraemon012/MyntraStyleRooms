const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// @route   GET /api/banners
// @desc    Get all banners
// @access  Public
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json({
      status: 'success',
      data: {
        banners
      }
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch banners'
    });
  }
});

// @route   GET /api/banners/active
// @desc    Get active banners
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const banners = await Banner.getActiveBanners();
    res.json({
      status: 'success',
      data: {
        banners
      }
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch active banners'
    });
  }
});

// @route   GET /api/banners/:id
// @desc    Get banner by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.getBannerById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Banner not found'
      });
    }
    res.json({
      status: 'success',
      data: {
        banner
      }
    });
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch banner'
    });
  }
});

module.exports = router;

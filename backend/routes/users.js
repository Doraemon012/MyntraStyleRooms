const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Wardrobe = require('../models/Wardrobe');
const Room = require('../models/Room');
const { authenticateToken } = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/upload');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot be more than 100 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, location, preferences } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (location !== undefined) user.location = location;
    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    // Remove sensitive fields
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/profile/image
// @desc    Upload profile image
// @access  Private
router.post('/profile/image', authenticateToken, uploadProfileImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user's profile image
    user.profileImage = req.file.cloudinary.secure_url;
    await user.save();

    res.json({
      status: 'success',
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's rooms
    const rooms = await Room.findByUser(userId, { limit: 5 });

    // Get user's wardrobes
    const wardrobes = await Wardrobe.findByUser(userId, { limit: 5 });

    // Get user's recent activity
    const recentActivity = await getRecentActivity(userId);

    // Get user's stats
    const stats = await getUserStats(userId);

    res.json({
      status: 'success',
      data: {
        rooms,
        wardrobes,
        recentActivity,
        stats
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name or email (for adding to rooms)
// @access  Private
router.get('/search', authenticateToken, [
  query('q')
    .notEmpty()
    .withMessage('Search query is required'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { q: searchQuery, limit = 10 } = req.query;

    // Search users by name or email
    const users = await User.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    })
    .select('name email profileImage')
    .limit(parseInt(limit));

    res.json({
      status: 'success',
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage
        }))
      }
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('name profileImage location stats badges createdAt');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
      .select('name email profileImage location')
      .limit(parseInt(limit));

    res.json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.post('/preferences', authenticateToken, [
  body('stylePreferences')
    .optional()
    .isArray()
    .withMessage('Style preferences must be an array'),
  body('budgetRange.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum budget must be a number'),
  body('budgetRange.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number'),
  body('favoriteBrands')
    .optional()
    .isArray()
    .withMessage('Favorite brands must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { stylePreferences, budgetRange, favoriteBrands, sizePreferences } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update preferences
    if (stylePreferences !== undefined) user.preferences.stylePreferences = stylePreferences;
    if (budgetRange !== undefined) user.preferences.budgetRange = budgetRange;
    if (favoriteBrands !== undefined) user.preferences.favoriteBrands = favoriteBrands;
    if (sizePreferences !== undefined) user.preferences.sizePreferences = sizePreferences;

    await user.save();

    res.json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// Helper function to get recent activity
async function getRecentActivity(userId) {
  const Message = require('../models/Message');
  const WardrobeItem = require('../models/WardrobeItem');

  const recentMessages = await Message.find({
    senderId: userId,
    isDeleted: false
  })
    .populate('roomId', 'name emoji')
    .sort({ timestamp: -1 })
    .limit(5);

  const recentItems = await WardrobeItem.getRecentItems(userId, 5);

  return {
    messages: recentMessages,
    wardrobeItems: recentItems
  };
}

// Helper function to get user stats
async function getUserStats(userId) {
  const stats = await User.aggregate([
    { $match: { _id: userId } },
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: 'owner',
        as: 'ownedRooms'
      }
    },
    {
      $lookup: {
        from: 'wardrobes',
        localField: '_id',
        foreignField: 'owner',
        as: 'ownedWardrobes'
      }
    },
    {
      $lookup: {
        from: 'wardrobeitems',
        localField: '_id',
        foreignField: 'purchasedBy',
        as: 'purchasedItems'
      }
    },
    {
      $project: {
        roomsCreated: { $size: '$ownedRooms' },
        wardrobesOwned: { $size: '$ownedWardrobes' },
        itemsPurchased: { $size: '$purchasedItems' },
        styleScore: '$stats.styleScore'
      }
    }
  ]);

  return stats[0] || {
    roomsCreated: 0,
    wardrobesOwned: 0,
    itemsPurchased: 0,
    styleScore: 0
  };
}

module.exports = router;

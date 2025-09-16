const express = require('express');
const { body, validationResult } = require('express-validator');
const Wardrobe = require('../models/Wardrobe');
const WardrobeItem = require('../models/WardrobeItem');
const User = require('../models/User');
const { authenticateToken, checkWardrobePermission } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/wardrobes
// @desc    Get all wardrobes for current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, occasionType } = req.query;
    const userId = req.user._id;

    let wardrobes;
    
    if (search) {
      wardrobes = await Wardrobe.searchWardrobes(search, userId);
    } else {
      wardrobes = await Wardrobe.findByUser(userId, { occasionType });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedWardrobes = wardrobes.slice(startIndex, endIndex);

    res.json({
      status: 'success',
      data: {
        wardrobes: paginatedWardrobes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(wardrobes.length / limit),
          totalWardrobes: wardrobes.length,
          hasNext: endIndex < wardrobes.length,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    console.error('Get wardrobes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/wardrobes/stats
// @desc    Get wardrobe statistics for current user
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await Wardrobe.getWardrobeStats(userId);

    res.json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get wardrobe stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/wardrobes/:id
// @desc    Get single wardrobe by ID
// @access  Private
router.get('/:id', authenticateToken, checkWardrobePermission('Viewer'), async (req, res) => {
  try {
    const wardrobe = await Wardrobe.findById(req.params.id)
      .populate('owner', 'name email profileImage')
      .populate('members.userId', 'name email profileImage');

    if (!wardrobe) {
      return res.status(404).json({
        status: 'error',
        message: 'Wardrobe not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        wardrobe,
        userRole: req.userRole
      }
    });
  } catch (error) {
    console.error('Get wardrobe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/wardrobes
// @desc    Create a new wardrobe
// @access  Private
router.post('/', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Wardrobe name must be between 2 and 50 characters'),
  body('emoji')
    .notEmpty()
    .withMessage('Wardrobe emoji is required'),
  body('occasionType')
    .isIn([
      'Wedding & Celebrations',
      'Office & Professional',
      'Casual & Weekend',
      'Party & Nightlife',
      'Travel & Vacation',
      'Festival & Cultural',
      'Sports & Fitness',
      'Date Night',
      'General Collection'
    ])
    .withMessage('Invalid occasion type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot be more than 200 characters')
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

    const { 
      name, 
      emoji, 
      description, 
      occasionType, 
      budgetRange, 
      isPrivate = false, 
      members = [] 
    } = req.body;
    const ownerId = req.user._id;

    // Create wardrobe
    const wardrobe = new Wardrobe({
      name,
      emoji,
      description,
      occasionType,
      budgetRange: budgetRange || { min: 0, max: 50000 },
      isPrivate,
      owner: ownerId,
      members: members.map(member => ({
        userId: member.userId,
        role: member.role || 'Contributor'
      }))
    });

    await wardrobe.save();

    // Update user stats
    await req.user.updateStats('wardrobesOwned');

    // Populate the wardrobe data
    await wardrobe.populate('owner', 'name email profileImage');
    await wardrobe.populate('members.userId', 'name email profileImage');

    res.status(201).json({
      status: 'success',
      message: 'Wardrobe created successfully',
      data: {
        wardrobe
      }
    });
  } catch (error) {
    console.error('Create wardrobe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/wardrobes/:id
// @desc    Update wardrobe
// @access  Private (Owner or Editor)
router.put('/:id', authenticateToken, checkWardrobePermission('Editor'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Wardrobe name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot be more than 200 characters')
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

    const { name, emoji, description, occasionType, budgetRange, isPrivate, settings } = req.body;
    const wardrobe = req.wardrobe;

    // Update fields
    if (name !== undefined) wardrobe.name = name;
    if (emoji !== undefined) wardrobe.emoji = emoji;
    if (description !== undefined) wardrobe.description = description;
    if (occasionType !== undefined) wardrobe.occasionType = occasionType;
    if (budgetRange !== undefined) wardrobe.budgetRange = budgetRange;
    if (isPrivate !== undefined) wardrobe.isPrivate = isPrivate;
    if (settings !== undefined) wardrobe.settings = { ...wardrobe.settings, ...settings };

    await wardrobe.save();

    // Populate the wardrobe data
    await wardrobe.populate('owner', 'name email profileImage');
    await wardrobe.populate('members.userId', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Wardrobe updated successfully',
      data: {
        wardrobe
      }
    });
  } catch (error) {
    console.error('Update wardrobe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/wardrobes/:id
// @desc    Delete wardrobe
// @access  Private (Owner only)
router.delete('/:id', authenticateToken, checkWardrobePermission('Owner'), async (req, res) => {
  try {
    const wardrobe = req.wardrobe;

    // Soft delete - set isActive to false
    wardrobe.isActive = false;
    await wardrobe.save();

    res.json({
      status: 'success',
      message: 'Wardrobe deleted successfully'
    });
  } catch (error) {
    console.error('Delete wardrobe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/wardrobes/:id/items
// @desc    Get items in wardrobe
// @access  Private
router.get('/:id/items', authenticateToken, checkWardrobePermission('Viewer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      category, 
      isPurchased, 
      sortBy = 'addedAt', 
      sortOrder = 'desc' 
    } = req.query;

    const items = await WardrobeItem.getWardrobeItems(id, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      isPurchased: isPurchased ? isPurchased === 'true' : null,
      sortBy,
      sortOrder
    });

    res.json({
      status: 'success',
      data: {
        items,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: items.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get wardrobe items error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/wardrobes/:id/items
// @desc    Add item to wardrobe
// @access  Private (Contributor or higher)
router.post('/:id/items', authenticateToken, checkWardrobePermission('Contributor'), [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot be more than 200 characters')
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

    const { id } = req.params;
    const { productId, notes, customTags, priority = 'medium' } = req.body;
    const addedBy = req.user._id;

    // Check if item already exists in wardrobe
    const existingItem = await WardrobeItem.findOne({
      wardrobeId: id,
      productId,
      isActive: true
    });

    if (existingItem) {
      return res.status(400).json({
        status: 'error',
        message: 'Item already exists in this wardrobe'
      });
    }

    // Create wardrobe item
    const wardrobeItem = new WardrobeItem({
      wardrobeId: id,
      productId,
      addedBy,
      notes,
      customTags,
      priority
    });

    await wardrobeItem.save();

    // Update wardrobe last activity
    await req.wardrobe.updateLastActivity();

    // Populate item data
    await wardrobeItem.populate('productId');
    await wardrobeItem.populate('addedBy', 'name email profileImage');

    res.status(201).json({
      status: 'success',
      message: 'Item added to wardrobe successfully',
      data: {
        item: wardrobeItem
      }
    });
  } catch (error) {
    console.error('Add wardrobe item error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/wardrobes/:id/items/:itemId
// @desc    Remove item from wardrobe
// @access  Private (Editor or higher)
router.delete('/:id/items/:itemId', authenticateToken, checkWardrobePermission('Editor'), async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const item = await WardrobeItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    // Check if user can remove this item
    const isOwner = req.wardrobe.owner.toString() === userId.toString();
    const isItemAdder = item.addedBy.toString() === userId.toString();
    const isEditor = req.userRole === 'Editor' || req.userRole === 'Owner';

    if (!isOwner && !isItemAdder && !isEditor) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to remove this item'
      });
    }

    // Soft delete item
    item.isActive = false;
    await item.save();

    // Update wardrobe item count and last activity
    await req.wardrobe.updateItemCount();
    await req.wardrobe.updateLastActivity();

    res.json({
      status: 'success',
      message: 'Item removed from wardrobe successfully'
    });
  } catch (error) {
    console.error('Remove wardrobe item error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/wardrobes/:id/items/:itemId/reactions
// @desc    Add reaction to wardrobe item
// @access  Private
router.post('/:id/items/:itemId/reactions', authenticateToken, checkWardrobePermission('Viewer'), [
  body('type')
    .isIn(['like', 'love', 'dislike'])
    .withMessage('Invalid reaction type')
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

    const { itemId } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    const item = await WardrobeItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    // Add reaction
    await item.addReaction(userId, type);

    // Populate item data
    await item.populate('productId');
    await item.populate('addedBy', 'name email profileImage');
    await item.populate('purchasedBy', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Reaction added successfully',
      data: {
        item
      }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/wardrobes/:id/items/:itemId/purchase
// @desc    Mark item as purchased
// @access  Private
router.post('/:id/items/:itemId/purchase', authenticateToken, checkWardrobePermission('Viewer'), async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const item = await WardrobeItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    // Mark as purchased
    await item.markAsPurchased(userId);

    // Update user stats
    await req.user.updateStats('itemsPurchased');

    // Populate item data
    await item.populate('productId');
    await item.populate('addedBy', 'name email profileImage');
    await item.populate('purchasedBy', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Item marked as purchased successfully',
      data: {
        item
      }
    });
  } catch (error) {
    console.error('Mark as purchased error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/wardrobes/:id/members
// @desc    Add member to wardrobe
// @access  Private (Owner or Editor)
router.post('/:id/members', authenticateToken, checkWardrobePermission('Editor'), [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('role')
    .optional()
    .isIn(['Editor', 'Contributor', 'Viewer'])
    .withMessage('Invalid role')
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

    const { userId, role = 'Contributor' } = req.body;
    const wardrobe = req.wardrobe;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Add member to wardrobe
    await wardrobe.addMember(userId, role);

    // Populate the wardrobe data
    await wardrobe.populate('owner', 'name email profileImage');
    await wardrobe.populate('members.userId', 'name email profileImage');

    res.json({
      status: 'success',
      message: 'Member added successfully',
      data: {
        wardrobe
      }
    });
  } catch (error) {
    if (error.message === 'User is already a member of this wardrobe') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    console.error('Add member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;

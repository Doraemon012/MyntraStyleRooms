const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user is room owner or has specific role
const checkRoomPermission = (requiredRole = 'Viewer') => {
  return async (req, res, next) => {
    try {
      const { id, roomId } = req.params;
      const roomIdToUse = id || roomId; // Support both parameter names
      const userId = req.user._id;

      const Room = require('../models/Room');
      const room = await Room.findById(roomIdToUse);

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      // Check if user is owner
      if (room.owner.toString() === userId.toString()) {
        req.userRole = 'Owner';
        req.room = room; // Add room to request object
        return next();
      }

      // Check if user is a member with required role
      const member = room.members.find(m => m.userId.toString() === userId.toString());
      
      if (!member) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a member of this room'
        });
      }

      // Define role hierarchy
      const roleHierarchy = {
        'Owner': 4,
        'Editor': 3,
        'Contributor': 2,
        'Viewer': 1
      };

      const userRoleLevel = roleHierarchy[member.role];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          status: 'error',
          message: `You need ${requiredRole} role or higher to perform this action`
        });
      }

      req.userRole = member.role;
      req.room = room;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Permission check error'
      });
    }
  };
};

// Middleware to check wardrobe permissions
const checkWardrobePermission = (requiredRole = 'Viewer') => {
  return async (req, res, next) => {
    try {
      const { wardrobeId } = req.params;
      const userId = req.user._id;

      const Wardrobe = require('../models/Wardrobe');
      const wardrobe = await Wardrobe.findById(wardrobeId);

      if (!wardrobe) {
        return res.status(404).json({
          status: 'error',
          message: 'Wardrobe not found'
        });
      }

      // Check if user is owner
      if (wardrobe.owner.toString() === userId.toString()) {
        req.userRole = 'Owner';
        return next();
      }

      // Check if user is a member with required role
      const member = wardrobe.members.find(m => m.userId.toString() === userId.toString());
      
      if (!member) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a member of this wardrobe'
        });
      }

      // Define role hierarchy
      const roleHierarchy = {
        'Owner': 4,
        'Editor': 3,
        'Contributor': 2,
        'Viewer': 1
      };

      const userRoleLevel = roleHierarchy[member.role];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          status: 'error',
          message: `You need ${requiredRole} role or higher to perform this action`
        });
      }

      req.userRole = member.role;
      req.wardrobe = wardrobe;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Permission check error'
      });
    }
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  checkRoomPermission,
  checkWardrobePermission,
  optionalAuth
};

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const sharp = require('sharp');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'myntra-fashion',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto' }
    ]
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// Middleware for single image upload
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File size too large. Maximum size is 10MB.'
          });
        }
        return res.status(400).json({
          status: 'error',
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Middleware for multiple images upload
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File size too large. Maximum size is 10MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            status: 'error',
            message: `Too many files. Maximum ${maxCount} files allowed.`
          });
        }
        return res.status(400).json({
          status: 'error',
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Middleware for profile image upload with specific transformations
const uploadProfileImage = () => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single('profileImage');
    
    uploadMiddleware(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File size too large. Maximum size is 10MB.'
          });
        }
        return res.status(400).json({
          status: 'error',
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      // Process image for profile (square crop, specific size)
      if (req.file) {
        try {
          const processedImage = await cloudinary.uploader.upload(req.file.path, {
            transformation: [
              { width: 300, height: 300, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' }
            ],
            folder: 'myntra-fashion/profiles'
          });
          
          req.file.cloudinary = processedImage;
        } catch (error) {
          console.error('Image processing error:', error);
          return res.status(500).json({
            status: 'error',
            message: 'Image processing failed'
          });
        }
      }
      
      next();
    });
  };
};

// Middleware for product image upload
const uploadProductImages = () => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array('images', 5);
    
    uploadMiddleware(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File size too large. Maximum size is 10MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            status: 'error',
            message: 'Too many files. Maximum 5 images allowed.'
          });
        }
        return res.status(400).json({
          status: 'error',
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      // Process images for products
      if (req.files && req.files.length > 0) {
        try {
          const processedImages = [];
          
          for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const processedImage = await cloudinary.uploader.upload(file.path, {
              transformation: [
                { width: 800, height: 1000, crop: 'limit', quality: 'auto' },
                { fetch_format: 'auto' }
              ],
              folder: 'myntra-fashion/products'
            });
            
            processedImages.push({
              ...processedImage,
              isPrimary: i === 0 // First image is primary
            });
          }
          
          req.files = processedImages;
        } catch (error) {
          console.error('Image processing error:', error);
          return res.status(500).json({
            status: 'error',
            message: 'Image processing failed'
          });
        }
      }
      
      next();
    });
  };
};

// Utility function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Utility function to get image URL with transformations
const getImageUrl = (publicId, transformations = []) => {
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadProfileImage,
  uploadProductImages,
  deleteImage,
  getImageUrl,
  cloudinary
};

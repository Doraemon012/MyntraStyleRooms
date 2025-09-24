const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Banner image is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [200, 'Banner title cannot be more than 200 characters']
  },
  discount: {
    type: String,
    required: [true, 'Banner discount text is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Banner brand is required'],
    trim: true
  },
  buttonText: {
    type: String,
    required: [true, 'Banner button text is required'],
    trim: true,
    maxlength: [50, 'Button text cannot be more than 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  link: {
    type: String,
    trim: true
  },
  target: {
    type: String,
    enum: ['_self', '_blank'],
    default: '_self'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ order: 1 });

// Static method to get active banners
bannerSchema.statics.getActiveBanners = function() {
  return this.find({ isActive: true })
    .sort({ order: 1 });
};

// Static method to get banner by ID
bannerSchema.statics.getBannerById = function(id) {
  return this.findById(id);
};

module.exports = mongoose.model('Banner', bannerSchema);

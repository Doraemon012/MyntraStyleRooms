const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  icon: {
    type: String,
    required: [true, 'Category icon is required'],
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    trim: true,
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  count: {
    type: Number,
    default: 0,
    min: [0, 'Count cannot be negative']
  },
  subcategories: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Virtual for product count (will be updated by products)
categorySchema.virtual('productCount').get(function() {
  return this.count;
});

// Static method to get active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true })
    .sort({ order: 1, name: 1 });
};

// Static method to get all categories
categorySchema.statics.getAllCategories = function() {
  return this.find({})
    .sort({ order: 1, name: 1 });
};

// Static method to update category count
categorySchema.statics.updateCategoryCount = async function(categoryName, increment = 1) {
  return this.findOneAndUpdate(
    { name: categoryName },
    { $inc: { count: increment } },
    { new: true }
  );
};

module.exports = mongoose.model('Category', categorySchema);

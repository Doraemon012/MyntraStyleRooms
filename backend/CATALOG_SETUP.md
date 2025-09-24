# Catalog Data Migration Setup

This guide explains how to migrate mock data from the frontend to MongoDB and set up the backend API.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set up Environment Variables
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/myntra_style_rooms
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=30d
NODE_ENV=development
PORT=5000
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 4. Seed the Database
Run the seeding script to populate the database with mock data:
```bash
npm run seed
```

### 5. Start the Backend Server
```bash
npm run dev
```

## 📊 What Gets Seeded

The seeding script will populate your MongoDB database with:

- **Products**: 12 detailed products with reviews, questions, and specifications
- **Categories**: 5 main categories (Fashion, Beauty, Homeliving, Footwear, Accessories)
- **Banners**: 4 promotional banners

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/trending` - Get trending products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/similar` - Get similar products

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/active` - Get active categories
- `GET /api/categories/:id` - Get category by ID

### Banners
- `GET /api/banners` - Get all banners
- `GET /api/banners/active` - Get active banners
- `GET /api/banners/:id` - Get banner by ID

## 🗄️ Database Schema

### Product Schema
- Basic info: name, brand, category, subcategory
- Pricing: price, originalPrice, discount, discountPercentage
- Media: image, images array
- Details: description, features, material, color
- Sizing: sizes, availableSizes
- Reviews: rating, reviewCount, reviews array
- Q&A: questions array
- Flags: isNew, isTrending, isSustainable
- Delivery: standard and express options
- Offers: bank offers, coupon offers
- Metadata: tags, trending score, view counts

### Category Schema
- Basic info: name, icon, color
- Status: isActive, count
- Organization: subcategories, order

### Banner Schema
- Content: image, title, discount, brand, buttonText
- Status: isActive, order
- Navigation: link, target

## 🔄 Frontend Integration

The frontend has been updated to use the new API:

1. **New API Service**: `services/catalogApi.ts`
2. **Updated Hooks**: All hooks now fetch from backend
3. **Error Handling**: Proper error handling and loading states
4. **Type Safety**: Full TypeScript support

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MongoDB is running
- Check the MONGODB_URI in your .env file
- Verify MongoDB is accessible on the specified port

### Seeding Issues
- Check if the database exists
- Ensure you have write permissions
- Check the console for error messages

### API Issues
- Verify the backend server is running on port 5000
- Check CORS settings in server.js
- Ensure all required environment variables are set

## 📝 Next Steps

1. **Test the API**: Use Postman or curl to test endpoints
2. **Verify Frontend**: Check that the catalog loads data from the API
3. **Add More Data**: Extend the seeding script with more products
4. **Implement Search**: Add advanced search functionality
5. **Add Pagination**: Implement pagination for large datasets

## 🎯 Benefits

- **Scalability**: Easy to add more products and categories
- **Performance**: Database queries are optimized
- **Flexibility**: Easy to modify data structure
- **Real-time**: Can update data without app updates
- **Analytics**: Track product views and interactions

# Backend Integration Guide

This document provides a comprehensive guide for integrating the frontend with MongoDB and backend services.

## 📁 Data Structure Files

All mock data has been separated into organized files for easy MongoDB integration:

### 1. Products (`data/products.ts`)
- **Interface**: `Product` - Complete product data structure
- **Fields**: `_id`, `name`, `brand`, `price`, `originalPrice`, `discount`, `rating`, `images`, `category`, `subcategory`, `description`, `features`, `material`, `color`, `sizes`, `delivery`, `offers`, `reviews`, `questions`, etc.
- **Helper Functions**: `getProductById()`, `getProductsByCategory()`, `getSimilarProducts()`, `getYouMayAlsoLike()`, `searchProducts()`, `getTrendingProducts()`, `getNewProducts()`

### 2. Categories (`data/categories.ts`)
- **Interface**: `Category` - Category data structure
- **Fields**: `_id`, `name`, `icon`, `color`, `isActive`, `count`, `subcategories`
- **Helper Functions**: `getCategoryById()`, `getActiveCategories()`, `getAllCategories()`

### 3. Banners (`data/banners.ts`)
- **Interface**: `Banner` - Banner data structure
- **Fields**: `_id`, `image`, `title`, `discount`, `brand`, `buttonText`, `isActive`, `order`
- **Helper Functions**: `getActiveBanners()`, `getBannerById()`

### 4. Play Menu Items (`data/playMenuItems.ts`)
- **Interface**: `PlayMenuItem` - Play menu data structure
- **Fields**: `_id`, `title`, `description`, `icon`, `hasNewTag`, `isActive`, `order`, `route`
- **Helper Functions**: `getActivePlayMenuItems()`, `getPlayMenuItemById()`

## 🔌 API Service Layer

### API Service (`services/api.ts`)
Complete API service layer with all necessary endpoints:

- **Product API**: `productAPI.getAll()`, `productAPI.getById()`, `productAPI.getSimilar()`, `productAPI.search()`, etc.
- **Category API**: `categoryAPI.getAll()`, `categoryAPI.getActive()`, `categoryAPI.getById()`
- **Banner API**: `bannerAPI.getAll()`, `bannerAPI.getActive()`, `bannerAPI.getById()`
- **Play Menu API**: `playMenuAPI.getAll()`, `playMenuAPI.getActive()`, `playMenuAPI.getById()`
- **User API**: `userAPI.getProfile()`, `userAPI.updateProfile()`, `userAPI.getWishlist()`, etc.
- **Cart API**: `cartAPI.getItems()`, `cartAPI.addItem()`, `cartAPI.updateQuantity()`, etc.
- **Order API**: `orderAPI.getOrders()`, `orderAPI.create()`, `orderAPI.cancel()`, etc.
- **Review API**: `reviewAPI.getByProduct()`, `reviewAPI.create()`, `reviewAPI.update()`, etc.

## 🎣 Custom Hooks

### Product Hooks (`hooks/useProducts.ts`)
- `useProducts()` - Fetch all products with filters
- `useProduct(id)` - Fetch single product
- `useSimilarProducts(productId, limit)` - Fetch similar products
- `useRecommendedProducts(productId, limit)` - Fetch recommended products
- `useTrendingProducts(limit)` - Fetch trending products
- `useProductSearch(query)` - Search products with debouncing

### Category Hooks (`hooks/useCategories.ts`)
- `useCategories()` - Fetch all categories
- `useActiveCategories()` - Fetch active categories only

### Banner Hooks (`hooks/useBanners.ts`)
- `useBanners()` - Fetch all banners
- `useActiveBanners()` - Fetch active banners only

### Play Menu Hooks (`hooks/usePlayMenu.ts`)
- `usePlayMenuItems()` - Fetch all play menu items
- `useActivePlayMenuItems()` - Fetch active play menu items only

## 🗄️ MongoDB Schema Examples

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  brand: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  discountPercentage: Number,
  rating: Number,
  reviewCount: Number,
  image: String,
  images: [String],
  category: String,
  subcategory: String,
  description: String,
  features: [String],
  material: String,
  color: String,
  sizes: [String],
  availableSizes: [String],
  isNew: Boolean,
  isTrending: Boolean,
  isSustainable: Boolean,
  sustainability: String,
  delivery: {
    standard: {
      estimatedDays: String,
      price: Number,
      originalPrice: Number,
      discount: Number
    },
    express: {
      estimatedDays: String,
      price: Number
    }
  },
  offers: {
    bankOffers: [String],
    couponOffers: [String],
    additionalDiscount: Number
  },
  returnPolicy: String,
  paymentOptions: {
    cod: Boolean,
    codFee: Number
  },
  similarProducts: [ObjectId],
  youMayAlsoLike: [ObjectId],
  reviews: [{
    _id: ObjectId,
    userId: ObjectId,
    userName: String,
    rating: Number,
    comment: String,
    date: String,
    verified: Boolean,
    helpful: Number,
    images: [String]
  }],
  questions: [{
    _id: ObjectId,
    question: String,
    answer: String,
    askedBy: String,
    answeredBy: String,
    date: String,
    helpful: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,
  icon: String,
  color: String,
  isActive: Boolean,
  count: Number,
  subcategories: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Banners Collection
```javascript
{
  _id: ObjectId,
  image: String,
  title: String,
  discount: String,
  brand: String,
  buttonText: String,
  isActive: Boolean,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Play Menu Items Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  icon: String,
  hasNewTag: Boolean,
  isActive: Boolean,
  order: Number,
  route: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Integration Steps

### Step 1: Replace Mock Data with API Calls

1. **Update API Service**:
   - Set `API_BASE_URL` in `services/api.ts` to your backend URL
   - Uncomment the actual API calls in each hook file
   - Comment out the mock data imports and calls

2. **Example for Products**:
   ```typescript
   // In hooks/useProducts.ts
   // Replace this:
   const { mockProducts, getProductsByCategory, searchProducts } = await import('../data/products');
   
   // With this:
   const data = await productAPI.getAll(filters);
   setProducts(data.products);
   ```

### Step 2: Backend API Endpoints

Create these endpoints in your backend:

#### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/similar` - Get similar products
- `GET /api/products/:id/recommended` - Get recommended products
- `GET /api/products/search` - Search products
- `GET /api/products/trending` - Get trending products
- `GET /api/products/new` - Get new products
- `GET /api/products/category/:category` - Get products by category

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/active` - Get active categories
- `GET /api/categories/:id` - Get category by ID

#### Banners
- `GET /api/banners` - Get all banners
- `GET /api/banners/active` - Get active banners
- `GET /api/banners/:id` - Get banner by ID

#### Play Menu
- `GET /api/play-menu` - Get all play menu items
- `GET /api/play-menu/active` - Get active play menu items
- `GET /api/play-menu/:id` - Get play menu item by ID

### Step 3: Environment Variables

Add these to your `.env` file:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 4: Error Handling

The hooks include comprehensive error handling. You can customize error messages and retry logic as needed.

### Step 5: Loading States

All hooks provide loading states that you can use to show loading indicators in your UI.

## 🔄 Data Flow

1. **Component** calls a hook (e.g., `useProducts()`)
2. **Hook** calls the API service (e.g., `productAPI.getAll()`)
3. **API Service** makes HTTP request to backend
4. **Backend** queries MongoDB and returns data
5. **Hook** updates state with the data
6. **Component** re-renders with new data

## 📱 Usage Examples

### In Catalog Screen
```typescript
import { useProducts, useCategories, useActiveBanners } from '../hooks';

export default function CatalogScreen() {
  const { products, loading: productsLoading } = useProducts({ category: 'Women' });
  const { categories, loading: categoriesLoading } = useCategories();
  const { banners, loading: bannersLoading } = useActiveBanners();
  
  // Use the data in your component
}
```

### In Product Detail Screen
```typescript
import { useProduct, useSimilarProducts, useRecommendedProducts } from '../hooks';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { product, loading: productLoading } = useProduct(id);
  const { products: similarProducts } = useSimilarProducts(id);
  const { products: recommendedProducts } = useRecommendedProducts(id);
  
  // Use the data in your component
}
```

## 🎯 Benefits

1. **Easy Migration**: Simply uncomment API calls and comment out mock data
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Error Handling**: Built-in error handling and loading states
4. **Reusability**: Hooks can be used across multiple components
5. **Maintainability**: Centralized data management and API calls
6. **Scalability**: Easy to add new endpoints and features

## 🔧 Customization

You can easily customize:
- API endpoints and parameters
- Error handling and retry logic
- Loading states and indicators
- Data transformation and filtering
- Caching and optimization strategies

This structure makes it very easy to integrate with any backend technology (Node.js, Python, Java, etc.) and any database (MongoDB, PostgreSQL, MySQL, etc.).

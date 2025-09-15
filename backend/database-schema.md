# MongoDB Database Schema Design

## Collections Structure

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  profileImage: String,
  location: String,
  preferences: {
    stylePreferences: [String],
    budgetRange: { min: Number, max: Number },
    favoriteBrands: [String],
    sizePreferences: Object
  },
  stats: {
    roomsCreated: Number,
    wardrobesOwned: Number,
    itemsPurchased: Number,
    styleScore: Number
  },
  badges: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Rooms Collection
```javascript
{
  _id: ObjectId,
  name: String,
  emoji: String,
  description: String,
  isPrivate: Boolean,
  owner: ObjectId (ref: Users),
  members: [{
    userId: ObjectId (ref: Users),
    role: String, // 'Owner', 'Editor', 'Contributor', 'Viewer'
    joinedAt: Date
  }],
  lastMessage: String,
  lastActivity: Date,
  isLive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Messages Collection
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: Rooms),
  senderId: ObjectId (ref: Users),
  senderType: String, // 'user', 'ai'
  text: String,
  messageType: String, // 'text', 'product', 'image', 'voice'
  productData: {
    name: String,
    price: String,
    image: String,
    productId: ObjectId
  },
  timestamp: Date,
  isRead: [ObjectId] // Array of user IDs who read the message
}
```

### 4. Wardrobes Collection
```javascript
{
  _id: ObjectId,
  name: String,
  emoji: String,
  description: String,
  occasionType: String,
  budgetRange: { min: Number, max: Number },
  isPrivate: Boolean,
  owner: ObjectId (ref: Users),
  members: [{
    userId: ObjectId (ref: Users),
    role: String, // 'Owner', 'Editor', 'Contributor', 'Viewer'
    joinedAt: Date
  }],
  itemCount: Number,
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. WardrobeItems Collection
```javascript
{
  _id: ObjectId,
  wardrobeId: ObjectId (ref: Wardrobes),
  productId: ObjectId (ref: Products),
  addedBy: ObjectId (ref: Users),
  addedAt: Date,
  isPurchased: Boolean,
  purchasedBy: ObjectId (ref: Users),
  purchasedAt: Date,
  reactions: [{
    userId: ObjectId (ref: Users),
    type: String, // 'like', 'love', 'dislike'
    createdAt: Date
  }],
  notes: String
}
```

### 6. Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  brand: String,
  category: String,
  subcategory: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  images: [String],
  description: String,
  specifications: Object,
  sizes: [String],
  colors: [String],
  rating: Number,
  reviewCount: Number,
  isAvailable: Boolean,
  tags: [String],
  aiRecommended: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. OutfitSuggestions Collection
```javascript
{
  _id: ObjectId,
  wardrobeId: ObjectId (ref: Wardrobes),
  name: String,
  items: [ObjectId], // Array of WardrobeItems
  occasion: String,
  aiConfidence: Number,
  createdBy: String, // 'ai' or userId
  createdAt: Date,
  isSaved: Boolean,
  savedBy: ObjectId (ref: Users)
}
```

### 8. LiveCalls Collection
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: Rooms),
  hostId: ObjectId (ref: Users),
  participants: [{
    userId: ObjectId (ref: Users),
    joinedAt: Date,
    isMuted: Boolean,
    isSpeaking: Boolean
  }],
  wardrobeItems: [ObjectId], // Array of WardrobeItems
  callDuration: Number,
  status: String, // 'active', 'ended'
  startedAt: Date,
  endedAt: Date
}
```

### 9. Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  type: String, // 'room_invite', 'wardrobe_invite', 'message', 'ai_suggestion'
  title: String,
  message: String,
  data: Object, // Additional data specific to notification type
  isRead: Boolean,
  createdAt: Date
}
```

## Indexes for Performance

```javascript
// Users
db.users.createIndex({ "email": 1 }, { unique: true })

// Rooms
db.rooms.createIndex({ "owner": 1 })
db.rooms.createIndex({ "members.userId": 1 })
db.rooms.createIndex({ "lastActivity": -1 })

// Messages
db.messages.createIndex({ "roomId": 1, "timestamp": -1 })
db.messages.createIndex({ "senderId": 1 })

// Wardrobes
db.wardrobes.createIndex({ "owner": 1 })
db.wardrobes.createIndex({ "members.userId": 1 })

// WardrobeItems
db.wardrobeitems.createIndex({ "wardrobeId": 1 })
db.wardrobeitems.createIndex({ "addedBy": 1 })

// Products
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "brand": 1 })
db.products.createIndex({ "price": 1 })
db.products.createIndex({ "name": "text", "description": "text" })

// LiveCalls
db.livecalls.createIndex({ "roomId": 1 })
db.livecalls.createIndex({ "status": 1 })

// Notifications
db.notifications.createIndex({ "userId": 1, "isRead": 1 })
db.notifications.createIndex({ "createdAt": -1 })
```

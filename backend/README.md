# Myntra Fashion Ecosystem Backend

A comprehensive backend API for the Myntra Fashion Ecosystem featuring Rooms, Live Calls, Shared Wardrobes, and AI-powered styling recommendations.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based permissions
- **Rooms**: Group chat spaces with AI chatbot integration
- **Wardrobes**: Shared, permissioned clothing collections
- **Live Calls**: Voice calls with wardrobe linkage using WebRTC
- **AI Integration**: OpenAI-powered styling recommendations
- **Product Catalog**: Search and filter Myntra products
- **Real-time Communication**: Socket.io for live updates
- **File Upload**: Cloudinary integration for image handling
- **Database**: MongoDB with optimized schemas and indexes

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account
- OpenAI API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MyntraStyleRooms/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myntra-fashion

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Cloudinary (Image Storage)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |

### Rooms Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/rooms` | Get user's rooms | Private |
| POST | `/api/rooms` | Create new room | Private |
| GET | `/api/rooms/:id` | Get room details | Private |
| PUT | `/api/rooms/:id` | Update room | Private (Owner/Editor) |
| DELETE | `/api/rooms/:id` | Delete room | Private (Owner) |
| POST | `/api/rooms/:id/members` | Add member | Private (Owner/Editor) |
| POST | `/api/rooms/:id/join` | Join room | Private |

### Wardrobes Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/wardrobes` | Get user's wardrobes | Private |
| POST | `/api/wardrobes` | Create new wardrobe | Private |
| GET | `/api/wardrobes/:id` | Get wardrobe details | Private |
| GET | `/api/wardrobes/:id/items` | Get wardrobe items | Private |
| POST | `/api/wardrobes/:id/items` | Add item to wardrobe | Private (Contributor+) |
| DELETE | `/api/wardrobes/:id/items/:itemId` | Remove item | Private (Editor+) |

### Messages Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/messages/:roomId` | Get room messages | Private |
| POST | `/api/messages/:roomId` | Send message | Private (Contributor+) |
| PUT | `/api/messages/:id` | Edit message | Private (Sender) |
| DELETE | `/api/messages/:id` | Delete message | Private (Sender/Owner) |
| POST | `/api/messages/:id/reactions` | Add reaction | Private |

### Live Calls Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/calls/:roomId/start` | Start call | Private (Contributor+) |
| POST | `/api/calls/:callId/join` | Join call | Private |
| POST | `/api/calls/:callId/leave` | Leave call | Private |
| POST | `/api/calls/:callId/end` | End call | Private (Host) |
| PUT | `/api/calls/:callId/participant/:userId/status` | Update status | Private |

### AI Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/ai/chat` | Chat with AI stylist | Private |
| POST | `/api/ai/outfit-suggestions` | Get outfit suggestions | Private |
| POST | `/api/ai/product-recommendations` | Get product recommendations | Private |
| POST | `/api/ai/style-analysis` | Analyze user style | Private |

### Products Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/products` | Search products | Public |
| GET | `/api/products/trending` | Get trending products | Public |
| GET | `/api/products/ai-recommended` | Get AI recommendations | Public |
| GET | `/api/products/:id` | Get product details | Public |
| GET | `/api/products/:id/similar` | Get similar products | Public |

## 🗄️ Database Schema

### Collections

- **Users**: User profiles, preferences, and stats
- **Rooms**: Group chat spaces with members and permissions
- **Messages**: Chat messages with reactions and metadata
- **Wardrobes**: Shared clothing collections
- **WardrobeItems**: Individual items in wardrobes
- **Products**: Myntra product catalog
- **LiveCalls**: Voice call sessions with participants
- **Notifications**: User notifications

### Key Features

- **Indexes**: Optimized for performance
- **Virtual Fields**: Computed properties
- **Pre/Post Hooks**: Automatic data processing
- **Validation**: Comprehensive input validation
- **Relationships**: Proper references and population

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | No (default: 7d) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

### Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: Rate limit information included

### File Upload

- **Max Size**: 10MB per file
- **Allowed Types**: JPEG, PNG, WebP
- **Storage**: Cloudinary with automatic optimization

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "auth"
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Set secure JWT secrets
   - Configure production Cloudinary

2. **Security**
   - Enable HTTPS
   - Set up CORS for production domains
   - Configure rate limiting
   - Set up monitoring

3. **Performance**
   - Enable compression
   - Set up caching
   - Monitor database performance
   - Optimize images

### Deployment Options

- **Heroku**: Easy deployment with add-ons
- **AWS**: EC2, ECS, or Lambda
- **DigitalOcean**: Droplets or App Platform
- **Railway**: Simple deployment platform

## 📊 Monitoring

### Health Check

```bash
GET /api/health
```

### Metrics to Monitor

- **Response Times**: API endpoint performance
- **Error Rates**: 4xx and 5xx responses
- **Database**: Connection pool and query performance
- **Memory**: Node.js memory usage
- **CPU**: Server CPU utilization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- **Issues**: GitHub Issues
- **Documentation**: API documentation
- **Email**: support@example.com

## 🔄 Updates

### Version 1.0.0
- Initial release
- Core features implemented
- Authentication system
- Rooms and wardrobes
- AI integration
- Live calls
- Product catalog

---

**Built with ❤️ for the Myntra Fashion Ecosystem**

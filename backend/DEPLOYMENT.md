# 🚀 Deployment Guide for Myntra Fashion Backend

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] MongoDB Atlas cluster created and configured
- [ ] Cloudinary account set up with API credentials
- [ ] OpenAI API key obtained
- [ ] Production environment variables configured
- [ ] Domain name registered (if needed)

### 2. Security Configuration
- [ ] Strong JWT secrets generated
- [ ] CORS origins configured for production
- [ ] Rate limiting configured
- [ ] HTTPS certificates ready
- [ ] Environment variables secured

### 3. Database Preparation
- [ ] MongoDB indexes created
- [ ] Database seeded with initial data
- [ ] Backup strategy implemented
- [ ] Connection pooling configured

## 🌐 Deployment Options

### Option 1: Heroku (Recommended for Quick Start)

#### Prerequisites
- Heroku CLI installed
- Git repository set up

#### Steps
1. **Create Heroku App**
   ```bash
   heroku create myntra-fashion-backend
   ```

2. **Add Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myntra-fashion
   heroku config:set JWT_SECRET=your-production-jwt-secret
   heroku config:set JWT_EXPIRE=7d
   heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
   heroku config:set CLOUDINARY_API_KEY=your-api-key
   heroku config:set CLOUDINARY_API_SECRET=your-api-secret
   heroku config:set OPENAI_API_KEY=your-openai-key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

4. **Seed Database**
   ```bash
   heroku run npm run seed
   ```

### Option 2: AWS EC2

#### Prerequisites
- AWS account
- EC2 instance running Ubuntu 20.04+

#### Steps
1. **Connect to EC2 Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd MyntraStyleRooms/backend
   npm install --production
   ```

5. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env with production values
   ```

6. **Start Application**
   ```bash
   pm2 start server.js --name "myntra-backend"
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx (Optional)**
   ```bash
   sudo apt install nginx
   # Configure nginx reverse proxy
   ```

### Option 3: DigitalOcean App Platform

#### Steps
1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select Node.js as the runtime

2. **Configure Build Settings**
   ```yaml
   build_command: npm install
   run_command: npm start
   source_dir: /backend
   ```

3. **Set Environment Variables**
   - Add all required environment variables
   - Set NODE_ENV=production

4. **Deploy**
   - Click "Create Resources"
   - Wait for deployment to complete

### Option 4: Railway

#### Steps
1. **Connect Repository**
   - Go to Railway.app
   - Connect your GitHub repository

2. **Configure Service**
   - Set root directory to `/backend`
   - Add environment variables

3. **Deploy**
   - Railway automatically detects Node.js
   - Deploys on every push to main branch

## 🔧 Production Configuration

### Environment Variables Template

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myntra-fashion?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-production-jwt-secret-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Socket.io
SOCKET_CORS_ORIGIN=https://your-frontend-domain.com
```

### Security Best Practices

1. **JWT Secrets**
   ```bash
   # Generate secure secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: process.env.CORS_ORIGIN?.split(',') || ['https://yourdomain.com'],
     credentials: true
   }));
   ```

3. **Rate Limiting**
   ```javascript
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP'
   });
   ```

## 📊 Monitoring Setup

### Health Check Endpoint

```bash
# Test health endpoint
curl https://your-api-domain.com/api/health
```

### Monitoring Tools

1. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

2. **Application Monitoring**
   - New Relic
   - DataDog
   - LogRocket

3. **Error Tracking**
   - Sentry
   - Bugsnag
   - Rollbar

### Log Management

```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🗄️ Database Optimization

### MongoDB Atlas Configuration

1. **Cluster Settings**
   - Use M10 or higher for production
   - Enable auto-scaling
   - Configure backup retention

2. **Indexes**
   ```javascript
   // Ensure these indexes are created
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.rooms.createIndex({ "owner": 1 })
   db.messages.createIndex({ "roomId": 1, "timestamp": -1 })
   db.products.createIndex({ "name": "text", "description": "text" })
   ```

3. **Connection Pooling**
   ```javascript
   mongoose.connect(process.env.MONGODB_URI, {
     maxPoolSize: 10,
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
   });
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        
    - name: Run tests
      run: |
        cd backend
        npm test
        
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "myntra-fashion-backend"
        heroku_email: "your-email@example.com"
        appdir: "backend"
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check MongoDB connection
   mongosh "your-connection-string"
   ```

2. **Memory Issues**
   ```bash
   # Monitor memory usage
   pm2 monit
   ```

3. **CORS Issues**
   ```javascript
   // Check CORS configuration
   console.log('CORS Origin:', process.env.CORS_ORIGIN);
   ```

4. **File Upload Issues**
   ```bash
   # Check Cloudinary configuration
   curl -X GET "https://api.cloudinary.com/v1_1/your-cloud-name/resources/image"
   ```

### Performance Optimization

1. **Enable Compression**
   ```javascript
   app.use(compression());
   ```

2. **Cache Static Assets**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1d'
   }));
   ```

3. **Database Query Optimization**
   ```javascript
   // Use lean() for read-only queries
   const users = await User.find().lean();
   ```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**
   - Use nginx or AWS ALB
   - Configure sticky sessions for Socket.io

2. **Multiple Instances**
   ```bash
   # PM2 cluster mode
   pm2 start server.js -i max --name "myntra-backend"
   ```

3. **Redis for Sessions**
   ```javascript
   const session = require('express-session');
   const RedisStore = require('connect-redis')(session);
   
   app.use(session({
     store: new RedisStore({ client: redisClient }),
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false
   }));
   ```

### Vertical Scaling

1. **Increase Server Resources**
   - More CPU cores
   - More RAM
   - Faster storage

2. **Database Scaling**
   - MongoDB Atlas auto-scaling
   - Read replicas
   - Sharding for large datasets

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] Strong JWT secrets
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure headers (helmet.js)
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular security updates

## 📞 Support

For deployment issues:

1. **Check Logs**
   ```bash
   heroku logs --tail
   pm2 logs
   ```

2. **Health Check**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

3. **Database Status**
   ```bash
   mongosh "your-connection-string" --eval "db.stats()"
   ```

---

**Happy Deploying! 🚀**

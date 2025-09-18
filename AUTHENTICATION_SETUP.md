# Authentication Setup Guide

This guide will help you set up the complete authentication system for the MyntraStyleRooms app, including both frontend and backend integration with MongoDB Atlas.

## Prerequisites

- Node.js (v20.10.0 or higher)
- MongoDB Atlas account
- Expo CLI installed
- Git

## Backend Setup

### 1. Install Dependencies

The backend already has all necessary dependencies installed. If you need to reinstall:

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myntra-fashion?retryWrites=true&w=majority

# JWT Configuration - Generate strong secrets for production
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_REFRESH_EXPIRE=30d

# Cloudinary (Image Storage) - Optional for now
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI Configuration - Optional for AI features
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (Nodemailer) - Optional for password reset
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Socket.io Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000

# External APIs
MYNTRA_API_KEY=your-myntra-api-key
MYNTRA_API_URL=https://api.myntra.com

# Redis (for caching and sessions) - Optional
REDIS_URL=redis://localhost:6379

# WebRTC Configuration - Optional for video calls
WEBRTC_STUN_SERVERS=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=turn:your-turn-server.com:3478
WEBRTC_TURN_USERNAME=your-turn-username
WEBRTC_TURN_PASSWORD=your-turn-password
```

### 3. MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Create a Cluster"
   - Choose the free tier (M0)
   - Select a region close to your location
   - Name your cluster (e.g., "myntra-fashion")

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password
   - Grant "Read and write to any database" permissions

4. **Whitelist IP Address**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, add "0.0.0.0/0" (allows access from anywhere)
   - For production, add only your specific IP addresses

5. **Get Connection String**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., "myntra-fashion")

6. **Update Environment Variables**
   - Update the `MONGODB_URI` in your `.env` file with the connection string

### 4. Start the Backend Server

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:5000` and you should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📱 Environment: development
🔗 API Base URL: http://localhost:5000/api
```

## Frontend Setup

### 1. Install Dependencies

The frontend dependencies have been installed. If you need to reinstall:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# Development/Production Environment
EXPO_PUBLIC_ENV=development
```

### 3. Start the Frontend

```bash
npm start
```

## Authentication Features

### Implemented Features

1. **User Registration**
   - Full name, email, password, and optional location
   - Email validation and password strength requirements
   - Automatic login after successful registration

2. **User Login**
   - Email and password authentication
   - Secure token storage using Expo SecureStore
   - Automatic token refresh

3. **Password Reset**
   - Forgot password functionality
   - Email-based password reset (requires email configuration)

4. **User Profile**
   - Display user information from authentication context
   - Logout functionality with confirmation

5. **Security Features**
   - JWT tokens with refresh token mechanism
   - Password hashing with bcrypt
   - Secure token storage
   - Automatic token refresh on API calls

### Authentication Flow

1. **App Launch**
   - Check for stored authentication tokens
   - Verify token validity
   - Redirect to login if not authenticated
   - Redirect to main app if authenticated

2. **Registration/Login**
   - User enters credentials
   - API call to backend
   - Tokens stored securely
   - User redirected to main app

3. **Protected Routes**
   - All main app routes require authentication
   - AuthWrapper component handles route protection
   - Automatic redirect to login if not authenticated

4. **Logout**
   - Clear stored tokens
   - API call to invalidate refresh token
   - Redirect to login screen

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password with token

### Protected Endpoints

All other API endpoints require authentication via Bearer token in the Authorization header.

## Testing the Authentication

### 1. Test Registration

1. Start both backend and frontend
2. Navigate to the app
3. You should be redirected to the login screen
4. Click "Sign Up" to go to registration
5. Fill in the registration form
6. Submit the form
7. You should be redirected to the main app

### 2. Test Login

1. Logout from the app (Profile → Sign Out)
2. You should be redirected to the login screen
3. Enter your credentials
4. Submit the form
5. You should be redirected to the main app

### 3. Test Protected Routes

1. Try accessing any main app route without authentication
2. You should be automatically redirected to the login screen

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB Atlas connection string
   - Ensure your IP is whitelisted
   - Verify database user credentials

2. **JWT Token Errors**
   - Ensure JWT_SECRET is set in environment variables
   - Check token expiration settings

3. **CORS Issues**
   - Ensure frontend URL is added to CORS configuration
   - Check if backend is running on correct port

4. **Frontend Not Connecting to Backend**
   - Verify EXPO_PUBLIC_API_URL is set correctly
   - Check if backend server is running
   - Ensure both are on the same network

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your backend `.env` file.

## Production Deployment

### Backend Deployment

1. **Environment Variables**
   - Use strong, unique JWT secrets
   - Set `NODE_ENV=production`
   - Use production MongoDB Atlas cluster
   - Configure proper CORS origins

2. **Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Use environment-specific secrets
   - Enable helmet security headers

### Frontend Deployment

1. **Environment Variables**
   - Set production API URL
   - Configure proper CORS origins

2. **Build**
   - Use Expo build process
   - Test on physical devices
   - Configure app store settings

## Next Steps

1. **Email Verification**
   - Implement email verification for new accounts
   - Add email templates

2. **Social Login**
   - Add Google/Facebook login options
   - Implement OAuth flows

3. **Two-Factor Authentication**
   - Add SMS/Email 2FA
   - Implement TOTP support

4. **Advanced Security**
   - Implement account lockout
   - Add suspicious activity detection
   - Implement session management

The authentication system is now fully integrated and ready for use!

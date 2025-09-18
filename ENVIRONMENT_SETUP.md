# Environment Setup Guide

## Quick Fix for Network Issues

If you're experiencing network connection errors when trying to authenticate, follow these steps:

### 1. Find Your Machine's IP Address

Run this command in your terminal to find your machine's IP address:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
```

### 2. Update API Configuration

The API configuration has been automatically updated to use your machine's IP address (`172.20.10.2`). If your IP address is different, update the `config/api.ts` file:

```typescript
// In config/api.ts, change this line:
return 'http://172.20.10.2:5000/api';

// To your actual IP address:
return 'http://YOUR_IP_ADDRESS:5000/api';
```

### 3. Restart Both Servers

1. **Stop the backend server** (Ctrl+C in the backend terminal)
2. **Restart the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Restart the frontend** (Ctrl+C in the frontend terminal, then):
   ```bash
   npm start
   ```

### 4. Alternative: Use Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5000/api
```

Replace `YOUR_IP_ADDRESS` with your actual IP address.

## Troubleshooting

### Common Issues:

1. **"Network Error"**: The frontend can't reach the backend
   - Solution: Use your machine's IP address instead of localhost

2. **"CORS Error"**: Cross-origin request blocked
   - Solution: The backend CORS has been updated to allow your IP address

3. **"Connection Refused"**: Backend server not running
   - Solution: Make sure the backend server is running on port 5000

### Testing the Connection:

Test if your backend is accessible:

```bash
curl http://YOUR_IP_ADDRESS:5000/api/health
```

You should see a JSON response with "Myntra Fashion Backend API is running".

## Current Configuration

- **Backend URL**: `http://172.20.10.2:5000/api`
- **Backend Server**: Running on port 5000
- **CORS**: Configured to allow connections from your IP address
- **Authentication**: Fully functional with JWT tokens

The authentication system should now work correctly on both simulators and physical devices!

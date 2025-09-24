# Network Configuration Guide

## Backend Server
The backend server should be running on port 5000. To start it:
```bash
cd backend
npm start
```

## Frontend Network Configuration

The frontend needs to connect to the backend server. The API URL is configured in `services/api.ts`.

### For Physical Devices
If you're testing on a physical device, you need to use your computer's IP address instead of localhost.

1. Find your computer's IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update the API_BASE_URL in `services/api.ts` with your computer's IP address:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
   ```

### For Emulators
- Android Emulator: Use `http://10.0.2.2:5000/api`
- iOS Simulator: Use `http://localhost:5000/api`

### For Web Development
- Use `http://localhost:5000/api`

## Testing the Connection

You can test if the backend is accessible by opening this URL in your browser:
```
http://YOUR_IP_ADDRESS:5000/api/health
```

You should see a JSON response with the server status.

## Common Issues

1. **Network request failed**: Usually means the frontend can't reach the backend
   - Check if the backend is running
   - Verify the IP address is correct
   - Make sure both devices are on the same network

2. **AsyncStorage errors**: The import has been fixed to use direct import instead of dynamic import

3. **Layout warnings**: The Stack structure has been updated to avoid conditional rendering issues

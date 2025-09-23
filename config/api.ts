// Get the appropriate API URL based on environment
const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For development, try multiple endpoints in order of preference
  const endpoints = [
    'http://192.168.2.1:5000/api',  // Current network IP
    'http://10.10.31.251:5000/api', // Alternative network IP
    'http://localhost:5000/api',    // Localhost fallback
  ];
  
  // Return the first endpoint (we'll implement connection testing in the app)
  return endpoints[0];
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000, // Increased timeout for better reliability
  SOCKET_TIMEOUT: 15000, // Socket.io connection timeout
  RETRY_ATTEMPTS: 3, // Number of retry attempts for failed requests
};

export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  USER_DATA_STORAGE_KEY: 'user_data',
};

// Connection test utility
export const testConnection = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/health`, {
      method: 'HEAD',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.log(`❌ Connection test failed for ${url}:`, error);
    return false;
  }
};

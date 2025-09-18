// Get the appropriate API URL based on environment
const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For development, try to use the machine's IP address
  // This allows the app to work on physical devices and simulators
  return 'http://172.20.10.2:5000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 10000,
};

export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  USER_DATA_STORAGE_KEY: 'user_data',
};

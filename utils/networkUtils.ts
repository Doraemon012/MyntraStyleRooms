// Network utilities for detecting the correct API endpoint
import Constants from 'expo-constants';

export const getApiBaseUrl = () => {
  // Use environment variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('🌐 Using API URL from environment:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Use app.json configuration
  if (Constants.expoConfig?.extra?.apiUrl) {
    console.log('🌐 Using API URL from app.json:', Constants.expoConfig.extra.apiUrl);
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Fallback to network IP
  const networkUrl = 'http://10.10.53.19:5000/api';
  console.log('🌐 Using fallback API URL:', networkUrl);
  return networkUrl;
};

// Function to test API connectivity
export const testApiConnectivity = async (): Promise<string | null> => {
  const possibleUrls = [
    'http://10.10.53.19:5000/api',
    'http://10.84.92.165:5000/api',
    'http://10.42.0.1:5000/api',
    'http://10.84.92.218:5000/api',
    'http://192.168.56.1:5000/api',
    'http://172.27.35.178:5000/api',
    'http://172.20.10.2:5000/api',
    'http://192.168.1.100:5000/api',
    'http://10.0.2.2:5000/api',
    'http://localhost:5000/api',
  ];

  for (const url of possibleUrls) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 5000);
      });

      const fetchPromise = fetch(`${url}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // If we get any response (even an error), the server is reachable
      if (response.status === 401 || response.status === 200) {
        console.log(`✅ API server found at: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ Failed to connect to: ${url}`);
      continue;
    }
  }
  
  console.log('❌ No API server found on any of the tested URLs');
  return null;
};

// Get the best API URL with automatic detection
export const getBestApiUrl = async (): Promise<string> => {
  const detectedUrl = await testApiConnectivity();
  return detectedUrl || getApiBaseUrl();
};


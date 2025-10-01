// Custom fetch wrapper for React Native with better error handling
import { Platform } from 'react-native';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export const customFetch = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const { timeout = 10000, ...fetchOptions } = options;
  
  // Add React Native specific headers
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  const headers = {
    ...defaultHeaders,
    ...fetchOptions.headers,
  };

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
  });

  // Create fetch promise with React Native specific options
  const fetchPromise = fetch(url, {
    ...fetchOptions,
    headers,
    // Add any React Native specific options here
  });

  try {
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    return response;
  } catch (error: any) {
    // Enhanced error logging for React Native
    console.error('🌐 Custom fetch error:', {
      url,
      platform: Platform.OS,
      error: error.message,
      stack: error.stack,
    });
    
    // Re-throw with more context
    throw new Error(`Network request failed: ${error.message}`);
  }
};

// Test connectivity with multiple URLs
export const testConnectivity = async (urls: string[]): Promise<string | null> => {
  for (const url of urls) {
    try {
      console.log(`🧪 Testing connectivity to: ${url}`);
      const response = await customFetch(`${url}/auth/me`, {
        method: 'GET',
        timeout: 5000,
      });
      
      // Any response (even 401) means the server is reachable
      if (response.status === 401 || response.status === 200) {
        console.log(`✅ Server reachable at: ${url}`);
        return url;
      }
    } catch (error: any) {
      console.log(`❌ Failed to connect to: ${url} - ${error.message}`);
      continue;
    }
  }
  
  console.log('❌ No reachable servers found');
  return null;
};

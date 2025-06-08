/**
 * Utility functions for handling network requests
 */

// Function to fetch with timeout
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeout = 10000
): Promise<Response> => {
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Add the signal to options
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Function to retry failed requests
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeout = 10000,
  retryDelay = 1000
): Promise<Response> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Increasing timeout for subsequent retries
      const adjustedTimeout = timeout * (attempt + 1);
      return await fetchWithTimeout(url, options, adjustedTimeout);
    } catch (error) {
      console.error(`Request attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Wait before retrying
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
};

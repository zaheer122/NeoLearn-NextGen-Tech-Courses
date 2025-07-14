import axios from 'axios';
import { toast } from 'sonner';

// Cache configuration
const CACHE_DURATION = import.meta.env.VITE_CACHE_DURATION || 3600; // 1 hour default
const requestCache = new Map();

// Rate limiting configuration
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in milliseconds
const requestTimestamps = [];

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check for rate limiting
    const now = Date.now();
    const windowStart = now - RATE_WINDOW;
    
    // Remove old timestamps
    while (requestTimestamps.length && requestTimestamps[0] < windowStart) {
      requestTimestamps.shift();
    }
    
    // Check if rate limit exceeded
    if (requestTimestamps.length >= RATE_LIMIT) {
      return Promise.reject(new Error('Rate limit exceeded. Please try again later.'));
    }
    
    // Add current timestamp
    requestTimestamps.push(now);

    // Check for cache hit
    const cacheKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
    const cachedResponse = requestCache.get(cacheKey);
    
    if (cachedResponse && cachedResponse.timestamp > Date.now() - CACHE_DURATION * 1000) {
      return Promise.reject({
        __CACHE_HIT__: true,
        data: cachedResponse.data,
      });
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Cache successful GET requests
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.method}-${response.config.url}-${JSON.stringify(response.config.params || {})}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  },
  (error) => {
    // Handle cache hits
    if (error.__CACHE_HIT__) {
      return Promise.resolve({ data: error.data });
    }

    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          toast.error('Please log in to continue');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          toast.error('The requested resource was not found');
          break;
        case 429:
          toast.error('Too many requests. Please try again later');
          break;
        case 500:
          toast.error('Server error. Our team has been notified');
          break;
        default:
          toast.error(data?.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// Cache cleanup function
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 1000) {
      requestCache.delete(key);
    }
  }
};

// Run cache cleanup every hour
setInterval(cleanupCache, 3600000);

export default api; 
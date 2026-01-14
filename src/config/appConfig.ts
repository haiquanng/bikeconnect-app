// API Base URL - Update this with your backend URL
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.bikeconnect.com/api/v1';

// Socket.IO URL
export const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.bikeconnect.com';

// Cloudinary Config (to be updated)
export const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
export const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset';

// Firebase Config (to be updated)
export const FIREBASE_CONFIG = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

// Google Sign-In Config (to be updated)
export const GOOGLE_WEB_CLIENT_ID = 'your-google-web-client-id';

// App Config
export const APP_CONFIG = {
  depositTimeout: 48 * 60 * 60 * 1000, // 48 hours in milliseconds
  maxActiveDeposits: 3,
  debounceDelay: 1000, // 1 second for search
  throttleDelay: 2000, // 2 seconds for auto-save
};

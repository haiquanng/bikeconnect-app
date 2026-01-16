import Config from 'react-native-config';

if (!Config.API_BASE_URL) {
  throw new Error('API_BASE_URL is not defined in .env file');
}
export const API_BASE_URL = Config.API_BASE_URL;

// Socket.IO URL
export const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.bikeconnect.com';

// Cloudinary Config - add later
export const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
export const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset';

// Firebase Config - add later
export const FIREBASE_CONFIG = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

// Google Sign-In Config - add later
export const GOOGLE_WEB_CLIENT_ID = 'your-google-web-client-id';

// App Config
export const APP_CONFIG = {
  depositTimeout: 48 * 60 * 60 * 1000, // 48 hours in milliseconds
  maxActiveDeposits: 3,
  debounceDelay: 1000, // 1 second for search
  throttleDelay: 2000, // 2 seconds for auto-save
};

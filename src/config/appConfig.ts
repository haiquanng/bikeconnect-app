import Config from 'react-native-config';

if (!Config.API_BASE_URL) {
  throw new Error('API_BASE_URL is not defined in .env file');
}
export const API_BASE_URL = Config.API_BASE_URL;

// Socket.IO URL — same server as API, strip the /api path
export const SOCKET_URL = (Config.SOCKET_URL || Config.API_BASE_URL || '')
  .replace(/\/api\/?$/, '');

// Cloudinary Config
export const CLOUDINARY_CLOUD_NAME = Config.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET = Config.CLOUDINARY_UPLOAD_PRESET || '';

// Firebase Config
export const FIREBASE_CONFIG = {
  apiKey: Config.FIREBASE_API_KEY || '',
  authDomain: Config.FIREBASE_AUTH_DOMAIN || '',
  projectId: Config.FIREBASE_PROJECT_ID || '',
  storageBucket: Config.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: Config.FIREBASE_APP_ID || '',
};

// Firebase REST API URL for email/password auth
export const FIREBASE_AUTH_URL =
  'https://identitytoolkit.googleapis.com/v1/accounts';
export const FIREBASE_REFRESH_TOKEN_URL =
  'https://securetoken.googleapis.com/v1/token';

// Google Sign-In Config - add later
export const GOOGLE_WEB_CLIENT_ID = 'your-google-web-client-id';

// App Config
export const APP_CONFIG = {
  depositTimeout: 48 * 60 * 60 * 1000, // 48 hours in milliseconds
  maxActiveDeposits: 3,
  debounceDelay: 1000, // 1 second for search
  throttleDelay: 2000, // 2 seconds for auto-save
};

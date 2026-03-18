/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Handle background/quit state notifications
messaging().setBackgroundMessageHandler(async _remoteMessage => {
  // Background message received — notification will appear in system tray
  // Navigation happens when user taps (handled by onNotificationOpenedApp / getInitialNotification)
});

AppRegistry.registerComponent(appName, () => App);

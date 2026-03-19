import { useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { deviceTokenService } from '../api/deviceTokenService';
import { handleNotificationTap } from '../navigation/navigationRef';


async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

async function registerToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    await deviceTokenService.register(token);
    return token;
  } catch (err) {
    console.error('[FCM] Register token error:', err);
    return null;
  }
}

export function usePushNotifications() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Unregister token on logout
      if (tokenRef.current) {
        deviceTokenService.unregister(tokenRef.current).catch(() => {});
        tokenRef.current = null;
      }
      return;
    }

    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const setup = async () => {
      const granted = await requestPermission();
      if (!granted) return;

      const token = await registerToken();
      if (token) tokenRef.current = token;

      unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'BikeConnect',
          importance: AndroidImportance.HIGH,
        });
        await notifee.displayNotification({
          title: remoteMessage.notification?.title ?? 'Thông báo mới',
          body: remoteMessage.notification?.body ?? '',
          data: remoteMessage.data,
          android: {
            channelId,
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher',
            largeIcon: 'ic_launcher',
          },
        });
      });

      unsubscribeTokenRefresh = messaging().onTokenRefresh(async newToken => {
        tokenRef.current = newToken;
        await deviceTokenService.register(newToken).catch(() => {});
      });

      messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage.data) {
          handleNotificationTap(remoteMessage.data as Record<string, string>);
        }
      });

      const initialMessage = await messaging().getInitialNotification();
      if (initialMessage?.data) {
        handleNotificationTap(initialMessage.data as Record<string, string>);
      }
    };

    setup();

    return () => {
      unsubscribeForeground?.();
      unsubscribeTokenRefresh?.();
    };
  }, [isAuthenticated]);
}

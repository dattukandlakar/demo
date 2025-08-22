import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/auth-store';

const API_BASE = 'https://social-backend-y1rg.onrender.com';

/**
 * Registers the device for push notifications and sends the token to the backend.
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device.');
    return;
  }
  
  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token: permission not granted.');
    return;
  }

  // Get the Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found in app config. Make sure you are using EAS Build.');
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);
  } catch (e) {
    console.error('Error getting Expo push token:', e);
    return;
  }

  // Send the token to your backend server
  if (token) {
    await sendTokenToBackend(token);
  }
  
  // Set notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

/**
 * Helper function to send the token to the server.
 */
async function sendTokenToBackend(deviceToken: string) {
    const { token: authToken } = useAuthStore.getState();
    if (!authToken) {
        console.error('[Push Service] Cannot send token, user is not authenticated.');
        return;
    }

    try {
        const requestUrl = `${API_BASE}/user/register-device-token`;
        const requestBody = JSON.stringify({ token: deviceToken });

        // --- Add this log ---
        console.log(`[Push Service] Sending token to backend: ${requestUrl}`);

        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: requestBody,
        });
        
        // --- Add this response log ---
        console.log(`[Push Service] Backend response status: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Backend returned an error');
        }

    } catch (error) {
        // --- Add this error log ---
        console.error('[Push Service] Error sending push token to backend:', error);
    }
}

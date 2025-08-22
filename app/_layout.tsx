// app/_layout.tsx

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/store/auth-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Colors from '@/constants/colors';

import { ErrorBoundary } from "./error-boundary";
import { QueryProvider } from '@/providers/QueryProvider';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
          <StatusBar 
            style="light" 
            backgroundColor={Colors.dark.background}
            translucent={false}
          />
          <Toast />
        </SafeAreaProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

function useNotificationObserver() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    // This function is called when a user taps on a notification
    function handleNotificationClick(response: Notifications.NotificationResponse) {
      const notification = response.notification;
      // The 'data' payload is where our custom backend data lives
      const data = notification.request.content.data as {
        postId?: string;
        senderId?: string;
        notificationType?: 'follow' | 'like' | 'comment' | 'repost' | 'reply';
      };
      
      console.log('Notification tapped, navigation data:', data);

      // Navigate based on the data payload
      if (data.notificationType === 'follow' && data.senderId) {
        router.push(`/profile/${data.senderId}`);
      } else if (data.postId) {
        router.push(`/post/${data.postId}`);
      }
    }

    // Listener for when a user taps on a notification while the app is running
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleNotificationClick);
    
    // Check if the app was launched from a notification (when the app was closed)
    // Only handle if the response is recent (within last 30 seconds) to avoid old notifications
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (isMounted && response) {
        const notificationTime = response.notification.date;
        const now = Date.now();
        const timeDiff = now - notificationTime;
        
        // Only handle notification if it's recent (within 30 seconds)
        if (timeDiff < 30000) {
          handleNotificationClick(response);
        }
      }
    });

    // Cleanup function to remove listeners
    return () => {
      isMounted = false;
      responseSubscription.remove();
    };
  }, []);
}

function RootLayoutNav() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useNotificationObserver();

  useEffect(() => {
    // Check if the user is authenticated
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      // If they're not authenticated and not on an auth page, redirect them to the login page
      router.replace('/login');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="post/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="profile/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="profile/followers" options={{ presentation: 'card' }} />
      <Stack.Screen name="profile/following" options={{ presentation: 'card' }} />
      <Stack.Screen name="news/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="showcase/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="event/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="job/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="search/index" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="messages/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="messages/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="event/create" options={{ presentation: 'card' }} />
      <Stack.Screen name="event/ticket/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="showcase/create" options={{ presentation: 'card' }} />
    </Stack>
  );
}
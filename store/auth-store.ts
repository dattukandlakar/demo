// store/auth-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { getUser } from '@/api/user';
import { mapUserFromApi } from '@/utils/mapUserFromApi';
import { registerForPushNotificationsAsync } from '@/services/push-notification.service';
import { socketService } from '@/services/socketService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        console.log('--- Initiating Login ---');

        try {
          if (!email || !password) {
            throw new Error('Email and password are required');
          }

          const cleanEmail = String(email).trim();
          const cleanPassword = String(password).trim();
          
          if (cleanEmail.length === 0 || cleanPassword.length === 0) {
            throw new Error('Email or password cannot be empty');
          }
          
          const requestBody = { email: cleanEmail, password: cleanPassword };
          console.log('1. [Request] Sending login credentials:', requestBody.email);

          const response = await fetch('https://social-backend-y1rg.onrender.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          console.log('2. [Response] Received status:', response.status);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login API call failed');
          }
          
          console.log('3. [Auth] Login successful. Token received:', data.token ? 'Yes' : 'No');

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('4. [Socket] Connecting with token...');
          socketService.connect(data.token);
          
          try {
            console.log('5. [Push Notifications] Attempting to register device...');
            await registerForPushNotificationsAsync(data.token);
            console.log('...Push notification registration complete.');
          } catch(e: any) {
            console.error('...Push notification registration failed:', e.message);
          }

          console.log('6. [User Data] Fetching full user profile...');
          await get().refreshUserData();

        } catch (error: any) {
          console.error('❌ LOGIN FAILED:', error.message);
          set({
            error: error.message,
            isLoading: false,
          });
        }
      },

      register: async (name, email, password) => {
          // You can add similar detailed logging here if needed
          console.log("Registration logic has not been instrumented with logs yet.");
      },

      logout: () => {
        console.log('--- Logging out ---');
        console.log('1. [Socket] Disconnecting socket.');
        socketService.disconnect();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        console.log('2. [State] Auth state cleared.');
      },

      updateUser: (userData) => {
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },

      refreshUserData: async () => {
        const state = get();
        if (!state.token) {
            console.log('...Skipping refresh: No token found.');
            return;
        }

        try {
          console.log('...[Refresh] Calling getUser API.');
          const userResponse = await getUser(state.token);
          
          let userData;
          if (userResponse.body) userData = userResponse.body;
          else if (userResponse.user) userData = userResponse.user;
          else userData = userResponse;
          
          if (!userData) {
            throw new Error('No user data structure found in API response');
          }

          console.log('...[Refresh] Mapping API data to user object.');
          const mappedUser = mapUserFromApi(userData);
          
          set({ user: mappedUser });
          console.log('✅ User data refreshed and state updated successfully.');

        } catch (error: any) {
          console.error('❌ REFRESH FAILED:', error.message);
          // Optional: handle token expiration by logging out
          if (error.message.includes("Unauthorized") || error.message.includes("invalid")) {
              get().logout();
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
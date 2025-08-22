// utils/clearAuthCache.ts
// Utility to clear cached auth data and force fresh API data

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAuthCache = async () => {
  try {
    console.log('🗑️ Clearing auth cache...');
    await AsyncStorage.removeItem('auth-storage');
    console.log('✅ Auth cache cleared successfully');
    
    // You can also clear other caches if needed
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 Remaining storage keys:', keys);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to clear auth cache:', error);
    return false;
  }
};

export const forceRefreshAuthData = async () => {
  try {
    console.log('🔄 Forcing auth data refresh...');
    
    // Clear the cached data
    await clearAuthCache();
    
    // The next app launch will fetch fresh data from API
    console.log('✅ Auth data will be refreshed on next app launch');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to force refresh auth data:', error);
    return false;
  }
};

const API_BASE = 'https://social-backend-y1rg.onrender.com';
import { create } from 'zustand';

interface FollowState {
  following: string[];
  followers: string[];
  isLoading: boolean;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  toggleFollow: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  initializeFollowing: () => Promise<void>;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  following: [],
  followers: [],
  isLoading: false,

  isFollowing: (userId) => get().following.includes(userId),

  followUser: async (userId) => {
    const { token } = require('./auth-store').useAuthStore.getState();
    //console.log('Following user:', userId, 'with token:', token ? 'present' : 'missing');

    try {
      set({ isLoading: true });

      // Use the correct endpoint format: /user/follow with userToFollowId in body
      const response = await fetch(`${API_BASE}/user/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          token, // Keep both for compatibility
        },
        body: JSON.stringify({ userToFollowId: userId }),
      });

      //console.log('Follow response status:', response.status);
      const data = await response.json();
      //console.log('Follow response data:', data);
      
      if (!response.ok) throw new Error(data.message || 'Failed to follow user');

      // Add user to following list (optimistic update)
      const currentFollowing = get().following;
      if (!currentFollowing.includes(userId)) {
        const updatedFollowing = [...currentFollowing, userId];
        //console.log('Updated following list:', updatedFollowing);
        set({ following: updatedFollowing });
      }
    } catch (error) {
      console.error('Follow API Error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  unfollowUser: async (userId) => {
    const { token } = require('./auth-store').useAuthStore.getState();
    //console.log('Unfollowing user:', userId, 'with token:', token ? 'present' : 'missing');

    try {
      set({ isLoading: true });

      // Use the correct endpoint format: /user/unfollow with userToUnFollowId in body
      const response = await fetch(`${API_BASE}/user/unfollow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          token, // Keep both for compatibility
        },
        body: JSON.stringify({ userToUnFollowId: userId }),
      });

      //console.log('Unfollow response status:', response.status);
      const data = await response.json();
      //console.log('Unfollow response data:', data);
      
      if (!response.ok) throw new Error(data.message || 'Failed to unfollow user');

      // Remove user from following list (optimistic update)
      const currentFollowing = get().following;
      const updatedFollowing = currentFollowing.filter(id => id !== userId);
      //console.log('Updated following list after unfollow:', updatedFollowing);
      set({ following: updatedFollowing });
    } catch (error) {
      console.error('Unfollow API Error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFollow: async (userId) => {
    if (get().isFollowing(userId)) {
      await get().unfollowUser(userId);
    } else {
      await get().followUser(userId);
    }
  },

  initializeFollowing: async () => {
    const { token, user } = require('./auth-store').useAuthStore.getState();
    
    if (!token || !user) return;
    
    try {
      // Get current user's data to initialize following list
      const response = await fetch(`${API_BASE}/user/getUser`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          token,
        },
      });

      const data = await response.json();
      //console.log('Initialize following - API response:', data);
      
      if (response.ok) {
        let userData = data.body || data.user || data;
        //console.log('Following data from API:', userData.following);
        
        if (userData.following && Array.isArray(userData.following)) {
          // Extract user IDs from following array
          const followingIds = userData.following.map((user: any) => 
            String(user.id || user._id || user)
          );
          //console.log('Setting following list:', followingIds);
          set({ following: followingIds });
        }

        if (userData.followers && Array.isArray(userData.followers)) {
          // Extract user IDs from followers array
          const followerIds = userData.followers.map((user: any) => 
            String(user.id || user._id || user)
          );
          //console.log('Setting followers list:', followerIds);
          set({ followers: followerIds });
        }
      }
    } catch (error) {
      console.error('Error initializing following list:', error);
    }
  },
}));

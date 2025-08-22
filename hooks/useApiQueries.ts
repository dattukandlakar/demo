import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, followingUserStory } from '@/api/user';
import { fetchEvents } from '@/api/event';
import { useAuthStore } from '@/store/auth-store';

// Query Keys for consistent caching
export const QUERY_KEYS = {
  user: (token?: string) => ['user', token],
  posts: (tab: string) => ['posts', tab],
  stories: ['stories'],
  followingStories: (token?: string) => ['followingStories', token],
  events: (filters?: any) => ['events', filters],
  userBookedEvents: (token?: string) => ['userBookedEvents', token],
  news: (category?: string) => ['news', category],
} as const;

/**
 * Hook to get current user data with caching
 */
export function useUserData() {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: QUERY_KEYS.user(token),
    queryFn: () => getUser(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    select: (data) => {
      // Handle both response formats
      if (data && data.success && data.body) {
        return data.body;
      } else if (data && data._id) {
        return data;
      } else {
        throw new Error('Invalid user response format');
      }
    }
  });
}

/**
 * Hook to get following stories with caching
 */
export function useFollowingStories() {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: QUERY_KEYS.followingStories(token),
    queryFn: () => followingUserStory(token),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes for fresh content
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    select: (data) => {
      const rawStories = data || [];
      return rawStories.map((story: any) => ({
        id: story._id,
        url: story.url,
        type: story.type,
        viewed: false,
        totalStories: 1,
        createdAt: story.createdAt,
        user: {
          id: story.userId._id,
          name: story.userId.name,
          avatar: story.userId.profileImage || '',
          streak: story.userId.streak || 0,
        },
      }));
    }
  });
}

/**
 * Hook to get events with caching and filtering
 */
export function useEvents(filters?: any) {
  return useQuery({
    queryKey: QUERY_KEYS.events(filters),
    queryFn: () => fetchEvents(filters ? new URLSearchParams(filters).toString() : ''),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    retry: 2,
  });
}

/**
 * Hook for batched initial data loading
 * This replaces the sequential API calls in HomeScreen
 */
export function useInitialHomeData() {
  const { token } = useAuthStore();
  
  // Get user data
  const userQuery = useUserData();
  
  // Get following stories (only if user data is available)
  const storiesQuery = useFollowingStories();
  
  // Return combined loading state and data
  return {
    isLoading: userQuery.isLoading || storiesQuery.isLoading,
    isError: userQuery.isError || storiesQuery.isError,
    error: userQuery.error || storiesQuery.error,
    userData: userQuery.data,
    storiesData: storiesQuery.data,
    // Refetch all data
    refetchAll: async () => {
      await Promise.allSettled([
        userQuery.refetch(),
        storiesQuery.refetch(),
      ]);
    }
  };
}

/**
 * Hook to invalidate related cache when data changes
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateUser: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
    invalidateStories: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
    invalidatePosts: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    invalidateEvents: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}

/**
 * Prefetch data for better perceived performance
 */
export function usePrefetchQueries() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  
  return {
    prefetchUser: () => {
      if (token) {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.user(token),
          queryFn: () => getUser(token),
          staleTime: 5 * 60 * 1000,
        });
      }
    },
    prefetchStories: () => {
      if (token) {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.followingStories(token),
          queryFn: () => followingUserStory(token),
          staleTime: 2 * 60 * 1000,
        });
      }
    },
    prefetchEvents: () => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.events(),
        queryFn: () => fetchEvents(),
        staleTime: 3 * 60 * 1000,
      });
    }
  };
}

/**
 * Background refresh for keeping data fresh
 */
export function useBackgroundRefresh() {
  const queryClient = useQueryClient();
  
  return {
    refreshInBackground: () => {
      // Silently refetch stale data in background
      queryClient.refetchQueries({ 
        stale: true, 
        type: 'active' 
      });
    }
  };
}

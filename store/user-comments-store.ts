import { create } from 'zustand';
import { Comment } from '../types';
import { getUserComments } from '../api/user';

interface UserCommentsState {
  userComments: (Comment & {
    post?: {
      _id: string;
      content: string;
      author: {
        _id: string;
        name: string;
        profilePicture?: string;
      };
      createdAt: string;
    };
  })[];
  isLoading: boolean;
  error: string | null;
  fetchUserComments: (userId: string) => Promise<void>;
  refreshUserComments: (userId: string) => Promise<void>;
  clearUserComments: () => void;
}

export const useUserCommentsStore = create<UserCommentsState>((set, get) => ({
  userComments: [],
  isLoading: false,
  error: null,

  fetchUserComments: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { token } = require('./auth-store').useAuthStore.getState();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('🔍 Fetching user comments for userId:', userId);
      const data = await getUserComments(token, userId);
      console.log('📦 Raw API response:', JSON.stringify(data, null, 2));
      
      // Handle different possible response structures
      let commentsArray = [];
      
      if (Array.isArray(data)) {
        commentsArray = data;
      } else if (data && Array.isArray(data.comments)) {
        commentsArray = data.comments;
      } else if (data && Array.isArray(data.body)) {
        commentsArray = data.body;
      } else if (data && data.success && Array.isArray(data.body)) {
        commentsArray = data.body;
      } else {
        console.log('⚠️ Unexpected response structure, treating as empty array');
        commentsArray = [];
      }
      
      console.log('📝 Comments array to process:', commentsArray.length, 'items');
      
      // Map the response to ensure it has the correct structure
      const mappedComments = commentsArray.map((comment: any, index: number) => {
        console.log(`🔍 Processing comment ${index}:`, JSON.stringify(comment, null, 2));
        
        // Safely extract comment data
        const mappedComment = {
          _id: comment._id || comment.id || `temp-id-${index}`,
          id: comment._id || comment.id || `temp-id-${index}`,
          content: comment.content || comment.text || '',
          author: comment.author || comment.user || null,
          createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
          likes: comment.likes || [],
          replies: comment.replies || [],
          post: null // Initialize as null, then safely populate
        };
        
        // Safely extract post data if it exists
        if (comment.post) {
          try {
            mappedComment.post = {
              _id: comment.post._id || comment.post.id || 'unknown',
              content: comment.post.content || comment.post.text || '',
              author: {
                _id: comment.post.author?._id || comment.post.author?.id || comment.post.user?._id || comment.post.user?.id || 'unknown',
                name: comment.post.author?.name || comment.post.author?.username || comment.post.user?.name || comment.post.user?.username || 'Unknown User',
                profilePicture: comment.post.author?.profilePicture || comment.post.author?.avatar || comment.post.user?.profilePicture || comment.post.user?.avatar || undefined
              },
              createdAt: comment.post.createdAt || comment.post.created_at || new Date().toISOString()
            };
          } catch (postError) {
            console.warn(`⚠️ Error processing post data for comment ${index}:`, postError);
            mappedComment.post = undefined;
          }
        } else if (comment.postId || comment.post_id) {
          // If we only have a post ID but no post object, create a minimal post reference
          mappedComment.post = {
            _id: comment.postId || comment.post_id,
            content: 'Post content not available',
            author: {
              _id: 'unknown',
              name: 'Unknown User',
              profilePicture: undefined
            },
            createdAt: new Date().toISOString()
          };
        }
        
        console.log(`✅ Mapped comment ${index}:`, JSON.stringify(mappedComment, null, 2));
        return mappedComment;
      });

      console.log('🎉 Final mapped comments:', mappedComments.length, 'items');
      console.log('📤 Setting userComments state with:', mappedComments.map(c => ({ id: c.id, content: c.content?.substring(0, 50) })));
      set({ 
        userComments: mappedComments, 
        isLoading: false 
      });
      console.log('✅ UserComments state updated successfully');
      const currentState = get();
      console.log('📊 Current store state after update:', {
        commentsCount: currentState.userComments.length,
        isLoading: currentState.isLoading,
        hasError: !!currentState.error
      });
    } catch (error) {
      console.error('❌ Error fetching user comments:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user comments', 
        isLoading: false,
        userComments: [] // Clear comments on error
      });
    }
  },

  refreshUserComments: async (userId: string) => {
    // Refresh without showing loading state
    try {
      const { token } = require('./auth-store').useAuthStore.getState();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('🔄 Refreshing user comments for userId:', userId);
      const data = await getUserComments(token, userId);
      
      // Handle different possible response structures (same as fetchUserComments)
      let commentsArray = [];
      
      if (Array.isArray(data)) {
        commentsArray = data;
      } else if (data && Array.isArray(data.comments)) {
        commentsArray = data.comments;
      } else if (data && Array.isArray(data.body)) {
        commentsArray = data.body;
      } else if (data && data.success && Array.isArray(data.body)) {
        commentsArray = data.body;
      } else {
        console.log('⚠️ Unexpected response structure during refresh, treating as empty array');
        commentsArray = [];
      }
      
      // Map with the same robust error handling
      const mappedComments = commentsArray.map((comment: any, index: number) => {
        const mappedComment = {
          _id: comment._id || comment.id || `temp-id-${index}`,
          id: comment._id || comment.id || `temp-id-${index}`,
          content: comment.content || comment.text || '',
          author: comment.author || comment.user || null,
          createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
          likes: comment.likes || [],
          replies: comment.replies || [],
          post: null
        };
        
        // Safely extract post data
        if (comment.post) {
          try {
            mappedComment.post = {
              _id: comment.post._id || comment.post.id || 'unknown',
              content: comment.post.content || comment.post.text || '',
              author: {
                _id: comment.post.author?._id || comment.post.author?.id || comment.post.user?._id || comment.post.user?.id || 'unknown',
                name: comment.post.author?.name || comment.post.author?.username || comment.post.user?.name || comment.post.user?.username || 'Unknown User',
                profilePicture: comment.post.author?.profilePicture || comment.post.author?.avatar || comment.post.user?.profilePicture || comment.post.user?.avatar || undefined
              },
              createdAt: comment.post.createdAt || comment.post.created_at || new Date().toISOString()
            };
          } catch (postError) {
            console.warn(`⚠️ Error processing post data during refresh for comment ${index}:`, postError);
            mappedComment.post = undefined;
          }
        } else if (comment.postId || comment.post_id) {
          mappedComment.post = {
            _id: comment.postId || comment.post_id,
            content: 'Post content not available',
            author: {
              _id: 'unknown',
              name: 'Unknown User',
              profilePicture: undefined
            },
            createdAt: new Date().toISOString()
          };
        }
        
        return mappedComment;
      });

      set({ 
        userComments: mappedComments, 
        error: null 
      });
    } catch (error) {
      console.error('❌ Error refreshing user comments:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refresh user comments'
      });
    }
  },

  clearUserComments: () => {
    set({ 
      userComments: [], 
      error: null, 
      isLoading: false 
    });
  }
}));

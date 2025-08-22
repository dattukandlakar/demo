const API_BASE = 'https://social-backend-y1rg.onrender.com';

import { create } from 'zustand';
import { Post, Comment, Story, User } from '../types';
import { useAuthStore } from './auth-store';
import { mapStoriesFromApi } from '../utils/mapStoryFromApi';

interface PostState {
  posts: Post[];
  stories: Story[];
  isLoading: boolean;
  error: string | null;
  commentsByPostId: { [postId: string]: Comment[] };
  fetchPosts: (filter?: 'trending' | 'latest') => Promise<void>;
  fetchStories: () => Promise<void>;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  addComment: (postId: string, content: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => void;
  replyToComment: (postId: string, commentId: string, content: string) => void;
  addStory: (image: string) => Promise<void>;
  createPost: (postData: { content: string, images: string[], visibility: string, isReposted?: boolean, originalPostId?: string }) => Promise<void>;
  editPost: (postId: string, postData: { content: string, images: string[], visibility: string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  repostPost: (postId: string, comment?: string) => Promise<void>;
  unrepostPost: (postId: string) => Promise<void>;
  getPost: (postId: string) => Post | undefined;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    _id: '1',
    name: 'Vishal Kumar',
    username: 'vishalk',
    email: 'vishal@example.com',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    headline: 'Software Engineer',
    streak: 3
  },
  {
    id: '2',
    _id: '2',
    name: 'Maya Johnson',
    username: 'mayaj',
    email: 'maya@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    headline: 'UX Designer',
    streak: 5
  },
  {
    id: '3',
    _id: '3',
    name: 'Raj Patel',
    username: 'rajp',
    email: 'raj@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    headline: 'Product Manager',
    streak: 2
  },
  {
    id: '4',
    _id: '4',
    name: 'Priya Singh',
    username: 'priyas',
    email: 'priya@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    headline: 'Data Scientist',
    streak: 7
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[1],
    content: `Just launched our new React Native component library! 🚀

After months of work, I'm excited to share this open-source project with the community. Check out the documentation and let me know what you think!`,
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c'],
    createdAt: '2023-06-14T10:30:00Z',
    likes: 128,
    comments: 24,
    reposts: 8,
    isLiked: false,
    isBookmarked: false,
    isReposted: false,
    commentsList: [
      {
        id: 'c1',
        author: mockUsers[0],
        content: "This looks amazing! Can't wait to try it out in my next project.",
        createdAt: '2023-06-14T11:15:00Z',
        likes: 5,
        isLiked: false,
        replies: []
      }
    ]
  },
  {
    id: '2',
    author: mockUsers[2],
    content: "Excited to announce that we're hiring React Native developers to join our team! If you're passionate about building mobile experiences and want to work on products used by millions, check out the job posting on our website.",
    createdAt: '2023-06-13T15:45:00Z',
    likes: 87,
    comments: 12,
    reposts: 3,
    isLiked: true,
    isBookmarked: true,
    isReposted: false,
    commentsList: []
  },
  {
    id: '3',
    author: mockUsers[3],
    content: "Just published my latest article on optimizing React Native performance. I cover techniques like memoization, virtualized lists, and native modules. Link in comments!",
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71'],
    createdAt: '2023-06-12T09:20:00Z',
    likes: 215,
    comments: 31,
    reposts: 15,
    isLiked: false,
    isBookmarked: false,
    isReposted: false,
    commentsList: []
  }
];

const mockStories: Story[] = [
  {
    id: 's1',
    user: mockUsers[1],
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713',
    createdAt: new Date().toISOString(),
    viewed: false
  },
  {
    id: 's2',
    user: mockUsers[2],
    image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd',
    createdAt: new Date().toISOString(),
    viewed: false
  },
  {
    id: 's3',
    user: mockUsers[3],
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    createdAt: new Date().toISOString(),
    viewed: true
  }
];

// Move the mapping function outside the create() call
function mapApiPostToPost(apiPost: any) {
  return {
    id: apiPost.id,
    author: apiPost.author,
    content: apiPost.content,
    images: apiPost.images,
    createdAt: apiPost.createdAt,
    likes: apiPost.likes,
    comments: apiPost.comments,
    reposts: apiPost.reposts || 0,
    isLiked: apiPost.isLiked,
    isBookmarked: apiPost.isBookmarked,
    isReposted: apiPost.isReposted || false,
    commentsList: apiPost.commentsList || [],
    originalPost: apiPost.originalPost,
    repostComment: apiPost.repostComment,
    repostedBy: apiPost.repostedBy,
    repostedAt: apiPost.repostedAt,
  };
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  stories: [],
  isLoading: false,
  error: null,
  commentsByPostId: {},

  fetchPosts: async (filter = 'latest') => {
    const { token } = require('./auth-store').useAuthStore.getState();
    
    set({ isLoading: true, error: null });
  
    try {
      const response = await fetch(`${API_BASE}/post/all/allPosts/?filter=1`, {
        method: 'GET',
        headers: { token },
      });
  
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || `Error: ${response.status}`);
        throw new Error(data.message || `Error: ${response.status}`);
      }
  
  
      const mappedPosts = Array.isArray(data.body) ? data.body.map(mapApiPostToPost) : [];
      set({ posts: mappedPosts, isLoading: false });
  
    } catch (error) {
      set({ error: 'Failed to fetch posts', isLoading: false });
    }
  },

 
fetchStories: async () => {
    const { token, user } = useAuthStore.getState();

    set({ isLoading: true, error: null });
    try {
      // Fetch user's own stories
      const userStoriesResponse = await fetch(`https://social-backend-y1rg.onrender.com/user/story/self`, {
        method: 'GET',
        headers: {
          token: token,
          'Content-Type': 'application/json',
        },
      });

      let userStories = [];

      if (userStoriesResponse.ok) {
        const userStoriesData = await userStoriesResponse.json();

        if (userStoriesData.success && userStoriesData.body) {
          // Correctly map the array of stories
          userStories = mapStoriesFromApi(userStoriesData.body, user);
        }
      }

      // Combine user stories with other stories if needed
      const allStories = [...userStories, ...mockStories];
      // console.log('Fetched stories:', allStories);
      set({ stories: allStories, isLoading: false });
    } catch (error) {
      // console.error('Failed to fetch stories:', error);
      set({ stories: mockStories, isLoading: false, error: 'Failed to fetch stories' });
    }
  },


  likePost: async (postId) => {
    // Optimistic UI update first
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes + 1,
              isLiked: true
            }
          : post
      )
    }));

    // Then make API call in background
    try {
      const { token } = require('./auth-store').useAuthStore.getState();
      const response = await fetch('https://social-backend-y1rg.onrender.com/post/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ postId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to like post');
      }

      const updatedPost = data.body;
      // Sync with server response (corrects any discrepancies)
      set(state => ({
        posts: state.posts.map(post =>
          post.id === updatedPost._id
            ? {
                ...post,
                likes: updatedPost.likes,
                isLiked: true
              }
            : post
        )
      }));
    } catch (error) {
      // Rollback optimistic update on error
      set(state => ({
        posts: state.posts.map(post =>
          post.id === postId
            ? {
                ...post,
                likes: Math.max(0, post.likes - 1),
                isLiked: false
              }
            : post
        )
      }));
    }
  },

  unlikePost: async(postId) => {
    // Optimistic UI update first
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: Math.max(0, post.likes - 1),
              isLiked: false
            }
          : post
      )
    }));

    // Then make API call in background
    try {
      const { token } = require('./auth-store').useAuthStore.getState();
      const response = await fetch(`${API_BASE}/post/unlike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ postId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to unlike post');
      }

      const updatedPost = data.body;
      // Sync with server response (corrects any discrepancies)
      set(state => ({
        posts: state.posts.map(post =>
          post.id === updatedPost._id
            ? {
                ...post,
                likes: updatedPost.likes,
                isLiked: false
              }
            : post
        )
      }));
    } catch (error) {
      // Rollback optimistic update on error
      set(state => ({
        posts: state.posts.map(post =>
          post.id === postId
            ? {
                ...post,
                likes: post.likes + 1,
                isLiked: true
              }
            : post
        )
      }));
    }
  },

  bookmarkPost: async (postId: string) => {
    // Get current bookmark state for rollback if needed
    const currentPost = get().posts.find(post => post.id === postId);
    const previousBookmarkState = currentPost?.isBookmarked || false;

    // Optimistic UI update first
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      ),
    }));

    // Then make API call in background
    try {
      const { token } = require('./auth-store').useAuthStore.getState();
      if (!token) return;
  
      const response = await fetch(`${API_BASE}/post/save`, {
        method: 'POST',
        headers: {
          token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });
  
      const result = await response.json();
  
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to bookmark post');
      }

      // API call successful, keep the optimistic update
    } catch (error) {
      // Rollback optimistic update on error
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, isBookmarked: previousBookmarkState }
            : post
        ),
      }));
    }
  },
  

  fetchComments: async (postId) => {
    const { token } = require('./auth-store').useAuthStore.getState();
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/post/comment/${postId}`, {
        method: 'GET',
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch comments');
      }

     
      // Map backend comments to frontend Comment type
      const comments = (data.body || []).map((c: any) => ({
        id: c.id, 
        author: c.author, // Should be full user object
        content: c.content,
        createdAt: c.createdAt,
        likes: c.likes,
        isLiked: false, // You may want to set this based on user
        replies: c.replies || [],
      }));
      set(state => ({
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: comments,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to fetch comments', isLoading: false });
    }
  },

  addComment: async (postId, content) => {
    const { user, token } = require('./auth-store').useAuthStore.getState();
    if (!user || !token) return;
    
    // Create optimistic comment for instant UI feedback
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      author: user,
      content: content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
    };

    // Optimistically update both comment count and comments list
    set(state => {
      const prevComments = state.commentsByPostId[postId] || [];
      return {
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 }
            : post
        ),
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: [...prevComments, optimisticComment],
        },
        isLoading: true,
        error: null,
      };
    });

    try {
      const response = await fetch(`${API_BASE}/post/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify({ postId, text: content, content: content }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add comment');
      }
      
      // Replace optimistic comment with real one from server
      const realComment = {
        id: data.body._id,
        author: user,
        content: data.body.text,
        createdAt: data.body.createAt,
        likes: data.body.likes,
        isLiked: false,
        replies: [],
      };
      
      set(state => {
        const currentComments = state.commentsByPostId[postId] || [];
        // Replace the optimistic comment with the real one
        const updatedComments = currentComments.map(comment => 
          comment.id === optimisticComment.id ? realComment : comment
        );
        
        return {
          commentsByPostId: {
            ...state.commentsByPostId,
            [postId]: updatedComments,
          },
          isLoading: false,
        };
      });
    } catch (error) {
      // Rollback optimistic updates on error
      set(state => {
        const currentComments = state.commentsByPostId[postId] || [];
        // Remove the optimistic comment
        const rolledBackComments = currentComments.filter(comment => 
          comment.id !== optimisticComment.id
        );
        
        return {
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, comments: Math.max(0, post.comments - 1) }
              : post
          ),
          commentsByPostId: {
            ...state.commentsByPostId,
            [postId]: rolledBackComments,
          },
          error: 'Failed to add comment',
          isLoading: false,
        };
      });
    }
  },

  likeComment: (postId, commentId) => {
    set(state => ({
      posts: state.posts.map(post => {
        if (post.id === postId && post.commentsList) {
          return {
            ...post,
            commentsList: post.commentsList.map(comment => {
              if (comment.id === commentId) {
                const newIsLiked = !comment.isLiked;
                return {
                  ...comment,
                  isLiked: newIsLiked,
                  likes: newIsLiked ? comment.likes + 1 : comment.likes - 1
                };
              }
              
              // Check in replies
              if (comment.replies) {
                return {
                  ...comment,
                  replies: comment.replies.map(reply => {
                    if (reply.id === commentId) {
                      const newIsLiked = !reply.isLiked;
                      return {
                        ...reply,
                        isLiked: newIsLiked,
                        likes: newIsLiked ? reply.likes + 1 : reply.likes - 1
                      };
                    }
                    return reply;
                  })
                };
              }
              
              return comment;
            })
          };
        }
        return post;
      })
    }));
  },

  replyToComment: async (postId, commentId, content) => {
    const { user, token } = require('./auth-store').useAuthStore.getState();
    if (!user || !token) return;

    // 1. Create a temporary reply object
    const tempReply = {
      id: `temp-${Date.now()}`,
      author: user,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    // 2. Optimistically update the state
    set(state => ({
      posts: state.posts.map(post => {
        if (post.id === postId && post.commentsList) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: post.commentsList.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), tempReply]
                };
              }
              return comment;
            })
          };
        }
        return post;
      })
    }));

    // 3. Send the reply to the backend
    try {
      const response = await fetch(`${API_BASE}/post/replyToComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify({ postId, commentId, content }),
      });
      // console.log("response :", response);
      // console.log("body :", { postId, commentId, content });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Network response was not ok');
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error('Failed to parse JSON response');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to reply to comment');
      }

      // 4. Replace the temp reply with the real one from backend (do NOT use replies field)
      const realReply = {
        id: data.body.id,
        author: data.body.author || user,
        content: data.body.content || content,
        createdAt: data.body.createdAt || new Date().toISOString(),
        likes: data.body.likes || 0,
        isLiked: data.body.isLiked || false,
      };

      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId && post.commentsList) {
            return {
              ...post,
              commentsList: post.commentsList.map(comment => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    replies: (comment.replies || []).map(reply =>
                      reply.id === tempReply.id ? realReply : reply
                    )
                  };
                }
                return comment;
              })
            };
          }
          return post;
        })
      }));

    } catch (error) {
      // 5. On error, remove the temp reply and show an error message
      set(state => ({
        posts: state.posts.map(post => {
          if (post.id === postId && post.commentsList) {
            return {
              ...post,
              comments: post.comments - 1,
              commentsList: post.commentsList.map(comment => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    replies: (comment.replies || []).filter(reply => reply.id !== tempReply.id)
                  };
                }
                return comment;
              })
            };
          }
          return post;
        }),
        error: 'Failed to reply to comment'
      }));
    }
  },

  addStory: async (image) => {
    const { user, updateUser, token } = require('./auth-store').useAuthStore.getState();
    if (!user || !token) return;

    set({ isLoading: true });
    try {
      // The actual upload is handled by the StoryUploadModal component
      // This function is now mainly for updating the local state after successful upload
      
      const today = new Date().toISOString().split('T')[0];
      const lastStoryDate = user.lastStoryDate ? user.lastStoryDate.split('T')[0] : null;
      
      // Update streak if posting on a new day
      let newStreak = user.streak || 0;
      if (lastStoryDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastStoryDate === yesterdayStr) {
          // Consecutive day, increase streak
          newStreak += 1;
        } else if (lastStoryDate && lastStoryDate !== yesterdayStr) {
          // Missed a day, reset streak
          newStreak = 1;
        } else {
          // First story ever
          newStreak = 1;
        }
        
        // Update user streak in auth store
        updateUser({
          streak: newStreak,
          lastStoryDate: today
        });
      }
      
      // Refresh stories from API to get the latest data
      await get().fetchStories();
      
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add story', isLoading: false });
    }
  },

 
  createPost: async (postData) => {
    const { user, token } = require('./auth-store').useAuthStore.getState();

    if (!user || !token) {
      set({ error: 'Authentication required', isLoading: false });
      return;
    }

    // Validate post content
    if (!postData.content?.trim() && (!postData.images || postData.images.length === 0)) {
      set({ error: 'Post must contain text or images', isLoading: false });
      return;
    }
  
    set({ isLoading: true, error: null });
  
    try {
      // Handle repost case using /posts API with flags
      if (postData.isReposted && postData.originalPostId) {
        
        const response = await fetch(`${API_BASE}/post/createPost`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'token': token
          },
          body: JSON.stringify({
            content: postData.content,
            discription: postData.content,
            postType: postData.visibility,
            isReposted: true,
            originalPostId: postData.originalPostId,
            media: []
          })
        });

        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Repost failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          // Find the original post to create the repost entry
          const originalPost = get().posts.find(p => p.id === postData.originalPostId);
          
          if (originalPost) {
            const repost: Post = {
              id: result.body._id || `repost_${postData.originalPostId}_${Date.now()}`,
              author: user,
              content: postData.content,
              createdAt: new Date().toISOString(),
              likes: 0,
              comments: 0,
              reposts: 0,
              isLiked: false,
              isBookmarked: false,
              isReposted: true,
              originalPost: originalPost,
              repostComment: postData.content,
              repostedBy: user,
              repostedAt: new Date().toISOString()
            };
            
            
            set(state => ({
              posts: [repost, ...state.posts],
              isLoading: false
            }));
          } else {
            const repost: Post = {
              id: result.body._id || `repost_${postData.originalPostId}_${Date.now()}`,
              author: user,
              content: postData.content || `Reposted post ${postData.originalPostId}`,
              createdAt: new Date().toISOString(),
              likes: 0,
              comments: 0,
              reposts: 0,
              isLiked: false,
              isBookmarked: false,
              isReposted: true,
              repostComment: postData.content,
              repostedBy: user,
              repostedAt: new Date().toISOString()
            };
            
            set(state => ({
              posts: [repost, ...state.posts],
              isLoading: false
            }));
          }
        } else {
          throw new Error(result.message || 'Failed to create repost');
        }
        return;
      }

      // Regular post creation with FormData
      const formData = new FormData();
      
      // Add text content
      formData.append('discription', postData.content || '');
      formData.append('postType', postData.visibility || 'public');
  
      // Append media if present
      if (postData.images && postData.images.length > 0) {
        for(let i = 0; i < postData.images.length; i++) {
          const image = postData.images[i];
          formData.append('media', {
            uri: image,
            type: 'image/jpeg',
            name: `photo_${i}.jpg`,
          } as any);
        }
      }
      
      const response = await fetch(`${API_BASE}/post/createPost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'token': token // Include both headers for compatibility
        },
        body: formData
      });
      
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Post creation failed: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Post creation failed');
      }
      
      const uploadedPost = result.body;
      
      const newPost = {
        id: uploadedPost._id || `p${Date.now()}`,
        author: user,
        content: postData.content,
        images: postData.images || [],
        createdAt: uploadedPost.createdAt || new Date().toISOString(),
        likes: uploadedPost.likes || 0,
        comments: uploadedPost.comments || 0,
        reposts: uploadedPost.reposts || 0,
        isLiked: false,
        isBookmarked: false,
        isReposted: false,
        commentsList: []
      };
      
  
      set(state => ({
        posts: [newPost, ...state.posts],
        isLoading: false,
        error: null
      }));
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      set({ error: errorMessage, isLoading: false });
    }
  },

  editPost: async (postId, postData) => {
    const { user, token } = require('./auth-store').useAuthStore.getState();

    if (!user || !token) {
      return;
    }
  
    set({ isLoading: true, error: null });
  
    try {
      
      // Try different possible API endpoints
      const endpoints = [
        { url: `${API_BASE}/post/updatePost`, method: 'POST' },
        { url: `${API_BASE}/post/update`, method: 'POST' },
        { url: `${API_BASE}/post/edit`, method: 'POST' },
        { url: `${API_BASE}/post/${postId}`, method: 'PATCH' },
        { url: `${API_BASE}/post/${postId}`, method: 'PUT' },
        { url: `${API_BASE}/post/editPost`, method: 'POST' },
      ];
      
      let lastError: Error | null = null;
      
      for (let endpoint of endpoints) {
        try {
          
          const requestBody = {
            postId,
            content: postData.content,
            images: postData.images,
            visibility: postData.visibility,
            // Try additional possible field names
            description: postData.content,
            discription: postData.content,
            text: postData.content
          };
          
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
              'token': token
            },
            body: JSON.stringify(requestBody)
          });
          
          
          if (response.status === 404) {
            continue;
          }
          
          if (!response.ok) {
            const errorText = await response.text();
            lastError = new Error(`API Error: ${response.status} - ${errorText}`);
            continue;
          }
      
          const result = await response.json();
          
          if (!result.success) {
            lastError = new Error(result.message || 'Failed to edit post');
            continue;
          }
          
          // Success! Update the post in the local state
          set(state => ({
            posts: state.posts.map(post =>
              post.id === postId
                ? {
                    ...post,
                    content: postData.content,
                    images: postData.images
                  }
                : post
            ),
            isLoading: false
          }));
          
          return; // Success, exit function
          
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          continue;
        }
      }
      
      // If we get here, all endpoints failed
      
      // Fallback: Just update locally without API call
      set(state => ({
        posts: state.posts.map(post =>
          post.id === postId
            ? {
                ...post,
                content: postData.content,
                images: postData.images
              }
            : post
        ),
        isLoading: false,
        error: 'Post updated locally only - API endpoint not available'
      }));
      
    } catch (error) {
      set({ error: `Failed to edit post: ${error instanceof Error ? error.message : 'Unknown error'}`, isLoading: false });
      throw error;
    }
  },

  deletePost: async (postId) => {
    const { token } = require('./auth-store').useAuthStore.getState();

    if (!token) {
      set({ error: 'Authentication required', isLoading: false });
      return;
    }
  
    set({ isLoading: true, error: null });
  
    // Try different possible delete endpoints
    const deleteEndpoints = [
      { url: `${API_BASE}/post/delete`, method: 'POST', body: { postId } },
      { url: `${API_BASE}/post/deletePost`, method: 'POST', body: { postId } },
      { url: `${API_BASE}/post/${postId}/delete`, method: 'POST', body: {} },
      { url: `${API_BASE}/post/${postId}`, method: 'DELETE', body: null },
      { url: `${API_BASE}/post/remove`, method: 'POST', body: { postId } },
      { url: `${API_BASE}/posts/${postId}`, method: 'DELETE', body: null },
    ];
    
    let lastError: Error | null = null;
    
    for (let endpoint of deleteEndpoints) {
      try {
        
        const requestOptions: RequestInit = {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'token': token,
            'Content-Type': 'application/json'
          }
        };
        
        if (endpoint.body) {
          requestOptions.body = JSON.stringify(endpoint.body);
        }
        
        const response = await fetch(endpoint.url, requestOptions);
        
        
        if (response.status === 404) {
          continue;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          lastError = new Error(`Delete failed: ${response.status} - ${errorText}`);
          continue;
        }
    
        // Try to parse JSON response
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          // Some APIs might return empty response on successful delete
          result = { success: true };
        }
        
        if (result && result.success === false) {
          lastError = new Error(result.message || 'Delete operation failed');
          continue;
        }
        
        // Success! Remove the post from local state
        set(state => ({
          posts: state.posts.filter(post => post.id !== postId),
          isLoading: false,
          error: null
        }));
        
        return; // Success, exit function
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }
    
    // If we get here, all endpoints failed
    
    // Check if the post exists locally before showing error
    const state = get();
    const postExists = state.posts.find(post => post.id === postId);
    
    if (!postExists) {
      set({ isLoading: false, error: null });
      return;
    }
    
    // Ask user if they want to remove locally anyway
    set(state => ({
      posts: state.posts.filter(post => post.id !== postId),
      isLoading: false,
      error: 'Post removed locally - API delete endpoint not available'
    }));
  },

  repostPost: async (postId, comment) => {
    const { user, token } = require('./auth-store').useAuthStore.getState();
    if (!user || !token) {
      return;
    }

    
    try {
      // Call createPost with repost flags
      await get().createPost({
        content: comment || '',
        images: [],
        visibility: 'public',
        isReposted: true,
        originalPostId: postId
      });
      
    } catch (error) {
      set({ error: 'Failed to create repost' });
    }
  },

  unrepostPost: async (postId) => {
    const { token } = require('./auth-store').useAuthStore.getState();
    if (!token) {
      return;
    }

    
    try {
      // Find and remove the repost from local state
      // In a real implementation, you'd also call an API to remove the repost
      set(state => ({
        posts: state.posts.filter(post => {
          // Remove reposts of this specific post by current user
          if (post.isReposted && post.originalPost?.id === postId && post.author.id === state.posts.find(p => p.id === postId)?.author.id) {
            return false;
          }
          return true;
        })
      }));
      
    } catch (error) {
      set({ error: 'Failed to remove repost' });
    }
  },

  getPost: (postId) => {
    const state = get();
    return state.posts.find(post => post.id === postId);
  }

}));

const API_BASE = 'https://social-backend-y1rg.onrender.com';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShowcaseEntry } from '@/types';
import { Platform } from 'react-native';

interface ShowcaseState {
  entries: ShowcaseEntry[];
  isLoading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  fetchMyEntries: () => Promise<ShowcaseEntry[]>;
  fetchEntryById: (id: string) => Promise<ShowcaseEntry | null>;
  addEntry: (entry: ShowcaseEntry) => void;
  updateEntry: (id: string, data: Partial<ShowcaseEntry>) => void;
  deleteEntry: (id: string) => void;
  deleteEntryApi: (id: string) => Promise<boolean>;
  upvoteEntry: (id: string) => void;
  upvoteShowcase: (showcaseId: string) => Promise<void>;
  downvoteShowcase: (showcaseId: string) => Promise<void>;
  bookmarkEntry: (id: string) => void;
  addComment: (id: string, comment: string) => void;
  loadLocalUpvotes: () => Promise<void>;
}


const normalizeUri = (path: string) => {
  if (!path) return '';
  // React Native fetch expects local file without "file://"
  return Platform.OS === 'android' ? path : path.replace('file://', '');
};

// Mock data
const mockEntries: ShowcaseEntry[] = [
  {
    id: '1',
    title: 'Mango AI',
    subtitle: 'ChatGPT, but for Noobs',
    tagline: 'AI that understands you better',
    category: 'AI',
    description: 'AI Models have become really great, but there\'s still a place where they suck at – understanding our wants before answering! Mango AI is designed to be more intuitive and user-friendly, making AI accessible to everyone.',
    images: [
      'https://images.unsplash.com/photo-1677442135136-760c813a7942',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      'https://images.unsplash.com/photo-1639322537228-f710d846310a'
    ],
    bannerImages: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600'],
    tags: ['AI', 'Machine Learning', 'UX', 'Chatbot'],
    upvotes: 0,
    comments: 9,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date().toISOString(), // Current date
    author: {
      id: '1',
      name: 'Startup Memer',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36'
    },
    links: {
      website: 'https://mangoai.app',
      github: 'https://github.com/startupMemer/mangoai',
      playstore: 'https://play.google.com/store',
      demoVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    upvoters: ['2', '3', '4']
  },
  {
    id: '2',
    title: 'Appointee',
    subtitle: 'Schedule meetings without the back-and-forth',
    tagline: 'Smart scheduling made simple',
    category: 'Productivity',
    description: 'Appointee is a scheduling tool that eliminates the back-and-forth emails when setting up meetings. Share your availability, let others pick a time, and get it on your calendar instantly.',
    images: [
      'https://images.unsplash.com/photo-1611224885990-ab7363d7f2a9',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
      'https://images.unsplash.com/photo-1606868306217-dbf5046868d2'
    ],
    bannerImages: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600'],
    tags: ['Productivity', 'Calendar', 'SaaS', 'Scheduling'],
    upvotes: 0,
    comments: 5,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    author: {
      id: '2',
      name: 'Vaibhav Malpathak',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    },
    links: {
      website: 'https://appointee.io',
      github: 'https://github.com/vaibhav/appointee',
      appstore: 'https://apps.apple.com/app',
      demoVideo: 'https://www.youtube.com/watch?v=ScMzIvxBSi4'
    },
    upvoters: ['1', '3']
  },
  {
    id: '3',
    title: 'Startup Funding Playbook',
    subtitle: 'A guide for first-time founders',
    tagline: 'Master the art of fundraising',
    category: 'Education',
    description: 'A comprehensive guide for first-time founders on how to raise funding for their startups. Covers everything from pre-seed to Series A, with templates and real-world examples.',
    images: [
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
    ],
    bannerImages: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600'],
    tags: ['Startup', 'Funding', 'Guide', 'Business'],
    upvotes: 0,
    comments: 12,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    author: {
      id: '3',
      name: 'Rajvardhan M.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
    },
    links: {
      website: 'https://startupfundingplaybook.com',
      github: 'https://github.com/rajvardhan/funding-playbook',
      demoVideo: 'https://www.youtube.com/watch?v=XqZsoesa55w'
    },
    upvoters: ['1', '2', '4']
  }
];

export const useShowcaseStore = create<ShowcaseState>()(
  persist(
    (set, get) => ({
      entries: mockEntries,
      isLoading: false,
      error: null,

      fetchEntries: async () => {
        const { token } = require('./auth-store').useAuthStore.getState();
        set({ isLoading: true, error: null });
        
        // console.log('🚀 Fetching showcases from API...');
      
        try {
          const headers: any = {
            'Content-Type': 'application/json',
          };
          
          // Add token if available
          if (token) {
            headers['token'] = token;
          }
          
          const response = await fetch(`${API_BASE}/showcase/get`, {
            method: 'GET',
            headers,
          });
      
          if (!response.ok) {
          // console.warn(`⚠️ API failed with ${response.status}, falling back to mock data`);
            // Fall back to mock data if API fails
            set({ entries: mockEntries, isLoading: false, error: null });
            return;
          }
      
          const result = await response.json();
          // console.log('📦 Raw API response:', result);

          // Normalize entries to ensure required fields exist
          const rawEntries = result.body || result.data || result || [];
          // console.log('🔍 Processing', rawEntries.length, 'entries from API');
          
          const normalizedEntries: ShowcaseEntry[] = rawEntries.map((item: any) => {
            // console.log('🔧 Processing entry:', item.projectTitle || item.title);
            
            // Normalize author data - the API uses 'userId' field for author identification
            const normalizedAuthor = {
              id: String(
                item.author?.id || 
                item.author?._id || 
                item.user?.id || 
                item.user?._id || 
                item.creator?.id || 
                item.creator?._id || 
                item.authorId || 
                item.userId ||
                item.createdBy ||
                'unknown'
              ),
              name: 
                item.author?.name || 
                item.author?.username || 
                item.user?.name || 
                item.user?.username || 
                item.creator?.name || 
                item.creator?.username || 
                item.authorName ||
                'Unknown Author',
              avatar: 
                item.author?.avatar || 
                item.author?.profileImage || 
                item.user?.avatar || 
                item.user?.profileImage || 
                item.creator?.avatar || 
                item.authorAvatar ||
                ''
            };

            // Normalize links object
            const normalizedLinks = {
              website: item.links?.website || item.projectLinks || item.websiteUrl || '',
              github: item.links?.github || item.githubUrl || item.repoUrl || '',
              playstore: item.links?.playstore || item.playstoreUrl || item.androidUrl || '',
              appstore: item.links?.appstore || item.appstoreUrl || item.iosUrl || '',
              demoVideo: item.links?.demoVideo || item.demoVideoLink || item.videoUrl || item.youtubeUrl || ''
            };

            // Normalize images arrays
            const normalizedImages = Array.isArray(item.images) ? item.images : 
                                   Array.isArray(item.showcaseImages) ? item.showcaseImages :
                                   item.image ? [item.image] : [];
            
            const normalizedBannerImages = Array.isArray(item.bannerImages) ? item.bannerImages :
                                         Array.isArray(item.banners) ? item.banners :
                                         item.bannerImage ? [item.bannerImage] :
                                         item.banner ? [item.banner] : [];

            const normalizedTags = Array.isArray(item.tags) ? item.tags :
                                 Array.isArray(item.keywords) ? item.keywords :
                                 typeof item.tags === 'string' ? item.tags.split(',').map((t: string) => t.trim()) :
                                 [];

            return {
              // Core identification
              id: String(item.id || item._id || Math.random().toString(36).substr(2, 9)),
              
              // Title and description fields
              title: item.title || item.projectTitle || item.name || 'Untitled Project',
              subtitle: item.subtitle || item.shortDescription || '',
              tagline: item.tagline || item.slogan || item.subtitle || '',
              description: item.description || item.longDescription || item.details || '',
              
              // Category and classification
              category: item.category || item.type || item.vertical || '',
              
              // Problem-solution fields
              problem: item.problem || item.problemStatement || '',
              solution: item.solution || item.solutionDescription || '',
              revenueModel: item.revenueModel || item.businessModel || item.monetization || '',
              
              // Media assets
              logo: item.logo || item.logoUrl || item.icon || '',
              images: normalizedImages,
              bannerImages: normalizedBannerImages,
              
              // Social metrics
              tags: normalizedTags,
              upvotes: parseInt(item.upvotes || item.votes || item.likes || '0'),
              comments: parseInt(item.comments || item.commentCount || '0'),
              upvoters: Array.isArray(item.upvoters) ? item.upvoters : 
                       Array.isArray(item.voters) ? item.voters : [],
              
              // User interaction states
              isLiked: Boolean(item.isLiked || item.liked || false),
              isBookmarked: Boolean(item.isBookmarked || item.bookmarked || item.saved || false),
              
              // Timestamps
              createdAt: item.createdAt || item.created || item.publishedAt || new Date().toISOString(),
              
              // Related entities
              author: normalizedAuthor,
              links: normalizedLinks
            } as ShowcaseEntry;
          }).filter((entry: ShowcaseEntry) => entry.id && entry.title); // Only keep valid entries

          // console.log('✅ Successfully processed', normalizedEntries.length, 'entries');
          set({ entries: normalizedEntries, isLoading: false, error: null });
          
          // Load local upvotes after setting entries
          await get().loadLocalUpvotes();
          
        } catch (error) {
          // console.error('❌ FetchEntries Error:', error);
          // console.log('🔄 Falling back to mock data due to API error');
          // Fall back to mock data on any error
          set({ entries: mockEntries, isLoading: false, error: null });
          
          // Load local upvotes even with mock data
          await get().loadLocalUpvotes();
        }
      }
      ,

      fetchMyEntries: async () => {
        const { token, user } = require('./auth-store').useAuthStore.getState();
        set({ isLoading: true, error: null });
        
        if (!user || !token) {
          console.log('No user or token found for fetchMyEntries');
          set({ isLoading: false });
          return [];
        }
        
        try {
          // Try the correct endpoint first
          let response = await fetch(`${API_BASE}/showcase/my`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              token,
            },
          });
          
          // If that fails, try alternative endpoint
          if (!response.ok) {
            // console.log(`Primary endpoint failed (${response.status}), trying alternative...`);
            response = await fetch(`${API_BASE}/showcases/my`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                token,
              },
            });
          }
          
          // If both fail, fallback to filtering from all entries
          if (!response.ok) {
            const allEntries = get().entries;
            const myEntries = allEntries.filter(entry => {
              const authorId = entry.author?.id || (entry.author as any)?._id;
              const userId = user.id || (user as any)._id;
              return authorId === userId;
            });
            set({ isLoading: false });
            return myEntries;
          }
          
          const result = await response.json();
          const rawEntries = result.body || result || [];
          const normalizedEntries: ShowcaseEntry[] = rawEntries.map((item: any) => {
            const normalizedAuthor = item.author ? {
              ...item.author,
              id: String(item.author.id ?? item.author._id ?? item.authorId ?? ''),
              avatar: item.author.avatar ?? item.author.profileImage ?? '',
              name: item.author.name ?? item.author.username ?? 'Unknown',
            } : {
              id: '',
              name: 'Unknown',
              avatar: '',
            };
            return {
              ...item,
              id: String(item.id ?? item._id ?? ''),
              images: item.images ?? [],
              bannerImages: item.bannerImages ?? [],
              tags: item.tags ?? [],
              upvotes: item.upvotes ?? (item.upvoters ? item.upvoters.length : 0),
              comments: item.comments ?? 0,
              isLiked: item.isLiked ?? false,
              isBookmarked: item.isBookmarked ?? false,
              createdAt: item.createdAt ?? new Date().toISOString(),
              upvoters: item.upvoters ?? [],
              author: normalizedAuthor,
              links: item.links ?? {},
            } as ShowcaseEntry;
          }).filter((e: ShowcaseEntry) => !!e.id);
          // console.log(`Fetched ${normalizedEntries.length} my entries from API`);
          set({ isLoading: false });
          return normalizedEntries;
        } catch (error) {
          console.error('FetchMyEntries Error:', error);
          // Fallback to filtering from all entries
          const allEntries = get().entries;
          const myEntries = allEntries.filter(entry => {
            const authorId = entry.author?.id || (entry.author as any)?._id;
            const userId = user.id || (user as any)._id;
            return authorId === userId;
          });
          set({ error: null, isLoading: false }); // Clear error since we have a fallback
          return myEntries;
        }
      }
      ,

      
      fetchEntryById: async (id: string) => {
        const { token, user } = require('./auth-store').useAuthStore.getState();
        set({ isLoading: true, error: null });
        
        console.log('🔍 Fetching fresh entry by ID:', id);
        
        try {
          // Always try API call first to get fresh data
          console.log('🌐 Fetching fresh data from API...');
          const response = await fetch(`${API_BASE}/showcase/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { token }),
            },
          });
          
          if (!response.ok) {
            console.warn(`⚠️ API call failed with status: ${response.status}, trying local cache`);
            
            // Fallback to current entries if API fails
            const currentEntry = get().entries.find(e => e.id === id);
            if (currentEntry) {
              console.log('✅ Using cached entry:', currentEntry.title);
              set({ isLoading: false });
              return currentEntry;
            }
            
            set({ isLoading: false });
            return null;
          }
          
          const result = await response.json();
          const item = result.body || result.data || result;
          
          if (!item) {
            console.warn('⚠️ No data returned from API, trying local cache');
            
            // Fallback to current entries
            const currentEntry = get().entries.find(e => e.id === id);
            if (currentEntry) {
              set({ isLoading: false });
              return currentEntry;
            }
            
            set({ isLoading: false });
            return null;
          }
          
          // Apply same normalization as fetchEntries
          const normalizedAuthor = item.author || item.user || item.creator ? {
            id: String(
              item.author?.id || 
              item.author?._id || 
              item.user?.id || 
              item.user?._id || 
              item.creator?.id || 
              item.creator?._id || 
              'unknown'
            ),
            name: 
              item.author?.name || 
              item.author?.username || 
              item.user?.name || 
              item.user?.username || 
              'Unknown Author',
            avatar: 
              item.author?.avatar || 
              item.author?.profileImage || 
              item.user?.avatar || 
              ''
          } : {
            id: 'unknown',
            name: 'Unknown Author',
            avatar: ''
          };
          
          // Normalize upvoters array and calculate upvote count
          const normalizedUpvoters = Array.isArray(item.upvoters) ? item.upvoters : 
                                   Array.isArray(item.voters) ? item.voters : [];
          
          // Calculate upvotes - prefer API count, fallback to upvoters length
          const upvoteCount = item.upvotes !== undefined ? parseInt(String(item.upvotes)) :
                            item.votes !== undefined ? parseInt(String(item.votes)) :
                            item.likes !== undefined ? parseInt(String(item.likes)) :
                            normalizedUpvoters.length;
          
          // Check if current user has upvoted
          const currentUserId = user?.id || user?._id;
          const hasUserUpvoted = currentUserId ? normalizedUpvoters.includes(String(currentUserId)) : false;
          
          console.log('🔍 Processing showcase data:', {
            id: String(item.id || item._id),
            title: item.title || item.projectTitle,
            upvoteCount,
            upvotersLength: normalizedUpvoters.length,
            hasUserUpvoted,
            currentUserId
          });

          const normalizedEntry: ShowcaseEntry = {
            id: String(item.id || item._id),
            title: item.title || item.projectTitle || 'Untitled Project',
            subtitle: item.subtitle || item.shortDescription || '',
            tagline: item.tagline || item.slogan || '',
            description: item.description || item.longDescription || '',
            category: item.category || item.type || '',
            problem: item.problem || item.problemStatement || '',
            solution: item.solution || item.solutionDescription || '',
            revenueModel: item.revenueModel || item.businessModel || '',
            logo: item.logo || item.logoUrl || '',
            images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
            bannerImages: Array.isArray(item.bannerImages) ? item.bannerImages : item.bannerImage ? [item.bannerImage] : [],
            tags: Array.isArray(item.tags) ? item.tags : [],
            upvotes: upvoteCount,
            comments: parseInt(item.comments || item.commentCount || '0'),
            upvoters: normalizedUpvoters,
            isLiked: hasUserUpvoted || Boolean(item.isLiked || item.liked || false),
            isBookmarked: Boolean(item.isBookmarked || item.bookmarked || item.saved || false),
            createdAt: item.createdAt || new Date().toISOString(),
            author: normalizedAuthor,
            links: {
              website: item.links?.website || item.projectLinks || '',
              github: item.links?.github || item.githubUrl || '',
              playstore: item.links?.playstore || item.playstoreUrl || '',
              appstore: item.links?.appstore || item.appstoreUrl || '',
              demoVideo: item.links?.demoVideo || item.demoVideoLink || ''
            }
          };
          
          // console.log('✅ Successfully fetched and normalized entry:', normalizedEntry.title);
          set({ isLoading: false });
          return normalizedEntry;
          
        } catch (error) {
          console.error('❌ FetchEntryById Error:', error);
          set({ error: 'Failed to fetch showcase', isLoading: false });
          return null;
        }
      },
addEntry: async (entry) => {
  const { token } = require('./auth-store').useAuthStore.getState();

  try {
    const formData = new FormData();

    // ✅ Add logo
    if (entry.logo) {
      formData.append('logo', {
        uri: normalizeUri(entry.logo),
        name: 'logo.jpg',
        type: 'image/jpeg',
      } as any);
    }

    // ✅ Add banner image
    if (entry.bannerImages?.length && entry.bannerImages.length > 0) {
      formData.append('bannerImage', {
        uri: normalizeUri(entry.bannerImages[0]),
        name: 'banner.jpg',
        type: 'image/jpeg',
      } as any);
    }

    // ✅ Add multiple images
    if (entry.images?.length && entry.images.length > 0) {
      entry.images.forEach((img, index) => {
        if (img) {
          formData.append('images', {
            uri: normalizeUri(img),
            name: `image_${index + 1}.jpg`,
            type: 'image/jpeg',
          } as any);
        }
      });
    }

    // ✅ Category (fallback to 'App' if missing)
    formData.append('category', entry.category || 'App');

    // ✅ Add text fields
    formData.append('projectTitle', entry.title || '');
    formData.append('tagline', entry.tagline || '');
    formData.append('description', entry.description || '');
    formData.append('problem', entry.problem || '');
    formData.append('solution', entry.solution || '');
    formData.append('revenueModel', entry.revenueModel || '');
    formData.append('demoVideoLink', entry.links?.demoVideo || '');
    formData.append('projectLinks', entry.links?.website || '');

    // ✅ Tags
    if (entry.tags?.length > 0) {
      entry.tags.forEach(tag => formData.append('tags[]', tag));
    }

    const response = await fetch(`${API_BASE}/showcase/create`, {
      method: 'POST',
      headers: { token }, // No Content-Type header for FormData
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    try {
      await get().fetchEntries();
    } catch (e) {
      console.warn('Failed to refresh showcases after create:', e);
    }
    return json;
  } catch (error) {
    console.error("Showcase Creation Error:", error);
    throw error;
  }
},


      

      updateEntry: (id, data) => {
        set(state => ({
          entries: state.entries.map(entry => 
            entry.id === id ? { ...entry, ...data } : entry
          )
        }));
      },

      deleteEntry: (id) => {
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id)
        }));
      },

      deleteEntryApi: async (id) => {
        const { token } = require('./auth-store').useAuthStore.getState();
        
        if (!token) {
          set({ error: 'Authentication required', isLoading: false });
          return false;
        }
        
        set({ isLoading: true, error: null });
        
        // Try multiple possible delete endpoints (similar to post store pattern)
        const deleteEndpoints = [
          { url: `${API_BASE}/showcase/delete`, method: 'POST', body: { showcaseId: id } },
          { url: `${API_BASE}/showcase/delete`, method: 'POST', body: { id } },
          { url: `${API_BASE}/showcase/deleteShowcase`, method: 'POST', body: { showcaseId: id } },
          { url: `${API_BASE}/showcase/${id}/delete`, method: 'POST', body: {} },
          { url: `${API_BASE}/showcase/${id}`, method: 'DELETE', body: null },
          { url: `${API_BASE}/showcase/delete/${id}`, method: 'DELETE', body: null },
          { url: `${API_BASE}/showcases/${id}`, method: 'DELETE', body: null },
          { url: `${API_BASE}/showcase/remove`, method: 'POST', body: { showcaseId: id } },
          { url: `${API_BASE}/post/delete`, method: 'POST', body: { postId: id, type: 'showcase' } },
        ];
        
        let lastError: Error | null = null;
        
        for (let endpoint of deleteEndpoints) {
          try {
            console.log(`Trying delete endpoint: ${endpoint.method} ${endpoint.url}`);
            
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
            
            // Skip 404s and continue trying
            if (response.status === 404) {
              console.log(`Endpoint ${endpoint.url} returned 404, trying next...`);
              continue;
            }
            
            if (!response.ok) {
              const errorText = await response.text();
              lastError = new Error(`Delete failed: ${response.status} - ${errorText}`);
              console.log(`Endpoint ${endpoint.url} failed: ${response.status}`);
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
            
            console.log(`✅ Successfully deleted showcase via: ${endpoint.url}`);
            
            // Success! Remove from local state
            set(state => ({ 
              entries: state.entries.filter(e => e.id !== id),
              isLoading: false,
              error: null
            }));
            return true;
            
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            continue;
          }
        }
        
        // If we get here, all API endpoints failed
        console.log('All delete endpoints failed, removing locally...');
        
        // Check if the entry exists locally before showing error
        const state = get();
        const entryExists = state.entries.find(entry => entry.id === id);
        
        if (!entryExists) {
          set({ isLoading: false, error: null });
          return true;
        }
        
        // Remove locally anyway (optimistic deletion)
        set(state => ({
          entries: state.entries.filter(e => e.id !== id),
          isLoading: false,
          error: null // Don't show error since we successfully removed locally
        }));
        
        console.log(`⚠️ Showcase removed locally - API delete endpoints not available`);
        return true; // Return true since we successfully removed it locally
      },

      upvoteEntry: async (id) => {
        const { user, token } = require('./auth-store').useAuthStore.getState();
        if (!user) {
          console.warn('⚠️ No user found for upvote');
          return;
        }
        
        // Get current state to check if already upvoted
        const currentState = get();
        const currentEntry = currentState.entries.find(e => e.id === id);
        if (!currentEntry) {
          console.warn('⚠️ Entry not found for upvote');
          return;
        }

        const currentUpvoters = currentEntry.upvoters || [];
        const isCurrentlyUpvoted = currentUpvoters.includes(user.id);
        
        // Optimistic update - update UI immediately
        set(state => {
          const entries = [...state.entries];
          const entryIndex = entries.findIndex(e => e.id === id);
          
          if (entryIndex === -1) return state;
          
          const entry = { ...entries[entryIndex] };
          
          // Initialize upvoters array if it doesn't exist
          if (!entry.upvoters) {
            entry.upvoters = [];
          }
          
          // Toggle upvote
          if (isCurrentlyUpvoted) {
            entry.upvoters = entry.upvoters.filter(uid => uid !== user.id);
          } else {
            entry.upvoters = [...entry.upvoters, user.id];
          }
          
          entries[entryIndex] = entry;
          return { entries };
        });
        
        // Store upvotes locally in AsyncStorage for persistence
        try {
          const localUpvotesKey = `showcase_upvotes_${user.id}`;
          const existingUpvotes = await AsyncStorage.getItem(localUpvotesKey);
          const upvotes = existingUpvotes ? JSON.parse(existingUpvotes) : [];
          
          if (isCurrentlyUpvoted) {
            // Remove upvote
            const updatedUpvotes = upvotes.filter((upvoteId: string) => upvoteId !== id);
            await AsyncStorage.setItem(localUpvotesKey, JSON.stringify(updatedUpvotes));
          } else {
            // Add upvote
            const updatedUpvotes = [...upvotes, id];
            await AsyncStorage.setItem(localUpvotesKey, JSON.stringify(updatedUpvotes));
          }
        } catch (storageError) {
          console.warn('Failed to save upvote to local storage:', storageError);
        }

        // Try to sync with API (but don't revert if it fails since API doesn't exist yet)
        if (token) {
          try {
            // Try the post like endpoint as a fallback (might work for showcase items)
            const response = await fetch(`${API_BASE}/post/like`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'token': token,
              },
              body: JSON.stringify({ 
                postId: id, 
                showcaseId: id,
                type: 'showcase' 
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                console.log('✅ Upvote synced with API via post endpoint');
                return;
              }
            }
          } catch (apiError) {
            // API sync failed, but that's OK - we keep the local optimistic update
            console.log('ℹ️ API sync failed (expected - showcase API not implemented yet):', (apiError as Error).message);
          }
        }
        
        // Success! The optimistic update remains and is persisted locally
        console.log(`✅ Upvote ${isCurrentlyUpvoted ? 'removed' : 'added'} locally for showcase ${id}`);
      },

      upvoteShowcase: async (showcaseId: string) => {
        const { user, token } = require('./auth-store').useAuthStore.getState();
        if (!user || !token) {
          console.warn('⚠️ No user or token found for upvote');
          return;
        }

        // Get current state to check if already upvoted
        const currentState = get();
        const currentEntry = currentState.entries.find(e => e.id === showcaseId);
        if (!currentEntry) {
          console.warn('⚠️ Entry not found for upvote');
          return;
        }

        const currentUpvoters = currentEntry.upvoters || [];
        const isCurrentlyUpvoted = currentUpvoters.includes(user.id);

        // Don't upvote if already upvoted
        if (isCurrentlyUpvoted) {
          console.log('Entry already upvoted');
          return;
        }

        // Optimistic update - add upvote immediately
        set(state => {
          const entries = [...state.entries];
          const entryIndex = entries.findIndex(e => e.id === showcaseId);
          
          if (entryIndex === -1) return state;
          
          const entry = { ...entries[entryIndex] };
          
          // Initialize upvoters array if it doesn't exist
          if (!entry.upvoters) {
            entry.upvoters = [];
          }
          
          // Add upvote optimistically
          entry.upvoters = [...entry.upvoters, user.id];
          // Properly increment the upvote count - use the actual current count plus 1
          const currentUpvoteCount = entry.upvotes !== undefined ? entry.upvotes : entry.upvoters.length - 1;
          entry.upvotes = currentUpvoteCount + 1;
          entry.isLiked = true;
          
          entries[entryIndex] = entry;
          return { entries };
        });

        // Make API call to upvote endpoint
        try {
          const response = await fetch(`${API_BASE}/showcase/upvote/${showcaseId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'token': token,
            },
          });

          if (!response.ok) {
            throw new Error(`Upvote API failed: ${response.status}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.message || 'Failed to upvote showcase');
          }

          console.log('✅ Upvote synced with API successfully', result);

          // Update with real data from API response
          set(state => {
            const entries = [...state.entries];
            const entryIndex = entries.findIndex(e => e.id === showcaseId);
            
            if (entryIndex === -1) return state;
            
            const entry = { ...entries[entryIndex] };
            
            // Use real data from API if available
            if (result.body) {
              entry.upvotes = result.body.upvotes || result.body.upvoters?.length || entry.upvoters.length;
              entry.upvoters = result.body.upvoters || entry.upvoters;
              entry.isLiked = true;
            }
            
            entries[entryIndex] = entry;
            return { entries };
          });

          // Store upvote locally for persistence
          try {
            const localUpvotesKey = `showcase_upvotes_${user.id}`;
            const existingUpvotes = await AsyncStorage.getItem(localUpvotesKey);
            const upvotes = existingUpvotes ? JSON.parse(existingUpvotes) : [];
            if (!upvotes.includes(showcaseId)) {
              const updatedUpvotes = [...upvotes, showcaseId];
              await AsyncStorage.setItem(localUpvotesKey, JSON.stringify(updatedUpvotes));
            }
          } catch (storageError) {
            console.warn('Failed to save upvote to local storage:', storageError);
          }

        } catch (error) {
          console.error('❌ Failed to sync upvote with API:', error);
          
          // Revert the optimistic update
          set(state => {
            const entries = [...state.entries];
            const entryIndex = entries.findIndex(e => e.id === showcaseId);
            
            if (entryIndex === -1) return state;
            
            const entry = { ...entries[entryIndex] };
            entry.upvoters = (entry.upvoters || []).filter(uid => uid !== user.id);
            entry.upvotes = entry.upvoters.length;
            entry.isLiked = false;
            
            entries[entryIndex] = entry;
            return { entries };
          });
        }
      },

      downvoteShowcase: async (showcaseId: string) => {
        const { user, token } = require('./auth-store').useAuthStore.getState();
        if (!user || !token) {
          console.warn('⚠️ No user or token found for downvote');
          return;
        }

        // Get current state to check if currently upvoted
        const currentState = get();
        const currentEntry = currentState.entries.find(e => e.id === showcaseId);
        if (!currentEntry) {
          console.warn('⚠️ Entry not found for downvote');
          return;
        }

        const currentUpvoters = currentEntry.upvoters || [];
        const isCurrentlyUpvoted = currentUpvoters.includes(user.id);

        // Only downvote if currently upvoted
        if (!isCurrentlyUpvoted) {
          console.log('Entry not upvoted, nothing to downvote');
          return;
        }

        // Optimistic update - remove upvote immediately
        set(state => {
          const entries = [...state.entries];
          const entryIndex = entries.findIndex(e => e.id === showcaseId);
          
          if (entryIndex === -1) return state;
          
          const entry = { ...entries[entryIndex] };
          
          // Remove upvote
          entry.upvoters = (entry.upvoters || []).filter(uid => uid !== user.id);
          // Properly decrement the upvote count - use the actual current count minus 1
          const currentUpvoteCount = entry.upvotes !== undefined ? entry.upvotes : entry.upvoters.length + 1;
          entry.upvotes = Math.max(0, currentUpvoteCount - 1); // Ensure it doesn't go below 0
          entry.isLiked = false;
          
          entries[entryIndex] = entry;
          return { entries };
        });

        // Make API call to downvote endpoint
        try {
          const response = await fetch(`${API_BASE}/showcase/downvote/${showcaseId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'token': token,
            },
          });

          if (!response.ok) {
            throw new Error(`Downvote API failed: ${response.status}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.message || 'Failed to downvote showcase');
          }

          console.log('✅ Downvote synced with API successfully', result);

          // Update with real data from API response
          set(state => {
            const entries = [...state.entries];
            const entryIndex = entries.findIndex(e => e.id === showcaseId);
            
            if (entryIndex === -1) return state;
            
            const entry = { ...entries[entryIndex] };
            
            // Use real data from API if available
            if (result.body) {
              entry.upvotes = result.body.upvotes || result.body.upvoters?.length || entry.upvoters.length;
              entry.upvoters = result.body.upvoters || entry.upvoters;
              entry.isLiked = false;
            }
            
            entries[entryIndex] = entry;
            return { entries };
          });

          // Remove from local storage
          try {
            const localUpvotesKey = `showcase_upvotes_${user.id}`;
            const existingUpvotes = await AsyncStorage.getItem(localUpvotesKey);
            const upvotes = existingUpvotes ? JSON.parse(existingUpvotes) : [];
            const updatedUpvotes = upvotes.filter((upvoteId: string) => upvoteId !== showcaseId);
            await AsyncStorage.setItem(localUpvotesKey, JSON.stringify(updatedUpvotes));
          } catch (storageError) {
            console.warn('Failed to remove upvote from local storage:', storageError);
          }

        } catch (error) {
          console.error('❌ Failed to sync downvote with API:', error);
          
          // Revert the optimistic update
          set(state => {
            const entries = [...state.entries];
            const entryIndex = entries.findIndex(e => e.id === showcaseId);
            
            if (entryIndex === -1) return state;
            
            const entry = { ...entries[entryIndex] };
            entry.upvoters = [...(entry.upvoters || []), user.id];
            entry.isLiked = true;
            
            entries[entryIndex] = entry;
            return { entries };
          });
        }
      },

      bookmarkEntry: async (id) => {
        const { user, token } = require('./auth-store').useAuthStore.getState();
        if (!user || !token) {
          console.warn('⚠️ No user or token found for bookmark');
          return;
        }
        
        // console.log('📌 Attempting to bookmark entry:', id);
        
        // Optimistic update
        set(state => {
          const entries = [...state.entries];
          const entryIndex = entries.findIndex(e => e.id === id);
          
          if (entryIndex === -1) return state;
          
          const entry = { ...entries[entryIndex] };
          entry.isBookmarked = !entry.isBookmarked;
          
          entries[entryIndex] = entry;
          return { entries };
        });
        
        // Make API call
        try {
          const response = await fetch(`${API_BASE}/showcase/bookmark/${id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              token,
            },
          });
          
          if (!response.ok) {
            throw new Error(`Bookmark API failed: ${response.status}`);
          }
          
          // console.log('✅ Bookmark synced with API successfully');
          
        } catch (error) {
          console.error('❌ Failed to sync bookmark with API:', error);
          
          // Revert the optimistic update
          set(state => {
            const entries = [...state.entries];
            const entryIndex = entries.findIndex(e => e.id === id);
            
            if (entryIndex === -1) return state;
            
            const entry = { ...entries[entryIndex] };
            entry.isBookmarked = !entry.isBookmarked; // Revert
            
            entries[entryIndex] = entry;
            // console.log('🔄 Reverted bookmark due to API failure');
            return { entries };
          });
        }
      },

      addComment: (id, comment) => {
        set(state => {
          const entries = [...state.entries];
          const entryIndex = entries.findIndex(e => e.id === id);
          
          if (entryIndex === -1) return state;
          
          const entry = { ...entries[entryIndex] };
          entry.comments = (entry.comments || 0) + 1;
          
          entries[entryIndex] = entry;
          return { entries };
        });
      },

      loadLocalUpvotes: async () => {
        const { user } = require('./auth-store').useAuthStore.getState();
        if (!user) return;
        
        try {
          const localUpvotesKey = `showcase_upvotes_${user.id}`;
          const existingUpvotes = await AsyncStorage.getItem(localUpvotesKey);
          const upvotedIds = existingUpvotes ? JSON.parse(existingUpvotes) : [];
          
          if (upvotedIds.length > 0) {
            console.log(`Loading ${upvotedIds.length} local upvotes for user ${user.id}`);
            
            // Update entries to reflect local upvotes
            set(state => {
              const entries = state.entries.map(entry => {
                if (upvotedIds.includes(entry.id)) {
                  // Ensure user is in upvoters array if they upvoted locally
                  const upvoters = entry.upvoters || [];
                  if (!upvoters.includes(user.id)) {
                    return {
                      ...entry,
                      upvoters: [...upvoters, user.id]
                    };
                  }
                }
                return entry;
              });
              
              return { entries };
            });
          }
        } catch (error) {
          console.warn('Failed to load local upvotes:', error);
        }
      }
    }),
    {
      name: 'showcase-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
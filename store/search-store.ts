// store/search-store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Post, User } from '@/types';
import { useAuthStore } from './auth-store';

interface SearchState {
  searchQuery: string;
  users: User[];
  posts: Post[];
  loading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  searchEverything: (query: string) => Promise<void>;
  clearResults: () => void;
}

const BASE_URL = "https://social-backend-y1rg.onrender.com"

export const useSearchStore = create<SearchState>()(
  devtools((set) => ({
    searchQuery: '',
    users: [],
    posts: [],
    loading: false,
    error: null,

    setSearchQuery: (query) => set({ searchQuery: query }),

    clearResults: () =>
      set({
        users: [],
        posts: [],
        loading: false,
        error: null,
        searchQuery: '',
      }),

    searchEverything: async (query: string) => {
      set({ loading: true, error: null });
      try {
        const { token } = require('./auth-store').useAuthStore.getState();
        if (query.length <= 3) {
             set({
                users: [],
                posts:  [],
                loading: false,
            });
            return ;
        }
        const res = await fetch(`${BASE_URL}/search/all/${encodeURIComponent(query)}?type=all`, {
            headers : {
                token : `${token}`
            }
        });
        const data = await res.json();
        if (!data.success) {
            set({
                error : data.message
            })
            console.error(data.message)
        }
        
        set({
          users: data.users || [],
          posts: data.posts || [],
          loading: false,
        });
      } catch (err: any) {
        set({ loading: false, error: err.message || 'Something went wrong' });
      }
    },
  }))
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsArticle } from '@/types';
import { useAuthStore } from './auth-store';

// Mock data
const mockArticles: NewsArticle[] = [];

const categories = ['All', 'Technology', 'Business', 'Events', 'Education', 'Health'];

interface NewsState {
  articles: NewsArticle[];
  filteredArticles: NewsArticle[];
  categories: string[];
  activeCategories: string[];
  isLoading: boolean;
  error: string | null;
  savedArticles: NewsArticle[];
  fetchArticles: (category?: string, limit?: number, offset?: number ) => Promise<void>;
  filterByCategory: (category: string) => void;
  bookmarkArticle: (articleId: string) => void;
  getBookmarkedArticles: () => Promise<NewsArticle[] | undefined>
  likeArticle: (articleId: string) => void;
  setUpdatedArticle: (updatedArticle: NewsArticle, article: NewsArticle) => NewsArticle;
  setUpdatedArticleSave: (article: NewsArticle) => NewsArticle;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      articles: mockArticles,
      filteredArticles: mockArticles,
      savedArticles: mockArticles,
      categories: categories,
      activeCategories: [],
      isLoading: false,
      error: null,

      fetchArticles: async (category = "", limit = 10, offset = 0) => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;

          const res = await fetch(
            `https://social-backend-y1rg.onrender.com/news?category=${category.toLowerCase()}&limit=${limit}&offset=${offset}`,
            {
              headers: {
                'token': `${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const output = await res.json();

          if (!output.success) {
            set({ error: output.message, isLoading: false });
            return;
          }

          const newArticles = output.body.map((article: NewsArticle) => ({
            ...article,
            _id: article._id.toString?.() || article._id // normalize
          }));

          const existingArticles = get().articles;

          let combinedArticles = [];

          if (offset === 0) {
            // Full reset
            combinedArticles = newArticles;
          } else {
            // Append + remove duplicates
            const existingIds = new Set(existingArticles.map(a=> a._id));
            const filteredNewArticles = newArticles.filter(a => !existingIds.has(a._id));
            combinedArticles = [...existingArticles, ...filteredNewArticles];
          }

          set({
            articles: combinedArticles,
            filteredArticles: combinedArticles,
            isLoading: false
          });
        } catch (error) {
          set({ error: 'Failed to fetch articles', isLoading: false });
        }
      },


      filterByCategory: (category: string) => {
        const { articles, activeCategories } = get();
        let newActiveCategories = [...activeCategories];
        
        if (category === '') {
          // Reset filters
          set({ 
            activeCategories: [],
            filteredArticles: articles
          });
          return;
        }
        
        if (newActiveCategories.includes(category)) {
          newActiveCategories = newActiveCategories.filter(c => c !== category);
        } else {
          newActiveCategories.push(category);
        }
        
        let filteredArticles = [...articles];
        if (newActiveCategories.length > 0) {
          filteredArticles = articles.filter(article => 
            newActiveCategories.includes(article.category[0])
          );
        }
        
        set({ 
          activeCategories: newActiveCategories,
          filteredArticles
        });
      },

      bookmarkArticle: async(articleId: string) => {
        const token = useAuthStore.getState().token;
        const { setUpdatedArticleSave } = get(); 
        try {
          const res = await fetch(`https://social-backend-y1rg.onrender.com/news/save/${articleId}`, {
            method: 'POST',
            headers: {
              token: `${token}`
            }
          });
          const output = await res.json();
          if (!output.success) {
            set({ error: output.message, isLoading: false });
            return;
          }

          const { articles } = get();

          const updatedArticles = articles.map(article => {
            if( article._id === articleId ) {
              return setUpdatedArticleSave(article);
            }
            return article;
          });

          set({
            articles: updatedArticles,
            filteredArticles: updatedArticles,
            isLoading: false,
          });

        } catch (err) {
          set({ error: 'Failed to save article', isLoading: false });
        }
      },

      setUpdatedArticle: (updatedArticle: NewsArticle, article: NewsArticle) => {
        updatedArticle.isLiked = !article.isLiked;
        return updatedArticle;
      },

      setUpdatedArticleSave: (article: NewsArticle) => {
        article.isSaved = !article.isSaved;
        return article;
      },

      likeArticle: async (articleId: string) => {
        const token = useAuthStore.getState().token;
        const { setUpdatedArticle } = get(); 
        try {
          const res = await fetch(`https://social-backend-y1rg.onrender.com/news/like/${articleId}`, {
            method: 'POST',
            headers: {
              token: `${token}`
            }
          });
          const output = await res.json();
          if (!output.success) {
            set({ error: output.message, isLoading: false });
            return;
          }

          const updatedArticle: NewsArticle = output.body;
          const { articles } = get();

          const updatedArticles = articles.map(article => {
            if( article._id === articleId ) {
              return setUpdatedArticle(updatedArticle, article);
            }
            return article;
          }
          );

          set({
            articles: updatedArticles,
            filteredArticles: updatedArticles,
            isLoading: false,
          });

        } catch (err) {
          set({ error: 'Failed to like article', isLoading: false });
        }
      },

      getBookmarkedArticles: async() => {
        try {
          const token = useAuthStore.getState().token;
          const response = await fetch("https://social-backend-y1rg.onrender.com/news/saved",{
            headers: {
              token: `${token}`
            }
          })

          const output = await response.json();
          if(!output.success) {
            set({ error: output.message, isLoading: false });
            return;
          }

          let bookMarkedArticles : NewsArticle[] = [];
          bookMarkedArticles = output.body;

          set({
            savedArticles: bookMarkedArticles
          })

          return bookMarkedArticles;

        } catch(err) {
          set({ error: 'Failed to like article', isLoading: false });
        }
      }
    }),
    {
      name: 'news-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
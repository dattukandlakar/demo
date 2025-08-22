import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createPortfolio, updatePortfolio, deletePortfolio, getUserPortfolio, CreatePortfolioRequest } from '@/api/portfolio'

export interface PortfolioItem {
  id: string
  title: string
  description: string
  images: string[]
  links: { title: string; url: string }[]
  category: string
  platform: 'github' | 'figma' | 'dribbble' | 'behance' | 'website' | 'youtube' | 'linkedin' | 'other'
  tags: string[]
  createdAt: string
  updatedAt: string
  userId: string
}

interface PortfolioStore {
  items: PortfolioItem[]
  isLoading: boolean
  error: string | null
  
  // Legacy local actions
  addItem: (item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateItem: (id: string, updates: Partial<PortfolioItem>) => void
  deleteItem: (id: string) => void
  getItemsByUserId: (userId: string) => PortfolioItem[]
  
  // API-integrated actions
  createPortfolioItem: (token: string, portfolioData: CreatePortfolioRequest) => Promise<boolean>
  updatePortfolioItem: (token: string, id: string, portfolioData: CreatePortfolioRequest) => Promise<boolean>
  deletePortfolioItem: (token: string, id: string) => Promise<boolean>
  fetchUserPortfolio: (token: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Legacy local methods (for backward compatibility)
      addItem: (itemData) => {
        const newItem: PortfolioItem = {
          ...itemData,
          id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          items: [...state.items, newItem]
        }))
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === id 
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          )
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }))
      },

      getItemsByUserId: (userId) => {
        return get().items.filter(item => item.userId === userId)
      },

      // New API-integrated methods
      createPortfolioItem: async (token, portfolioData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('--- PORTFOLIO STORE DEBUG: Creating portfolio item via API');
          const response = await createPortfolio(token, portfolioData);
          
          if (response.success && response.portfolio) {
            // Add the created item to local state
            const newItem: PortfolioItem = {
              id: response.portfolio._id || response.portfolio.id || `portfolio_${Date.now()}`,
              title: response.portfolio.title || '',
              description: response.portfolio.description || portfolioData.description || '',
              images: response.portfolio.logo ? [response.portfolio.logo] : [],
              links: response.portfolio.link ? [{ title: 'Project Link', url: response.portfolio.link }] : [],
              category: 'Other',
              platform: 'other',
              tags: [],
              createdAt: response.portfolio.createdAt || new Date().toISOString(),
              updatedAt: response.portfolio.updatedAt || new Date().toISOString(),
              userId: response.portfolio.userId || response.portfolio.user || '',
            };
            
            set((state) => ({
              items: [...state.items, newItem],
              isLoading: false,
            }));
            
            console.log('--- PORTFOLIO STORE DEBUG: Portfolio item created successfully');
            return true;
          } else {
            throw new Error(response.message || 'Failed to create portfolio');
          }
        } catch (error: any) {
          console.error('--- PORTFOLIO STORE DEBUG: Create error:', error);
          set({ isLoading: false, error: error.message });
          return false;
        }
      },

      updatePortfolioItem: async (token, id, portfolioData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('--- PORTFOLIO STORE DEBUG: Updating portfolio item via API');
          const response = await updatePortfolio(token, id, portfolioData);
          
          if (response.success) {
            // Update the item in local state
            set((state) => ({
              items: state.items.map(item => 
                item.id === id 
                  ? { 
                      ...item, 
                      description: portfolioData.description,
                      images: portfolioData.logo ? [portfolioData.logo] : item.images,
                      links: portfolioData.link ? [{ title: 'Project Link', url: portfolioData.link }] : item.links,
                      updatedAt: new Date().toISOString() 
                    }
                  : item
              ),
              isLoading: false,
            }));
            
            console.log('--- PORTFOLIO STORE DEBUG: Portfolio item updated successfully');
            return true;
          } else {
            throw new Error(response.message || 'Failed to update portfolio');
          }
        } catch (error: any) {
          console.error('--- PORTFOLIO STORE DEBUG: Update error:', error);
          set({ isLoading: false, error: error.message });
          return false;
        }
      },

      deletePortfolioItem: async (token, id) => {
        set({ isLoading: true, error: null });
        try {
          console.log('--- PORTFOLIO STORE DEBUG: Deleting portfolio item via API');
          const response = await deletePortfolio(token, id);
          
          if (response.success) {
            // Remove the item from local state
            set((state) => ({
              items: state.items.filter(item => item.id !== id),
              isLoading: false,
            }));
            
            console.log('--- PORTFOLIO STORE DEBUG: Portfolio item deleted successfully');
            return true;
          } else {
            throw new Error(response.message || 'Failed to delete portfolio');
          }
        } catch (error: any) {
          console.error('--- PORTFOLIO STORE DEBUG: Delete error:', error);
          set({ isLoading: false, error: error.message });
          return false;
        }
      },

      fetchUserPortfolio: async (token) => {
        set({ isLoading: true, error: null });
        try {
          console.log('--- PORTFOLIO STORE DEBUG: Fetching user portfolio from API');
          const response = await getUserPortfolio(token);
          
          if (response.success && response.portfolio) {
            console.log('--- PORTFOLIO STORE DEBUG: Raw backend portfolio data:', JSON.stringify(response.portfolio, null, 2));
            
            // Convert API response to local format
            const portfolioItems = Array.isArray(response.portfolio) 
              ? response.portfolio 
              : [response.portfolio];
            
            console.log('--- PORTFOLIO STORE DEBUG: Processing', portfolioItems.length, 'portfolio items from backend');
            
            const formattedItems: PortfolioItem[] = portfolioItems.map((item: any, index) => {
              console.log(`--- PORTFOLIO STORE DEBUG: Item ${index + 1}:`, {
                originalId: item._id || item.id,
                originalDescription: item.description,
                originalLogo: item.logo,
                originalLink: item.link,
                originalCreatedAt: item.createdAt,
                originalUserId: item.userId || item.user
              });
              
              return {
                id: item._id || item.id,
                title: item.title || '',
                description: item.description || '',
                images: item.logo ? [item.logo] : (item.images || []),
                links: item.link ? [{ title: 'Project Link', url: item.link }] : (item.links || []),
                category: 'Other',
                platform: 'other',
                tags: [],
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: item.updatedAt || new Date().toISOString(),
                userId: item.userId || item.user || '',
              };
            });
            
            console.log('--- PORTFOLIO STORE DEBUG: Final formatted items:', formattedItems.length, 'items');
            formattedItems.forEach((item, index) => {
              console.log(`--- PORTFOLIO STORE DEBUG: Formatted Item ${index + 1}:`, {
                id: item.id,
                description: item.description,
                hasImages: item.images.length > 0,
                hasLinks: item.links.length > 0
              });
            });
            
            set({ 
              items: formattedItems,
              isLoading: false 
            });
            
            console.log('--- PORTFOLIO STORE DEBUG: Portfolio fetched and stored successfully');
          } else {
            throw new Error(response.message || 'Failed to fetch portfolio');
          }
        } catch (error: any) {
          console.error('--- PORTFOLIO STORE DEBUG: Fetch error:', error);
          set({ isLoading: false, error: error.message });
        }
      },
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

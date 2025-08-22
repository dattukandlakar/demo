// app/(tabs)/showcase.tsx

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
  Platform,
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  X, 
  Camera, 
  Link, 
  Tag, 
  Upload,
  ChevronDown,
  Trophy,
  ArrowUp,
  Search,
  Filter
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '@/components/layout/AppHeader';
import ShowcaseCard from '@/components/showcase/ShowcaseCard';
import TabBar from '@/components/ui/TabBar';
import Button from '@/components/ui/Button';
import { useShowcaseStore } from '@/store/showcase-store';
import { useAuthStore } from '@/store/auth-store';
import { ShowcaseEntry } from '@/types';
import Colors from '@/constants/colors';

// Function to generate dynamic months based on current date
const generateMonths = () => {
  const months = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Generate last 6 months including current month
  for (let i = 0; i < 6; i++) {
    let targetMonth = currentMonth - i;
    let targetYear = currentYear;
    
    // Handle year rollover for previous months
    if (targetMonth <= 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    
    const yearShort = targetYear.toString().slice(-2); // Get last 2 digits of year
    const monthName = monthNames[targetMonth - 1]; // monthNames is 0-indexed
    
    months.push({
      label: `${monthName} ${yearShort}`,
      year: targetYear,
      month: targetMonth
    });
  }
  
  return months;
};

const MONTHS = generateMonths();

export default function ShowcaseScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { entries, fetchEntries, fetchMyEntries, isLoading, deleteEntryApi } = useShowcaseStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeMonth, setActiveMonth] = useState(MONTHS[0]);
  const [sortOption, setSortOption] = useState('Latest');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Derived state for my entries
  const [myEntries, setMyEntries] = useState<ShowcaseEntry[]>([]);
  const [featuredEntries, setFeaturedEntries] = useState<ShowcaseEntry[]>([]);
  const [loadingMyEntries, setLoadingMyEntries] = useState(false);
  const [myEntriesLoaded, setMyEntriesLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Load featured from all entries
    if (entries.length > 0) {
      const featured = [...entries]
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 3);
      setFeaturedEntries(featured);
    }
  }, [entries]);

  // Sync upvote states between global entries and myEntries
  useEffect(() => {
    if (activeTab === 'my' && myEntries.length > 0 && entries.length > 0) {
      // Update myEntries with latest upvote data from global entries
      const updatedMyEntries = myEntries.map(myEntry => {
        const globalEntry = entries.find(entry => entry.id === myEntry.id);
        if (globalEntry) {
          // Sync upvote data from global store
          return {
            ...myEntry,
            upvoters: globalEntry.upvoters,
            upvotes: globalEntry.upvotes,
            isLiked: globalEntry.isLiked
          };
        }
        return myEntry;
      });
      
      // Only update if there are changes to prevent infinite loops
      const hasChanges = updatedMyEntries.some((entry, index) => {
        const original = myEntries[index];
        return entry.upvoters?.length !== original.upvoters?.length || 
               entry.isLiked !== original.isLiked;
      });
      
      if (hasChanges) {
        setMyEntries(updatedMyEntries);
      }
    }
  }, [entries, myEntries, activeTab]);

  useEffect(() => {
    // Fetch my showcases from API when user or tab changes
    const loadMy = async () => {
      if (user && activeTab === 'my' && !myEntriesLoaded) {
        // Only load if we haven't loaded before
        setLoadingMyEntries(true);
        console.log('Loading my entries for user:', user.id || user._id);
        const mine = await fetchMyEntries();
        console.log('Loaded my entries:', mine.length);
        
        // Sort by newest first (createdAt descending)
        const sortedMine = [...mine].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // Newest first
        });
        
        setMyEntries(sortedMine);
        setMyEntriesLoaded(true);
        setLoadingMyEntries(false);
      }
      // Don't clear entries when switching away - keep them cached
    };
    loadMy();
  }, [user, activeTab, myEntriesLoaded]);

  const loadData = async () => {
    await fetchEntries();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    // Also refresh my entries if we're on that tab
    if (user && activeTab === 'my') {
      const mine = await fetchMyEntries();
      
      // Sort by newest first (createdAt descending)
      const sortedMine = [...mine].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Newest first
      });
      
      setMyEntries(sortedMine);
      setMyEntriesLoaded(true);
    }
    setRefreshing(false);
  };

  const handleEntryPress = (entry: ShowcaseEntry) => {
    router.push({
      pathname: `/showcase/${entry?.id}`,
      params: {
        entryData: JSON.stringify(entry)
      }
    });
  };
  
  const handleCreateShowcase = () => {
    router.push('/showcase/create');
  };

  const handleEditShowcase = (entry: ShowcaseEntry) => {
    // Navigate to create page with entry data for editing
    router.push({
      pathname: '/showcase/create',
      params: {
        editMode: 'true',
        entryId: entry.id,
        // Pass the entry data as query params for editing
        title: entry.title || '',
        tagline: entry.tagline || '',
        description: entry.description || '',
        problem: entry.problem || '',
        solution: entry.solution || '',
        revenueModel: entry.revenueModel || '',
        category: entry.category || '',
        website: entry.links?.website || '',
        github: entry.links?.github || '',
        demoVideo: entry.links?.demoVideo || '',
        tags: entry.tags?.join(',') || ''
      }
    });
  };
  
  const handleDeleteShowcase = (entry: ShowcaseEntry) => {
    Alert.alert('Delete Showcase', 'Are you sure you want to delete this showcase?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const ok = await deleteEntryApi(entry.id);
        if (ok) {
          // Remove from local my entries state
          setMyEntries(prev => prev.filter(e => e.id !== entry.id));
          
          // Also refresh all entries to ensure consistency
          await fetchEntries();
          
          Alert.alert('Success', 'Showcase deleted successfully');
        } else {
          Alert.alert('Error', 'Failed to delete showcase. Please try again.');
        }
      } },
    ]);
  };

  const renderMonthTabs = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.monthTabsContainer}
        contentContainerStyle={styles.monthTabsContent}
      >
        {MONTHS.map((month) => {
          return (
            <TouchableOpacity
              key={month.label}
              style={[
                styles.monthTab,
                activeMonth.label === month.label && styles.activeMonthTab
              ]}
              onPress={() => setActiveMonth(month)}
            >
              <Text 
                style={[
                  styles.monthTabText,
                  activeMonth.label === month.label && styles.activeMonthTabText
                ]}
              >
                {month.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderShowcaseBanner = () => {
    return (
      <TouchableOpacity 
        style={styles.bannerContainer}
        activeOpacity={0.9}
        onPress={() => Alert.alert('Startup Showcase', 'Submit your ideas by 25th April to participate in the showcase and win exciting prizes!')}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={styles.bannerImage}
          imageStyle={{ borderRadius: 16 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerHeader}>
                <Trophy size={24} color="#FFD700" />
                <Text style={styles.bannerTitle}>Startup Showcase</Text>
              </View>
              <Text style={styles.bannerSubtitle}>Submit your ideas by 25th April</Text>
              
              <View style={styles.prizeContainer}>
                <View style={styles.prizeItem}>
                  <Text style={styles.prizeRank}>🥇</Text>
                  <Text style={styles.prizeAmount}>₹15,000</Text>
                </View>
                <View style={styles.prizeItem}>
                  <Text style={styles.prizeRank}>🥈</Text>
                  <Text style={styles.prizeAmount}>₹10,000</Text>
                </View>
                <View style={styles.prizeItem}>
                  <Text style={styles.prizeRank}>🥉</Text>
                  <Text style={styles.prizeAmount}>₹5,000</Text>
                </View>
              </View>
              
              <Text style={styles.bannerNote}>Next top 22 win ₹1,000 each</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  // Helper function to filter entries by selected month and search query
  const getFilteredEntries = () => {
    // Always show current month data by default
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // If user hasn't actively selected a different month, show current month
    const targetMonth = activeMonth;
    
    // First filter by month
    let filteredByMonth = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.getFullYear() === targetMonth.year && 
             entryDate.getMonth() + 1 === targetMonth.month;
    });
    
    // Then filter by search query if it exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredByMonth = filteredByMonth.filter(entry => {
        return (
          entry.title?.toLowerCase().includes(query) ||
          entry.tagline?.toLowerCase().includes(query) ||
          entry.description?.toLowerCase().includes(query) ||
          entry.category?.toLowerCase().includes(query) ||
          entry.author?.name?.toLowerCase().includes(query) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }
    
    return filteredByMonth;
  };

  // Helper function to get sorted entries
  const getSortedEntries = (entriesToSort: ShowcaseEntry[]) => {
    const sorted = [...entriesToSort];
    switch (sortOption) {
      case 'Popular':
        return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      case 'Random':
        return sorted.sort(() => Math.random() - 0.5);
      case 'Latest':
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // Newest first
        });
    }
  };

  const renderEntriesHeader = () => {
    const filteredEntries = getFilteredEntries();
    const entryCount = filteredEntries.length;
    
    return (
      <View style={styles.entriesHeader}>
        <Text style={styles.entriesTitle}>{entryCount} Entries</Text>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={styles.sortButtonText}>{sortOption}</Text>
          <ChevronDown size={16} color={Colors.dark.text} />
        </TouchableOpacity>
        
        {showSortOptions && (
          <View style={styles.sortOptionsContainer}>
            {['Latest', 'Popular', 'Random'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.sortOption}
                onPress={() => {
                  setSortOption(option);
                  setShowSortOptions(false);
                }}
              >
                <Text 
                  style={[
                    styles.sortOptionText,
                    sortOption === option && styles.activeSortOptionText
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Calculate proper bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' 
    ? 84 + insets.bottom 
    : 60 + insets.bottom;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <ScrollView 
            style={styles.tabContent}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.tint}
                colors={[Colors.dark.tint]}
              />
            }
          >
            {/* Search and Filter Bar */}
            <View style={styles.searchFilterContainer}>
              <View style={styles.searchBar}>
                <Search size={18} color={Colors.dark.subtext} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search in ${activeMonth.label}...`}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={Colors.dark.subtext}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  editable={true}
                  selectTextOnFocus={true}
                />
              </View>
              
              <TouchableOpacity style={styles.filterButton}>
                <Filter size={18} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            {renderMonthTabs()}
            {renderShowcaseBanner()}
            
            {renderEntriesHeader()}
            
            {getSortedEntries(getFilteredEntries()).map((entry) => (
              <ShowcaseCard 
                key={entry?.id}
                entry={entry} 
                onPress={() => handleEntryPress(entry)}
                onEdit={handleEditShowcase}
                onDelete={handleDeleteShowcase}
                showOwnerActions={false} // Don't show owner actions in all showcases
              />
            ))}
          </ScrollView>
        );
      
      case 'my':
        return (
          <ScrollView 
            style={styles.tabContent}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.tint}
                colors={[Colors.dark.tint]}
              />
            }
          >
            {loadingMyEntries ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your showcases...</Text>
              </View>
            ) : myEntries && myEntries.length > 0 ? (
              <>
                <View style={styles.myShowcasesHeader}>
                  <Text style={styles.sectionTitle}>My Showcases</Text>
                  <TouchableOpacity onPress={handleCreateShowcase}>
                    <Text style={styles.createText}>+ Create New</Text>
                  </TouchableOpacity>
                </View>
                
                {myEntries.map(entry => (
                  <ShowcaseCard 
                    key={entry?.id}
                    entry={entry} 
                    onPress={() => handleEntryPress(entry)}
                    onEdit={handleEditShowcase}
                    onDelete={handleDeleteShowcase}
                    showOwnerActions={true} // Show owner actions in my showcases
                  />
                ))}
              </>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80' }}
                  style={styles.emptyStateImage}
                />
                <Text style={styles.emptyStateTitle}>No Showcases Yet</Text>
                <Text style={styles.emptyStateText}>
                  Share your projects, ideas, or designs with the community
                </Text>
                <Button
                  title="Create Showcase"
                  onPress={handleCreateShowcase}
                  gradient
                  style={styles.createButton}
                />
              </View>
            )}
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader 
          title="Showcase"
          showCreatePost={false}
        />
        
        <TabBar
          tabs={[
            { id: 'all', label: 'All Showcases' },
            { id: 'my', label: 'My Showcases' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {renderTabContent()}
        
        <TouchableOpacity 
          style={[styles.fab, { bottom: tabBarHeight + 20 }]}
          onPress={handleCreateShowcase}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  listContent: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.dark.text,
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  searchPlaceholder: {
    color: Colors.dark.subtext,
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 11,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myShowcasesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    width: '80%',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Month tabs styles
  monthTabsContainer: {
    marginBottom: 16,
  },
  monthTabsContent: {
    paddingRight: 16,
  },
  monthTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginRight: 8,
    backgroundColor: Colors.dark.card,
  },
  activeMonthTab: {
    backgroundColor: Colors.dark.tint,
  },
  monthTabText: {
    color: Colors.dark.text,
    fontWeight: '500',
    fontSize: 14,
  },
  activeMonthTabText: {
    color: '#fff',
  },
  monthTabCount: {
    color: Colors.dark.subtext,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  activeMonthTabCount: {
    color: '#fff',
    opacity: 0.8,
  },
  // Banner styles
  bannerContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 200,
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerContent: {
    width: '100%',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  prizeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  prizeItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  prizeRank: {
    fontSize: 20,
    marginBottom: 4,
  },
  prizeAmount: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bannerNote: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  // Entries header styles
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  entriesTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  sortButtonText: {
    color: Colors.dark.text,
    marginRight: 4,
  },
  sortOptionsContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
    width: 120,
  },
  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortOptionText: {
    color: Colors.dark.text,
  },
  activeSortOptionText: {
    color: Colors.dark.tint,
    fontWeight: '500',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.dark.subtext,
    fontSize: 16,
    textAlign: 'center',
  },
});

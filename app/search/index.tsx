import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Search, X, ArrowLeft } from 'lucide-react-native';
import TabBar from '@/components/ui/TabBar';
import { usePostStore } from '@/store/post-store';
import { useAuthStore } from '@/store/auth-store';
import PostCard from '@/components/home/PostCard';
import Avatar from '@/components/ui/Avatar';
import Colors from '@/constants/colors';
import { Post, User } from '@/types';
import { useSearchStore } from '@/store/search-store';

export default function SearchScreen() {
  const router = useRouter();

  // Use data from stores or fetch here as needed
  const users = useSearchStore().users;
  const posts = useSearchStore().posts;
  const searchEverything: (query : string) => Promise<void> = useSearchStore().searchEverything;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'posts'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    all: { type: string; item: any }[];
    people: User[];
    posts: Post[];
  }>({
    all: [],
    people: [],
    posts: [],
  });

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch();
    } else {
      clearResults();
    }
  }, [searchQuery, activeTab]);

  const performSearch = async() => {
    setIsSearching(true);
    const query = searchQuery.toLowerCase();

    await searchEverything(query);

    const peopleResults = useSearchStore.getState().users;
    const postsResults = useSearchStore.getState().posts;

    const allResults = [
      ...peopleResults.map(item => ({ type: 'person', item })),
      ...postsResults.map(item => ({ type: 'post', item })),
    ];

    setSearchResults({
      all: allResults,
      people: peopleResults,
      posts: postsResults,
    });

    setIsSearching(false);
  };

  const clearResults = () => {
    setSearchResults({
      all: [],
      people: [],
      posts: [],
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    clearResults();
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewProfile = (userId : string) => router.push(`/profile/${userId}`);

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const renderPersonItem = ({ item }: { item: User }) => {
    if (!item) return null; // Prevent crashing
    return (
      <TouchableOpacity style={styles.personItem} onPress={() => handleViewProfile(item._id)}>
        <Avatar source={item?.profileImage || ''} size={50} />
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{item.name}</Text>
          {item.bio && <Text style={styles.personHeadline}>{item.bio}</Text>}
          {item.location && <Text style={styles.personLocation}>{item.location}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAllItem = ({ item }: { item: { type: string; item: any } }) => {
    switch (item.type) {
      case 'person':
        return renderPersonItem({ item: item.item });
      case 'post':
        return <PostCard post={item.item} onPress={() => handlePostPress(item.item.id)} />;
      default:
        return null;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Search size={60} color={Colors.dark.subtext} style={styles.emptyIcon} />
      {searchQuery.trim().length > 0 ? (
        <>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try different keywords or filters</Text>
        </>
      ) : (
        <>
          <Text style={styles.emptyText}>Search for people, posts, jobs, events, and more</Text>
          <Text style={styles.emptySubtext}>Enter keywords in the search bar above</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header with search bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.dark.subtext} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={Colors.dark.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={performSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.dark.subtext} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBarContainer}>
        <TabBar
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'people', label: 'People' },
            { id: 'posts', label: 'Posts' },
          ]}
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab as 'all' | 'people' | 'posts')}
          scrollable
        />
      </View>

      {/* Content area */}
      <View style={styles.contentArea}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.tint} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : activeTab === 'all' ? (
          <FlatList
            data={searchResults.all}
            keyExtractor={(item, index) => `all-${index}-${item.item?.id || index}`}
            renderItem={renderAllItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        ) : activeTab === 'people' ? (
          <FlatList
            data={searchResults.people}
            keyExtractor={(item, index) => `person-${index}-${item.id}`}
            renderItem={({ item }) => renderPersonItem({ item })}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={searchResults.posts}
            keyExtractor={(item, index) => `post-${index}-${item.id}`}
            renderItem={({ item }) => <PostCard post={item} onPress={() => handlePostPress(item.id)} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    marginRight: 12,
    padding: 4, // Added padding for better touch target
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 100,
    paddingHorizontal: 12,
    height: 40, // Fixed height for consistent alignment
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.dark.text,
    fontSize: 16,
  },
  clearButton: {
    padding: 8, // Increased padding for better touch target
    marginLeft: 4,
  },
  tabBarContainer: {
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  contentArea: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center', // Better vertical alignment
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  personInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center', // Center content vertically
  },
  personName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20, // Better text spacing
  },
  personHeadline: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18, // Better text spacing
  },
  personLocation: {
    color: Colors.dark.subtext,
    fontSize: 12,
    lineHeight: 16, // Better text spacing
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300, // Minimum height to ensure proper centering
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22, // Better text spacing
  },
  emptySubtext: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 18, // Better text spacing
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200, // Minimum height for better loading state
  },
  loadingText: {
    color: Colors.dark.text,
    marginTop: 12,
    fontSize: 14,
  },
});
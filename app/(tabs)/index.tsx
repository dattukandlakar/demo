// app/(tabs)/index.tsx

import React, { useEffect, useState, useCallback, memo } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import AppHeader from '@/components/layout/AppHeader';
import PostCard from '@/components/home/PostCard';
import StoriesSection from '@/components/home/StoriesSection';
import TabBar from '@/components/ui/TabBar';
import { StoryViewer } from '@/components/ui/StoryViewer';
import { usePostStore } from '@/store/post-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { getUser, followingUserStory, saveCommentToStory } from '@/api/user';
import { mapUserFromApi } from '@/utils/mapUserFromApi';
import { Story } from '@/types';
import { PostCardSkeleton, StoriesSectionSkeleton } from '@/components/ui/SkeletonLoader';
import ErrorBoundary, { ErrorFallback } from '@/components/ui/ErrorBoundary';

const HomeScreen = memo(() => {
  const router = useRouter();
  const { posts, stories, fetchPosts, fetchStories, isLoading, addStory } = usePostStore();
  const { user, updateUser, token } = useAuthStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('latest');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStories, setCurrentStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [fetchedStories, setFetchedStories] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Fixed initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      if (token) {
        try {
          setDataLoading(true);
          // Step 1: Fetch user data first
          const userResponse = await getUser(token);
          
          // Handle both response formats
          if (userResponse && userResponse.success && userResponse.body) {
            // Standard API response format
            const mappedUser = mapUserFromApi(userResponse.body);
            updateUser(mappedUser);
          } else if (userResponse && userResponse._id) {
            // Direct user object (fallback)
            const mappedUser = mapUserFromApi(userResponse);
            updateUser(mappedUser);
          } else {
            throw new Error('Invalid user response format');
          }
          
          // Step 2: Fetch posts and stories in parallel
          await Promise.all([
            fetchPosts(activeTab as 'latest' | 'trending'),
            fetchStories(),
            fetchFollowingStories()
          ]);
          
        } catch (err) {
          console.error('Error fetching initial data:', err);
        } finally {
          setDataLoading(false);
        }
      } else {
        console.log('No token available');
      }
    };

    fetchInitialData();
  }, [token, activeTab, fetchPosts, fetchStories, updateUser]);

  const fetchFollowingStories = async () => {
    try {
      const response = await followingUserStory(token);
      const rawStories = response || [];

      // Group stories by user
      const groupedStories = rawStories.reduce((acc: any, story: any) => {
        const userId = story.userId._id;
        const userName = story.userId.name;
        const userAvatar = story.userId.profileImage || '';
        const userStreak = story.userId.streak || 0;

        // Map the single story object to the desired format
        const mappedStory = {
          id: story._id,
          url: story.url,
          type: story.type,
          viewed: false,
          createdAt: story.createdAt,
          overlayData: story.overlayData || null, // Include overlay data
          user: {
            id: userId,
            name: userName,
            avatar: userAvatar,
            streak: userStreak,
          },
        };

        // If the user already exists in the accumulator, add the new story to their group
        if (acc[userId]) {
          acc[userId].stories.push(mappedStory);
        } else {
          // Otherwise, create a new user group with the first story
          acc[userId] = {
            user: mappedStory.user,
            stories: [mappedStory],
          };
        }
        return acc;
      }, {});

      // Convert the grouped object back into an array of story groups
      const storyGroups = Object.values(groupedStories);

      setFetchedStories(storyGroups);
    } catch (err) {
      console.error('Error fetching following stories:', err);
      setFetchedStories([]); // Set empty array on error
    }
  };

  const loadData = async () => {
    await Promise.all([
      fetchPosts(activeTab as 'latest' | 'trending'),
      fetchStories(),
      fetchFollowingStories()
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    if (token) {
      try {
        const userResponse = await getUser(token);
        
        if (userResponse && userResponse.body) {
          const mappedUser = mapUserFromApi(userResponse.body);
          updateUser(mappedUser);
          
          await Promise.all([
            fetchPosts(activeTab as 'latest' | 'trending'),
            fetchStories(),
            fetchFollowingStories()
          ]);
        }
      } catch (err) {
        console.error('Error refreshing data:', err);
      }
    } 
    
    setRefreshing(false);
  };

  const handleTabChange = useCallback(async (tabId: string) => {
    setActiveTab(tabId);
    await fetchPosts(tabId as 'latest' | 'trending');
  }, [fetchPosts]);

  const handleStoryPress = useCallback((storyId: string, userStories: Story[], storyIndex: number) => {
    if (userStories && userStories.length > 0) {
      setCurrentStories(userStories);
      setCurrentStoryIndex(Math.max(0, storyIndex)); // Ensure index is not negative
      setShowStoryViewer(true);
    } else {
      console.error('No stories found for user');
    }
  }, []);

  const handleAddStory = useCallback(async () => {
    // This will be handled by the StoryUploadModal in StoriesSection
    // The modal will handle image selection and upload
    // After upload, refresh stories
    await Promise.all([
      fetchStories(),
      fetchFollowingStories()
    ]);
  }, [fetchStories]);

  const handleStoryViewerClose = useCallback(() => {
    setShowStoryViewer(false);
  }, []);

  const handleStoryComplete = useCallback((storyId: string) => {
    // Mark story as viewed in the store
    // TODO: Implement API call to mark story as viewed
    console.log('Story completed:', storyId);
  }, []);

  const handleLikeStory = useCallback((storyId: string) => {
    // Handle story like
    // TODO: Implement API call to like story
    console.log('Story liked:', storyId);
  }, []);

  const handleReplyToStory = useCallback(async (storyId: string, message: string) => {
    // Handle story reply
    console.log('Reply to story:', storyId, message);
    await saveCommentToStory(storyId, message, token);
  }, [token]);

  const handleCreatePost = useCallback(() => {
    router.push('/post/create');
  }, [router]);

  // Ensure stories is always an array
  const safeStories = Array.isArray(stories) ? stories : [];
  
  // Filter stories to get only the current user's stories
  const userStories = user ? safeStories.filter(story => 
    story?.user?.id && user?.id && story.user.id === user.id
  ) : [];

  const renderHeader = () => (
    <>
      {dataLoading ? (
        <StoriesSectionSkeleton />
      ) : (
        <StoriesSection
          stories={safeStories}
          userStories={userStories}
          fetchedStories={fetchedStories}
          onStoryPress={handleStoryPress}
          onAddStory={handleAddStory}
        />
      )}
      <TabBar
        tabs={[
          { id: 'latest', label: 'Latest' },
          { id: 'trending', label: 'Trending' },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        style={styles.tabBar}
      />
    </>
  );

  const renderPost = ({ item }: { item: any }) => {
    return (
      <ErrorBoundary
        fallback={
          <ErrorFallback 
            title="Error loading post"
            message="This post couldn't be loaded. Please try refreshing."
          />
        }
      >
        <PostCard post={item} />
      </ErrorBoundary>
    );
  };

  const renderSkeletonPosts = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <PostCardSkeleton key={`skeleton-${index}`} showImages={index % 2 === 0} />
    ));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <AppHeader 
          title="Home"
        />
        
        {(dataLoading || isLoading) && (!posts || posts.length === 0) ? (
          <View style={styles.listContent}>
            {renderHeader()}
            {renderSkeletonPosts()}
          </View>
        ) : (
          <FlatList
            data={Array.isArray(posts) ? posts : []}
            keyExtractor={(item) => item?.id || `post_${Date.now()}_${Math.random()}`}
            renderItem={renderPost}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.primary}
                colors={[Colors.dark.primary]}
              />
            }
            removeClippedSubviews={false}
            maxToRenderPerBatch={5}
            initialNumToRender={3}
            windowSize={10}
            updateCellsBatchingPeriod={100}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            scrollEventThrottle={16}
          />
        )}
        
        <TouchableOpacity 
          style={[styles.fab, { 
            bottom: (Platform.OS === 'ios' ? 100 : 76) + insets.bottom 
          }]}
          onPress={handleCreatePost}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Story Viewer */}
      <StoryViewer
        visible={showStoryViewer}
        stories={currentStories}
        initialStoryIndex={currentStoryIndex}
        onClose={handleStoryViewerClose}
        onStoryComplete={handleStoryComplete}
        onLikeStory={handleLikeStory}
        onReplyToStory={handleReplyToStory}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  tabBar: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen;
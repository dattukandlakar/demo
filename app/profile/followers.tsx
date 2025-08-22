import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { User } from '@/types';
import { getUserFollowers, enrichUserList, followUser, unfollowUser } from '@/api/user';

export default function FollowersScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { user: currentUser, token } = useAuthStore();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [profileOwnerName, setProfileOwnerName] = useState<string>('');

  // Determine whose followers we're showing
  const targetUserId = userId || currentUser?.id;
  const isViewingOwnFollowers = !userId || userId === currentUser?.id;

  const fetchFollowers = async () => {
    if (!token || !targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching followers data for userId:', targetUserId);
      
      // Fetch followers list for the specific user
      const followersData = await getUserFollowers(token, userId);
      console.log('Raw followers data:', followersData);
      
      if (!Array.isArray(followersData)) {
        console.log('No followers found or invalid data format');
        setFollowers([]);
        return;
      }

      // Map the data to ensure consistent User interface and remove duplicates
      const seenIds = new Set();
      const basicMappedFollowers = followersData
        .map((follower: any, index: number) => {
          const userId = follower.id || follower._id;
          const uniqueId = userId || `follower-${Date.now()}-${index}`;
          
          return {
            id: uniqueId,
            _id: follower._id || uniqueId,
            name: follower.name || '',
            email: follower.email || '',
            avatar: follower.avatar || follower.profileImage || '',
            profileImage: follower.profileImage || follower.avatar || '',
            bio: follower.bio || follower.headline || '',
            headline: follower.headline || follower.bio || '',
            location: follower.location || '',
            isFollowing: false, // We'll determine this below
          };
        })
        .filter((follower: any) => {
          if (seenIds.has(follower.id)) {
            return false; // Skip duplicate
          }
          seenIds.add(follower.id);
          return true;
        });

      console.log('Basic mapped followers:', basicMappedFollowers.length);

      // Enrich the data with detailed user profiles
      let enrichedFollowers = basicMappedFollowers;
      try {
        console.log('Enriching followers with detailed profiles...');
        enrichedFollowers = await enrichUserList(token, basicMappedFollowers);
        console.log('Enriched followers:', enrichedFollowers.length);
      } catch (enrichError) {
        console.warn('Failed to enrich followers data, using basic data:', enrichError);
        // Continue with basic data if enrichment fails
      }

      setFollowers(enrichedFollowers);
      
      // Create a set of users we're following (this would need another API call to determine)
      // For now, we'll leave isFollowing as false for all followers
      
    } catch (error) {
      console.error('Error fetching followers:', error);
      Alert.alert(
        'Error', 
        'Failed to load followers. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
    
    // Set the profile owner name for the header
    if (isViewingOwnFollowers) {
      setProfileOwnerName('Your');
    } else {
      // You might want to fetch the user's name here if needed
      setProfileOwnerName("User's");
    }
  }, [token, targetUserId, userId]);

  const handleBack = () => {
    router.back();
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleToggleFollow = async (userId: string) => {
    if (!token) {
      Alert.alert('Error', 'Please log in to manage follows.');
      return;
    }

    const isCurrentlyFollowing = followingUsers.has(userId);
    
    // Optimistically update the UI
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyFollowing) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });

    setFollowers(prevFollowers => 
      prevFollowers.map(follower => 
        follower.id === userId 
          ? { ...follower, isFollowing: !isCurrentlyFollowing }
          : follower
      )
    );

    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(token, userId);
      } else {
        await followUser(token, userId);
      }
    } catch (error) {
      // Revert the optimistic update on error
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyFollowing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });

      setFollowers(prevFollowers => 
        prevFollowers.map(follower => 
          follower.id === userId 
            ? { ...follower, isFollowing: isCurrentlyFollowing }
            : follower
        )
      );

      console.error('Error toggling follow status:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFollowers();
    } catch (error) {
      console.error('Error during refresh:', error);
      Alert.alert('Error', 'Failed to refresh followers. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredFollowers = searchQuery
    ? followers.filter(follower => 
        follower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (follower.bio && follower.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : followers;

  const renderFollowerItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.followerItem}
      onPress={() => handleViewProfile(item.id)}
    >
      <Avatar 
        source={item.avatar} 
        name={item.name} 
        size={50} 
      />
      
      <View style={styles.followerInfo}>
        <Text style={styles.followerName}>{item.name}</Text>
        {item.bio && <Text style={styles.followerBio}>{item.bio}</Text>}
      </View>
      
      <Button 
        title={item.isFollowing ? "Following" : "Follow"}
        onPress={() => handleToggleFollow(item.id)}
        variant={item.isFollowing ? "outline" : "primary"}
        size="small"
        style={styles.followButton}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: isViewingOwnFollowers ? "Followers" : "Followers",
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.dark.subtext} />
        <TouchableOpacity 
          style={styles.searchInput}
          onPress={() => {/* Open search modal */}}
        >
          <Text style={styles.searchPlaceholder}>Search followers...</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Loading followers...</Text>
        </View>
      ) : followers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isViewingOwnFollowers ? "You have no followers yet" : "This user has no followers yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFollowers}
          renderItem={renderFollowerItem}
          keyExtractor={(item, index) => item.id || item._id || `follower-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.dark.primary]}
              tintColor={Colors.dark.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
  },
  searchPlaceholder: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.dark.text,
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  followerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  followerName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  followerBio: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  followButton: {
    minWidth: 100,
  },
});
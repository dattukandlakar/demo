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
import { getUserFollowing, followUser, unfollowUser, enrichUserList } from '@/api/user';

export default function FollowingScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { user: currentUser, token } = useAuthStore();
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [profileOwnerName, setProfileOwnerName] = useState<string>('');

  // Determine whose following list we're showing
  const targetUserId = userId || currentUser?.id;
  const isViewingOwnFollowing = !userId || userId === currentUser?.id;

  const fetchFollowing = async () => {
    if (!token || !targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching following data for userId:', targetUserId);
      
      // Fetch following list directly from API for the specific user
      const followingData = await getUserFollowing(token, userId);
      console.log('Raw following data:', followingData);
      
      if (!Array.isArray(followingData)) {
        console.log('No following found or invalid data format');
        setFollowing([]);
        return;
      }

      // Map the data to ensure consistent User interface and remove duplicates
      const seenIds = new Set();
      const basicMappedFollowing = followingData
        .map((followedUser: any, index: number) => {
          const userId = followedUser.id || followedUser._id;
          const uniqueId = userId || `following-${Date.now()}-${index}`;
          
          return {
            id: uniqueId,
            _id: followedUser._id || uniqueId,
            name: followedUser.name || '',
            email: followedUser.email || '',
            avatar: followedUser.avatar || followedUser.profileImage || '',
            profileImage: followedUser.profileImage || followedUser.avatar || '',
            bio: followedUser.bio || followedUser.headline || '',
            headline: followedUser.headline || followedUser.bio || '',
            location: followedUser.location || '',
            isFollowing: true, // Since we're fetching users we follow, they should all be true
          };
        })
        .filter((followedUser: any) => {
          if (seenIds.has(followedUser.id)) {
            return false; // Skip duplicate
          }
          seenIds.add(followedUser.id);
          return true;
        });

      console.log('Basic mapped following:', basicMappedFollowing.length);

      // Enrich the data with detailed user profiles
      let enrichedFollowing = basicMappedFollowing;
      try {
        console.log('Enriching following with detailed profiles...');
        enrichedFollowing = await enrichUserList(token, basicMappedFollowing);
        console.log('Enriched following:', enrichedFollowing.length);
      } catch (enrichError) {
        console.warn('Failed to enrich following data, using basic data:', enrichError);
        // Continue with basic data if enrichment fails
      }

      setFollowing(enrichedFollowing);
      
      // Create a set of users we're following
      const followingSet = new Set(
        enrichedFollowing.map((followedUser: User) => followedUser.id)
      );
      setFollowingUsers(followingSet);
      
    } catch (error) {
      console.error('Error fetching following:', error);
      Alert.alert(
        'Error', 
        'Failed to load following list. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowing();
    
    // Set the profile owner name for the header
    if (isViewingOwnFollowing) {
      setProfileOwnerName('Your');
    } else {
      // You might want to fetch the user's name here if needed
      setProfileOwnerName("User's");
    }
  }, [token, targetUserId, userId]);

  const handleBack = () => {
    router.back();
  };

  const handleViewProfile = (userId) => {
    const idToUse = userId;
    if (idToUse) router.push(`/profile/${idToUse}`);
  };

  const handleToggleFollow = async (userId) => {
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

    setFollowing(prevFollowing => 
      prevFollowing.map(followedUser => 
        followedUser.id === userId 
          ? { ...followedUser, isFollowing: !isCurrentlyFollowing }
          : followedUser
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

      setFollowing(prevFollowing => 
        prevFollowing.map(followedUser => 
          followedUser.id === userId 
            ? { ...followedUser, isFollowing: isCurrentlyFollowing }
            : followedUser
        )
      );

      console.error('Error toggling follow status:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFollowing();
    } catch (error) {
      console.error('Error during refresh:', error);
      Alert.alert('Error', 'Failed to refresh following. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredFollowing = searchQuery
    ? following.filter(followedUser => 
        followedUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (followedUser.bio && followedUser.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : following;

  const renderFollowingItem = ({ item }: { item: User }) => {
    // Extract additional user details for display
    const userDetails = item as any;
    const headline = userDetails.headline || userDetails.about?.headline || '';
    const location = userDetails.location || userDetails.about?.location || '';
    const company = userDetails.experience?.[0]?.company || userDetails.about?.experience?.[0]?.company || '';
    const email = userDetails.email || '';
    const bio = item.bio || headline || userDetails.about?.summary || '';

    return (
      <TouchableOpacity 
        style={styles.followingItem}
        onPress={() => handleViewProfile(item.id)}
      >
        <Avatar 
          source={item.avatar || item.profileImage} 
          name={item.name} 
          size={60} 
        />
        
        <View style={styles.followingInfo}>
          <Text style={styles.followingName}>{item.name}</Text>
          {bio && <Text style={styles.followingBio} numberOfLines={2}>{bio}</Text>}
          
          {/* Additional details */}
          <View style={styles.followingDetails}>
            {company && (
              <Text style={styles.followingDetail} numberOfLines={1}>
                🏢 {company}
              </Text>
            )}
            {location && (
              <Text style={styles.followingDetail} numberOfLines={1}>
                📍 {location}
              </Text>
            )}
            {email && (
              <Text style={styles.followingDetail} numberOfLines={1}>
                ✉️ {email}
              </Text>
            )}
          </View>
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: isViewingOwnFollowing ? "Following" : "Following",
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
          <Text style={styles.searchPlaceholder}>Search following...</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Loading following...</Text>
        </View>
      ) : following.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isViewingOwnFollowing ? "You are not following anyone yet" : "This user is not following anyone yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFollowing}
          renderItem={renderFollowingItem}
          keyExtractor={(item, index) => item.id || item._id || `following-${index}`}
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
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  followingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  followingName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  followingBio: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 6,
  },
  followingDetails: {
    flexDirection: 'column',
    gap: 2,
  },
  followingDetail: {
    color: Colors.dark.subtext,
    fontSize: 12,
    opacity: 0.8,
  },
  followButton: {
    minWidth: 100,
  },
});
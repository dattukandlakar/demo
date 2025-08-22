import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  Search,
  Plus,
  Users,
  MapPin,
  Clock,
  TrendingUp,
  Filter,
  Globe,
  Lock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCommunityStore } from '@/store/community-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import CommunityCard from '@/components/community/CommunityCard';
import type { Community } from '@/store/community-store';

export default function CommunitiesScreen() {
  const router = useRouter();
  const { 
    communities, 
    joinedCommunities, 
    searchQuery, 
    filterType, 
    setSearchQuery, 
    setFilterType, 
    getFilteredCommunities,
    joinCommunity,
    leaveCommunity 
  } = useCommunityStore();
  const { user } = useAuthStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCommunities = getFilteredCommunities();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleJoinCommunity = (communityId: string) => {
    if (user) {
      joinCommunity(communityId, user.id);
    }
  };

  const handleLeaveCommunity = (communityId: string) => {
    if (user) {
      leaveCommunity(communityId, user.id);
    }
  };

  const isUserMember = (communityId: string) => {
    return joinedCommunities.some(jc => jc.communityId === communityId);
  };

  const renderCommunityCard = ({ item: community }: { item: Community }) => (
    <CommunityCard
      community={community}
      isJoined={isUserMember(community.id)}
      onJoin={() => handleJoinCommunity(community.id)}
      onLeave={() => handleLeaveCommunity(community.id)}
    />
  );

  const renderFilterChip = (type: string, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filterType === type && styles.filterChipActive
      ]}
      onPress={() => setFilterType(type as any)}
    >
      {icon}
      <Text
        style={[
          styles.filterChipText,
          filterType === type && styles.filterChipTextActive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Communities',
          headerStyle: { backgroundColor: Colors.dark.background },
          headerTintColor: Colors.dark.text,
          headerRight: () => (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/community/create')}
            >
              <Plus size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.dark.subtext} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor={Colors.dark.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {renderFilterChip('all', 'All', <Globe size={16} color={filterType === 'all' ? Colors.dark.tint : Colors.dark.subtext} />)}
          {renderFilterChip('trending', 'Trending', <TrendingUp size={16} color={filterType === 'trending' ? Colors.dark.tint : Colors.dark.subtext} />)}
          {renderFilterChip('nearby', 'Nearby', <MapPin size={16} color={filterType === 'nearby' ? Colors.dark.tint : Colors.dark.subtext} />)}
          {renderFilterChip('joined', 'Joined', <Users size={16} color={filterType === 'joined' ? Colors.dark.tint : Colors.dark.subtext} />)}
        </ScrollView>
      )}

      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.tint}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={48} color={Colors.dark.subtext} />
            <Text style={styles.emptyTitle}>No communities found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Be the first to create a community!'
              }
            </Text>
            {!searchQuery && (
              <Button
                title="Create Community"
                onPress={() => router.push('/community/create')}
                style={styles.emptyButton}
              />
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  createButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  filterButton: {
    padding: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: `${Colors.dark.tint}20`,
  },
  filterChipText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.dark.tint,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    color: Colors.dark.subtext,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
});
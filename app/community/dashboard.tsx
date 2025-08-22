import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Heart,
  Share,
} from 'lucide-react-native';
import { useCommunityStore } from '@/store/community-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function CommunityDashboardScreen() {
  const router = useRouter();
  const { joinedCommunities, communities } = useCommunityStore();
  const { user } = useAuthStore();

  // Get communities where user is admin
  const adminCommunities = communities.filter(community => 
    community.admins.includes(user?.id || '')
  );

  const [selectedCommunity, setSelectedCommunity] = useState(
    adminCommunities.length > 0 ? adminCommunities[0] : null
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Community Dashboard',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Please log in to access dashboard</Text>
        </View>
      </View>
    );
  }

  if (adminCommunities.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Community Dashboard',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.centerContainer}>
          <Users size={48} color={Colors.dark.subtext} />
          <Text style={styles.emptyTitle}>No Communities to Manage</Text>
          <Text style={styles.emptyDescription}>
            You don't have admin access to any communities yet.
          </Text>
          <Button
            title="Create Community"
            onPress={() => router.push('/community/create')}
            style={styles.createButton}
          />
        </View>
      </View>
    );
  }

  const getEngagementStats = () => {
    if (!selectedCommunity) return { totalPosts: 0, totalLikes: 0, totalComments: 0 };
    
    const totalPosts = selectedCommunity.posts.length;
    const totalLikes = selectedCommunity.posts.reduce((sum, post) => sum + post.likes.length, 0);
    const totalComments = selectedCommunity.posts.reduce((sum, post) => sum + post.comments.length, 0);
    
    return { totalPosts, totalLikes, totalComments };
  };

  const { totalPosts, totalLikes, totalComments } = getEngagementStats();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Community Dashboard',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={22} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Community Selector */}
        {adminCommunities.length > 1 && (
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Select Community</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {adminCommunities.map((community) => (
                <TouchableOpacity
                  key={community.id}
                  style={[
                    styles.communityChip,
                    selectedCommunity?.id === community.id && styles.communityChipActive
                  ]}
                  onPress={() => setSelectedCommunity(community)}
                >
                  <Text style={styles.communityChipIcon}>{community.icon}</Text>
                  <Text
                    style={[
                      styles.communityChipText,
                      selectedCommunity?.id === community.id && styles.communityChipTextActive
                    ]}
                  >
                    {community.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedCommunity && (
          <View style={styles.content}>
            {/* Overview Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <Users size={24} color={Colors.dark.tint} />
                  <Text style={styles.statNumber}>{selectedCommunity.memberCount}</Text>
                  <Text style={styles.statLabel}>Members</Text>
                </Card>
                
                <Card style={styles.statCard}>
                  <MessageSquare size={24} color={Colors.dark.tint} />
                  <Text style={styles.statNumber}>{totalPosts}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </Card>
                
                <Card style={styles.statCard}>
                  <Calendar size={24} color={Colors.dark.tint} />
                  <Text style={styles.statNumber}>{selectedCommunity.events.length}</Text>
                  <Text style={styles.statLabel}>Events</Text>
                </Card>
                
                <Card style={styles.statCard}>
                  <TrendingUp size={24} color={Colors.dark.tint} />
                  <Text style={styles.statNumber}>{totalLikes + totalComments}</Text>
                  <Text style={styles.statLabel}>Engagement</Text>
                </Card>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => router.push(`/community/${selectedCommunity.id}`)}
                >
                  <Eye size={24} color={Colors.dark.text} />
                  <Text style={styles.actionText}>View Community</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionCard}>
                  <Plus size={24} color={Colors.dark.text} />
                  <Text style={styles.actionText}>Create Event</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionCard}>
                  <MessageSquare size={24} color={Colors.dark.text} />
                  <Text style={styles.actionText}>New Announcement</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionCard}>
                  <Users size={24} color={Colors.dark.text} />
                  <Text style={styles.actionText}>Manage Members</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {selectedCommunity.posts.length > 0 ? (
                <View style={styles.activityList}>
                  {selectedCommunity.posts.slice(0, 5).map((post) => (
                    <View key={post.id} style={styles.activityItem}>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityAuthor}>{post.authorName}</Text>
                        <Text style={styles.activityText} numberOfLines={2}>
                          {post.content}
                        </Text>
                        <View style={styles.activityStats}>
                          <View style={styles.activityStat}>
                            <Heart size={14} color={Colors.dark.subtext} />
                            <Text style={styles.activityStatText}>{post.likes.length}</Text>
                          </View>
                          <View style={styles.activityStat}>
                            <MessageSquare size={14} color={Colors.dark.subtext} />
                            <Text style={styles.activityStatText}>{post.comments.length}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyActivity}>
                  <MessageSquare size={32} color={Colors.dark.subtext} />
                  <Text style={styles.emptyActivityText}>No recent activity</Text>
                </View>
              )}
            </View>

            {/* Member Growth */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Community Health</Text>
              <Card style={styles.healthCard}>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>Member Growth</Text>
                  <Text style={styles.healthValue}>+12 this week</Text>
                  <Text style={styles.healthTrend}>↗️ +15%</Text>
                </View>
                
                <View style={styles.healthDivider} />
                
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>Engagement Rate</Text>
                  <Text style={styles.healthValue}>
                    {totalPosts > 0 ? Math.round(((totalLikes + totalComments) / totalPosts) * 100) / 100 : 0}
                  </Text>
                  <Text style={styles.healthTrend}>↗️ +8%</Text>
                </View>
              </Card>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
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
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 16,
    textAlign: 'center',
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
  createButton: {
    minWidth: 200,
  },
  scrollView: {
    flex: 1,
  },
  selectorContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  selectorLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  communityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  communityChipActive: {
    backgroundColor: `${Colors.dark.tint}20`,
    borderColor: Colors.dark.tint,
  },
  communityChipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  communityChipText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  communityChipTextActive: {
    color: Colors.dark.tint,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 20,
  },
  statNumber: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityAuthor: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityText: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  activityStats: {
    flexDirection: 'row',
    gap: 16,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityStatText: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 32,
  },
  emptyActivityText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginTop: 12,
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
  },
  healthLabel: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 8,
  },
  healthValue: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  healthTrend: {
    color: Colors.dark.success,
    fontSize: 12,
    fontWeight: '500',
  },
  healthDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 16,
  },
});
// app/profile/index.tsx

import React, { useState, useCallback, memo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import {
  Edit2,
  MapPin,
  Briefcase,
  GraduationCap,
  Settings,
  Calendar,
  BarChart2,
  Plus,
  Share2
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import TabBar from '@/components/ui/TabBar';
import { useAuthStore } from '@/store/auth-store';
import { usePortfolioStore } from '@/store/portfolio-store';
import { useShowcaseStore } from '@/store/showcase-store';
import PostCard from '@/components/home/PostCard';
import ShowcaseCard from '@/components/showcase/ShowcaseCard';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import { ProfileHeaderSkeleton, ProfileContentSkeleton } from '@/components/ui/SkeletonLoader';
import Colors from '@/constants/colors';
import Avatar from '@/components/ui/Avatar';
import useProfileData from '@/hooks/useProfileData';
import { useUserCommentsStore } from '@/store/user-comments-store';
import UserReply from '@/components/ui/UserReply';

export default function ProfileScreen() {
  const router = useRouter();
  const { user: currentUser, token, logout } = useAuthStore();
  const { deletePortfolioItem } = usePortfolioStore();
  const { deleteEntryApi, fetchEntries } = useShowcaseStore();
  const { userComments, isLoading: commentsLoading, fetchUserComments, refreshUserComments } = useUserCommentsStore();
  const [activeTab, setActiveTab] = useState('about');
  
  // Use optimized profile data hook
  const {
    user,
    posts: userPosts,
    showcases: userShowcases, 
    portfolioItems: userPortfolioItems,
    loading,
    refreshing,
    refresh,
    smartRefresh
  } = useProfileData({
    userId: currentUser?.id || '',
    isOwnProfile: true,
    enableAutoRefresh: false, // Temporarily disable to isolate issue
    cacheTimeout: 2 * 60 * 1000, // 2 minutes for own profile
  });
  
  // Use current user or fetched user data
  const displayUser = user || currentUser;

  // Smart focus effect - only refresh when needed (use ref to avoid dependency issues)
  const smartRefreshRef = useRef(smartRefresh);
  smartRefreshRef.current = smartRefresh;
  
  useFocusEffect(
    useCallback(() => {
      console.log('--- MY PROFILE DEBUG: Profile tab focused - using smart refresh');
      // Use ref to call the latest version without creating dependency loop
      smartRefreshRef.current();
    }, []) // No dependencies to prevent infinite loops
  );

  // Fetch user comments when replies tab is active
  React.useEffect(() => {
    console.log('🔍 Main profile replies useEffect triggered:', {
      activeTab,
      currentUserId: currentUser?.id,
      currentUser_id: currentUser?._id
    });
    
    if (activeTab === 'replies' && currentUser?.id) {
      console.log('📞 Calling fetchUserComments for current user ID:', currentUser.id);
      fetchUserComments(currentUser.id);
    }
  }, [activeTab, currentUser?.id, fetchUserComments]);

  const handleLogout = () => {
    console.log('--- MY PROFILE DEBUG: Logout button pressed.');
    logout();
    router.replace('/login');
  };

  const handleEditProfile = () => {
    console.log('--- MY PROFILE DEBUG: Navigating to edit profile screen.');
    router.push('/profile/edit');
  };

  const handleSettings = () => {
    console.log('--- MY PROFILE DEBUG: Navigating to settings.');
    router.push('/settings' as any);
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share your profile with others');
  };

  const handleDeleteShowcase = async (showcase: any) => {
    Alert.alert(
      'Delete Showcase',
      'Are you sure you want to delete this showcase? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteEntryApi(showcase.id);
              if (success) {
                // Refresh the profile data to update the showcase list
                smartRefresh();
                Alert.alert('Success', 'Showcase deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete showcase. Please try again.');
              }
            } catch (error) {
              console.error('Failed to delete showcase:', error);
              Alert.alert('Error', 'Failed to delete showcase. Please try again.');
            }
          }
        }
      ]
    );
  };
  // Show loading skeleton while data is loading
  if (loading && !displayUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'My Profile',
            headerStyle: { backgroundColor: Colors.dark.background },
            headerTintColor: Colors.dark.text,
            headerTitleStyle: { color: Colors.dark.text, fontWeight: '600' },
            headerShadowVisible: false,
          }}
        />
        <ProfileHeaderSkeleton />
        <ProfileContentSkeleton activeTab={activeTab} />
      </SafeAreaView>
    );
  }

  if (!displayUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please log in to view your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.tabContent}>
            {/* Profile Summary Section */}
            <View style={styles.aboutSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.aboutSectionTitle}>Profile Summary</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                        <Plus size={20} color={Colors.dark.primary} />
                    </TouchableOpacity>
                </View>
                {displayUser.bio ? (
                    <Text style={styles.summaryText}>{displayUser.bio}</Text>
                ) : (
                    <View style={styles.emptySection}>
                        <Text style={styles.emptySectionText}>Add your profile summary</Text>
                    </View>
                )}
            </View>
            {/* Experience Section */}
            <View style={styles.aboutSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.aboutSectionTitle}>Experience</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                        <Plus size={20} color={Colors.dark.primary} />
                    </TouchableOpacity>
                </View>
                {displayUser.experience && displayUser.experience.length > 0 ? (
                    displayUser.experience.map((exp: any, index: number) => (
                        <View key={exp.id || index} style={styles.experienceItem}>
                            <Briefcase size={20} color={Colors.dark.tint} />
                            <View style={styles.experienceContent}>
                                <Text style={styles.experienceRole}>{exp.position}</Text>
                                <Text style={styles.experienceCompany}>{exp.company}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptySection}>
                        <Text style={styles.emptySectionText}>Add your work experience</Text>
                    </View>
                )}
            </View>
            {/* Education Section */}
            <View style={styles.aboutSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.aboutSectionTitle}>Education</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                        <Plus size={20} color={Colors.dark.primary} />
                    </TouchableOpacity>
                </View>
                {displayUser.education && displayUser.education.length > 0 ? (
                    displayUser.education.map((edu: any, index: number) => (
                        <View key={edu.id || index} style={styles.educationItem}>
                            <GraduationCap size={20} color={Colors.dark.tint} />
                            <View style={styles.educationContent}>
                                <Text style={styles.educationDegree}>{edu.degree}</Text>
                                <Text style={styles.educationInstitution}>{edu.name}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptySection}>
                        <Text style={styles.emptySectionText}>Add your education</Text>
                    </View>
                )}
            </View>
          </View>
        );
      case 'portfolio':
        return (
          <View style={styles.tabContent}>
            <PortfolioGrid
              items={userPortfolioItems}
              onItemPress={(item) => {
                // Open the portfolio link
                if (item.links && item.links.length > 0 && item.links[0].url) {
                  const url = item.links[0].url;
                  // Check if URL has protocol, if not add https://
                  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
                  
                  import('expo-linking').then(({ openURL }) => {
                    openURL(formattedUrl).catch(() => {
                      Alert.alert('Error', 'Could not open the portfolio link');
                    });
                  });
                } else {
                  Alert.alert('No Link', 'This portfolio item does not have a link');
                }
              }}
              onCreatePress={() => router.push('/portfolio/create')}
              onEditItem={(item) => router.push({ pathname: '/portfolio/create', params: { editItem: JSON.stringify(item) } })}
              onDeleteItem={async (item) => {
                if (token) {
                  const success = await deletePortfolioItem(token, item.id);
                  if (!success) {
                    Alert.alert('Error', 'Failed to delete portfolio item');
                  }
                }
              }}
            />
          </View>
        );
      case 'ideas':
         return (
             <View style={styles.tabContent}>
                 {userShowcases.length > 0 ? (
                     userShowcases.map(showcase =>
                         <ShowcaseCard 
                           key={showcase.id} 
                           entry={showcase} 
                           onPress={() => router.push(`/showcase/${showcase.id}`)} 
                           onDelete={handleDeleteShowcase}
                           showOwnerActions={true}
                         />
                     )
                 ) : (
                     <View style={styles.emptyStateContainer}><Text style={styles.emptyStateText}>You have no ideas yet.</Text></View>
                 )}
             </View>
         );
      case 'posts':
          return (
              <View style={styles.tabContent}>
                  {userPosts.length > 0 ? (
                      userPosts.map(post =>
                          <PostCard key={post.id} post={post} onPress={() => router.push(`/post/${post.id}`)} />
                      )
                  ) : (
                      <View style={styles.emptyStateContainer}><Text style={styles.emptyStateText}>You have no posts yet.</Text></View>
                  )}
              </View>
          );
      case 'replies':
          return (
              <View style={styles.repliesTabContent}>
                  {commentsLoading ? (
                      <View style={styles.loadingContainer}>
                          <Text style={styles.loadingText}>Loading replies...</Text>
                      </View>
                  ) : userComments.length > 0 ? (
                      <View style={styles.repliesContainer}>
                          {userComments.map((comment) => (
                              <UserReply
                                  key={comment.id || comment._id}
                                  comment={comment}
                                  onPress={() => {
                                      if (comment.post?._id) {
                                          router.push(`/post/${comment.post._id}`);
                                      }
                                  }}
                              />
                          ))}
                      </View>
                  ) : (
                      <View style={styles.emptyStateContainer}>
                          <Text style={styles.emptyStateText}>You haven't replied to any posts yet</Text>
                          <Button
                              title="Explore Posts"
                              onPress={() => router.push('/(tabs)')}
                              style={styles.emptyStateButton}
                          />
                      </View>
                  )}
              </View>
          );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'My Profile',
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: {
            color: Colors.dark.text,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={handleShare} style={[styles.headerButton, { marginRight: 8 }]}><Share2 size={22} color={Colors.dark.text} /></TouchableOpacity>
              <TouchableOpacity onPress={handleSettings} style={styles.headerButton}><Settings size={22} color={Colors.dark.text} /></TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.dark.tint} />}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar source={displayUser.profileImage} name={displayUser.name} size={80} showBorder />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{displayUser.name}</Text>
              <TouchableOpacity onPress={handleEditProfile}><Edit2 size={16} color={Colors.dark.subtext} /></TouchableOpacity>
            </View>
            <Text style={styles.userBio}>{displayUser.headline || "Add a headline to your profile!"}</Text>
            <View style={styles.metadataContainer}>
              {displayUser.location && <View style={styles.locationContainer}><MapPin size={14} color={Colors.dark.subtext} /><Text style={styles.locationText}>{displayUser.location}</Text></View>}
              {displayUser.joinedDate && <View style={styles.joinedContainer}><Calendar size={14} color={Colors.dark.subtext} /><Text style={styles.joinedText}>Joined {new Date(displayUser.joinedDate).toLocaleDateString()}</Text></View>}
            </View>
          </View>
        </View>
        <View style={styles.actionButtonsContainer}>
          <View style={styles.profileViewsCard}>
            <BarChart2 size={20} color={Colors.dark.text} />
            <Text style={styles.profileViewsNumber}>{displayUser.profileViews || 0}</Text>
            <Text style={styles.profileViewsText}>Profile Views</Text>
          </View>
          <View style={styles.actionButtons}>
            <View style={styles.followStatsContainer}>
              <TouchableOpacity style={styles.followStatButton} onPress={() => router.push('/profile/followers')}><Text style={styles.followStatNumber}>{displayUser.followers || 0}</Text><Text style={styles.followStatLabel}>Followers</Text></TouchableOpacity>
              <TouchableOpacity style={styles.followStatButton} onPress={() => router.push('/profile/following')}><Text style={styles.followStatNumber}>{displayUser.following || 0}</Text><Text style={styles.followStatLabel}>Following</Text></TouchableOpacity>
            </View>
          </View>
        </View>
        <TabBar
          tabs={[{ id: 'about', label: 'About' }, { id: 'portfolio', label: 'Portfolio' }, { id: 'posts', label: 'Posts' }, { id: 'replies', label: 'Replies' }, { id: 'ideas', label: 'Ideas' }]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollable
          style={styles.tabBar}
        />
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  headerButton: { padding: 8, marginRight: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.dark.text, fontSize: 16, marginTop: 10 },
  scrollView: { flex: 1 },
  profileSection: { padding: 16, flexDirection: 'row', alignItems: 'flex-start' },
  avatarContainer: { position: 'relative', marginRight: 16 },
  profileInfo: { flex: 1 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  userName: { color: Colors.dark.text, fontSize: 22, fontWeight: 'bold' },
  userBio: { color: Colors.dark.text, fontSize: 14, marginBottom: 8 },
  metadataContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  locationText: { color: Colors.dark.subtext, fontSize: 12, marginLeft: 4 },
  joinedContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  joinedText: { color: Colors.dark.subtext, fontSize: 12, marginLeft: 4 },
  actionButtonsContainer: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  profileViewsCard: { backgroundColor: Colors.dark.card, borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, width: 100 },
  profileViewsNumber: { color: Colors.dark.text, fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  profileViewsText: { color: Colors.dark.subtext, fontSize: 12, textAlign: 'center', marginTop: 4 },
  actionButtons: { flex: 1 },
  followStatsContainer: { flexDirection: 'row', backgroundColor: Colors.dark.card, borderRadius: 12, padding: 8, flex: 1 },
  followStatButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  followStatNumber: { color: Colors.dark.text, fontSize: 16, fontWeight: 'bold' },
  followStatLabel: { color: Colors.dark.subtext, fontSize: 12, marginTop: 2 },
  tabBar: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  tabContent: { padding: 16 },
  aboutSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aboutSectionTitle: { color: Colors.dark.text, fontSize: 18, fontWeight: '600' },
  addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.dark.card, justifyContent: 'center', alignItems: 'center' },
  summaryText: { color: Colors.dark.text, fontSize: 14, lineHeight: 20 },
  emptySection: { backgroundColor: Colors.dark.card, borderRadius: 8, padding: 16, alignItems: 'center' },
  emptySectionText: { color: Colors.dark.subtext, fontSize: 14, textAlign: 'center' },
  experienceItem: { flexDirection: 'row', marginBottom: 16 },
  experienceContent: { marginLeft: 12, flex: 1 },
  experienceRole: { color: Colors.dark.text, fontSize: 16, fontWeight: '500' },
  experienceCompany: { color: Colors.dark.text, fontSize: 14 },
  educationItem: { flexDirection: 'row', marginBottom: 16 },
  educationContent: { marginLeft: 12, flex: 1 },
  educationDegree: { color: Colors.dark.text, fontSize: 16, fontWeight: '500' },
  educationInstitution: { color: Colors.dark.text, fontSize: 14 },
  emptyStateContainer: { padding: 20, alignItems: 'center' },
  emptyStateText: { color: Colors.dark.subtext },
  emptyStateSubtext: { color: Colors.dark.subtext, fontSize: 12, marginTop: 8, textAlign: 'center' },
  emptyStateButton: { width: '80%', marginTop: 12 },
  repliesTabContent: { paddingHorizontal: 8, paddingVertical: 12 },
  repliesContainer: { gap: 8 },
});

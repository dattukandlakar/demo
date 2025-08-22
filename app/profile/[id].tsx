// app/profile/[id].tsx

import React, { useState, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  Linking,
  Alert,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Edit2,
  MapPin,
  Briefcase,
  GraduationCap,
  Settings,
  Calendar,
  BarChart2,
  Plus,
  Share2,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Github,
  ExternalLink,
  Edit
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import TabBar from '@/components/ui/TabBar';
import PostCard from '@/components/home/PostCard';
import ShowcaseCard from '@/components/showcase/ShowcaseCard';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import Avatar from '@/components/ui/Avatar';
import { ProfileHeaderSkeleton, ProfileContentSkeleton } from '@/components/ui/SkeletonLoader';
import { useAuthStore } from '@/store/auth-store';
import { useShowcaseStore } from '@/store/showcase-store';
import { Post, ShowcaseEntry, User as UserType } from '@/types';
import Colors from '@/constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import { useFollowStore } from '@/store/follow-store';
import { useUserCommentsStore } from '@/store/user-comments-store';
import { findOrCreateConversation } from '@/api/conversation';
import useProfileData from '@/hooks/useProfileData';
import UserReply from '@/components/ui/UserReply';

// Memoized tab content component to prevent unnecessary re-renders
const TabContent = memo<{ tab: string; user: UserType | null; posts: any[]; showcases: any[]; portfolioItems: any[]; isOwnProfile: boolean; onNavigation: (path: string) => void; onDeleteShowcase?: (showcase: any) => void }>(({ tab, user, posts, showcases, portfolioItems, isOwnProfile, onNavigation, onDeleteShowcase }) => {
  const handlePortfolioItemPress = useCallback((item: any) => {
    if (item.links && item.links.length > 0) {
      const firstLink = item.links[0];
      if (firstLink.url) {
        Linking.openURL(firstLink.url).catch(() => {
          Alert.alert("Error", "Couldn't open this link");
        });
      }
    }
  }, []);

  const handleEditPortfolioItem = useCallback((item: any) => {
    onNavigation(`/portfolio/create?editItem=${JSON.stringify(item)}`);
  }, [onNavigation]);

  const handleDeletePortfolioItem = useCallback((item: any) => {
    console.log('Delete portfolio item:', item.id);
  }, []);

  const handleEditProfile = useCallback(() => {
    onNavigation('/profile/edit');
  }, [onNavigation]);

  switch (tab) {
    case 'about':
      return (
        <View style={styles.tabContent}>
          <View style={styles.aboutSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.aboutSectionTitle}>Profile Summary</Text>
              {isOwnProfile && (
                <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                  <Plus size={20} color={Colors.dark.primary} />
                </TouchableOpacity>
              )}
            </View>
            {user?.bio ? (
              <Text style={styles.summaryText}>{user.bio}</Text>
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  {isOwnProfile ? "Add your profile summary" : "No profile summary available"}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.aboutSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.aboutSectionTitle}>Experience</Text>
              {isOwnProfile && (
                <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                  <Plus size={20} color={Colors.dark.primary} />
                </TouchableOpacity>
              )}
            </View>
            {user?.experience && user.experience.length > 0 ? (
              user.experience.map((exp: any, index: number) => (
                <View key={exp.id || index} style={styles.experienceItem}>
                  <Briefcase size={20} color={Colors.dark.tint} />
                  <View style={styles.experienceContent}>
                    <Text style={styles.experienceRole}>{exp.position}</Text>
                    <Text style={styles.experienceCompany}>{exp.company}</Text>
                    <Text style={styles.experienceDuration}>
                      {exp.startDate?.substring(0,10) || 'Start'} - {exp.current ? 'Present' : (exp.endDate?.substring(0,10) || 'End')}
                    </Text>
                    {exp.description && (
                      <Text style={styles.experienceDescription}>{exp.description}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  {isOwnProfile ? "Add your work experience" : "No experience listed"}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.aboutSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.aboutSectionTitle}>Education</Text>
              {isOwnProfile && (
                <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                  <Plus size={20} color={Colors.dark.primary} />
                </TouchableOpacity>
              )}
            </View>
            {user?.education && user.education.length > 0 ? (
              user.education.map((edu: any, index: number) => (
                <View key={edu.id || index} style={styles.educationItem}>
                  <GraduationCap size={20} color={Colors.dark.tint} />
                  <View style={styles.educationContent}>
                    <Text style={styles.educationDegree}>
                      {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                    </Text>
                    <Text style={styles.educationInstitution}>{edu.name}</Text>
                    <Text style={styles.educationYears}>
                      {edu?.startDate?.substring(0,10) || 'Start'} to {edu.current ? 'Present' : (edu?.endDate?.substring(0,10) || 'End')}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  {isOwnProfile ? "Add your education" : "No education listed"}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.aboutSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.aboutSectionTitle}>Skills</Text>
              {isOwnProfile && (
                <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                  <Plus size={20} color={Colors.dark.primary} />
                </TouchableOpacity>
              )}
            </View>
            {user?.skills && user.skills.length > 0 ? (
              <View style={styles.skillsContainer}>
                {user.skills.map((skill: string, index: number) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  {isOwnProfile ? "Add your skills" : "No skills listed"}
                </Text>
              </View>
            )}
          </View>
          
          {(user?.phone || user?.email || user?.website) && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutSectionTitle}>Contact Information</Text>
              {user.email && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactText}>{user.email}</Text>
                </View>
              )}
              {user.phone && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactText}>{user.phone}</Text>
                </View>
              )}
              {user.website && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactText}>{user.website}</Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.careerIllustration}>
            <Briefcase size={60} color={Colors.dark.primary} style={{ opacity: 0.2 }} />
            <Text style={styles.careerIllustrationText}>
              Start adding your experience to validate
            </Text>
          </View>
        </View>
      );
      
    case 'portfolio':
      return (
        <View style={styles.tabContent}>
          <PortfolioGrid
            items={portfolioItems}
            onItemPress={handlePortfolioItemPress}
            onCreatePress={() => onNavigation('/portfolio/create')}
            onEditItem={handleEditPortfolioItem}
            onDeleteItem={handleDeletePortfolioItem}
            showActions={!!isOwnProfile}
          />
        </View>
      );
      
    case 'ideas':
      return (
        <View style={styles.tabContent}>
          {showcases.length > 0 ? (
            showcases.map((showcase: any) =>
              <ShowcaseCard
                key={showcase.id}
                entry={showcase}
                onPress={() => onNavigation(`/showcase/${showcase.id}?entryData=${JSON.stringify(showcase)}`)}
                onDelete={isOwnProfile ? onDeleteShowcase : undefined}
                showOwnerActions={isOwnProfile}
              />
            )
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                {isOwnProfile ? "You haven't shared any ideas yet" : "No ideas shared yet"}
              </Text>
              {isOwnProfile && (
                <Button
                  title="Share an Idea"
                  onPress={() => onNavigation('/showcase/create')}
                  style={styles.emptyStateButton}
                />
              )}
            </View>
          )}
        </View>
      );
      
    case 'posts':
      return (
        <View style={styles.tabContent}>
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                onPress={() => onNavigation(`/post/${post.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                {isOwnProfile ? "You haven't created any posts yet" : "No posts available"}
              </Text>
              {isOwnProfile && (
                <Button
                  title="Create Post"
                  onPress={() => onNavigation('/post/create')}
                  style={styles.emptyStateButton}
                />
              )}
            </View>
          )}
        </View>
      );
      
    case 'replies':
      return (
        <View style={styles.tabContent}>
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              {isOwnProfile ? "You haven't replied to any posts yet" : "No replies available"}
            </Text>
            {isOwnProfile && (
              <Button
                title="Explore Posts"
                onPress={() => onNavigation('/(tabs)')}
                style={styles.emptyStateButton}
              />
            )}
          </View>
        </View>
      );
      
    default:
      return null;
  }
});

export default function UserProfileScreen() {
  const { id, userData } = useLocalSearchParams<{ id: string; userData?: string }>();
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  const { deleteEntryApi } = useShowcaseStore();
  const { userComments, isLoading: commentsLoading, fetchUserComments, refreshUserComments } = useUserCommentsStore();
  const [activeTab, setActiveTab] = useState('about');
  const { toggleFollow, isLoading, isFollowing: isFollowingUser, initializeFollowing } = useFollowStore();
  const progressValue = useRef(new Animated.Value(0)).current;
  const progressPercent = 10;
  // Debug profile ownership logic
  console.log('🔎 Profile ownership check:', {
    currentUserId: currentUser?.id,
    currentUser_id: currentUser?._id,
    profileId: id,
    hasCurrentUser: !!currentUser,
    hasId: !!id
  });
  
  const isOwnProfile = currentUser && id && (
    currentUser?.id === id || 
    currentUser?._id === id ||
    currentUser?.id === id.toString() ||
    currentUser?._id === id.toString()
  );
  
  console.log('🏠 isOwnProfile result:', isOwnProfile);
  
  // Initialize with passed user data for instant display
  const initialUserData = userData ? (() => {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.warn('Failed to parse userData:', e);
      return null;
    }
  })() : null;
  
  // Use the optimized profile data hook
  const {
    user: profileUser,
    posts: userPosts,
    showcases: userShowcases,
    portfolioItems: userPortfolioItems,
    loading,
    refreshing,
    refresh,
    smartRefresh
  } = useProfileData({
    userId: id || '',
    isOwnProfile: !!isOwnProfile,
    enableAutoRefresh: true,
  });
  
  // If we have initial data but hook hasn't loaded yet, show initial data
  const displayUser = profileUser || initialUserData;
  
  // Optimized focus effect - only use smart refresh
  useFocusEffect(
    useCallback(() => {
      smartRefresh();
      if (currentUser) {
        initializeFollowing();
      }
    }, [smartRefresh, currentUser, initializeFollowing])
  );

  // Fetch user comments when replies tab is active
  React.useEffect(() => {
    console.log('🔍 Profile replies useEffect triggered:', {
      activeTab,
      id,
      isOwnProfile,
      currentUserId: currentUser?.id,
      currentUser_id: currentUser?._id
    });
    
    if (activeTab === 'replies' && id) {
      console.log('📞 Calling fetchUserComments for userId:', id);
      fetchUserComments(id);
    }
  }, [activeTab, id, fetchUserComments, currentUser]);

  // Animate progress circle
  React.useEffect(() => {
    Animated.timing(progressValue, { 
      toValue: progressPercent / 100, 
      duration: 1000, 
      useNativeDriver: false 
    }).start();
  }, [progressValue, progressPercent]);

  const handleBack = () => router.back();


  const handleMessage = async () => {
    console.log('--- PROFILE MSG DEBUG: 1. "Message" button pressed.');
    const token = useAuthStore.getState().token;
    if (!displayUser || !token || !displayUser.id) {
      console.error('--- PROFILE MSG DEBUG: ❌ ERROR: Missing displayUser, token, or user ID.');
      Alert.alert("Error", "Cannot start a conversation. Please try again.");
      return;
    }
    console.log(`--- PROFILE MSG DEBUG: 2. Attempting to find/create conversation with user: ${displayUser.id}`);
    try {
      const response = await findOrCreateConversation(displayUser.id, token);
      console.log('--- PROFILE MSG DEBUG: 3. Received API response:', JSON.stringify(response, null, 2));
      if (response.success && response.body) {
        const conversation = response.body;
        const otherUser = conversation.participants.find((p: any) => p._id !== currentUser?.id);
        const navigationParams = {
          pathname: `/messages/${conversation._id}`,
          params: {
            otherUserName: otherUser?.name || 'Chat',
            otherUserAvatar: otherUser?.profileImage || ''
          },
        };
        console.log('--- PROFILE MSG DEBUG: 4. Success! Navigating to chat screen with params:', navigationParams);
        router.push(navigationParams as any);
      } else {
        throw new Error(response.message || "API response was not successful or body is missing.");
      }
    } catch (error: any) {
      console.error("--- PROFILE MSG DEBUG: ❌ ERROR starting conversation:", error.message);
      Alert.alert("Error", "Could not start a new conversation at this time.");
    }
  };

  const handlePostPress = (post: Post) => {
    router.push(`/post/${post.id}`);
  };

  const handleShowcasePress = (showcase: ShowcaseEntry) => {
    router.push({
      pathname: `/showcase/${showcase.id}` as any,
      params: {
        entryData: JSON.stringify(showcase)
      }
    });
  };

  const handlePortfolioItemPress = (item: any) => {
    if (item.links && item.links.length > 0) {
      const firstLink = item.links[0];
      if (firstLink.url) {
        Linking.openURL(firstLink.url).catch(err => {
          Alert.alert("Error", "Couldn't open this link");
        });
      }
    }
  };

  const handleEditPortfolioItem = (item: any) => {
    router.push({
      pathname: '/portfolio/create',
      params: { editItem: JSON.stringify(item) }
    });
  };

  const handleDeletePortfolioItem = (item: any) => {
    console.log('Delete portfolio item:', item.id);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSocialLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      Alert.alert("Error", "Couldn't open this link");
    });
  };

  const handleViewFollowers = () => {
    // Pass the profile user's ID so we show their followers, not the logged-in user's
    const targetUserId = isOwnProfile ? undefined : profileUser?.id;
    const route = targetUserId ? `/profile/followers?userId=${targetUserId}` : '/profile/followers';
    router.push(route);
  };

  const handleViewFollowing = () => {
    // Pass the profile user's ID so we show their following, not the logged-in user's
    const targetUserId = isOwnProfile ? undefined : profileUser?.id;
    const route = targetUserId ? `/profile/following?userId=${targetUserId}` : '/profile/following';
    router.push(route);
  };

  // Handle follow/unfollow action
  const handleFollow = async () => {
    if (!profileUser?.id) return;
    if (isOwnProfile) {
      Alert.alert('Error', 'You cannot follow yourself!');
      return;
    }
    try {
      await toggleFollow(profileUser.id);
      // Refresh data after follow/unfollow
      smartRefresh();
    } catch (error) {
      console.error('Follow action failed:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share your profile with others');
  };

  const handleSettings = () => {
    router.push('/settings' as any);
  };

  const handleShareProfile = () => {
    const profileName = profileUser?.name || 'Profile';
    const message = isOwnProfile ? `Share your profile` : `Share ${profileName}'s profile`;
    Alert.alert('Share Profile', message);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.tabContent}>
            <View style={styles.aboutSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.aboutSectionTitle}>Profile Summary</Text>
                {isOwnProfile && (
                  <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                    <Plus size={20} color={Colors.dark.primary} />
                  </TouchableOpacity>
                )}
              </View>
              {profileUser?.bio ? (
                <Text style={styles.summaryText}>{profileUser.bio}</Text>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>
                    {isOwnProfile ? "Add your profile summary" : "No profile summary available"}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.aboutSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.aboutSectionTitle}>Experience</Text>
                {isOwnProfile && (
                  <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                    <Plus size={20} color={Colors.dark.primary} />
                  </TouchableOpacity>
                )}
              </View>
              {profileUser?.experience && profileUser.experience.length > 0 ? (
                profileUser.experience.map((exp, index) => (
                  <View key={exp.id || index} style={styles.experienceItem}>
                    <Briefcase size={20} color={Colors.dark.tint} />
                    <View style={styles.experienceContent}>
                      <Text style={styles.experienceRole}>{exp.position}</Text>
                      <Text style={styles.experienceCompany}>{exp.company}</Text>
                      <Text style={styles.experienceDuration}>
                        {exp.startDate?.substring(0,10) || 'Start'} - {exp.current ? 'Present' : (exp.endDate?.substring(0,10) || 'End')}
                      </Text>
                      {exp.description && (
                        <Text style={styles.experienceDescription}>{exp.description}</Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>
                    {isOwnProfile ? "Add your work experience" : "No experience listed"}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.aboutSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.aboutSectionTitle}>Education</Text>
                    {isOwnProfile && (
                        <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                            <Plus size={20} color={Colors.dark.primary} />
                        </TouchableOpacity>
                    )}
                </View>
                {profileUser?.education && profileUser.education.length > 0 ? (
                    profileUser.education.map((edu, index) => (
                        <View key={edu.id || index} style={styles.educationItem}>
                            <GraduationCap size={20} color={Colors.dark.tint} />
                            <View style={styles.educationContent}>
                                <Text style={styles.educationDegree}>
                                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                                </Text>
                                <Text style={styles.educationInstitution}>{edu.name}</Text>
                                <Text style={styles.educationYears}>
                                    {edu?.startDate?.substring(0,10) || 'Start'} to {edu.current ? 'Present' : (edu?.endDate?.substring(0,10) || 'End')}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptySection}>
                        <Text style={styles.emptySectionText}>
                            {isOwnProfile ? "Add your education" : "No education listed"}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.aboutSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.aboutSectionTitle}>Skills</Text>
                    {isOwnProfile && (
                        <TouchableOpacity style={styles.addButton} onPress={handleEditProfile}>
                            <Plus size={20} color={Colors.dark.primary} />
                        </TouchableOpacity>
                    )}
                </View>
                {profileUser?.skills && profileUser.skills.length > 0 ? (
                    <View style={styles.skillsContainer}>
                        {profileUser.skills.map((skill, index) => (
                            <View key={index} style={styles.skillChip}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptySection}>
                        <Text style={styles.emptySectionText}>
                            {isOwnProfile ? "Add your skills" : "No skills listed"}
                        </Text>
                    </View>
                )}
            </View>
            {(profileUser?.phone || profileUser?.email || profileUser?.website) && (
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Contact Information</Text>
                {profileUser.email && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactText}>{profileUser.email}</Text>
                  </View>
                )}
                {profileUser.phone && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactText}>{profileUser.phone}</Text>
                  </View>
                )}
                {profileUser.website && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactText}>{profileUser.website}</Text>
                  </View>
                )}
              </View>
            )}
            <View style={styles.careerIllustration}>
              <Briefcase size={60} color={Colors.dark.primary} style={{ opacity: 0.2 }} />
              <Text style={styles.careerIllustrationText}>
                Start adding your experience to validate
              </Text>
            </View>
          </View>
        );
      case 'portfolio':
        return (
          <View style={styles.tabContent}>
            <PortfolioGrid
              items={userPortfolioItems}
              onItemPress={handlePortfolioItemPress}
              onCreatePress={() => router.push('/portfolio/create')}
              onEditItem={handleEditPortfolioItem}
              onDeleteItem={handleDeletePortfolioItem}
              showActions={!!isOwnProfile}
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
                  onPress={() => handleShowcasePress(showcase)}
                  onDelete={isOwnProfile ? handleDeleteShowcase : undefined}
                  showOwnerActions={isOwnProfile}
                />
              )
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  {isOwnProfile ? "You haven't shared any ideas yet" : "No ideas shared yet"}
                </Text>
                {isOwnProfile && (
                  <Button
                    title="Share an Idea"
                    onPress={() => router.push('/showcase/create')}
                    style={styles.emptyStateButton}
                  />
                )}
              </View>
            )}
          </View>
        );
      case 'posts':
        return (
          <View style={styles.tabContent}>
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPress={() => handlePostPress(post)}
                />
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  {isOwnProfile ? "You haven't created any posts yet" : "No posts available"}
                </Text>
                {isOwnProfile && (
                  <Button
                    title="Create Post"
                    onPress={() => router.push('/post/create')}
                    style={styles.emptyStateButton}
                  />
                )}
              </View>
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
                <Text style={styles.emptyStateText}>
                  {isOwnProfile ? "You haven't replied to any posts yet" : "No replies available"}
                </Text>
                {isOwnProfile && (
                  <Button
                    title="Explore Posts"
                    onPress={() => router.push('/(tabs)')}
                    style={styles.emptyStateButton}
                  />
                )}
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Profile",
            headerStyle: {
              backgroundColor: Colors.dark.background,
            } as any,
            headerTitleStyle: {
              color: Colors.dark.text,
              fontSize: 18,
              fontWeight: '600',
            },
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <ArrowLeft size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getSocialIcon = (platform: string) => {
    const iconSize = 20;
    switch (platform) {
      case 'linkedin':
        return <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174857.png' }} style={{ width: iconSize, height: iconSize }} />;
      case 'twitter':
        return <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733579.png' }} style={{ width: iconSize, height: iconSize }} />;
      case 'instagram':
        return <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174855.png' }} style={{ width: iconSize, height: iconSize }} />;
      case 'facebook':
        return <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174848.png' }} style={{ width: iconSize, height: iconSize }} />;
      case 'github':
        return <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/25/25231.png' }} style={{ width: iconSize, height: iconSize }} />;
      default:
        return <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' }} style={{ width: iconSize, height: iconSize }} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Profile",
          headerStyle: { backgroundColor: Colors.dark.background } as any,
          headerTitleStyle: { color: Colors.dark.text, fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              {isOwnProfile ? (
                <>
                  <TouchableOpacity onPress={handleShare} style={[styles.headerButton, { marginRight: 8 }]}>
                    <Share2 size={22} color={Colors.dark.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSettings} style={styles.headerButton}>
                    <Settings size={22} color={Colors.dark.text} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={handleShareProfile} style={styles.headerButton}>
                  <Share2 size={22} color={Colors.dark.text} />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || commentsLoading}
            onRefresh={() => {
              refresh();
              if (activeTab === 'replies' && id) {
                refreshUserComments(id);
              }
            }}
            tintColor={Colors.dark.primary}
            colors={[Colors.dark.primary]}
          />
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar source={profileUser.avatar} name={profileUser.name} size={80} showBorder />
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>10%</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{profileUser.name}</Text>
              {isOwnProfile && (
                <TouchableOpacity onPress={handleEditProfile}>
                  <Edit2 size={16} color={Colors.dark.subtext} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.userBio}>{isOwnProfile ? (profileUser.headline || "Welcome to my profile!") : profileUser.bio}</Text>
            <View style={styles.metadataContainer}>
              {profileUser.location && (
                <View style={styles.locationContainer}>
                  <MapPin size={14} color={Colors.dark.subtext} />
                  <Text style={styles.locationText}>{profileUser.location}</Text>
                </View>
              )}
              {profileUser.joinedDate && (
                <View style={styles.joinedContainer}>
                  <Calendar size={14} color={Colors.dark.subtext} />
                  <Text style={styles.joinedText}>Joined {profileUser.joinedDate}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {profileUser.socialLinks && profileUser.socialLinks.length > 0 && (
          <View style={styles.socialLinksContainer}>
            {profileUser.socialLinks.map((link, index) => (
              <TouchableOpacity key={index} style={styles.socialIconButton} onPress={() => {}}>
                {getSocialIcon(link.platform)}
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.profileViewsCard}>
            <BarChart2 size={20} color={Colors.dark.text} />
            <Text style={styles.profileViewsNumber}>{profileUser.profileViews}</Text>
            <Text style={styles.profileViewsText}>Profile Views</Text>
          </View>
          <View style={styles.actionButtons}>
            {isOwnProfile ? (
              <View style={styles.followStatsContainer}>
                <TouchableOpacity style={styles.followStatButton} onPress={handleViewFollowers}>
                  <Text style={styles.followStatNumber}>{profileUser.followers || 0}</Text>
                  <Text style={styles.followStatLabel}>Followers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.followStatButton} onPress={handleViewFollowing}>
                  <Text style={styles.followStatNumber}>{profileUser.following || 0}</Text>
                  <Text style={styles.followStatLabel}>Following</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.otherUserContainer}>
                <View style={styles.otherUserFollowStats}>
                  <TouchableOpacity style={styles.otherUserStatButton} onPress={handleViewFollowers}>
                    <Text style={styles.followStatNumber}>{profileUser.followers || 0}</Text>
                    <Text style={styles.followStatLabel}>Followers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.otherUserStatButton} onPress={handleViewFollowing}>
                    <Text style={styles.followStatNumber}>{profileUser.following || 0}</Text>
                    <Text style={styles.followStatLabel}>Following</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.otherUserActionButtons}>
                  <Button
                    title={isFollowingUser(profileUser?.id || '') ? "Following" : "Follow"}
                    onPress={handleFollow}
                    style={styles.otherUserFollowButton}
                    variant={isFollowingUser(profileUser?.id || '') ? "outline" : "primary"}
                    gradient={!isFollowingUser(profileUser?.id || '')}
                    disabled={isLoading}
                  />
                  <Button
                    title="Message"
                    onPress={handleMessage}
                    variant="outline"
                    style={styles.otherUserMessageButton}
                    leftIcon={<MessageSquare size={16} color={Colors.dark.text} />}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        <TabBar
          tabs={[
            { id: 'about', label: 'About' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'posts', label: 'Posts' },
            { id: 'replies', label: 'Replies' },
            { id: 'ideas', label: 'Ideas' },
          ]}
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
  backButton: { padding: 8 },
  editButton: { padding: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.dark.text, fontSize: 16 },
  scrollView: { flex: 1 },
  profileSection: { padding: 16, flexDirection: 'row', alignItems: 'flex-start' },
  avatarContainer: { position: 'relative', marginRight: 16 },
  progressCircle: { position: 'absolute', top: -5, right: -5, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.dark.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.dark.background },
  progressText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  headerButton: { padding: 8, marginRight: 8 },
  profileInfo: { flex: 1 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  userName: { color: Colors.dark.text, fontSize: 22, fontWeight: 'bold' },
  userBio: { color: Colors.dark.text, fontSize: 14, marginBottom: 8 },
  metadataContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  locationText: { color: Colors.dark.subtext, fontSize: 12, marginLeft: 4 },
  joinedContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  joinedText: { color: Colors.dark.subtext, fontSize: 12, marginLeft: 4 },
  socialLinksContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.dark.border, marginHorizontal: 16 },
  socialIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.card, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  actionButtonsContainer: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  profileViewsCard: { backgroundColor: Colors.dark.card, borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, width: 80 },
  profileViewsNumber: { color: Colors.dark.text, fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  profileViewsText: { color: Colors.dark.subtext, fontSize: 12, textAlign: 'center', marginTop: 4 },
  actionButtons: { flex: 1 },
  otherUserContainer: { flex: 1 },
  followStatsContainer: { flexDirection: 'row', backgroundColor: Colors.dark.card, borderRadius: 12, padding: 8, marginBottom: 8 },
  otherUserFollowStats: { flexDirection: 'row', backgroundColor: Colors.dark.card, borderRadius: 12, padding: 12, marginBottom: 16 },
  followStatButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  otherUserStatButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  followStatNumber: { color: Colors.dark.text, fontSize: 16, fontWeight: 'bold' },
  followStatLabel: { color: Colors.dark.subtext, fontSize: 12, marginTop: 2 },
  otherUserActionButtons: { flexDirection: 'row', gap: 12 },
  otherUserFollowButton: { flex: 1, height: 44 },
  otherUserMessageButton: { flex: 1, height: 44 },
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
  experienceRole: { color: Colors.dark.text, fontSize: 16, fontWeight: '500', marginBottom: 2 },
  experienceCompany: { color: Colors.dark.text, fontSize: 14, marginBottom: 2 },
  experienceDuration: { color: Colors.dark.subtext, fontSize: 12 },
  experienceDescription: { color: Colors.dark.text, fontSize: 14, lineHeight: 20 },
  educationItem: { flexDirection: 'row', marginBottom: 16 },
  educationContent: { marginLeft: 12, flex: 1 },
  educationDegree: { color: Colors.dark.text, fontSize: 16, fontWeight: '500', marginBottom: 2 },
  educationInstitution: { color: Colors.dark.text, fontSize: 14, marginBottom: 2 },
  educationYears: { color: Colors.dark.subtext, fontSize: 12 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: { backgroundColor: Colors.dark.card, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 100, marginRight: 8, marginBottom: 8 },
  skillText: { color: Colors.dark.text, fontSize: 14 },
  contactItem: { marginBottom: 10 },
  contactText: { color: Colors.dark.text },
  careerIllustration: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  careerIllustrationText: { color: Colors.dark.subtext, marginTop: 12, fontSize: 14 },
  emptyStateContainer: { backgroundColor: Colors.dark.card, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16 },
  emptyStateText: { color: Colors.dark.subtext, textAlign: 'center', marginBottom: 16 },
  emptyStateButton: { width: '80%' },
  repliesTabContent: { paddingHorizontal: 8, paddingVertical: 12 },
  repliesContainer: { gap: 8 },
});

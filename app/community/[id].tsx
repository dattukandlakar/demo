import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Bell, 
  Settings, 
  Plus,
  MapPin,
  Clock,
  Tag,
  X,
  Globe,
  Lock,
  MessageSquare,
  Heart,
  Share,
  FileText,
  ExternalLink,
  Download,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Bookmark
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useCommunityStore } from '@/store/community-store';
import type { Community } from '@/store/community-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    communities, 
    joinedCommunities,
    joinCommunity, 
    leaveCommunity, 
    createEvent,
    createPost,
    likePost,
    addComment,
    joinEvent,
    leaveEvent,
    addResource,
    createAnnouncement
  } = useCommunityStore();
  const { user } = useAuthStore();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [sortBy, setSortBy] = useState('best');
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [createAnnouncementModalVisible, setCreateAnnouncementModalVisible] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Form states for post creation
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'question' | 'poll' | 'resource'>('text');
  
  // Form states for announcement creation
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');

  useEffect(() => {
    if (id) {
      const foundCommunity = communities.find(c => c.id === id);
      if (foundCommunity) {
        setCommunity(foundCommunity);
      }
    }
  }, [id, communities]);

  const handleBack = () => {
    router.back();
  };

  const handleJoinCommunity = () => {
    if (user && community) {
      joinCommunity(community.id, user.id);
    }
  };

  const handleLeaveCommunity = () => {
    if (user && community) {
      leaveCommunity(community.id, user.id);
    }
  };
  
  const handleCreatePost = () => {
    if (!community || !user || !postContent.trim()) {
      Alert.alert('Error', 'Please enter post content');
      return;
    }
    
    createPost(community.id, {
      communityId: community.id,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      content: postContent.trim(),
      type: postType
    });
    
    setPostContent('');
    setPostType('text');
    setCreatePostModalVisible(false);
  };
  
  const handleCreateAnnouncement = () => {
    if (!community || !user || !announcementTitle.trim() || !announcementContent.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    createAnnouncement(community.id, {
      communityId: community.id,
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
      createdBy: user.id
    });
    
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setCreateAnnouncementModalVisible(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const isUserMember = () => {
    return user && community && community.members.includes(user.id);
  };

  const isUserAdmin = () => {
    return user && community && community.admins.includes(user.id);
  };

  const getOnlineCount = () => {
    // Mock online count - in real app this would come from API
    return Math.floor(community?.memberCount ? community.memberCount * 0.05 : 0);
  };

  const getSortedPosts = () => {
    if (!community) return [];
    
    let posts = [...community.posts];
    
    switch (sortBy) {
      case 'best':
        return posts.sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length));
      case 'new':
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'top':
        return posts.sort((a, b) => b.likes.length - a.likes.length);
      default:
        return posts;
    }
  };

  if (!community) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: 'Community',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            ),
          }} 
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading community...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: { backgroundColor: Colors.dark.background },
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <MoreHorizontal size={22} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
        {/* Community Header */}
        <View style={styles.communityHeader}>
          <View style={styles.communityBanner}>
            <Image 
              source={{ uri: community.coverImage }} 
              style={styles.bannerImage} 
            />
          </View>
          
          <View style={styles.communityInfo}>
            <View style={styles.communityTitleRow}>
              <View style={styles.communityIconContainer}>
                <Text style={styles.communityIcon}>{community.icon}</Text>
              </View>
              <View style={styles.communityDetails}>
                <Text style={styles.communityName}>r/{community.name}</Text>
                <View style={styles.communityStats}>
                  <Text style={styles.memberCount}>
                    {community.memberCount.toLocaleString()} members
                  </Text>
                  <View style={styles.onlineIndicator} />
                  <Text style={styles.onlineCount}>
                    {getOnlineCount()} online
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              {isUserMember() && (
                <Button
                  title="Create Post"
                  onPress={() => setCreatePostModalVisible(true)}
                  size="small"
                  style={styles.createPostButton}
                />
              )}
              
              <Button
                title={isUserMember() ? "Joined" : "Join"}
                onPress={isUserMember() ? handleLeaveCommunity : handleJoinCommunity}
                variant={isUserMember() ? "outline" : "primary"}
                size="small"
                style={styles.joinButton}
              />
            </View>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.navigationContainer}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
              onPress={() => setActiveTab('feed')}
            >
              <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
                Feed
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                About
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'feed' && (
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setShowSortDropdown(!showSortDropdown)}
              >
                <Text style={styles.sortText}>
                  {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Text>
                <ChevronDown size={16} color={Colors.dark.text} />
              </TouchableOpacity>
              
              {showSortDropdown && (
                <View style={styles.sortDropdown}>
                  {['best', 'new', 'top'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.sortOption}
                      onPress={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.sortOptionText,
                        sortBy === option && styles.sortOptionTextActive
                      ]}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Content */}
        {activeTab === 'feed' && (
          <View style={styles.feedContainer}>
            {/* Community Highlights */}
            {community.announcements.length > 0 && (
              <View style={styles.highlightsSection}>
                <Text style={styles.highlightsTitle}>Community highlights</Text>
                {community.announcements.slice(0, 1).map(announcement => (
                  <TouchableOpacity key={announcement.id} style={styles.highlightCard}>
                    <Text style={styles.highlightTitle}>{announcement.title}</Text>
                    <Text style={styles.highlightSubtitle}>
                      {announcement.content.length > 100 
                        ? announcement.content.substring(0, 100) + '...'
                        : announcement.content
                      }
                    </Text>
                    <Badge label="Announcement" variant="primary" size="small" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Posts Feed */}
            <View style={styles.postsContainer}>
              {getSortedPosts().length > 0 ? (
                getSortedPosts().map(post => (
                  <View key={post.id} style={styles.postCard}>
                    <View style={styles.postHeader}>
                      <Avatar 
                        source={post.authorAvatar} 
                        name={post.authorName} 
                        size={32} 
                      />
                      <View style={styles.postAuthorInfo}>
                        <Text style={styles.postAuthorName}>u/{post.authorName}</Text>
                        <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
                      </View>
                      <TouchableOpacity style={styles.postMenuButton}>
                        <MoreHorizontal size={16} color={Colors.dark.subtext} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.postContent}>{post.content}</Text>
                    
                    {/* Mock image for demonstration */}
                    {Math.random() > 0.7 && (
                      <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' }}
                        style={styles.postImage}
                      />
                    )}
                    
                    <View style={styles.postActions}>
                      <View style={styles.voteContainer}>
                        <TouchableOpacity 
                          style={styles.voteButton}
                          onPress={() => user && likePost(post.id, user.id)}
                        >
                          <ArrowUp 
                            size={18} 
                            color={post.likes.includes(user?.id || '') ? Colors.dark.primary : Colors.dark.subtext}
                          />
                        </TouchableOpacity>
                        <Text style={styles.voteCount}>
                          {post.likes.length > 0 ? post.likes.length : '•'}
                        </Text>
                        <TouchableOpacity style={styles.voteButton}>
                          <ArrowDown size={18} color={Colors.dark.subtext} />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity style={styles.actionButton}>
                        <MessageSquare size={18} color={Colors.dark.subtext} />
                        <Text style={styles.actionText}>{post.comments.length}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.actionButton}>
                        <Share size={18} color={Colors.dark.subtext} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.actionButton}>
                        <Bookmark size={18} color={Colors.dark.subtext} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <MessageSquare size={40} color={Colors.dark.subtext} />
                  <Text style={styles.emptyStateText}>No posts yet</Text>
                  {isUserMember() && (
                    <Button
                      title="Create First Post"
                      onPress={() => setCreatePostModalVisible(true)}
                      style={styles.emptyStateButton}
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.aboutContainer}>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>About Community</Text>
              <Text style={styles.aboutDescription}>{community.description}</Text>
              
              {community.location && (
                <View style={styles.aboutItem}>
                  <MapPin size={16} color={Colors.dark.subtext} />
                  <Text style={styles.aboutItemText}>{community.location}</Text>
                </View>
              )}
              
              <View style={styles.aboutItem}>
                <Calendar size={16} color={Colors.dark.subtext} />
                <Text style={styles.aboutItemText}>
                  Created {new Date(community.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.tagsContainer}>
                {community.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    label={tag}
                    variant="secondary"
                    size="small"
                    style={styles.tag}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Create Post Modal */}
      <Modal
        visible={createPostModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreatePostModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setCreatePostModalVisible(false)}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.postTypeContainer}>
                <Text style={styles.postTypeLabel}>Post Type</Text>
                <View style={styles.postTypeOptions}>
                  {(['text', 'question', 'poll', 'resource'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.postTypeOption,
                        postType === type && styles.postTypeOptionActive
                      ]}
                      onPress={() => setPostType(type)}
                    >
                      <Text
                        style={[
                          styles.postTypeOptionText,
                          postType === type && styles.postTypeOptionTextActive
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TextInput
                style={styles.postTextArea}
                placeholder="What's on your mind?"
                placeholderTextColor={Colors.dark.subtext}
                value={postContent}
                onChangeText={setPostContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              
              <Button
                title="Post"
                onPress={handleCreatePost}
                disabled={!postContent.trim()}
                gradient
                style={styles.createButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Create Announcement Modal */}
      <Modal
        visible={createAnnouncementModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateAnnouncementModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Announcement</Text>
              <TouchableOpacity onPress={() => setCreateAnnouncementModalVisible(false)}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <Input
                label="Title *"
                placeholder="Announcement title"
                value={announcementTitle}
                onChangeText={setAnnouncementTitle}
              />
              
              <TextInput
                style={styles.postTextArea}
                placeholder="Announcement content"
                placeholderTextColor={Colors.dark.subtext}
                value={announcementContent}
                onChangeText={setAnnouncementContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              
              <Button
                title="Create Announcement"
                onPress={handleCreateAnnouncement}
                disabled={!announcementTitle.trim() || !announcementContent.trim()}
                gradient
                style={styles.createButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  communityHeader: {
    backgroundColor: Colors.dark.background,
  },
  communityBanner: {
    height: 120,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  communityInfo: {
    padding: 16,
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  communityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  communityIcon: {
    fontSize: 24,
  },
  communityDetails: {
    flex: 1,
  },
  communityName: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.success,
    marginHorizontal: 8,
  },
  onlineCount: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  createPostButton: {
    flex: 1,
  },
  joinButton: {
    minWidth: 80,
  },
  navigationContainer: {
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingHorizontal: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
  },
  tabText: {
    color: Colors.dark.subtext,
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  sortContainer: {
    position: 'relative',
    alignItems: 'flex-end',
    paddingBottom: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.dark.card,
    borderRadius: 6,
    gap: 4,
  },
  sortText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  sortDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortOptionText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  sortOptionTextActive: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  feedContainer: {
    flex: 1,
  },
  highlightsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  highlightsTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  highlightCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 12,
  },
  highlightTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightSubtitle: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginBottom: 8,
  },
  postsContainer: {
    flex: 1,
  },
  postCard: {
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthorInfo: {
    flex: 1,
    marginLeft: 8,
  },
  postAuthorName: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  postTime: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  postMenuButton: {
    padding: 4,
  },
  postContent: {
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  actionText: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  aboutContainer: {
    padding: 16,
  },
  aboutSection: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
  },
  aboutTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  aboutDescription: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  aboutItemText: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  tag: {
    marginRight: 0,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: Colors.dark.subtext,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateButton: {
    minWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 16,
  },
  postTypeContainer: {
    marginBottom: 16,
  },
  postTypeLabel: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  postTypeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  postTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  postTypeOptionActive: {
    backgroundColor: `${Colors.dark.tint}20`,
    borderColor: Colors.dark.tint,
  },
  postTypeOptionText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    fontWeight: '500',
  },
  postTypeOptionTextActive: {
    color: Colors.dark.tint,
  },
  postTextArea: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    color: Colors.dark.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 16,
    marginBottom: 40,
  },
});
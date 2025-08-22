// components/home/PostCard.tsx

import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Repeat2,
  Edit3,
  Trash2,
  X,
} from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar';
import ThreadsImageGallery from '@/components/ui/ThreadsImageGallery';
import FullScreenImageViewer from '@/components/ui/FullScreenImageViewer';
import { Post } from '@/types';
import { usePostStore } from '@/store/post-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { ShareBottomSheet } from '@/components/ui/ShareBottomSheet'; // --- SOLUTION 1: Import the ShareBottomSheet

const { width } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

const MAX_CONTENT_LENGTH = 150;
const CONTAINER_PADDING = 16;

// Repost content component with truncation
interface RepostContentProps {
  content: string;
  hasImages: boolean;
  styles: any;
}

const RepostContent: React.FC<RepostContentProps> = ({ content, hasImages, styles }) => {
  const [expanded, setExpanded] = useState(false);
  
  const maxLines = hasImages ? 3 : 5;
  const estimatedCharsPerLine = 40;
  const maxLength = maxLines * estimatedCharsPerLine;
  
  const shouldTruncate = content.length > maxLength;
  const displayContent = shouldTruncate && !expanded 
    ? content.substring(0, maxLength).trim() + '...'
    : content;

  return (
    <>
      <Text style={styles.repostContent}>{displayContent}</Text>
      {shouldTruncate && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.showMoreText}>
            {expanded ? 'show less' : 'show more'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const PostCard: React.FC<PostCardProps> = memo(({ post, onPress }) => {
  const router = useRouter();
  const { likePost, bookmarkPost, unlikePost, editPost, deletePost, repostPost, unrepostPost } = usePostStore();
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [menuVisible, setMenuVisible] = useState(false);

  // --- SOLUTION 2: Add state for the share bottom sheet ---
  const [isShareVisible, setIsShareVisible] = useState(false);
  const [contentToShare, setContentToShare] = useState<{ id: string; type: 'post' | 'news' } | null>(null);

  const isOwnPost = useMemo(() => user && post.author && user.id === post.author.id, [user?.id, post.author?.id]);
  const shouldTruncate = useMemo(() => post.content?.length > MAX_CONTENT_LENGTH, [post.content?.length]);
  const displayContent = useMemo(() => shouldTruncate && !expanded ? `${post.content.substring(0, MAX_CONTENT_LENGTH)}...` : post.content, [post.content, shouldTruncate, expanded]);
  const formattedDate = useMemo(() => new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), [post.createdAt]);

  const handleLike = useCallback(() => {
    post.isLiked ? unlikePost(post.id) : likePost(post.id);
  }, [post.id, post.isLiked, unlikePost, likePost]);

  const handleBookmark = useCallback(() => {
    bookmarkPost(post.id);
  }, [post.id, bookmarkPost]);
  
  const handleComment = useCallback(() => {
    router.push(`/post/${post.id}`);
  }, [router, post.id]);
  
  // --- SOLUTION 3: Update handleShare to open the bottom sheet ---
  const handleShare = useCallback(() => {
    setContentToShare({ id: post.id, type: 'post' });
    setIsShareVisible(true);
  }, [post.id]);

  const handleCloseShareSheet = () => {
    setIsShareVisible(false);
    setContentToShare(null);
  };
  
  const handleRepostPress = () => {
    if (post.isReposted) {
      // Unrepost
      unrepostPost(post.id);
    } else {
      // Navigate to create post page for repost with comment
      router.push({
        pathname: '/post/create',
        params: { repostId: post.id }
      });
    }
  };

  
  const handleViewProfile = () => {
    // Pass user data to avoid loading screen
    router.push({
      pathname: `/profile/${post.author.id}`,
      params: { userData: JSON.stringify({ id: post.author.id, name: post.author.name, avatar: post.author.avatar, bio: post.author.bio || post.author.headline }) }
    });
  };

  const handleViewPost = () => onPress ? onPress() : router.push(`/post/${post.id}`);
  const handleImagePress = (imageUri: string, index: number) => {
    setSelectedImageIndex(index);
    setFullScreenVisible(true);
  };
  const handleCloseFullScreen = () => setFullScreenVisible(false);
  const handleMoreMenu = () => setMenuVisible(true);

  const handleEditPost = () => {
    setMenuVisible(false);
    // Navigate to edit post screen with post ID
    router.push({
      pathname: '/post/edit',
      params: { id: post.id }
    });
  };

  const handleDeletePost = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePost(post.id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleViewProfile} style={styles.authorContainer}>
          <Avatar source={post?.author.avatar} size={40} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post?.author.name}</Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
        </TouchableOpacity>
        {isOwnPost && (
          <TouchableOpacity style={styles.moreButton} onPress={handleMoreMenu}>
            <MoreHorizontal size={20} color={Colors.dark.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {!post.isReposted && (
        <TouchableOpacity onPress={handleViewPost} activeOpacity={0.9}>
          <Text style={styles.content}>{displayContent}</Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={styles.showMoreText}>{expanded ? 'show less' : '...show more'}</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      )}
      {post.isReposted && post.content && (
        <TouchableOpacity onPress={handleViewPost} activeOpacity={0.9}>
          <Text style={styles.content}>{displayContent}</Text>
          {shouldTruncate && (
             <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={styles.showMoreText}>{expanded ? 'show less' : '...show more'}</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      )}

      {/* Image Gallery */}
      {Array.isArray(post.images) && post.images?.length > 0 && (
        <ThreadsImageGallery
          images={post.images}
          onImagePress={handleImagePress}
          containerPadding={CONTAINER_PADDING}
        />
      )}

      {/* Original Post for Repost */}
      {post.isReposted && post.originalPost && (
        <TouchableOpacity 
          style={styles.repostContainer}
          onPress={() => router.push(`/post/${post?.originalPost?.id}`)}
          activeOpacity={0.8}
        >
          {/* Repost indicator inside the repost container */}
          <View style={styles.repostIndicator}>
            <Repeat2 size={16} color={Colors.dark.text} />
            <Text style={styles.repostIndicatorText}>Reposted</Text>
          </View>
          
          <View style={styles.originalPostHeader}>
            <Avatar source={post.originalPost.author.avatar} size={32} />
            <View style={styles.originalPostInfo}>
              <Text style={styles.originalPostAuthor}>{post.originalPost.author.name}</Text>
              <Text style={styles.originalPostTime}>{new Date(post.originalPost.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
            </View>
          </View>
          <RepostContent 
            content={post.originalPost.content}
            hasImages={Array.isArray(post.originalPost.images) && post.originalPost.images?.length > 0}
            styles={styles}
          />
          {Array.isArray(post.originalPost.images) && post.originalPost.images?.length > 0 && (
            <ThreadsImageGallery
              images={post.originalPost.images}
              onImagePress={handleImagePress}
              containerPadding={0}
              maxImageHeight={200}
              maxWidth={width - (CONTAINER_PADDING * 2) - (12 * 2)}
            />
          )}
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart size={22} color={post?.isLiked ? Colors.dark.error : Colors.dark.text} fill={post?.isLiked ? Colors.dark.error : 'transparent'} />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <MessageCircle size={22} color={Colors.dark.text} />
          <Text style={styles.actionText}>{post?.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleRepostPress}>
          <Repeat2 size={22} color={Colors.dark.text} />
          {(post.reposts || 0) > 0 && (<Text style={styles.actionText}>{post.reposts}</Text>)}
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={handleBookmark}>
          <Bookmark size={22} color={Colors.dark.text} fill={post?.isBookmarked ? Colors.dark.text : 'transparent'} />
        </TouchableOpacity>
      </View>

      {/* Modals and Viewers */}
      {Array.isArray(post.images) && post.images?.length > 0 && (
        <FullScreenImageViewer
          visible={fullScreenVisible}
          images={post.images}
          initialIndex={selectedImageIndex}
          postId={post.id}
          likes={post.likes}
          comments={post.comments}
          isLiked={post.isLiked}
          onClose={handleCloseFullScreen}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onRepost={handleRepostPress}
        />
      )}
      

      {/* Action Sheet Modal for Edit/Delete */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHeader}>
              <View style={styles.actionSheetHandle} />
            </View>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handleEditPost}
            >
              <Edit3 size={20} color={Colors.dark.text} />
              <Text style={styles.actionText}>Edit Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionItem, styles.deleteAction]}
              onPress={handleDeletePost}
            >
              <Trash2 size={20} color={Colors.dark.error} />
              <Text style={[styles.actionText, styles.deleteText]}>Delete Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionItem, styles.cancelAction]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- SOLUTION 4: Render the bottom sheet --- */}
      <ShareBottomSheet
        visible={isShareVisible}
        onClose={handleCloseShareSheet}
        contentId={contentToShare?.id || null}
        contentType={contentToShare?.type || null}
      />
    </View>
  );
});

// Memoization comparison function for better performance
const areEqual = (prevProps: PostCardProps, nextProps: PostCardProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes === nextProps.post.likes &&
    prevProps.post.comments === nextProps.post.comments &&
    prevProps.post.isLiked === nextProps.post.isLiked &&
    prevProps.post.isBookmarked === nextProps.post.isBookmarked &&
    prevProps.post.isReposted === nextProps.post.isReposted
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: CONTAINER_PADDING,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 16,
  },
  timestamp: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    color: Colors.dark.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  showMoreText: {
    color: Colors.dark.tint,
    fontWeight: '500',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    color: Colors.dark.text,
    marginLeft: 6,
    fontSize: 14,
  },
  spacer: {
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // For safe area
  },
  actionSheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  deleteAction: {
    borderBottomWidth: 0,
  },
  cancelAction: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 8,
  },
  deleteText: {
    color: Colors.dark.error,
  },
  cancelText: {
    color: Colors.dark.subtext,
    fontSize: 16,
    fontWeight: '500',
  },
  // Repost styles
  repostIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  repostIndicatorText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  repostContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPostInfo: {
    marginLeft: 8,
  },
  originalPostAuthor: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  originalPostTime: {
    color: Colors.dark.subtext,
    fontSize: 11,
  },
  repostContent: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
  },
  repostImagesContainer: {
    marginTop: 8,
  },
});

export default memo(PostCard, areEqual);

import React, { useEffect, useState, memo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  ArrowLeft,
  Send
} from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar';
import ThreadsImageGallery from '@/components/ui/ThreadsImageGallery';
import FullScreenImageViewer from '@/components/ui/FullScreenImageViewer';
import { usePostStore } from '@/store/post-store';
import { useAuthStore } from '@/store/auth-store';
import { Post, Comment } from '@/types';
import Colors from '@/constants/colors';
import { ShareBottomSheet } from '@/components/ui/ShareBottomSheet';

const DEFAULT_AVATAR_URL = 'https://ui-avatars.com/api/?name=User&background=random';

// Define props interface for MemoizedComment
interface MemoizedCommentProps {
  comment: Comment;
  isReply?: boolean;
  expandedComments: { [key: string]: boolean };
  toggleReplies: (commentId: string) => void;
  handleLikeComment: (commentId: string) => void;
  handleReplyToComment: (commentId: string, authorName: string) => void;
  renderComment: (comment: Comment, isReply?: boolean, showExpandButton?: boolean, depth?: number) => JSX.Element;
  formatDate: (dateString: string) => string;
  styles: any;
  DEFAULT_AVATAR_URL: string;
  showExpandButton?: boolean;
  depth?: number;
}

const MAX_INDENT = 4;

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

// Memoized comment component
const MemoizedComment = memo(function MemoizedComment(props: MemoizedCommentProps) {
  const {
    comment,
    isReply = false,
    expandedComments,
    toggleReplies,
    handleLikeComment,
    handleReplyToComment,
    renderComment,
    formatDate,
    styles,
    DEFAULT_AVATAR_URL,
    showExpandButton = true,
    depth = 0,
  } = props;
  const isExpanded = expandedComments[comment.id];
  return (
    <View 
      key={comment.id} 
      style={[
        styles.commentContainer,
        isReply && styles.replyContainer,
        depth ? { marginLeft: Math.min(depth, MAX_INDENT) * 16 } : null
      ]}
    >
      <Avatar 
        source={comment.author.avatar || DEFAULT_AVATAR_URL} 
        name={comment.author.name} 
        size={36} 
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{comment.author.name}</Text>
          <Text style={styles.commentTime}>
            {formatDate(comment.createdAt)}
          </Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleLikeComment(comment.id)}
          >
            <Heart 
              size={16} 
              color={comment.isLiked ? Colors.dark.error : Colors.dark.subtext} 
              fill={comment.isLiked ? Colors.dark.error : 'transparent'} 
            />
            <Text 
              style={[
                styles.commentActionText,
                comment.isLiked && styles.commentActionTextActive
              ]}
            >
              {comment.likes > 0 ? comment.likes : ''} Like
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleReplyToComment(comment.id, comment.author.name)}
          >
            <MessageCircle size={16} color={Colors.dark.subtext} />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
        {showExpandButton && comment.replies && comment.replies.length > 0 && (
          <TouchableOpacity
            style={styles.showRepliesButton}
            onPress={() => toggleReplies(comment.id)}
          >
            <Text style={styles.showRepliesText}>
              {isExpanded ? 'Hide Replies' : `Show Replies (${comment.replies.length})`}
            </Text>
          </TouchableOpacity>
        )}
        {isExpanded && comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply: Comment) =>
              renderComment(reply, true, false, depth + 1)
            )}
          </View>
        )}
      </View>
    </View>
  );
});

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { posts, likePost, bookmarkPost, addComment, likeComment, replyToComment, fetchComments, commentsByPostId } = usePostStore();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; author: string } | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  
  // State for Share Bottom Sheet
  const [isShareVisible, setIsShareVisible] = useState(false);
  const [contentToShare, setContentToShare] = useState<{ id: string; type: 'post' | 'news' } | null>(null);

  useEffect(() => {
    const foundPost = posts.find(p => p.id === id);
    if (foundPost) {
      setPost(foundPost);
    }
    if (id) {
      fetchComments(id);
    }
  }, [id, posts, fetchComments]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleLike = () => {
    if (post) likePost(post.id);
  };

  const handleBookmark = () => {
    if (post) bookmarkPost(post.id);
  };

  const handleShare = useCallback(() => {
    if (post) {
      setContentToShare({ id: post.id, type: 'post' });
      setIsShareVisible(true);
    }
  }, [post]);

  const handleCloseShareSheet = () => {
    setIsShareVisible(false);
    setContentToShare(null);
  };

  const handleImagePress = (imageUri: string, index: number) => {
    setSelectedImageIndex(index);
    setFullScreenVisible(true);
  };

  const handleCloseFullScreen = () => {
    setFullScreenVisible(false);
  };

  const handleLikeComment = (commentId: string) => {
    if (post) likeComment(post.id, commentId);
  };

  const handleReplyToComment = (commentId: string, authorName: string) => {
    setReplyingTo({ commentId, author: authorName });
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() || !post) return;
    if (replyingTo) {
      replyToComment(post.id, replyingTo.commentId, commentText);
      setReplyingTo(null);
    } else {
      addComment(post.id, commentText);
    }
    fetchComments(id);
    setCommentText('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const renderComment = useCallback((comment: Comment, isReply = false, showExpandButton = true, depth = 0): JSX.Element => (
    <MemoizedComment
      key={comment.id}
      comment={comment}
      isReply={isReply}
      expandedComments={expandedComments}
      toggleReplies={toggleReplies}
      handleLikeComment={handleLikeComment}
      handleReplyToComment={handleReplyToComment}
      renderComment={renderComment}
      formatDate={formatDate}
      styles={styles}
      DEFAULT_AVATAR_URL={DEFAULT_AVATAR_URL}
      showExpandButton={showExpandButton}
      depth={depth}
    />
  ), [expandedComments]);

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Post',
          headerStyle: { backgroundColor: Colors.dark.background },
          headerTitleStyle: { color: Colors.dark.text, fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.contentContainer}>
        <ScrollView 
          style={[styles.scrollView, { marginBottom: keyboardHeight > 0 ? 64 : 0 }]} 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardHeight > 0 ? 20 : 100 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <View style={styles.authorContainer}>
                <Avatar source={post.author.avatar} size={40} />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{post.author.name}</Text>
                  <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={20} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.content}>{post.content}</Text>
            
            {post.isReposted && post.originalPost && (
              <TouchableOpacity 
                style={styles.repostContainer}
                onPress={() => router.push(`/post/${post?.originalPost?.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.originalPostHeader}>
                  <Avatar source={post.originalPost.author.avatar} size={32} />
                  <View style={styles.originalPostInfo}>
                    <Text style={styles.originalPostAuthor}>{post.originalPost.author.name}</Text>
                    <Text style={styles.originalPostTime}>{formatDate(post.originalPost.createdAt)}</Text>
                  </View>
                </View>
                <RepostContent 
                  content={post.originalPost.content}
                  hasImages={Array.isArray(post.originalPost.images) && post.originalPost.images?.length > 0}
                  styles={styles}
                />
                {Array.isArray(post.originalPost.images) && post.originalPost.images?.length > 0 && (
                  <View style={styles.repostImagesContainer}>
                    <ThreadsImageGallery
                      images={post.originalPost.images}
                      onImagePress={handleImagePress}
                      containerPadding={0}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )}
            
            {Array.isArray(post.images) && post.images.length > 0 && (
              <ThreadsImageGallery
                images={post.images}
                onImagePress={handleImagePress}
                containerPadding={16}
              />
            )}
            
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Heart 
                  size={22} 
                  color={post.isLiked ? Colors.dark.error : Colors.dark.text} 
                  fill={post.isLiked ? Colors.dark.error : 'transparent'} 
                />
                <Text style={styles.actionText}>{post.likes}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={22} color={Colors.dark.text} />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share2 size={22} color={Colors.dark.text} />
              </TouchableOpacity>
              
              <View style={styles.spacer} />
              
              <TouchableOpacity onPress={handleBookmark}>
                <Bookmark 
                  size={22} 
                  color={Colors.dark.text} 
                  fill={post.isBookmarked ? Colors.dark.text : 'transparent'} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            {commentsByPostId[id] && commentsByPostId[id].length > 0 ? (
              [...commentsByPostId[id]].reverse().map(comment => renderComment(comment))
            ) : (
              <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            )}
          </View>
        </ScrollView>
      </View>
      
      {replyingTo && (
        <View style={[styles.replyingToContainer, { bottom: keyboardHeight > 0 ? 64 : 0, position: keyboardHeight > 0 ? 'absolute' : 'relative', left: 0, right: 0 }]}>
          <Text style={styles.replyingToText}>
            Replying to <Text style={styles.replyingToName}>{replyingTo.author}</Text>
          </Text>
          <TouchableOpacity onPress={cancelReply}>
            <Text style={styles.cancelReplyText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[styles.commentInputContainer, { bottom: keyboardHeight > 0 ? 0 : 0, position: keyboardHeight > 0 ? 'absolute' : 'relative', left: 0, right: 0, paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 12) }]}>
        <Avatar 
          source={user?.avatar} 
          name={user?.name} 
          size={36} 
        />
        <TextInput
          style={styles.commentInput}
          placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Add a comment..."}
          placeholderTextColor={Colors.dark.subtext}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]} 
          onPress={handleSubmitComment}
          disabled={!commentText.trim()}
        >
          <Send 
            size={20} 
            color={commentText.trim() ? Colors.dark.tint : Colors.dark.subtext} 
          />
        </TouchableOpacity>
      </View>
      
      {Array.isArray(post.images) && post.images.length > 0 && (
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
          onComment={() => {}}
          onShare={handleShare}
          onRepost={() => {}}
        />
      )}

      <ShareBottomSheet
        visible={isShareVisible}
        onClose={handleCloseShareSheet}
        contentId={contentToShare?.id || null}
        contentType={contentToShare?.type || null}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
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
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  postHeader: {
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
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
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
  commentsSection: {
    padding: 16,
    paddingBottom: 100,
  },
  commentsTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  noCommentsText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginVertical: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  replyContainer: {
    marginTop: 12,
    marginLeft: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 14,
  },
  commentTime: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  commentText: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginLeft: 4,
  },
  commentActionTextActive: {
    color: Colors.dark.error,
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.card,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  replyingToText: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  replyingToName: {
    color: Colors.dark.tint,
    fontWeight: '500',
  },
  cancelReplyText: {
    color: Colors.dark.tint,
    fontWeight: '500',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    color: Colors.dark.text,
    maxHeight: 100,
    minHeight: 44,
    textAlignVertical: 'center',
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  showRepliesButton: {
    marginTop: 8,
    marginLeft: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
  },
  showRepliesText: {
    color: Colors.dark.tint,
    fontSize: 13,
    fontWeight: '500',
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
  showMoreText: {
    color: Colors.dark.tint,
    fontWeight: '500',
    fontSize: 13,
    marginTop: 4,
  },
  repostImagesContainer: {
    marginTop: 8,
  },
});
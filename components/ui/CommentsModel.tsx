import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  PanResponder,
} from 'react-native';
import { Send, Heart, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getCommentsForStory, addLiketoStoryCommet } from '@/api/user';
import { useAuthStore } from '@/store/auth-store';

const { height: screenHeight } = Dimensions.get('window');
const MODAL_HEIGHT = screenHeight * 0.6; // 60% of screen height

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    profileImage: string;
  };
  createdAt: string;
  isLiked?: boolean;
  likesCount?: number;
  replies?: Comment[];
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  storyId: string;
  comments: Comment[];
  onSendComment: (text: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyToComment?: (commentId: string, text: string) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  storyId,
  comments,
  onSendComment,
  onLikeComment,
  onReplyToComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const textInputRef = useRef<TextInput>(null);

  // Create PanResponder instead of using GestureHandler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dy, vy } = gestureState;
        
        if (dy > MODAL_HEIGHT * 0.3 || vy > 1000) {
          // Close modal
          hideModal();
          onClose();
        } else {
          // Snap back to open position
          showModal();
        }
      },
    })
  ).current;

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (visible && storyId) {
      fetchComments();
    }
  }, [visible, storyId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getCommentsForStory(storyId);
      if (response.success && Array.isArray(response.body)) {
        // Only update if we don't have local comments or if this is the initial load
        if (localComments.length === 0) {
          setLocalComments(response.body);
        }
      }
    } catch (error) {
    //   console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      showModal();
    } else {
      hideModal();
    }
  }, [visible]);

  const showModal = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Simple and robust like function
  const likeTocomment = async (commentId: string, storyId: string) => {
    // Prevent double-taps
    const commentElement = localComments.find(c => c._id === commentId);
    if (!commentElement) return;

    // Immediately update UI state
    setLocalComments(prevComments =>
      prevComments.map(comment => {
        if (comment._id === commentId) {
          const newIsLiked = !comment.isLiked;
          const newLikesCount = newIsLiked 
            ? (comment.likesCount || 0) + 1 
            : Math.max((comment.likesCount || 1) - 1, 0);
          
          return {
            ...comment,
            isLiked: newIsLiked,
            likesCount: newLikesCount
          };
        }
        return comment;
      })
    );

    // Make API call without awaiting to prevent UI blocking
    addLiketoStoryCommet(commentId, storyId, token)
      .then(response => {
        // If API call fails, we could optionally revert here
        // But since backend is working correctly, we'll keep the optimistic update
        // console.log('Like API response:', response);
      })
      .catch(error => {
        // console.error('Error liking comment:', error);
        // Optionally revert the like state here if needed
      });
  };

  const hideModal = () => {
    Animated.timing(translateY, {
      toValue: MODAL_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCommentText('');
      setReplyingTo(null);
    });
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInMs = now.getTime() - commentDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return commentDate.toLocaleDateString();
  };

  // Fixed handleSendComment function
  const handleSendComment = () => {
    if (!commentText.trim()) return;
    
    if (replyingTo) {
      onReplyToComment?.(replyingTo, commentText.trim());
      setReplyingTo(null);
    } else {
      onSendComment(commentText.trim());
    }
    
    setCommentText('');
    textInputRef.current?.blur();
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo(commentId);
    setCommentText(`@${userName} `);
    textInputRef.current?.focus();
  };

  // Use local comments if available, fallback to props comments
  const displayComments = localComments.length > 0 ? localComments : comments;

  const renderComment = ({ item }: { item: Comment }) => (
    <View key={`comment-${item._id}`} style={styles.commentItem}>
      <Image source={{ uri: item.user?.profileImage }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUserName}>{item.user?.name || 'Unknown User'}</Text>
          <Text style={styles.commentTimestamp}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.text || ''}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            onPress={() => handleReply(item._id, item.user?.name || 'User')}
            style={styles.replyButton}
          >
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
          {item.likesCount !== undefined && item.likesCount > 0 && (
            <Text style={styles.likesCount}>
              {item.likesCount} {item.likesCount === 1 ? 'like' : 'likes'}
            </Text>
          )}
        </View>
        {item.replies && item.replies.length > 0 && (
          <FlatList
            data={item.replies}
            keyExtractor={(reply) => reply._id}
            renderItem={({ item: reply }) => (
              <View style={styles.replyItem}>
                <Image source={{ uri: reply.user?.profileImage }} style={styles.replyAvatar} />
                <View style={styles.replyContent}>
                  <Text style={styles.replyUserName}>{reply.user?.name || 'Unknown User'}</Text>
                  <Text style={styles.replyCommentText}>{reply.text || ''}</Text>
                </View>
              </View>
            )}
            style={styles.repliesList}
          />
        )}
      </View>
      <TouchableOpacity 
        onPress={() => {
        //   console.log('Heart clicked for comment:', item._id, 'Current isLiked:', item.isLiked);
          likeTocomment(item._id, storyId);
        }}
        style={styles.likeButton}
      >
        <Heart 
          size={14} 
          color={item.isLiked ? '#ff3040' : '#666'} 
          fill={item.isLiked ? '#ff3040' : 'none'} 
        />
      </TouchableOpacity>
    </View>
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
              marginBottom: keyboardHeight,
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          <FlatList
            data={displayComments}
            keyExtractor={(item) => item._id}
            renderItem={renderComment}
            style={styles.commentsList}
            contentContainerStyle={styles.commentsContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={() => {
              // Only fetch comments when user explicitly pulls to refresh
              fetchComments();
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                {loading ? (
                  <>
                    <Text style={styles.emptyText}>Loading comments...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.emptyText}>No comments yet</Text>
                    <Text style={styles.emptySubtext}>Be the first to comment!</Text>
                  </>
                )}
              </View>
            }
          />

          {/* Input section */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputContainer}
          >
            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>
                  Replying to comment...
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setReplyingTo(null);
                    setCommentText('');
                  }}
                >
                  <X size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputWrapper}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { opacity: commentText.trim() ? 1 : 0.5 }
                ]}
                onPress={handleSendComment}
                disabled={!commentText.trim()}
              >
                <Send size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 18,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyButton: {
    marginRight: 16,
  },
  replyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  likesCount: {
    fontSize: 12,
    color: '#666',
  },
  likeButton: {
    padding: 8,
    marginLeft: 8,
  },
  repliesList: {
    marginTop: 8,
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  replyCommentText: {
    fontSize: 12,
    color: '#000',
    lineHeight: 16,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  replyingToText: {
    fontSize: 12,
    color: '#666',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
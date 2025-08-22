import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, MessageCircle, CornerDownRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { Comment } from '../../types';
import Colors from '../../constants/colors';
import Avatar from './Avatar';
import { useAuthStore } from '../../store/auth-store';

interface UserReplyProps {
  comment: Comment & {
    post?: {
      _id: string;
      content: string;
      author: {
        _id: string;
        name: string;
        profilePicture?: string;
      };
      createdAt: string;
    };
  };
  onPress?: () => void;
}

const CONTAINER_PADDING = 16;
const MAX_CONTENT_LENGTH = 150;

export default function UserReply({ comment, onPress }: UserReplyProps) {
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (comment.post?._id && comment.post._id !== 'unknown') {
      router.push(`/post/${comment.post._id}`);
    }
  };

  // Memoized date formatting (similar to PostCard)
  const formattedDate = useMemo(() => {
    try {
      const commentDate = new Date(comment.createdAt || new Date().toISOString());
      if (isNaN(commentDate.getTime())) {
        return 'recently';
      }
      
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'now';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
      return commentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'recently';
    }
  }, [comment.createdAt]);

  const postFormattedDate = useMemo(() => {
    if (!comment.post?.createdAt) return 'unknown';
    try {
      return new Date(comment.post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'unknown';
    }
  }, [comment.post?.createdAt]);

  const truncateText = (text: string, maxLength: number) => {
    if (!text || typeof text !== 'string') return 'No content';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Content processing (similar to PostCard)
  const commentContent = comment.content || comment.text || 'No content available';
  const shouldTruncate = useMemo(() => {
    return commentContent.length > MAX_CONTENT_LENGTH;
  }, [commentContent.length]);

  const displayContent = useMemo(() => {
    return shouldTruncate && !expanded
      ? `${commentContent.substring(0, MAX_CONTENT_LENGTH)}...`
      : commentContent;
  }, [commentContent, shouldTruncate, expanded]);

  const likesCount = Array.isArray(comment.likes) ? comment.likes.length : 0;
  const isLiked = false; // You might want to implement this based on your like system

  // Safety checks
  if (!comment) return null;

  return (
    <View style={styles.container}>
      {/* Header - Similar to PostCard header but with reply indicator */}
      <View style={styles.header}>
        <View style={styles.replyIndicator}>
          <CornerDownRight size={16} color={Colors.dark.tint} />
          <Text style={styles.replyIndicatorText}>You replied</Text>
        </View>
      </View>

      {/* Reply Content - Similar to PostCard content */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Text style={styles.content}>{displayContent}</Text>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.showMoreText}>
              {expanded ? 'show less' : '...show more'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Actions - Similar to PostCard actions but simplified */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Heart
            size={22}
            color={isLiked ? Colors.dark.error : Colors.dark.text}
            fill={isLiked ? Colors.dark.error : 'transparent'}
          />
          {likesCount > 0 && <Text style={styles.actionText}>{likesCount}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
          <MessageCircle size={22} color={Colors.dark.text} />
          <Text style={styles.actionText}>View Post</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
        
        <Text style={styles.timestamp}>{formattedDate}</Text>
      </View>

      {/* Original Post Context - Similar to PostCard repost container */}
      {comment.post && comment.post._id !== 'unknown' && (
        <TouchableOpacity 
          style={styles.postContext}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.postHeader}>
            <Avatar
              source={comment.post.author?.profilePicture}
              name={comment.post.author?.name || 'Unknown User'}
              size={32}
            />
            <View style={styles.postInfo}>
              <Text style={styles.postAuthorName}>
                {comment.post.author?.name || 'Unknown User'}
              </Text>
              <Text style={styles.postTimestamp}>{postFormattedDate}</Text>
            </View>
          </View>
          <Text style={styles.postContent}>
            {truncateText(comment.post.content || 'Post content not available', 120)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container matching PostCard
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: CONTAINER_PADDING,
    marginBottom: 16,
  },
  // Header section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyIndicatorText: {
    color: Colors.dark.tint,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  // Content section (matching PostCard content)
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
  // Actions section (matching PostCard actions)
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
  timestamp: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  // Post context (matching PostCard repost container)
  postContext: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postInfo: {
    marginLeft: 8,
  },
  postAuthorName: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  postTimestamp: {
    color: Colors.dark.subtext,
    fontSize: 11,
  },
  postContent: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
  },
});

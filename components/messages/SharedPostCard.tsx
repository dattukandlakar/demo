// components/messages/SharedPostCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import Avatar from '@/components/ui/Avatar';

// --- SOLUTION: Define interfaces for the component's props ---
interface PostData {
  _id: string;
  discription: string;
  media?: string[];
}

interface AuthorData {
  _id: string;
  name: string;
  profileImage?: string | null;
}

interface SharedPostCardProps {
  post: PostData;
  author: AuthorData | null; // Author can be null
}

const SharedPostCard: React.FC<SharedPostCardProps> = ({ post, author }) => {
  const router = useRouter();

  // If there's no post data, render nothing.
  if (!post) {
    return null;
  }

  const handlePress = () => {
    // Navigate to the specific post screen when the card is pressed.
    router.push(`/post/${post._id}`);
  };

  // --- SOLUTION: Use the correct field names from props ---
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      {/* Use `post.media` instead of `post.images` */}
      {post.media && post.media.length > 0 && (
        <Image source={{ uri: post.media[0] }} style={styles.postImage} />
      )}
      <View style={styles.postContent}>
        {/* Safely access author info using optional chaining, as it might be null */}
        {author && (
          <View style={styles.authorInfo}>
            <Avatar source={author.profileImage || undefined} size={24} />
            <Text style={styles.authorName}>{author.name}</Text>
          </View>
        )}
        {/* Use `post.discription` instead of `post.content` */}
        <Text style={styles.postText} numberOfLines={2}>{post.discription}</Text>
        <Text style={styles.viewPostText}>View Post</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  postImage: {
    width: '100%',
    height: 120,
  },
  postContent: {
    padding: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    marginLeft: 8,
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  postText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: 8,
  },
  viewPostText: {
    color: Colors.dark.primary,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
});

export default SharedPostCard;

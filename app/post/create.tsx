import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  FlatList,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  X, 
  Camera,
  Video,
  FileText,
  MapPin,
  Users,
  Globe
} from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import ThreadsImageGallery from '@/components/ui/ThreadsImageGallery';
import { useAuthStore } from '@/store/auth-store';
import { usePostStore } from '@/store/post-store';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function CreatePostScreen() {
  const router = useRouter();
  const { repostId } = useLocalSearchParams<{ repostId?: string }>();
  const { user } = useAuthStore();
  const { createPost, repostPost, getPost } = usePostStore();
  
  const [postText, setPostText] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [visibility, setVisibility] = useState('public'); // public, connections, private
  const [originalPost, setOriginalPost] = useState<any>(null);
  const [isRepost, setIsRepost] = useState(false);
  
  // Check if this is a repost and load original post
  useEffect(() => {
    if (repostId) {
      setIsRepost(true);
      const post = getPost(repostId);
      if (post) {
        setOriginalPost(post);
      }
    }
  }, [repostId, getPost]);
  
  const handleBack = () => {
    if (postText.trim() || imageUrls.length > 0) {
      Alert.alert(
        'Discard Post',
        'Are you sure you want to discard this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Don't force cropping
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add all selected images to the state
        const newImages = result.assets.map(asset => asset.uri);
        setImageUrls(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleChangeVisibility = (newVisibility: string) => {
    setVisibility(newVisibility);
  };

  const handlePost = async () => {
    if (isRepost) {
      // Handle repost
      if (!originalPost) {
        Alert.alert('Error', 'Original post not found.');
        return;
      }
      
      try {
        await repostPost(originalPost.id, postText.trim() || undefined);
        Alert.alert(
          'Repost Shared',
          'Your repost has been published successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to share repost. Please try again.');
      }
    } else {
      // Handle regular post
      if (!postText.trim() && imageUrls.length === 0) {
        Alert.alert('Empty Post', 'Please add some text or an image to your post.');
        return;
      }

      createPost({
        content: postText,
        images: imageUrls,
        "visibility" : visibility
      });

      Alert.alert(
        'Post Created',
        'Your post has been published successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: isRepost ? 'Repost' : 'Create Post',
          headerTitleStyle: {
            color: Colors.dark.text,
            fontSize: 18,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: Colors.dark.background,
          } as any,
          headerShadowVisible: false,
          headerTintColor: Colors.dark.text,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Avatar source={user.avatar} size={50} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <TouchableOpacity 
              style={styles.visibilitySelector}
              onPress={() => {
                Alert.alert(
                  'Post Visibility',
                  'Who can see your post?',
                  [
                    { 
                      text: 'Public', 
                      onPress: () => handleChangeVisibility('public') 
                    },
                    { 
                      text: 'Connections Only', 
                      onPress: () => handleChangeVisibility('connections') 
                    },
                    { 
                      text: 'Private', 
                      onPress: () => handleChangeVisibility('private') 
                    },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              {visibility === 'public' && <Globe size={16} color={Colors.dark.text} />}
              {visibility === 'connections' && <Users size={16} color={Colors.dark.text} />}
              {visibility === 'private' && <FileText size={16} color={Colors.dark.text} />}
              <Text style={styles.visibilityText}>
                {visibility === 'public' ? 'Public' : 
                 visibility === 'connections' ? 'Connections' : 'Private'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TextInput
          style={styles.postInput}
          placeholder={isRepost ? "Add a comment" : "What's on your mind?"}
          placeholderTextColor={Colors.dark.subtext}
          multiline
          value={postText}
          onChangeText={setPostText}
          autoFocus
        />
        
        {imageUrls.length > 0 && (
          <View style={styles.imagesContainer}>
            <FlatList
              data={imageUrls}
              horizontal={imageUrls.length > 1}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: item }} 
                    style={[
                      styles.postImage,
                      imageUrls.length > 1 ? styles.multipleImages : styles.singleImage
                    ]} 
                    resizeMode="contain"
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <X size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item, index) => `image-${index}`}
              contentContainerStyle={styles.imagesList}
            />
          </View>
        )}
        
        {/* Original Post Display for Repost */}
        {isRepost && originalPost && (
          <View style={styles.originalPostContainer}>
            <Text style={styles.originalPostLabel}>Reposting</Text>
            <View style={styles.originalPostCard}>
              <View style={styles.originalPostHeader}>
                <Avatar source={originalPost.author.avatar} size={40} />
                <View style={styles.originalPostAuthor}>
                  <Text style={styles.originalPostAuthorName}>{originalPost.author.name}</Text>
                  <Text style={styles.originalPostTimestamp}>
                    {new Date(originalPost.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
              <Text style={styles.originalPostContent}>{originalPost.content}</Text>
              {Array.isArray(originalPost.images) && originalPost.images?.length > 0 && (
                <ThreadsImageGallery
                  images={originalPost.images}
                  onImagePress={() => {}} // Disable image press in repost view
                  containerPadding={0}
                />
              )}
            </View>
          </View>
        )}
        
        {!isRepost && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsTitle}>Add to your post</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attachmentButtons}
          >
            <TouchableOpacity 
              style={styles.attachmentButton}
              onPress={handleAddImage}
            >
              <ImageIcon size={20} color={Colors.dark.success} />
              <Text style={styles.attachmentText}>Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.attachmentButton}>
              <Camera size={20} color={Colors.dark.error} />
              <Text style={styles.attachmentText}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.attachmentButton}>
              <Video size={20} color={Colors.dark.warning} />
              <Text style={styles.attachmentText}>Video</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.attachmentButton}>
              <FileText size={20} color={Colors.dark.info} />
              <Text style={styles.attachmentText}>Document</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.attachmentButton}>
              <MapPin size={20} color={Colors.dark.tint} />
              <Text style={styles.attachmentText}>Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.attachmentButton}>
              <Users size={20} color={Colors.dark.secondary} />
              <Text style={styles.attachmentText}>Tag People</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        )}
        
        <Button
          title={isRepost ? "Repost" : "Post"}
          onPress={handlePost}
          gradient
          style={styles.postButton}
          disabled={!isRepost && !postText.trim() && imageUrls.length === 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  visibilitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  visibilityText: {
    color: Colors.dark.text,
    fontSize: 12,
    marginLeft: 4,
  },
  postInput: {
    color: Colors.dark.text,
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  imagesContainer: {
    marginBottom: 16,
  },
  imagesList: {
    gap: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  postImage: {
    borderRadius: 12,
  },
  singleImage: {
    width: '100%',
    height: 200,
  },
  multipleImages: {
    width: width * 0.7,
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentsContainer: {
    marginBottom: 24,
  },
  attachmentsTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  attachmentButtons: {
    paddingBottom: 8,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginRight: 8,
  },
  attachmentText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 6,
  },
  postButton: {
    marginBottom: 20,
  },
  // Original post styles
  originalPostContainer: {
    marginBottom: 24,
  },
  originalPostLabel: {
    color: Colors.dark.subtext,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  originalPostCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalPostAuthor: {
    marginLeft: 12,
  },
  originalPostAuthorName: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 16,
  },
  originalPostTimestamp: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  originalPostContent: {
    color: Colors.dark.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
});

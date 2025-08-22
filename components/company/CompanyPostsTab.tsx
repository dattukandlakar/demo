import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal,
  TextInput,
  Image,
  Alert
} from 'react-native';
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  Send,
  Trash2
} from 'lucide-react-native';
import { usePostStore } from '@/store/post-store';
import { useAuthStore } from '@/store/auth-store';
import PostCard from '@/components/home/PostCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { Company } from '@/store/company-store';

interface CompanyPostsTabProps {
  company: Company;
  isOwner: boolean;
}

const CompanyPostsTab: React.FC<CompanyPostsTabProps> = ({ company, isOwner }) => {
  const { posts, createPost, isLoading } = usePostStore();
  const { user } = useAuthStore();
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  
  // Filter posts to show only company posts (in a real app, you'd have company posts)
  // For now, we'll just show the first 3 posts as a placeholder
  const companyPosts = posts.slice(0, 3);
  
  const handleCreatePost = () => {
    if (!postContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post.');
      return;
    }
    
    if (user) {
      createPost({
        author: user,
        content: postContent,
        images: postImages.length > 0 ? postImages : undefined,
        likes: 0,
        comments: [],
        isLiked: false,
      });
      
      // Reset form and close modal
      setPostContent('');
      setPostImages([]);
      setCreateModalVisible(false);
      
      Alert.alert('Success', 'Post created successfully!');
    }
  };
  
  const handleAddImage = () => {
    // In a real app, you'd use image picker here
    // For now, we'll just add a placeholder image
    const placeholderImages = [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1'
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    setPostImages([...postImages, randomImage]);
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...postImages];
    newImages.splice(index, 1);
    setPostImages(newImages);
  };
  
  return (
    <View style={styles.container}>
      {isOwner && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setCreateModalVisible(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      {companyPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              {isOwner 
                ? "Create your first post to share updates with your followers."
                : "This company hasn't posted any updates yet. Check back later!"}
            </Text>
            
            {isOwner && (
              <Button
                title="Create Post"
                onPress={() => setCreateModalVisible(true)}
                style={styles.createButton}
                leftIcon={<Plus size={18} color="#fff" />}
              />
            )}
          </Card>
        </View>
      ) : (
        <FlatList
          data={companyPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Create Post Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <TextInput
                style={styles.postInput}
                placeholder="What would you like to share?"
                placeholderTextColor={Colors.dark.subtext}
                multiline
                value={postContent}
                onChangeText={setPostContent}
                autoFocus
              />
              
              {postImages.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                  {postImages.map((image, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image source={{ uri: image }} style={styles.previewImage} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <X size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleAddImage}
                >
                  <ImageIcon size={20} color={Colors.dark.tint} />
                  <Text style={styles.actionText}>Add Image</Text>
                </TouchableOpacity>
                
                <Button
                  title="Post"
                  onPress={handleCreatePost}
                  leftIcon={<Send size={18} color="#fff" />}
                  disabled={!postContent.trim()}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emptyContainer: {
    padding: 16,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  modalContent: {
    padding: 16,
  },
  postInput: {
    minHeight: 120,
    color: Colors.dark.text,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    color: Colors.dark.tint,
    marginLeft: 8,
    fontSize: 14,
  },
});

export default CompanyPostsTab;
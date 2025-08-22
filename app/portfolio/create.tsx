import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  X,
  Camera,
  Link,
  Save,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/ui/Button';
import { usePortfolioStore, PortfolioItem } from '@/store/portfolio-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';

const PLATFORMS: { value: PortfolioItem['platform']; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'figma', label: 'Figma' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
  { value: 'website', label: 'Website' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'other', label: 'Other' },
];

const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'UI/UX Design',
  'Graphic Design',
  'Photography',
  'Video',
  'Writing',
  'Other',
];

export default function CreatePortfolioScreen() {
  const router = useRouter();
  const { editItem } = useLocalSearchParams();
  const { createPortfolioItem, updatePortfolioItem } = usePortfolioStore();
  const { user, token } = useAuthStore();

  // Parse edit item if provided
  const editData = editItem ? JSON.parse(editItem as string) : null;
  const isEditing = !!editData;

  const [title, setTitle] = useState(editData?.title || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [logoImage, setLogoImage] = useState(editData?.images?.[0] || '');
  const [link, setLink] = useState(editData?.links?.[0]?.url || '');
  const [selectedPlatform, setSelectedPlatform] = useState<PortfolioItem['platform']>(editData?.platform || 'other');
  const [selectedCategory, setSelectedCategory] = useState(editData?.category || 'Other');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleAddLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect for logo
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLogoImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };


  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!link.trim()) {
      Alert.alert('Error', 'Please enter a link');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    setIsLoading(true);

    try {
      // Create API request data matching backend specification
      const portfolioData = {
        description: description.trim(),
        title: title.trim(), // Required by backend
        logo: logoImage || undefined,
        link: link.trim(), // Required by backend
      };

      console.log('--- CREATE PORTFOLIO DEBUG: Saving portfolio with data:', portfolioData);

      let success = false;
      
      if (isEditing && editData) {
        // Update existing item via API
        success = await updatePortfolioItem(token, editData.id, portfolioData);
      } else {
        // Create new item via API
        success = await createPortfolioItem(token, portfolioData);
      }

      if (success) {
        Alert.alert(
          'Success',
          `Portfolio item ${isEditing ? 'updated' : 'created'} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // Error handling is done in the store methods
        const errorMessage = usePortfolioStore.getState().error || `Failed to ${isEditing ? 'update' : 'create'} portfolio item`;
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('--- CREATE PORTFOLIO DEBUG: Save error:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} portfolio item`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: isEditing ? 'Edit Portfolio' : 'Create Portfolio',
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: {
            color: Colors.dark.text,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.headerButton}
              disabled={isLoading}
            >
              <Save size={24} color={Colors.dark.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo Image */}
          <View style={styles.section}>
            <Text style={styles.label}>Logo Image</Text>
            <TouchableOpacity onPress={handleAddLogo} style={styles.logoContainer}>
              {logoImage ? (
                <View style={styles.logoImageContainer}>
                  <Image source={{ uri: logoImage }} style={styles.logoImage} />
                  <TouchableOpacity
                    onPress={() => setLogoImage('')}
                    style={styles.removeLogoButton}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Camera size={32} color={Colors.dark.subtext} />
                  <Text style={styles.logoPlaceholderText}>Add Logo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter portfolio title"
              placeholderTextColor={Colors.dark.subtext}
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Description * ({description.length}/30)
            </Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description (30 characters max)"
              placeholderTextColor={Colors.dark.subtext}
              maxLength={30}
            />
          </View>

          {/* Link */}
          <View style={styles.section}>
            <Text style={styles.label}>Link *</Text>
            <TextInput
              style={styles.input}
              value={link}
              onChangeText={setLink}
              placeholder="https://example.com"
              placeholderTextColor={Colors.dark.subtext}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Save Button */}
          <View style={styles.section}>
            <Button
              title={isLoading ? "Saving..." : "Save Portfolio Item"}
              onPress={handleSave}
              disabled={isLoading}
              gradient
              style={styles.saveButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  chip: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  chipText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff',
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkInput: {
    flex: 1,
    marginRight: 8,
  },
  removeLinkButton: {
    padding: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginRight: 6,
  },
  saveButton: {
    width: '100%',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeLogoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginTop: 8,
  },
});

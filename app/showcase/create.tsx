import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image,
  StatusBar,
  Platform,
  Alert,
  FlatList,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Award, 
  Upload, 
  Tag, 
  Link, 
  Plus, 
  X, 
  Lightbulb,
  Briefcase,
  FileText,
  Image as ImageIcon,
  ChevronLeft
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useShowcaseStore } from '@/store/showcase-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';

export default function CreateShowcase() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const { addEntry, updateEntry, entries } = useShowcaseStore();
  const { user } = useAuthStore();
  
  const isEditing = !!params?.editId;
  const editingEntry = isEditing ? entries.find(e => e.id === params.editId) : undefined;
  
  const [title, setTitle] = useState(editingEntry?.title || '');
  const [subtitle, setSubtitle] = useState(editingEntry?.subtitle || '');
  const [description, setDescription] = useState(editingEntry?.description || '');
  const [websiteLink, setWebsiteLink] = useState(editingEntry?.links?.website || '');
  const [tagline, setTagline] = useState(editingEntry?.tagline || '');
  const [problem, setProblem] = useState(editingEntry?.problem || '');
  const [solution, setSolution] = useState(editingEntry?.solution || '');
  const [revenueModel, setRevenueModel] = useState(editingEntry?.revenueModel || '');
  const [demoVideoLink, setDemoVideoLink] = useState(editingEntry?.links?.demoVideo || '');
  const [bannerImages, setBannerImages] = useState<string[]>(editingEntry?.bannerImages || []);
  const [logo, setLogo] = useState(editingEntry?.logo || '');
  const [tags, setTags] = useState<string[]>(editingEntry?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [images, setImages] = useState<string[]>(editingEntry?.images || []);
  const [category, setCategory] = useState(editingEntry?.category || 'app');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Character limits
  const CHARACTER_LIMITS = {
    title: 20,
    tagline: 50,
    description: 1000,
    problem: 150,
    solution: 150,
    revenueModel: 250
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Logo Upload validation
    if (!logo.trim()) newErrors.logo = 'Logo is required';
    
    // Category validation
    if (!category.trim()) newErrors.category = 'Category is required';
    
    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length > CHARACTER_LIMITS.title) newErrors.title = `Title must be ${CHARACTER_LIMITS.title} characters or less`;
    
    if (!tagline.trim()) newErrors.tagline = 'Tagline is required';
    else if (tagline.length > CHARACTER_LIMITS.tagline) newErrors.tagline = `Tagline must be ${CHARACTER_LIMITS.tagline} characters or less`;
    
    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length > CHARACTER_LIMITS.description) newErrors.description = `Description must be ${CHARACTER_LIMITS.description} characters or less`;
    
    if (!problem.trim()) newErrors.problem = 'Problem is required';
    else if (problem.length > CHARACTER_LIMITS.problem) newErrors.problem = `Problem must be ${CHARACTER_LIMITS.problem} characters or less`;
    
    if (!solution.trim()) newErrors.solution = 'Solution is required';
    else if (solution.length > CHARACTER_LIMITS.solution) newErrors.solution = `Solution must be ${CHARACTER_LIMITS.solution} characters or less`;
    
    if (!revenueModel.trim()) newErrors.revenueModel = 'Revenue model is required';
    else if (revenueModel.length > CHARACTER_LIMITS.revenueModel) newErrors.revenueModel = `Revenue model must be ${CHARACTER_LIMITS.revenueModel} characters or less`;
    
    if (tags.length === 0) newErrors.tags = 'At least one tag is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePickImage = async (imageType = 'image') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Don't force cropping
        quality: 0.8,
        allowsMultipleSelection: imageType === 'image', // Only allow multiple selection for regular images
        selectionLimit: imageType === 'image' ? 5 : 1, // Regular images allow 5, logo and banner allow only 1
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (imageType === 'banner') {
          // Set only the first image as banner image (single image only)
          setBannerImages([result.assets[0].uri]);
        } else if (imageType === 'logo') {
          setLogo(result.assets[0].uri);
        } else {
          // Add all selected images to showcase images
          const newImages = result.assets.map(asset => asset.uri);
          setImages([...images, ...newImages]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      if (imageType === 'logo') {
        setLogo('https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=2070&auto=format&fit=crop');
      } else {
        setImages([...images, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop']);
      }
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleRemoveBannerImage = (index: number) => {
    const newBannerImages = [...bannerImages];
    newBannerImages.splice(index, 1);
    setBannerImages(newBannerImages);
  };

  const handleCreateShowcase = () => {
    if (!validateForm()) return;
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a showcase');
      return;
    }
    
    // Use placeholder images if none selected (for demo purposes)
    const finalImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop'];
    
    const links: Record<string, string> = {};
    if (websiteLink) links.website = websiteLink;
    if (demoVideoLink) links.demoVideo = demoVideoLink;
    
    if (isEditing && editingEntry) {
      updateEntry(editingEntry.id, {
        title,
        description,
        images: finalImages,
        tags,
        tagline,
        problem,
        solution,
        revenueModel,
        bannerImages,
        logo,
        category,
        links: { ...(editingEntry.links || {}), ...links },
      });
      Alert.alert('Success', 'Your showcase has been updated!', [
        { text: 'OK', onPress: () => router.push('/showcase') }
      ]);
      return;
    }

    addEntry({
      id: `showcase-${Date.now()}`,
      title,
      description,
      images: finalImages,
      tags,
      upvotes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
      author: {
        id: (user as any)?.id ?? (user as any)?._id,
        name: user.name,
        avatar: user.avatar
      },
      links,
      upvoters: [],
      subtitle,
      tagline,
      problem,
      solution,
      revenueModel,
      bannerImages,
      logo,
      category
    });
    
    Alert.alert('Success', 'Your showcase has been created!', [
      { text: 'OK', onPress: () => router.push('/showcase') }
    ]);
  };

  const categories = [
    { id: 'App', label: 'App', icon: <Briefcase size={20} color={Colors.dark.text} /> },
    { id: 'Idea', label: 'Idea', icon: <Lightbulb size={20} color={Colors.dark.text} /> },
    { id: 'Design', label: 'Design', icon: <ImageIcon size={20} color={Colors.dark.text} /> },
    { id: 'Article', label: 'Article', icon: <FileText size={20} color={Colors.dark.text} /> },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Showcase' : 'Create Showcase'}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 1. Logo Upload */}
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Logo Upload *</Text>
            <Text style={styles.sectionSubtitle}>Upload your project logo</Text>
            
            <View style={styles.logoSection}>
              {logo ? (
                <View style={styles.logoContainer}>
                  <Image source={{ uri: logo }} style={styles.logoImage} />
                  <TouchableOpacity 
                    style={styles.removeLogoButton}
                    onPress={() => setLogo('')}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.addLogoButton, errors.logo && styles.errorBorder]}
                  onPress={() => handlePickImage('logo')}
                >
                  <Upload size={24} color={Colors.dark.subtext} />
                  <Text style={styles.addLogoText}>Add Logo</Text>
                </TouchableOpacity>
              )}
            </View>
            {errors.logo && <Text style={styles.errorText}>{errors.logo}</Text>}
          </View>

          {/* 2. Banner Image */}
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Banner Image</Text>
            <Text style={styles.sectionSubtitle}>Upload a banner image for your project</Text>
            
            {bannerImages.length > 0 ? (
              <View style={styles.bannerImageContainer}>
                <Image source={{ uri: bannerImages[0] }} style={styles.bannerImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setBannerImages([])}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addBannerButton}
                onPress={() => handlePickImage('banner')}
              >
                <Upload size={32} color={Colors.dark.subtext} />
                <Text style={styles.addImageText}>Add Banner Image</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* 3. Category */}
          <View style={styles.categorySelector}>
            <Text style={styles.sectionTitle}>Category *</Text>
            <View style={[styles.categoriesContainer, errors.category && styles.errorBorder]}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.activeCategoryButton
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  {cat.icon}
                  <Text style={[
                    styles.categoryText,
                    category === cat.id && styles.activeCategoryText
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>
          
          {/* 4. Project Title */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Project Title *</Text>
              <Text style={styles.charCounter}>{title.length}/{CHARACTER_LIMITS.title}</Text>
            </View>
            <View style={[styles.inputContainer, errors.title && styles.inputError]}>
              <Award size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Mango AI"
                placeholderTextColor={Colors.dark.subtext}
                value={title}
                onChangeText={setTitle}
                maxLength={CHARACTER_LIMITS.title}
              />
            </View>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>
          
          {/* 5. Tagline */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Tagline *</Text>
              <Text style={styles.charCounter}>{tagline.length}/{CHARACTER_LIMITS.tagline}</Text>
            </View>
            <View style={[styles.inputContainer, errors.tagline && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. ChatGPT, but for Noobs"
                placeholderTextColor={Colors.dark.subtext}
                value={tagline}
                onChangeText={setTagline}
                maxLength={CHARACTER_LIMITS.tagline}
              />
            </View>
            {errors.tagline && <Text style={styles.errorText}>{errors.tagline}</Text>}
          </View>
          
          {/* 6. Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description *</Text>
              <Text style={styles.charCounter}>{description.length}/{CHARACTER_LIMITS.description}</Text>
            </View>
            <View style={[styles.textAreaContainer, errors.description && styles.inputError]}>
              <TextInput
                style={[
                  styles.textArea,
                  !isDescriptionExpanded && description.length > 200 && styles.collapsedTextArea
                ]}
                placeholder="Describe your project, what problem it solves, and how it works..."
                placeholderTextColor={Colors.dark.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={isDescriptionExpanded ? 10 : 4}
                textAlignVertical="top"
                maxLength={CHARACTER_LIMITS.description}
              />
            </View>
            {description.length > 200 && (
              <TouchableOpacity 
                style={styles.showMoreButton}
                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <Text style={styles.showMoreText}>
                  {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>
          
          {/* 7. Problem */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Problem *</Text>
              <Text style={styles.charCounter}>{problem.length}/{CHARACTER_LIMITS.problem}</Text>
            </View>
            <View style={[styles.textAreaContainer, errors.problem && styles.inputError]}>
              <TextInput
                style={styles.textArea}
                placeholder="What problem does your project solve?"
                placeholderTextColor={Colors.dark.subtext}
                value={problem}
                onChangeText={setProblem}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={CHARACTER_LIMITS.problem}
              />
            </View>
            {errors.problem && <Text style={styles.errorText}>{errors.problem}</Text>}
          </View>
          
          {/* 8. Solution */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Solution *</Text>
              <Text style={styles.charCounter}>{solution.length}/{CHARACTER_LIMITS.solution}</Text>
            </View>
            <View style={[styles.textAreaContainer, errors.solution && styles.inputError]}>
              <TextInput
                style={styles.textArea}
                placeholder="How does your project solve this problem?"
                placeholderTextColor={Colors.dark.subtext}
                value={solution}
                onChangeText={setSolution}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={CHARACTER_LIMITS.solution}
              />
            </View>
            {errors.solution && <Text style={styles.errorText}>{errors.solution}</Text>}
          </View>
          
          {/* 9. Revenue Model */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Revenue Model *</Text>
              <Text style={styles.charCounter}>{revenueModel.length}/{CHARACTER_LIMITS.revenueModel}</Text>
            </View>
            <View style={[styles.textAreaContainer, errors.revenueModel && styles.inputError]}>
              <TextInput
                style={styles.textArea}
                placeholder="How do you plan to monetize this project?"
                placeholderTextColor={Colors.dark.subtext}
                value={revenueModel}
                onChangeText={setRevenueModel}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={CHARACTER_LIMITS.revenueModel}
              />
            </View>
            {errors.revenueModel && <Text style={styles.errorText}>{errors.revenueModel}</Text>}
          </View>

          {/* 10. Showcase Images */}
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Showcase Images *</Text>
            <Text style={styles.sectionSubtitle}>Upload images of your project</Text>
            
            <View style={styles.showcaseImagesWrapper}>
              {images.length > 0 && (
                <View style={styles.imagesContainer}>
                  <FlatList
                    data={images}
                    horizontal={images.length > 1}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                      <View style={styles.dynamicImageContainer}>
                        <Image 
                          source={{ uri: item }} 
                          style={[
                            styles.showcaseImage,
                            images.length > 1 ? styles.multipleImages : styles.singleImage
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
                    ListFooterComponent={
                      <TouchableOpacity 
                        style={styles.addImageButton}
                        onPress={() => handlePickImage('image')}
                      >
                        <Upload size={32} color={Colors.dark.subtext} />
                        <Text style={styles.addImageText}>Add Image</Text>
                      </TouchableOpacity>
                    }
                  />
                </View>
              )}
              
              {images.length === 0 && (
                <TouchableOpacity 
                  style={styles.addImageButton}
                  onPress={() => handlePickImage('image')}
                >
                  <Upload size={32} color={Colors.dark.subtext} />
                  <Text style={styles.addImageText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
            {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
          </View>
          
          {/* 11. Demo Video Link */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Demo Video Link</Text>
            <View style={styles.inputContainer}>
              <Link size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={Colors.dark.subtext}
                value={demoVideoLink}
                onChangeText={setDemoVideoLink}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          {/* 12. Project Link */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Link</Text>
            <Text style={styles.sectionSubtitle}>Add link to your project (optional)</Text>
            <View style={styles.inputContainer}>
              <Link size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="https://yourproject.com"
                placeholderTextColor={Colors.dark.subtext}
                value={websiteLink}
                onChangeText={setWebsiteLink}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          {/* 13. Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags *</Text>
            <View style={[styles.tagsInputContainer, errors.tags && styles.inputError]}>
              <Tag size={20} color={Colors.dark.subtext} style={styles.tagIcon} />
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag and press +"
                placeholderTextColor={Colors.dark.subtext}
                value={currentTag}
                onChangeText={setCurrentTag}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                <Plus size={20} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            {errors.tags && <Text style={styles.errorText}>{errors.tags}</Text>}
            
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <X size={16} color={Colors.dark.text} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          
          
          <Button 
            title="Create Showcase" 
            onPress={handleCreateShowcase} 
            style={styles.submitButton}
            gradient
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  imagesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 12,
  },
  imagesScrollView: {
    marginBottom: 8,
  },
  imageContainer: {
    width: 160,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 160,
    height: 120,
    borderRadius: 8,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  addImageText: {
    color: Colors.dark.subtext,
    marginTop: 8,
  },
  categorySelector: {
    marginBottom: 24,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  activeCategoryButton: {
    backgroundColor: `${Colors.dark.primary}20`,
    borderColor: Colors.dark.primary,
  },
  categoryText: {
    color: Colors.dark.text,
    marginTop: 4,
    fontSize: 12,
  },
  activeCategoryText: {
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputError: {
    borderColor: Colors.dark.error,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    marginLeft: 8,
    fontSize: 16,
  },
  textAreaContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  textArea: {
    color: Colors.dark.text,
    fontSize: 16,
    minHeight: 120,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingLeft: 12,
  },
  tagIcon: {
    marginRight: 8,
  },
  tagInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  addTagButton: {
    backgroundColor: Colors.dark.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: Colors.dark.border,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: {
    color: Colors.dark.text,
    marginRight: 6,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
  logoSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  removeLogoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addLogoButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  addLogoText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  // Dynamic image display styles (matching create post)
  imagesContainer: {
    marginBottom: 16,
  },
  imagesList: {
    gap: 8,
  },
  showcaseImage: {
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
  dynamicImageContainer: {
    position: 'relative',
  },
  showcaseImagesWrapper: {
    marginBottom: 8,
  },
  bannerImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  addBannerButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  // Character counter and expandable description styles
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  collapsedTextArea: {
    maxHeight: 100,
    overflow: 'hidden',
  },
  showMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  showMoreText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  // Error border style for required fields
  errorBorder: {
    borderColor: Colors.dark.error,
    borderWidth: 2,
  },
});

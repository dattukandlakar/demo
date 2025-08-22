import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  StatusBar,
  TextInput,
  PanResponder,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  X, 
  Camera, 
  Image as ImageIcon, 
  Video as VideoIcon,
  User,
  Users,
  Type,
  Smile,
  Download,
  Send,
  Palette,
  RotateCcw,
  FlipHorizontal,
  Crop,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { uploadMedia } from '@/utils/uploadUtils';
import { uploadMediaBase64 } from '@/utils/uploadUtilsBase64';
import { debugUploadContext, logUploadDebugInfo } from '@/utils/debugUpload';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StoryUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'upload' | 'view' | 'camera';
  userStories?: any[];
  followerStories?: any[];
  currentStoryId?: string;
}

type ViewMode = 'my-stories' | 'followers-stories';
type EditMode = 'camera' | 'select' | 'edit' | 'preview' | 'view';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  backgroundColor: string;
  fontSize: number;
}

interface StickerElement {
  id: string;
  type: 'emoji' | 'sticker';
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const StoryUploadModal: React.FC<StoryUploadModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialMode = 'camera',
  userStories = [],
  followerStories = [],
  currentStoryId,
}) => {
  const [mode, setMode] = useState<EditMode>(initialMode as EditMode);
  const [viewMode, setViewMode] = useState<ViewMode>('my-stories');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
  // Media states
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    type: 'image' | 'video';
  } | null>(null);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Editing states
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedBgColor, setSelectedBgColor] = useState('transparent');
  
  // Editing tools
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  
  const { token, user } = useAuthStore();

  // Color palette
  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080'
  ];

  // Popular emojis
  const emojis = [
    '😀', '😂', '🥰', '😍', '🤔', '😎', '🔥', '💯',
    '❤️', '💖', '👍', '👌', '✨', '🌟', '🎉', '💪'
  ];

  // Reset states when modal closes
  useEffect(() => {
    if (!visible && !isCameraActive) {
      resetAllStates();
    }
  }, [visible, isCameraActive]);

  const resetAllStates = () => {
    setSelectedMedia(null);
    setIsUploading(false);
    setUploadProgress(0);
    setIsCompressing(false);
    setMode(initialMode as EditMode);
    setTextElements([]);
    setStickerElements([]);
    setActiveTextId(null);
    setShowTextInput(false);
    setTextInputValue('');
    setShowColorPicker(false);
    setShowStickerPicker(false);
  };

  // Camera and media selection functions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload stories!');
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      setIsCameraActive(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'image'
        });
        setMode('edit');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsCameraActive(false);
    }
  };

  const takeVideo = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      setIsCameraActive(true);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.7,
        videoMaxDuration: 15,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'video'
        });
        setMode('edit');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    } finally {
      setIsCameraActive(false);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'image'
        });
        setMode('edit');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.7,
        videoMaxDuration: 15,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'video'
        });
        setMode('edit');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video');
    }
  };

  // Text editing functions
  const addTextElement = () => {
    const newId = Date.now().toString();
    const newElement: TextElement = {
      id: newId,
      text: textInputValue || 'Your text',
      x: screenWidth / 2,
      y: screenHeight / 2,
      scale: 1,
      rotation: 0,
      color: selectedColor,
      backgroundColor: selectedBgColor,
      fontSize: 24,
    };
    
    setTextElements(prev => [...prev, newElement]);
    setActiveTextId(newId);
    setTextInputValue('');
    setShowTextInput(false);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(element => element.id !== id));
    setActiveTextId(null);
  };

  // Sticker functions
  const addStickerElement = (content: string, type: 'emoji' | 'sticker' = 'emoji') => {
    const newElement: StickerElement = {
      id: Date.now().toString(),
      type,
      content,
      x: screenWidth / 2,
      y: screenHeight / 2,
      scale: 1,
      rotation: 0,
    };
    
    setStickerElements(prev => [...prev, newElement]);
    setShowStickerPicker(false);
  };

  // Upload function
  const uploadStoryWithElements = async () => {
    if (!selectedMedia || !token) {
      Alert.alert('Error', 'Please select media first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Here you would combine the media with text/stickers
      // For now, we'll just upload the original media
      const result = await uploadMediaBase64(
        selectedMedia.uri,
        token,
        selectedMedia.type,
        (progress) => setUploadProgress(progress)
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      handleUploadSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload story');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadSuccess = () => {
    Alert.alert('Success', 'Story uploaded successfully!', [{
      text: 'OK',
      onPress: () => {
        resetAllStates();
        onSuccess();
        onClose();
      }
    }]);
  };

  const handleClose = () => {
    if (isCameraActive) return;

    if (selectedMedia && !isUploading) {
      Alert.alert(
        'Discard Story?',
        'You have a story ready to upload. Are you sure you want to discard it?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              resetAllStates();
              onClose();
            }
          }
        ]
      );
    } else {
      resetAllStates();
      onClose();
    }
  };

  // Create PanResponder for text elements
  const createTextPanResponder = (elementId: string) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const element = textElements.find(el => el.id === elementId);
        if (element) {
          updateTextElement(elementId, {
            x: element.x + gestureState.dx,
            y: element.y + gestureState.dy
          });
        }
      },
    });
  };

  // Create PanResponder for sticker elements
  const createStickerPanResponder = (elementId: string) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const element = stickerElements.find(el => el.id === elementId);
        if (element) {
          setStickerElements(prev => 
            prev.map(el => 
              el.id === elementId 
                ? { ...el, x: element.x + gestureState.dx, y: element.y + gestureState.dy }
                : el
            )
          );
        }
      },
    });
  };

  // Render functions
  const renderCameraScreen = () => (
    <View style={styles.cameraContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cameraTitle}>Create Story</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.cameraContent}>
        <Text style={styles.cameraSubtitle}>Choose how to create your story</Text>
        
        <View style={styles.cameraOptions}>
          <TouchableOpacity style={styles.cameraOptionButton} onPress={takePhoto}>
            <Camera size={48} color={Colors.dark.primary} />
            <Text style={styles.cameraOptionText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cameraOptionButton} onPress={takeVideo}>
            <VideoIcon size={48} color={Colors.dark.primary} />
            <Text style={styles.cameraOptionText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cameraOptionButton} onPress={pickImage}>
            <ImageIcon size={48} color={Colors.dark.primary} />
            <Text style={styles.cameraOptionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cameraOptionButton} onPress={pickVideo}>
            <VideoIcon size={48} color={Colors.dark.primary} />
            <Text style={styles.cameraOptionText}>Video Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEditScreen = () => (
    <View style={styles.editContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.editHeader}>
        <TouchableOpacity onPress={() => setMode('camera')} style={styles.backButton}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.editTitle}>Edit Story</Text>
        <TouchableOpacity onPress={uploadStoryWithElements} style={styles.uploadHeaderButton}>
          <Text style={styles.uploadHeaderText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Media Display */}
      <View style={styles.mediaContainer}>
        {selectedMedia?.type === 'image' ? (
          <Image 
            source={{ uri: selectedMedia.uri }} 
            style={styles.editMediaImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.editMediaVideo}>
            <VideoIcon size={64} color="#fff" />
            <Text style={styles.videoLabel}>Video Selected</Text>
          </View>
        )}

        {/* Text Elements */}
        {textElements.map((element) => (
          <View
            key={element.id}
            style={[
              styles.textElement,
              {
                left: element.x - 50,
                top: element.y - 25,
                transform: [
                  { scale: element.scale },
                  { rotate: `${element.rotation}deg` }
                ]
              }
            ]}
            {...createTextPanResponder(element.id).panHandlers}
          >
            <TouchableOpacity
              onPress={() => setActiveTextId(element.id)}
              onLongPress={() => deleteTextElement(element.id)}
              style={[
                styles.textElementContent,
                { backgroundColor: element.backgroundColor }
              ]}
            >
              <Text 
                style={[
                  styles.textElementText,
                  { 
                    color: element.color,
                    fontSize: element.fontSize 
                  }
                ]}
              >
                {element.text}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Sticker Elements */}
        {stickerElements.map((element) => (
          <View
            key={element.id}
            style={[
              styles.stickerElement,
              {
                left: element.x - 25,
                top: element.y - 25,
                transform: [
                  { scale: element.scale },
                  { rotate: `${element.rotation}deg` }
                ]
              }
            ]}
            {...createStickerPanResponder(element.id).panHandlers}
          >
            <Text style={styles.stickerContent}>{element.content}</Text>
          </View>
        ))}
      </View>

      {/* Editing Tools */}
      <View style={styles.editingTools}>
        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={() => setShowTextInput(true)}
        >
          <Type size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={() => setShowStickerPicker(true)}
        >
          <Smile size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={() => setShowColorPicker(!showColorPicker)}
        >
          <Palette size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Color Picker */}
      {showColorPicker && (
        <View style={styles.colorPicker}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorOption, { backgroundColor: color }]}
              onPress={() => {
                setSelectedColor(color);
                setShowColorPicker(false);
              }}
            />
          ))}
        </View>
      )}

      {/* Upload Progress */}
      {(isUploading || isCompressing) && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.uploadText}>
            {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Preparing...'}
          </Text>
        </View>
      )}
    </View>
  );

  // Text Input Modal
  const renderTextInputModal = () => (
    <Modal
      visible={showTextInput}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTextInput(false)}
    >
      <View style={styles.textInputOverlay}>
        <View style={styles.textInputContainer}>
          <Text style={styles.textInputTitle}>Add Text</Text>
          <TextInput
            style={styles.textInput}
            value={textInputValue}
            onChangeText={setTextInputValue}
            placeholder="Type your text..."
            placeholderTextColor={Colors.dark.textSecondary}
            multiline
            autoFocus
          />
          <View style={styles.textInputActions}>
            <TouchableOpacity 
              style={styles.textCancelButton}
              onPress={() => setShowTextInput(false)}
            >
              <Text style={styles.textCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.textAddButton}
              onPress={addTextElement}
            >
              <Text style={styles.textAddText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Sticker Picker Modal
  const renderStickerModal = () => (
    <Modal
      visible={showStickerPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStickerPicker(false)}
    >
      <View style={styles.stickerOverlay}>
        <View style={styles.stickerContainer}>
          <Text style={styles.stickerTitle}>Add Emoji</Text>
          <View style={styles.stickerGrid}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.stickerOption}
                onPress={() => addStickerElement(emoji)}
              >
                <Text style={styles.stickerEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.stickerCloseButton}
            onPress={() => setShowStickerPicker(false)}
          >
            <Text style={styles.stickerCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Story viewer (existing functionality)
  const renderStoryViewer = () => {
    const getCurrentStories = () => {
      return viewMode === 'my-stories' ? userStories : followerStories;
    };

    const currentStories = getCurrentStories();
    const currentStory = currentStories[currentStoryIndex];
    
    if (!currentStory) {
      return (
        <View style={styles.noStoriesContainer}>
          <Text style={styles.noStoriesText}>No stories available</Text>
        </View>
      );
    }

    return (
      <View style={styles.storyViewerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.progressContainer}>
          {currentStories.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                {
                  backgroundColor: index <= currentStoryIndex 
                    ? Colors.dark.primary 
                    : 'rgba(255, 255, 255, 0.3)',
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.storyHeader}>
          <View style={styles.storyUserInfo}>
            <Image 
              source={{ uri: currentStory.user?.avatar || user?.avatar }} 
              style={styles.storyUserAvatar}
            />
            <Text style={styles.storyUserName}>
              {viewMode === 'my-stories' ? 'Your Story' : currentStory.user?.name}
            </Text>
            <Text style={styles.storyTime}>
              {currentStory.time || '2h'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.storyContent}>
          {currentStory.type === 'image' ? (
            <Image 
              source={{ uri: currentStory.mediaUrl }} 
              style={styles.storyImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.storyVideo}>
              <VideoIcon size={48} color="#fff" />
              <Text style={styles.videoText}>Video Story</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      {mode === 'camera' && renderCameraScreen()}
      {mode === 'edit' && selectedMedia && renderEditScreen()}
      {mode === 'view' && renderStoryViewer()}
      {renderTextInputModal()}
      {renderStickerModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Camera Screen Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cameraContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cameraSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 50,
    textAlign: 'center',
  },
  cameraOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 30,
  },
  cameraOptionButton: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  cameraOptionText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },

  // Edit Screen Styles
  editContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  uploadHeaderButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadHeaderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaContainer: {
    flex: 1,
    position: 'relative',
  },
  editMediaImage: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
  },
  editMediaVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  videoLabel: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },

  // Text Element Styles
  textElement: {
    position: 'absolute',
    zIndex: 5,
  },
  textElementContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  textElementText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Sticker Element Styles
  stickerElement: {
    position: 'absolute',
    zIndex: 5,
  },
  stickerContent: {
    fontSize: 48,
  },

  // Editing Tools
  editingTools: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    zIndex: 10,
  },
  toolButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Color Picker
  colorPicker: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    zIndex: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Text Input Modal
  textInputOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    backgroundColor: Colors.dark.surface,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    minWidth: screenWidth * 0.8,
  },
  textInputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: Colors.dark.background,
    color: Colors.dark.text,
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  textInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  textCancelButton: {
    flex: 1,
    backgroundColor: Colors.dark.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textCancelText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  textAddButton: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Sticker Picker Modal
  stickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  stickerContainer: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  stickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  stickerOption: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    borderRadius: 25,
  },
  stickerEmoji: {
    fontSize: 28,
  },
  stickerCloseButton: {
    backgroundColor: Colors.dark.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  stickerCloseText: {
    color: Colors.dark.text,
    fontSize: 16,
  },

  // Upload Overlay
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },

  // Common Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },

  // Story Viewer Styles (existing)
  storyViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 50,
    gap: 4,
    zIndex: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  storyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  storyUserName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  storyTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  storyVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  noStoriesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  noStoriesText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default StoryUploadModal;
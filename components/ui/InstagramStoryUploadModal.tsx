import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Animated,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { 
  X, 
  Camera as CameraIcon, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Type,
  Smile,
  Music,
  MapPin,
  Hash,
  Link,
  Download,
  Send,
  Palette,
  RotateCcw,
  Flash,
  FlipHorizontal,
  Settings,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  Circle,
  Heart,
  Star,
  Zap,
  Sparkles,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface InstagramStoryUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'camera' | 'gallery' | 'edit';
}

type CreationMode = 'camera' | 'gallery' | 'edit' | 'preview';
type MediaType = 'image' | 'video';
type ToolType = 'text' | 'sticker' | 'music' | 'location' | 'poll' | 'question';

interface StoryElement {
  id: string;
  type: 'text' | 'sticker' | 'music' | 'location' | 'poll';
  content: any;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  visible: boolean;
}

interface InstagramStory {
  id: string;
  uri: string;
  type: MediaType;
  duration?: number;
  elements: StoryElement[];
}

const InstagramStoryUploadModal: React.FC<InstagramStoryUploadModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialMode = 'camera',
}) => {
  const [mode, setMode] = useState<CreationMode>(initialMode);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<InstagramStory | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [storyElements, setStoryElements] = useState<StoryElement[]>([]);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { token, user } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const filters = [
    { name: 'Normal', intensity: 0 },
    { name: 'Clarendon', intensity: 0.5 },
    { name: 'Gingham', intensity: 0.4 },
    { name: 'Moon', intensity: 0.7 },
    { name: 'Lark', intensity: 0.3 },
    { name: 'Reyes', intensity: 0.6 },
  ];

  const stickers = [
    { type: 'emoji', content: '😍', category: 'reactions' },
    { type: 'emoji', content: '🎉', category: 'celebration' },
    { type: 'emoji', content: '🔥', category: 'reactions' },
    { type: 'emoji', content: '❤️', category: 'hearts' },
    { type: 'emoji', content: '✨', category: 'effects' },
    { type: 'emoji', content: '🌟', category: 'effects' },
    { type: 'text', content: 'TIME', category: 'time' },
    { type: 'text', content: 'TEMP', category: 'weather' },
  ];

  const musicTracks = [
    { id: '1', title: 'Popular Song', artist: 'Artist Name', duration: '3:45' },
    { id: '2', title: 'Trending Track', artist: 'Another Artist', duration: '2:30' },
    { id: '3', title: 'Viral Hit', artist: 'Famous Singer', duration: '4:12' },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted' && mediaStatus === 'granted');
      
      if (mediaStatus === 'granted') {
        loadMediaLibrary();
      }
    })();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadMediaLibrary = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        sortBy: MediaLibrary.SortBy.creationTime,
        first: 50,
      });
      setMediaLibrary(media.assets);
    } catch (error) {
      console.error('Error loading media library:', error);
    }
  };

  const handleTakePhoto = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      setSelectedMedia({
        id: Date.now().toString(),
        uri: photo.uri,
        type: 'image',
        elements: [],
      });
      setMode('edit');
    }
  };

  const handleRecordVideo = async () => {
    if (camera && !isRecording) {
      setIsRecording(true);
      setRecordingDuration(0);
      
      const timer = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 15) {
            stopRecording();
            clearInterval(timer);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

      const video = await camera.recordAsync({
        maxDuration: 15,
        quality: Camera.Constants.VideoQuality['720p'],
      });
      
      setSelectedMedia({
        id: Date.now().toString(),
        uri: video.uri,
        type: 'video',
        duration: recordingDuration,
        elements: [],
      });
      setMode('edit');
    }
  };

  const stopRecording = () => {
    if (camera && isRecording) {
      camera.stopRecording();
      setIsRecording(false);
    }
  };

  const handleMediaSelect = (media: any) => {
    setSelectedMedia({
      id: Date.now().toString(),
      uri: media.uri,
      type: media.mediaType === 'photo' ? 'image' : 'video',
      duration: media.duration,
      elements: [],
    });
    setMode('edit');
  };

  const addStoryElement = (type: ToolType, content: any) => {
    const newElement: StoryElement = {
      id: Date.now().toString(),
      type,
      content,
      position: { x: screenWidth / 2, y: screenHeight / 3 },
      scale: 1,
      rotation: 0,
      visible: true,
    };
    
    setStoryElements(prev => [...prev, newElement]);
  };

  const renderCameraView = () => (
    <View style={styles.cameraContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Camera
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        ref={ref => setCamera(ref)}
        ratio="16:9"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.cameraOverlay}
        >
          {/* Top Controls */}
          <View style={styles.cameraTopControls}>
            <TouchableOpacity onPress={onClose} style={styles.controlButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setFlashMode(
                flashMode === Camera.Constants.FlashMode.off 
                  ? Camera.Constants.FlashMode.on 
                  : Camera.Constants.FlashMode.off
              )}
            >
              <Flash size={24} color={flashMode === Camera.Constants.FlashMode.on ? "#fff" : "#666"} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setCameraType(
                cameraType === Camera.Constants.Type.back 
                  ? Camera.Constants.Type.front 
                  : Camera.Constants.Type.back
              )}
            >
              <FlipHorizontal size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Filter Preview */}
          <ScrollView 
            horizontal 
            style={styles.filterScroll}
            showsHorizontalScrollIndicator={false}
          >
            {filters.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.filterPreview, selectedFilter === index && styles.selectedFilter]}
                onPress={() => setSelectedFilter(index)}
              >
                <View style={styles.filterThumbnail} />
                <Text style={styles.filterName}>{filter.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bottom Controls */}
          <View style={styles.cameraBottomControls}>
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={() => setMode('gallery')}
            >
              <ImageIcon size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.captureButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : handleTakePhoto}
              onLongPress={handleRecordVideo}
            >
              <View style={[styles.captureButtonInner, isRecording && styles.recordingButtonInner]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Settings size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Camera>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>{recordingDuration}s</Text>
        </View>
      )}
    </View>
  );

  const renderGalleryView = () => (
    <View style={styles.galleryContainer}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.galleryHeader}>
        <TouchableOpacity onPress={() => setMode('camera')}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.galleryTitle}>Recent</Text>
        <TouchableOpacity>
          <Text style={styles.gallerySelectAll}>Select All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mediaLibrary}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mediaItem}
            onPress={() => handleMediaSelect(item)}
          >
            <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
            {item.mediaType === 'video' && (
              <View style={styles.videoDuration}>
                <Text style={styles.durationText}>{Math.floor(item.duration)}s</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        style={styles.mediaGrid}
      />
    </View>
  );

  const renderEditView = () => (
    <View style={styles.editContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Media Display */}
      <View style={styles.mediaDisplay}>
        {selectedMedia?.type === 'image' ? (
          <Image 
            source={{ uri: selectedMedia.uri }} 
            style={styles.editMedia}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.editMedia}>
            <VideoIcon size={64} color="#fff" />
            <Text style={styles.videoText}>Video Story</Text>
          </View>
        )}

        {/* Story Elements */}
        {storyElements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            onUpdate={(id, updates) => {
              setStoryElements(prev => 
                prev.map(el => el.id === id ? { ...el, ...updates } : el)
              );
            }}
            onDelete={(id) => {
              setStoryElements(prev => prev.filter(el => el.id !== id));
            }}
          />
        ))}
      </View>

      {/* Top Controls */}
      <View style={styles.editTopControls}>
        <TouchableOpacity onPress={() => setMode('camera')}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.editTitle}>Edit Story</Text>
        
        <TouchableOpacity style={styles.shareButton} onPress={() => {}}>
          <Text style={styles.shareText}>Your Story</Text>
          <ChevronRight size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tool Bar */}
      <ScrollView 
        horizontal 
        style={styles.toolBar}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => setActiveTool('text')}
        >
          <Type size={24} color="#fff" />
          <Text style={styles.toolLabel}>Text</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => setActiveTool('sticker')}
        >
          <Smile size={24} color="#fff" />
          <Text style={styles.toolLabel}>Sticker</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => setActiveTool('music')}
        >
          <Music size={24} color="#fff" />
          <Text style={styles.toolLabel}>Music</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => setActiveTool('location')}
        >
          <MapPin size={24} color="#fff" />
          <Text style={styles.toolLabel}>Location</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => setActiveTool('poll')}
        >
          <Zap size={24} color="#fff" />
          <Text style={styles.toolLabel}>Poll</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tool Panels */}
      {activeTool === 'text' && (
        <View style={styles.toolPanel}>
          <TextInput
            style={styles.textInput}
            placeholder="Type something..."
            placeholderTextColor="#666"
            onSubmitEditing={(e) => {
              addStoryElement('text', e.nativeEvent.text);
              setActiveTool(null);
            }}
          />
        </View>
      )}

      {activeTool === 'sticker' && (
        <View style={styles.stickerPanel}>
          <FlatList
            data={stickers}
            numColumns={4}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stickerItem}
                onPress={() => {
                  addStoryElement('sticker', item.content);
                  setActiveTool(null);
                }}
              >
                <Text style={styles.stickerText}>{item.content}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.content}
          />
        </View>
      )}

      {activeTool === 'music' && (
        <View style={styles.musicPanel}>
          <FlatList
            data={musicTracks}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.musicItem}>
                <Music size={20} color="#fff" />
                <View style={styles.musicInfo}>
                  <Text style={styles.musicTitle}>{item.title}</Text>
                  <Text style={styles.musicArtist}>{item.artist}</Text>
                </View>
                <Text style={styles.musicDuration}>{item.duration}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {mode === 'camera' && renderCameraView()}
        {mode === 'gallery' && renderGalleryView()}
        {mode === 'edit' && selectedMedia && renderEditView()}
      </Animated.View>
    </Modal>
  );
};

const DraggableElement = ({ element, onUpdate, onDelete }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y }
    ], { useNativeDriver: false }),
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  return (
    <Animated.View
      style={[
        styles.draggableElement,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      {element.type === 'text' && (
        <Text style={styles.elementText}>{element.content}</Text>
      )}
      {element.type === 'sticker' && (
        <Text style={styles.elementSticker}>{element.content}</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Camera Styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  controlButton: {
    padding: 10,
  },
  filterScroll: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  filterPreview: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  selectedFilter: {
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    borderRadius: 8,
  },
  filterThumbnail: {
    width: 60,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  filterName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  cameraBottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  galleryButton: {
    padding: 15,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff0000',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff0000',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff0000',
    marginRight: 5,
  },
  recordingTime: {
    color: '#fff',
    fontSize: 14,
  },

  // Gallery Styles
  galleryContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  gallerySelectAll: {
    color: Colors.dark.primary,
    fontSize: 16,
  },
  mediaGrid: {
    flex: 1,
  },
  mediaItem: {
    width: screenWidth / 3,
    height: screenWidth / 3,
    padding: 1,
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
  },

  // Edit Styles
  editContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  mediaDisplay: {
    flex: 1,
    position: 'relative',
  },
  editMedia: {
    width: screenWidth,
    height: screenHeight,
  },
  videoText: {
    color: '#fff',
    fontSize: 16,
  },
  editTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  editTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
  },
  toolBar: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  toolButton: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  toolLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  toolPanel: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 15,
    padding: 20,
  },
  stickerPanel: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 15,
    padding: 20,
    maxHeight: 300,
  },
  stickerItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  stickerText: {
    fontSize: 30,
  },
  musicPanel: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 15,
    padding: 20,
    maxHeight: 300,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  musicInfo: {
    flex: 1,
    marginLeft: 10,
  },
  musicTitle: {
    color: '#fff',
    fontSize: 14,
  },
  musicArtist: {
    color: '#666',
    fontSize: 12,
  },
  musicDuration: {
    color: '#666',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  draggableElement: {
    position: 'absolute',
  },
  elementText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  elementSticker: {
    fontSize: 40,
  },
});

export default InstagramStoryUploadModal;

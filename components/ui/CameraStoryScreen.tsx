import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Image, Dimensions, Platform, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const { width, height } = Dimensions.get('window');

const filters = [
  { id: '1', name: 'Original', thumbnail: 'https://placehold.co/100x100/333/fff?text=Org' },
  { id: '2', name: '90stethic', thumbnail: 'https://placehold.co/100x100/ff66ff/000?text=90s' },
  { id: '3', name: 'Vibrant', thumbnail: 'https://placehold.co/100x100/66ff66/000?text=Vbr' },
  { id: '4', name: 'Retro', thumbnail: 'https://placehold.co/100x100/6666ff/fff?text=Rtr' },
  { id: '5', name: 'B&W', thumbnail: 'https://placehold.co/100x100/000/fff?text=B%26W' },
];

interface CameraStoryScreenProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (media: { uri: string, type: 'photo' | 'video', filter?: string }) => void;
  onGalleryPress?: () => void;
  onCaptureStart?: () => void;
}

const CameraStoryScreen: React.FC<CameraStoryScreenProps> = ({ visible, onClose, onCapture, onGalleryPress, onCaptureStart }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [selectedFilter, setSelectedFilter] = useState('90stethic');
  const [latestGalleryImage, setLatestGalleryImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false); // Add capturing state
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRecording) {
      intervalId = setInterval(() => {
        setRecordingDuration(prevDuration => prevDuration + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(intervalId);
  }, [isRecording]);

  useEffect(() => {
    if (visible) {
      loadLatestGalleryImage();
      setIsCameraReady(false); // Reset camera ready state when opening
    }
  }, [visible]);

  const loadLatestGalleryImage = async () => {
    try {
      // Request media library permissions
      if (!mediaLibraryPermission?.granted) {
        const { granted } = await requestMediaLibraryPermission();
        if (!granted) {
          return;
        }
      }

      // Get the latest photo from gallery
      const { assets } = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: 'photo',
        sortBy: 'creationTime',
      });

      if (assets.length > 0) {
        setLatestGalleryImage(assets[0].uri);
      }
    } catch (error) {
      // console.error('Error loading latest gallery image:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Enhanced photo capture with multiple fallback methods
  const capturePhotoWithFallbacks = async () => {
    console.log('📸 Starting enhanced photo capture...');
    
    // Platform-specific options
    const baseOptions = {
      quality: 0.8,
      base64: false,
      exif: false,
    };
    
    const captureOptions = Platform.OS === 'android' ? [
      // Android-specific methods
      { ...baseOptions, skipProcessing: false },
      { ...baseOptions, skipProcessing: true },
      { ...baseOptions, quality: 1.0, exif: true },
      { quality: 0.5 }, // Minimal for Android
    ] : [
      // iOS-specific methods  
      { ...baseOptions, skipProcessing: false },
      { ...baseOptions, quality: 1.0, exif: true, skipProcessing: false },
      { ...baseOptions, skipProcessing: true },
      { quality: 0.7 }, // Minimal for iOS
    ];
    
    for (let i = 0; i < captureOptions.length; i++) {
      try {
        console.log(`📸 Attempting capture method ${i + 1}:`, captureOptions[i]);
        
        const photo = await cameraRef.current.takePictureAsync(captureOptions[i]);
        
        console.log(`📷 Method ${i + 1} result:`, {
          success: !!photo,
          hasUri: !!photo?.uri,
          uri: photo?.uri?.substring(0, 50) + '...' // Truncate for logging
        });
        
        if (photo?.uri) {
          console.log(`✅ Photo captured successfully with method ${i + 1}!`);
          return photo;
        }
      } catch (error) {
        console.error(`💥 Method ${i + 1} failed:`, error?.message || error);
        if (i === captureOptions.length - 1) {
          throw error; // Re-throw on final attempt
        }
        // Wait a bit before trying next method
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    throw new Error('All photo capture methods failed');
  };

  const handleCapture = async () => {
  console.log('🔥 Capture button pressed, mode:', mode);
  
  // Enhanced diagnostics
  console.log('🔍 Platform info:', {
    OS: Platform.OS,
    version: Platform.Version
  });
  
  console.log('🔍 Permission status:', {
    granted: permission?.granted,
    status: permission?.status,
    canAskAgain: permission?.canAskAgain
  });
  
  if (!cameraRef.current || isCapturing || !isCameraReady) {
    console.error('❌ Camera not ready - ref:', !!cameraRef.current, 'capturing:', isCapturing, 'ready:', isCameraReady);
    return;
  }

  if (mode === 'photo') {
    try {
      console.log('📸 Taking photo...');
      console.log('📸 Camera ref status:', {
        hasRef: !!cameraRef.current,
        isReady: isCameraReady,
        isCapturing: isCapturing,
        cameraType: cameraType
      });
      
      // Check if camera is available
      const isAvailable = await CameraView.isAvailableAsync();
      console.log('📸 Camera availability:', isAvailable);
      
      // Run comprehensive diagnostics
      await checkCameraCapabilities();
      
      setIsCapturing(true);
      onCaptureStart?.(); // Notify parent that capture started
      
      // Add a small delay to ensure camera is fully ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('📸 About to call enhanced photo capture...');
      
      const photo = await capturePhotoWithFallbacks();
      
      console.log('📷 Final photo result:', {
        success: !!photo,
        hasUri: !!photo?.uri,
        uri: photo?.uri,
        width: photo?.width,
        height: photo?.height
      });
      
      if (photo?.uri) {
        console.log('✅ Photo captured successfully, URI:', photo.uri);
        
        const mediaObject = { 
          uri: photo.uri, 
          type: 'photo' as const,
          filter: selectedFilter 
        };
        
        console.log('🎯 Calling onCapture with:', mediaObject);
        onCapture(mediaObject);
        
      } else {
        console.error('❌ No photo URI received from camera');
        console.error('❌ Full photo object:', photo);
      }
    } catch (error) {
      console.error('💥 Failed to take photo:', error);
      console.error('💥 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        code: error?.code
      });
      
      // Try to get more info about camera state
      console.error('💥 Camera state during error:', {
        hasRef: !!cameraRef.current,
        isReady: isCameraReady,
        cameraType: cameraType,
        mode: mode
      });
      
      // Attempt to restart camera for next try
      console.log('🔄 Attempting camera restart after error...');
      await restartCamera();
      
      // Final fallback: try using ImagePicker camera
      console.log('📱 Trying ImagePicker camera as final fallback...');
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          console.log('✅ ImagePicker camera successful!');
          const mediaObject = { 
            uri: result.assets[0].uri, 
            type: 'photo' as const,
            filter: selectedFilter 
          };
          onCapture(mediaObject);
          return; // Exit early on success
        }
      } catch (pickerError) {
        console.error('💥 ImagePicker camera also failed:', pickerError);
      }
    } finally {
      setIsCapturing(false);
    }
  } else {
    // Video mode
    if (isRecording) {
      console.log('⏹️ Stopping video recording...');
      handleRecordStop();
    } else {
      console.log('🎬 Starting video recording...');
      handleRecordStart();
    }
  }
};

  // Enhanced camera diagnostics
  const checkCameraCapabilities = async () => {
    try {
      console.log('🔍 Checking camera capabilities...');
      
      // Check basic availability
      const isAvailable = await CameraView.isAvailableAsync();
      console.log('📷 Camera available:', isAvailable);
      
      if (cameraRef.current) {
        // Check supported features
        const features = cameraRef.current.getSupportedFeatures();
        console.log('📷 Supported features:', features);
        
        // Check available picture sizes
        try {
          const pictureSizes = await cameraRef.current.getAvailablePictureSizesAsync();
          console.log('📷 Available picture sizes:', pictureSizes);
        } catch (sizeError) {
          console.log('📷 Could not get picture sizes:', sizeError?.message);
        }
      }
      
      // Check permissions in detail
      console.log('🔍 Detailed permission check:', {
        permission: permission,
        granted: permission?.granted,
        status: permission?.status,
        canAskAgain: permission?.canAskAgain,
        expires: permission?.expires
      });
      
      return isAvailable;
    } catch (error) {
      console.error('💥 Error checking camera capabilities:', error);
      return false;
    }
  };

  // Comprehensive camera test function
  const testCameraFunctionality = async () => {
    console.log('🧪 Starting comprehensive camera test...');
    
    try {
      // Test 1: Check availability
      const isAvailable = await CameraView.isAvailableAsync();
      console.log('🧪 Test 1 - Camera available:', isAvailable);
      
      if (!isAvailable) {
        console.error('❌ Camera not available on this device');
        return;
      }
      
      // Test 2: Check ref
      console.log('🧪 Test 2 - Camera ref exists:', !!cameraRef.current);
      
      if (!cameraRef.current) {
        console.error('❌ Camera ref is null');
        return;
      }
      
      // Test 3: Check permissions
      console.log('🧪 Test 3 - Permission status:', permission);
      
      // Test 4: Check ready state
      console.log('🧪 Test 4 - Camera ready:', isCameraReady);
      
      // Test 5: Try simple capture
      console.log('🧪 Test 5 - Attempting simple capture...');
      try {
        const testPhoto = await cameraRef.current.takePictureAsync({
          quality: 0.5,
        });
        console.log('🧪 Test 5 result:', !!testPhoto?.uri ? 'SUCCESS' : 'FAILED', testPhoto?.uri?.substring(0, 30));
      } catch (testError) {
        console.error('🧪 Test 5 failed:', testError?.message);
      }
      
    } catch (error) {
      console.error('🧪 Camera test failed:', error);
    }
  };

  // Camera restart function for error recovery
  const restartCamera = async () => {
    try {
      console.log('🔄 Restarting camera...');
      setIsCameraReady(false);
      
      // Pause and resume preview to reset camera state
      if (cameraRef.current) {
        await cameraRef.current.pausePreview();
        await new Promise(resolve => setTimeout(resolve, 500));
        await cameraRef.current.resumePreview();
        console.log('✅ Camera restarted successfully');
      }
    } catch (error) {
      console.error('💥 Failed to restart camera:', error);
    }
  };

  // Fixed video recording functions
  const handleRecordStart = async () => {
    if (!cameraRef.current || isRecording || !isCameraReady) {
      console.log('❌ Cannot start recording - ref:', !!cameraRef.current, 'already recording:', isRecording, 'ready:', isCameraReady);
      return;
    }
    
    try {
      console.log('🎬 Starting video recording...');
      setIsRecording(true);
      onCaptureStart?.(); // Notify parent that recording started
      
      const video = await cameraRef.current.recordAsync({ 
        maxDuration: 15,
        videoQuality: '720p'
      });
      
      console.log('🎥 Video recording completed:', video ? 'Success' : 'Failed', video?.uri);
      
      if (video?.uri) {
        console.log('✅ Video recorded successfully, calling onCapture');
        
        const mediaObject = { 
          uri: video.uri, 
          type: 'video' as const,
          filter: selectedFilter 
        };
        
        console.log('🎯 Calling onCapture with video:', mediaObject);
        onCapture(mediaObject);
      } else {
        console.error('❌ No video URI received');
      }
    } catch (error) {
      console.error('💥 Failed to record video:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleRecordStop = async () => {
    if (!cameraRef.current) {
      console.error('❌ Camera ref not available for stop recording');
      return;
    }
    
    try {
      console.log('⏹️ Stopping video recording...');
      await cameraRef.current.stopRecording();
      console.log('✅ Recording stopped successfully');
    } catch (error) {
      console.error('💥 Failed to stop recording:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleGalleryPress = async () => {
    if (onGalleryPress) {
      onGalleryPress();
    } else {
      // Default gallery picker
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [9, 16],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          onCapture({ 
            uri: result.assets[0].uri, 
            type: 'photo',
            filter: selectedFilter 
          });
        }
      } catch (error) {
        // console.error('Error selecting photo:', error);
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const renderEditingTools = () => (
    <View style={styles.editingToolsContainer}>
      <TouchableOpacity onPress={() => console.log('Text tool pressed.')} style={styles.editingToolButton}>
        <Text style={styles.editingToolText}>Aa</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Infinity tool pressed.')} style={styles.editingToolButton}>
        <Ionicons name="infinite-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Sparkle tool pressed.')} style={styles.editingToolButton}>
        <Ionicons name="sparkles" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Dropdown tool pressed.')} style={styles.editingToolButton}>
        <Ionicons name="chevron-down" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderFilterSelector = () => (
    <View style={styles.filterSelectorContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={styles.filterItem}
          onPress={() => setSelectedFilter(filter.name)}
        >
          <Image
            source={{ uri: filter.thumbnail }}
            style={[
              styles.filterThumbnail,
              selectedFilter === filter.name && styles.filterSelected
            ]}
          />
          <Text style={styles.filterName}>{filter.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      <TouchableOpacity onPress={() => setMode('video')} style={styles.modeButton}>
        <Text style={[styles.modeText, mode === 'video' && styles.modeTextSelected]}>Video</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode('photo')} style={styles.modeButton}>
        <Text style={[styles.modeText, mode === 'photo' && styles.modeTextSelected]}>Photo</Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible) {
    return null;
  }

  if (!permission) {
    return (
      <Modal visible={visible}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading camera...</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible}>
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>We need your permission to show the camera</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant permission</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <CameraView 
          style={styles.camera} 
          facing={cameraType} 
          ref={cameraRef}
          mode="picture"
          enableTorch={false}
          animateShutter={true}
          onCameraReady={() => {
            console.log('📷 Camera is ready!');
            setIsCameraReady(true);
          }}
          onMountError={(error) => {
            console.error('📷 Camera mount error:', error);
            setIsCameraReady(false);
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <TouchableOpacity onPress={onClose} style={styles.topButton}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={restartCamera} style={styles.topButton}>
              <Ionicons name="refresh" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={testCameraFunctionality} style={styles.topButton}>
              <Ionicons name="bug" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Mute/Unmute pressed.')} style={styles.topButton}>
              <Ionicons name="volume-mute-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.sideControls}>
            {renderEditingTools()}
          </View>
          {isRecording && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
            </View>
          )}
          <View style={styles.filterIndicator}>
            <View style={styles.filterIndicatorInner}>
              <Text style={styles.filterNameText}>{selectedFilter}</Text>
            </View>
          </View>
          <View style={styles.bottomControls}>
            <View style={styles.filterScrollContainer}>
              {renderFilterSelector()}
            </View>
            <View style={styles.captureAndToggleContainer}>
              {/* Gallery Thumbnail - Left Side Round Image */}
              <TouchableOpacity onPress={handleGalleryPress} style={styles.galleryThumbnailContainer}>
                {latestGalleryImage ? (
                  <Image 
                    source={{ uri: latestGalleryImage }}
                    style={styles.galleryThumbnail}
                  />
                ) : (
                  <View style={styles.galleryPlaceholder}>
                    <Ionicons name="images-outline" size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Capture Button */}
              <TouchableOpacity
                style={[
                  styles.captureButton, 
                  isRecording && { borderColor: '#ff3b30' },
                  (isCapturing || !isCameraReady) && { opacity: 0.7 }
                ]}
                onPress={handleCapture}
                disabled={isCapturing || !isCameraReady}
              >
                <View style={[
                  styles.captureButtonInner, 
                  isRecording && { backgroundColor: '#ff3b30' },
                  (isCapturing || !isCameraReady) && { backgroundColor: '#ccc' }
                ]} />
              </TouchableOpacity>

              {/* Camera Toggle */}
              <TouchableOpacity onPress={toggleCameraType} style={styles.toggleCameraContainer}>
                <Ionicons name="camera-reverse-outline" size={28} color="white" />
              </TouchableOpacity>
            </View>
            {renderModeSelector()}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    zIndex: 10,
  },
  topButton: {
    padding: 10,
  },
  sideControls: {
    position: 'absolute',
    right: 15,
    top: height * 0.3,
    zIndex: 10,
  },
  editingToolsContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 5,
  },
  editingToolButton: {
    padding: 10,
  },
  editingToolText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterIndicator: {
    position: 'absolute',
    top: height * 0.25,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  filterIndicatorInner: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  filterNameText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  filterScrollContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterSelectorContainer: {
    flexDirection: 'row',
  },
  filterItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  filterThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterSelected: {
    borderColor: 'white',
  },
  filterName: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  captureAndToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  // Gallery thumbnail styles (Left side round image)
  galleryThumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  galleryThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCameraContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 5,
  },
  modeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  modeText: {
    color: 'gray',
    fontWeight: 'bold',
  },
  modeTextSelected: {
    color: 'white',
  },
});

export default CameraStoryScreen;
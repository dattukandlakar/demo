// MainStoryFlow.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import StoryUploadScreen from './StoryUploadScreen';
import CameraStoryScreen from './CameraStoryScreen';
import StoryEditorScreen from './StoryEditorScreen';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface MainStoryFlowProps {
  onClose: () => void;
}

const MainStoryFlow: React.FC<MainStoryFlowProps> = ({ onClose }) => {
  const [screen, setScreen] = useState<'gallery' | 'camera' | 'editor'>('camera');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isProcessingCapture, setIsProcessingCapture] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMediaSelect = useCallback((media: any) => {
    // console.log('Media selected from gallery:', media);
    setSelectedContent({ ...media, source: 'Gallery' });
    setScreen('editor');
  }, []);

  const handleCapture = useCallback((media: any) => {
    // console.log('🎥 Capture initiated, media received:', media);
    if (!media || !media.uri) {
    //   console.error('❌ Capture failed: No media URI received.');
      // Keep the screen on the camera if capture failed
      setIsProcessingCapture(false);
      return;
    }

    const contentWithSource = { ...media, source: 'Camera', filter: '90stethic' };
    // console.log('📱 Captured media, setting content:', contentWithSource);
    setSelectedContent(contentWithSource);

    // Immediately transition to the editor screen
    // console.log('🎯 Transitioning to editor screen...');
    setScreen('editor');

    // A small delay to reset the processing state after the transition is initiated.
    transitionTimeoutRef.current = setTimeout(() => {
      setIsProcessingCapture(false);
      console.log('✅ Capture processing state reset.');
    }, 500);

  }, []);

  const handleCameraPress = useCallback(() => {
    // console.log('📷 Switching to camera from gallery');
    setScreen('camera');
  }, []);

  const handleGalleryPress = useCallback(() => {
    // console.log('🖼️ Switching to gallery from camera');
    setScreen('gallery');
  }, []);

  const handleEditorClose = useCallback(() => {
    // console.log('📝 Closing editor, going back to camera');
    setSelectedContent(null);
    setScreen('camera');
  }, []);

  const handleUploadSuccess = useCallback(() => {
    // console.log('✅ Upload successful, closing flow');
    setSelectedContent(null);
    onClose();
  }, [onClose]);
  
  const handleCameraClose = useCallback(() => {
    // console.log('❌ Closing camera flow');
    setSelectedContent(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

//   console.log('🔄 MainStoryFlow render:', {
//     screen,
//     hasContent: !!selectedContent,
//     isProcessing: isProcessingCapture
//   });

  if (isProcessingCapture) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <StoryUploadScreen
        visible={screen === 'gallery'}
        onClose={handleCameraClose}
        onMediaSelect={handleMediaSelect}
        onCameraPress={handleCameraPress}
      />
      <CameraStoryScreen
        visible={screen === 'camera'}
        onClose={handleCameraClose}
        onCapture={handleCapture}
        onGalleryPress={handleGalleryPress}
        onCaptureStart={() => setIsProcessingCapture(true)}
      />
      <StoryEditorScreen
        visible={screen === 'editor'}
        onClose={handleEditorClose}
        content={selectedContent}
        onUploadSuccess={handleUploadSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  }
});

export default MainStoryFlow;
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Image, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { X, Type, Infinity, Sparkles, ChevronDown, Image as ImageIcon, RotateCcw } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LiveCameraScreenProps {
  onClose: () => void;
  onMediaSelect: (uri: string, type: 'image' | 'video') => void;
  onGalleryOpen: () => void;
}

export const LiveCameraScreen: React.FC<LiveCameraScreenProps> = ({
  onClose,
  onMediaSelect,
  onGalleryOpen,
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [type, setType] = useState(CameraType.back);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) {
        onMediaSelect(photo.uri, 'image');
      }
    }
  };

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to select photos!');
      return;
    }
    onGalleryOpen();
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.rightButtons}>
            <TouchableOpacity style={styles.toolButton}>
              <Text style={styles.toolText}>Aa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton}>
              <Infinity size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton}>
              <Sparkles size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton}>
              <ChevronDown size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={pickImageFromLibrary} style={styles.galleryButton}>
            <ImageIcon size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
            <View style={styles.captureInnerCircle} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rotateButton}
            onPress={() => {
              setType(
                type === CameraType.back ? CameraType.front : CameraType.back
              );
            }}
          >
            <RotateCcw size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  closeButton: {
    padding: 8,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  toolButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  toolText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  galleryButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  rotateButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});

export default LiveCameraScreen;
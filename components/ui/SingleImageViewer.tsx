import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  Animated,
  SafeAreaView,
} from 'react-native';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Repeat2,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface SingleImageViewerProps {
  visible: boolean;
  imageUri: string;
  postId: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  onClose: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onRepost?: () => void;
}

export const SingleImageViewer: React.FC<SingleImageViewerProps> = ({
  visible,
  imageUri,
  postId,
  likes = 0,
  comments = 0,
  isLiked = false,
  onClose,
  onLike,
  onComment,
  onShare,
  onRepost,
}) => {
  const [overlayVisible, setOverlayVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleOverlay = () => {
    if (overlayVisible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setOverlayVisible(false));
    } else {
      setOverlayVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderOverlay = () => (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents={overlayVisible ? 'auto' : 'none'}
    >
      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </SafeAreaView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <View style={styles.actions}>
          {onLike && (
            <TouchableOpacity style={styles.actionButton} onPress={onLike}>
              <Heart
                size={28}
                color={isLiked ? Colors.dark.error : '#fff'}
                fill={isLiked ? Colors.dark.error : 'transparent'}
              />
              {likes > 0 && <Text style={styles.actionText}>{likes}</Text>}
            </TouchableOpacity>
          )}

          {onComment && (
            <TouchableOpacity style={styles.actionButton} onPress={onComment}>
              <MessageCircle size={28} color="#fff" />
              {comments > 0 && <Text style={styles.actionText}>{comments}</Text>}
            </TouchableOpacity>
          )}

          {onRepost && (
            <TouchableOpacity style={styles.actionButton} onPress={onRepost}>
              <Repeat2 size={28} color="#fff" />
            </TouchableOpacity>
          )}

          {onShare && (
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Share2 size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.imageContainer}
          activeOpacity={1}
          onPress={toggleOverlay}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {renderOverlay()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default SingleImageViewer;

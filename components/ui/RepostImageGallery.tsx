import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface RepostImageGalleryProps {
  images: string[];
  onImagePress?: (imageUri: string, index: number) => void;
}

export const RepostImageGallery: React.FC<RepostImageGalleryProps> = memo(({
  images,
  onImagePress,
}) => {
  const containerWidth = width - 56; // Account for PostCard padding (16*2) + repost container padding (12*2)
  const imageHeight = 150; // Fixed height for repost images
  
  const renderImage = (imageUri: string, index: number) => {
    const imageWidth = images.length === 1 
      ? containerWidth 
      : Math.min(containerWidth * 0.7, imageHeight * 1.5); // Responsive width
    
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.9}
        onPress={() => onImagePress?.(imageUri, index)}
        style={[
          styles.imageContainer,
          {
            width: imageWidth,
            height: imageHeight,
            marginRight: index === images.length - 1 ? 0 : 8,
          }
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>
    );
  };

  if (!images || images.length === 0) return null;

  return (
    <View style={styles.container}>
      {images.length === 1 ? (
        // Single image
        <View style={styles.singleImageContainer}>
          {renderImage(images[0], 0)}
        </View>
      ) : (
        // Multiple images - horizontal scroll
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {images.map((imageUri, index) => renderImage(imageUri, index))}
        </ScrollView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  singleImageContainer: {
    alignItems: 'flex-start',
  },
  scrollContent: {
    paddingRight: 0,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.dark.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default RepostImageGallery;

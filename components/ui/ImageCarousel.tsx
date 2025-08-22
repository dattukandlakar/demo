import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface ImageCarouselProps {
  images: string[];
  onImagePress?: (index: number) => void;
  containerPadding?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onImagePress,
  containerPadding = 16,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const imageWidth = width - containerPadding * 2;
  const imageHeight = 280;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
    setActiveIndex(index);
  };

  const renderImage = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onImagePress?.(index)}
      style={styles.imageContainer}
    >
      <Image
        source={{ uri: item }}
        style={[styles.image, { width: imageWidth, height: imageHeight }]}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderPageIndicators = () => {
    if (images.length <= 1) return null;

    return (
      <View style={styles.pageIndicatorContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.pageIndicator,
              index === activeIndex ? styles.activePageIndicator : styles.inactivePageIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  if (!images || images.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={renderImage}
        keyExtractor={(item, index) => `carousel-image-${index}`}
        contentContainerStyle={styles.flatListContent}
        snapToInterval={imageWidth}
        decelerationRate="fast"
        snapToAlignment="center"
        getItemLayout={(data, index) => ({
          length: imageWidth,
          offset: imageWidth * index,
          index,
        })}
      />
      {renderPageIndicators()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  flatListContent: {
    paddingRight: 0,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 12,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  pageIndicator: {
    height: 6,
    borderRadius: 3,
  },
  activePageIndicator: {
    width: 20,
    backgroundColor: Colors.dark.tint,
  },
  inactivePageIndicator: {
    width: 6,
    backgroundColor: Colors.dark.subtext,
    opacity: 0.5,
  },
});

export default ImageCarousel;

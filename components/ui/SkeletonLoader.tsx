import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface PostCardSkeletonProps {
  showImages?: boolean;
}

// Enhanced skeleton with better performance for fast scrolling
export const PostCardSkeleton: React.FC<PostCardSkeletonProps> = ({ 
  showImages = false 
}) => {
  return (
    <View style={styles.postCardSkeleton}>
      {/* Header */}
      <View style={styles.headerSkeleton}>
        <View style={[styles.skeleton, styles.avatarSkeleton]} />
        <View style={styles.headerTextSkeleton}>
          <View style={[styles.skeleton, styles.nameSkeleton]} />
          <View style={[styles.skeleton, styles.timeSkeleton]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentSkeleton}>
        <View style={[styles.skeleton, styles.contentLine1]} />
        <View style={[styles.skeleton, styles.contentLine2]} />
        <View style={[styles.skeleton, styles.contentLine3]} />
      </View>

      {/* Images */}
      {showImages && (
        <View style={styles.imageSkeleton}>
          <View style={[styles.skeleton, styles.imageSkeletonView]} />
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSkeleton}>
        <View style={[styles.skeleton, styles.actionSkeleton]} />
        <View style={[styles.skeleton, styles.actionSkeleton]} />
        <View style={[styles.skeleton, styles.actionSkeleton]} />
      </View>
    </View>
  );
};

// Fast skeleton for extremely quick renders during fast scroll
export const FastPostCardSkeleton: React.FC<PostCardSkeletonProps> = ({ 
  showImages = false 
}) => {
  return (
    <View style={styles.fastSkeleton}>
      <View style={styles.fastSkeletonContent} />
      {showImages && <View style={styles.fastSkeletonImage} />}
    </View>
  );
};

export const StoryCircleSkeleton: React.FC = () => {
  return (
    <View style={styles.storyCircleSkeleton}>
      <SkeletonLoader width={64} height={64} borderRadius={32} />
      <SkeletonLoader width={50} height={12} style={{ marginTop: 4 }} />
    </View>
  );
};

export const StoriesSectionSkeleton: React.FC = () => {
  return (
    <View style={styles.storiesSectionSkeleton}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StoryCircleSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.dark.border,
  },
  postCardSkeleton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTextSkeleton: {
    marginLeft: 12,
    flex: 1,
  },
  contentSkeleton: {
    marginBottom: 12,
  },
  imageSkeleton: {
    marginBottom: 12,
  },
  actionsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyCircleSkeleton: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  storiesSectionSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 10,
  },
  // Enhanced skeleton styles
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameSkeleton: {
    width: 120,
    height: 14,
    borderRadius: 4,
  },
  timeSkeleton: {
    width: 80,
    height: 12,
    borderRadius: 4,
    marginTop: 4,
  },
  contentLine1: {
    width: '100%',
    height: 16,
    borderRadius: 4,
  },
  contentLine2: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  contentLine3: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  imageSkeletonView: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  actionSkeleton: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
  // Fast skeleton styles for extreme performance
  fastSkeleton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 120,
  },
  fastSkeletonContent: {
    backgroundColor: Colors.dark.border,
    height: 60,
    borderRadius: 8,
    marginBottom: 12,
    opacity: 0.3,
  },
  fastSkeletonImage: {
    backgroundColor: Colors.dark.border,
    height: 160,
    borderRadius: 12,
    opacity: 0.3,
  },
  // Profile skeleton styles
  profileFullSkeleton: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  profileHeaderSkeleton: {
    backgroundColor: Colors.dark.background,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  profileAvatarSkeleton: {
    marginRight: 16,
  },
  profileInfoSkeleton: {
    flex: 1,
  },
  profileStatsSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileStatItem: {
    marginRight: 12,
  },
  profileStatsMain: {
    flex: 1,
  },
  profileTabsSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  profileContentSkeleton: {
    padding: 16,
  },
  aboutSectionSkeleton: {
    marginBottom: 24,
  },
  sectionHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionContentSkeleton: {
    // Content area
  },
  portfolioGridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioItemSkeleton: {
    width: '48%',
    marginBottom: 16,
  },
});

// Profile-specific skeleton components
export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <View style={styles.profileHeaderSkeleton}>
      <View style={styles.profileSection}>
        <View style={styles.profileAvatarSkeleton}>
          <SkeletonLoader width={80} height={80} borderRadius={40} />
        </View>
        <View style={styles.profileInfoSkeleton}>
          <SkeletonLoader width={150} height={18} style={{ marginBottom: 6 }} />
          <SkeletonLoader width={200} height={14} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={120} height={12} />
        </View>
      </View>
      
      <View style={styles.profileStatsSkeleton}>
        <View style={styles.profileStatItem}>
          <SkeletonLoader width={60} height={40} borderRadius={12} />
        </View>
        <View style={styles.profileStatsMain}>
          <SkeletonLoader width="100%" height={44} borderRadius={12} />
        </View>
      </View>
      
      <View style={styles.profileTabsSkeleton}>
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonLoader 
            key={index} 
            width={60} 
            height={32} 
            borderRadius={16} 
            style={{ marginRight: 12 }} 
          />
        ))}
      </View>
    </View>
  );
};

export const ProfileContentSkeleton: React.FC<{ activeTab?: string }> = ({ activeTab = 'about' }) => {
  if (activeTab === 'posts' || activeTab === 'ideas') {
    return (
      <View style={styles.profileContentSkeleton}>
        {Array.from({ length: 3 }).map((_, index) => (
          <PostCardSkeleton key={index} showImages={Math.random() > 0.5} />
        ))}
      </View>
    );
  }
  
  if (activeTab === 'portfolio') {
    return (
      <View style={styles.profileContentSkeleton}>
        <View style={styles.portfolioGridSkeleton}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.portfolioItemSkeleton}>
              <SkeletonLoader width="100%" height={120} borderRadius={12} />
              <SkeletonLoader width="80%" height={14} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      </View>
    );
  }
  
  // About tab skeleton
  return (
    <View style={styles.profileContentSkeleton}>
      {Array.from({ length: 4 }).map((_, sectionIndex) => (
        <View key={sectionIndex} style={styles.aboutSectionSkeleton}>
          <View style={styles.sectionHeaderSkeleton}>
            <SkeletonLoader width={120} height={18} />
            <SkeletonLoader width={32} height={32} borderRadius={16} />
          </View>
          <View style={styles.sectionContentSkeleton}>
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, lineIndex) => (
              <SkeletonLoader 
                key={lineIndex}
                width={`${Math.random() * 40 + 60}%`}
                height={16}
                style={{ marginBottom: 8 }}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export const ProfileFullSkeleton: React.FC = () => {
  return (
    <View style={styles.profileFullSkeleton}>
      <ProfileHeaderSkeleton />
      <ProfileContentSkeleton />
    </View>
  );
};

export default SkeletonLoader;

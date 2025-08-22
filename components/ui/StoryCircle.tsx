import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ViewStyle, 
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';
import { Plus, Camera } from 'lucide-react-native';
import Avatar from './Avatar';
import Colors from '@/constants/colors';

interface StoryCircleProps {
  imageUrl: string;
  name: string;
  viewed?: boolean;
  hasStories?: boolean;
  onPress: () => void;
  onAddStory?: () => void;
  size?: number;
  style?: ViewStyle;
  streak?: number;
  uploadProgress?: number;
  isUploading?: boolean;
  isAddStory?: boolean;
  storyCount?: number;
}

export const StoryCircle: React.FC<StoryCircleProps> = ({
  imageUrl,
  name,
  viewed = false,
  hasStories = false,
  onPress,
  onAddStory,
  size = 70,
  style,
  streak,
  uploadProgress = 0,
  isUploading = false,
  isAddStory = false,
  storyCount = 0,
}) => {
  const borderWidth = size * 0.05;
  const avatarSize = size - borderWidth * 2;
  const radius = size / 2 - borderWidth;
  const circumference = 2 * Math.PI * radius;
  
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isUploading) {
      Animated.timing(progressAnim, {
        toValue: uploadProgress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [uploadProgress, isUploading]);

  const handlePress = () => {
    if (isAddStory && onAddStory) {
      onAddStory();
    } else {
      onPress();
    }
  };

  const handleAddStoryPress = (e: any) => {
    e.stopPropagation();
    if (onAddStory) {
      onAddStory();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <View style={styles.storyContainer}>
        {isAddStory ? (
          <View
            style={[
              styles.addStoryContainer,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              }
            ]}
          >
            <View style={styles.addStoryGradient}>
              <Camera size={size * 0.4} color="#fff" />
            </View>
            <View style={styles.addStoryPlusIcon}>
              <Plus size={16} color="#fff" />
            </View>
          </View>
        ) : isUploading ? (
          <View style={[
            styles.uploadingContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            }
          ]}>
            <Svg width={size} height={size} style={styles.progressCircle}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={Colors.dark.primary}
                strokeWidth={borderWidth}
                strokeDasharray={circumference}
                strokeDashoffset={progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [circumference, 0],
                })}
                strokeLinecap="round"
                fill="transparent"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>
            <View
              style={[
                styles.avatarContainer,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
            >
              <Avatar source={imageUrl} size={avatarSize} />
            </View>
            <Animated.Text style={[
              styles.uploadProgressText,
              {
                fontSize: size * 0.15,
                top: size / 2 - (size * 0.15) / 2,
              }
            ]}>
              {progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })}
            </Animated.Text>
          </View>
        ) : hasStories && !viewed ? (
          <LinearGradient
            colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientBorder,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
            >
              <Avatar source={imageUrl} size={avatarSize} />
            </View>
          </LinearGradient>
        ) : hasStories && viewed ? (
          <View
            style={[
              styles.viewedBorder,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
            >
              <Avatar source={imageUrl} size={avatarSize} />
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.noBorder,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
            >
              <Avatar source={imageUrl} size={avatarSize} />
            </View>
          </View>
        )}

        {/* This is the block that has been removed */}
        {/*
        {name === "Your Story" && !isAddStory && onAddStory && (
          <TouchableOpacity
            style={[
              styles.addIconContainer,
              {
                bottom: size * 0.15,
                right: size * 0.05,
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: size * 0.175,
              }
            ]}
            onPress={handleAddStoryPress}
            activeOpacity={0.8}
          >
            <Plus size={size * 0.2} color="#fff" />
          </TouchableOpacity>
        )}
        */}

        {streak !== undefined && streak > 0 && (
          <View style={[
            styles.streakContainer,
            {
              bottom: size * 0.05,
              right: size * 0.05,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
            }
          ]}>
            <Text style={[
              styles.streakText,
              { fontSize: size * 0.12 }
            ]}>
              {streak}
            </Text>
          </View>
        )}

        {/* Change the condition here to only show the badge for "Your Story" */}
        {storyCount > 0 && name === "Your Story" && (
          <View style={[
            styles.storyCountBadge,
            {
              top: -size * 0.05,
              right: -size * 0.05,
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: size * 0.175,
            }
          ]}>
            <Text style={[
              styles.storyCountText,
              { fontSize: size * 0.12 }
            ]}>
              {storyCount}
            </Text>
          </View>
        )}

        {isUploading && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <Text style={[
        styles.name,
        { 
          fontSize: size * 0.17,
          maxWidth: size * 1.2,
          marginTop: size * 0.06,
        }
      ]} numberOfLines={1}>
        {isAddStory ? "Create" : name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 3,
  },
  storyContainer: {
    position: 'relative',
  },
  
  addStoryContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  addStoryGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    position: 'relative',
  },
  addStoryPlusIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.dark.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },

  uploadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircle: {
    position: 'absolute',
  },
  uploadProgressText: {
    position: 'absolute',
    color: Colors.dark.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  liveIndicator: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -15,
    backgroundColor: '#ff4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },

  gradientBorder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewedBorder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  noBorder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  avatarContainer: {
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  addIconContainer: {
    position: 'absolute',
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.dark.background,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  streakContainer: {
    position: 'absolute',
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  streakText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  storyCountBadge: {
    position: 'absolute',
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  storyCountText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  name: {
    color: Colors.dark.text,
    textAlign: 'center',
  },
});

export default StoryCircle;
import React, { memo } from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';

interface AvatarProps {
  source?: string;
  size?: number;
  name?: string;
  style?: ViewStyle;
  showBorder?: boolean;
  showStatus?: boolean;
  statusColor?: string;
  showProgress?: boolean;
  progressPercent?: number;
}

export const Avatar: React.FC<AvatarProps> = memo(({
  source,
  size = 40,
  name,
  style,
  showBorder = false,
  showStatus = false,
  statusColor = Colors.dark.success,
  showProgress = false,
  progressPercent = 10,
}) => {
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: showBorder ? 2 : 0,
          },
        ]}
      >
        {source ? (
          <Image
            source={source}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
            }}
            cachePolicy="memory-disk"
            transition={200}
            contentFit="cover"
          />
        ) : name ? (
          <View
            style={[
              styles.initialsContainer,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.initials,
                {
                  fontSize: size * 0.4,
                },
              ]}
            >
              {getInitials(name)}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          />
        )}
      </View>
      
      {showStatus && (
        <View
          style={[
            styles.status,
            {
              backgroundColor: statusColor,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
      
      {showProgress && (
        <View
          style={[
            styles.progressBadge,
            {
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: size * 0.175,
              top: -size * 0.05,
              right: -size * 0.05,
            },
          ]}
        >
          <Text
            style={[
              styles.progressText,
              {
                fontSize: size * 0.15,
              },
            ]}
          >
            {progressPercent}%
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderColor: Colors.dark.tint,
  },
  initialsContainer: {
    backgroundColor: Colors.dark.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  placeholder: {
    backgroundColor: Colors.dark.border,
  },
  status: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  progressBadge: {
    position: 'absolute',
    backgroundColor: Colors.dark.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  progressText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Avatar;
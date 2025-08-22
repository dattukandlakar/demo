import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import Colors from '@/constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
  icon
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return `${Colors.dark.primary}20`;
      case 'secondary':
        return `${Colors.dark.secondary}20`;
      case 'success':
        return `${Colors.dark.success}20`;
      case 'error':
        return `${Colors.dark.error}20`;
      case 'warning':
        return `${Colors.dark.warning}20`;
      case 'info':
        return `${Colors.dark.info}20`;
      default:
        return Colors.dark.card;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return Colors.dark.primary;
      case 'secondary':
        return Colors.dark.secondary;
      case 'success':
        return Colors.dark.success;
      case 'error':
        return Colors.dark.error;
      case 'warning':
        return Colors.dark.warning;
      case 'info':
        return Colors.dark.info;
      default:
        return Colors.dark.text;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallBadge;
      case 'medium':
        return styles.mediumBadge;
      case 'large':
        return styles.largeBadge;
      default:
        return styles.mediumBadge;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  return (
    <View 
      style={[
        styles.badge,
        getSizeStyle(),
        { backgroundColor: getBackgroundColor() },
        style
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text 
        style={[
          styles.text,
          getTextSizeStyle(),
          { color: getTextColor() },
          textStyle
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  mediumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  largeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontWeight: '500',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
  iconContainer: {
    marginRight: 4,
  },
});

export default Badge;
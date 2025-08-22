import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {
  Github,
  Figma,
  Globe,
  Youtube,
  Linkedin,
  ExternalLink,
  Camera,
  MoreVertical,
  Trash2,
} from 'lucide-react-native';
import { PortfolioItem } from '@/store/portfolio-store';
import Colors from '@/constants/colors';

interface PortfolioCardProps {
  item: PortfolioItem;
  onPress: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
  showActions?: boolean;
}

const getPlatformIcon = (platform: PortfolioItem['platform']) => {
  const iconSize = 24;
  const iconColor = Colors.dark.subtext;
  
  switch (platform) {
    case 'github':
      return <Github size={iconSize} color={iconColor} />;
    case 'figma':
      return <Figma size={iconSize} color="#F24E1E" />;
    case 'dribbble':
      return <Camera size={iconSize} color="#EA4C89" />;
    case 'behance':
      return <Camera size={iconSize} color="#053EFF" />;
    case 'website':
      return <Globe size={iconSize} color={iconColor} />;
    case 'youtube':
      return <Youtube size={iconSize} color="#FF0000" />;
    case 'linkedin':
      return <Linkedin size={iconSize} color="#0077B5" />;
    default:
      return <ExternalLink size={iconSize} color={iconColor} />;
  }
};

const PortfolioCard: React.FC<PortfolioCardProps> = ({ 
  item, 
  onPress, 
  onDelete,
  showActions = true
}) => {
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Debug log to verify we're receiving backend data
  React.useEffect(() => {
    console.log('--- PORTFOLIO CARD DEBUG: Rendering card with backend data:', {
      id: item.id,
      title: item.title,
      description: item.description,
      hasImages: item.images?.length > 0,
      hasLinks: item.links?.length > 0,
      createdAt: item.createdAt,
      userId: item.userId
    });
  }, [item]);

  const handleMenuPress = () => {
    setShowActionSheet(true);
  };


  const handleDelete = () => {
    setShowActionSheet(false);
    Alert.alert(
      'Delete Portfolio',
      'Are you sure you want to delete this portfolio item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(item);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        {/* Three-dot menu in top-right corner */}
        {showActions && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={16} color={Colors.dark.text} />
          </TouchableOpacity>
        )}

        {/* Logo/Platform Icon - centered like add card */}
        <View style={styles.logoContainer}>
          {item.images && item.images.length > 0 ? (
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.logoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.iconFallback}>
              {getPlatformIcon(item.platform)}
            </View>
          )}
        </View>

        {/* Text content area with fixed dimensions */}
        <View style={styles.textArea}>
          {/* Title - centered like add card */}
          <Text style={styles.title} numberOfLines={1}>
            {item.title} 
          </Text>

          {/* Description - allow more lines and adjust size */}
          <Text style={styles.description} numberOfLines={3}>
            {item.description.length > 30 ? `${item.description.substring(0, 30)}...` : item.description}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={styles.actionSheet}>
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color="#ff4444" />
              <Text style={[styles.actionText, { color: '#ff4444' }]}>Delete Portfolio</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    height: 180, // Fixed height instead of minHeight
    position: 'relative',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Subtle accent border like add card
    borderTopWidth: 1,
    borderTopColor: Colors.dark.primary + '40',
  },
  menuButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  iconFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary + '10',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textArea: {
    height: 70, // Fixed height for text area
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
    width: '100%',
    letterSpacing: 0.3,
    height: 20, // Fixed height for title
  },
  description: {
    fontSize: 12,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 15,
    width: '100%',
    opacity: 0.8,
    height: 48, // Fixed height for description (3 lines × 16px)
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSheet: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 220,
    maxWidth: 280,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  actionText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginLeft: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default PortfolioCard;
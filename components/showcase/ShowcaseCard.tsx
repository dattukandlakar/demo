import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { ArrowUp, MoreVertical, Trash2 } from 'lucide-react-native';
import { ShowcaseEntry } from '@/types';
import { useShowcaseStore } from '@/store/showcase-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';

interface ShowcaseCardProps {
  entry: ShowcaseEntry;
  onPress: (entry: ShowcaseEntry) => void;
  onDelete?: (entry: ShowcaseEntry) => void;
  showOwnerActions?: boolean;
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ 
  entry, 
  onPress, 
  onDelete, 
  showOwnerActions = true 
}) => {
  const { upvoteEntry, upvoteShowcase, downvoteShowcase } = useShowcaseStore();
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuButtonRef = useRef<TouchableOpacity>(null);
  
  const isOwner = user && entry?.author?.id === (user.id || user._id);

  const handleUpvote = async (e: any) => {
    e.stopPropagation();
    if (user && entry?.id) {
      // Check if currently upvoted to determine action
      const isCurrentlyUpvoted = entry.upvoters && entry.upvoters.includes(user?.id || user?._id);
      
      if (isCurrentlyUpvoted) {
        // If already upvoted, downvote (remove upvote)
        await downvoteShowcase(entry.id);
      } else {
        // If not upvoted, upvote
        await upvoteShowcase(entry.id);
      }
    }
  };

  const handleMenuPress = (e: any) => {
    e.stopPropagation();
    
    // Get the position of the menu button relative to the screen
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
        setMenuPosition({ x: px - 100, y: py + height + 5 }); // Position near the 3-dot button
        setShowMenu(true);
      });
    } else {
      // Fallback positioning if ref is not available
      setMenuPosition({ x: 0, y: 100 });
      setShowMenu(true);
    }
  };


  const handleDelete = () => {
    setShowMenu(false);
    onDelete?.(entry);
  };

  const isUpvoted = entry.upvoters && user ? entry.upvoters.includes(user?.id || user?._id) : false;
  // Use the real upvote count from API, fallback to upvoters length if not available
  const upvoteCount = entry.upvotes !== undefined ? entry.upvotes : (entry.upvoters ? entry.upvoters.length : 0);

  const titleText = entry?.title?.trim() || 'Hi Tech';
  const tagline = entry?.tagline || entry?.subtitle || entry?.description || 'Your Friendly Tech Partner';

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={() => onPress(entry)} activeOpacity={0.9}>
        {isOwner && showOwnerActions && (
          <View style={styles.menuWrapper}>
            <TouchableOpacity
              ref={menuButtonRef}
              style={styles.menuButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <MoreVertical size={18} color={Colors.dark.subtext} />
            </TouchableOpacity>
          </View>
        )}
      {/* Left: Logo + Text */}
      <View style={styles.leftSection}>
        {/* Logo box */}
        <View style={styles.logoBox}>
          {entry.logo ? (
            <Image source={{ uri: entry.logo }} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoHi}>Hi</Text>
              <Text style={styles.logoWave}>👋</Text>
              <Text style={styles.logoTech}>Tech</Text>
            </View>
          )}
        </View>

        {/* Title and tagline */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>👋 {titleText}</Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {tagline}
          </Text>
        </View>
      </View>

        {/* Right: Upvote */}
        <TouchableOpacity 
          onPress={handleUpvote} 
          activeOpacity={0.7} 
          style={[
            styles.rightSection, 
            isUpvoted && styles.upvotedSection,
            isOwner && showOwnerActions && styles.rightSectionWithMenu
          ]}
        >
          <ArrowUp
            size={22}
            color={isUpvoted ? '#fff' : '#7C3AED'}
          />
          <Text style={[styles.upvoteCount, isUpvoted && styles.upvotedText]}>{upvoteCount}</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View 
            style={[
              styles.menuContainer,
              {
                position: 'absolute',
                top: menuPosition.y,
                right: 20, // Keep it aligned to the right edge
              }
            ]}
          >
            
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Trash2 size={16} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: '84%',
    height: '84%',
  },
  logoFallback: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoHi: {
    color: '#FB923C', // orange
    fontWeight: '800',
    fontSize: 16,
  },
  logoWave: {
    marginHorizontal: 4,
    fontSize: 14,
  },
  logoTech: {
    color: '#2563EB', // blue
    fontWeight: '800',
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    color: Colors.dark.subtext,
    fontSize: 13,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  rightSectionWithMenu: {
    marginRight: 20, // Shift left when 3-dot menu is present
  },
  menuWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    // Removed backgroundColor to make it transparent
  },
  upvoteCount: {
    color: Colors.dark.text,
    marginTop: 4,
    fontWeight: '600',
    fontSize: 12,
  },
  upvotedSection: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  upvotedText: {
    color: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Lighter overlay
  },
  menuContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 120,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    // Shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 16,
  },
});

export default ShowcaseCard;

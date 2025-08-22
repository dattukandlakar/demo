import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Heart, 
  Bookmark 
} from 'lucide-react-native';
import { Event } from '@/types';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useEventStore } from '@/store/event-store';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  compact?: boolean;
}

const { width } = Dimensions.get('window');

const EventCard: React.FC<EventCardProps> = ({ event, onPress, compact = false }) => {
  const { user } = useAuthStore();
  const { likeEvent, bookmarkEvent } = useEventStore();
  
  const isLiked = event.likes?.includes(user?.id || '') || false;
  const isBookmarked = event.bookmarks?.includes(user?.id || '') || false;
  
  const handleLike = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (user) {
      likeEvent(event.id, user.id);
    }
  };
  
  const handleBookmark = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (user) {
      bookmarkEvent(event.id, user.id);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: event.banner }} 
          style={styles.compactImage}
          resizeMode="cover"
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {event.title}
          </Text>
          
          <View style={styles.compactDetails}>
            <View style={styles.compactDetailItem}>
              <Calendar size={14} color={Colors.dark.subtext} />
              <Text style={styles.compactDetailText}>
                {formatDate(event.date)}
              </Text>
            </View>
            
            <View style={styles.compactDetailItem}>
              <MapPin size={14} color={Colors.dark.subtext} />
              <Text style={styles.compactDetailText}>
                {event.isOnline ? 'Online' : event.location.split(',')[0]}
              </Text>
            </View>
          </View>
          
          <View style={styles.compactFooter}>
            <View style={styles.compactAttendees}>
              <Users size={14} color={Colors.dark.subtext} />
              <Text style={styles.compactAttendeesText}>
                {event.attendees.length} attending
              </Text>
            </View>
            
            {event.isPaid ? (
              <View style={styles.compactPriceBadge}>
                <Text style={styles.compactPriceBadgeText}>
                  ₹{event.ticketTypes[0]?.price || 0}
                </Text>
              </View>
            ) : (
              <View style={styles.compactFreeBadge}>
                <Text style={styles.compactFreeBadgeText}>Free</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: event.banner }} 
          style={styles.image}
          resizeMode="cover"
        />
        {event.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{event.category}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          
          {event.isPaid ? (
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>
                ₹{event.ticketTypes[0]?.price || 0}
              </Text>
            </View>
          ) : (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>Free</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {event.shortDescription || event.description}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Calendar size={16} color={Colors.dark.subtext} />
            <Text style={styles.detailText}>
              {formatDate(event.date)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={16} color={Colors.dark.subtext} />
            <Text style={styles.detailText}>
              {event.time}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={16} color={Colors.dark.subtext} />
            <Text style={styles.detailText}>
              {event.isOnline ? 'Online Event' : event.location}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Users size={16} color={Colors.dark.subtext} />
            <Text style={styles.detailText}>
              {event.attendees.length} attending
            </Text>
          </View>
        </View>
        
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tags}>
            {event.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {event.tags.length > 3 && (
              <Text style={styles.moreTags}>+{event.tags.length - 3}</Text>
            )}
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Heart 
                size={18} 
                color={isLiked ? Colors.dark.error : Colors.dark.subtext} 
                fill={isLiked ? Colors.dark.error : 'none'} 
              />
              <Text style={[
                styles.actionText,
                isLiked && { color: Colors.dark.error }
              ]}>
                {event.likes?.length || 0}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleBookmark}
            >
              <Bookmark 
                size={18} 
                color={isBookmarked ? Colors.dark.primary : Colors.dark.subtext} 
                fill={isBookmarked ? Colors.dark.primary : 'none'} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  priceBadge: {
    backgroundColor: `${Colors.dark.primary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priceBadgeText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  freeBadge: {
    backgroundColor: `${Colors.dark.success}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: Colors.dark.success,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: Colors.dark.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.dark.text,
    fontSize: 12,
  },
  moreTags: {
    color: Colors.dark.subtext,
    fontSize: 12,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: Colors.dark.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewButtonText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  // Compact styles
  compactContainer: {
    width: '100%',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  compactImage: {
    width: '100%',
    height: 120,
  },
  compactContent: {
    padding: 12,
  },
  compactTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  compactDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  compactDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  compactDetailText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginLeft: 4,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 8,
  },
  compactAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAttendeesText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginLeft: 4,
  },
  compactPriceBadge: {
    backgroundColor: `${Colors.dark.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactPriceBadgeText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  compactFreeBadge: {
    backgroundColor: `${Colors.dark.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactFreeBadgeText: {
    color: Colors.dark.success,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default EventCard;
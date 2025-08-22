import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Users,
  MapPin,
  Clock,
  Lock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Community } from '@/store/community-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface CommunityCardProps {
  community: Community;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

export default function CommunityCard({ 
  community, 
  isJoined, 
  onJoin, 
  onLeave 
}: CommunityCardProps) {
  const router = useRouter();

  const formatLastActivity = (dateString: string) => {
    const now = new Date();
    const activity = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/community/${community.id}`)}
    >
      <Image source={{ uri: community.coverImage }} style={styles.coverImage} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.icon}>{community.icon}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {community.name}
            </Text>
            {community.isPrivate && (
              <Lock size={16} color={Colors.dark.subtext} style={styles.privateIcon} />
            )}
          </View>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Users size={14} color={Colors.dark.subtext} />
              <Text style={styles.statText}>{community.memberCount}</Text>
            </View>
            {community.location && (
              <View style={styles.statItem}>
                <MapPin size={14} color={Colors.dark.subtext} />
                <Text style={styles.statText} numberOfLines={1}>
                  {community.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {community.description}
        </Text>

        <View style={styles.tagsContainer}>
          {community.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              label={tag}
              variant="secondary"
              size="small"
              style={styles.tag}
            />
          ))}
          {community.tags.length > 3 && (
            <Text style={styles.moreTags}>+{community.tags.length - 3}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.activityContainer}>
            <Clock size={12} color={Colors.dark.subtext} />
            <Text style={styles.activityText}>
              {formatLastActivity(community.lastActivity)}
            </Text>
          </View>

          {isJoined ? (
            <Button
              title="Joined"
              size="small"
              variant="outline"
              onPress={onLeave}
              style={styles.joinButton}
            />
          ) : (
            <Button
              title="Join"
              size="small"
              onPress={onJoin}
              style={styles.joinButton}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  name: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  privateIcon: {
    marginLeft: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    marginRight: 0,
  },
  moreTags: {
    color: Colors.dark.subtext,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityText: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  joinButton: {
    minWidth: 80,
  },
});
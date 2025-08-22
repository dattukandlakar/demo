import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Crown,
  Shield,
  User,
  MoreVertical,
} from 'lucide-react-native';
import { useCommunityStore } from '@/store/community-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  joinedAt: string;
  bio: string;
}

export default function CommunityMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { communities } = useCommunityStore();
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const community = communities.find(c => c.id === id);
  
  if (!community) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Members',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Community not found</Text>
        </View>
      </View>
    );
  }

  // Mock member data - in real app this would come from API
  const mockMembers: Member[] = [
    {
      id: 'user_1',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      role: 'admin',
      joinedAt: '2024-01-15',
      bio: 'Community founder and AI enthusiast'
    },
    {
      id: 'user_2',
      name: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      role: 'moderator',
      joinedAt: '2024-02-01',
      bio: 'Machine learning researcher'
    },
    {
      id: 'user_3',
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      role: 'member',
      joinedAt: '2024-03-10',
      bio: 'Software developer'
    },
    {
      id: 'user_4',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      role: 'member',
      joinedAt: '2024-03-15',
      bio: 'Data scientist'
    },
  ];

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} color={Colors.dark.warning} />;
      case 'moderator':
        return <Shield size={16} color={Colors.dark.tint} />;
      default:
        return <User size={16} color={Colors.dark.subtext} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return Colors.dark.warning;
      case 'moderator':
        return Colors.dark.tint;
      default:
        return Colors.dark.subtext;
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const renderMember = ({ item: member }: { item: Member }) => (
    <TouchableOpacity style={styles.memberCard}>
      <Avatar source={member.avatar} name={member.name} size={50} />
      
      <View style={styles.memberInfo}>
        <View style={styles.memberHeader}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View style={styles.memberRole}>
            {getRoleIcon(member.role)}
            <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
              {member.role}
            </Text>
          </View>
        </View>
        
        <Text style={styles.memberBio} numberOfLines={1}>
          {member.bio}
        </Text>
        
        <Text style={styles.joinDate}>
          Joined {formatJoinDate(member.joinedAt)}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <MoreVertical size={20} color={Colors.dark.subtext} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Badge label={count.toString()} variant="secondary" size="small" />
    </View>
  );

  const admins = filteredMembers.filter(m => m.role === 'admin');
  const moderators = filteredMembers.filter(m => m.role === 'moderator');
  const members = filteredMembers.filter(m => m.role === 'member');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: `Members (${community.memberCount})`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.dark.subtext} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            placeholderTextColor={Colors.dark.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={[
          { type: 'section', title: 'Admins', data: admins },
          { type: 'section', title: 'Moderators', data: moderators },
          { type: 'section', title: 'Members', data: members },
        ]}
        renderItem={({ item }) => {
          if (item.type === 'section') {
            return (
              <View>
                {item.data.length > 0 && renderSectionHeader(item.title, item.data.length)}
                {item.data.map((member) => (
                  <View key={member.id}>
                    {renderMember({ item: member })}
                  </View>
                ))}
              </View>
            );
          }
          return null;
        }}
        keyExtractor={(item, index) => `section-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  memberRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  memberBio: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: 4,
  },
  joinDate: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  moreButton: {
    padding: 8,
  },
});
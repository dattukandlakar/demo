import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Search, MessageSquare } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import SideDrawer from './SideDrawer';
import Avatar from '@/components/ui/Avatar';

interface AppHeaderProps {
  title: string;
  showCreatePost?: boolean;
  showOrgProfile?: boolean;
  onOrgProfilePress?: () => void;
  onCreatePress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  showCreatePost = true,
  showOrgProfile = false,
  onOrgProfilePress,
  onCreatePress
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

  const handleProfilePress = () => {
    setIsSideDrawerOpen(true);
  };

  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  const handleSearchPress = () => {
    router.push('/search');
  };
  
  const handleMessagesPress = () => {
    router.push('/messages');
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Avatar 
              source={user?.avatar} 
              name={user?.name} 
              size={40} 
            />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSearchPress}
          >
            <Search size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleMessagesPress}
          >
            <MessageSquare size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNotificationsPress}
          >
            <Bell size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <SideDrawer 
        isOpen={isSideDrawerOpen} 
        onClose={() => setIsSideDrawerOpen(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppHeader;
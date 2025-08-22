import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Home, 
  Newspaper, 
  Briefcase, 
  Calendar, 
  Award, 
  Settings, 
  LogOut, 
  User, 
  BookOpen, 
  BarChart2 as BarChart, 
  Heart, 
  Star, 
  X,
  MessageSquare,
  Bell,
  Users,
  Shield
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useCommunityStore } from '@/store/community-store';
import Colors from '@/constants/colors';
import Avatar from '@/components/ui/Avatar';

const { width, height } = Dimensions.get('window');

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { communities } = useCommunityStore();
  
  // Check if user is admin of any community
  const isAdmin = user && communities.some(community => 
    community.admins.includes(user.id)
  );

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route);
  };

  const handleLogout = () => {
    logout();
    onClose();
    router.replace('/login');
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* User Profile Section */}
            {user && (
              <TouchableOpacity 
                style={styles.profileSection}
                onPress={() => handleNavigation('/profile')}
              >
                <View style={styles.avatarContainer}>
                  <Image 
                    source={ {uri : user.avatar} } 
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 40 / 2,
                    }}
                  />
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>10%</Text>
                  </View>
                </View>
                
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userBio}>{user.bio || "Hey, I'm on Medial"}</Text>
                  <View style={styles.profileStats}>
                    <Text style={styles.profileStat}>
                      <Text style={styles.statNumber}>{user.followers || 0}</Text> Followers
                    </Text>
                    <View style={styles.statDivider} />
                    <Text style={styles.profileStat}>
                      <Text style={styles.statNumber}>{user.following || 0}</Text> Following
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            {/* Navigation Items */}
            <View style={styles.navSection}>
              <Text style={styles.sectionTitle}>MAIN</Text>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/')}
              >
                <Home size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/news')}
              >
                <Newspaper size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>News</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/jobs')}
              >
                <Briefcase size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Jobs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/events')}
              >
                <Calendar size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Events</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/showcase')}
              >
                <Award size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Showcase</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/communities')}
              >
                <Users size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Communities</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.navSection}>
              <Text style={styles.sectionTitle}>PERSONAL</Text>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/profile')}
              >
                <User size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Profile</Text>
                <View style={styles.profileCompletionBadge}>
                  <Text style={styles.profileCompletionText}>10%</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/messages')}
              >
                <MessageSquare size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Messages</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/notifications')}
              >
                <Bell size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Notifications</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/saved')}
              >
                <Heart size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Saved</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/analytics')}
              >
                <BarChart size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Analytics</Text>
              </TouchableOpacity>
              
              {isAdmin && (
                <TouchableOpacity 
                  style={styles.navItem}
                  onPress={() => handleNavigation('/community/dashboard')}
                >
                  <Shield size={20} color={Colors.dark.tint} />
                  <Text style={[styles.navItemText, { color: Colors.dark.tint }]}>Community Dashboard</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.navSection}>
              <Text style={styles.sectionTitle}>OTHER</Text>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/premium')}
              >
                <Star size={20} color={Colors.dark.primary} />
                <Text style={[styles.navItemText, { color: Colors.dark.primary }]}>Premium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => handleNavigation('/settings')}
              >
                <Settings size={20} color={Colors.dark.text} />
                <Text style={styles.navItemText}>Settings</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={[styles.navItem, styles.logoutButton]}
              onPress={handleLogout}
            >
              <LogOut size={20} color={Colors.dark.error} />
              <Text style={[styles.navItemText, { color: Colors.dark.error }]}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>App Version 1.0.0</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: width * 0.8,
    maxWidth: 320,
    height: '100%',
    backgroundColor: Colors.dark.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
    backgroundColor: Colors.dark.background,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 12,
  },
  progressBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  progressText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userBio: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileStat: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  statNumber: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 8,
  },
  navSection: {
    paddingVertical: 8,
  },
  sectionTitle: {
    color: Colors.dark.subtext,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navItemText: {
    color: Colors.dark.text,
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  profileCompletionBadge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  profileCompletionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
});

export default SideDrawer;
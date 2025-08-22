import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import SideDrawer from './SideDrawer';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import Avatar from '@/components/ui/Avatar';

const { width } = Dimensions.get('window');

interface AppLayoutProps {
  children: React.ReactNode;
  showProfileButton?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children,
  showProfileButton = true
}) => {
  const { user } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-width * 0.8))[0];

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? -width * 0.8 : 0;
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <View style={styles.container}>
      {showProfileButton && (
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={toggleDrawer}
        >
          <Avatar 
            source={user?.avatar} 
            name={user?.name} 
            size={40} 
          />
        </TouchableOpacity>
      )}
      
      {children}
      
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => toggleDrawer()} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  profileButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
});

export default AppLayout;
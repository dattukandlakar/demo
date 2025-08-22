import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ViewStyle
} from 'react-native';
import Colors from '@/constants/colors';

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  style?: ViewStyle;
  scrollable?: boolean;
  variant?: 'underline' | 'filled' | 'pills';
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  style,
  scrollable = false,
  variant = 'underline',
}) => {
  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable ? {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: styles.scrollableContainer,
  } : {};

  const getTabStyle = (isActive: boolean) => {
    switch (variant) {
      case 'filled':
        return isActive ? styles.activeFilledTab : styles.inactiveFilledTab;
      case 'pills':
        return isActive ? styles.activePillTab : styles.inactivePillTab;
      case 'underline':
      default:
        return isActive ? styles.activeUnderlineTab : styles.inactiveUnderlineTab;
    }
  };

  const getTextStyle = (isActive: boolean) => {
    switch (variant) {
      case 'filled':
        return isActive ? styles.activeFilledText : styles.inactiveFilledText;
      case 'pills':
        return isActive ? styles.activePillText : styles.inactivePillText;
      case 'underline':
      default:
        return isActive ? styles.activeUnderlineText : styles.inactiveUnderlineText;
    }
  };

  return (
    <Container 
      style={[styles.container, style]} 
      {...containerProps}
    >


      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              getTabStyle(isActive),
            ]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >

          
            <Text style={[styles.tabText, getTextStyle(isActive)]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}


    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.background,
  },
  scrollableContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Underline variant
  activeUnderlineTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.tint,
  },
  inactiveUnderlineTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeUnderlineText: {
    color: Colors.dark.tint,
    fontWeight: '600',
  },
  inactiveUnderlineText: {
    color: Colors.dark.subtext,
  },
  // Filled variant
  activeFilledTab: {
    backgroundColor: Colors.dark.card,
  },
  inactiveFilledTab: {
    backgroundColor: 'transparent',
  },
  activeFilledText: {
    color: Colors.dark.tint,
    fontWeight: '600',
  },
  inactiveFilledText: {
    color: Colors.dark.subtext,
  },
  // Pills variant
  activePillTab: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 100,
    marginHorizontal: 4,
  },
  inactivePillTab: {
    backgroundColor: 'transparent',
    borderRadius: 100,
    marginHorizontal: 4,
  },
  activePillText: {
    color: '#fff',
    fontWeight: '600',
  },
  inactivePillText: {
    color: Colors.dark.subtext,
  },
});

export default TabBar;
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Linking,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Building, 
  MapPin, 
  Globe, 
  Users, 
  Briefcase,
  ChevronLeft,
  Share2,
  Bell,
  Edit,
  Plus
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useCompanyStore } from '@/store/company-store';
import { useAuthStore } from '@/store/auth-store';
import TabBar from '@/components/ui/TabBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';

// Tab components
import CompanyHomeTab from '@/components/company/CompanyHomeTab';
import CompanyAboutTab from '@/components/company/CompanyAboutTab';
import CompanyPostsTab from '@/components/company/CompanyPostsTab';
import CompanyJobsTab from '@/components/company/CompanyJobsTab';
import CompanyEventsTab from '@/components/company/CompanyEventsTab';

const CompanyPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { companies } = useCompanyStore();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('home');
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Find the company by ID
  const company = companies.find(c => c.id === id);
  
  // Check if user is the owner of the company
  const isOwner = company?.ownerName === user?.name;
  
  useEffect(() => {
    if (!company) {
      // If company not found, redirect to home
      router.replace('/');
    }
  }, [company, router]);
  
  if (!company) {
    return null;
  }
  
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'posts', label: 'Posts' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'events', label: 'Events' },
  ];
  
  const handleWebsitePress = () => {
    if (company.website) {
      Linking.openURL(company.website);
    }
  };
  
  const handleFollowPress = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow functionality
  };
  
  const handleSharePress = () => {
    // TODO: Implement share functionality
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <CompanyHomeTab company={company} />;
      case 'about':
        return <CompanyAboutTab company={company} />;
      case 'posts':
        return <CompanyPostsTab company={company} isOwner={isOwner} />;
      case 'jobs':
        return <CompanyJobsTab company={company} isOwner={isOwner} />;
      case 'events':
        return <CompanyEventsTab company={company} isOwner={isOwner} />;
      default:
        return <CompanyHomeTab company={company} />;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          {isOwner ? (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push(`/company/edit/${id}`)}
            >
              <Edit size={20} color={Colors.dark.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleFollowPress}
            >
              <Bell size={20} color={Colors.dark.text} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSharePress}
          >
            <Share2 size={20} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.coverContainer}>
          <LinearGradient
            colors={Colors.dark.gradient.primary}
            style={styles.coverGradient}
          />
        </View>
        
        <View style={styles.profileSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: company.logo }} 
              style={styles.logo} 
            />
          </View>
          
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{company.name}</Text>
            
            {company.description && (
              <Text style={styles.tagline} numberOfLines={2}>
                {company.description}
              </Text>
            )}
            
            <View style={styles.detailsRow}>
              {company.industry && (
                <View style={styles.detailItem}>
                  <Building size={16} color={Colors.dark.subtext} />
                  <Text style={styles.detailText}>{company.industry}</Text>
                </View>
              )}
              
              {company.address && (
                <View style={styles.detailItem}>
                  <MapPin size={16} color={Colors.dark.subtext} />
                  <Text style={styles.detailText}>{company.address}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statCount}>0</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statCount}>0</Text>
                <Text style={styles.statLabel}>Employees</Text>
              </View>
              
              {company.website && (
                <TouchableOpacity 
                  style={styles.websiteButton}
                  onPress={handleWebsitePress}
                >
                  <Globe size={16} color={Colors.dark.tint} />
                  <Text style={styles.websiteText}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {!isOwner && (
            <View style={styles.actionButtons}>
              <Button
                title={isFollowing ? "Following" : "Follow"}
                onPress={handleFollowPress}
                variant={isFollowing ? "outline" : "primary"}
                style={styles.followButton}
                leftIcon={isFollowing ? null : <Plus size={16} color="#fff" />}
              />
            </View>
          )}
        </View>
        
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          style={styles.tabBar}
        />
        
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileSection: {
    padding: 16,
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    top: -40,
    left: 16,
    backgroundColor: Colors.dark.background,
    borderRadius: 16,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  companyInfo: {
    marginLeft: 100,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.dark.subtext,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    marginRight: 16,
  },
  statCount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.dark.tint}15`,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  websiteText: {
    fontSize: 12,
    color: Colors.dark.tint,
    marginLeft: 4,
  },
  actionButtons: {
    marginTop: 8,
  },
  followButton: {
    width: '100%',
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tabContent: {
    flex: 1,
    minHeight: 400,
  },
});

export default CompanyPage;
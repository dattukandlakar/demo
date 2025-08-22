import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Eye, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export default function AnalyticsScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Analytics',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Performance</Text>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Eye size={20} color={Colors.dark.tint} />
                <Text style={styles.cardTitle}>Profile Views</Text>
              </View>
              <Text style={styles.timeRange}>Last 90 days</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>127</Text>
                <Text style={styles.statLabel}>Total views</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+42%</Text>
                <Text style={styles.statLabel}>vs. previous</Text>
              </View>
            </View>
            
            <View style={styles.graphPlaceholder}>
              <TrendingUp size={24} color={Colors.dark.tint} />
              <Text style={styles.graphPlaceholderText}>View chart</Text>
            </View>
            
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View details</Text>
              <ChevronRight size={16} color={Colors.dark.tint} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Users size={20} color={Colors.dark.tint} />
                <Text style={styles.cardTitle}>Followers</Text>
              </View>
              <Text style={styles.timeRange}>Last 90 days</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>1,245</Text>
                <Text style={styles.statLabel}>Total followers</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+15%</Text>
                <Text style={styles.statLabel}>vs. previous</Text>
              </View>
            </View>
            
            <View style={styles.graphPlaceholder}>
              <TrendingUp size={24} color={Colors.dark.tint} />
              <Text style={styles.graphPlaceholderText}>View chart</Text>
            </View>
            
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View details</Text>
              <ChevronRight size={16} color={Colors.dark.tint} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Performance</Text>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Heart size={20} color={Colors.dark.tint} />
                <Text style={styles.cardTitle}>Likes</Text>
              </View>
              <Text style={styles.timeRange}>Last 30 days</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3,872</Text>
                <Text style={styles.statLabel}>Total likes</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+28%</Text>
                <Text style={styles.statLabel}>vs. previous</Text>
              </View>
            </View>
            
            <LinearGradient
              colors={[`${Colors.dark.tint}20`, `${Colors.dark.tint}05`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topPostsContainer}
            >
              <Text style={styles.topPostsTitle}>Top Performing Post</Text>
              <Text style={styles.topPostsContent} numberOfLines={2}>
                "Just launched our new React Native component library! 🚀 After months of work..."
              </Text>
              <Text style={styles.topPostsStats}>428 likes • 52 comments</Text>
            </LinearGradient>
            
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View all posts</Text>
              <ChevronRight size={16} color={Colors.dark.tint} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.engagementCard}>
            <Text style={styles.engagementTitle}>Engagement Breakdown</Text>
            
            <View style={styles.engagementItem}>
              <View style={styles.engagementIconContainer}>
                <Heart size={18} color={Colors.dark.text} />
              </View>
              <View style={styles.engagementContent}>
                <Text style={styles.engagementLabel}>Likes</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: '80%', backgroundColor: Colors.dark.tint }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.engagementValue}>3,872</Text>
            </View>
            
            <View style={styles.engagementItem}>
              <View style={styles.engagementIconContainer}>
                <MessageCircle size={18} color={Colors.dark.text} />
              </View>
              <View style={styles.engagementContent}>
                <Text style={styles.engagementLabel}>Comments</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: '40%', backgroundColor: Colors.dark.accent }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.engagementValue}>942</Text>
            </View>
            
            <View style={styles.engagementItem}>
              <View style={styles.engagementIconContainer}>
                <Share2 size={18} color={Colors.dark.text} />
              </View>
              <View style={styles.engagementContent}>
                <Text style={styles.engagementLabel}>Shares</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: '25%', backgroundColor: Colors.dark.accent2 }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.engagementValue}>512</Text>
            </View>
            
            <View style={styles.engagementItem}>
              <View style={styles.engagementIconContainer}>
                <Bookmark size={18} color={Colors.dark.text} />
              </View>
              <View style={styles.engagementContent}>
                <Text style={styles.engagementLabel}>Saves</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: '15%', backgroundColor: Colors.dark.info }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.engagementValue}>328</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audience Insights</Text>
          
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Top Locations</Text>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Bangalore, India</Text>
              <Text style={styles.insightValue}>42%</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Mumbai, India</Text>
              <Text style={styles.insightValue}>18%</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Delhi, India</Text>
              <Text style={styles.insightValue}>12%</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Hyderabad, India</Text>
              <Text style={styles.insightValue}>8%</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Other</Text>
              <Text style={styles.insightValue}>20%</Text>
            </View>
          </View>
          
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Industry Breakdown</Text>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Technology</Text>
              <Text style={styles.insightValue}>65%</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Design</Text>
              <Text style={styles.insightValue}>15%</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Marketing</Text>
              <Text style={styles.insightValue}>10%</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Education</Text>
              <Text style={styles.insightValue}>5%</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Other</Text>
              <Text style={styles.insightValue}>5%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  timeRange: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  graphPlaceholder: {
    height: 120,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  graphPlaceholderText: {
    color: Colors.dark.subtext,
    marginTop: 8,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  viewDetailsText: {
    color: Colors.dark.tint,
    fontWeight: '500',
    marginRight: 4,
  },
  topPostsContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  topPostsTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  topPostsContent: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: 8,
  },
  topPostsStats: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  engagementCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  engagementTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  engagementIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  engagementContent: {
    flex: 1,
    marginRight: 12,
  },
  engagementLabel: {
    color: Colors.dark.text,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.dark.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  engagementValue: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  insightsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  insightsTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  insightLabel: {
    color: Colors.dark.text,
  },
  insightValue: {
    color: Colors.dark.tint,
    fontWeight: '600',
  },
});
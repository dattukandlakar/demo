import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Briefcase, Clock, MapPin, DollarSign, Users, ChevronRight, Building2 } from 'lucide-react-native';
import { useCompanyStore } from '@/store/company-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';

export default function CompanyDashboard() {
  const router = useRouter();
  const { activeCompany, jobs, applications } = useCompanyStore();
  const [activeTab, setActiveTab] = useState('active');
  
  if (!activeCompany) {
    router.replace('/company/create');
    return null;
  }
  
  const activeJobs = jobs.filter(job => job.companyId === activeCompany.id && job.status === 'active');
  const closedJobs = jobs.filter(job => job.companyId === activeCompany.id && job.status === 'closed');
  
  const displayJobs = activeTab === 'active' ? activeJobs : closedJobs;
  
  const getApplicationCount = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId).length;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.companyHeader}>
          <View style={styles.companyInfo}>
            {activeCompany.logo ? (
              <Image source={{ uri: activeCompany.logo }} style={styles.companyLogo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Building2 size={30} color={Colors.dark.subtext} />
              </View>
            )}
            <View style={styles.companyDetails}>
              <Text style={styles.companyName}>{activeCompany.name}</Text>
              <Text style={styles.companyLocation}>
                <MapPin size={14} color={Colors.dark.subtext} style={styles.inlineIcon} /> {activeCompany.location}
              </Text>
              <Text style={styles.companyIndustry}>
                <Briefcase size={14} color={Colors.dark.subtext} style={styles.inlineIcon} /> {activeCompany.industry}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push(`/company/edit/${activeCompany.id}`)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeJobs.length}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{closedJobs.length}</Text>
            <Text style={styles.statLabel}>Past Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {applications.filter(app => 
                jobs.some(job => job.companyId === activeCompany.id && job.id === app.jobId)
              ).length}
            </Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <Button 
            title="Post a Job" 
            onPress={() => router.push('/company/job/create')} 
            leftIcon={<Plus size={18} color="#fff" />}
            style={styles.postJobButton}
          />
        </View>
        
        <View style={styles.jobsSection}>
          <Text style={styles.sectionTitle}>My Jobs</Text>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'active' && styles.activeTab]}
              onPress={() => setActiveTab('active')}
            >
              <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'closed' && styles.activeTab]}
              onPress={() => setActiveTab('closed')}
            >
              <Text style={[styles.tabText, activeTab === 'closed' && styles.activeTabText]}>
                Past
              </Text>
            </TouchableOpacity>
          </View>
          
          {displayJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Briefcase size={40} color={Colors.dark.subtext} />
              <Text style={styles.emptyStateText}>
                {activeTab === 'active' 
                  ? "You don't have any active jobs" 
                  : "You don't have any past jobs"}
              </Text>
              {activeTab === 'active' && (
                <Button 
                  title="Post a Job" 
                  onPress={() => router.push('/company/job/create')} 
                  style={styles.emptyStateButton}
                />
              )}
            </View>
          ) : (
            <FlatList
              data={displayJobs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.jobCard}
                  onPress={() => router.push(`/company/job/${item.id}`)}
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <View style={styles.jobTypeTag}>
                      <Text style={styles.jobTypeText}>{item.employmentType}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.jobCardDetails}>
                    <View style={styles.jobDetail}>
                      <MapPin size={16} color={Colors.dark.subtext} />
                      <Text style={styles.jobDetailText}>{item.location}</Text>
                    </View>
                    <View style={styles.jobDetail}>
                      <DollarSign size={16} color={Colors.dark.subtext} />
                      <Text style={styles.jobDetailText}>{item.salary}</Text>
                    </View>
                    <View style={styles.jobDetail}>
                      <Clock size={16} color={Colors.dark.subtext} />
                      <Text style={styles.jobDetailText}>Posted {formatDate(item.postedAt)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.jobCardFooter}>
                    <View style={styles.applicationsCount}>
                      <Users size={16} color={Colors.dark.primary} />
                      <Text style={styles.applicationsCountText}>
                        {getApplicationCount(item.id)} Applications
                      </Text>
                    </View>
                    <ChevronRight size={20} color={Colors.dark.subtext} />
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              style={styles.jobsList}
            />
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  scrollView: {
    flex: 1,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyDetails: {
    marginLeft: 12,
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  companyLocation: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIndustry: {
    fontSize: 14,
    color: Colors.dark.subtext,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineIcon: {
    marginRight: 4,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  editButtonText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postJobButton: {
    backgroundColor: Colors.dark.primary,
  },
  jobsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: Colors.dark.cardBackground,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.dark.primary,
  },
  tabText: {
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
  },
  emptyStateText: {
    color: Colors.dark.subtext,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateButton: {
    width: '100%',
  },
  jobsList: {
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
  },
  jobTypeTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  jobTypeText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  jobCardDetails: {
    marginBottom: 12,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobDetailText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginLeft: 8,
  },
  jobCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  applicationsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationsCountText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});
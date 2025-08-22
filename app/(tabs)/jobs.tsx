// app/(tabs)/jobs.tsx

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Filter, 
  X
} from 'lucide-react-native';
import AppHeader from '@/components/layout/AppHeader';
import JobCard from '@/components/jobs/JobCard';
import Badge from '@/components/ui/Badge';
import TabBar from '@/components/ui/TabBar';
import { useJobStore } from '@/store/job-store';
import { useAuthStore } from '@/store/auth-store';
import { Job, JobApplication } from '@/types';
import Colors from '@/constants/colors';

export default function JobsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { 
    jobs, 
    filteredJobs, 
    filters, 
    fetchJobs, 
    applyFilters, 
    resetFilters,
    isLoading 
  } = useJobStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  
  // Derived state for my applications
  const [myApplications, setMyApplications] = useState<{job: Job, application: JobApplication}[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user && jobs.length > 0) {
      // Filter jobs the user has applied to
      const applications: {job: Job, application: JobApplication}[] = [];
      jobs.forEach(job => {
        const userApplication = job.applications.find(app => app.applicantId === user.id);
        if (userApplication) {
          applications.push({
            job,
            application: userApplication
          });
        }
      });
      setMyApplications(applications);
    }
  }, [jobs, user]);

  const loadData = async () => {
    await fetchJobs();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleJobPress = (job: Job) => {
    router.push(`/job/${job.id}`);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterSelect = (filterType: 'type' | 'location' | 'experience', value: string) => {
    const currentFilters = [...(filters[filterType] || [])];
    const index = currentFilters.indexOf(value);
    
    if (index >= 0) {
      currentFilters.splice(index, 1);
    } else {
      currentFilters.push(value);
    }
    
    applyFilters({ [filterType]: currentFilters });
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const isFilterActive = (filterType: 'type' | 'location' | 'experience', value: string) => {
    return filters[filterType].includes(value);
  };

  const renderFilterSection = () => {
    if (!showFilters) return null;
    
    return (
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Job Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('type', 'Full-time') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('type', 'Full-time')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('type', 'Full-time') && styles.activeFilterChipText
                ]}
              >
                Full-time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('type', 'Part-time') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('type', 'Part-time')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('type', 'Part-time') && styles.activeFilterChipText
                ]}
              >
                Part-time
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('type', 'Contract') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('type', 'Contract')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('type', 'Contract') && styles.activeFilterChipText
                ]}
              >
                Contract
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('type', 'Internship') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('type', 'Internship')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('type', 'Internship') && styles.activeFilterChipText
                ]}
              >
                Internship
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('type', 'Remote') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('type', 'Remote')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('type', 'Remote') && styles.activeFilterChipText
                ]}
              >
                Remote
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Location</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('location', 'Bangalore') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('location', 'Bangalore')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('location', 'Bangalore') && styles.activeFilterChipText
                ]}
              >
                Bangalore
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('location', 'Mumbai') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('location', 'Mumbai')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('location', 'Mumbai') && styles.activeFilterChipText
                ]}
              >
                Mumbai
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('location', 'Delhi') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('location', 'Delhi')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('location', 'Delhi') && styles.activeFilterChipText
                ]}
              >
                Delhi
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('location', 'Hyderabad') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('location', 'Hyderabad')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('location', 'Hyderabad') && styles.activeFilterChipText
                ]}
              >
                Hyderabad
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('location', 'Remote') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('location', 'Remote')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('location', 'Remote') && styles.activeFilterChipText
                ]}
              >
                Remote
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Experience</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('experience', '0-2 years') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('experience', '0-2 years')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('experience', '0-2 years') && styles.activeFilterChipText
                ]}
              >
                0-2 years
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('experience', '3-5 years') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('experience', '3-5 years')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('experience', '3-5 years') && styles.activeFilterChipText
                ]}
              >
                3-5 years
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                isFilterActive('experience', '5+ years') && styles.activeFilterChip
              ]}
              onPress={() => handleFilterSelect('experience', '5+ years')}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  isFilterActive('experience', '5+ years') && styles.activeFilterChipText
                ]}
              >
                5+ years
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetFilters}
        >
          <X size={16} color={Colors.dark.text} />
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderJobsHeader = () => (
    <>
      <View style={styles.filterHeader}>
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={toggleFilters}
        >
          <Filter size={18} color={Colors.dark.text} />
          <Text style={styles.filterToggleText}>Filters</Text>
        </TouchableOpacity>
        
        <View style={styles.activeFiltersContainer}>
          {Object.entries(filters).map(([type, values]) => 
            values.map((value: string, index: number) => (
              <Badge 
                key={`${type}-${value}-${index}`}
                label={value}
                variant="primary"
                size="small"
                style={styles.filterBadge}
              />
            ))
          )}
        </View>
      </View>
      
      {renderFilterSection()}
    </>
  );

  const renderApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge label="Pending" variant="warning" />;
      case 'reviewing':
        return <Badge label="Reviewing" variant="info" />;
      case 'accepted':
        return <Badge label="Accepted" variant="success" />;
      case 'rejected':
        return <Badge label="Rejected" variant="error" />;
      default:
        return <Badge label="Pending" variant="warning" />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'jobs':
        return (
          <ScrollView 
            style={styles.tabContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.tint}
                colors={[Colors.dark.tint]}
              />
            }
          >
            {/* My Applications Section */}
            {user && myApplications.length > 0 && (
              <View style={styles.myApplicationsSection}>
                <Text style={styles.sectionTitle}>My Applications</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {myApplications.map(({ job, application }) => (
                    <View key={job.id} style={styles.horizontalJobCard}>
                      <View style={styles.applicationCard}>
                        <JobCard 
                          job={job} 
                          onPress={() => handleJobPress(job)}
                          compact
                        />
                        <View style={styles.applicationStatus}>
                          {renderApplicationStatusBadge(application.status)}
                          <Text style={styles.applicationDate}>
                            Applied on {new Date(application.appliedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {renderJobsHeader()}
            
            {/* All Jobs Section */}
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id}
                job={job} 
                onPress={() => handleJobPress(job)} 
              />
            ))}
          </ScrollView>
        );
      
      case 'applications':
        return (
          <ScrollView 
            style={styles.tabContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.tint}
                colors={[Colors.dark.tint]}
              />
            }
          >
            <Text style={styles.sectionTitle}>My Applications</Text>
            {myApplications && myApplications.length > 0 ? (
              myApplications.map(({ job, application }) => (
                <TouchableOpacity 
                  key={job.id} 
                  style={styles.applicationListCard}
                  onPress={() => handleJobPress(job)}
                >
                  <View style={styles.applicationListHeader}>
                    <JobCard 
                      job={job} 
                      onPress={() => handleJobPress(job)}
                      compact
                    />
                    {renderApplicationStatusBadge(application.status)}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>You haven't applied to any jobs yet</Text>
              </View>
            )}
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title="Jobs"
        showCreatePost={false}
      />
      
      <TabBar
        tabs={[
          { id: 'jobs', label: 'Jobs' },
          { id: 'applications', label: 'Applications' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  filterToggleText: {
    color: Colors.dark.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: 8,
  },
  filterBadge: {
    marginRight: 6,
    marginBottom: 6,
  },
  filtersContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    color: Colors.dark.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: Colors.dark.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: `${Colors.dark.tint}20`,
  },
  filterChipText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  activeFilterChipText: {
    color: Colors.dark.tint,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  resetButtonText: {
    color: Colors.dark.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  myApplicationsSection: {
    marginBottom: 24,
  },
  horizontalScroll: {
    marginTop: 8,
    marginBottom: 8,
  },
  horizontalJobCard: {
    width: 280,
    marginRight: 12,
  },
  applicationCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  applicationStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  applicationDate: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyStateContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 16,
  },
  applicationListCard: {
    marginBottom: 16,
  },
  applicationListHeader: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
  }
});
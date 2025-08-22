import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, DollarSign, Calendar, Clock, Briefcase, Users, ChevronRight, Mail, Phone, FileText, Check, X, Edit, Trash2 } from 'lucide-react-native';
import { useCompanyStore } from '@/store/company-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { jobs, applications, activeCompany, updateJob, deleteJob } = useCompanyStore();
  const [activeTab, setActiveTab] = useState('details');
  
  const job = jobs.find(j => j.id === id);
  const jobApplications = applications.filter(app => app.jobId === id);
  
  if (!job || !activeCompany) {
    router.replace('/company/dashboard');
    return null;
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleCloseJob = () => {
    updateJob(job.id, { status: 'closed' });
    router.back();
  };
  
  const handleDeleteJob = () => {
    deleteJob(job.id);
    router.replace('/company/dashboard');
  };
  
  const handleUpdateApplicationStatus = (applicationId: string, status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected') => {
    const { updateApplication } = useCompanyStore.getState();
    updateApplication(applicationId, { status });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
            Applications ({jobApplications.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {activeTab === 'details' ? (
          <View style={styles.content}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={styles.jobTypeTag}>
                <Text style={styles.jobTypeText}>{job.employmentType.replace('-', ' ')}</Text>
              </View>
            </View>
            
            <View style={styles.jobMeta}>
              <View style={styles.metaItem}>
                <MapPin size={16} color={Colors.dark.subtext} />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <DollarSign size={16} color={Colors.dark.subtext} />
                <Text style={styles.metaText}>{job.salary}</Text>
              </View>
              <View style={styles.metaItem}>
                <Briefcase size={16} color={Colors.dark.subtext} />
                <Text style={styles.metaText}>{job.experienceLevel} level</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={16} color={Colors.dark.subtext} />
                <Text style={styles.metaText}>Posted {formatDate(job.postedAt)}</Text>
              </View>
              {job.deadline && (
                <View style={styles.metaItem}>
                  <Calendar size={16} color={Colors.dark.subtext} />
                  <Text style={styles.metaText}>Deadline: {job.deadline}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{job.description}</Text>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Skills</Text>
              <View style={styles.skillsContainer}>
                {job.skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Applications</Text>
              <View style={styles.applicationStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{jobApplications.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {jobApplications.filter(app => app.status === 'pending').length}
                  </Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {jobApplications.filter(app => app.status === 'shortlisted').length}
                  </Text>
                  <Text style={styles.statLabel}>Shortlisted</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => router.push(`/company/job/edit/${job.id}`)}
              >
                <Edit size={20} color={Colors.dark.text} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              
              {job.status === 'active' ? (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleCloseJob}
                >
                  <X size={20} color="#fff" />
                  <Text style={styles.closeButtonText}>Close Job</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDeleteJob}
                >
                  <Trash2 size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {jobApplications.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={40} color={Colors.dark.subtext} />
                <Text style={styles.emptyStateText}>
                  No applications received yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={jobApplications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.applicationCard}>
                    <View style={styles.applicationHeader}>
                      <Text style={styles.applicantName}>{item.name}</Text>
                      <View style={[
                        styles.statusTag,
                        item.status === 'pending' && styles.pendingTag,
                        item.status === 'reviewed' && styles.reviewedTag,
                        item.status === 'shortlisted' && styles.shortlistedTag,
                        item.status === 'rejected' && styles.rejectedTag,
                      ]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.applicationMeta}>
                      <View style={styles.metaItem}>
                        <Mail size={16} color={Colors.dark.subtext} />
                        <Text style={styles.metaText}>{item.email}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Phone size={16} color={Colors.dark.subtext} />
                        <Text style={styles.metaText}>{item.phone}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Calendar size={16} color={Colors.dark.subtext} />
                        <Text style={styles.metaText}>Applied on {formatDate(item.appliedAt)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.resumeSection}>
                      <TouchableOpacity style={styles.resumeButton}>
                        <FileText size={16} color={Colors.dark.primary} />
                        <Text style={styles.resumeButtonText}>View Resume</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.applicationActions}>
                      {item.status !== 'shortlisted' && (
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleUpdateApplicationStatus(item.id, 'shortlisted')}
                        >
                          <Check size={16} color={Colors.dark.success} />
                          <Text style={[styles.actionButtonText, { color: Colors.dark.success }]}>
                            Shortlist
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {item.status !== 'reviewed' && item.status !== 'shortlisted' && (
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleUpdateApplicationStatus(item.id, 'reviewed')}
                        >
                          <Check size={16} color={Colors.dark.primary} />
                          <Text style={[styles.actionButtonText, { color: Colors.dark.primary }]}>
                            Mark as Reviewed
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {item.status !== 'rejected' && (
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleUpdateApplicationStatus(item.id, 'rejected')}
                        >
                          <X size={16} color={Colors.dark.error} />
                          <Text style={[styles.actionButtonText, { color: Colors.dark.error }]}>
                            Reject
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
                scrollEnabled={false}
                style={styles.applicationsList}
              />
            )}
          </View>
        )}
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
  },
  tabText: {
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.dark.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
  },
  jobTypeTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  jobTypeText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  jobMeta: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  descriptionText: {
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTagText: {
    color: Colors.dark.text,
  },
  applicationStats: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    color: Colors.dark.text,
    fontWeight: '500',
    marginLeft: 8,
  },
  closeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.error,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.error,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
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
    textAlign: 'center',
  },
  applicationsList: {
    marginBottom: 16,
  },
  applicationCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingTag: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  reviewedTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  shortlistedTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  rejectedTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  applicationMeta: {
    marginBottom: 12,
  },
  resumeSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingVertical: 12,
    marginBottom: 12,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeButtonText: {
    color: Colors.dark.primary,
    marginLeft: 8,
  },
  applicationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    fontWeight: '500',
  },
});
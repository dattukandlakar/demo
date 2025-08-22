import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Calendar, 
  Bookmark, 
  Share2, 
  Building,
  User,
  Mail,
  Phone,
  FileText,
  Upload
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { useJobStore } from '@/store/job-store';
import { useAuthStore } from '@/store/auth-store';
import { Job, JobApplication } from '@/types';
import Colors from '@/constants/colors';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { jobs, bookmarkJob, applyToJob } = useJobStore();
  const { user } = useAuthStore();
  
  const [job, setJob] = useState<Job | null>(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  
  // Application form states
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantExperience, setApplicantExperience] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const foundJob = jobs.find(j => j.id === id);
      if (foundJob) {
        setJob(foundJob);
      }
    }
    
    // Pre-fill form with user data if available
    if (user) {
      setApplicantName(user.name || '');
      setApplicantEmail(user.email || '');
      setApplicantPhone(user.phone || '');
    }
  }, [id, jobs, user]);

  const handleBack = () => {
    router.back();
  };

  const handleBookmark = () => {
    if (job) {
      bookmarkJob(job.id);
    }
  };

  const handleShare = () => {
    // In a real app, you would implement share functionality
    
  };

  const handleApply = () => {
    setApplyModalVisible(true);
  };

  const handleSubmitApplication = async () => {
    if (!job) return;
    
    // Validate form
    if (!applicantName || !applicantEmail || !applicantPhone || !applicantExperience || !coverLetter) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Create application
    const application: Partial<JobApplication> = {
      applicantId: user!.id,
      name: applicantName,
      email: applicantEmail,
      phone: applicantPhone,
      experience: applicantExperience,
      coverLetter: coverLetter,
      resume: resumeFile || 'https://example.com/resume.pdf',
      appliedAt: new Date().toISOString(),
      status: 'pending'
    };

    const success = await applyToJob(job.id, application as JobApplication);
    
    if (success) {
      // Reset form and close modal
      setApplicantExperience('');
      setCoverLetter('');
      setResumeFile(null);
      setApplyModalVisible(false);
      
      // Show success message
      Alert.alert('Success', 'Your application has been submitted!');
    } else {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  const handlePickResume = () => {
    // In a real app, you would use a document picker
    // For now, we'll just simulate picking a resume
    setResumeFile('resume.pdf');
    Alert.alert('Resume Selected', 'resume.pdf has been selected.');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Check if user has already applied
  const hasApplied = () => {
    if (!job || !user) return false;
    return job.applications.some(app => app.applicantId === user.id);
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: "Job Details",
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <ArrowLeft size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            ),
          }} 
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: "Job Details",
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerAction}
                onPress={handleBookmark}
              >
                <Bookmark 
                  size={24} 
                  color={Colors.dark.text} 
                  fill={job.isBookmarked ? Colors.dark.text : 'transparent'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerAction}
                onPress={handleShare}
              >
                <Share2 size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.jobHeader}>
          <View style={styles.companyLogoContainer}>
            <Image 
              source={{ uri: job.logo }} 
              style={styles.companyLogo} 
            />
          </View>
          
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle}>{job.role}</Text>
            <Text style={styles.companyName}>{job.company}</Text>
            
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.dark.subtext} />
              <Text style={styles.locationText}>{job.location}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Briefcase size={20} color={Colors.dark.tint} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Job Type</Text>
              <Text style={styles.detailValue}>{job.type}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <DollarSign size={20} color={Colors.dark.tint} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Salary</Text>
              <Text style={styles.detailValue}>{job.salary}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Clock size={20} color={Colors.dark.tint} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailValue}>{job.experience}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Calendar size={20} color={Colors.dark.tint} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Posted On</Text>
              <Text style={styles.detailValue}>{formatDate(job.postedAt)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          <View style={styles.skillsContainer}>
            {job.skills.map((skill, index) => (
              <Badge 
                key={index}
                label={skill}
                variant="primary"
                style={styles.skillBadge}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Company</Text>
          <View style={styles.companyContainer}>
            <View style={styles.companyHeader}>
              <Image 
                source={{ uri: job.logo }} 
                style={styles.companyLogoSmall} 
              />
              <View style={styles.companyInfo}>
                <Text style={styles.companyNameLarge}>{job.company}</Text>
                <Text style={styles.companySize}>
                  {job.companyDetails?.size || '50-200'} employees
                </Text>
              </View>
            </View>
            
            <View style={styles.companyAddress}>
              <MapPin size={16} color={Colors.dark.subtext} />
              <Text style={styles.companyAddressText}>
                {job.companyDetails?.address || job.location}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.viewCompanyButton}
              onPress={() => router.push(`/company/${job.company}`)}
            >
              <Text style={styles.viewCompanyText}>View Company Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.applicationSection}>
          <Text style={styles.applicationDeadline}>
            Application Deadline: {formatDate(job.deadline)}
          </Text>
          
          {hasApplied() ? (
            <View style={styles.alreadyAppliedContainer}>
              <Text style={styles.alreadyAppliedText}>
                You have already applied to this job
              </Text>
              <Button
                title="View Application"
                onPress={() => router.push('/applications')}
                variant="outline"
                style={styles.viewApplicationButton}
              />
            </View>
          ) : (
            <Button
              title="Apply Now"
              onPress={handleApply}
              gradient
              style={styles.applyButton}
            />
          )}
        </View>
        
        <View style={styles.similarJobsSection}>
          <Text style={styles.sectionTitle}>Similar Jobs</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.similarJobsScroll}
          >
            {jobs
              .filter(j => j.id !== job.id && j.skills.some(skill => job.skills.includes(skill)))
              .slice(0, 5)
              .map(similarJob => (
                <TouchableOpacity 
                  key={similarJob.id}
                  style={styles.similarJobCard}
                  onPress={() => router.push(`/job/${similarJob.id}`)}
                >
                  <Image 
                    source={{ uri: similarJob.logo }} 
                    style={styles.similarJobLogo} 
                  />
                  <Text style={styles.similarJobTitle}>{similarJob.role}</Text>
                  <Text style={styles.similarJobCompany}>{similarJob.company}</Text>
                  <View style={styles.similarJobLocation}>
                    <MapPin size={12} color={Colors.dark.subtext} />
                    <Text style={styles.similarJobLocationText}>{similarJob.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </ScrollView>
      
      {/* Apply Job Modal */}
      <Modal
        visible={applyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setApplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Job</Text>
              <TouchableOpacity onPress={() => setApplyModalVisible(false)}>
                <ArrowLeft size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.jobSummary}>
                <Text style={styles.jobSummaryTitle}>{job.role}</Text>
                <Text style={styles.jobSummaryCompany}>{job.company}</Text>
                <View style={styles.jobSummaryDetails}>
                  <View style={styles.jobSummaryItem}>
                    <MapPin size={16} color={Colors.dark.subtext} />
                    <Text style={styles.jobSummaryText}>
                      {job.location}
                    </Text>
                  </View>
                  <View style={styles.jobSummaryItem}>
                    <Briefcase size={16} color={Colors.dark.subtext} />
                    <Text style={styles.jobSummaryText}>
                      {job.type}
                    </Text>
                  </View>
                  <View style={styles.jobSummaryItem}>
                    <DollarSign size={16} color={Colors.dark.subtext} />
                    <Text style={styles.jobSummaryText}>
                      {job.salary}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.applicationFormTitle}>Your Information</Text>
              
              <Input
                label="Full Name *"
                placeholder="Enter your full name"
                value={applicantName}
                onChangeText={setApplicantName}
                leftIcon={<User size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Email *"
                placeholder="Enter your email"
                value={applicantEmail}
                onChangeText={setApplicantEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Phone Number *"
                placeholder="Enter your phone number"
                value={applicantPhone}
                onChangeText={setApplicantPhone}
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Experience *"
                placeholder="e.g., 3 years in React Native development"
                value={applicantExperience}
                onChangeText={setApplicantExperience}
                leftIcon={<Briefcase size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Cover Letter *"
                placeholder="Tell us why you're a good fit for this role"
                value={coverLetter}
                onChangeText={setCoverLetter}
                multiline
                numberOfLines={6}
                style={styles.textArea}
              />
              
              <View style={styles.resumeSection}>
                <Text style={styles.resumeTitle}>Resume</Text>
                {resumeFile ? (
                  <View style={styles.resumeFileContainer}>
                    <FileText size={24} color={Colors.dark.text} />
                    <Text style={styles.resumeFileName}>{resumeFile}</Text>
                    <TouchableOpacity 
                      style={styles.removeResumeButton}
                      onPress={() => setResumeFile(null)}
                    >
                      <ArrowLeft size={16} color={Colors.dark.text} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.uploadResumeButton}
                    onPress={handlePickResume}
                  >
                    <Upload size={20} color={Colors.dark.text} />
                    <Text style={styles.uploadResumeText}>Upload Resume</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Button
                title="Submit Application"
                onPress={handleSubmitApplication}
                gradient
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  companyLogoContainer: {
    marginRight: 16,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: Colors.dark.subtext,
    marginLeft: 6,
  },
  jobDetails: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.dark.tint}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  descriptionText: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 22,
  },
  companyContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  companyLogoSmall: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyNameLarge: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  companySize: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  companyAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyAddressText: {
    color: Colors.dark.text,
    marginLeft: 8,
  },
  viewCompanyButton: {
    backgroundColor: `${Colors.dark.tint}20`,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewCompanyText: {
    color: Colors.dark.tint,
    fontWeight: '500',
  },
  applicationSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  applicationDeadline: {
    color: Colors.dark.text,
    marginBottom: 16,
  },
  applyButton: {
    width: '100%',
  },
  alreadyAppliedContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  alreadyAppliedText: {
    color: Colors.dark.text,
    marginBottom: 12,
  },
  viewApplicationButton: {
    width: '80%',
  },
  similarJobsSection: {
    padding: 16,
    paddingBottom: 32,
  },
  similarJobsScroll: {
    marginTop: 8,
  },
  similarJobCard: {
    width: 160,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  similarJobLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarJobTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  similarJobCompany: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginBottom: 8,
  },
  similarJobLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  similarJobLocationText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 16,
    margin: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 16,
  },
  jobSummary: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  jobSummaryTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobSummaryCompany: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 12,
  },
  jobSummaryDetails: {
    marginTop: 8,
  },
  jobSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobSummaryText: {
    color: Colors.dark.text,
    marginLeft: 8,
  },
  applicationFormTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  resumeSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  resumeTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  uploadResumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  uploadResumeText: {
    color: Colors.dark.text,
    marginLeft: 8,
  },
  resumeFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 12,
  },
  resumeFileName: {
    color: Colors.dark.text,
    marginLeft: 8,
    flex: 1,
  },
  removeResumeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 40,
  },
});
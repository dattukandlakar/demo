import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { 
  Plus, 
  X, 
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  ChevronRight
} from 'lucide-react-native';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Colors from '@/constants/colors';
import { Company } from '@/store/company-store';

// Mock job data
const mockJobs = [
  {
    id: 'j1',
    title: 'Senior React Native Developer',
    company: 'TechWave Ventures',
    location: 'Remote',
    type: 'Full-time',
    experience: '3-5 years',
    salary: '$80,000 - $120,000',
    skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux'],
    description: 'We are looking for an experienced React Native developer to join our team and help build cross-platform mobile applications.',
    postedAt: '2023-06-01T10:00:00Z',
    applications: 12,
  },
  {
    id: 'j2',
    title: 'UI/UX Designer',
    company: 'TechWave Ventures',
    location: 'Hybrid',
    type: 'Full-time',
    experience: '2-4 years',
    salary: '$70,000 - $90,000',
    skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
    description: 'We are seeking a talented UI/UX Designer to create amazing user experiences for our mobile and web applications.',
    postedAt: '2023-06-05T14:30:00Z',
    applications: 8,
  },
];

interface CompanyJobsTabProps {
  company: Company;
  isOwner: boolean;
}

const CompanyJobsTab: React.FC<CompanyJobsTabProps> = ({ company, isOwner }) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewApplicationsModalVisible, setViewApplicationsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  // Form states
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const handleCreateJob = () => {
    // Validate form
    if (!jobTitle || !jobLocation || !jobType || !jobExperience || !jobDescription) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    // In a real app, you'd create the job here
    Alert.alert('Success', 'Job posting created successfully!');
    
    // Reset form and close modal
    setJobTitle('');
    setJobLocation('');
    setJobType('');
    setJobExperience('');
    setJobSalary('');
    setJobSkills('');
    setJobDescription('');
    setCreateModalVisible(false);
  };
  
  const handleViewApplications = (job: any) => {
    setSelectedJob(job);
    setViewApplicationsModalVisible(true);
  };
  
  const renderJobItem = ({ item }: { item: any }) => {
    const postedDate = new Date(item.postedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return (
      <Card style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobCompany}>{item.company}</Text>
          </View>
          
          {isOwner && (
            <TouchableOpacity 
              style={styles.applicationsButton}
              onPress={() => handleViewApplications(item)}
            >
              <Text style={styles.applicationsCount}>{item.applications}</Text>
              <Text style={styles.applicationsLabel}>Applications</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.jobDetails}>
          <View style={styles.jobDetailItem}>
            <MapPin size={16} color={Colors.dark.subtext} />
            <Text style={styles.jobDetailText}>{item.location}</Text>
          </View>
          
          <View style={styles.jobDetailItem}>
            <Briefcase size={16} color={Colors.dark.subtext} />
            <Text style={styles.jobDetailText}>{item.type}</Text>
          </View>
          
          <View style={styles.jobDetailItem}>
            <Clock size={16} color={Colors.dark.subtext} />
            <Text style={styles.jobDetailText}>{item.experience}</Text>
          </View>
          
          {item.salary && (
            <View style={styles.jobDetailItem}>
              <DollarSign size={16} color={Colors.dark.subtext} />
              <Text style={styles.jobDetailText}>{item.salary}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.skillsContainer}>
          {item.skills.map((skill: string, index: number) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.jobDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.jobFooter}>
          <Text style={styles.postedDate}>Posted {diffDays} days ago</Text>
          
          {isOwner ? (
            <TouchableOpacity 
              style={styles.viewApplicationsButton}
              onPress={() => handleViewApplications(item)}
            >
              <Text style={styles.viewApplicationsText}>View Applications</Text>
              <ChevronRight size={16} color={Colors.dark.tint} />
            </TouchableOpacity>
          ) : (
            <Button
              title="Apply Now"
              onPress={() => Alert.alert('Apply', 'Application functionality would be implemented here.')}
              size="small"
            />
          )}
        </View>
      </Card>
    );
  };
  
  // Mock applicants data
  const mockApplicants = [
    {
      id: 'a1',
      name: 'John Doe',
      college: 'MIT',
      email: 'john.doe@example.com',
      phone: '+1 123-456-7890',
      resume: 'https://example.com/resume.pdf',
      appliedAt: '2023-06-10T09:45:00Z',
    },
    {
      id: 'a2',
      name: 'Jane Smith',
      college: 'Stanford University',
      email: 'jane.smith@example.com',
      phone: '+1 987-654-3210',
      resume: 'https://example.com/resume.pdf',
      appliedAt: '2023-06-11T14:20:00Z',
    },
  ];
  
  return (
    <View style={styles.container}>
      {isOwner && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setCreateModalVisible(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      {mockJobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No job postings yet</Text>
            <Text style={styles.emptyText}>
              {isOwner 
                ? "Create your first job posting to start receiving applications."
                : "This company doesn't have any job openings at the moment."}
            </Text>
            
            {isOwner && (
              <Button
                title="Create Job Posting"
                onPress={() => setCreateModalVisible(true)}
                style={styles.createButton}
                leftIcon={<Plus size={18} color="#fff" />}
              />
            )}
          </Card>
        </View>
      ) : (
        <FlatList
          data={mockJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Create Job Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Job Posting</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Input
                label="Job Title *"
                placeholder="e.g. Senior React Native Developer"
                value={jobTitle}
                onChangeText={setJobTitle}
                leftIcon={<Briefcase size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Location *"
                placeholder="e.g. Remote, New York, Hybrid"
                value={jobLocation}
                onChangeText={setJobLocation}
                leftIcon={<MapPin size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Job Type *"
                placeholder="e.g. Full-time, Part-time, Contract"
                value={jobType}
                onChangeText={setJobType}
                leftIcon={<Clock size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Experience Required *"
                placeholder="e.g. 3-5 years"
                value={jobExperience}
                onChangeText={setJobExperience}
                leftIcon={<Users size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Salary Range"
                placeholder="e.g. $80,000 - $120,000"
                value={jobSalary}
                onChangeText={setJobSalary}
                leftIcon={<DollarSign size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Skills Required"
                placeholder="e.g. React Native, JavaScript, TypeScript"
                value={jobSkills}
                onChangeText={setJobSkills}
              />
              
              <Input
                label="Job Description *"
                placeholder="Enter detailed job description"
                value={jobDescription}
                onChangeText={setJobDescription}
                multiline
                numberOfLines={6}
                style={styles.textArea}
              />
              
              <Button
                title="Create Job Posting"
                onPress={handleCreateJob}
                gradient
                style={styles.createJobButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* View Applications Modal */}
      <Modal
        visible={viewApplicationsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewApplicationsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Applications</Text>
              <TouchableOpacity onPress={() => setViewApplicationsModalVisible(false)}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.applicationsHeader}>
              <Text style={styles.applicationsTitle}>
                {selectedJob?.title}
              </Text>
              <Text style={styles.applicationsCount}>
                {selectedJob?.applications} Applications
              </Text>
            </View>
            
            <FlatList
              data={mockApplicants}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.applicantCard}
                  onPress={() => Alert.alert('View Resume', 'Resume viewing functionality would be implemented here.')}
                >
                  <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{item.name}</Text>
                    <Text style={styles.applicantCollege}>{item.college}</Text>
                    
                    <View style={styles.applicantContact}>
                      <Text style={styles.applicantEmail}>{item.email}</Text>
                      <Text style={styles.applicantPhone}>{item.phone}</Text>
                    </View>
                    
                    <Text style={styles.appliedDate}>
                      Applied on {new Date(item.appliedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.applicantActions}>
                    <TouchableOpacity style={styles.viewResumeButton}>
                      <Text style={styles.viewResumeText}>View Resume</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.applicantsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emptyContainer: {
    padding: 16,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
    padding: 16,
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  applicationsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.dark.tint}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  applicationsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.tint,
  },
  applicationsLabel: {
    fontSize: 12,
    color: Colors.dark.tint,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  jobDetailText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginLeft: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillBadge: {
    backgroundColor: `${Colors.dark.tint}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: Colors.dark.tint,
  },
  jobDescription: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  postedDate: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  viewApplicationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewApplicationsText: {
    fontSize: 14,
    color: Colors.dark.tint,
    marginRight: 4,
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
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  modalContent: {
    padding: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  createJobButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  applicationsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  applicationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  applicantsList: {
    padding: 16,
  },
  applicantCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  applicantInfo: {
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  applicantCollege: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  applicantContact: {
    marginBottom: 8,
  },
  applicantEmail: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  applicantPhone: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  appliedDate: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  applicantActions: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  viewResumeButton: {
    backgroundColor: `${Colors.dark.tint}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewResumeText: {
    fontSize: 14,
    color: Colors.dark.tint,
  },
});

export default CompanyJobsTab;
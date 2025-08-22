import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Calendar, Clock, Plus, X } from 'lucide-react-native';
import { useCompanyStore } from '@/store/company-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';

// Employment types and experience levels
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'executive'];

export default function CreateJob() {
  const router = useRouter();
  const { activeCompany, createJob } = useCompanyStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [employmentType, setEmploymentType] = useState<'full-time' | 'part-time' | 'contract' | 'internship'>('full-time');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior' | 'executive'>('mid');
  const [deadline, setDeadline] = useState('');
  
  const [showEmploymentTypeDropdown, setShowEmploymentTypeDropdown] = useState(false);
  const [showExperienceLevelDropdown, setShowExperienceLevelDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  if (!activeCompany) {
    router.replace('/company/create');
    return null;
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!description.trim()) newErrors.description = 'Job description is required';
    if (!salary.trim()) newErrors.salary = 'Salary information is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (skills.length === 0) newErrors.skills = 'At least one skill is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  const handleCreateJob = () => {
    if (!validateForm()) return;
    
    createJob({
      companyId: activeCompany.id,
      title,
      description,
      salary,
      location,
      skills,
      employmentType,
      experienceLevel,
      deadline: deadline || undefined,
    });
    
    router.push('/company/dashboard');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.companyName}>Posting as: {activeCompany.name}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <View style={[styles.inputContainer, errors.title && styles.inputError]}>
              <Briefcase size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Senior React Native Developer"
                placeholderTextColor={Colors.dark.subtext}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Description *</Text>
            <View style={[styles.textAreaContainer, errors.description && styles.inputError]}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the job responsibilities, requirements, and benefits..."
                placeholderTextColor={Colors.dark.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salary *</Text>
            <View style={[styles.inputContainer, errors.salary && styles.inputError]}>
              <DollarSign size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. $80,000 - $100,000 per year"
                placeholderTextColor={Colors.dark.subtext}
                value={salary}
                onChangeText={setSalary}
              />
            </View>
            {errors.salary && <Text style={styles.errorText}>{errors.salary}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <View style={[styles.inputContainer, errors.location && styles.inputError]}>
              <MapPin size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. New York, NY or Remote"
                placeholderTextColor={Colors.dark.subtext}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Required Skills *</Text>
            <View style={[styles.skillsInputContainer, errors.skills && styles.inputError]}>
              <TextInput
                style={styles.skillInput}
                placeholder="Add a skill and press +"
                placeholderTextColor={Colors.dark.subtext}
                value={currentSkill}
                onChangeText={setCurrentSkill}
                onSubmitEditing={handleAddSkill}
              />
              <TouchableOpacity style={styles.addSkillButton} onPress={handleAddSkill}>
                <Plus size={20} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            {errors.skills && <Text style={styles.errorText}>{errors.skills}</Text>}
            
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                    <X size={16} color={Colors.dark.text} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employment Type</Text>
            <TouchableOpacity 
              style={styles.inputContainer} 
              onPress={() => setShowEmploymentTypeDropdown(!showEmploymentTypeDropdown)}
            >
              <Clock size={20} color={Colors.dark.subtext} />
              <Text style={[styles.input, !employmentType && styles.placeholder]}>
                {employmentType.replace('-', ' ')}
              </Text>
            </TouchableOpacity>
            
            {showEmploymentTypeDropdown && (
              <View style={styles.dropdown}>
                {EMPLOYMENT_TYPES.map((type) => (
                  <TouchableOpacity 
                    key={type} 
                    style={styles.dropdownItem}
                    onPress={() => {
                      setEmploymentType(type as any);
                      setShowEmploymentTypeDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownText, 
                      employmentType === type && styles.selectedDropdownText
                    ]}>
                      {type.replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience Level</Text>
            <TouchableOpacity 
              style={styles.inputContainer} 
              onPress={() => setShowExperienceLevelDropdown(!showExperienceLevelDropdown)}
            >
              <Briefcase size={20} color={Colors.dark.subtext} />
              <Text style={[styles.input, !experienceLevel && styles.placeholder]}>
                {experienceLevel}
              </Text>
            </TouchableOpacity>
            
            {showExperienceLevelDropdown && (
              <View style={styles.dropdown}>
                {EXPERIENCE_LEVELS.map((level) => (
                  <TouchableOpacity 
                    key={level} 
                    style={styles.dropdownItem}
                    onPress={() => {
                      setExperienceLevel(level as any);
                      setShowExperienceLevelDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownText, 
                      experienceLevel === level && styles.selectedDropdownText
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Application Deadline (Optional)</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 30 Dec 2023"
                placeholderTextColor={Colors.dark.subtext}
                value={deadline}
                onChangeText={setDeadline}
              />
            </View>
          </View>
          
          <Button 
            title="Post Job" 
            onPress={handleCreateJob} 
            style={styles.submitButton}
          />
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
  content: {
    padding: 16,
  },
  companyName: {
    fontSize: 16,
    color: Colors.dark.primary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputError: {
    borderColor: Colors.dark.error,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    marginLeft: 8,
    fontSize: 16,
  },
  placeholder: {
    color: Colors.dark.subtext,
  },
  textAreaContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  textArea: {
    color: Colors.dark.text,
    fontSize: 16,
    minHeight: 120,
  },
  skillsInputContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  skillInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  addSkillButton: {
    backgroundColor: Colors.dark.cardBackground,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.dark.border,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTagText: {
    color: Colors.dark.text,
    marginRight: 6,
  },
  dropdown: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginTop: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dropdownText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  selectedDropdownText: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});
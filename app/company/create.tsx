import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, MapPin, Briefcase, Mail, Phone, Globe, Upload, ArrowLeft } from 'lucide-react-native';
import { useCompanyStore } from '@/store/company-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';

// List of industries for dropdown
const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Transportation',
  'Construction',
  'Agriculture',
  'Entertainment',
  'Food & Beverage',
  'Other'
];

export default function CompanyCreate() {
  const router = useRouter();
  const { createCompany } = useCompanyStore();
  const { user } = useAuthStore();
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=1974&auto=format&fit=crop');
  
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Company name is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!industry.trim()) newErrors.industry = 'Industry is required';
    if (!contactEmail.trim()) newErrors.contactEmail = 'Email is required';
    if (!contactPhone.trim()) newErrors.contactPhone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCompany = () => {
    if (!validateForm()) return;
    
    createCompany({
      name,
      location,
      industry,
      contactEmail,
      contactPhone,
      website,
      description,
      logo,
      createdBy: user?.id || '',
    });
    
    router.push('/company/dashboard');
  };

  const selectIndustry = (selectedIndustry: string) => {
    setIndustry(selectedIndustry);
    setShowIndustryDropdown(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Company</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          
          <View style={styles.logoContainer}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoPreview} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Building2 size={40} color={Colors.dark.subtext} />
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={16} color={Colors.dark.text} />
              <Text style={styles.uploadText}>Upload Logo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
              <Building2 size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="Enter company name"
                placeholderTextColor={Colors.dark.subtext}
                value={name}
                onChangeText={setName}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <View style={[styles.inputContainer, errors.location && styles.inputError]}>
              <MapPin size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="City, Country"
                placeholderTextColor={Colors.dark.subtext}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Industry *</Text>
            <TouchableOpacity 
              style={[styles.inputContainer, errors.industry && styles.inputError]} 
              onPress={() => setShowIndustryDropdown(!showIndustryDropdown)}
            >
              <Briefcase size={20} color={Colors.dark.subtext} />
              <Text style={[styles.input, !industry && styles.placeholder]}>
                {industry || 'Select industry'}
              </Text>
            </TouchableOpacity>
            {errors.industry && <Text style={styles.errorText}>{errors.industry}</Text>}
            
            {showIndustryDropdown && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {INDUSTRIES.map((item) => (
                    <TouchableOpacity 
                      key={item} 
                      style={styles.dropdownItem}
                      onPress={() => selectIndustry(item)}
                    >
                      <Text style={styles.dropdownText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={[styles.inputContainer, errors.contactEmail && styles.inputError]}>
              <Mail size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="company@example.com"
                placeholderTextColor={Colors.dark.subtext}
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.contactEmail && <Text style={styles.errorText}>{errors.contactEmail}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={[styles.inputContainer, errors.contactPhone && styles.inputError]}>
              <Phone size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="+1 (123) 456-7890"
                placeholderTextColor={Colors.dark.subtext}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>
            {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website (Optional)</Text>
            <View style={styles.inputContainer}>
              <Globe size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="https://example.com"
                placeholderTextColor={Colors.dark.subtext}
                value={website}
                onChangeText={setWebsite}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <View style={[styles.textAreaContainer]}>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about your company..."
                placeholderTextColor={Colors.dark.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          <Button 
            title="Create Company" 
            onPress={handleCreateCompany} 
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadText: {
    color: Colors.dark.text,
    marginLeft: 8,
    fontSize: 14,
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
    minHeight: 100,
  },
  dropdown: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
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
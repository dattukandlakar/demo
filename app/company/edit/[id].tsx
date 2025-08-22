import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Building, 
  Mail, 
  User, 
  Phone, 
  Globe, 
  MapPin,
  Camera,
  Save
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCompanyStore } from '@/store/company-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Colors from '@/constants/colors';

const EditCompanyPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { companies, updateCompany } = useCompanyStore();
  const { user } = useAuthStore();
  
  // Find the company by ID
  const company = companies.find(c => c.id === id);
  
  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  
  // Initialize form with company data
  useEffect(() => {
    if (company) {
      setCompanyName(company.name);
      setCompanyEmail(company.email);
      setOwnerName(company.ownerName);
      setMobileNumber(company.mobileNumber);
      setCompanyWebsite(company.website || '');
      setCompanyLogo(company.logo);
      setCompanyDescription(company.description || '');
      setCompanyIndustry(company.industry || '');
      setCompanyAddress(company.address || '');
    } else {
      // If company not found, redirect to home
      router.replace('/');
    }
  }, [company]);
  
  // Check if user is the owner of the company
  const isOwner = company?.ownerName === user?.name;
  
  useEffect(() => {
    if (!isOwner) {
      // If not the owner, redirect to company page
      Alert.alert('Access Denied', 'You do not have permission to edit this company.');
      router.replace(`/company/${id}`);
    }
  }, [isOwner]);
  
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCompanyLogo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  const handleUpdateCompany = () => {
    // Validate form
    if (!companyName || !companyEmail || !ownerName || !mobileNumber) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    // Update company
    updateCompany(company!.id, {
      name: companyName,
      email: companyEmail,
      ownerName,
      mobileNumber,
      website: companyWebsite,
      logo: companyLogo,
      description: companyDescription,
      industry: companyIndustry,
      address: companyAddress,
    });
    
    Alert.alert('Success', 'Company information updated successfully!', [
      { text: 'OK', onPress: () => router.replace(`/company/${id}`) }
    ]);
  };
  
  if (!company || !isOwner) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Company</Text>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleUpdateCompany}
        >
          <Save size={20} color={Colors.dark.tint} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.logoSection}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={handlePickImage}
          >
            {companyLogo ? (
              <Image 
                source={{ uri: companyLogo }} 
                style={styles.logo} 
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Building size={40} color={Colors.dark.subtext} />
              </View>
            )}
            
            <View style={styles.changeLogoButton}>
              <Camera size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.changeLogoText}>Change Logo</Text>
        </View>
        
        <View style={styles.formSection}>
          <Input
            label="Company Name *"
            placeholder="Enter company name"
            value={companyName}
            onChangeText={setCompanyName}
            leftIcon={<Building size={20} color={Colors.dark.subtext} />}
          />
          
          <Input
            label="Company Email *"
            placeholder="Enter company email"
            value={companyEmail}
            onChangeText={setCompanyEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.dark.subtext} />}
          />
          
          <Input
            label="Owner/Manager Name *"
            placeholder="Enter full name"
            value={ownerName}
            onChangeText={setOwnerName}
            leftIcon={<User size={20} color={Colors.dark.subtext} />}
          />
          
          <Input
            label="Mobile Number *"
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={Colors.dark.subtext} />}
          />
          
          <Input
            label="Company Website"
            placeholder="Enter website URL"
            value={companyWebsite}
            onChangeText={setCompanyWebsite}
            keyboardType="url"
            autoCapitalize="none"
            leftIcon={<Globe size={20} color={Colors.dark.subtext} />}
          />
          
          <Input
            label="Description"
            placeholder="Enter company description"
            value={companyDescription}
            onChangeText={setCompanyDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          
          <Input
            label="Industry"
            placeholder="Enter company industry"
            value={companyIndustry}
            onChangeText={setCompanyIndustry}
          />
          
          <Input
            label="Address"
            placeholder="Enter company address"
            value={companyAddress}
            onChangeText={setCompanyAddress}
            multiline
            numberOfLines={2}
            leftIcon={<MapPin size={20} color={Colors.dark.subtext} />}
          />
          
          <Button
            title="Update Company"
            onPress={handleUpdateCompany}
            gradient
            style={styles.updateButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  saveButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeLogoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.dark.tint,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  changeLogoText: {
    fontSize: 14,
    color: Colors.dark.tint,
  },
  formSection: {
    padding: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});

export default EditCompanyPage;
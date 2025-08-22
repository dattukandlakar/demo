import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  User,
  Mail,
  Phone,
  Link,
  Plus,
  Trash2
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth-store';
import { User as UserType } from '@/types';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mapUserFromApi } from '@/utils/mapUserFromApi';
import { getUser, updateUserProfile, uploadProfileImage } from '@/api/user';
import Toast from 'react-native-toast-message';


interface Education {
  name: string;
  degree: string;
  field?: string;
  startDate: string ;
  endDate: string ;
  current?: boolean;
}

interface Experience {
  id?: string;
  company: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { updateUser, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form states initialized from Zustand user
  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [coverImage, setCoverImage] = useState(user?.coverImage || '');
  const [education, setEducation] = useState(user?.education || []);
  const [experience, setExperience] = useState(user?.experience || []);
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const token:any = useAuthStore((state) => state.token);

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images.'
        );
      }
    }
  };

  // Fetch user data from API
  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
 
     const body = await getUser(token);
    
      
      const mapped = mapUserFromApi(body);
      updateUser(mapped);
      setName(mapped.name);
      setHeadline(mapped.headline || '');
      setBio(mapped.bio || '');
      setLocation(mapped.location || '');
      setEmail(mapped.email || '');
      setPhone(mapped.phone || '');
      setWebsite(mapped.website || '');
      setAvatar(mapped.avatar || '');
      setCoverImage(mapped.coverImage || '');
      setEducation(mapped.education || []);
      setExperience(mapped.experience || []);
      setSkills(mapped.skills || []);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!name || !email) {
      Toast.show({
        type: 'error',
        text1: `Missing Information`,
        text2: 'Please fill in all required fields.',
      });
      return;
    }
    // Validate education entries: require only 'institution'
    if (education.some(edu => !edu.name)) {
      Toast.show({
        type: 'error',
        text1: 'Education entry missing institution',
        text2: 'Please fill in the institution for each education entry.',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const formattedEducation = education?.map(({ id, ...edu }) => ({
        ...edu,
        institution: edu.name || edu.institution || '', // Map 'name' to 'institution' for backend
        startDate: edu.startDate,
        endDate: edu.current ? 'Present' : edu.endDate
      }));
      const formattedExperience = experience.map(({ id, ...exp }) => ({
        ...exp,
        startDate: exp.startDate ? exp.startDate.toString() : '',
        endDate: exp.current ? 'Present' : (exp.endDate ? exp.endDate.toString() : ''),
        description: exp.description || ''
      }));

      const profileData = {
        name,
        headline,
        bio,
        location,
        email,
        phone,
        website,
        education: formattedEducation,
        experience: formattedExperience,
        skills
      };
      
      const updatedData = await updateUserProfile(token, profileData);
      
      // Fetch fresh user data from API and update Zustand store
      try {
        const freshUserData = await getUser(token);
        const mappedUser = mapUserFromApi(freshUserData);
        updateUser(mappedUser);
        
        // Also update local state
        setName(mappedUser.name);
        setHeadline(mappedUser.headline || '');
        setBio(mappedUser.bio || '');
        setLocation(mappedUser.location || '');
        setEmail(mappedUser.email || '');
        setPhone(mappedUser.phone || '');
        setWebsite(mappedUser.website || '');
        setEducation(mappedUser.education || []);
        setExperience(mappedUser.experience || []);
        setSkills(mappedUser.skills || []);
      } catch (refreshError) {
        console.error('Failed to refresh user data after update:', refreshError);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Profile Updated!',
        text2: 'Your changes have been saved successfully.',
        position: 'top',
      });
      
      setTimeout(() => {
        router.back();
      }, 1000)
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Toast.show({
        type: 'error',
        text1: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async (isProfilePhoto: boolean = true) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: isProfilePhoto ? [1, 1] : [16, 9], // Square for profile, landscape for cover
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadImage(imageUri, isProfilePhoto);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (imageUri: string, isProfilePhoto: boolean) => {
    try {
      setIsUploadingImage(true);

      const response = await uploadProfileImage(token, imageUri);
     
      // FIX: Use response.body.profileImage
      const newImageUrl = response?.body?.profileImage || '';
      if (newImageUrl) {
        if (isProfilePhoto) {
          setAvatar(newImageUrl);
          updateUser({ ...user, avatar: newImageUrl }); // Only update avatar
          mapUserFromApi(response)
        } else {
          setCoverImage(newImageUrl);
          updateUser({ ...user, coverImage: newImageUrl }); // Only update coverImage
          mapUserFromApi(response)
        }
        Toast.show({
          type: 'success',
          text1: 'Image Uploaded!',
          text2: `${isProfilePhoto ? 'Profile' : 'Cover'} photo updated successfully.`,
          position: 'top',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Upload Failed',
          text2: 'No image returned from server.',
        });
      }
    } catch (error) {
      let errorMessage = 'Failed to upload image';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: errorMessage,
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const showImagePickerOptions = (isProfilePhoto: boolean) => {
    Alert.alert(
      `Change ${isProfilePhoto ? 'Profile' : 'Cover'} Photo`,
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => takePhoto(isProfilePhoto),
        },
        {
          text: 'Gallery',
          onPress: () => pickImage(isProfilePhoto),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async (isProfilePhoto: boolean = true) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: isProfilePhoto ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadImage(imageUri, isProfilePhoto);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChangeCoverPhoto = () => {
    showImagePickerOptions(false);
  };

  const handleChangeProfilePhoto = () => {
    showImagePickerOptions(true);
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        id: '',
        name: '',
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false
      }
    ]);
  };

  const handleUpdateEducation = (index: number, field: string, value: string | boolean) => {
   if ((field === 'startDate' || field === 'endDate') && typeof value === 'string' && value.length === 10) {
      const yyyyMMddPattern = /^\d{4}-\d{2}-\d{2}$/;
      const isValid = (
        yyyyMMddPattern.test(value) ||
        value === 'Present'
      );

      if (!isValid) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Date Format',
          text2: 'Please use YYYY-MM-DD (e.g., 2025-08-04)',
        });
        return;
      }
    }
    
    const updatedEducation = [...education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    setEducation(updatedEducation);
  };

  const handleRemoveEducation = (index: number) => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    setEducation(updatedEducation);
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        id: Date.now().toString(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        role: ''
      }
    ]);
  };

  const handleUpdateExperience = (index: number, field: string, value: string | boolean) => {
    // If it's a date field, validate MM/YY format only when complete
    if ((field === 'start Date' || field === 'end Date') && typeof value === 'string' && value.length === 5) {
      const isValidFormat = /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
      if (!isValidFormat && value !== 'Present') {
        // Show error for invalid format
        Toast.show({
          type: 'error',
          text1: 'Invalid Date Format',
          text2: 'Please use MM/YY format (e.g., 01/25)',
        });
        return;
      }
    }
    
    const updatedExperience = [...experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    setExperience(updatedExperience);
  };

  const handleRemoveExperience = (index: number) => {
    const updatedExperience = [...experience];
    updatedExperience.splice(index, 1);
    setExperience(updatedExperience);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loader overlay while saving or uploading */}
      {(isLoading || isUploadingImage) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.dark.tint} />
          <Text style={styles.loadingText}>
            {isUploadingImage ? 'Uploading image...' : 'Saving profile...'}
          </Text>
        </View>
      )}

      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Edit Profile',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.coverPhotoContainer}>
          <Image
            source={{ uri: coverImage || 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }}
            style={styles.coverPhoto}
          />
          <TouchableOpacity
            style={styles.changeCoverButton}
            onPress={handleChangeCoverPhoto}
            disabled={isUploadingImage}
          >
            <Camera size={20} color="#fff" />
          </TouchableOpacity>
          {isUploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.profilePhotoContainer}>
          <Image
            source={{ uri: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80' }}
            style={styles.profilePhoto}
          />
          <TouchableOpacity
            style={styles.changeProfileButton}
            onPress={handleChangeProfilePhoto}
            disabled={isUploadingImage}
          >
            <Camera size={20} color="#fff" />
          </TouchableOpacity>
          {isUploadingImage && (
            <View style={styles.profileUploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Input
            label="Full Name *"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={20} color={Colors.dark.subtext} />}
          />

          <Input
            label="Headline"
            placeholder="e.g. Software Engineer at Tech Company"
            value={headline}
            onChangeText={setHeadline}
            leftIcon={<Briefcase size={20} color={Colors.dark.subtext} />}
          />

          <Input
            label="Bio"
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            inputStyle={styles.textArea}
          />

          <Input
            label="Location"
            placeholder="e.g. Bangalore, India"
            value={location}
            onChangeText={setLocation}
            leftIcon={<MapPin size={20} color={Colors.dark.subtext} />}
          />

          <Text style={styles.sectionTitle}>Contact Information</Text>

          <Input
            label="Email *"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.dark.subtext} />}
          />

          <Input
            label="Phone"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={Colors.dark.subtext} />}
          />

          <Input
            label="Website"
            placeholder="Enter your website URL"
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
            leftIcon={<Link size={20} color={Colors.dark.subtext} />}
          />

          <Text style={styles.sectionTitle}>Education</Text>

          {education?.map((edu, index) => {
            try {
              if (!edu) throw new Error(`Education entry at index ${index} is undefined`);
              if (typeof edu !== 'object') throw new Error(`Education entry at index ${index} is not an object`);
              if (!('name' in edu)) throw new Error(`Education entry at index ${index} missing institution`);
            } catch (err) {
              return (
                <View key={index} style={{ padding: 10, backgroundColor: '#fee', borderRadius: 8, marginBottom: 8 }}>
                  <Text style={{ color: 'red' }}>Error in education entry #{index + 1}: {err instanceof Error ? err.message : String(err)}</Text>
                  <Text selectable style={{ fontSize: 12, color: '#333' }}>{JSON.stringify(edu)}</Text>
                </View>
              );
            }
            return (
              <View key={edu.id || index} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Education #{index + 1}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveEducation(index)}
                  >
                    <Trash2 size={20} color={Colors.dark.error} />
                  </TouchableOpacity>
                </View>
                <Input
                  label="Institution"
                  placeholder="e.g. Stanford University"
                  value={typeof edu.name === 'string' ? edu.name : ''}
                  onChangeText={(value) => handleUpdateEducation(index, 'name', value)}
                  leftIcon={<GraduationCap size={20} color={Colors.dark.subtext} />}
                />
                <Input
                  label="Degree"
                  placeholder="e.g. Bachelor's"
                  value={edu.degree || ''}
                  onChangeText={(value) => handleUpdateEducation(index, 'degree', value)}
                />
                <Input
                  label="Field of Study"
                  placeholder="e.g. Computer Science"
                  value={edu.field || ''}
                  onChangeText={(value) => handleUpdateEducation(index, 'field', value)}
                />
                <View style={styles.rowContainer}>
                <Input
                  label="Start Date"
                  placeholder="YYYY/MM/DD"
                  value={edu.startDate || ''}
                  onChangeText={(value) => handleUpdateEducation(index, 'startDate', value)}
                  containerStyle={styles.halfInput}
                />
                <Input
                  label="End Date"
                  placeholder={edu.current ? "Present" : "YYYY/MM/DD"}
                  value={edu.current ? "Present" : (edu.endDate || '')}
                  onChangeText={(value) => handleUpdateEducation(index, 'endDate', value)}
                  containerStyle={styles.halfInput}
                  editable={!edu.current}
                />
                </View>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      edu.current && styles.checkboxActive
                    ]}
                    onPress={() => handleUpdateEducation(index, 'current', !edu.current)}
                  >
                    {edu.current && <View style={styles.checkboxInner} />}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>I am currently studying here</Text>
                </View>
              </View>
            );
          })}

          <Button
            title="Add Education"
            onPress={handleAddEducation}
            variant="outline"
            leftIcon={<Plus size={20} color={Colors.dark.tint} />}
            style={styles.addButton}
          />

          <Text style={styles.sectionTitle}>Experience</Text>

          {experience.map((exp, index) => (
            <View key={exp.id || index} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Experience #{index + 1}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveExperience(index)}
                >
                  <Trash2 size={20} color={Colors.dark.error} />
                </TouchableOpacity>
              </View>

              <Input
                label="Company"
                placeholder="e.g. Google"
                value={exp.company}
                onChangeText={(value) => handleUpdateExperience(index, 'company', value)}
                leftIcon={<Briefcase size={20} color={Colors.dark.subtext} />}
              />

              <Input
                label="Position"
                placeholder="e.g. Software Engineer"
                value={exp.position || ''}
                onChangeText={(value) => handleUpdateExperience(index, 'position', value)}
              />

              <View style={styles.rowContainer}>
                <Input
                  label="Start Date"
                  placeholder="YYYY/MM/DD"
                  value={exp.startDate || ''}
                  onChangeText={(value) => handleUpdateExperience(index, 'startDate', value)}
                  containerStyle={styles.halfInput}
                />

                <Input
                  label="End Date"
                  placeholder={exp.current ? "Present" : "YYYY/MM/DD"}
                  value={exp.current ? "Present" : exp.endDate || ''}
                  onChangeText={(value) => handleUpdateExperience(index, 'endDate', value)}
                  containerStyle={styles.halfInput}
                  editable={!exp.current}
                />
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    exp.current && styles.checkboxActive
                  ]}
                  onPress={() => handleUpdateExperience(index, 'current', !exp.current)}
                >
                  {exp.current && <View style={styles.checkboxInner} />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>I am currently working here</Text>
              </View>

              <Input
                label="Description"
                placeholder="Describe your responsibilities and achievements"
                value={exp.description || ''}
                onChangeText={(value) => handleUpdateExperience(index, 'description', value)}
                multiline
                numberOfLines={3}
                inputStyle={styles.textArea}
              />
            </View>
          ))}

          <Button
            title="Add Experience"
            onPress={handleAddExperience}
            variant="outline"
            leftIcon={<Plus size={20} color={Colors.dark.tint} />}
            style={styles.addButton}
          />

          <Text style={styles.sectionTitle}>Skills</Text>

          <View style={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity
                  style={styles.removeSkillButton}
                  onPress={() => handleRemoveSkill(skill)}
                >
                  <Trash2 size={16} color={Colors.dark.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addSkillContainer}>
            <Input
              placeholder="Add a skill"
              value={newSkill}
              onChangeText={setNewSkill}
              containerStyle={styles.skillInput}
            />
            <Button
              title="Add"
              onPress={handleAddSkill}
              size="small"
              style={styles.addSkillButton}
            />
          </View>

          <Button
            title="Save Profile"
            onPress={handleSave}
            gradient
            style={styles.saveButton}
            disabled={isUploadingImage}
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
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  coverPhotoContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  changeCoverButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 16,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.background,
  },
  changeProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: 'System',
  },
  itemContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: Colors.dark.tint,
    backgroundColor: Colors.dark.tint,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  checkboxLabel: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillChip: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillText: {
    color: Colors.dark.text,
    marginRight: 8,
  },
  removeSkillButton: {
    padding: 2,
  },
  addSkillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  skillInput: {
    flex: 1,
    marginRight: 8,
  },
  addSkillButton: {
    width: 80,
  },
  saveButton: {
    marginBottom: 40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileUploadingOverlay: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
  },
  loadingText: {
    color: Colors.dark.text,
    fontSize: 16,
    marginTop: 12,
  },
});
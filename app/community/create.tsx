import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  Globe,
  Lock,
  MapPin,
  Tag,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useCommunityStore } from '@/store/community-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CreateCommunityScreen() {
  const router = useRouter();
  const { createCommunity } = useCommunityStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [icon, setIcon] = useState('👥');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const communityIcons = ['👥', '💻', '🚀', '🎓', '💡', '🏢', '🎨', '📚', '⚽', '🎵', '🍕', '🌱'];

  const handleCreateCommunity = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a community');
      return;
    }

    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      createCommunity({
        name: name.trim(),
        description: description.trim(),
        location: location.trim() || undefined,
        tags: tagsArray,
        icon,
        isPrivate,
        createdBy: user.id,
        coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
      });

      Alert.alert(
        'Success',
        'Community created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create community. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Create Community',
          headerStyle: { backgroundColor: Colors.dark.background },
          headerTintColor: Colors.dark.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Community Name *"
            placeholder="Enter community name"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />

          <Input
            label="Description *"
            placeholder="Describe your community's purpose and goals"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            maxLength={500}
          />

          <Input
            label="Location (Optional)"
            placeholder="City, Country"
            value={location}
            onChangeText={setLocation}
            leftIcon={<MapPin size={20} color={Colors.dark.subtext} />}
          />

          <Input
            label="Tags (comma separated)"
            placeholder="tech, startup, networking"
            value={tags}
            onChangeText={setTags}
            leftIcon={<Tag size={20} color={Colors.dark.subtext} />}
            maxLength={200}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Icon</Text>
          <View style={styles.iconGrid}>
            {communityIcons.map((iconOption, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.iconOption,
                  icon === iconOption && styles.iconOptionSelected
                ]}
                onPress={() => setIcon(iconOption)}
              >
                <Text style={styles.iconText}>{iconOption}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.privacyOptions}>
            <TouchableOpacity
              style={[
                styles.privacyOption,
                !isPrivate && styles.privacyOptionSelected
              ]}
              onPress={() => setIsPrivate(false)}
            >
              <Globe size={24} color={!isPrivate ? Colors.dark.tint : Colors.dark.subtext} />
              <View style={styles.privacyOptionContent}>
                <Text
                  style={[
                    styles.privacyOptionTitle,
                    !isPrivate && styles.privacyOptionTitleSelected
                  ]}
                >
                  Public
                </Text>
                <Text style={styles.privacyOptionDescription}>
                  Anyone can find and join this community
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.privacyOption,
                isPrivate && styles.privacyOptionSelected
              ]}
              onPress={() => setIsPrivate(true)}
            >
              <Lock size={24} color={isPrivate ? Colors.dark.tint : Colors.dark.subtext} />
              <View style={styles.privacyOptionContent}>
                <Text
                  style={[
                    styles.privacyOptionTitle,
                    isPrivate && styles.privacyOptionTitleSelected
                  ]}
                >
                  Private
                </Text>
                <Text style={styles.privacyOptionDescription}>
                  Only invited members can join
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
          <Text style={styles.guidelinesText}>
            By creating a community, you agree to:
            {'\n'}• Maintain a respectful and inclusive environment
            {'\n'}• Follow platform terms of service
            {'\n'}• Moderate content appropriately
            {'\n'}• Respect intellectual property rights
          </Text>
        </View>

        <Button
          title={isLoading ? 'Creating...' : 'Create Community'}
          onPress={handleCreateCommunity}
          disabled={isLoading || !name.trim() || !description.trim()}
          gradient
          style={styles.createButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    borderColor: Colors.dark.tint,
    backgroundColor: `${Colors.dark.tint}20`,
  },
  iconText: {
    fontSize: 24,
  },
  privacyOptions: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyOptionSelected: {
    borderColor: Colors.dark.tint,
    backgroundColor: `${Colors.dark.tint}10`,
  },
  privacyOptionContent: {
    marginLeft: 16,
    flex: 1,
  },
  privacyOptionTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyOptionTitleSelected: {
    color: Colors.dark.tint,
  },
  privacyOptionDescription: {
    color: Colors.dark.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  guidelinesTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  guidelinesText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    lineHeight: 22,
  },
  createButton: {
    marginTop: 16,
  },
});
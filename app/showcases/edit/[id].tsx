import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Edit3, AlertCircle } from 'lucide-react-native';
import AppHeader from '@/components/layout/AppHeader';
import Colors from '@/constants/colors';

export default function EditShowcaseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleGoBack = () => {
    router.back();
  };

  const handleEditPlaceholder = () => {
    Alert.alert(
      'Coming Soon',
      'Edit functionality is not available yet. The API endpoint for editing showcases is still under development.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title="Edit Showcase"
        showCreatePost={false}
        showBackButton={true}
        onBackPress={handleGoBack}
      />
      
      <View style={styles.content}>
        <View style={styles.placeholderContainer}>
          <View style={styles.iconContainer}>
            <Edit3 size={48} color={Colors.dark.tint} />
          </View>
          
          <Text style={styles.title}>Edit Showcase</Text>
          <Text style={styles.subtitle}>Showcase ID: {id}</Text>
          
          <View style={styles.messageContainer}>
            <AlertCircle size={20} color={Colors.dark.subtext} />
            <Text style={styles.message}>
              The edit functionality is currently under development. 
              Please check back later when the API endpoint becomes available.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleEditPlaceholder}
          >
            <Text style={styles.buttonText}>Try Edit (Demo)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoBack}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderContainer: {
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 32,
    maxWidth: 320,
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.dark.tint}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  message: {
    color: Colors.dark.subtext,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: Colors.dark.text,
  },
});

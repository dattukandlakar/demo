import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, MapPin, DollarSign, Clock, Upload, Users } from 'lucide-react-native';
import { useCommunityStore } from '@/store/community-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';

export default function CreateEvent() {
  const router = useRouter();
  const { activeCommunity, createEvent } = useCommunityStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [ticketPrice, setTicketPrice] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  if (!activeCommunity) {
    router.replace('/community/create');
    return null;
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Event title is required';
    if (!description.trim()) newErrors.description = 'Event description is required';
    if (!date.trim()) newErrors.date = 'Event date is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (isPaid && !ticketPrice.trim()) newErrors.ticketPrice = 'Ticket price is required for paid events';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCreateEvent = () => {
    if (!validateForm()) return;
    
    createEvent({
      communityId: activeCommunity.id,
      title,
      description,
      date,
      location,
      isPaid,
      ticketPrice: isPaid ? parseFloat(ticketPrice) : 0,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      image,
    });
    
    router.push('/community/dashboard');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.communityName}>Hosting as: {activeCommunity.name}</Text>
          
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.eventImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Calendar size={40} color={Colors.dark.subtext} />
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={16} color={Colors.dark.text} />
              <Text style={styles.uploadText}>Upload Event Image</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <View style={[styles.inputContainer, errors.title && styles.inputError]}>
              <Calendar size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Tech Meetup 2023"
                placeholderTextColor={Colors.dark.subtext}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Description *</Text>
            <View style={[styles.textAreaContainer, errors.description && styles.inputError]}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your event, what attendees can expect..."
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
            <Text style={styles.label}>Event Date *</Text>
            <View style={[styles.inputContainer, errors.date && styles.inputError]}>
              <Calendar size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 15 Dec 2023, 6:00 PM"
                placeholderTextColor={Colors.dark.subtext}
                value={date}
                onChangeText={setDate}
              />
            </View>
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <View style={[styles.inputContainer, errors.location && styles.inputError]}>
              <MapPin size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Tech Hub, 123 Main St, City"
                placeholderTextColor={Colors.dark.subtext}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Paid Event</Text>
              <Switch
                value={isPaid}
                onValueChange={setIsPaid}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor="#fff"
              />
            </View>
            
            {isPaid && (
              <View style={[styles.inputContainer, errors.ticketPrice && styles.inputError]}>
                <DollarSign size={20} color={Colors.dark.subtext} />
                <TextInput
                  style={styles.input}
                  placeholder="Ticket price (e.g. 500)"
                  placeholderTextColor={Colors.dark.subtext}
                  value={ticketPrice}
                  onChangeText={setTicketPrice}
                  keyboardType="numeric"
                />
              </View>
            )}
            {errors.ticketPrice && <Text style={styles.errorText}>{errors.ticketPrice}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Attendees (Optional)</Text>
            <View style={styles.inputContainer}>
              <Users size={20} color={Colors.dark.subtext} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 50 (leave empty for unlimited)"
                placeholderTextColor={Colors.dark.subtext}
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <Button 
            title="Create Event" 
            onPress={handleCreateEvent} 
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
  communityName: {
    fontSize: 16,
    color: Colors.dark.primary,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Plus, 
  Trash2,
  Users,
  DollarSign,
  Camera,
  Image as ImageIcon
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEventStore } from '@/store/event-store';
import { useAuthStore } from '@/store/auth-store';
import { Event, TicketType } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createTicket, createEvent } from '@/api/event';

// Mock DateTimePicker since we can't install @react-native-community/datetimepicker
const DateTimePickerMock = ({ value, mode, display, onChange }) => {
  return (
    <TouchableOpacity 
      style={{
        padding: 12,
        backgroundColor: Colors.dark.card,
        borderRadius: 8,
        marginTop: 8,
      }}
      onPress={() => {
        // In a real implementation, this would open the date/time picker
        // For now, we'll just call onChange with a mock date
        onChange(null, new Date());
      }}
    >
      <Text style={{ color: Colors.dark.text }}>
        {mode === 'date' 
          ? value.toLocaleDateString() 
          : value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </TouchableOpacity>
  );
};

export default function CreateEventScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore(); // Fixed: destructure token
  // Remove: const { createEvent } = useEventStore();
  
  // Event details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [onlineEventLink, setOnlineEventLink] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [isPaid, setIsPaid] = useState(false);
  const [organizer, setOrganizer] = useState(user?.name || '');
  const [banner, setBanner] = useState<string | null>(null);
  
  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Speakers
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [speakerInput, setSpeakerInput] = useState('');
  
  // Ticket types
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: 't1',
      name: 'Regular',
      price: 0,
      available: 100,
      total: 100
    }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image picker functions
  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setBanner(result.assets[0].uri);
    }
  };
  
  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Gallery access permission is required to select photos.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setBanner(result.assets[0].uri);
    }
  };
  
  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Banner Image',
      'Choose how you want to add a banner image',
      [
        {
          text: 'Camera',
          onPress: pickImageFromCamera,
        },
        {
          text: 'Gallery',
          onPress: pickImageFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
    } else {
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleAddSpeaker = () => {
    if (speakerInput.trim() && !speakers.includes(speakerInput.trim())) {
      const newSpeakers = [...speakers, speakerInput.trim()];
      setSpeakers(newSpeakers);
      setSpeakerInput('');
    } else {
    }
  };
  
  const handleRemoveSpeaker = (speaker: string) => {
    setSpeakers(speakers.filter(s => s !== speaker));
  };
  
  const handleAddTicketType = () => {
    const newTicketType: TicketType = {
      id: `t${ticketTypes.length + 1}`,
      name: `Ticket Type ${ticketTypes.length + 1}`,
      price: 0,
      available: 100,
      total: 100
    };
    
    setTicketTypes([...ticketTypes, newTicketType]);
  };
  
  const handleRemoveTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter(t => t.id !== id));
    } else {
      Alert.alert('Cannot Remove', 'You must have at least one ticket type.');
    }
  };
  
  const handleUpdateTicketType = (id: string, field: keyof TicketType, value: any) => {
    setTicketTypes(ticketTypes.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    }));
  };
  
 const handleSubmit = async () => {
  const requiredLocation = isOnline ? onlineEventLink : location;
  if (!title || !description || !requiredLocation || !organizer) {
    Alert.alert('Missing Information', 'Please fill in all required fields.');
    return;
  }

  if (!token) {
    Alert.alert('Error', 'You must be logged in to create an event.');
    return;
  }

  setIsSubmitting(true);

  try {
    // 1. Create all tickets sequentially
    const ticketIds: string[] = [];
    for (const ticket of ticketTypes) {
      const ticketPayload = {
        name: ticket.name,
        price: String(ticket.price),
        remTicket: ticket.available,
      };
      const ticketId = await createTicket(token, ticketPayload);
      ticketIds.push(ticketId);
    }

    // 2. Prepare event data
    const eventPayload = {
      title,
      description,
      shortDescription: description.slice(0, 100),
      date: date.toISOString().split('T')[0],
      time,
      location: isOnline ? 'Online Event' : location,
      banner,
      organizer,
      organizerId: user?.id || 'unknown',
      isPaid: isPaid.toString(),
      isOnline: isOnline.toString(),
      onlineEventLink: isOnline ? onlineEventLink : '',
      category,
      ticketTypes: ticketIds,
      maxAttendees: 50,
      attendees: [],
      tags,
      speakers,
      createdBy: user?.id || 'unknown',
      likes: [],
      bookmarks: [],
    };

    
    // Test with some sample data to see if the issue is with empty arrays
    if (tags.length === 0) {
    }
    if (speakers.length === 0) {
    }

    // 3. Create the event (only after all tickets are created)
    const createdEventResponse = await createEvent(token, eventPayload);

    // Extract event ID from response (adjust based on your API response structure)
    const eventId = createdEventResponse.body.id || createdEventResponse.body._id || createdEventResponse.body?.id;

    Alert.alert(
      'Success',
      'Event created successfully!',
      [
        {
          text: 'View Event',
          onPress: () => router.push(`/event/${eventId}`)
        },
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to create event');
  } finally {
    setIsSubmitting(false);
  }
};
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          <Input
            label="Event Title *"
            placeholder="Enter event title"
            value={title}
            onChangeText={setTitle}
          />
          
          <Input
            label="Description *"
            placeholder="Enter event description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          
          {/* Banner Image Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Banner Image</Text>
            <TouchableOpacity 
              style={styles.imagePickerContainer}
              onPress={showImagePickerOptions}
            >
              {banner ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: banner }} style={styles.selectedImage} />
                  <TouchableOpacity 
                    style={styles.changeImageButton}
                    onPress={showImagePickerOptions}
                  >
                    <Camera size={20} color="#fff" />
                    <Text style={styles.changeImageText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <ImageIcon size={48} color={Colors.dark.subtext} />
                  <Text style={styles.imagePlaceholderText}>Tap to add banner image</Text>
                  <Text style={styles.imagePlaceholderSubtext}>Recommended: 16:9 aspect ratio</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Event Date *</Text>
            <View style={styles.datePickerContainer}>
              <Calendar size={20} color={Colors.dark.primary} />
              <DateTimePickerMock
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            </View>
          </View>
          
          <Input
            label="Event Time *"
            placeholder="e.g., 18:00"
            value={time}
            onChangeText={setTime}
            leftIcon={<Clock size={20} color={Colors.dark.primary} />}
          />
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Event Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {['Workshop', 'Meetup', 'Pitch', 'Seminar', 'Hackathon', 'Webinar', 'Conference', 'Networking'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.selectedCategoryChip
                  ]}
                  onPress={() => setCategory(cat as any)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    category === cat && styles.selectedCategoryChipText
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Online Event</Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: Colors.dark.card, true: `${Colors.dark.primary}80` }}
              thumbColor={isOnline ? Colors.dark.primary : Colors.dark.subtext}
            />
          </View>
          
          <Input
            label={isOnline ? "Online Event Link *" : "Location *"}
            placeholder={isOnline ? "Enter meeting link (Zoom, Google Meet, etc.)" : "Enter event location"}
            value={isOnline ? onlineEventLink : location}
            onChangeText={isOnline ? setOnlineEventLink : setLocation}
            leftIcon={<MapPin size={20} color={Colors.dark.primary} />}
          />
          
          <Input
            label="Organizer *"
            placeholder="Enter organizer name"
            value={organizer}
            onChangeText={setOrganizer}
            leftIcon={<Users size={20} color={Colors.dark.primary} />}
          />
          
          <View style={styles.tagsSection}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag"
                placeholderTextColor={Colors.dark.subtext}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddTag}
              >
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <Trash2 size={16} color={Colors.dark.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.speakersSection}>
            <Text style={styles.label}>Speakers</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a speaker"
                placeholderTextColor={Colors.dark.subtext}
                value={speakerInput}
                onChangeText={setSpeakerInput}
                onSubmitEditing={handleAddSpeaker}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddSpeaker}
              >
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.speakersContainer}>
              {speakers.map((speaker, index) => (
                <View key={index} style={styles.speaker}>
                  <Text style={styles.speakerText}>{speaker}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSpeaker(speaker)}>
                    <Trash2 size={16} color={Colors.dark.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.ticketsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tickets</Text>
              <TouchableOpacity 
                style={styles.addTicketButton}
                onPress={handleAddTicketType}
              >
                <Text style={styles.addTicketText}>+ Add Ticket Type</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Paid Event</Text>
              <Switch
                value={isPaid}
                onValueChange={setIsPaid}
                trackColor={{ false: Colors.dark.card, true: `${Colors.dark.primary}80` }}
                thumbColor={isPaid ? Colors.dark.primary : Colors.dark.subtext}
              />
            </View>
            
            {ticketTypes.map((ticket, index) => (
              <View key={ticket.id} style={styles.ticketTypeCard}>
                <View style={styles.ticketTypeHeader}>
                  <Text style={styles.ticketTypeTitle}>Ticket Type {index + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTicketType(ticket.id)}>
                    <Trash2 size={20} color={Colors.dark.error} />
                  </TouchableOpacity>
                </View>
                
                <Input
                  label="Ticket Name"
                  placeholder="e.g., Regular, VIP, Early Bird"
                  value={ticket.name}
                  onChangeText={(value) => handleUpdateTicketType(ticket.id, 'name', value)}
                />
                
                <Input
                  label="Price"
                  placeholder="0"
                  value={ticket.price.toString()}
                  onChangeText={(value) => handleUpdateTicketType(ticket.id, 'price', parseInt(value) || 0)}
                  keyboardType="numeric"
                  leftIcon={<DollarSign size={20} color={Colors.dark.primary} />}
                  editable={isPaid}
                />
                
                <Input
                  label="Available Tickets"
                  placeholder="100"
                  value={ticket.available.toString()}
                  onChangeText={(value) => {
                    const available = parseInt(value) || 0;
                    handleUpdateTicketType(ticket.id, 'available', available);
                    handleUpdateTicketType(ticket.id, 'total', available);
                  }}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
          
          <Button
            title="Create Event"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            gradient
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
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 8,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  switchLabel: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  tagsSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.dark.text,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.dark.text,
    marginRight: 8,
  },
  speakersSection: {
    marginBottom: 24,
  },
  speakersContainer: {
    
  },
  speaker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  speakerText: {
    color: Colors.dark.text,
  },
  ticketsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addTicketButton: {
    
  },
  addTicketText: {
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  ticketTypeCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ticketTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketTypeTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 16,
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  categoryChipText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  // Image picker styles
  imagePickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  imagePlaceholder: {
    backgroundColor: Colors.dark.card,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imagePlaceholderText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  imagePlaceholderSubtext: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

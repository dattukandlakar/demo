import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { 
  Plus, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Link, 
  Tag,
  DollarSign,
  Users,
  ChevronRight,
  CreditCard
} from 'lucide-react-native';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Colors from '@/constants/colors';
import { Company } from '@/store/company-store';

// Mock events data
const mockEvents = [
  {
    id: 'e1',
    title: 'React Native Workshop',
    description: 'Learn how to build cross-platform mobile apps with React Native.',
    date: '2023-07-15',
    time: '10:00 - 12:00',
    location: 'Online',
    isOnline: true,
    link: 'https://zoom.us/j/123456789',
    tags: ['workshop', 'beginner', 'react-native'],
    visibility: 'public',
    ticketType: 'free',
    attendees: 24,
    createdAt: '2023-06-01T08:45:00Z',
  },
  {
    id: 'e2',
    title: 'Mobile App Design Masterclass',
    description: 'A comprehensive masterclass on designing beautiful and functional mobile applications.',
    date: '2023-07-22',
    time: '14:00 - 17:00',
    location: 'TechHub, New York',
    isOnline: false,
    tags: ['design', 'ui/ux', 'masterclass'],
    visibility: 'public',
    ticketType: 'paid',
    price: '$49.99',
    attendees: 18,
    createdAt: '2023-06-05T11:30:00Z',
  },
];

interface CompanyEventsTabProps {
  company: Company;
  isOwner: boolean;
}

const CompanyEventsTab: React.FC<CompanyEventsTabProps> = ({ company, isOwner }) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [bankDetailsModalVisible, setBankDetailsModalVisible] = useState(false);
  const [viewAttendeesModalVisible, setViewAttendeesModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [eventLocation, setEventLocation] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [eventTags, setEventTags] = useState('');
  const [eventVisibility, setEventVisibility] = useState('public');
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [eventPrice, setEventPrice] = useState('');
  
  // Bank details form states
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  
  const handleCreateEvent = () => {
    // Validate form
    if (!eventTitle || !eventDescription || !eventDate || !eventTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    if (isOnline && !eventLink) {
      Alert.alert('Missing Information', 'Please provide a link for the online event.');
      return;
    }
    
    if (!isOnline && !eventLocation) {
      Alert.alert('Missing Information', 'Please provide a location for the offline event.');
      return;
    }
    
    if (isPaidEvent && !eventPrice) {
      Alert.alert('Missing Information', 'Please provide a price for the paid event.');
      return;
    }
    
    // If it's a paid event and bank details are not verified, show bank details modal
    if (isPaidEvent && !isBankVerified) {
      setBankDetailsModalVisible(true);
      return;
    }
    
    // In a real app, you'd create the event here
    Alert.alert('Success', 'Event created successfully!');
    
    // Reset form and close modal
    resetEventForm();
    setCreateModalVisible(false);
  };
  
  const resetEventForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventTime('');
    setIsOnline(false);
    setEventLocation('');
    setEventLink('');
    setEventTags('');
    setEventVisibility('public');
    setIsPaidEvent(false);
    setEventPrice('');
  };
  
  const handleSaveBankDetails = () => {
    // Validate bank details
    if (!beneficiaryName || !accountType || !bankName || !accountNumber || !ifscCode) {
      Alert.alert('Missing Information', 'Please fill in all bank details.');
      return;
    }
    
    // In a real app, you'd verify the bank details here
    Alert.alert(
      'Bank Details Verification',
      'Your bank details have been saved and are being verified. You will be notified once verification is complete.',
      [
        { text: 'OK', onPress: () => setBankDetailsModalVisible(false) }
      ]
    );
  };
  
  const handleViewAttendees = (event: any) => {
    setSelectedEvent(event);
    setViewAttendeesModalVisible(true);
  };
  
  // Mock bank verification status
  const isBankVerified = false;
  
  const renderEventItem = ({ item }: { item: any }) => {
    const eventDate = new Date(item.date);
    const now = new Date();
    const isPastEvent = eventDate < now;
    
    return (
      <Card style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            
            <View style={styles.eventDateContainer}>
              <Calendar size={16} color={Colors.dark.subtext} />
              <Text style={styles.eventDateText}>{item.date} • {item.time}</Text>
            </View>
          </View>
          
          {isOwner && (
            <TouchableOpacity 
              style={styles.attendeesButton}
              onPress={() => handleViewAttendees(item)}
            >
              <Text style={styles.attendeesCount}>{item.attendees}</Text>
              <Text style={styles.attendeesLabel}>Attendees</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.eventDetails}>
          {item.isOnline ? (
            <View style={styles.eventDetailItem}>
              <Link size={16} color={Colors.dark.subtext} />
              <Text style={styles.eventDetailText}>Online Event</Text>
            </View>
          ) : (
            <View style={styles.eventDetailItem}>
              <MapPin size={16} color={Colors.dark.subtext} />
              <Text style={styles.eventDetailText}>{item.location}</Text>
            </View>
          )}
          
          {item.ticketType === 'paid' && (
            <View style={styles.eventDetailItem}>
              <DollarSign size={16} color={Colors.dark.subtext} />
              <Text style={styles.eventDetailText}>{item.price}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.eventFooter}>
          {isPastEvent ? (
            <Text style={styles.pastEventLabel}>Event has ended</Text>
          ) : (
            <>
              {isOwner ? (
                <TouchableOpacity 
                  style={styles.viewAttendeesButton}
                  onPress={() => handleViewAttendees(item)}
                >
                  <Text style={styles.viewAttendeesText}>View Attendees</Text>
                  <ChevronRight size={16} color={Colors.dark.tint} />
                </TouchableOpacity>
              ) : (
                <Button
                  title={item.ticketType === 'free' ? "Register" : "Buy Ticket"}
                  onPress={() => Alert.alert('Register', 'Registration functionality would be implemented here.')}
                  size="small"
                  leftIcon={item.ticketType === 'paid' ? <CreditCard size={16} color="#fff" /> : undefined}
                />
              )}
            </>
          )}
        </View>
      </Card>
    );
  };
  
  // Mock attendees data
  const mockAttendees = [
    {
      id: 'a1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      registeredAt: '2023-06-10T09:45:00Z',
      ticketType: 'Standard',
    },
    {
      id: 'a2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      registeredAt: '2023-06-11T14:20:00Z',
      ticketType: 'VIP',
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
      
      {mockEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptyText}>
              {isOwner 
                ? "Create your first event to engage with your audience."
                : "This company hasn't organized any events yet. Check back later!"}
            </Text>
            
            {isOwner && (
              <Button
                title="Create Event"
                onPress={() => setCreateModalVisible(true)}
                style={styles.createButton}
                leftIcon={<Plus size={18} color="#fff" />}
              />
            )}
          </Card>
        </View>
      ) : (
        <FlatList
          data={mockEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Create Event Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Event</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Input
                label="Event Title *"
                placeholder="Enter event title"
                value={eventTitle}
                onChangeText={setEventTitle}
              />
              
              <Input
                label="Description *"
                placeholder="Enter event description"
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
              
              <Input
                label="Date *"
                placeholder="YYYY-MM-DD"
                value={eventDate}
                onChangeText={setEventDate}
                leftIcon={<Calendar size={20} color={Colors.dark.subtext} />}
              />
              
              <Input
                label="Time *"
                placeholder="HH:MM - HH:MM"
                value={eventTime}
                onChangeText={setEventTime}
                leftIcon={<Clock size={20} color={Colors.dark.subtext} />}
              />
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Online Event</Text>
                <Switch
                  value={isOnline}
                  onValueChange={setIsOnline}
                  trackColor={{ false: Colors.dark.border, true: `${Colors.dark.tint}50` }}
                  thumbColor={isOnline ? Colors.dark.tint : Colors.dark.subtext}
                />
              </View>
              
              {isOnline ? (
                <Input
                  label="Event Link *"
                  placeholder="Enter meeting link"
                  value={eventLink}
                  onChangeText={setEventLink}
                  leftIcon={<Link size={20} color={Colors.dark.subtext} />}
                />
              ) : (
                <Input
                  label="Location *"
                  placeholder="Enter event location"
                  value={eventLocation}
                  onChangeText={setEventLocation}
                  leftIcon={<MapPin size={20} color={Colors.dark.subtext} />}
                />
              )}
              
              <Input
                label="Tags (comma separated)"
                placeholder="e.g. workshop, tech, beginner"
                value={eventTags}
                onChangeText={setEventTags}
                leftIcon={<Tag size={20} color={Colors.dark.subtext} />}
              />
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Paid Event</Text>
                <Switch
                  value={isPaidEvent}
                  onValueChange={setIsPaidEvent}
                  trackColor={{ false: Colors.dark.border, true: `${Colors.dark.tint}50` }}
                  thumbColor={isPaidEvent ? Colors.dark.tint : Colors.dark.subtext}
                />
              </View>
              
              {isPaidEvent && (
                <Input
                  label="Ticket Price *"
                  placeholder="e.g. 49.99"
                  value={eventPrice}
                  onChangeText={setEventPrice}
                  keyboardType="numeric"
                  leftIcon={<DollarSign size={20} color={Colors.dark.subtext} />}
                />
              )}
              
              <View style={styles.visibilityContainer}>
                <Text style={styles.visibilityLabel}>Event Visibility</Text>
                <View style={styles.visibilityOptions}>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      eventVisibility === 'public' && styles.visibilityOptionSelected
                    ]}
                    onPress={() => setEventVisibility('public')}
                  >
                    <Text
                      style={[
                        styles.visibilityOptionText,
                        eventVisibility === 'public' && styles.visibilityOptionTextSelected
                      ]}
                    >
                      Public
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      eventVisibility === 'private' && styles.visibilityOptionSelected
                    ]}
                    onPress={() => setEventVisibility('private')}
                  >
                    <Text
                      style={[
                        styles.visibilityOptionText,
                        eventVisibility === 'private' && styles.visibilityOptionTextSelected
                      ]}
                    >
                      Private
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Button
                title="Create Event"
                onPress={handleCreateEvent}
                gradient
                style={styles.createEventButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Bank Details Modal */}
      <Modal
        visible={bankDetailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBankDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bank Details</Text>
              <TouchableOpacity onPress={() => setBankDetailsModalVisible(false)}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.bankDetailsInfo}>
                To create paid events, please provide your bank details for receiving payments.
                This information will be verified once and used for all future paid events.
              </Text>
              
              <Input
                label="Beneficiary Name *"
                placeholder="Enter account holder name"
                value={beneficiaryName}
                onChangeText={setBeneficiaryName}
              />
              
              <Input
                label="Account Type *"
                placeholder="e.g. Savings, Current"
                value={accountType}
                onChangeText={setAccountType}
              />
              
              <Input
                label="Bank Name *"
                placeholder="Enter bank name"
                value={bankName}
                onChangeText={setBankName}
              />
              
              <Input
                label="Account Number *"
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
              />
              
              <Input
                label="IFSC Code *"
                placeholder="Enter IFSC code"
                value={ifscCode}
                onChangeText={setIfscCode}
                autoCapitalize="characters"
              />
              
              <Button
                title="Save Bank Details"
                onPress={handleSaveBankDetails}
                gradient
                style={styles.saveBankDetailsButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* View Attendees Modal */}
      <Modal
        visible={viewAttendeesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewAttendeesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attendees</Text>
              <TouchableOpacity onPress={() => setViewAttendeesModalVisible(false)}>
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.attendeesHeader}>
              <Text style={styles.attendeesTitle}>
                {selectedEvent?.title}
              </Text>
              <Text style={styles.attendeesCount}>
                {selectedEvent?.attendees} Registered Attendees
              </Text>
            </View>
            
            <FlatList
              data={mockAttendees}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.attendeeCard}>
                  <View style={styles.attendeeInfo}>
                    <Text style={styles.attendeeName}>{item.name}</Text>
                    <Text style={styles.attendeeEmail}>{item.email}</Text>
                    
                    <View style={styles.attendeeDetails}>
                      <Text style={styles.attendeeTicketType}>
                        {item.ticketType} Ticket
                      </Text>
                      <Text style={styles.registeredDate}>
                        Registered on {new Date(item.registeredAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.attendeesList}
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
  eventCard: {
    padding: 16,
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginLeft: 4,
  },
  attendeesButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.dark.tint}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attendeesCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.tint,
  },
  attendeesLabel: {
    fontSize: 12,
    color: Colors.dark.tint,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: `${Colors.dark.tint}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.dark.tint,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  pastEventLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    fontStyle: 'italic',
  },
  viewAttendeesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAttendeesText: {
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  visibilityContainer: {
    marginVertical: 16,
  },
  visibilityLabel: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  visibilityOptions: {
    flexDirection: 'row',
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  visibilityOptionSelected: {
    backgroundColor: `${Colors.dark.tint}15`,
    borderColor: Colors.dark.tint,
  },
  visibilityOptionText: {
    color: Colors.dark.subtext,
  },
  visibilityOptionTextSelected: {
    color: Colors.dark.tint,
    fontWeight: '600',
  },
  createEventButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  bankDetailsInfo: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  saveBankDetailsButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  attendeesHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  attendeesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  attendeesList: {
    padding: 16,
  },
  attendeeCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  attendeeInfo: {
    marginBottom: 8,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  attendeeEmail: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  attendeeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendeeTicketType: {
    fontSize: 14,
    color: Colors.dark.tint,
    fontWeight: '500',
  },
  registeredDate: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
});

export default CompanyEventsTab;
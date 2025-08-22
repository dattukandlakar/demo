import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  Image,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  ChevronRight, 
  Mail, 
  Phone, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Clock 
} from 'lucide-react-native';
import { useCommunityStore } from '@/store/community-store';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, bookings, activeCommunity, updateEvent, deleteEvent, updateBooking } = useCommunityStore();
  const [activeTab, setActiveTab] = useState('details');
  
  const event = events.find(e => e.id === id);
  const eventBookings = bookings.filter(booking => booking.eventId === id);
  
  if (!event || !activeCommunity) {
    router.replace('/community/dashboard');
    return null;
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleCancelEvent = () => {
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? Attendees will be notified.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            updateEvent(event.id, { status: 'cancelled' });
            router.back();
          }
        }
      ]
    );
  };
  
  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to permanently delete this event? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Delete', 
          style: 'destructive',
          onPress: () => {
            deleteEvent(event.id);
            router.replace('/community/dashboard');
          }
        }
      ]
    );
  };
  
  const handleUpdateBookingStatus = (bookingId: string, paymentStatus: 'paid' | 'unpaid' | 'refunded') => {
    updateBooking(bookingId, { paymentStatus });
    Alert.alert('Success', `Booking status updated to ${paymentStatus}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>
            Bookings ({eventBookings.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {activeTab === 'details' ? (
          <View style={styles.content}>
            {event.image && (
              <Image source={{ uri: event.image }} style={styles.eventImage} />
            )}
            
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={[
                styles.eventTypeTag,
                event.status === 'active' ? styles.activeTag : styles.cancelledTag
              ]}>
                <Text style={styles.eventTypeText}>
                  {event.status === 'active' ? (event.isPaid ? 'Paid' : 'Free') : 'Cancelled'}
                </Text>
              </View>
            </View>
            
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <Calendar size={16} color={Colors.dark.subtext} />
                <Text style={styles.metaText}>{event.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={16} color={Colors.dark.subtext} />
                <Text style={styles.metaText}>{event.location}</Text>
              </View>
              {event.isPaid && (
                <View style={styles.metaItem}>
                  <DollarSign size={16} color={Colors.dark.subtext} />
                  <Text style={styles.metaText}>₹{event.ticketPrice}</Text>
                </View>
              )}
              {event.maxAttendees && (
                <View style={styles.metaItem}>
                  <Users size={16} color={Colors.dark.subtext} />
                  <Text style={styles.metaText}>Max {event.maxAttendees} attendees</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Clock size={16} color={Colors.dark.subtext} />
                <Text style={styles.metaText}>Created on {formatDate(event.createdAt)}</Text>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bookings</Text>
              <View style={styles.bookingStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{eventBookings.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {eventBookings.filter(booking => booking.paymentStatus === 'paid').length}
                  </Text>
                  <Text style={styles.statLabel}>Paid</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {eventBookings.filter(booking => booking.paymentStatus === 'unpaid').length}
                  </Text>
                  <Text style={styles.statLabel}>Unpaid</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => router.push(`/community/event/edit/${event.id}`)}
              >
                <Edit size={20} color={Colors.dark.text} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              
              {event.status === 'active' ? (
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCancelEvent}
                >
                  <X size={20} color="#fff" />
                  <Text style={styles.cancelButtonText}>Cancel Event</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDeleteEvent}
                >
                  <Trash2 size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {eventBookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={40} color={Colors.dark.subtext} />
                <Text style={styles.emptyStateText}>
                  No bookings received yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={eventBookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <Text style={styles.participantName}>{item.userName}</Text>
                      <View style={[
                        styles.statusTag,
                        item.paymentStatus === 'paid' ? styles.paidTag : 
                        item.paymentStatus === 'unpaid' ? styles.unpaidTag : styles.refundedTag,
                      ]}>
                        <Text style={[
                          styles.statusText,
                          item.paymentStatus === 'paid' ? styles.paidText : 
                          item.paymentStatus === 'unpaid' ? styles.unpaidText : styles.refundedText,
                        ]}>
                          {item.paymentStatus}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.bookingMeta}>
                      <View style={styles.metaItem}>
                        <Mail size={16} color={Colors.dark.subtext} />
                        <Text style={styles.metaText}>{item.userEmail}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Phone size={16} color={Colors.dark.subtext} />
                        <Text style={styles.metaText}>{item.userPhone}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Calendar size={16} color={Colors.dark.subtext} />
                        <Text style={styles.metaText}>Booked on {formatDate(item.bookingDate)}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Users size={16} color={Colors.dark.subtext} />
                        <Text style={styles.metaText}>{item.ticketCount} {item.ticketCount > 1 ? 'tickets' : 'ticket'}</Text>
                      </View>
                      {event.isPaid && (
                        <View style={styles.metaItem}>
                          <DollarSign size={16} color={Colors.dark.subtext} />
                          <Text style={styles.metaText}>₹{item.totalAmount}</Text>
                        </View>
                      )}
                    </View>
                    
                    {event.isPaid && (
                      <View style={styles.bookingActions}>
                        {item.paymentStatus !== 'paid' && (
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleUpdateBookingStatus(item.id, 'paid')}
                          >
                            <Check size={16} color={Colors.dark.success} />
                            <Text style={[styles.actionButtonText, { color: Colors.dark.success }]}>
                              Mark as Paid
                            </Text>
                          </TouchableOpacity>
                        )}
                        
                        {item.paymentStatus !== 'unpaid' && item.paymentStatus !== 'refunded' && (
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleUpdateBookingStatus(item.id, 'refunded')}
                          >
                            <DollarSign size={16} color={Colors.dark.warning} />
                            <Text style={[styles.actionButtonText, { color: Colors.dark.warning }]}>
                              Mark as Refunded
                            </Text>
                          </TouchableOpacity>
                        )}
                        
                        {item.paymentStatus !== 'unpaid' && (
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleUpdateBookingStatus(item.id, 'unpaid')}
                          >
                            <X size={16} color={Colors.dark.error} />
                            <Text style={[styles.actionButtonText, { color: Colors.dark.error }]}>
                              Mark as Unpaid
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )}
                scrollEnabled={false}
                style={styles.bookingsList}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
  },
  tabText: {
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.dark.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
  },
  eventTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  activeTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  cancelledTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  eventTypeText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  eventMeta: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  descriptionText: {
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 24,
  },
  bookingStats: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    color: Colors.dark.text,
    fontWeight: '500',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.error,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.error,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
  },
  emptyStateText: {
    color: Colors.dark.subtext,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  bookingsList: {
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paidTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  unpaidTag: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  refundedTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paidText: {
    color: Colors.dark.success,
  },
  unpaidText: {
    color: Colors.dark.warning,
  },
  refundedText: {
    color: Colors.dark.error,
  },
  bookingMeta: {
    marginBottom: 12,
  },
  bookingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    fontWeight: '500',
  },
});

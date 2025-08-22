// app/(tabs)/events.tsx

import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  QrCode,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Plus,
  ArrowUp,
  X,
  Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EventCard from '@/components/events/EventCard';
import TabBar from '@/components/ui/TabBar';
import { useEventStore } from '@/store/event-store';
import { useAuthStore } from '@/store/auth-store';
import { Event } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import AppHeader from '@/components/layout/AppHeader';

const { width, height } = Dimensions.get('window');

export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { events, userBookedEvents, fetchEvents, fetchUserBookedEvents, isLoading } = useEventStore();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Date filter state
  const [dateOptions, setDateOptions] = useState<{id: string, label: string, date?: Date}[]>([]);
  
  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    isPaid: 'all',
    isOnline: 'all',
    dateRange: 'all'
  });

  // Add selectedDate state for the horizontal date filter
  const [selectedDate, setSelectedDate] = useState('all');

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    loadData();
  }, []);

  // Handle tab switching from booking success
  useEffect(() => {
    if (params.switchToTickets === 'true') {
      setActiveTab('tickets');
    }
  }, [params.switchToTickets]);

  useEffect(() => {
     if (events) {
  }
    if (events && events.length > 0) {
      generateDateOptions();
    }
  }, [events]);

  useEffect(() => {
    fetchEvents(filters);
  }, [filters]);

  const generateDateOptions = () => {
    const options: {id: string, label: string, date?: Date}[] = [
      { id: 'all', label: 'All' }
    ];
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    options.push(
      { id: 'today', label: 'Today', date: today },
      { id: 'tomorrow', label: 'Tomorrow', date: tomorrow }
    );
    
    // Add next 5 days
    for (let i = 2; i <= 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateId = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short'
      });
      options.push({ id: dateId, label, date });
    }
    
    setDateOptions(options);
  };

  const loadData = async () => {
    await fetchEvents();
    await fetchUserBookedEvents();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    router.push(`/event/${event.id}`);
  };

  const handleViewTicket = (event: Event) => {
    // Find the user's ticket for this event
    if (user && event.attendees) {
      const ticket = event.attendees.find(attendee => attendee.email === user.email);
      if (ticket) {
        router.push(`/event/ticket/${event.id}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const handleCreateEvent = () => {
    router.push('/event/create');
  };
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = (event.nativeEvent as any).contentOffset.y;
        setShowScrollToTop(offsetY > height * 0.5);
      }
    }
  );
  
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };
  
  // Filter functions
  const handleFilterPress = () => {
    setShowFilterModal(true);
  };
  
  const applyFilters = async () => {
    setShowFilterModal(false);
    
    try {
      // Call fetchEvents with current filters
      await fetchEvents(filters);
    } catch (error) {
    }
  };
  
  const resetFilters = () => {
    setFilters({
      category: 'all',
      isPaid: 'all',
      isOnline: 'all',
      dateRange: 'all'
    });
    
    // Reset selected date
    setSelectedDate('all');
    
    // Fetch all events (no filters)
    fetchEvents();
    
    setShowFilterModal(false);
  };
  
  // Update handleDateSelect to update selectedDate, update filters, and call fetchEvents
  const handleDateSelect = (dateId: string) => {
    setSelectedDate(dateId);
    setFilters(prev => ({ ...prev, dateRange: dateId }));
  };

  const handleCategorySelect = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <Animated.ScrollView 
            ref={scrollViewRef}
            style={styles.tabContent}
            contentContainerStyle={styles.scrollContent}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.tint}
                colors={[Colors.dark.tint]}
              />
            }
          >
            {/* Search and Filter Bar */}
            <View style={styles.searchFilterContainer}>
              <TouchableOpacity 
                style={styles.searchBar}
                onPress={() => router.push('/search')}
              >
                <Search size={18} color={Colors.dark.subtext} />
                <Text style={styles.searchPlaceholder}>Search events...</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={handleFilterPress}
              >
                <Filter size={18} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            {/* Horizontal Date Filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.dateFilterContainer}
              contentContainerStyle={styles.dateFilterContent}
            >
              {dateOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.dateFilterButton,
                    selectedDate === option.id && styles.dateFilterButtonSelected
                  ]}
                  onPress={() => handleDateSelect(option.id)}
                >
                  <Text style={[
                    styles.dateFilterText,
                    selectedDate === option.id && styles.dateFilterTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            
            
            {/* Events List - Optimized with FlatList */}
            <FlatList
              data={events || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EventCard 
                  event={item} 
                  onPress={() => handleEventPress(item)} 
                />
              )}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={3}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    No upcoming events found
                  </Text>
                  <Button 
                    title="Create Event" 
                    onPress={handleCreateEvent}
                    style={styles.exploreButton}
                  />
                </View>
              )}
            />
          </Animated.ScrollView>
        );
      
      case 'tickets':
        return (
          <ScrollView 
            style={styles.tabContent}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.tint}
                colors={[Colors.dark.tint]}
              />
            }
          >
            <Text style={styles.sectionTitle}>My Tickets</Text>
            {userBookedEvents && userBookedEvents.length > 0 ? (
              userBookedEvents.map((event: Event) => (
                <TouchableOpacity 
                  key={event._id} 
                  style={styles.ticketCard}
                  onPress={() => handleViewTicket(event)}
                >
                  {event.banner && (
                    <Image 
                      source={{ uri: event.banner }} 
                      style={styles.ticketBanner}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.ticketContent}>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketEventName}>{event.title}</Text>
                      <View style={styles.ticketBadge}>
                        <Text style={styles.ticketBadgeText}>
                          {event.isPaid ? 'Paid' : 'Free'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.ticketDetails}>
                      <View style={styles.ticketDetailItem}>
                        <Calendar size={16} color={Colors.dark.subtext} />
                        <Text style={styles.ticketDetailText}>
                          {formatDate(event.date)}
                        </Text>
                      </View>
                      
                      <View style={styles.ticketDetailItem}>
                        <Clock size={16} color={Colors.dark.subtext} />
                        <Text style={styles.ticketDetailText}>
                          {event.time}
                        </Text>
                      </View>
                      
                      <View style={styles.ticketDetailItem}>
                        <MapPin size={16} color={Colors.dark.subtext} />
                        <Text style={styles.ticketDetailText}>
                          {event.isOnline ? 'Online Event' : event.location}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.ticketFooter}>
                      <View style={styles.qrPreview}>
                        <QrCode size={32} color={Colors.dark.text} />
                      </View>
                      <View style={styles.viewTicketButton}>
                        <Text style={styles.viewTicketText}>View Ticket</Text>
                        <ChevronRight size={16} color={Colors.dark.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>You haven't booked any events yet</Text>
                <Button 
                  title="Explore Events" 
                  onPress={() => setActiveTab('events')}
                  style={styles.exploreButton}
                />
              </View>
            )}
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <AppHeader title="Events" />
      
      <TabBar
        tabs={[
          { id: 'events', label: 'Events' },
          { id: 'tickets', label: 'Tickets' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {renderTabContent()}
      
      {activeTab === 'events' && (
        <TouchableOpacity 
          style={[styles.fab, { bottom: 20 + insets.bottom }]}
          onPress={handleCreateEvent}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      {showScrollToTop && (
        <TouchableOpacity 
          style={[styles.scrollToTopButton, { bottom: 90 + insets.bottom }]}
          onPress={scrollToTop}
        >
          <ArrowUp size={20} color="#fff" />
        </TouchableOpacity>
      )}
      
      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Events</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFilterModal(false)}
              >
                <X size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
{/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.filterOptions}>
                  {['all', 'Workshop', 'Meetup', 'Pitch', 'Seminar', 'Hackathon', 'Webinar', 'Conference', 'Networking'].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterOption,
                        filters.category === category && styles.filterOptionSelected
                      ]}
                      onPress={() => handleCategorySelect(category)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.category === category && styles.filterOptionTextSelected
                      ]}>
                        {category === 'all' ? 'All Categories' : category}
                      </Text>
                      {filters.category === category && (
                        <Check size={16} color={Colors.dark.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Paid/Free Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price</Text>
                <View style={styles.filterOptions}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'free', label: 'Free' },
                    { id: 'paid', label: 'Paid' }
                  ].map((option) => (
                    <TouchableOpacity 
                      key={option.id}
                      style={[
                        styles.filterOption,
                        filters.isPaid === option.id && styles.filterOptionSelected
                      ]}
                      onPress={() => setFilters({...filters, isPaid: option.id})}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.isPaid === option.id && styles.filterOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                      {filters.isPaid === option.id && (
                        <Check size={16} color={Colors.dark.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Online/Offline Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <View style={styles.filterOptions}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'online', label: 'Online' },
                    { id: 'offline', label: 'In-Person' }
                  ].map((option) => (
                    <TouchableOpacity 
                      key={option.id}
                      style={[
                        styles.filterOption,
                        filters.isOnline === option.id && styles.filterOptionSelected
                      ]}
                      onPress={() => setFilters({...filters, isOnline: option.id})}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.isOnline === option.id && styles.filterOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                      {filters.isOnline === option.id && (
                        <Check size={16} color={Colors.dark.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Date</Text>
                <View style={styles.filterOptions}>
                  {[
                    { id: 'all', label: 'Any Time' },
                    { id: 'today', label: 'Today' },
                    { id: 'tomorrow', label: 'Tomorrow' },
                    { id: 'thisWeek', label: 'This Week' },
                    { id: 'thisMonth', label: 'This Month' }
                  ].map((option) => (
                    <TouchableOpacity 
                      key={option.id}
                      style={[
                        styles.filterOption,
                        filters.dateRange === option.id && styles.filterOptionSelected
                      ]}
                      onPress={() => setFilters({...filters, dateRange: option.id})}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.dateRange === option.id && styles.filterOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                      {filters.dateRange === option.id && (
                        <Check size={16} color={Colors.dark.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <Button
                title="Apply Filters"
                onPress={applyFilters}
                style={styles.applyButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  tabContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
  },
  searchPlaceholder: {
    color: Colors.dark.subtext,
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  seeAllText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  createEventButton: {
    marginLeft: 16,
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createEventText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalScroll: {
    marginBottom: 24,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  horizontalEventCard: {
    width: 280,
    marginRight: 12,
  },
  featuredEventCard: {
    width: width * 0.8,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  featuredEventImage: {
    width: '100%',
    height: '100%',
  },
  featuredEventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredEventContent: {
    
  },
  featuredEventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredEventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featuredEventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  featuredEventDetailText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginLeft: 4,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  priceBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  freeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.dark.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyStateContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 16,
  },
  exploreButton: {
    width: '80%',
  },
  // Date filter styles
  dateFilterContainer: {
    marginBottom: 20,
  },
  dateFilterContent: {
    paddingRight: 16,
  },
  dateFilterButton: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  dateFilterButtonSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  dateFilterText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  dateFilterTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  // Category filter styles
  categoryFilterContainer: {
    marginBottom: 20,
  },
  categoryFilterContent: {
    paddingRight: 16,
  },
  categoryFilterChip: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  categoryFilterChipSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  categoryFilterText: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryFilterTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  createEventContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  ticketCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  ticketBanner: {
    width: '100%',
    height: 120,
  },
  ticketContent: {
    padding: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketEventName: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  ticketBadge: {
    backgroundColor: `${Colors.dark.primary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ticketBadgeText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  ticketDetails: {
    marginBottom: 16,
  },
  ticketDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketDetailText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  qrPreview: {
    backgroundColor: Colors.dark.cardBackground,
    padding: 8,
    borderRadius: 8,
  },
  viewTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewTicketText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollToTopButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    maxHeight: height * 0.6,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'column',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.dark.card,
  },
  filterOptionSelected: {
    backgroundColor: `${Colors.dark.primary}20`,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  filterOptionText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resetButtonText: {
    color: Colors.dark.subtext,
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    marginLeft: 16,
  },
  // Category view styles
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
  },
  categoryTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '600',
  },
});
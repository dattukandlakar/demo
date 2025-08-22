import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Share,
  StatusBar,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  Bookmark,
  Share2,
  Tag,
  Heart,
  ArrowUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SuccessPopup from '@/components/ui/SuccessPopup';
import { useEventStore } from '@/store/event-store';
import { useAuthStore } from '@/store/auth-store';
import { Event, TicketType } from '@/types';
import Colors from '@/constants/colors';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import { fetchEventById } from '@/api/event';

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = 300;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 90 : 70;

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { bookTicket, likeEvent, bookmarkEvent } = useEventStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Booking form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT - HEADER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const bannerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });

  const bannerTranslateY = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT - HEADER_HEIGHT],
    outputRange: [0, BANNER_HEIGHT / 3],
    extrapolateRight: 'clamp',
  });

  useEffect(() => {
    loadEvent();
  }, [id]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const loadEvent = async () => {
    if (id) {
      setLoading(true);
      const eventData = await fetchEventById(token, id as string);
      setEvent(eventData);

      // Set default ticket type if available
      if (eventData && eventData.ticketTypes.length > 0) {
        setSelectedTicketType(eventData.ticketTypes[0]);
      }

      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (event) {
      try {
        await Share.share({
          message: `Check out this event: ${event.title} on ${formatDate(event.date)} at ${event.location}`,
        });
      } catch (error) {
        Alert.alert('Error', 'Could not share the event');
      }
    }
  };

  const handleLike = () => {
    if (event && user) {
      likeEvent(event.id, user.id);
      loadEvent(); // Reload event to update UI
    }
  };

  const handleBookmark = () => {
    if (event && user) {
      bookmarkEvent(event.id, user.id);
      loadEvent(); // Reload event to update UI
    }
  };

  const handleSelectTicket = (ticketType: TicketType) => {
    setSelectedTicketType(ticketType);
  };

  const handleBookTicket = () => {
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async () => {
    if (!name || !email) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (event && selectedTicketType) {
      setIsBookingLoading(true);
      const success = await bookTicket(event._id, selectedTicketType._id, name, email);
      

      if (success) {
        Alert.alert(
          'Booking Confirmed',
          'Your ticket has been booked successfully!',
          [
            {
              text: 'View Ticket',
              onPress: () => {
                router.push(`/event/ticket/${event._id}`);
              }
            },
            {
              text: 'OK',
              onPress: () => {
                setShowBookingForm(false);
                loadEvent(); // Reload event to update ticket availability
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to book ticket. Please try again.');
      }
      setIsBookingLoading(false);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollToTop(offsetY > height * 0.5);
      }
    }
  );

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const hasBooked = user && event.attendees.some(attendee => attendee.email === user.email);
  const isLiked = event.likes && user ? event.likes.includes(user.id) : false;
  const isBookmarked = event.bookmarks && user ? event.bookmarks.includes(user.id) : false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{event.title}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerAction}
                onPress={handleBookmark}
              >
                <Bookmark
                  size={24}
                  color="#fff"
                  fill={isBookmarked ? "#fff" : "transparent"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerAction}
                onPress={handleShare}
              >
                <Share2 size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Parallax Banner */}
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              transform: [
                { scale: bannerScale },
                { translateY: bannerTranslateY }
              ]
            }
          ]}
        >
          <Image source={{ uri: event.banner }} style={styles.banner} />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ChevronLeft size={24} color="#fff" />
              </TouchableOpacity>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerAction}
                  onPress={handleBookmark}
                >
                  <Bookmark
                    size={24}
                    color="#fff"
                    fill={isBookmarked ? "#fff" : "transparent"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.headerAction}
                  onPress={handleShare}
                >
                  <Share2 size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.organizerContainer}>
            <Avatar
              size={40}
              name={event.organizer}
              source={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
            />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizer}>Organized by {event.organizer}</Text>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={[styles.statItem, isLiked && styles.statItemActive]}
              onPress={handleLike}
            >
              <Heart
                size={20}
                color={isLiked ? Colors.dark.error : Colors.dark.text}
                fill={isLiked ? Colors.dark.error : "transparent"}
              />
              <Text style={styles.statText}>
                {event.likes ? event.likes.length : 0} Likes
              </Text>
            </TouchableOpacity>

            <View style={styles.statItem}>
              <Users size={20} color={Colors.dark.text} />
              <Text style={styles.statText}>
                {event.attendees.length} Going
              </Text>
            </View>
          </View>

          <Card style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Calendar size={18} color={Colors.dark.primary} />
              <Text style={styles.detailText}>
                {formatDate(event.date)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Clock size={18} color={Colors.dark.primary} />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>

            <View style={styles.detailItem}>
              <MapPin size={18} color={Colors.dark.primary} />
              <Text style={styles.detailText}>
                {event.isOnline ? 'Online Event' : event.location}
              </Text>
            </View>
          </Card>

          <View style={styles.tagsContainer}>
            {event.tags && event.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Tag size={14} color={Colors.dark.tint} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {event.speakers && event.speakers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Speakers</Text>
              {event.speakers.map((speaker, index) => (
                <View key={index} style={styles.speakerItem}>
                  <Avatar
                    size={40}
                    name={speaker.split('-')[0].trim()}
                  />
                  <View style={styles.speakerInfo}>
                    <Text style={styles.speakerName}>{speaker}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tickets</Text>
            {event.ticketTypes.map((ticket) => (
              <TouchableOpacity
                key={ticket._id}
                style={[
                  styles.ticketTypeCard,
                  selectedTicketType?.id === ticket.id && styles.selectedTicketTypeCard
                ]}
                onPress={() => handleSelectTicket(ticket)}
                disabled={ticket.available === 0}
              >
                <View style={styles.ticketTypeInfo}>
                  <Text style={styles.ticketTypeName}>{ticket.name}</Text>
                  <Text style={styles.ticketTypePrice}>
                    {ticket.price > 0 ? `₹${ticket.price}` : 'Free'}
                  </Text>
                </View>

                <View style={styles.ticketTypeAvailability}>
                  <Text style={styles.ticketTypeAvailabilityText}>
                    {ticket.available > 0
                      ? `${ticket.available} available`
                      : 'Sold Out'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {showBookingForm ? (
            <View style={styles.bookingForm}>
              <Text style={styles.formTitle}>Booking Information</Text>

              <Input
                label="Full Name *"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Email *"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.ticketSummary}>
                <Text style={styles.ticketSummaryTitle}>Ticket Summary</Text>
                <View style={styles.ticketSummaryRow}>
                  <Text style={styles.ticketSummaryLabel}>Ticket Type</Text>
                  <Text style={styles.ticketSummaryValue}>{selectedTicketType?.name}</Text>
                </View>
                <View style={styles.ticketSummaryRow}>
                  <Text style={styles.ticketSummaryLabel}>Price</Text>
                  <Text style={styles.ticketSummaryValue}>
                    {selectedTicketType?.price ? `₹${selectedTicketType.price}` : 'Free'}
                  </Text>
                </View>
              </View>

              <Button
                title="Confirm Booking"
                onPress={handleSubmitBooking}
                gradient
                isLoading={isBookingLoading}
                disabled={isBookingLoading}
                style={styles.confirmButton}
              />

              <Button
                title="Cancel"
                onPress={() => setShowBookingForm(false)}
                style={styles.cancelButton}
              />
            </View>
          ) : (
            <Button
              title={hasBooked ? "Already Booked" : "Book Ticket"}
              onPress={handleBookTicket}
              gradient={!hasBooked}
              disabled={hasBooked || (selectedTicketType?.available === 0)}
              style={styles.bookButton}
            />
          )}
        </View>
      </Animated.ScrollView>

      {showScrollToTop && (
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
        >
          <ArrowUp size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  bannerContainer: {
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 + 16 : 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  content: {
    padding: 16,
    marginTop: -20,
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  organizerInfo: {
    marginLeft: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizer: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  followButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  statItemActive: {
    backgroundColor: `${Colors.dark.error}20`,
  },
  statText: {
    color: Colors.dark.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.dark.tint}15`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.dark.tint,
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 22,
  },
  speakerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  speakerInfo: {
    marginLeft: 12,
  },
  speakerName: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  ticketTypeCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTicketTypeCard: {
    borderColor: Colors.dark.tint,
  },
  ticketTypeInfo: {
    flex: 1,
  },
  ticketTypeName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  ticketTypePrice: {
    color: Colors.dark.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  ticketTypeAvailability: {
    backgroundColor: Colors.dark.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  ticketTypeAvailabilityText: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  bookButton: {
    marginTop: 16,
    marginBottom: 40,
  },
  bookingForm: {
    marginTop: 24,
    marginBottom: 40,
  },
  formTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  ticketSummary: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  ticketSummaryTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ticketSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketSummaryLabel: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  ticketSummaryValue: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    marginTop: 16,
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 24,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 20,
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
});
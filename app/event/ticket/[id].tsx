import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Share,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  Alert,
  Animated,
  PermissionsAndroid
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  Download,
  ExternalLink,
  Check,
  Folder
} from 'lucide-react-native';
import { useEventStore } from '@/store/event-store';
import { useAuthStore } from '@/store/auth-store';
import { Event, Attendee } from '@/types';
import Colors from '@/constants/colors';
import { downloadTicket } from '@/api/event';
import { simpleDownloadPdf } from '@/utils/simpleDownloadUtils';

// Mock QR code component since we can't install react-native-qrcode-svg
const QRCodeMock = ({ value, size, color, backgroundColor }: { 
  value: string; 
  size: number; 
  color: string; 
  backgroundColor: string; 
}) => {
  return (
    <View 
      style={{
        width: size,
        height: size,
        backgroundColor: backgroundColor || '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: color || '#000',
      }}
    >
      <Text style={{ color: color || '#000', textAlign: 'center' }}>
        QR Code for: {value.substring(0, 20)}...
      </Text>
    </View>
  );
};

export default function TicketScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { fetchEventById } = useEventStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  
  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadEventAndTicket();
  }, [id]);
  
  const loadEventAndTicket = async () => {
    if (id && user) {
      setLoading(true);
      const eventData = await fetchEventById(id as string);
      
      if (eventData) {
        setEvent(eventData);
        
        // Find the user's ticket
        const userTicket = eventData.attendees.find(
          attendee => attendee.email === user.email
        );
        
        if (userTicket) {
          setTicket(userTicket);
        } else {
          // No ticket found, redirect back
          router.replace('/events');
        }
      } else {
        // Event not found, redirect back
        router.replace('/events');
      }
      
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (event) {
      try {
        await Share.share({
          message: `I'm attending ${event.title} on ${formatDate(event.date)}. Join me!`,
        });
      } catch (error) {
        console.error('Error sharing ticket:', error);
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
 

const handleJoinEvent = async () => {
  const rawLink = event?.isOnline ? event?.onlineEventLink : null;
  if (!rawLink) {
    Alert.alert('Error', 'Event link not available.');
    return;
  }

  // Trim and normalize
  let link = rawLink.trim();

  // If it's a web URL and missing scheme, add https://
  if (/^[^/:]+(\.[^/:]+)+/.test(link) && !/^https?:\/\//i.test(link)) {
    link = 'https://' + link;
  }

  // Encode spaces or unsafe characters
  try {
    link = encodeURI(link);
  } catch (e) {
  }


  try {
    const supported = await Linking.canOpenURL(link);
    if (!supported) {
     
      return;
    }
    await Linking.openURL(link);
  } catch (error) {
    
    Alert.alert('Error', 'Failed to open event link.');
  }
};






  const handleDownloadTicket = async () => {
    if (!event || !user || !ticket) {
      Alert.alert('Error', 'Unable to download ticket. Please try again.');
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);
    progressAnim.setValue(0);

    try {
      // Create filename
      const fileName = `ticket-${event.title.replace(/[^a-zA-Z0-9]/g, '-')}-${user.email.split('@')[0]}.pdf`;
      
      // Use Expo method since RNFetchBlob is not available
      const blob = await downloadTicket(
        token || '',
        event.id || '',
        user.email || '',
        (progress) => {
          setDownloadProgress(progress);
          Animated.timing(progressAnim, {
            toValue: progress / 100,
            duration: 100,
            useNativeDriver: false,
          }).start();
        }
      );

      if (!blob || blob.size === 0) {
        throw new Error('Downloaded ticket data is empty.');
      }

      await simpleDownloadPdf(blob, fileName, event.title);

      setDownloadComplete(true);
      
    } catch (error: any) {
      console.error('Download error:', error);
      
      let errorMessage = 'Failed to download ticket.';
      if (error.message?.includes('0 bytes')) {
        errorMessage = 'The ticket file is empty. Please try again.';
      } else if (error.message?.includes('HTTP error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      Alert.alert('Download Failed', errorMessage);
    } finally {
      setTimeout(() => {
        setDownloading(false);
        setDownloadProgress(0);
        setDownloadComplete(false);
        progressAnim.setValue(0);
      }, 2000);
    }
  };

  


  
  if (loading || !event || !ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading ticket...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Generate a unique ticket ID based on event ID and user email
  const ticketId = `${event.id}-${user?.email.split('@')[0]}`;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
                     <View style={styles.ticketContainer}>
            <View style={styles.ticketHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.ticketTypeBadge}>
                <Text style={styles.ticketTypeText}>{ticket.ticketType}</Text>
              </View>
            </View>
            
            <View style={styles.qrContainer}>
              <QRCodeMock
                value={ticketId}
                size={200}
                color={Colors.dark.text}
                backgroundColor={Colors.dark.cardBackground}
              />
            </View>
            
            <Text style={styles.ticketId}>Ticket ID: {ticketId}</Text>
            
            <View style={styles.ticketDetails}>
              <View style={styles.ticketDetailItem}>
                <Calendar size={20} color={Colors.dark.primary} />
                <Text style={styles.ticketDetailText}>
                  {formatDate(event.date)}
                </Text>
              </View>
              
              <View style={styles.ticketDetailItem}>
                <Clock size={20} color={Colors.dark.primary} />
                <Text style={styles.ticketDetailText}>{event.time}</Text>
              </View>
              
              <View style={styles.ticketDetailItem}>
                <MapPin size={20} color={Colors.dark.primary} />
                <Text style={styles.ticketDetailText}>
                  {event.isOnline ? 'Online Event' : event.location}
                </Text>
              </View>
            </View>
            
            <View style={styles.attendeeInfo}>
              <Text style={styles.attendeeInfoTitle}>Attendee Information</Text>
              <View style={styles.attendeeInfoItem}>
                <Text style={styles.attendeeInfoLabel}>Name</Text>
                <Text style={styles.attendeeInfoValue}>{ticket.name}</Text>
              </View>
              <View style={styles.attendeeInfoItem}>
                <Text style={styles.attendeeInfoLabel}>Email</Text>
                <Text style={styles.attendeeInfoValue}>{ticket.email}</Text>
              </View>
                         </View>
           </View>
          
                     <TouchableOpacity 
             style={[
               styles.downloadButton,
               downloading && styles.downloadButtonDisabled
             ]}
             onPress={handleDownloadTicket}
             disabled={downloading}
           >
             {downloading ? (
               <View style={styles.downloadProgressContainer}>
                 <View style={styles.progressBarContainer}>
                   <Animated.View 
                     style={[
                       styles.progressBar,
                       {
                         width: progressAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: ['0%', '100%'],
                         }),
                       },
                     ]}
                   />
                 </View>
                 <Text style={styles.downloadProgressText}>
                   {Math.round(downloadProgress)}%
                 </Text>
               </View>
             ) : downloadComplete ? (
               <View style={styles.downloadCompleteContainer}>
                 <Check size={20} color="#fff" />
                 <Text style={styles.downloadButtonText}>Downloaded!</Text>
               </View>
             ) : (
               <>
                 <Folder size={20} color="#fff" />
                 <Text style={styles.downloadButtonText}>Download Ticket</Text>
               </>
             )}
           </TouchableOpacity>
          
          {event.isOnline && event.onlineEventLink && (
            <TouchableOpacity style={styles.joinEventButton} onPress={handleJoinEvent}>
              <ExternalLink size={20} color={Colors.dark.primary} />
              <Text style={styles.joinEventButtonText}>Join Event</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.eventInfoContainer}>
            <Text style={styles.eventInfoTitle}>Event Information</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
            
            {event.speakers && event.speakers.length > 0 && (
              <View style={styles.speakersSection}>
                <Text style={styles.sectionTitle}>Speakers</Text>
                {event.speakers.map((speaker, index) => (
                  <Text key={index} style={styles.speakerItem}>• {speaker}</Text>
                ))}
              </View>
            )}
            
            <View style={styles.organizerSection}>
              <Text style={styles.sectionTitle}>Organizer</Text>
              <Text style={styles.organizerName}>{event.organizer}</Text>
            </View>
          </View>
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
  shareButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  ticketContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eventTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  ticketTypeBadge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  ticketTypeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
  },
  ticketId: {
    color: Colors.dark.subtext,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  ticketDetails: {
    marginBottom: 20,
  },
  ticketDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketDetailText: {
    color: Colors.dark.text,
    fontSize: 16,
    marginLeft: 12,
  },
  attendeeInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
  },
  attendeeInfoTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  attendeeInfoItem: {
    marginBottom: 8,
  },
  attendeeInfoLabel: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginBottom: 4,
  },
  attendeeInfoValue: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadProgressContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.dark.text,
    borderRadius: 4,
  },
  downloadProgressText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginTop: 8,
  },
  downloadCompleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  joinEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  joinEventButtonText: {
    color: Colors.dark.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  eventInfoContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  eventInfoTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventDescription: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  speakersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  speakerItem: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8,
  },
  organizerSection: {
    marginBottom: 8,
  },
  organizerName: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  
});
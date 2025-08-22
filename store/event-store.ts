import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '@/types';
import { fetchEvents as fetchEventsAPI, fetchEventById as fetchEventByIdAPI, bookTicket as bookTicketAPI ,fetchUserBookedEvents } from '@/api/event';
import { useAuthStore } from './auth-store';
export interface EventState {
  events: Event[];
  userBookedEvents: Event[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: (filters?: any) => Promise<void>;
  fetchUserBookedEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<Event | null>;
  bookTicket: (eventId: string, ticketTypeId: string, name: string, email: string) => Promise<boolean>;
  createEvent: (event: Event) => Promise<void>;
  likeEvent: (eventId: string, userId: string) => Promise<void>;
  bookmarkEvent: (eventId: string, userId: string) => Promise<void>;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      userBookedEvents: [],
      isLoading: false,
      error: null,
      
      fetchEvents: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          // Build query string from filters
          const params = new URLSearchParams();
          if (filters.category && filters.category !== 'all') params.append('category', filters.category);
          if (filters.isPaid && filters.isPaid !== 'all') params.append('isPaid', filters.isPaid);
          if (filters.isOnline && filters.isOnline !== 'all') params.append('isOnline', filters.isOnline);
          
          // Handle date range filtering
          if (filters.dateRange && filters.dateRange !== 'all') {
            // Backend expects a single 'date' parameter with specific string values
            // or specific date format (YYYY-MM-DD)
            if (filters.dateRange === 'today' || 
                filters.dateRange === 'tomorrow' ||
                filters.dateRange === 'thisWeek' || 
                filters.dateRange === 'thisMonth' ||
                filters.dateRange.match(/^\d{4}-\d{2}-\d{2}$/)) {
              params.append('date', filters.dateRange);
            }
          }

          const queryString = params.toString();
          
          const eventsData = await fetchEventsAPI( queryString);
          // Transform API data to match our Event interface
          const transformedEvents: Event[] = eventsData.map((event: any) => ({
            _id: event._id || event.id,
            id: event._id || event.id,
            title: event.title,
            description: event.description,
            shortDescription: event.shortDescription,
            date: event.date,
            time: event.time,
            location: event.location,
            isOnline: event.isOnline,
            isPaid: event.isPaid,
            organizer: event.organizer,
            organizerId: event.organizerId,
            banner: event.banner,
            tags: event.tags || [],
            ticketTypes: event.ticketTypes ? event.ticketTypes.map((ticket: any) => ({
              _id: ticket._id,
              id: ticket._id,
              name: ticket.name,
              price: parseFloat(ticket.price),
              description: ticket.description || '',
              available: ticket.remTicket,
              total: ticket.remTicket
            })) : [],
            attendees: event.attendees ? event.attendees.map((attendee: any) => ({
              name: attendee.name,
              email: attendee.email,
              phone: attendee.phone || '',
              ticketType: attendee.ticketType || ''
            })) : [],
            speakers: event.speakers || [],
            createdBy: event.createdBy,
            createdAt: event.createdAt,
            likes: event.likes || [],
            bookmarks: event.bookmarks || [],
            category: event.category || 'Workshop',
            onlineEventLink: event.onlineEventLink,
            maxAttendees: event.maxAttendees
          }));
          set({ events: transformedEvents, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch events', isLoading: false });
        }
      },
      
      fetchUserBookedEvents: async () => {
        set({ isLoading: true, error: null });
        try {
          // Get token from auth store properly
          const { token } = useAuthStore.getState();
          
          if (!token) {
            set({ error: 'No authentication token found', isLoading: false });
            return;
          }
          
          const response = await fetchUserBookedEvents(token);
          
          // Handle the API response structure
          const bookedEventsData = response.body || response;
          
          // Transform API data to match our Event interface
          const transformedBookedEvents: Event[] = Array.isArray(bookedEventsData) 
            ? bookedEventsData.map((event: any) => ({
                _id: event._id,
                id: event._id,
                title: event.title,
                description: event.description,
                shortDescription: event.shortDescription,
                date: event.date,
                time: event.time,
                location: event.location,
                isOnline: event.isOnline,
                isPaid: event.isPaid,
                organizer: event.organizer,
                organizerId: event.organizerId,
                banner: event.banner,
                tags: event.tags || [],
                ticketTypes: event.ticketTypes ? event.ticketTypes.map((ticket: any) => ({
                  _id: ticket._id,
                  id: ticket._id,
                  name: ticket.name,
                  price: parseFloat(ticket.price),
                  description: ticket.description || '',
                  available: ticket.remTicket,
                  total: ticket.remTicket
                })) : [],
                attendees: event.attendees ? event.attendees.map((attendee: any) => ({
                  name: attendee.name,
                  email: attendee.email,
                  phone: attendee.phone || '',
                  ticketType: attendee.ticketType || ''
                })) : [],
                speakers: event.speakers || [],
                createdBy: event.createdBy,
                createdAt: event.createdAt,
                likes: event.likes || [],
                bookmarks: event.bookmarks || [],
                category: event.category || 'Workshop',
                onlineEventLink: event.onlineEventLink,
                maxAttendees: event.maxAttendees
              }))
            : [];
          
          set({ userBookedEvents: transformedBookedEvents, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch user booked events', isLoading: false });
        }
      },
      
      fetchEventById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = useAuthStore.getState();
          
          if (!token) {
            set({ error: 'No authentication token found', isLoading: false });
            return null;
          }
          
          const eventData = await fetchEventByIdAPI(token, id);
          
          // Transform API data to match our Event interface
          const transformedEvent: Event = {
            _id: eventData._id || eventData.id,
            id: eventData._id || eventData.id,
            title: eventData.title,
            description: eventData.description,
            shortDescription: eventData.shortDescription,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            isOnline: eventData.isOnline,
            isPaid: eventData.isPaid,
            organizer: eventData.organizer,
            organizerId: eventData.organizerId,
            banner: eventData.banner,
            tags: eventData.tags || [],
            ticketTypes: eventData.ticketTypes ? eventData.ticketTypes.map((ticket: any) => ({
              _id: ticket._id,
              id: ticket._id,
              name: ticket.name,
              price: parseFloat(ticket.price),
              description: ticket.description || '',
              available: ticket.remTicket,
              total: ticket.remTicket
            })) : [],
            attendees: eventData.attendees ? eventData.attendees.map((attendee: any) => ({
              name: attendee.name,
              email: attendee.email,
              phone: attendee.phone || '',
              ticketType: attendee.ticketType || ''
            })) : [],
            speakers: eventData.speakers || [],
            createdBy: eventData.createdBy,
            createdAt: eventData.createdAt,
            likes: eventData.likes || [],
            bookmarks: eventData.bookmarks || [],
            category: eventData.category || 'Workshop',
            onlineEventLink: eventData.onlineEventLink,
            maxAttendees: eventData.maxAttendees
          };
          
          set({ isLoading: false });
          return transformedEvent;
        } catch (error) {
          set({ error: 'Failed to fetch event', isLoading: false });
          return null;
        }
      },
      
      bookTicket: async (eventId: string, ticketTypeId: string, name: string, email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = useAuthStore.getState();
          
          if (!token) {
            set({ error: 'No authentication token found', isLoading: false });
            return false;
          }
          
          // Call the API to book the ticket
          const result = await bookTicketAPI(token, eventId, {
            ticketTypeId,
            name,
            email
          });

          
          if (result) {
            // Refresh events to get updated data
            await get().fetchEvents();
            set({ isLoading: false });
            return true;
          } else {
            set({ error: 'Failed to book ticket', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to book ticket', isLoading: false });
          return false;
        }
      },
      
      createEvent: async (event: Event) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, you would make an API call
          // For now, we'll just update the local state
          const events = [...get().events, event];
          set({ events, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to create event', isLoading: false });
        }
      },
      
      likeEvent: async (eventId: string, userId: string) => {
        try {
          const events = [...get().events];
          const eventIndex = events.findIndex(e => e.id === eventId);
          
          if (eventIndex === -1) return;
          
          const event = { ...events[eventIndex] };
          
          // Initialize likes array if it doesn't exist
          if (!event.likes) {
            event.likes = [];
          }
          
          // Toggle like
          if (event.likes.includes(userId)) {
            event.likes = event.likes.filter(id => id !== userId);
          } else {
            event.likes.push(userId);
          }
          
          events[eventIndex] = event;
          set({ events });
        } catch (error) {
        }
      },
      
      bookmarkEvent: async (eventId: string, userId: string) => {
        try {
          const events = [...get().events];
          const eventIndex = events.findIndex(e => e.id === eventId);
          
          if (eventIndex === -1) return;
          
          const event = { ...events[eventIndex] };
          
          // Initialize bookmarks array if it doesn't exist
          if (!event.bookmarks) {
            event.bookmarks = [];
          }
          
          // Toggle bookmark
          if (event.bookmarks.includes(userId)) {
            event.bookmarks = event.bookmarks.filter(id => id !== userId);
          } else {
            event.bookmarks.push(userId);
          }
          
          events[eventIndex] = event;
          set({ events });
        } catch (error) {
        }
      }
    }),
    {
      name: 'event-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Community {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  icon?: string;
  tags: string[];
  location?: string;
  memberCount: number;
  members: string[];
  admins: string[];
  moderators: string[];
  isPrivate: boolean;
  lastActivity: string;
  createdAt: string;
  createdBy: string;
  posts: CommunityPost[];
  events: CommunityEvent[];
  resources: CommunityResource[];
  announcements: CommunityAnnouncement[];
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  type: 'text' | 'question' | 'poll' | 'resource';
  likes: string[];
  comments: CommunityComment[];
  isPinned: boolean;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: string[];
  createdAt: string;
}

export interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  isOnline: boolean;
  link?: string;
  tags: string[];
  attendees: string[];
  maxAttendees?: number;
  visibility: 'public' | 'private';
  createdBy: string;
  createdAt: string;
}

export interface CommunityResource {
  id: string;
  communityId: string;
  title: string;
  description: string;
  url: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  uploadedBy: string;
  uploadedAt: string;
}

export interface CommunityAnnouncement {
  id: string;
  communityId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface JoinedCommunity {
  communityId: string;
  joinedAt: string;
  role: 'member' | 'moderator' | 'admin';
}

interface CommunityState {
  communities: Community[];
  joinedCommunities: JoinedCommunity[];
  activeCommunity: Community | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterType: 'all' | 'trending' | 'nearby' | 'joined';
  
  // Community actions
  createCommunity: (communityData: Omit<Community, 'id' | 'createdAt' | 'memberCount' | 'members' | 'admins' | 'moderators' | 'posts' | 'events' | 'resources' | 'announcements' | 'lastActivity'>) => void;
  updateCommunity: (id: string, communityData: Partial<Community>) => void;
  deleteCommunity: (id: string) => void;
  joinCommunity: (communityId: string, userId: string) => void;
  leaveCommunity: (communityId: string, userId: string) => void;
  setActiveCommunity: (id: string) => void;
  
  // Post actions
  createPost: (communityId: string, postData: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'isPinned'>) => void;
  likePost: (postId: string, userId: string) => void;
  addComment: (postId: string, commentData: Omit<CommunityComment, 'id' | 'createdAt' | 'likes'>) => void;
  
  // Event actions
  createEvent: (communityId: string, eventData: Omit<CommunityEvent, 'id' | 'createdAt' | 'attendees'>) => void;
  joinEvent: (eventId: string, userId: string) => void;
  leaveEvent: (eventId: string, userId: string) => void;
  
  // Resource actions
  addResource: (communityId: string, resourceData: Omit<CommunityResource, 'id' | 'uploadedAt'>) => void;
  
  // Announcement actions
  createAnnouncement: (communityId: string, announcementData: Omit<CommunityAnnouncement, 'id' | 'createdAt'>) => void;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setFilterType: (filter: 'all' | 'trending' | 'nearby' | 'joined') => void;
  getFilteredCommunities: () => Community[];
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      communities: [
        {
          id: 'community_1',
          name: 'AI Builders India',
          description: 'A community for AI enthusiasts, developers, and researchers in India. Share projects, discuss latest trends, and collaborate on AI innovations.',
          coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
          icon: '🤖',
          tags: ['AI', 'Machine Learning', 'Tech', 'India'],
          location: 'India',
          memberCount: 742,
          members: ['user_1', 'user_2'],
          admins: ['user_1'],
          moderators: ['user_2'],
          isPrivate: false,
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          createdBy: 'user_1',
          posts: [],
          events: [],
          resources: [],
          announcements: []
        },
        {
          id: 'community_2',
          name: 'Startup Founders Delhi',
          description: 'Connect with fellow entrepreneurs and startup founders in Delhi. Share experiences, find co-founders, and grow your network.',
          coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop',
          icon: '🚀',
          tags: ['Startup', 'Entrepreneurship', 'Delhi', 'Networking'],
          location: 'Delhi, India',
          memberCount: 1205,
          members: ['user_1'],
          admins: ['user_3'],
          moderators: [],
          isPrivate: false,
          lastActivity: new Date(Date.now() - 1800000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          createdBy: 'user_3',
          posts: [],
          events: [],
          resources: [],
          announcements: []
        },
        {
          id: 'community_3',
          name: 'BTech 2025 Placement Prep',
          description: 'Final year BTech students preparing for placements. Share resources, practice problems, and support each other.',
          coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop',
          icon: '🎓',
          tags: ['Placement', 'BTech', 'Students', 'Career'],
          memberCount: 3420,
          members: [],
          admins: ['user_4'],
          moderators: ['user_5'],
          isPrivate: false,
          lastActivity: new Date(Date.now() - 900000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
          createdBy: 'user_4',
          posts: [],
          events: [],
          resources: [],
          announcements: []
        }
      ],
      joinedCommunities: [
        { communityId: 'community_1', joinedAt: new Date().toISOString(), role: 'admin' },
        { communityId: 'community_2', joinedAt: new Date().toISOString(), role: 'member' }
      ],
      activeCommunity: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      filterType: 'all',

      // Community actions
      createCommunity: (communityData) => {
        const newCommunity: Community = {
          id: `community_${Date.now()}`,
          ...communityData,
          memberCount: 1,
          members: [communityData.createdBy],
          admins: [communityData.createdBy],
          moderators: [],
          posts: [],
          events: [],
          resources: [],
          announcements: [],
          lastActivity: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          communities: [...state.communities, newCommunity],
          joinedCommunities: [...state.joinedCommunities, {
            communityId: newCommunity.id,
            joinedAt: new Date().toISOString(),
            role: 'admin'
          }],
          activeCommunity: newCommunity,
        }));
      },

      updateCommunity: (id, communityData) => {
        set(state => ({
          communities: state.communities.map(community => 
            community.id === id ? { ...community, ...communityData } : community
          ),
          activeCommunity: state.activeCommunity?.id === id 
            ? { ...state.activeCommunity, ...communityData } 
            : state.activeCommunity,
        }));
      },

      deleteCommunity: (id) => {
        set(state => {
          const newCommunities = state.communities.filter(community => community.id !== id);
          return {
            communities: newCommunities,
            joinedCommunities: state.joinedCommunities.filter(jc => jc.communityId !== id),
            activeCommunity: state.activeCommunity?.id === id 
              ? newCommunities.length > 0 ? newCommunities[0] : null 
              : state.activeCommunity,
          };
        });
      },

      joinCommunity: (communityId, userId) => {
        set(state => ({
          communities: state.communities.map(community => 
            community.id === communityId 
              ? { 
                  ...community, 
                  members: [...community.members, userId],
                  memberCount: community.memberCount + 1,
                  lastActivity: new Date().toISOString()
                }
              : community
          ),
          joinedCommunities: [...state.joinedCommunities, {
            communityId,
            joinedAt: new Date().toISOString(),
            role: 'member'
          }]
        }));
      },

      leaveCommunity: (communityId, userId) => {
        set(state => ({
          communities: state.communities.map(community => 
            community.id === communityId 
              ? { 
                  ...community, 
                  members: community.members.filter(id => id !== userId),
                  memberCount: Math.max(0, community.memberCount - 1)
                }
              : community
          ),
          joinedCommunities: state.joinedCommunities.filter(jc => jc.communityId !== communityId)
        }));
      },

      setActiveCommunity: (id) => {
        const community = get().communities.find(c => c.id === id);
        if (community) {
          set({ activeCommunity: community });
        }
      },

      // Post actions
      createPost: (communityId, postData) => {
        const newPost: CommunityPost = {
          id: `post_${Date.now()}`,
          ...postData,
          communityId,
          likes: [],
          comments: [],
          isPinned: false,
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          communities: state.communities.map(community => 
            community.id === communityId 
              ? { 
                  ...community, 
                  posts: [...community.posts, newPost],
                  lastActivity: new Date().toISOString()
                }
              : community
          )
        }));
      },

      likePost: (postId, userId) => {
        set(state => ({
          communities: state.communities.map(community => ({
            ...community,
            posts: community.posts.map(post => 
              post.id === postId 
                ? {
                    ...post,
                    likes: post.likes.includes(userId)
                      ? post.likes.filter(id => id !== userId)
                      : [...post.likes, userId]
                  }
                : post
            )
          }))
        }));
      },

      addComment: (postId, commentData) => {
        const newComment: CommunityComment = {
          id: `comment_${Date.now()}`,
          ...commentData,
          postId,
          likes: [],
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          communities: state.communities.map(community => ({
            ...community,
            posts: community.posts.map(post => 
              post.id === postId 
                ? { ...post, comments: [...post.comments, newComment] }
                : post
            )
          }))
        }));
      },

      // Event actions
      createEvent: (communityId, eventData) => {
        const newEvent: CommunityEvent = {
          id: `event_${Date.now()}`,
          ...eventData,
          communityId,
          attendees: [],
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          communities: state.communities.map(community => 
            community.id === communityId 
              ? { 
                  ...community, 
                  events: [...community.events, newEvent],
                  lastActivity: new Date().toISOString()
                }
              : community
          )
        }));
      },

      joinEvent: (eventId, userId) => {
        set(state => ({
          communities: state.communities.map(community => ({
            ...community,
            events: community.events.map(event => 
              event.id === eventId 
                ? { ...event, attendees: [...event.attendees, userId] }
                : event
            )
          }))
        }));
      },

      leaveEvent: (eventId, userId) => {
        set(state => ({
          communities: state.communities.map(community => ({
            ...community,
            events: community.events.map(event => 
              event.id === eventId 
                ? { ...event, attendees: event.attendees.filter(id => id !== userId) }
                : event
            )
          }))
        }));
      },

      // Resource actions
      addResource: (communityId, resourceData) => {
        const newResource: CommunityResource = {
          id: `resource_${Date.now()}`,
          ...resourceData,
          communityId,
          uploadedAt: new Date().toISOString(),
        };

        set(state => ({
          communities: state.communities.map(community => 
            community.id === communityId 
              ? { 
                  ...community, 
                  resources: [...community.resources, newResource],
                  lastActivity: new Date().toISOString()
                }
              : community
          )
        }));
      },

      // Announcement actions
      createAnnouncement: (communityId, announcementData) => {
        const newAnnouncement: CommunityAnnouncement = {
          id: `announcement_${Date.now()}`,
          ...announcementData,
          communityId,
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          communities: state.communities.map(community => 
            community.id === communityId 
              ? { 
                  ...community, 
                  announcements: [...community.announcements, newAnnouncement],
                  lastActivity: new Date().toISOString()
                }
              : community
          )
        }));
      },

      // Search and filter
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setFilterType: (filter) => {
        set({ filterType: filter });
      },

      getFilteredCommunities: () => {
        const { communities, joinedCommunities, searchQuery, filterType } = get();
        let filtered = communities;

        // Apply search filter
        if (searchQuery) {
          filtered = filtered.filter(community => 
            community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        // Apply type filter
        switch (filterType) {
          case 'joined':
            const joinedIds = joinedCommunities.map(jc => jc.communityId);
            filtered = filtered.filter(community => joinedIds.includes(community.id));
            break;
          case 'trending':
            filtered = filtered.sort((a, b) => {
              const aActivity = new Date(a.lastActivity).getTime();
              const bActivity = new Date(b.lastActivity).getTime();
              return bActivity - aActivity;
            });
            break;
          case 'nearby':
            // For demo, just sort by location presence
            filtered = filtered.filter(community => community.location);
            break;
          default:
            // 'all' - no additional filtering
            break;
        }

        return filtered;
      },
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
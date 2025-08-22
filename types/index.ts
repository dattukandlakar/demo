export interface User {
    id: string;
    _id: string;
    name: string;
    username?: string;
    email: string;
    profileImage: string;
    avatar: string,
    coverImage?: string;
    headline?: string;
    bio?: string;
    location?: string;
    website?: string;
    joinedDate?: string;
    followers?: number;
    following?: number;
    streak?: number;
    lastStoryDate?: string;
    isFollowing?: boolean;
    profileViews?: number;
    education?: Education[];
    experience?: Experience[];
    skills?: string[];
    phone?: string;
    socialLinks?: {
      platform: string;
      url: string;
    }[];
    isCounselor?: boolean;
    counselorInfo?: {
      availableTime: string;
      daysAvailable: string;
      ratePerFiveMinutes: number;
      bio: string;
    };
  }
  
  export interface Post {
    id: string;
    author: User;
    content: string;
    images?: string[];
    createdAt: string;
    likes: number;
    comments: number;
    reposts: number;
    isLiked: boolean;
    isBookmarked: boolean;
    isReposted: boolean;
    commentsList?: Comment[];
    // Repost-specific fields
    originalPost?: Post;
    repostComment?: string;
    repostedBy?: User;
    repostedAt?: string;
  }
  
  export interface Comment {
    id: string;
    author: User;
    content: string;
    createdAt: string;
    likes: number;
    isLiked: boolean;
    replies?: Comment[];
  }
  
  export interface Story {
    id: string;
    user: User;
    image: string;
    createdAt: string;
    viewed: boolean;
    url?: string;
    type?: 'image' | 'video';
    source?: 'Camera' | 'Gallery';
  }
  
  export interface NewsArticle {
    _id: string;
    headline: string;
    summary: string;
    article: string;
    bannerImage: string;
    source: string;
    author: string;
    timestamp: string;
    ref: string;
    category: string [];
    isSaved: boolean;
    isLiked: boolean;
    likes: number;
  }
  
  export interface ShowcaseEntry {
    id: string;
    title: string;
    subtitle?: string;
    tagline?: string;
    description: string;
    problem?: string;
    solution?: string;
    revenueModel?: string;
    images: string[];
    bannerImages?: string[];
    logo?: string;
    category?: string;
    tags: string[];
    upvotes: number;
    comments: number;
    isLiked: boolean;
    isBookmarked: boolean;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
    links?: {
      website?: string;
      github?: string;
      playstore?: string;
      appstore?: string;
      demoVideo?: string;
    };
    upvoters?: string[];
  }
  
  export interface Job {
    id: string;
    title: string;
    company: string;
    companyLogo: string;
    location: string;
    salary?: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
    description: string;
    requirements: string[];
    responsibilities: string[];
    skills: string[];
    postedAt: string;
    deadline?: string;
    isRemote: boolean;
    isBookmarked: boolean;
    applications?: JobApplication[];
    companyId: string;
  }
  
  export interface JobApplication {
    id: string;
    jobId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    resume: string;
    coverLetter?: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
    appliedAt: string;
  }
  
  export interface Company {
    id: string;
    name: string;
    logo: string;
    banner?: string;
    description?: string;
    industry?: string;
    location?: string;
    website?: string;
    email: string;
    mobileNumber: string;
    ownerName: string;
    address?: string;
    followers?: number;
    isFollowing?: boolean;
    jobs?: Job[];
    events?: Event[];
    posts?: Post[];
  }
  
  export interface Event {
    _id: string;
    id: string;
    title: string;
    description: string;
    shortDescription?: string;
    date: string;
    time: string;
    location: string;
    banner: string;
    organizer: string;
    organizerId: string;
    isPaid: boolean;
    isOnline: boolean;
    onlineEventLink?: string;
    category: 'Workshop' | 'Meetup' | 'Pitch' | 'Seminar' | 'Hackathon' | 'Webinar' | 'Conference' | 'Networking';
    ticketTypes: TicketType[];
    maxAttendees?: number;
    attendees: Attendee[];
    tags?: string[];
    speakers?: string[];
    createdBy: string;
    createdAt: string;
    likes?: string[];
    bookmarks?: string[];
  }
  
  export interface TicketType {
    _id: string;
    id: string;
    name: string;
    price: number;
    description?: string;
    available: number;
    total: number;
  }
  
  export interface Attendee {
    name: string;
    email: string;
    phone?: string;
    ticketType: string;
  }
  
  export interface Community {
    id: string;
    name: string;
    icon: string;
    logo: string;
    banner?: string;
    coverImage: string;
    description: string;
    location?: string;
    contactEmail: string;
    contactPhone: string;
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      ifscCode: string;
    };
    members: string[];
    memberCount: number;
    admins: string[];
    isJoined: boolean;
    isPrivate: boolean;
    tags: string[];
    posts: CommunityPost[];
    events: CommunityEvent[];
    resources: CommunityResource[];
    announcements: CommunityAnnouncement[];
    createdAt: string;
    ownerId: string;
    ownerName: string;
  }
  
  export interface CommunityPost {
    id: string;
    communityId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
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
    authorAvatar: string;
    content: string;
    likes: string[];
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
    createdAt: string;
  }
  
  export interface CommunityAnnouncement {
    id: string;
    communityId: string;
    title: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }
  
  export interface CommunityEvent {
    id: string;
    communityId: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    image?: string;
    isOnline: boolean;
    link: string;
    tags: string[];
    visibility: 'public' | 'private';
    attendees: string[];
    createdBy: string;
    createdAt: string;
  }
  
  export interface EventBooking {
    id: string;
    eventId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    ticketCount: number;
    totalAmount: number;
    paymentStatus: 'paid' | 'unpaid' | 'refunded';
    bookingDate: string;
  }
  
  export interface Education {
    id?: string;
    institution: string;
    name: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate: string;
    current?: boolean;
  }
  
  export interface Experience {
    id?: string;
    company: string;
    position: string;
    role: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }
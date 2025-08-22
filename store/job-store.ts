import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job } from '@/types';

// Mock data
const mockJobs: Job[] = [
  {
    id: 'j1',
    role: 'Senior React Native Developer',
    company: 'TechCorp',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea',
    location: 'Bangalore',
    type: 'Full-time',
    salary: '₹25L - ₹35L',
    experience: '3-5 years',
    skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux'],
    description: 'We are looking for a Senior React Native Developer to join our mobile team. You will be responsible for building and maintaining our mobile applications.',
    postedAt: '2023-11-01T10:00:00Z',
    deadline: '2023-12-01T10:00:00Z',
    isBookmarked: false,
    postedBy: 'user1',
    applications: [
      {
        id: 'a1',
        applicantId: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91 9876543210',
        experience: '4 years',
        coverLetter: 'I am excited to apply for the Senior React Native Developer position at TechCorp. With 4 years of experience in mobile app development, I believe I would be a great fit for your team.',
        resume: 'https://example.com/resume.pdf',
        appliedAt: '2023-11-05T14:30:00Z',
        status: 'reviewing'
      },
      {
        id: 'a2',
        applicantId: 'user3',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 9876543211',
        experience: '5 years',
        coverLetter: 'I have been working with React Native for 5 years and have built several production apps. I am looking for a new challenge and TechCorp seems like a great place to grow.',
        resume: 'https://example.com/resume.pdf',
        appliedAt: '2023-11-06T09:15:00Z',
        status: 'pending'
      }
    ],
    companyDetails: {
      name: 'TechCorp',
      size: '100-500',
      address: 'Koramangala, Bangalore',
      contactPerson: {
        name: 'HR Manager',
        email: 'hr@techcorp.com',
        phone: '+91 9876543212'
      }
    }
  },
  {
    id: 'j2',
    role: 'UI/UX Designer',
    company: 'DesignStudio',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea',
    location: 'Remote',
    type: 'Contract',
    salary: '₹15L - ₹20L',
    experience: '2-4 years',
    skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
    description: 'We are looking for a UI/UX Designer to join our design team. You will be responsible for creating beautiful and intuitive user interfaces for our products.',
    postedAt: '2023-11-02T11:00:00Z',
    deadline: '2023-12-02T11:00:00Z',
    isBookmarked: true,
    postedBy: 'user2',
    applications: [],
    companyDetails: {
      name: 'DesignStudio',
      size: '10-50',
      address: 'HSR Layout, Bangalore',
      contactPerson: {
        name: 'Design Lead',
        email: 'design@designstudio.com',
        phone: '+91 9876543213'
      }
    }
  },
  {
    id: 'j3',
    role: 'Frontend Developer',
    company: 'WebTech',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea',
    location: 'Mumbai',
    type: 'Full-time',
    salary: '₹10L - ₹15L',
    experience: '1-3 years',
    skills: ['React', 'JavaScript', 'HTML', 'CSS'],
    description: 'We are looking for a Frontend Developer to join our web team. You will be responsible for building and maintaining our web applications.',
    postedAt: '2023-11-03T12:00:00Z',
    deadline: '2023-12-03T12:00:00Z',
    isBookmarked: false,
    postedBy: 'user3',
    applications: [
      {
        id: 'a3',
        applicantId: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543214',
        experience: '2 years',
        coverLetter: 'I am a frontend developer with 2 years of experience in React. I am looking for a new opportunity to grow my skills and contribute to a great team.',
        resume: 'https://example.com/resume.pdf',
        appliedAt: '2023-11-07T10:30:00Z',
        status: 'accepted'
      }
    ],
    companyDetails: {
      name: 'WebTech',
      size: '50-100',
      address: 'Andheri, Mumbai',
      contactPerson: {
        name: 'Tech Lead',
        email: 'tech@webtech.com',
        phone: '+91 9876543215'
      }
    }
  }
];

interface JobFilters {
  type: string[];
  location: string[];
  experience: string[];
}

export interface JobState {
  jobs: Job[];
  filteredJobs: Job[];
  filters: JobFilters;
  isLoading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchJobById: (id: string) => Promise<Job | null>;
  applyToJob: (jobId: string, application: any) => Promise<boolean>;
  bookmarkJob: (jobId: string) => Promise<void>;
  applyFilters: (filters: Partial<JobFilters>) => void;
  resetFilters: () => void;
  createJob: (job: Job) => Promise<void>;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: mockJobs,
      filteredJobs: mockJobs,
      filters: {
        type: [],
        location: [],
        experience: []
      },
      isLoading: false,
      error: null,
      
      fetchJobs: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, you would fetch from an API
          // For now, we'll just use the mock data
          set({ jobs: mockJobs, filteredJobs: mockJobs, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch jobs', isLoading: false });
        }
      },
      
      fetchJobById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, you would fetch from an API
          // For now, we'll just find in the mock data
          const job = get().jobs.find(j => j.id === id);
          set({ isLoading: false });
          return job || null;
        } catch (error) {
          set({ error: 'Failed to fetch job', isLoading: false });
          return null;
        }
      },
      
      applyToJob: async (jobId: string, application: any) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, you would make an API call
          // For now, we'll just update the local state
          const jobs = [...get().jobs];
          const jobIndex = jobs.findIndex(j => j.id === jobId);
          
          if (jobIndex === -1) {
            set({ error: 'Job not found', isLoading: false });
            return false;
          }
          
          const job = { ...jobs[jobIndex] };
          
          // Add application
          job.applications = [
            ...job.applications,
            {
              id: `a${Date.now()}`,
              ...application,
              appliedAt: new Date().toISOString(),
              status: 'pending'
            }
          ];
          
          jobs[jobIndex] = job;
          set({ jobs, filteredJobs: get().filteredJobs, isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'Failed to apply to job', isLoading: false });
          return false;
        }
      },
      
      bookmarkJob: async (jobId: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, you would make an API call
          // For now, we'll just update the local state
          const jobs = [...get().jobs];
          const jobIndex = jobs.findIndex(j => j.id === jobId);
          
          if (jobIndex === -1) {
            set({ error: 'Job not found', isLoading: false });
            return;
          }
          
          const job = { ...jobs[jobIndex] };
          job.isBookmarked = !job.isBookmarked;
          
          jobs[jobIndex] = job;
          set({ jobs, filteredJobs: get().filteredJobs, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to bookmark job', isLoading: false });
        }
      },
      
      applyFilters: (filters: Partial<JobFilters>) => {
        const currentFilters = { ...get().filters };
        const updatedFilters = { ...currentFilters, ...filters };
        
        // Filter jobs
        let filteredJobs = [...get().jobs];
        
        if (updatedFilters.type.length > 0) {
          filteredJobs = filteredJobs.filter(job => 
            updatedFilters.type.includes(job.type)
          );
        }
        
        if (updatedFilters.location.length > 0) {
          filteredJobs = filteredJobs.filter(job => 
            updatedFilters.location.includes(job.location)
          );
        }
        
        if (updatedFilters.experience.length > 0) {
          filteredJobs = filteredJobs.filter(job => 
            updatedFilters.experience.includes(job.experience)
          );
        }
        
        set({ filters: updatedFilters, filteredJobs });
      },
      
      resetFilters: () => {
        set({ 
          filters: {
            type: [],
            location: [],
            experience: []
          },
          filteredJobs: get().jobs
        });
      },
      
      createJob: async (job: Job) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, you would make an API call
          // For now, we'll just update the local state
          const jobs = [...get().jobs, job];
          set({ 
            jobs, 
            filteredJobs: get().filters.type.length > 0 || 
                          get().filters.location.length > 0 || 
                          get().filters.experience.length > 0 
                          ? get().filteredJobs 
                          : jobs, 
            isLoading: false 
          });
        } catch (error) {
          set({ error: 'Failed to create job', isLoading: false });
        }
      }
    }),
    {
      name: 'job-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
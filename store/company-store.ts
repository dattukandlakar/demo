import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Company {
  id: string;
  name: string;
  location: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logo?: string;
  description?: string;
  createdAt: string;
  createdBy: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  skills: string[];
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  postedAt: string;
  deadline?: string;
  status: 'active' | 'closed' | 'draft';
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter?: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
}

interface CompanyState {
  companies: Company[];
  activeCompany: Company | null;
  jobs: Job[];
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
  
  // Company actions
  createCompany: (companyData: Omit<Company, 'id' | 'createdAt'>) => void;
  updateCompany: (id: string, companyData: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  setActiveCompany: (id: string) => void;
  
  // Job actions
  createJob: (jobData: Omit<Job, 'id' | 'postedAt' | 'status'>) => void;
  updateJob: (id: string, jobData: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  
  // Application actions
  createApplication: (applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>) => void;
  updateApplication: (id: string, applicationData: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      activeCompany: null,
      jobs: [],
      applications: [],
      isLoading: false,
      error: null,

      // Company actions
      createCompany: (companyData) => {
        const newCompany: Company = {
          id: `company_${Date.now()}`,
          ...companyData,
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          companies: [...state.companies, newCompany],
          activeCompany: newCompany,
        }));
      },

      updateCompany: (id, companyData) => {
        set(state => ({
          companies: state.companies.map(company => 
            company.id === id ? { ...company, ...companyData } : company
          ),
          activeCompany: state.activeCompany?.id === id 
            ? { ...state.activeCompany, ...companyData } 
            : state.activeCompany,
        }));
      },

      deleteCompany: (id) => {
        set(state => {
          const newCompanies = state.companies.filter(company => company.id !== id);
          return {
            companies: newCompanies,
            activeCompany: state.activeCompany?.id === id 
              ? newCompanies.length > 0 ? newCompanies[0] : null 
              : state.activeCompany,
            jobs: state.jobs.filter(job => job.companyId !== id),
          };
        });
      },

      setActiveCompany: (id) => {
        const company = get().companies.find(c => c.id === id);
        if (company) {
          set({ activeCompany: company });
        }
      },

      // Job actions
      createJob: (jobData) => {
        const newJob: Job = {
          id: `job_${Date.now()}`,
          ...jobData,
          postedAt: new Date().toISOString(),
          status: 'active',
        };

        set(state => ({
          jobs: [...state.jobs, newJob],
        }));
      },

      updateJob: (id, jobData) => {
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === id ? { ...job, ...jobData } : job
          ),
        }));
      },

      deleteJob: (id) => {
        set(state => ({
          jobs: state.jobs.filter(job => job.id !== id),
          applications: state.applications.filter(app => app.jobId !== id),
        }));
      },

      // Application actions
      createApplication: (applicationData) => {
        const newApplication: JobApplication = {
          id: `application_${Date.now()}`,
          ...applicationData,
          appliedAt: new Date().toISOString(),
          status: 'pending',
        };

        set(state => ({
          applications: [...state.applications, newApplication],
        }));
      },

      updateApplication: (id, applicationData) => {
        set(state => ({
          applications: state.applications.map(application => 
            application.id === id ? { ...application, ...applicationData } : application
          ),
        }));
      },

      deleteApplication: (id) => {
        set(state => ({
          applications: state.applications.filter(application => application.id !== id),
        }));
      },
    }),
    {
      name: 'company-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
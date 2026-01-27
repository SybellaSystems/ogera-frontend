import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// ====================== TYPES ======================
export interface UserSkill {
  skill_id: string;
  user_id: string;
  skill_name: string;
  skill_type: "key_skill" | "it_skill";
  proficiency_level?: "beginner" | "intermediate" | "advanced" | "expert";
  years_of_experience?: number;
  last_used_year?: number;
  created_at: string;
  updated_at: string;
}

export interface UserEmployment {
  employment_id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  employment_type: "full_time" | "part_time" | "contract" | "internship" | "freelance";
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  location?: string;
  description?: string;
  notice_period?: string;
  current_salary?: number;
  salary_currency?: string;
  key_skills?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserEducation {
  education_id: string;
  user_id: string;
  degree: string;
  field_of_study: string;
  institution_name: string;
  start_year: number;
  end_year?: number | null;
  is_current: boolean;
  grade?: string;
  grade_type?: "percentage" | "cgpa" | "gpa";
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProject {
  project_id: string;
  user_id: string;
  project_title: string;
  project_url?: string;
  start_date?: string;
  end_date?: string | null;
  is_ongoing: boolean;
  description?: string;
  technologies?: string[];
  role_in_project?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccomplishment {
  accomplishment_id: string;
  user_id: string;
  accomplishment_type: "certification" | "award" | "publication" | "patent" | "other";
  title: string;
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string | null;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtendedProfile {
  user_id: string;
  resume_headline?: string;
  profile_summary?: string;
  total_experience_years?: number;
  total_experience_months?: number;
  current_salary?: number;
  expected_salary?: number;
  salary_currency?: string;
  notice_period?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  marital_status?: "single" | "married" | "divorced" | "widowed" | "prefer_not_to_say";
  languages?: string[];
  social_profiles?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    other?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface FullProfile {
  extendedProfile: ExtendedProfile | null;
  skills: UserSkill[];
  employments: UserEmployment[];
  educations: UserEducation[];
  projects: UserProject[];
  accomplishments: UserAccomplishment[];
}

// ====================== API RESPONSE TYPES ======================
interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
  message: string;
}

// ====================== REQUEST TYPES ======================
export interface CreateSkillRequest {
  skill_name: string;
  skill_type: "key_skill" | "it_skill";
  proficiency_level?: "beginner" | "intermediate" | "advanced" | "expert";
  years_of_experience?: number;
  last_used_year?: number;
}

export interface BulkSkillsRequest {
  skills: CreateSkillRequest[];
}

export interface CreateEmploymentRequest {
  job_title: string;
  company_name: string;
  employment_type: "full_time" | "part_time" | "contract" | "internship" | "freelance";
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description?: string;
  notice_period?: string;
  current_salary?: number;
  salary_currency?: string;
  key_skills?: string[];
}

export interface CreateEducationRequest {
  degree: string;
  field_of_study: string;
  institution_name: string;
  start_year: number;
  end_year?: number;
  is_current: boolean;
  grade?: string;
  grade_type?: "percentage" | "cgpa" | "gpa";
  description?: string;
}

export interface CreateProjectRequest {
  project_title: string;
  project_url?: string;
  start_date?: string;
  end_date?: string;
  is_ongoing: boolean;
  description?: string;
  technologies?: string[];
  role_in_project?: string;
}

export interface CreateAccomplishmentRequest {
  accomplishment_type: "certification" | "award" | "publication" | "patent" | "other";
  title: string;
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
}

export interface UpdateExtendedProfileRequest {
  resume_headline?: string;
  profile_summary?: string;
  total_experience_years?: number;
  total_experience_months?: number;
  current_salary?: number;
  expected_salary?: number;
  salary_currency?: string;
  notice_period?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  marital_status?: "single" | "married" | "divorced" | "widowed" | "prefer_not_to_say";
  languages?: string[];
  social_profiles?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    other?: string;
  };
}

// ====================== API ======================
export const extendedProfileApi = createApi({
  reducerPath: "extendedProfileApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Skills", "Employments", "Educations", "Projects", "Accomplishments", "ExtendedProfile", "FullProfile"],
  endpoints: (builder) => ({
    // ====================== FULL PROFILE ======================
    getFullProfile: builder.query<ApiResponse<FullProfile>, void>({
      query: () => "/profile/full",
      providesTags: ["FullProfile"],
    }),

    // ====================== EXTENDED PROFILE ======================
    getExtendedProfile: builder.query<ApiResponse<ExtendedProfile>, void>({
      query: () => "/profile/extended",
      providesTags: ["ExtendedProfile"],
    }),

    updateExtendedProfile: builder.mutation<ApiResponse<ExtendedProfile>, UpdateExtendedProfileRequest>({
      query: (data) => ({
        url: "/profile/extended",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ExtendedProfile", "FullProfile"],
    }),

    // ====================== SKILLS ======================
    getSkills: builder.query<ApiResponse<UserSkill[]>, { skill_type?: "key_skill" | "it_skill" } | void>({
      query: (params) => ({
        url: "/profile/skills",
        params: params || {},
      }),
      providesTags: ["Skills"],
    }),

    addSkill: builder.mutation<ApiResponse<UserSkill>, CreateSkillRequest>({
      query: (data) => ({
        url: "/profile/skills",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Skills", "FullProfile"],
    }),

    addBulkSkills: builder.mutation<ApiResponse<UserSkill[]>, BulkSkillsRequest>({
      query: (data) => ({
        url: "/profile/skills/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Skills", "FullProfile"],
    }),

    updateSkill: builder.mutation<ApiResponse<UserSkill>, { id: string; data: Partial<CreateSkillRequest> }>({
      query: ({ id, data }) => ({
        url: `/profile/skills/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Skills", "FullProfile"],
    }),

    deleteSkill: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/profile/skills/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Skills", "FullProfile"],
    }),

    // ====================== EMPLOYMENTS ======================
    getEmployments: builder.query<ApiResponse<UserEmployment[]>, void>({
      query: () => "/profile/employments",
      providesTags: ["Employments"],
    }),

    addEmployment: builder.mutation<ApiResponse<UserEmployment>, CreateEmploymentRequest>({
      query: (data) => ({
        url: "/profile/employments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Employments", "FullProfile"],
    }),

    updateEmployment: builder.mutation<ApiResponse<UserEmployment>, { id: string; data: Partial<CreateEmploymentRequest> }>({
      query: ({ id, data }) => ({
        url: `/profile/employments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Employments", "FullProfile"],
    }),

    deleteEmployment: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/profile/employments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employments", "FullProfile"],
    }),

    // ====================== EDUCATIONS ======================
    getEducations: builder.query<ApiResponse<UserEducation[]>, void>({
      query: () => "/profile/educations",
      providesTags: ["Educations"],
    }),

    addEducation: builder.mutation<ApiResponse<UserEducation>, CreateEducationRequest>({
      query: (data) => ({
        url: "/profile/educations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Educations", "FullProfile"],
    }),

    updateEducation: builder.mutation<ApiResponse<UserEducation>, { id: string; data: Partial<CreateEducationRequest> }>({
      query: ({ id, data }) => ({
        url: `/profile/educations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Educations", "FullProfile"],
    }),

    deleteEducation: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/profile/educations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Educations", "FullProfile"],
    }),

    // ====================== PROJECTS ======================
    getProjects: builder.query<ApiResponse<UserProject[]>, void>({
      query: () => "/profile/projects",
      providesTags: ["Projects"],
    }),

    addProject: builder.mutation<ApiResponse<UserProject>, CreateProjectRequest>({
      query: (data) => ({
        url: "/profile/projects",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Projects", "FullProfile"],
    }),

    updateProject: builder.mutation<ApiResponse<UserProject>, { id: string; data: Partial<CreateProjectRequest> }>({
      query: ({ id, data }) => ({
        url: `/profile/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Projects", "FullProfile"],
    }),

    deleteProject: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/profile/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects", "FullProfile"],
    }),

    // ====================== ACCOMPLISHMENTS ======================
    getAccomplishments: builder.query<ApiResponse<UserAccomplishment[]>, { type?: string } | void>({
      query: (params) => ({
        url: "/profile/accomplishments",
        params: params || {},
      }),
      providesTags: ["Accomplishments"],
    }),

    addAccomplishment: builder.mutation<ApiResponse<UserAccomplishment>, CreateAccomplishmentRequest>({
      query: (data) => ({
        url: "/profile/accomplishments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Accomplishments", "FullProfile"],
    }),

    updateAccomplishment: builder.mutation<ApiResponse<UserAccomplishment>, { id: string; data: Partial<CreateAccomplishmentRequest> }>({
      query: ({ id, data }) => ({
        url: `/profile/accomplishments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Accomplishments", "FullProfile"],
    }),

    deleteAccomplishment: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/profile/accomplishments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accomplishments", "FullProfile"],
    }),
  }),
});

export const {
  // Full Profile
  useGetFullProfileQuery,
  // Extended Profile
  useGetExtendedProfileQuery,
  useUpdateExtendedProfileMutation,
  // Skills
  useGetSkillsQuery,
  useAddSkillMutation,
  useAddBulkSkillsMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  // Employments
  useGetEmploymentsQuery,
  useAddEmploymentMutation,
  useUpdateEmploymentMutation,
  useDeleteEmploymentMutation,
  // Educations
  useGetEducationsQuery,
  useAddEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  // Projects
  useGetProjectsQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  // Accomplishments
  useGetAccomplishmentsQuery,
  useAddAccomplishmentMutation,
  useUpdateAccomplishmentMutation,
  useDeleteAccomplishmentMutation,
} = extendedProfileApi;


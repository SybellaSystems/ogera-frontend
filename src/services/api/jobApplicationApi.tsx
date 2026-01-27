import { apiSlice } from "./apiSlice";

export interface JobApplication {
  application_id: string;
  job_id: string;
  student_id: string;
  status: "Pending" | "Accepted" | "Rejected";
  cover_letter?: string;
  resume_url?: string;
  applied_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  job?: {
    job_id: string;
    job_title: string;
    employer_id: string;
    category: string;
    budget: number;
    location: string;
    status: string;
  };
  student?: {
    user_id: string;
    full_name: string;
    email: string;
    mobile_number?: string;
  };
  employer?: {
    user_id: string;
    full_name: string;
    email: string;
  };
}

export interface JobApplicationAnswer {
  question_id: string;
  answer_text: string;
}

export interface ApplyForJobRequest {
  cover_letter?: string;
  resume_url?: string;
  answers?: JobApplicationAnswer[];
}

export interface UpdateApplicationStatusRequest {
  status: "Accepted" | "Rejected";
}

export interface JobApplicationResponse {
  success: boolean;
  status: number;
  data: JobApplication;
  message: string;
}

export interface JobApplicationsListResponse {
  success: boolean;
  status: number;
  data: JobApplication[];
  message: string;
}

export const jobApplicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Apply for a job (student only)
    applyForJob: builder.mutation<
      JobApplicationResponse,
      { job_id: string; data: ApplyForJobRequest }
    >({
      query: ({ job_id, data }) => ({
        url: `/jobs/${job_id}/apply`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { job_id }) => [
        { type: "Job", id: job_id },
        "Job",
        "JobApplication",
      ],
    }),

    // Get all applications for a specific job (employer/superadmin only)
    getJobApplications: builder.query<JobApplicationsListResponse, string>({
      query: (job_id) => ({
        url: `/jobs/${job_id}/applications`,
        method: "GET",
      }),
      providesTags: (_result, _error, job_id) => [
        { type: "Job", id: job_id },
        "Job",
      ],
    }),

    // Get all applications for an employer (employer/superadmin only)
    getEmployerApplications: builder.query<JobApplicationsListResponse, void>({
      query: () => ({
        url: "/employer/applications",
        method: "GET",
      }),
      providesTags: ["Job"],
    }),

    // Get student's own applications
    getStudentApplications: builder.query<JobApplicationsListResponse, void>({
      query: () => ({
        url: "/student/applications",
        method: "GET",
      }),
      providesTags: ["Job", "JobApplication"],
    }),

    // Get application by ID
    getApplicationById: builder.query<
      JobApplicationResponse,
      string
    >({
      query: (application_id) => ({
        url: `/applications/${application_id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, application_id) => [
        { type: "Job", id: application_id },
      ],
    }),

    // Check if student has applied to a job
    checkStudentApplication: builder.query<
      { success: boolean; data: { hasApplied: boolean; application?: JobApplication } },
      string
    >({
      query: (job_id) => ({
        url: `/jobs/${job_id}/check-application`,
        method: "GET",
      }),
      providesTags: (_result, _error, job_id) => [
        { type: "Job", id: job_id },
        "Job",
      ],
    }),

    // Accept or reject application (employer/superadmin only)
    updateApplicationStatus: builder.mutation<
      JobApplicationResponse,
      { application_id: string; data: UpdateApplicationStatusRequest }
    >({
      query: ({ application_id, data }) => ({
        url: `/applications/${application_id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Job"],
    }),
  }),
});

export const {
  useApplyForJobMutation,
  useGetJobApplicationsQuery,
  useGetEmployerApplicationsQuery,
  useGetStudentApplicationsQuery,
  useGetApplicationByIdQuery,
  useUpdateApplicationStatusMutation,
  useCheckStudentApplicationQuery,
} = jobApplicationApi;



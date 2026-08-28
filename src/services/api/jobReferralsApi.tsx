import { apiSlice } from "./apiSlice";

/**
 * Job Referral types
 */

export type ReferralVerificationStatus = "Pending" | "Verified" | "Rejected";

export type ReferralPermissionStatus = "Pending" | "Approved" | "Rejected";

export type ReferralStatus = "All" | "Pending" | "Verified" | "Active" | "Closed";

export interface JobReferral {
  // Internal database UUID
  referral_id: string;

  // User-facing referral ID
  created_referral_id: string;

  title: string;
  company: string;
  location: string;

  employment_type?: string | null;
  category?: string | null;

  description?: string | null;

  source?: string | null;
  original_url?: string | null;

  verification_status: ReferralVerificationStatus;
  permission_status: ReferralPermissionStatus;

  verification_notes?: string | null;

  expiry_date?: string | null;

  status: ReferralStatus;

  views_count: number;
  apply_clicks: number;
  reported_applications: number;

  created_by: string;

  created_at: string;
  updated_at: string;
}

export interface CreateJobReferralRequest {
  title: string;
  company: string;
  location: string;
  employment_type?: string | null;
  category?: string | null;
  description?: string | null;
  source?: string | null;
  original_url?: string | null;
  verification_status?: ReferralVerificationStatus;
  permission_status?: ReferralPermissionStatus;
  verification_notes?: string | null;
  expiry_date?: string | null;
  status?: ReferralStatus;
}

export interface UpdateJobReferralRequest {
  title?: string;
  company?: string;
  location?: string;

  employment_type?: string | null;
  category?: string | null;

  description?: string | null;

  source?: string | null;
  original_url?: string | null;

  expiry_date?: string | null;
}

export interface UpdateVerificationRequest {
  verification_status?: "Pending" | "Verified" | "Rejected";

  verification_notes?: string | null;

  permission_status?: "Pending" | "Approved" | "Rejected";
}

export interface UpdateReferralStatusRequest {
  status: ReferralStatus;
}

export interface JobReferralResponse {
  success: boolean;
  data: JobReferral;
  message?: string;
}

export type ReferralTab =
  | "all"
  | "pending"
  | "verified"
  | "active"
  | "closed";

export interface ReferralPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ReferralCounts {
  all: number;
  pending_verification: number;
  verified: number;
  active: number;
  closed: number;
}

export interface JobReferralsListResponse {
  success: boolean;

  data: {
    referrals: JobReferral[];

    pagination: ReferralPagination;

    counts: ReferralCounts;
  };

  message?: string;
}

export interface ActiveVerifiedReferralsResponse {
  success: boolean;
  data: JobReferral[];
  message?: string;
}

export interface DeleteJobReferralResponse {
  success: boolean;
  data?: {
    message: string;
  };
  message?: string;
}

export interface ReferralStatistics {
  totalReferrals: number;
  activeReferrals: number;
  verifiedReferrals: number;
  pendingReferrals: number;
  rejectedReferrals: number;
  totalViews: number;
  totalApplyClicks: number;
  totalReportedApplications: number;
}

export interface ReferralStatisticsResponse {
  success: boolean;
  data: ReferralStatistics;
  message?: string;
}

export interface ReferralTotalResponse {
  success: boolean;
  data: number;
  message?: string;
}

/**
 * Job Referral API
 */
export const jobReferralsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all job referrals
     */
    /**
     * Get paginated job referrals
     *
     * Default:
     * page = 1
     * limit = 3
     */
    getAllJobReferrals: builder.query<
  JobReferralsListResponse,
  {
    page?: number;
    limit?: number;
    status?: ReferralTab;
    all?: boolean;
  }
>({
  query: ({
    page = 1,
    limit = 3,
    status = "all",
    all = false,
  }) => ({
    url: "/job-referrals",
    method: "GET",
    params: {
      page,
      limit,
      status,
      all,
    },
  }),
  providesTags: ["JobReferral"],
}),


    /**
     * Search job referrals
     */
    searchJobReferrals: builder.query<JobReferralsListResponse, string>({
      query: (search) => ({
        url: "/job-referrals/search",
        method: "GET",
        params: {
          search,
        },
      }),
      providesTags: ["JobReferral"],
    }),

    /**
     * Get active + verified + approved referrals
     *
     * This is the endpoint students should use.
     */
    getActiveVerifiedReferrals: builder.query<
    ActiveVerifiedReferralsResponse,
    {
        limit?: number;
        all?: boolean;
    } | void
>({
    query: (params) => ({
        url: "/job-referrals/available",
        method: "GET",
        params: {
            limit: params?.limit ?? 9,
            all: params?.all ?? false,
        },
    }),
    providesTags: ["JobReferral"],
}),

    /**
     * Get referrals created by a user
     */
    getReferralsByCreator: builder.query<JobReferralsListResponse, string>({
      query: (createdBy) => ({
        url: `/job-referrals/creator/${createdBy}`,
        method: "GET",
      }),
      providesTags: ["JobReferral"],
    }),

    /**
     * Get referral statistics
     */
    getJobReferralStatistics: builder.query<ReferralStatisticsResponse, void>({
      query: () => ({
        url: "/job-referrals/statistics",
        method: "GET",
      }),
      providesTags: ["JobReferral"],
    }),

    /**
     * Get total views
     */
    getJobReferralTotalViews: builder.query<ReferralTotalResponse, void>({
      query: () => ({
        url: "/job-referrals/statistics/views",
        method: "GET",
      }),
      providesTags: ["JobReferral"],
    }),

    /**
     * Get total apply clicks
     */
    getJobReferralTotalApplyClicks: builder.query<ReferralTotalResponse, void>({
      query: () => ({
        url: "/job-referrals/statistics/apply-clicks",
        method: "GET",
      }),
      providesTags: ["JobReferral"],
    }),

    /**
     * Get referral by ID
     */
    getJobReferralById: builder.query<JobReferralResponse, string>({
      query: (referralId) => ({
        url: `/job-referrals/${referralId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, referralId) => [
        {
          type: "JobReferral",
          id: referralId,
        },
      ],
    }),

    /**
     * Create referral
     */
    createJobReferral: builder.mutation<
      JobReferralResponse,
      CreateJobReferralRequest
    >({
      query: (data) => ({
        url: "/job-referrals",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["JobReferral"],
    }),

    /**
     * Update referral
     */
    updateJobReferral: builder.mutation<
      JobReferralResponse,
      {
        referralId: string;
        data: UpdateJobReferralRequest;
      }
    >({
      query: ({ referralId, data }) => ({
        url: `/job-referrals/${referralId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { referralId }) => [
        "JobReferral",
        {
          type: "JobReferral",
          id: referralId,
        },
      ],
    }),

    /**
     * Delete referral
     */
    deleteJobReferral: builder.mutation<DeleteJobReferralResponse, string>({
      query: (referralId) => ({
        url: `/job-referrals/${referralId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, referralId) => [
        "JobReferral",
        {
          type: "JobReferral",
          id: referralId,
        },
      ],
    }),

    /**
     * Update verification / permission
     */
    updateJobReferralVerification: builder.mutation<
      JobReferralResponse,
      {
        referralId: string;
        data: UpdateVerificationRequest;
      }
    >({
      query: ({ referralId, data }) => ({
        url: `/job-referrals/${referralId}/verification`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { referralId }) => [
        "JobReferral",
        {
          type: "JobReferral",
          id: referralId,
        },
      ],
    }),

    /**
     * Update referral status
     */
    updateJobReferralStatus: builder.mutation<
      JobReferralResponse,
      {
        referralId: string;
        status: ReferralStatus;
      }
    >({
      query: ({ referralId, status }) => ({
        url: `/job-referrals/${referralId}/status`,
        method: "PATCH",
        body: {
          status,
        },
      }),
      invalidatesTags: (_result, _error, { referralId }) => [
        "JobReferral",
        {
          type: "JobReferral",
          id: referralId,
        },
      ],
    }),

    incrementJobReferralCounter: builder.mutation<
      JobReferralResponse,
      {
        referralId: string;
        type: "views_count" | "apply_clicks" | "reported_applications";
      }
    >({
      query: ({ referralId, type }) => ({
        url: `/job-referrals/${referralId}/counter`,
        method: "POST",
        body: {
          type,
        },
      }),

      invalidatesTags: (_result, _error, { referralId }) => [
        {
          type: "JobReferral",
          id: referralId,
        },
        "JobReferral",
      ],
    }),
  }),
});

export const {
  useGetAllJobReferralsQuery,
  useSearchJobReferralsQuery,
  useGetActiveVerifiedReferralsQuery,
  useGetReferralsByCreatorQuery,
  useGetJobReferralStatisticsQuery,
  useGetJobReferralTotalViewsQuery,
  useGetJobReferralTotalApplyClicksQuery,
  useGetJobReferralByIdQuery,

  useCreateJobReferralMutation,
  useUpdateJobReferralMutation,
  useDeleteJobReferralMutation,

  useUpdateJobReferralVerificationMutation,
  useUpdateJobReferralStatusMutation,
  
  useIncrementJobReferralCounterMutation,
} = jobReferralsApi;

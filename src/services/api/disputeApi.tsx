import { apiSlice } from "./apiSlice";

// Dispute Types
export interface DisputeUser {
  user_id: string;
  full_name: string;
  email: string;
  mobile_number?: string;
}

export interface DisputeJob {
  job_id: string;
  job_title: string;
  description?: string;
}

export interface Dispute {
  dispute_id: string;
  student_id: string;
  employer_id: string;
  job_id?: string;
  type: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  priority: "High" | "Medium" | "Low";
  assigned_to?: string;
  outcome?: string;
  resolution_notes?: string;
  started_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  student?: DisputeUser;
  employer?: DisputeUser;
  assignedAdmin?: DisputeUser;
  job?: DisputeJob;
}

export interface DisputeStats {
  byStatus: {
    open: number;
    inProgress: number;
    resolved: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  resolvedThisMonth: number;
}

export interface DisputesResponse {
  success: boolean;
  status: number;
  message: string;
  data: Dispute[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DisputeResponse {
  success: boolean;
  status: number;
  message: string;
  data: Dispute;
}

export interface DisputeStatsResponse {
  success: boolean;
  status: number;
  message: string;
  data: DisputeStats;
}

export interface GetDisputesParams {
  status?: "Open" | "In Progress" | "Resolved";
  priority?: "High" | "Medium" | "Low";
  page?: number;
  limit?: number;
}

export interface CreateDisputeParams {
  student_id: string;
  employer_id: string;
  job_id?: string;
  type: string;
  description: string;
  priority?: "High" | "Medium" | "Low";
}

export interface UpdateDisputeParams {
  id: string;
  type?: string;
  description?: string;
  priority?: "High" | "Medium" | "Low";
  status?: "Open" | "In Progress" | "Resolved";
}

export interface AssignDisputeParams {
  id: string;
  assigned_to: string;
}

export interface ResolveDisputeParams {
  id: string;
  outcome: string;
  resolution_notes?: string;
}

export const disputeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get dispute statistics
    getDisputeStats: builder.query<DisputeStatsResponse, void>({
      query: () => ({
        url: "/disputes/stats",
        method: "GET",
      }),
      providesTags: ["Dispute"],
    }),

    // Get all disputes with optional filters
    getDisputes: builder.query<DisputesResponse, GetDisputesParams | void>({
      query: (params) => ({
        url: "/disputes",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Dispute"],
    }),

    // Get single dispute by ID
    getDisputeById: builder.query<DisputeResponse, string>({
      query: (id) => ({
        url: `/disputes/${id}`,
        method: "GET",
      }),
      providesTags: ["Dispute"],
    }),

    // Create a new dispute
    createDispute: builder.mutation<DisputeResponse, CreateDisputeParams>({
      query: (data) => ({
        url: "/disputes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Dispute"],
    }),

    // Update a dispute
    updateDispute: builder.mutation<DisputeResponse, UpdateDisputeParams>({
      query: ({ id, ...data }) => ({
        url: `/disputes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Dispute"],
    }),

    // Assign dispute to admin
    assignDispute: builder.mutation<DisputeResponse, AssignDisputeParams>({
      query: ({ id, assigned_to }) => ({
        url: `/disputes/${id}/assign`,
        method: "POST",
        body: { assigned_to },
      }),
      invalidatesTags: ["Dispute"],
    }),

    // Resolve a dispute
    resolveDispute: builder.mutation<DisputeResponse, ResolveDisputeParams>({
      query: ({ id, outcome, resolution_notes }) => ({
        url: `/disputes/${id}/resolve`,
        method: "POST",
        body: { outcome, resolution_notes },
      }),
      invalidatesTags: ["Dispute"],
    }),
  }),
});

export const {
  useGetDisputeStatsQuery,
  useGetDisputesQuery,
  useGetDisputeByIdQuery,
  useCreateDisputeMutation,
  useUpdateDisputeMutation,
  useAssignDisputeMutation,
  useResolveDisputeMutation,
} = disputeApi;

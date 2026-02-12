import { apiSlice } from "./apiSlice";
import type { UserProfile } from "./profileApi";

export interface PaginationParams {
  page?: number;
  limit?: number;
  type?: string; // "all", "Student", or "Employer"
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Student Performance Types
export interface StudentPerformance {
  id: string;
  name: string;
  email: string;
  university: string;
  gpa: string;
  degree: string;
  fieldOfStudy: string;
  jobsCompleted: number;
  jobsPending: number;
  jobsRejected: number;
  totalApplications: number;
  rating: number;
  earnings: string;
  trend: string;
  engagement: "Low" | "Medium" | "High" | "Very High";
  status: string;
  verificationStatus: {
    email: boolean;
    phone: boolean;
  };
  createdAt: string;
  role: string;
}

export interface StudentPerformanceSummary {
  totalStudents: number;
  totalJobsCompleted: number;
  avgRating: number;
  totalEarnings: string;
  avgCompletionRate: string;
}

export interface StudentPerformanceParams {
  page?: number;
  limit?: number;
  sortBy?: "rating" | "earnings" | "completion";
}

export interface StudentPerformanceResponse {
  success: boolean;
  status: number;
  message: string;
  data: StudentPerformance[];
  summary: StudentPerformanceSummary;
  pagination: PaginationMeta;
}

// Locked Account Types
export interface LockedAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  reason: string;
  lockedDate: string;
  duration: string;
  lockedBy: string;
}

export interface LockedAccountsResponse {
  success: boolean;
  status: number;
  message: string;
  data: LockedAccount[];
  pagination: PaginationMeta;
}

export interface LockAccountParams {
  userId: string;
  reason: string;
  duration: string;
}

export interface UsersListResponse {
  success: boolean;
  status: number;
  data: UserProfile[];
  message: string;
  pagination?: PaginationMeta;
  counts?: {
    students: number;
    employers: number;
  };
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users (admin / superadmin)
    // This single endpoint handles all user types based on the 'type' parameter
    // type: undefined or "all" = all users, "Student" = students only, "Employer" = employers only
    getAllUsers: builder.query<UsersListResponse, PaginationParams | void>({
      query: (params = {}) => {
        const { page = 1, limit = 10, type } = params || {};
        const queryParams: Record<string, any> = {
          page,
          limit,
        };
        // Only add type parameter if it's provided and not "all"
        if (type && type !== "all") {
          queryParams.type = type;
        }
        return {
          url: "/users",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["User"],
    }),

    // Get all students
    // getAllStudents: builder.query<UsersListResponse, PaginationParams | void>({
    //   query: (params = {}) => {
    //     const { page = 1, limit = 10 } = params || {};
    //     return {
    //       url: "/auth/get-students",
    //       method: "GET",
    //       params: {
    //         page,
    //         limit,
    //       },
    //     };
    //   },
    //   providesTags: ["User"],
    // }),

    // // Get all employers
    // getAllEmployers: builder.query<UsersListResponse, PaginationParams | void>({
    //   query: (params = {}) => {
    //     const { page = 1, limit = 10 } = params || {};
    //     return {
    //       url: "/auth/get-employers",
    //       method: "GET",
    //       params: {
    //         page,
    //         limit,
    //       },
    //     };
    //   },
    //   providesTags: ["User"],
    // }),

    // Get user by ID (admin/superadmin only)
    getUserById: builder.query<
      { success: boolean; status: number; data: UserProfile; message: string },
      string
    >({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Update user by ID (admin/superadmin only)
    updateUserById: builder.mutation<
      { success: boolean; status: number; data: UserProfile; message: string },
      { id: string; data: Partial<UserProfile> }
    >({
      query: ({ id, data }) => ({
        url: `/auth/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Delete user (admin/superadmin only)
    deleteUser: builder.mutation<
      { success: boolean; status: number; message: string },
      string
    >({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Add user (admin/superadmin only)
    addUser: builder.mutation<
      { success: boolean; status: number; data: UserProfile; message: string },
      {
        full_name: string;
        email: string;
        password: string;
        role: string;
        mobile_number: string;
        national_id_number?: string;
        business_registration_id?: string;
      }
    >({
      query: (data) => ({
        url: "/auth/add-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Get student performance metrics
    getStudentPerformance: builder.query<StudentPerformanceResponse, StudentPerformanceParams | void>({
      query: (params = {}) => {
        const { page = 1, limit = 10, sortBy = "rating" } = params || {};
        return {
          url: "/users/students/performance",
          method: "GET",
          params: { page, limit, sortBy },
        };
      },
      providesTags: ["User"],
    }),

    // Get locked accounts
    getLockedAccounts: builder.query<LockedAccountsResponse, PaginationParams | void>({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params || {};
        return {
          url: "/users/locked",
          method: "GET",
          params: { page, limit },
        };
      },
      providesTags: ["User"],
    }),

    // Lock user account
    lockUserAccount: builder.mutation<
      { success: boolean; status: number; message: string; data: any },
      LockAccountParams
    >({
      query: ({ userId, reason, duration }) => ({
        url: `/users/${userId}/lock`,
        method: "POST",
        body: { reason, duration },
      }),
      invalidatesTags: ["User"],
    }),

    // Unlock user account
    unlockUserAccount: builder.mutation<
      { success: boolean; status: number; message: string; data: any },
      string
    >({
      query: (userId) => ({
        url: `/users/${userId}/unlock`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  // useGetAllStudentsQuery,
  // useGetAllEmployersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useDeleteUserMutation,
  useAddUserMutation,
  useGetStudentPerformanceQuery,
  useGetLockedAccountsQuery,
  useLockUserAccountMutation,
  useUnlockUserAccountMutation,
} = usersApi;

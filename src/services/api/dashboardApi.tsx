import { apiSlice } from "./apiSlice";

// ===================== ADMIN/SUPERADMIN TYPES =====================
export interface AdminMetricsData {
  totalUsers: number;
  totalStudents: number;
  activeJobs: number;
  totalEarnings: number;
}

export interface AdminMetricsResponse {
  success: boolean;
  status: number;
  data: AdminMetricsData;
  message: string;
}

// ===================== STUDENT TYPES =====================
export interface StudentDashboardData {
  applications: {
    value: number;
    change: number | null;
  };
  jobsCompleted: {
    value: number | null;
    change: number | null;
    note?: string;
  };
  interviews: {
    value: number | null;
    growthPercentage: number | null;
    note?: string;
  };
  earnings: {
    value: number;
    currency: string | null;
  };
}

export interface StudentDashboardResponse {
  success: boolean;
  status: number;
  data: StudentDashboardData;
  message: string;
}

// ===================== API =====================
export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin/Superadmin metrics
    getDashboardMetrics: builder.query<AdminMetricsResponse, void>({
      query: () => ({
        url: "/dashboard/metrics",
        method: "GET",
      }),
      providesTags: ["DashboardMetrics"],
    }),
    // Student dashboard
    getStudentDashboard: builder.query<StudentDashboardResponse, void>({
      query: () => ({
        url: "/dashboard/student",
        method: "GET",
      }),
      providesTags: ["DashboardMetrics"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetStudentDashboardQuery,
} = dashboardApi;

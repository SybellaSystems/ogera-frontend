import { apiSlice } from "./apiSlice";

/**
 * Dashboard metrics interface
 */
export interface DashboardMetrics {
  totalUsers: number;
  totalStudents: number;
  activeJobs: number;
  totalEarnings: number;
}

/**
 * API response for dashboard metrics
 */
export interface DashboardMetricsResponse {
  success: boolean;
  status: number;
  data: DashboardMetrics;
  message: string;
}

/**
 * Dashboard API slice
 * Provides endpoints for fetching dashboard metrics
 */
export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get dashboard metrics
     * Fetches total users, total students, active jobs, and total earnings
     * Requires superadmin authentication
     */
    getDashboardMetrics: builder.query<DashboardMetricsResponse, void>({
      query: () => ({
        url: "/dashboard/metrics",
        method: "GET",
      }),
      providesTags: ["DashboardMetrics"],
    }),
  }),
});

/**
 * Export the hook for use in components
 */
export const { useGetDashboardMetricsQuery } = dashboardApi;

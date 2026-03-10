import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "User", "Role", "Permission", "Job", "JobCategory", "Notification", "TrustScore", "Course", "CourseProgress", "CourseCompletion", "CourseStarted", "CourseStudents", "CourseStatistics", "JobApplication", "DashboardMetrics", "MoMoPayments"],
  endpoints: () => ({}),
});

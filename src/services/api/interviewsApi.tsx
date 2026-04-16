import { apiSlice } from "./apiSlice";

export interface InterviewItem {
  id: string;
  scheduled_at: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  notes?: string | null;
  job: {
    job_id: string;
    job_title: string;
    category: string;
    location: string;
    budget: number;
    employer: {
      full_name: string;
      email: string;
      profile_image_url: string | null;
    } | null;
  } | null;
}

export interface MyInterviewsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    upcoming: InterviewItem[];
    past: InterviewItem[];
    total: number;
  };
}

export interface ScheduleInterviewBody {
  student_id: string;
  job_id: string;
  scheduled_at: string;
  notes?: string;
}

export const interviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyInterviews: builder.query<MyInterviewsResponse, void>({
      query: () => ({ url: "/interviews/my", method: "GET" }),
    }),
    scheduleInterview: builder.mutation<{ success: boolean; data: any; message: string }, ScheduleInterviewBody>({
      query: (body) => ({
        url: "/interviews",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetMyInterviewsQuery, useScheduleInterviewMutation } = interviewsApi;

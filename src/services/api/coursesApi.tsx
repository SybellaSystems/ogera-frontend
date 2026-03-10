import { apiSlice } from "./apiSlice";
import api from "./axiosInstance";

/** SRS: Micro-courses – video, quizzes, resources. */
export type CourseStepType =
  | "video"
  | "link"
  | "pdf"
  | "image"
  | "text"
  | "quiz";

export interface CourseStep {
  step_id?: string;
  step_type: CourseStepType;
  step_content: string;
  step_title?: string;
  step_order: number;
}

export interface UploadedVideoMeta {
  path: string;
  storageType: "local" | "s3";
}

/** SRS: Free core skills vs paid (RWF 2,000–10,000). Category = trending topics. */
export const COURSE_CATEGORIES = [
  "Digital Marketing",
  "Data Entry/Analysis",
  "Graphic Design",
  "Virtual Assistance",
  "Coding Basics",
  "Customer Service",
  "Content Writing",
  "Academic Research Skills",
  "Digital Literacy",
  "CV Writing",
  "Other",
] as const;

export interface Course {
  course_id: string;
  course_name: string;
  type: string;
  tag: string;
  description?: string;
  estimated_hours?: number | null;
  category?: string | null;
  is_free: boolean;
  price_amount?: number | null;
  price_currency?: string | null;
  discount_trust_score_min?: number | null;
  discount_percent?: number | null;
  created_by?: string | null;
  steps?: CourseStep[];
  created_at: string;
  updated_at: string;
}

export interface CreateCourseRequest {
  course_name: string;
  type: string;
  tag: string;
  description?: string;
  estimated_hours?: number | null;
  category?: string | null;
  is_free?: boolean;
  price_amount?: number | null;
  price_currency?: string | null;
  discount_trust_score_min?: number | null;
  discount_percent?: number | null;
  steps?: CourseStep[];
}

export interface UpdateCourseRequest {
  course_name?: string;
  type?: string;
  tag?: string;
  description?: string;
  estimated_hours?: number | null;
  category?: string | null;
  is_free?: boolean;
  price_amount?: number | null;
  price_currency?: string | null;
  discount_trust_score_min?: number | null;
  discount_percent?: number | null;
  steps?: CourseStep[];
}

/** SRS: Complete → admin review → certificate. Employers see completed courses (certificate view gated). */
export type CertificateStatus =
  | "none"
  | "pending_payment"
  | "pending_review"
  | "approved";

export interface CourseEnrollment {
  enrollment_id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string | null;
  certificate_status: CertificateStatus;
  amount_due?: number | null;
  amount_paid?: number | null;
  funded?: boolean | null;
  course?: Course;
  created_at: string;
  updated_at: string;
}

/** Course chat message (real-time + history). One thread per student (conversation_user_id). */
export interface CourseChatMessage {
  message_id: string;
  course_id: string;
  user_id: string;
  role: string;
  content: string;
  conversation_user_id?: string | null;
  created_at: string;
}

export interface CourseResponse {
  success: boolean;
  status: number;
  data: Course;
  message: string;
}

export interface CoursesListResponse {
  success: boolean;
  status: number;
  data: Course[];
  message: string;
}

export interface DeleteCourseResponse {
  success: boolean;
  status: number;
  data: {
    message: string;
  };
  message: string;
}

export interface CourseProgress {
  progress_id: string;
  user_id: string;
  course_id: string;
  step_id: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCompletion {
  completed: number;
  total: number;
  percentage: number;
  started: boolean;
  started_at: string | null;
}

export interface CourseProgressResponse {
  success: boolean;
  status: number;
  data: {
    progress: CourseProgress[];
    completion: CourseCompletion;
  };
  message: string;
}

export interface CourseCompletionResponse {
  success: boolean;
  status: number;
  data: CourseCompletion;
  message: string;
}

export interface MarkStepCompleteRequest {
  course_id: string;
  step_id: string;
}

export interface CourseStudent {
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: string;
  started_at: string | null;
  completed_steps: number;
  total_steps: number;
  percentage: number;
  is_completed: boolean;
}

export interface CourseStatistics {
  total_courses: number;
  total_students_enrolled: number;
  total_course_completions: number;
}

export interface CourseSpecificStatistics {
  course_id: string;
  course_name: string;
  total_steps: number;
  total_enrolled: number;
  completed_students: number;
  in_progress_students: number;
  not_started_students: number;
  completion_rate: number;
}

export const coursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all courses
    getAllCourses: builder.query<CoursesListResponse, void>({
      query: () => ({
        url: "/courses",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    // Get course by ID
    getCourseById: builder.query<CourseResponse, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Course", id }],
    }),

    // Create course
    createCourse: builder.mutation<CourseResponse, CreateCourseRequest>({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Course"],
    }),

    // Update course
    updateCourse: builder.mutation<
      CourseResponse,
      { id: string; data: UpdateCourseRequest }
    >({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Course", id },
        "Course",
      ],
    }),

    // Delete course
    deleteCourse: builder.mutation<DeleteCourseResponse, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Course", id },
        "Course",
      ],
    }),

    // ---------- Enrollments (SRS: enroll → complete → admin review) ----------
    enrollCourse: builder.mutation<
      { data: CourseEnrollment; message: string },
      string
    >({
      query: (courseId) => ({
        url: `/courses/${courseId}/enroll`,
        method: "POST",
      }),
      invalidatesTags: ["Course", "Enrollment"],
    }),

    getMyEnrollments: builder.query<
      { data: CourseEnrollment[]; message: string },
      void
    >({
      query: () => ({
        url: "/courses/my-enrollments",
        method: "GET",
      }),
      providesTags: ["Enrollment"],
    }),

    getEnrollment: builder.query<
      { data: CourseEnrollment; message: string },
      string
    >({
      query: (courseId) => ({
        url: `/courses/${courseId}/enrollment`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Enrollment", id: courseId },
      ],
    }),

    completeCourse: builder.mutation<
      { data: CourseEnrollment; message: string },
      string
    >({
      query: (courseId) => ({
        url: `/courses/${courseId}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Course", "Enrollment"],
    }),

    getEnrollmentsPendingReview: builder.query<
      { data: CourseEnrollment[]; message: string },
      void
    >({
      query: () => ({
        url: "/courses/enrollments/pending-review",
        method: "GET",
      }),
      providesTags: ["Enrollment"],
    }),

    updateCertificateStatus: builder.mutation<
      { data: CourseEnrollment; message: string },
      {
        enrollmentId: string;
        certificate_status: "pending_review" | "approved";
        funded?: boolean;
      }
    >({
      query: ({ enrollmentId, certificate_status, funded }) => ({
        url: `/courses/enrollments/${enrollmentId}/certificate`,
        method: "PUT",
        body: { certificate_status, funded },
      }),
      invalidatesTags: ["Enrollment"],
    }),
    uploadCourseVideo: builder.mutation<
      { data: UploadedVideoMeta; message: string },
      File
    >({
      query: (file) => {
        const formData = new FormData();
        formData.append("video", file);
        return {
          url: "/courses/upload-video",
          method: "POST",
          body: formData,
        };
      },
    }),

    getCourseChatHistory: builder.query<
      {
        data: CourseChatMessage[] | { messages: CourseChatMessage[]; participants: { user_id: string; full_name: string }[] };
        message: string;
      },
      string
    >({
      query: (courseId) => ({
        url: `/courses/${courseId}/chat`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Course", id: `chat-${courseId}` },
      ],
    }),

    // Course statistics (overview)
    getCourseStatistics: builder.query<
      { data: CourseStatistics; message: string },
      void
    >({
      query: () => ({
        url: "/courses/statistics/overview",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    // Course-specific statistics (per course)
    getCourseSpecificStatistics: builder.query<
      { data: CourseSpecificStatistics; message: string },
      string
    >({
      query: (courseId) => ({
        url: `/courses/${courseId}/statistics`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Course", id: `stats-${courseId}` },
      ],
    }),

    // Students enrolled in a course (with progress)
    getCourseStudents: builder.query<
      { data: CourseStudent[]; message: string },
      string
    >({
      query: (courseId) => ({
        url: `/courses/${courseId}/students`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Course", id: `students-${courseId}` },
      ],
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useEnrollCourseMutation,
  useGetMyEnrollmentsQuery,
  useGetEnrollmentQuery,
  useCompleteCourseMutation,
  useGetEnrollmentsPendingReviewQuery,
  useUpdateCertificateStatusMutation,
  useUploadCourseVideoMutation,
  useGetCourseChatHistoryQuery,
  useGetCourseStatisticsQuery,
  useGetCourseSpecificStatisticsQuery,
  useGetCourseStudentsQuery,
} = coursesApi;

/**
 * Upload course content file (PDF, Image, etc.)
 */
export const uploadCourseContent = async (file: File, stepType: "pdf" | "image"): Promise<CourseFileUploadResponse> => {
  const formData = new FormData();
  const fieldName = stepType === "pdf" ? "pdf" : "image";
  formData.append(fieldName, file);

  const res = await api.post<CourseFileUploadResponse>(
    "/courses/upload-content",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

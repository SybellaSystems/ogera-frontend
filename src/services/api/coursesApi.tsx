import { apiSlice } from "./apiSlice";
import api from "./axiosInstance";

export interface CourseStep {
  step_id?: string;
  step_type: "video" | "link" | "pdf" | "image" | "text";
  step_content: string;
  step_title?: string;
  step_order: number;
}

export interface CourseFileUploadResponse {
  success: boolean;
  status: number;
  data: {
    file_url: string;
    path: string;
    storageType: string;
  };
  message: string;
}

export interface Course {
  course_id: string;
  course_name: string;
  type: string;
  tag: string;
  description?: string;
  steps?: CourseStep[];
  created_at: string;
  updated_at: string;
}

export interface CreateCourseRequest {
  course_name: string;
  type: string;
  tag: string;
  description?: string;
  steps?: CourseStep[];
}

export interface UpdateCourseRequest {
  course_name?: string;
  type?: string;
  tag?: string;
  description?: string;
  steps?: CourseStep[];
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
    updateCourse: builder.mutation<CourseResponse, { id: string; data: UpdateCourseRequest }>({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Course", id }, "Course"],
    }),

    // Delete course
    deleteCourse: builder.mutation<DeleteCourseResponse, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Course", id }, "Course"],
    }),

    // Get course progress
    getCourseProgress: builder.query<CourseProgressResponse, string>({
      query: (course_id) => ({
        url: `/courses/${course_id}/progress`,
        method: "GET",
      }),
      providesTags: (_result, _error, course_id) => [{ type: "CourseProgress", id: course_id }],
    }),

    // Get course completion
    getCourseCompletion: builder.query<CourseCompletionResponse, string>({
      query: (course_id) => ({
        url: `/courses/${course_id}/completion`,
        method: "GET",
      }),
      providesTags: (_result, _error, course_id) => [{ type: "CourseCompletion", id: course_id }],
    }),

    // Mark step as complete
    markStepComplete: builder.mutation<{ success: boolean; data: CourseProgress; message: string }, MarkStepCompleteRequest>({
      query: (data) => ({
        url: "/courses/progress/complete",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { course_id }) => [
        { type: "CourseProgress", id: course_id },
        { type: "CourseCompletion", id: course_id },
      ],
    }),

    // Mark step as incomplete
    markStepIncomplete: builder.mutation<{ success: boolean; data: CourseProgress | null; message: string }, MarkStepCompleteRequest>({
      query: (data) => ({
        url: "/courses/progress/incomplete",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { course_id }) => [
        { type: "CourseProgress", id: course_id },
        { type: "CourseCompletion", id: course_id },
      ],
    }),

    // Check if course is started
    checkCourseStarted: builder.query<{ success: boolean; data: { started: boolean; started_at: string | null }; message: string }, string>({
      query: (course_id) => ({
        url: `/courses/${course_id}/started`,
        method: "GET",
      }),
      providesTags: (_result, _error, course_id) => [{ type: "CourseStarted", id: course_id }],
    }),

    // Get students enrolled in a course (for employers/admins)
    getCourseStudents: builder.query<{ success: boolean; data: CourseStudent[]; message: string }, string>({
      query: (course_id) => ({
        url: `/courses/${course_id}/students`,
        method: "GET",
      }),
      providesTags: (_result, _error, course_id) => [{ type: "CourseStudents", id: course_id }],
    }),

    // Get overall course statistics
    getCourseStatistics: builder.query<{ success: boolean; data: CourseStatistics; message: string }, void>({
      query: () => ({
        url: "/courses/statistics/overview",
        method: "GET",
      }),
      providesTags: ["CourseStatistics"],
    }),

    // Get statistics for a specific course
    getCourseSpecificStatistics: builder.query<{ success: boolean; data: CourseSpecificStatistics; message: string }, string>({
      query: (course_id) => ({
        url: `/courses/${course_id}/statistics`,
        method: "GET",
      }),
      providesTags: (_result, _error, course_id) => [{ type: "CourseStatistics", id: course_id }],
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseProgressQuery,
  useGetCourseCompletionQuery,
  useMarkStepCompleteMutation,
  useMarkStepIncompleteMutation,
  useCheckCourseStartedQuery,
  useGetCourseStudentsQuery,
  useGetCourseStatisticsQuery,
  useGetCourseSpecificStatisticsQuery,
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

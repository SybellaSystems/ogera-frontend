import { apiSlice } from "./apiSlice";

export interface CourseStep {
  step_id?: string;
  step_type: "video" | "link" | "pdf" | "image" | "text";
  step_content: string;
  step_title?: string;
  step_order: number;
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
      providesTags: (result, error, id) => [{ type: "Course", id }],
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
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }, "Course"],
    }),

    // Delete course
    deleteCourse: builder.mutation<DeleteCourseResponse, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Course", id }, "Course"],
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = coursesApi;

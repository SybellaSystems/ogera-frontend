import { apiSlice } from "./apiSlice";

export interface JobCategory {
  category_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  job_count?: number;
  jobCount?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateJobCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  job_count?: number;
}

export interface UpdateJobCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  job_count?: number;
}

export interface JobCategoryResponse {
  success: boolean;
  status: number;
  data: JobCategory;
  message: string;
}

export interface JobCategoriesListResponse {
  success: boolean;
  status: number;
  data: JobCategory[];
  message: string;
}

export interface DeleteCategoryResponse {
  success: boolean;
  status: number;
  data: {
    message: string;
  };
  message: string;
}

export const jobCategoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getAllCategories: builder.query<JobCategoriesListResponse, void>({
      query: () => ({
        url: "/job-categories",
        method: "GET",
      }),
      providesTags: ["JobCategory"],
    }),

    // Get category by ID
    getCategoryById: builder.query<JobCategoryResponse, string>({
      query: (id) => ({
        url: `/job-categories/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "JobCategory", id }],
    }),

    // Create category
    createCategory: builder.mutation<JobCategoryResponse, CreateJobCategoryRequest>({
      query: (categoryData) => ({
        url: "/job-categories",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["JobCategory"],
    }),

    // Update category
    updateCategory: builder.mutation<JobCategoryResponse, { id: string; data: UpdateJobCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `/job-categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "JobCategory", id }, "JobCategory"],
    }),

    // Delete category
    deleteCategory: builder.mutation<DeleteCategoryResponse, string>({
      query: (id) => ({
        url: `/job-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "JobCategory", id }, "JobCategory"],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = jobCategoriesApi;


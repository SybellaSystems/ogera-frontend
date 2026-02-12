import { apiSlice } from "./apiSlice";

export interface StudentReview {
  review_id: string;
  student_id: string;
  employer_id: string;
  application_id: string;
  overall_rating: number;
  communication_rating: number;
  quality_rating: number;
  punctuality_rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
  employer?: {
    user_id: string;
    full_name: string;
    profile_image_url?: string;
  };
  application?: {
    application_id: string;
    job?: {
      job_id: string;
      job_title: string;
    };
  };
}

export interface ReviewableApplication {
  application_id: string;
  student_id: string;
  status: string;
  job?: {
    job_id: string;
    job_title: string;
  };
  student?: {
    user_id: string;
    full_name: string;
    email: string;
    profile_image_url?: string;
  };
}

export interface CreateReviewRequest {
  application_id: string;
  overall_rating: number;
  communication_rating: number;
  quality_rating: number;
  punctuality_rating: number;
  review_text?: string;
}

export interface AverageRating {
  overall_rating: number;
  communication_rating: number;
  quality_rating: number;
  punctuality_rating: number;
  total_reviews: number;
}

export interface ReviewResponse {
  success: boolean;
  status: number;
  data: StudentReview;
  message: string;
}

export interface ReviewsListResponse {
  success: boolean;
  status: number;
  data: StudentReview[];
  message: string;
}

export interface ReviewableApplicationsResponse {
  success: boolean;
  status: number;
  data: ReviewableApplication[];
  message: string;
}

export interface AverageRatingResponse {
  success: boolean;
  status: number;
  data: AverageRating;
  message: string;
}

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a review (employer)
    createReview: builder.mutation<ReviewResponse, CreateReviewRequest>({
      query: (data) => ({
        url: "/reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["JobApplication"],
    }),

    // Get applications that can be reviewed (employer)
    getReviewableApplications: builder.query<ReviewableApplicationsResponse, void>({
      query: () => ({
        url: "/reviews/reviewable",
        method: "GET",
      }),
    }),

    // Get all reviews for a specific student
    getStudentReviews: builder.query<ReviewsListResponse, string>({
      query: (studentId) => ({
        url: `/reviews/student/${studentId}`,
        method: "GET",
      }),
    }),

    // Get my reviews (for students)
    getMyReviews: builder.query<ReviewsListResponse, void>({
      query: () => ({
        url: "/reviews/my-reviews",
        method: "GET",
      }),
    }),

    // Get average rating for a specific student
    getStudentAverageRating: builder.query<AverageRatingResponse, string>({
      query: (studentId) => ({
        url: `/reviews/student/${studentId}/average`,
        method: "GET",
      }),
    }),

    // Get my average rating (for students)
    getMyAverageRating: builder.query<AverageRatingResponse, void>({
      query: () => ({
        url: "/reviews/my-rating",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useGetReviewableApplicationsQuery,
  useGetStudentReviewsQuery,
  useGetMyReviewsQuery,
  useGetStudentAverageRatingQuery,
  useGetMyAverageRatingQuery,
} = reviewApi;

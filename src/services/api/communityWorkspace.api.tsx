import { apiSlice } from "./apiSlice";

/* ============================
   Interfaces
============================ */

export interface StudentLink {
  id: string;
  user_id: string;

  link_type: "github" | "linkedin" | "portfolio" | "other";

  url: string;

  visibility: boolean;

  status: "active" | "inactive";

  created_at: string;
  updated_at: string;
}

export interface PeerReviewStudent {
  id: string;

  user_id: string;

  full_name: string;

  profession?: string;

  profile_image_url?: string | null;

  link_type: "github" | "linkedin" | "portfolio" | "other";

  url: string;
}

export interface PeerReview {
  id: string;

  reviewer_id: string;

  rating: number;

  review: string;

  created_at: string;

  reviewer?: {
    user_id: string;

    full_name: string;

    profile_image_url?: string;
  };
}

export interface SubmitLinkRequest {
  link_type: "github" | "linkedin" | "portfolio" | "other";

  url: string;

  visibility: boolean;
}

export interface SubmitReviewRequest {
  rating: number;

  review: string;
}

/* ============================
   Responses
============================ */

export interface StudentLinkResponse {
  success: boolean;
  status: number;
  message: string;
  data: StudentLink[];
}

export interface FeedResponse {
  success: boolean;

  status: number;

  message: string;

  data: PeerReviewStudent[];
}

export interface ReviewResponse {
  success: boolean;

  status: number;

  message: string;

  data: PeerReview[];
}

/* ============================
   API
============================ */

export const communityWorkspaceApi =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      /* Submit Link */

      submitStudentLink:
        builder.mutation<
          StudentLinkResponse,
          SubmitLinkRequest
        >({
          query: (body) => ({
            url: "/community-workspace/link",
            method: "POST",
            body,
          }),

          invalidatesTags: [
            "CommunityWorkspace",
          ],
        }),

      /* My Link */

      getMyStudentLink:
        builder.query<StudentLinkResponse, void>({
          query: () => ({
            url: "/community-workspace/my-link",

            method: "GET",
          }),

          providesTags: [
            "CommunityWorkspace",
          ],
        }),

      /* Feed */

      getCommunityFeed:
        builder.query<FeedResponse, void>({
          query: () => ({
            url: "/community-workspace/feed",

            method: "GET",
          }),

          providesTags: [
            "CommunityWorkspace",
          ],
        }),

      /* Submit Review */

      submitPeerReview:
        builder.mutation<
          { success: boolean; message: string },
          {
            linkId: string;

            data: SubmitReviewRequest;
          }
        >({
          query: ({ linkId, data }) => ({
            url: `/community-workspace/review/${linkId}`,

            method: "POST",

            body: data,
          }),

          invalidatesTags: [
            "CommunityWorkspace",
          ],
        }),

      /* Review History */

      getReviews:
        builder.query<
          ReviewResponse,
          string
        >({
          query: (linkId) => ({
            url: `/community-workspace/review/${linkId}`,

            method: "GET",
          }),

          providesTags: [
            "CommunityWorkspace",
          ],
        }),

      /* Update Link */

      updateStudentLink:
        builder.mutation<
          StudentLinkResponse,
          {
            id: string;

            data: SubmitLinkRequest;
          }
        >({
          query: ({ id, data }) => ({
            url: `/community-workspace/link/${id}`,

            method: "PUT",

            body: data,
          }),

          invalidatesTags: [
            "CommunityWorkspace",
          ],
        }),

      /* Delete Link */

      deleteStudentLink:
        builder.mutation<
          { success: boolean; message: string },
          string
        >({
          query: (id) => ({
            url: `/community-workspace/link/${id}`,

            method: "DELETE",
          }),

          invalidatesTags: [
            "CommunityWorkspace",
          ],
        }),
    }),
  });

export const {
  useSubmitStudentLinkMutation,
  useGetMyStudentLinkQuery,
  useGetCommunityFeedQuery,
  useSubmitPeerReviewMutation,
  useGetReviewsQuery,
  useUpdateStudentLinkMutation,
  useDeleteStudentLinkMutation,
} = communityWorkspaceApi;
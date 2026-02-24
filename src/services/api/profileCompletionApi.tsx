import { apiSlice } from "./apiSlice";

export interface WizardStep {
  step: number;
  title: string;
  description: string;
  field: string;
  icon: string;
}

export interface Badge {
  badge_id: string;
  name: string;
  description: string;
  icon_url: string | null;
  badge_type: string;
  color: string;
  UserBadge?: {
    awarded_at: string;
    awarded_reason: string;
  };
}

export interface ProfileCompletionResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    profile_completion_percentage: number;
    is_complete: boolean;
    profile_completed_at: string | null;
    missingFields: string[];
    completedFields: string[];
    badges: Badge[];
    wizardSteps: WizardStep[];
    profile_image_url: string | null;
  };
}

export interface UpdateProfileImageResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    profile_image_url: string;
    profile_completion_percentage: number;
    missingFields: string[];
    completedFields: string[];
  };
}

export const profileCompletionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get profile completion status
    getProfileCompletion: builder.query<ProfileCompletionResponse, void>({
      query: () => ({
        url: "/profile/completion",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Update profile image
    updateProfileImage: builder.mutation<UpdateProfileImageResponse, { profile_image_url: string }>({
      query: (data) => ({
        url: "/profile/image",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetProfileCompletionQuery,
  useUpdateProfileImageMutation,
} = profileCompletionApi;

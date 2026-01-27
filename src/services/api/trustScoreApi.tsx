import { apiSlice } from "./apiSlice";

export interface TrustScoreBreakdown {
  email_verification_score: number;
  phone_verification_score: number;
  academic_verification_score: number;
  total_score: number;
}

export interface TrustScore {
  user_id: string;
  trust_score: number;
  email_verified: boolean;
  phone_verified: boolean;
  academic_verified: boolean;
  breakdown: TrustScoreBreakdown;
  level: "Limited" | "Emerging" | "Developing" | "Competent" | "Exceptional";
  description: string;
}

export interface TrustScoreResponse {
  success: boolean;
  status: number;
  data: TrustScore;
  message: string;
}

export const trustScoreApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyTrustScore: builder.query<TrustScoreResponse, void>({
      query: () => ({
        url: "/trust-score/me",
        method: "GET",
      }),
      providesTags: ["User", "TrustScore"],
    }),

    getUserTrustScore: builder.query<TrustScoreResponse, string>({
      query: (user_id) => ({
        url: `/trust-score/${user_id}`,
        method: "GET",
      }),
      providesTags: ["User", "TrustScore"],
    }),
  }),
});

export const {
  useGetMyTrustScoreQuery,
  useLazyGetUserTrustScoreQuery,
} = trustScoreApi;


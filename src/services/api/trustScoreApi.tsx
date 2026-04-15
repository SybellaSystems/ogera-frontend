import { apiSlice } from "./apiSlice";

export type TrustLevel =
  | "Limited"
  | "Emerging"
  | "Developing"
  | "Competent"
  | "Exceptional";

export interface TrustScore {
  user_id: string;
  trust_score: number;
  intelligence_score: number;
  experience_score: number;
  interaction_score: number;
  intelligence_percent: number;
  experience_percent: number;
  interaction_percent: number;
  level: TrustLevel;
  description: string;
  suggestions: string[];
  source: "cached" | "computed";
}

export interface TrustScoreResponse {
  success: boolean;
  status: number;
  data: TrustScore;
  message: string;
}

export interface LeaderboardStudentRow {
  user_id: string;
  full_name: string;
  email: string;
  trust_score: number | null;
  trust_level: string | null;
}

export interface LeaderboardResponse {
  success: boolean;
  status: number;
  data: { leaderboard: LeaderboardStudentRow[] };
  message: string;
}

export interface TrustAdminSummary {
  average_trust_score: number | null;
  students_with_score: number;
  top_users: LeaderboardStudentRow[];
  distribution: { label: string; min: number; max: number; count: number }[];
}

export interface TrustHistoryResponse {
  success: boolean;
  status: number;
  data: {
    user_id: string;
    history: Array<{
      history_id: string;
      user_id: string;
      intelligence_score: number | null;
      experience_score: number | null;
      interaction_score: number | null;
      trust_score: number | null;
      trust_level: string | null;
      computed_at: string;
    }>;
  };
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

    calculateTrustScore: builder.mutation<TrustScoreResponse, string>({
      query: (user_id) => ({
        url: `/trust-score/calculate/${user_id}`,
        method: "POST",
      }),
      invalidatesTags: ["TrustScore", "User"],
    }),

    getStudentLeaderboard: builder.query<LeaderboardResponse, number | void>({
      query: (limit = 20) => ({
        url: `/trust-score/leaderboard/students`,
        method: "GET",
        params: { limit },
      }),
      providesTags: ["TrustScore"],
    }),

    getAdminTrustSummary: builder.query<
      { success: boolean; status: number; data: TrustAdminSummary; message: string },
      void
    >({
      query: () => ({
        url: `/trust-score/admin/summary`,
        method: "GET",
      }),
      providesTags: ["TrustScore"],
    }),

    getTrustHistory: builder.query<
      TrustHistoryResponse,
      { userId: string; limit?: number }
    >({
      query: ({ userId, limit = 20 }) => ({
        url: `/trust-score/history/${userId}`,
        method: "GET",
        params: { limit },
      }),
      providesTags: ["TrustScore"],
    }),
  }),
});

export const {
  useGetMyTrustScoreQuery,
  useLazyGetUserTrustScoreQuery,
  useCalculateTrustScoreMutation,
  useGetStudentLeaderboardQuery,
  useGetAdminTrustSummaryQuery,
  useGetTrustHistoryQuery,
} = trustScoreApi;

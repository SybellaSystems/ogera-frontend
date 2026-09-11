import { apiSlice } from "./apiSlice";

export type ProblemMetricCategory =
  | "visual_puzzle"
  | "situational_puzzle"
  | "riddle"
  | "other";

export type ProblemQuestionDifficulty = "easy" | "medium" | "hard";

export interface ProblemMetricSummary {
  problem_metric_id: string;
  title: string;
  description?: string | null;
  category: ProblemMetricCategory;
  published: boolean;
  created_by?: string | null;
  question_count: number;
  updated_at: string;
  created_at: string;
}

export interface ProblemMetricQuestion {
  question_id: string;
  problem_metric_id: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: number;
  difficulty: ProblemQuestionDifficulty;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProblemMetricDetail extends Omit<ProblemMetricSummary, "question_count"> {
  questions: ProblemMetricQuestion[];
}

export interface PublishedProblemMetricSummary {
  problem_metric_id: string;
  title: string;
  description?: string | null;
  category: ProblemMetricCategory;
  question_count: number;
  updated_at: string;
}

export interface ProblemMetricAttemptHistoryItem {
  test_id: string;
  problem_metric_id: string;
  title: string;
  category: ProblemMetricCategory;
  score: number;
  max_score: number;
  percentage: number;
  taken_at: string;
}

export interface TakeProblemMetricQuestion {
  question_id: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: ProblemQuestionDifficulty;
  sort_order: number;
}

export interface TakeProblemMetricPayload {
  problem_metric_id: string;
  title: string;
  description?: string | null;
  category: ProblemMetricCategory;
  questions: TakeProblemMetricQuestion[];
}

export interface ProblemMetricsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type Wrapped<T> = {
  success: boolean;
  status: number;
  data: T;
  message: string;
  pagination?: ProblemMetricsPagination;
};

export const problemMetricApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listProblemMetricsAdmin: builder.query<
      Wrapped<ProblemMetricSummary[]>,
      { category?: ProblemMetricCategory; search?: string; page?: number; limit?: number } | undefined
    >({
      query: (params) => ({
        url: "/problem-metrics",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: ["ProblemMetric"],
    }),
    getProblemMetricAdmin: builder.query<Wrapped<ProblemMetricDetail>, string>({
      query: (id) => ({ url: `/problem-metrics/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "ProblemMetric", id }],
    }),
    createProblemMetric: builder.mutation<
      Wrapped<ProblemMetricDetail>,
      { title: string; description?: string; category?: ProblemMetricCategory }
    >({
      query: (body) => ({ url: "/problem-metrics", method: "POST", body }),
      invalidatesTags: ["ProblemMetric"],
    }),
    updateProblemMetric: builder.mutation<
      Wrapped<ProblemMetricDetail>,
      {
        id: string;
        body: Partial<{
          title: string;
          description: string | null;
          category: ProblemMetricCategory;
          published: boolean;
        }>;
      }
    >({
      query: ({ id, body }) => ({
        url: `/problem-metrics/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "ProblemMetric", id }, "ProblemMetric"],
    }),
    deleteProblemMetric: builder.mutation<Wrapped<{ deleted: boolean }>, string>({
      query: (id) => ({ url: `/problem-metrics/${id}`, method: "DELETE" }),
      invalidatesTags: ["ProblemMetric"],
    }),
    addProblemMetricQuestion: builder.mutation<
      Wrapped<ProblemMetricDetail>,
      {
        testId: string;
        body: {
          prompt: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_index: number;
          difficulty?: ProblemQuestionDifficulty;
        };
      }
    >({
      query: ({ testId, body }) => ({
        url: `/problem-metrics/${testId}/questions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: "ProblemMetric", id: testId }, "ProblemMetric"],
    }),
    updateProblemMetricQuestion: builder.mutation<
      Wrapped<ProblemMetricDetail>,
      {
        testId: string;
        questionId: string;
        body: Partial<{
          prompt: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_index: number;
          difficulty: ProblemQuestionDifficulty;
          sort_order: number;
        }>;
      }
    >({
      query: ({ testId, questionId, body }) => ({
        url: `/problem-metrics/${testId}/questions/${questionId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: "ProblemMetric", id: testId }, "ProblemMetric"],
    }),
    deleteProblemMetricQuestion: builder.mutation<
      Wrapped<ProblemMetricDetail>,
      { testId: string; questionId: string }
    >({
      query: ({ testId, questionId }) => ({
        url: `/problem-metrics/${testId}/questions/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: "ProblemMetric", id: testId }, "ProblemMetric"],
    }),
    listPublishedProblemMetrics: builder.query<Wrapped<PublishedProblemMetricSummary[]>, void>({
      query: () => ({ url: "/problem-metrics/published", method: "GET" }),
      providesTags: ["ProblemMetric"],
    }),
    getMyProblemMetricAttemptHistory: builder.query<Wrapped<ProblemMetricAttemptHistoryItem[]>, void>({
      query: () => ({ url: "/problem-metrics/published/my-attempts", method: "GET" }),
      providesTags: ["ProblemMetric"],
    }),
    getPublishedProblemMetric: builder.query<Wrapped<TakeProblemMetricPayload>, string>({
      query: (id) => ({ url: `/problem-metrics/published/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "ProblemMetric", id: `pub-${id}` }],
    }),
    submitProblemMetricAttempt: builder.mutation<
      Wrapped<{
        score: number;
        max_score: number;
        percentage: number;
        problem_metric_id: string;
        title: string;
      }>,
      { testId: string; answers: Record<string, number> }
    >({
      query: ({ testId, answers }) => ({
        url: `/problem-metrics/published/${testId}/submit`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["TrustScore", "ProblemMetric"],
    }),
  }),
});

export const {
  useListProblemMetricsAdminQuery,
  useGetProblemMetricAdminQuery,
  useCreateProblemMetricMutation,
  useUpdateProblemMetricMutation,
  useDeleteProblemMetricMutation,
  useAddProblemMetricQuestionMutation,
  useUpdateProblemMetricQuestionMutation,
  useDeleteProblemMetricQuestionMutation,
  useListPublishedProblemMetricsQuery,
  useGetMyProblemMetricAttemptHistoryQuery,
  useGetPublishedProblemMetricQuery,
  useSubmitProblemMetricAttemptMutation,
} = problemMetricApi;

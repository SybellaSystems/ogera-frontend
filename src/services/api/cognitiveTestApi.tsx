import { apiSlice } from "./apiSlice";

export type CognitiveCategory = "numerical" | "verbal" | "logical" | "mixed";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface CognitiveTestSummary {
  cognitive_test_id: string;
  title: string;
  description?: string | null;
  category: CognitiveCategory;
  published: boolean;
  created_by?: string | null;
  question_count: number;
  updated_at: string;
  created_at: string;
}

export interface CognitiveQuestion {
  question_id: string;
  cognitive_test_id: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: number;
  difficulty: QuestionDifficulty;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CognitiveTestDetail extends Omit<CognitiveTestSummary, "question_count"> {
  questions: CognitiveQuestion[];
}

export interface PublishedTestSummary {
  cognitive_test_id: string;
  title: string;
  description?: string | null;
  category: CognitiveCategory;
  question_count: number;
  updated_at: string;
}

export interface CognitiveAttemptHistoryItem {
  test_id: string;
  cognitive_test_id: string;
  title: string;
  category: CognitiveCategory;
  score: number;
  max_score: number;
  percentage: number;
  taken_at: string;
}

export interface TakeTestQuestion {
  question_id: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: QuestionDifficulty;
  sort_order: number;
}

export interface TakeTestPayload {
  cognitive_test_id: string;
  title: string;
  description?: string | null;
  category: CognitiveCategory;
  questions: TakeTestQuestion[];
}

type Wrapped<T> = { success: boolean; status: number; data: T; message: string };

export const cognitiveTestApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listCognitiveTestsAdmin: builder.query<Wrapped<CognitiveTestSummary[]>, void>({
      query: () => ({ url: "/cognitive-tests", method: "GET" }),
      providesTags: ["CognitiveTest"],
    }),
    getCognitiveTestAdmin: builder.query<Wrapped<CognitiveTestDetail>, string>({
      query: (id) => ({ url: `/cognitive-tests/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "CognitiveTest", id }],
    }),
    createCognitiveTest: builder.mutation<
      Wrapped<CognitiveTestDetail>,
      { title: string; description?: string; category?: CognitiveCategory }
    >({
      query: (body) => ({ url: "/cognitive-tests", method: "POST", body }),
      invalidatesTags: ["CognitiveTest"],
    }),
    updateCognitiveTest: builder.mutation<
      Wrapped<CognitiveTestDetail>,
      {
        id: string;
        body: Partial<{
          title: string;
          description: string | null;
          category: CognitiveCategory;
          published: boolean;
        }>;
      }
    >({
      query: ({ id, body }) => ({
        url: `/cognitive-tests/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "CognitiveTest", id }, "CognitiveTest"],
    }),
    deleteCognitiveTest: builder.mutation<Wrapped<{ deleted: boolean }>, string>({
      query: (id) => ({ url: `/cognitive-tests/${id}`, method: "DELETE" }),
      invalidatesTags: ["CognitiveTest"],
    }),
    addCognitiveQuestion: builder.mutation<
      Wrapped<CognitiveTestDetail>,
      {
        testId: string;
        body: {
          prompt: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_index: number;
          difficulty?: QuestionDifficulty;
        };
      }
    >({
      query: ({ testId, body }) => ({
        url: `/cognitive-tests/${testId}/questions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: "CognitiveTest", id: testId }, "CognitiveTest"],
    }),
    updateCognitiveQuestion: builder.mutation<
      Wrapped<CognitiveTestDetail>,
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
          difficulty: QuestionDifficulty;
          sort_order: number;
        }>;
      }
    >({
      query: ({ testId, questionId, body }) => ({
        url: `/cognitive-tests/${testId}/questions/${questionId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: "CognitiveTest", id: testId }, "CognitiveTest"],
    }),
    deleteCognitiveQuestion: builder.mutation<
      Wrapped<CognitiveTestDetail>,
      { testId: string; questionId: string }
    >({
      query: ({ testId, questionId }) => ({
        url: `/cognitive-tests/${testId}/questions/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: "CognitiveTest", id: testId }, "CognitiveTest"],
    }),
    listPublishedCognitiveTests: builder.query<Wrapped<PublishedTestSummary[]>, void>({
      query: () => ({ url: "/cognitive-tests/published", method: "GET" }),
      providesTags: ["CognitiveTest"],
    }),
    getMyCognitiveAttemptHistory: builder.query<Wrapped<CognitiveAttemptHistoryItem[]>, void>({
      query: () => ({ url: "/cognitive-tests/published/my-attempts", method: "GET" }),
      providesTags: ["CognitiveTest"],
    }),
    getPublishedCognitiveTest: builder.query<Wrapped<TakeTestPayload>, string>({
      query: (id) => ({ url: `/cognitive-tests/published/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "CognitiveTest", id: `pub-${id}` }],
    }),
    submitCognitiveAttempt: builder.mutation<
      Wrapped<{
        score: number;
        max_score: number;
        percentage: number;
        cognitive_test_id: string;
        title: string;
      }>,
      { testId: string; answers: Record<string, number> }
    >({
      query: ({ testId, answers }) => ({
        url: `/cognitive-tests/published/${testId}/submit`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["TrustScore", "CognitiveTest"],
    }),
  }),
});

export const {
  useListCognitiveTestsAdminQuery,
  useGetCognitiveTestAdminQuery,
  useCreateCognitiveTestMutation,
  useUpdateCognitiveTestMutation,
  useDeleteCognitiveTestMutation,
  useAddCognitiveQuestionMutation,
  useUpdateCognitiveQuestionMutation,
  useDeleteCognitiveQuestionMutation,
  useListPublishedCognitiveTestsQuery,
  useGetMyCognitiveAttemptHistoryQuery,
  useGetPublishedCognitiveTestQuery,
  useSubmitCognitiveAttemptMutation,
} = cognitiveTestApi;

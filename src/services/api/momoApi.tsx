import { apiSlice } from "./apiSlice";

export interface FundJobRequest {
  jobId: string;
  payerPartyId?: string;
}

export interface FundJobResponse {
  success: boolean;
  message?: string;
  data?: {
    referenceId: string;
    totalAmount: number;
    currency: string;
  };
}

export interface MoMoStatusResponse {
  success: boolean;
  data?: {
    status?: string;
    financialTransactionId?: string;
    reason?: { code: string; message: string };
  };
}

export interface JobPaymentItem {
  job_id: string;
  job_title: string;
  budget: number;
  funding_status: string;
  momo_reference_id: string | null;
  momo_paid_at: string | null;
  employer?: { user_id: string; full_name: string; email?: string; mobile_number?: string };
}

export const momoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fundJob: builder.mutation<FundJobResponse, FundJobRequest>({
      query: (body) => ({
        url: "/momo/fund-job",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Job"],
    }),
    getMoMoStatus: builder.query<MoMoStatusResponse, string>({
      query: (referenceId) => ({
        url: `/momo/status/${referenceId}`,
        method: "GET",
      }),
    }),
    listJobPayments: builder.query<{ success: boolean; data: JobPaymentItem[] }, void>({
      query: () => ({
        url: "/momo/admin/payments",
        method: "GET",
      }),
      providesTags: ["MoMoPayments"],
    }),
  }),
});

export const {
  useFundJobMutation,
  useLazyGetMoMoStatusQuery,
  useGetMoMoStatusQuery,
  useListJobPaymentsQuery,
} = momoApi;

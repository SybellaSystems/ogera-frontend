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
  disbursement_reference_id?: string | null;
  paid_at?: string | null;
  /** Amount actually sent to student (90% of employer payment). */
  amount_paid_to_student?: number | null;
  employer?: { user_id: string; full_name: string; email?: string; mobile_number?: string };
}

export interface WalletBalanceResponse {
  success: boolean;
  data?: { availableBalance: string; currency: string };
}

export interface ApproveWorkAndPayRequest {
  jobId: string;
}

export interface ApproveWorkAndPayResponse {
  success: boolean;
  message?: string;
  data?: { referenceId: string; amount: number };
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
    getWalletBalance: builder.query<WalletBalanceResponse, void>({
      query: () => ({
        url: "/momo/admin/wallet-balance",
        method: "GET",
      }),
      providesTags: ["MoMoPayments"],
    }),
    approveWorkAndPay: builder.mutation<ApproveWorkAndPayResponse, ApproveWorkAndPayRequest>({
      query: (body) => ({
        url: "/momo/approve-work-and-pay",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Job", "MoMoPayments"],
    }),
  }),
});

export const {
  useFundJobMutation,
  useLazyGetMoMoStatusQuery,
  useGetMoMoStatusQuery,
  useListJobPaymentsQuery,
  useGetWalletBalanceQuery,
  useApproveWorkAndPayMutation,
} = momoApi;

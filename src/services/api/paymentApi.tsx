import { apiSlice } from "./apiSlice";

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitPaymentOrder: builder.mutation<
      { success: boolean; data: { redirect_url: string; order_tracking_id: string; merchant_reference: string } },
      { amount: number; currency?: string; description?: string }
    >({
      query: (body) => ({
        url: "/payments/submit-order",
        method: "POST",
        body,
      }),
    }),
    getPaymentStatus: builder.query<
      { success: boolean; data: unknown },
      string
    >({
      query: (orderTrackingId) => ({
        url: `/payments/status/${orderTrackingId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSubmitPaymentOrderMutation,
  useGetPaymentStatusQuery,
  useLazyGetPaymentStatusQuery,
} = paymentApi;

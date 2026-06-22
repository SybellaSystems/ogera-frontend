import { apiSlice } from "./apiSlice";

export type VerificationStatus = {
  email: string;
  mobile_number: string | null;
  email_verified: boolean;
  phone_verified: boolean;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    registerUser: builder.mutation({
      query: (values) => ({
        url: "/auth/register",
        method: "POST",
        body: values,
      }),
    }),

    forgotPassword: builder.mutation({
      query: (values) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: values,
      }),
    }),

    verifyOtp: builder.mutation({
      query: (values) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: values,
      }),
    }),

    resetPassword: builder.mutation({
      query: (values) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: values,
      }),
    }),

    getUserProfile: builder.query({
      query: () => ({
        url: "/auth/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    verifyEmail: builder.mutation<{ data?: VerificationStatus & { success?: boolean } }, string>({
      query: (token) => ({
        // Token contains URL-sensitive characters; always encode.
        url: `/auth/verify-email?token=${encodeURIComponent(token)}`,
        method: "GET",
      }),
      invalidatesTags: (_result, _error, _token) => ["VerificationStatus"],
    }),

    getVerificationStatus: builder.query<{ data: VerificationStatus }, string>({
      query: (email) => ({
        url: `/auth/verification-status?email=${encodeURIComponent(email)}`,
        method: "GET",
      }),
      providesTags: (_result, _error, email) => [
        { type: "VerificationStatus", id: email },
      ],
    }),

    resendVerificationEmail: builder.mutation({
      query: (email) => ({
        url: "/auth/resend-verification-email",
        method: "POST",
        body: { email },
      }),
    }),

    sendPhoneVerificationOTP: builder.mutation<any, { email: string }>({
      query: (values) => ({
        url: "/auth/send-phone-verification-otp",
        method: "POST",
        body: { email: values.email },
      }),
    }),

    verifyPhone: builder.mutation({
      query: (otp) => ({
        url: "/auth/verify-phone",
        method: "POST",
        body: { otp },
      }),
      invalidatesTags: ["User", "TrustScore"],
    }),
    verifyAccount: builder.mutation<any, { email: string; otp: string }>({
      query: (values) => ({
        url: "/auth/verify-account",
        method: "POST",
        body: values,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "VerificationStatus", id: arg.email },
      ],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useGetUserProfileQuery,
  useVerifyEmailMutation,
  useGetVerificationStatusQuery,
  useResendVerificationEmailMutation,
  useSendPhoneVerificationOTPMutation,
  useVerifyPhoneMutation,
  useVerifyAccountMutation,
  useLogoutMutation,
} = authApi;

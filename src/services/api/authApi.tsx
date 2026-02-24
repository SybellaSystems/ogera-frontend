import { apiSlice } from "./apiSlice";

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

    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `/auth/verify-email?token=${token}`,
        method: "GET",
      }),
    }),

    resendVerificationEmail: builder.mutation({
      query: (email) => ({
        url: "/auth/resend-verification-email",
        method: "POST",
        body: { email },
      }),
    }),

    sendPhoneVerificationOTP: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/send-phone-verification-otp",
        method: "POST",
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

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Delete my account
    deleteMyAccount: builder.mutation<
      { success: boolean; status: number; data: { message: string }; message: string },
      { password: string }
    >({
      query: ({ password }) => ({
        url: "/auth/delete-account",
        method: "DELETE",
        body: { password },
      }),
    }),

    // Send email verification OTP
    sendEmailVerificationOTP: builder.mutation({
      query: () => ({
        url: "/auth/send-email-otp",
        method: "POST",
      }),
    }),

    // Verify email OTP
    verifyEmailOTP: builder.mutation({
      query: (otp: string) => ({
        url: "/auth/verify-email-otp",
        method: "POST",
        body: { otp },
      }),
      invalidatesTags: ["User", "TrustScore", "FullProfile"],
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
  useResendVerificationEmailMutation,
  useSendPhoneVerificationOTPMutation,
  useVerifyPhoneMutation,
  useLogoutMutation,
  useDeleteMyAccountMutation,
  useSendEmailVerificationOTPMutation,
  useVerifyEmailOTPMutation,
} = authApi;

import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  forgotPasswordValidation,
  otpValidation,
  resetPasswordValidation,
} from "../validation/Index";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "../services/api/authApi";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

type Step = "forgot-password" | "verify-otp" | "reset-password";

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>("forgot-password");
  const [resetToken, setResetToken] = useState<string | null>(null);

  // API hooks
  const [
    forgotPassword,
    {
      isLoading: isSendingOtp,
      isSuccess: forgotPasswordSuccess,
      isError: forgotPasswordError,
      error: forgotPasswordErrorData,
    },
  ] = useForgotPasswordMutation();

  const [
    verifyOtp,
    {
      isLoading: isVerifyingOtp,
      isSuccess: verifyOtpSuccess,
      isError: verifyOtpError,
      error: verifyOtpErrorData,
    },
  ] = useVerifyOtpMutation();

  const [
    resetPassword,
    {
      isLoading: isResettingPassword,
      isSuccess: resetPasswordSuccess,
      isError: resetPasswordError,
      error: resetPasswordErrorData,
    },
  ] = useResetPasswordMutation();

  // Refs for toast management
  const prevForgotPasswordError = useRef(false);
  const prevForgotPasswordSuccess = useRef(false);
  const prevVerifyOtpError = useRef(false);
  const prevVerifyOtpSuccess = useRef(false);
  const prevResetPasswordError = useRef(false);
  const prevResetPasswordSuccess = useRef(false);

  // Step 1: Forgot Password Form
  const forgotPasswordFormik = useFormik({
    initialValues: { email: userEmail },
    validationSchema: forgotPasswordValidation,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await forgotPassword(values).unwrap();
        const token = (response?.data as any)?.resetToken;
        if (token) {
          setResetToken(token);
          localStorage.setItem("resetToken", token);
        }
        // Manually trigger step change if unwrap succeeds
        // The useEffect will also handle this, but this ensures it happens
        toast.success(response?.message || "OTP sent to your email");
        setCurrentStep("verify-otp");
      } catch (e) {
        // Error handled in useEffect
        console.error("Forgot password error:", e);
      }
    },
  });

  // Step 2: Verify OTP Form
  const verifyOtpFormik = useFormik({
    initialValues: { otp1: "", otp2: "", otp3: "", otp4: "" },
    validationSchema: otpValidation,
    onSubmit: async (values) => {
      const otp = Object.values(values).join("");
      const token = resetToken || localStorage.getItem("resetToken");
      if (!token) {
        toast.error("Reset token not found. Please start over.");
        setCurrentStep("forgot-password");
        return;
      }
      try {
        await verifyOtp({ otp, resetToken: token }).unwrap();
      } catch (e) {
        // Error handled in useEffect
      }
    },
  });

  // Step 3: Reset Password Form
  const resetPasswordFormik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: resetPasswordValidation,
    onSubmit: async (values) => {
      const token = resetToken || localStorage.getItem("resetToken");
      if (!token) {
        toast.error("Reset token not found. Please start over.");
        setCurrentStep("forgot-password");
        return;
      }
      try {
        await resetPassword({
          newPassword: values.newPassword,
          resetToken: token,
        }).unwrap();
      } catch (e) {
        // Error handled in useEffect
      }
    },
  });

  // Handle Step 1: Forgot Password - Error handling
  useEffect(() => {
    if (
      !prevForgotPasswordError.current &&
      forgotPasswordError &&
      forgotPasswordErrorData
    ) {
      const err = forgotPasswordErrorData as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(
        err?.data?.message || "Failed to send OTP. Please try again."
      );
    }

    // Success is handled in onSubmit, but keep this as backup
    if (
      !prevForgotPasswordSuccess.current &&
      forgotPasswordSuccess &&
      currentStep === "forgot-password"
    ) {
      setCurrentStep("verify-otp");
    }

    prevForgotPasswordError.current = forgotPasswordError;
    prevForgotPasswordSuccess.current = forgotPasswordSuccess;
  }, [
    forgotPasswordError,
    forgotPasswordSuccess,
    forgotPasswordErrorData,
    currentStep,
  ]);

  // Handle Step 2: Verify OTP
  useEffect(() => {
    if (!prevVerifyOtpError.current && verifyOtpError && verifyOtpErrorData) {
      const err = verifyOtpErrorData as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(err?.data?.message || "Invalid OTP. Please try again.");
    }

    if (!prevVerifyOtpSuccess.current && verifyOtpSuccess) {
      toast.success("OTP verified successfully");
      setCurrentStep("reset-password");
    }

    prevVerifyOtpError.current = verifyOtpError;
    prevVerifyOtpSuccess.current = verifyOtpSuccess;
  }, [verifyOtpError, verifyOtpSuccess, verifyOtpErrorData]);

  // Handle Step 3: Reset Password
  useEffect(() => {
    if (
      !prevResetPasswordError.current &&
      resetPasswordError &&
      resetPasswordErrorData
    ) {
      const err = resetPasswordErrorData as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(
        err?.data?.message || "Failed to reset password. Please try again."
      );
    }

    if (!prevResetPasswordSuccess.current && resetPasswordSuccess) {
      toast.success("Password changed successfully!");
      localStorage.removeItem("resetToken");
      // Close modal and reset everything
      handleClose();
    }

    prevResetPasswordError.current = resetPasswordError;
    prevResetPasswordSuccess.current = resetPasswordSuccess;
  }, [resetPasswordError, resetPasswordSuccess, resetPasswordErrorData]);

  // Reset modal state when closed
  const handleClose = () => {
    setCurrentStep("forgot-password");
    setResetToken(null);
    forgotPasswordFormik.resetForm();
    verifyOtpFormik.resetForm();
    resetPasswordFormik.resetForm();
    localStorage.removeItem("resetToken");
    onClose();
  };

  // Auto-focus first OTP input
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (value.length > 1) return;

    verifyOtpFormik.setFieldValue(`otp${index + 1}`, value);

    // Auto-focus next input
    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      e.key === "Backspace" &&
      !verifyOtpFormik.values[
        `otp${index + 1}` as keyof typeof verifyOtpFormik.values
      ] &&
      index > 0
    ) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div
              className={`flex-1 h-2 rounded-full ${
                currentStep === "forgot-password"
                  ? "bg-purple-600"
                  : "bg-green-500"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full mx-2 ${
                currentStep === "verify-otp"
                  ? "bg-purple-600"
                  : currentStep === "reset-password"
                  ? "bg-green-500"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                currentStep === "reset-password"
                  ? "bg-purple-600"
                  : "bg-gray-200"
              }`}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span
              className={
                currentStep === "forgot-password"
                  ? "text-purple-600 font-semibold"
                  : ""
              }
            >
              Send OTP
            </span>
            <span
              className={
                currentStep === "verify-otp"
                  ? "text-purple-600 font-semibold"
                  : ""
              }
            >
              Verify OTP
            </span>
            <span
              className={
                currentStep === "reset-password"
                  ? "text-purple-600 font-semibold"
                  : ""
              }
            >
              New Password
            </span>
          </div>
        </div>

        {/* Step 1: Forgot Password */}
        {currentStep === "forgot-password" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Change Password
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              We'll send a verification code to your email to confirm your
              identity.
            </p>

            <form onSubmit={forgotPasswordFormik.handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your registered email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotPasswordFormik.values.email}
                  onChange={forgotPasswordFormik.handleChange}
                  onBlur={forgotPasswordFormik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                {forgotPasswordFormik.touched.email &&
                  forgotPasswordFormik.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {forgotPasswordFormik.errors.email}
                    </p>
                  )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingOtp ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {currentStep === "verify-otp" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verify OTP
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Enter the 4-digit code sent to {forgotPasswordFormik.values.email}
            </p>

            <form onSubmit={verifyOtpFormik.handleSubmit}>
              <div className="mb-6">
                <div className="flex gap-3 justify-center">
                  {[1, 2, 3, 4].map((num, index) => (
                    <input
                      key={num}
                      ref={otpInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={
                        verifyOtpFormik.values[
                          `otp${num}` as keyof typeof verifyOtpFormik.values
                        ] || ""
                      }
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-14 h-14 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    />
                  ))}
                </div>
                {(verifyOtpFormik.touched.otp1 ||
                  verifyOtpFormik.touched.otp2 ||
                  verifyOtpFormik.touched.otp3 ||
                  verifyOtpFormik.touched.otp4) &&
                  (verifyOtpFormik.errors.otp1 ||
                    verifyOtpFormik.errors.otp2 ||
                    verifyOtpFormik.errors.otp3 ||
                    verifyOtpFormik.errors.otp4) && (
                    <p className="mt-2 text-sm text-red-600 text-center">
                      Please enter all 4 digits
                    </p>
                  )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep("forgot-password");
                    verifyOtpFormik.resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {currentStep === "reset-password" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Set New Password
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Create a strong password for your account.
            </p>

            <form onSubmit={resetPasswordFormik.handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={resetPasswordFormik.values.newPassword}
                  onChange={resetPasswordFormik.handleChange}
                  onBlur={resetPasswordFormik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                {resetPasswordFormik.touched.newPassword &&
                  resetPasswordFormik.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {resetPasswordFormik.errors.newPassword}
                    </p>
                  )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={resetPasswordFormik.values.confirmPassword}
                  onChange={resetPasswordFormik.handleChange}
                  onBlur={resetPasswordFormik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                {resetPasswordFormik.touched.confirmPassword &&
                  resetPasswordFormik.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {resetPasswordFormik.errors.confirmPassword}
                    </p>
                  )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep("verify-otp");
                    resetPasswordFormik.resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResettingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;

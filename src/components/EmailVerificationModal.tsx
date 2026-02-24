import React, { useState } from "react";
import {
  useSendEmailVerificationOTPMutation,
  useVerifyEmailOTPMutation,
} from "../services/api/authApi";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { XMarkIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  email?: string;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
}) => {
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [sentOtp, setSentOtp] = useState<string | null>(null);

  const [sendOTP, { isLoading: isSendingOTP }] =
    useSendEmailVerificationOTPMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailOTPMutation();

  const handleSendOTP = async () => {
    try {
      const result = await sendOTP(undefined as any).unwrap();
      toast.success("Verification code sent to your email!");

      // In development, show the OTP if available
      if (
        result &&
        typeof result === "object" &&
        "data" in result &&
        result.data &&
        typeof result.data === "object" &&
        "otp" in result.data &&
        result.data.otp &&
        import.meta.env.DEV
      ) {
        setSentOtp(String(result.data.otp));
        toast(`Development Mode: Your code is ${result.data.otp}`, {
          duration: 10000,
        });
      }

      setStep("verify");
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to send verification code");
    }
  };

  const handleVerifyEmail = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      await verifyEmail(otp).unwrap();
      toast.success("Email verified successfully!");
      setStep("request");
      setOtp("");
      setSentOtp(null);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to verify email");
    }
  };

  const handleClose = () => {
    setStep("request");
    setOtp("");
    setSentOtp(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5 text-white" />
              <h2 className="text-base font-bold text-white">Verify Email</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {step === "request" ? (
            <>
              {/* Request OTP Step */}
              <p className="text-xs text-gray-600">
                We'll send a 6-digit verification code to:
              </p>
              {email && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900 truncate">
                    {email}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Click below to receive your verification code via email.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendOTP}
                  disabled={isSendingOTP}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSendingOTP ? "Sending..." : "Send Code"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Verify OTP Step */}
              <p className="text-xs text-gray-600">
                Enter the 6-digit code sent to:
              </p>
              {email && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900 truncate">
                    {email}
                  </p>
                </div>
              )}

              {sentOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-xs text-yellow-800">
                    <strong>Dev Mode:</strong> Code is {sentOtp}
                  </p>
                </div>
              )}

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-center text-lg font-semibold tracking-widest"
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center">
                Didn't receive it?{" "}
                <button
                  onClick={handleSendOTP}
                  disabled={isSendingOTP}
                  className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 cursor-pointer"
                >
                  Resend
                </button>
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setStep("request");
                    setOtp("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyEmail}
                  disabled={isVerifying || otp.length !== 6}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;

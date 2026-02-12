import React, { useState } from "react";
import {
  useSendPhoneVerificationOTPMutation,
  useVerifyPhoneMutation,
} from "../services/api/authApi";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  phoneNumber?: string;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber,
}) => {
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [sentOtp, setSentOtp] = useState<string | null>(null);

  const [sendOTP, { isLoading: isSendingOTP }] =
    useSendPhoneVerificationOTPMutation();
  const [verifyPhone, { isLoading: isVerifying }] = useVerifyPhoneMutation();

  const handleSendOTP = async () => {
    try {
      const result = await sendOTP().unwrap();
      toast.success("OTP sent successfully!");
      
      // In development, show the OTP if available
      if (result && typeof result === 'object' && 'data' in result && result.data && typeof result.data === 'object' && 'otp' in result.data && result.data.otp && import.meta.env.DEV) {
        setSentOtp(String(result.data.otp));
        toast(`Development Mode: Your OTP is ${result.data.otp}`, {
          duration: 10000,
        });
      }
      
      setStep("verify");
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyPhone = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      await verifyPhone(otp).unwrap();
      toast.success("Phone number verified successfully!");
      setStep("request");
      setOtp("");
      setSentOtp(null);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to verify phone number");
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
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Verify Phone Number
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {step === "request" ? (
          <>
            {/* Request OTP Step */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                We'll send a verification code to your phone number:
              </p>
              {phoneNumber && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-lg font-semibold text-purple-900">
                    {phoneNumber}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Click the button below to receive your verification code via SMS.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOTP}
                disabled={isSendingOTP}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingOTP ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Verify OTP Step */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Enter the 6-digit verification code sent to:
              </p>
              {phoneNumber && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-lg font-semibold text-purple-900">
                    {phoneNumber}
                  </p>
                </div>
              )}

              {sentOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Development Mode:</strong> Your OTP is {sentOtp}
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-center text-2xl font-semibold tracking-widest"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Didn't receive the code?{" "}
                <button
                  onClick={handleSendOTP}
                  disabled={isSendingOTP}
                  className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                >
                  Resend
                </button>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("request");
                  setOtp("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={handleVerifyPhone}
                disabled={isVerifying || otp.length !== 6}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhoneVerificationModal;


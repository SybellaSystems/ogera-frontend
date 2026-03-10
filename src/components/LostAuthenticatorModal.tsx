import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  sendLostAuthenticatorOTP,
  verifyLostAuthenticatorOTPAndDisable2FA,
  setup2FAWithToken,
  verify2FAWithToken,
} from "../services/api/twoFactorApi";
import { useNavigate } from "react-router-dom";

interface LostAuthenticatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userPassword: string;
}

type Step = "send-otp" | "verify-otp" | "2fa-disabled" | "setup-2fa" | "verify-new-2fa";

const LostAuthenticatorModal: React.FC<LostAuthenticatorModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userPassword: _userPassword,
}) => {
  const [step, setStep] = useState<Step>("send-otp");
  const [emailOtp, setEmailOtp] = useState({ otp1: "", otp2: "", otp3: "", otp4: "" });
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  const otp1Ref = useRef<HTMLInputElement>(null);
  const otp2Ref = useRef<HTMLInputElement>(null);
  const otp3Ref = useRef<HTMLInputElement>(null);
  const otp4Ref = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setStep("send-otp");
      setEmailOtp({ otp1: "", otp2: "", otp3: "", otp4: "" });
      setTwoFactorCode("");
      setRecoveryToken("");
      setSetupToken("");
      setQrCode("");
      setSecret("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "send-otp" && isOpen) {
      handleSendOTP();
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "verify-otp") {
      otp1Ref.current?.focus();
    }
  }, [step]);

  const handleSendOTP = async () => {
    try {
      setSendingOTP(true);
      const result = await sendLostAuthenticatorOTP(userEmail);
      setRecoveryToken(result.data.recoveryToken);
      setStep("verify-otp");
      toast.success("OTP sent to your email");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOTP(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const name = `otp${index + 1}` as keyof typeof emailOtp;
    setEmailOtp((prev) => ({ ...prev, [name]: value }));

    if (value && index < 3) {
      const refs = [otp1Ref, otp2Ref, otp3Ref, otp4Ref];
      refs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !emailOtp[`otp${index + 1}` as keyof typeof emailOtp] && index > 0) {
      const refs = [otp1Ref, otp2Ref, otp3Ref, otp4Ref];
      refs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 4);
    if (pastedData.length === 4) {
      setEmailOtp({
        otp1: pastedData[0],
        otp2: pastedData[1],
        otp3: pastedData[2],
        otp4: pastedData[3],
      });
      otp4Ref.current?.focus();
    }
  };

  const handleVerifyEmailOTP = async () => {
    const otp = Object.values(emailOtp).join("");
    if (otp.length !== 4) {
      toast.error("Please enter all 4 digits");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyLostAuthenticatorOTPAndDisable2FA(otp, recoveryToken);
      setSetupToken(result.data.setupToken);
      toast.success("2FA disabled successfully");
      setStep("2fa-disabled");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupNew2FA = async () => {
    try {
      setLoading(true);
      const result = await setup2FAWithToken(setupToken);
      setQrCode(result.data.qrCode);
      setSecret(result.data.secret);
      setStep("setup-2fa");
      toast.success("Scan the QR code with your authenticator app");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNew2FA = async () => {
    if (!twoFactorCode.trim() || twoFactorCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    try {
      setLoading(true);
      await verify2FAWithToken(setupToken, twoFactorCode.trim());
      toast.success("2FA setup complete! Redirecting to login...");
      
      // Navigate to login page
      onClose();
      navigate("/auth/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Lost Authenticator Recovery</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {step === "send-otp" && (
          <div>
            <p className="text-gray-600 mb-4">
              Sending OTP to {userEmail}...
            </p>
            {sendingOTP && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            )}
          </div>
        )}

        {step === "verify-otp" && (
          <div>
            <p className="text-gray-600 mb-4">
              Enter the 4-digit code sent to {userEmail}
            </p>
            <div className="flex gap-3 justify-center mb-4">
              {[1, 2, 3, 4].map((num, index) => (
                <input
                  key={num}
                  ref={index === 0 ? otp1Ref : index === 1 ? otp2Ref : index === 2 ? otp3Ref : otp4Ref}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={emailOtp[`otp${num}` as keyof typeof emailOtp] || ""}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handleOtpPaste}
                  className="w-14 h-14 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleVerifyEmailOTP}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                onClick={handleSendOTP}
                disabled={sendingOTP}
                className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50"
              >
                Resend
              </button>
            </div>
          </div>
        )}

        {step === "2fa-disabled" && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-semibold mb-2">✓ 2FA Disabled Successfully</p>
              <p className="text-green-700 text-sm">
                Your old 2FA has been disabled. Please set up a new 2FA to secure your account.
              </p>
            </div>
            <button
              onClick={handleSetupNew2FA}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Setting up..." : "Setup New 2FA"}
            </button>
          </div>
        )}

        {step === "setup-2fa" && (
          <div>
            <p className="text-gray-600 mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code" className="border-2 border-gray-300 rounded-lg" />
              </div>
            )}
            {secret && (
              <p className="text-sm text-gray-500 mb-4 text-center">
                Or enter this secret manually: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
              </p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code from authenticator
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-center text-lg font-semibold tracking-widest"
              />
            </div>
            <button
              onClick={handleVerifyNew2FA}
              disabled={loading || twoFactorCode.length !== 6}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Complete Setup"}
            </button>
          </div>
        )}

        {step === "verify-new-2fa" && (
          <div>
            <p className="text-gray-600 mb-4">Logging you in...</p>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LostAuthenticatorModal;

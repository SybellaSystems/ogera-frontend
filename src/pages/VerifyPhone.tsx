import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  useSendPhoneVerificationOTPMutation,
  useVerifyPhoneMutation,
} from "../services/api/authApi";
import { setUser } from "../features/auth/authSlice";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { styled } from "@mui/material/styles";
import { useTheme } from "../context/ThemeContext";
import { useRetryLimit } from "../hooks/useRetryLimit";
import { logVerificationEvent, AUDIT_ACTIONS } from "../utils/verificationAudit";

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const VerifyPhone: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const user = useSelector((state: any) => state.auth.user);
  const role = useSelector((state: any) => state.auth.role);
  const phoneNumber = user?.mobile_number || user?.phone || "";

  const [step, setStep] = useState<"request" | "verify">("request");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [sendOTP, { isLoading: isSendingOTP }] = useSendPhoneVerificationOTPMutation();
  const [verifyPhone, { isLoading: isVerifying }] = useVerifyPhoneMutation();

  const sendLimiter = useRetryLimit("phone_otp_send");
  const verifyLimiter = useRetryLimit("phone_otp_verify");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    logVerificationEvent(AUDIT_ACTIONS.PHONE_VERIFICATION_PAGE_LOADED, "success", {
      phoneNumber: phoneNumber ? `***${phoneNumber.slice(-4)}` : "unknown",
    });
  }, []);

  const handleSendOTP = async () => {
    if (sendLimiter.isLocked) {
      toast.error(`Too many attempts. Try again in ${formatTime(sendLimiter.lockRemainingSeconds)}.`);
      logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_SEND_LOCKED, "locked");
      return;
    }

    const allowed = sendLimiter.recordAttempt();
    if (!allowed) {
      toast.error("You have been locked out. Please wait 15 minutes.");
      logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_SEND_LOCKED, "locked");
      return;
    }

    logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_SEND_REQUESTED, "success");

    try {
      const result = await sendOTP().unwrap();
      toast.success("OTP sent to your phone!");
      logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_SEND_SUCCESS, "success");

      // Dev mode OTP display
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
        toast(`Development Mode: Your OTP is ${result.data.otp}`, {
          duration: 10000,
        });
      }

      setStep("verify");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to send OTP");
      logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_SEND_FAILED, "failure", {
        error: error?.data?.message,
      });
    }
  };

  const handleVerifyPhone = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (verifyLimiter.isLocked) {
      toast.error(`Too many failed attempts. Try again in ${formatTime(verifyLimiter.lockRemainingSeconds)}.`);
      logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_VERIFY_LOCKED, "locked");
      return;
    }

    const allowed = verifyLimiter.recordAttempt();
    if (!allowed) {
      toast.error("You have been locked out. Please wait 15 minutes.");
      logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_VERIFY_LOCKED, "locked");
      return;
    }

    logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_VERIFY_REQUESTED, "success");

    try {
      await verifyPhone(otpString).unwrap();
      toast.success("Phone number verified successfully!");
      logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_VERIFY_SUCCESS, "success");
      sendLimiter.resetAttempts();
      verifyLimiter.resetAttempts();
      dispatch(setUser({ phone_verified: true }));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to verify phone number");
      logVerificationEvent(AUDIT_ACTIONS.PHONE_OTP_VERIFY_FAILED, "failure", {
        error: error?.data?.message,
      });
      // Clear OTP inputs on failure
      setOtp(["", "", "", "", "", ""]);
      inputRefs[0].current?.focus();
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value && e.target.value) return; // Non-numeric input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs[focusIndex].current?.focus();
    }
  };

  const handleSkip = () => {
    toast("Phone verification skipped. You'll be reminded on your next login.", {
      duration: 4000,
    });
    logVerificationEvent(AUDIT_ACTIONS.PHONE_VERIFICATION_SKIPPED, "success");
    navigate("/dashboard", { replace: true });
  };

  if (!user) return null;

  const isAnyLocked = sendLimiter.isLocked || verifyLimiter.isLocked;
  const activeLockSeconds = Math.max(
    sendLimiter.lockRemainingSeconds,
    verifyLimiter.lockRemainingSeconds
  );

  return (
    <PageContainer
      style={{
        background: isDark
          ? "linear-gradient(180deg, #0f0a1a 0%, #1a1528 50%, #0f0a1a 100%)"
          : "linear-gradient(180deg, #e4daf5 0%, #ede7f8 50%, #f5f0fc 100%)",
      }}
      role="main"
    >
      <Card
        style={{
          backgroundColor: isDark ? "#1e1833" : "#ffffff",
          border: isDark ? "1px solid rgba(45,27,105,0.5)" : "none",
          boxShadow: isDark
            ? "0 8px 30px rgba(0,0,0,0.3)"
            : "0 8px 30px rgba(91, 59, 165, 0.1)",
        }}
        aria-label="Phone verification"
      >
        <Logo />

        {/* Phone icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: isDark
              ? "rgba(45,27,105,0.3)"
              : "rgba(127, 86, 217, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#c084fc" : "#7F56D9"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>

        <Heading style={{ color: isDark ? "#f3f4f6" : "#2d2252" }}>
          Verify Your Phone
        </Heading>

        {step === "request" ? (
          <>
            <Message style={{ color: isDark ? "#d1d5db" : "#6b6580" }}>
              We'll send a 6-digit verification code to your phone number:
            </Message>

            {/* Phone number display */}
            {phoneNumber && (
              <div
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: isDark
                    ? "rgba(45,27,105,0.2)"
                    : "rgba(127, 86, 217, 0.06)",
                  border: isDark
                    ? "1px solid rgba(45,27,105,0.4)"
                    : "1px solid rgba(127, 86, 217, 0.15)",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: isDark ? "#c084fc" : "#7F56D9",
                    fontFamily: "'Nunito', sans-serif",
                    margin: 0,
                    letterSpacing: "0.5px",
                  }}
                >
                  {phoneNumber}
                </p>
              </div>
            )}

            {/* Lockout banner */}
            {sendLimiter.isLocked && (
              <div
                style={{
                  width: "100%",
                  background: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
                  border: isDark
                    ? "1px solid rgba(220,38,38,0.3)"
                    : "1px solid #fecaca",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  boxSizing: "border-box",
                }}
                role="alert"
                aria-live="polite"
              >
                <p
                  style={{
                    color: isDark ? "#fca5a5" : "#b91c1c",
                    fontSize: "13px",
                    fontWeight: 600,
                    fontFamily: "'Nunito', sans-serif",
                    margin: 0,
                  }}
                >
                  Too many send attempts. Please try again in{" "}
                  {formatTime(sendLimiter.lockRemainingSeconds)}.
                </p>
              </div>
            )}

            <SubmitButton
              onClick={handleSendOTP}
              disabled={isSendingOTP || sendLimiter.isLocked}
              aria-label="Send verification code"
            >
              {isSendingOTP ? (
                <>
                  <Spinner />
                  Sending...
                </>
              ) : sendLimiter.isLocked ? (
                `Locked (${formatTime(sendLimiter.lockRemainingSeconds)})`
              ) : (
                "Send Verification Code"
              )}
            </SubmitButton>

            {/* Send attempt counter */}
            {!sendLimiter.isLocked && sendLimiter.attempts > 0 && (
              <p
                style={{
                  color: isDark ? "#9ca3af" : "#6b6580",
                  fontSize: "12px",
                  textAlign: "center",
                  fontFamily: "'Nunito', sans-serif",
                  margin: 0,
                }}
                aria-live="polite"
              >
                {sendLimiter.maxAttempts - sendLimiter.attempts} send attempt(s) remaining
              </p>
            )}
          </>
        ) : (
          <>
            <Message style={{ color: isDark ? "#d1d5db" : "#6b6580" }}>
              Enter the 6-digit code sent to{" "}
              <strong style={{ color: isDark ? "#c084fc" : "#7F56D9" }}>
                {phoneNumber || "your phone"}
              </strong>
            </Message>

            {/* Dev mode OTP display */}
            {sentOtp && import.meta.env.DEV && (
              <div
                style={{
                  width: "100%",
                  background: isDark ? "rgba(234,179,8,0.15)" : "#fefce8",
                  border: isDark
                    ? "1px solid rgba(234,179,8,0.3)"
                    : "1px solid #fef08a",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  boxSizing: "border-box",
                }}
              >
                <p
                  style={{
                    color: isDark ? "#fde047" : "#854d0e",
                    fontSize: "13px",
                    fontFamily: "'Nunito', sans-serif",
                    margin: 0,
                  }}
                >
                  <strong>Dev Mode:</strong> OTP is {sentOtp}
                </p>
              </div>
            )}

            {/* 6-digit OTP inputs */}
            <OtpContainer>
              {otp.map((digit, index) => (
                <OtpInput
                  key={index}
                  ref={inputRefs[index]}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  maxLength={1}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={`Digit ${index + 1} of 6`}
                  style={{
                    backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
                    borderColor: digit
                      ? isDark
                        ? "#c084fc"
                        : "#7F56D9"
                      : isDark
                      ? "rgba(45,27,105,0.5)"
                      : "#ddd0ec",
                    color: isDark ? "#e2e8f0" : "#2d2252",
                  }}
                />
              ))}
            </OtpContainer>

            {/* Verify lockout banner */}
            {verifyLimiter.isLocked && (
              <div
                style={{
                  width: "100%",
                  background: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
                  border: isDark
                    ? "1px solid rgba(220,38,38,0.3)"
                    : "1px solid #fecaca",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  boxSizing: "border-box",
                }}
                role="alert"
                aria-live="polite"
              >
                <p
                  style={{
                    color: isDark ? "#fca5a5" : "#b91c1c",
                    fontSize: "13px",
                    fontWeight: 600,
                    fontFamily: "'Nunito', sans-serif",
                    margin: 0,
                  }}
                >
                  Too many failed attempts. Please try again in{" "}
                  {formatTime(verifyLimiter.lockRemainingSeconds)}.
                </p>
              </div>
            )}

            <SubmitButton
              onClick={handleVerifyPhone}
              disabled={isVerifying || otp.join("").length !== 6 || verifyLimiter.isLocked}
              aria-label="Verify phone number"
            >
              {isVerifying ? (
                <>
                  <Spinner />
                  Verifying...
                </>
              ) : verifyLimiter.isLocked ? (
                `Locked (${formatTime(verifyLimiter.lockRemainingSeconds)})`
              ) : (
                "Verify Phone"
              )}
            </SubmitButton>

            {/* Verify attempt counter */}
            {!verifyLimiter.isLocked && verifyLimiter.attempts > 0 && (
              <p
                style={{
                  color: isDark ? "#9ca3af" : "#6b6580",
                  fontSize: "12px",
                  textAlign: "center",
                  fontFamily: "'Nunito', sans-serif",
                  margin: 0,
                }}
                aria-live="polite"
              >
                {verifyLimiter.maxAttempts - verifyLimiter.attempts} verification attempt(s) remaining
              </p>
            )}

            {/* Resend link */}
            <p
              style={{
                color: isDark ? "#9ca3af" : "#6b6580",
                fontSize: "13px",
                fontFamily: "'Nunito', sans-serif",
                margin: 0,
              }}
            >
              Didn't receive the code?{" "}
              <button
                onClick={handleSendOTP}
                disabled={isSendingOTP || sendLimiter.isLocked}
                style={{
                  background: "none",
                  border: "none",
                  color: isDark ? "#c084fc" : "#7F56D9",
                  fontWeight: 700,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "13px",
                  cursor: sendLimiter.isLocked ? "not-allowed" : "pointer",
                  opacity: sendLimiter.isLocked ? 0.5 : 1,
                  padding: 0,
                  textDecoration: "underline",
                }}
                aria-label="Resend verification code"
              >
                {sendLimiter.isLocked ? "Locked" : "Resend"}
              </button>
            </p>
          </>
        )}

        {/* Skip for now */}
        <button
          onClick={handleSkip}
          style={{
            background: "none",
            border: "none",
            color: isDark ? "#9ca3af" : "#7a7290",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "'Nunito', sans-serif",
            cursor: "pointer",
            padding: "4px 0",
            textDecoration: "underline",
            transition: "color 0.2s",
          }}
          aria-label="Skip phone verification for now"
        >
          Skip for now
        </button>
      </Card>
    </PageContainer>
  );
};

export default VerifyPhone;

/* ——— Styled Components ——— */

const PageContainer = styled("div")({
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Nunito', sans-serif",
  padding: "20px",
});

const Card = styled("div")(({ theme }) => ({
  borderRadius: "20px",
  padding: "36px 32px",
  maxWidth: "440px",
  width: "100%",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  [theme.breakpoints.down("sm")]: {
    padding: "28px 20px",
  },
}));

const Logo = styled("div")({
  background: "linear-gradient(135deg, #7F56D9 0%, #6941C6 100%)",
  height: 42,
  width: 130,
  borderRadius: 10,
  position: "relative",
  marginBottom: "8px",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: 'url("/ogera_logo-removebg-preview.png") no-repeat center center',
    backgroundSize: "80%",
  },
});

const Heading = styled("h1")({
  fontSize: "24px",
  fontWeight: 800,
  fontFamily: "'Nunito', sans-serif",
  lineHeight: 1.2,
});

const Message = styled("p")({
  fontSize: "14px",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 400,
  lineHeight: 1.6,
});

const OtpContainer = styled("div")({
  display: "flex",
  gap: "10px",
  justifyContent: "center",
});

const OtpInput = styled("input")({
  width: "48px",
  height: "52px",
  fontSize: "20px",
  fontWeight: 700,
  fontFamily: "'Nunito', sans-serif",
  textAlign: "center",
  borderRadius: "12px",
  border: "2px solid #ddd0ec",
  outline: "none",
  boxShadow: "0 1px 3px rgba(91, 59, 165, 0.08)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "&:focus": {
    borderColor: "#7F56D9",
    boxShadow: "0 0 0 3px rgba(127, 86, 217, 0.12)",
  },
});

const SubmitButton = styled("button")({
  width: "100%",
  padding: "12px",
  background: "linear-gradient(135deg, #7F56D9 0%, #6941C6 100%)",
  color: "#ffffff",
  border: "none",
  borderRadius: "50px",
  fontSize: "15px",
  fontWeight: 700,
  fontFamily: "'Nunito', sans-serif",
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  "&:hover": {
    background: "linear-gradient(135deg, #6941C6 0%, #5B3BA5 100%)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 15px rgba(127, 86, 217, 0.4)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&:disabled": {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
});

const Spinner = styled("span")({
  width: "18px",
  height: "18px",
  border: "2.5px solid rgba(255,255,255,0.3)",
  borderTopColor: "#ffffff",
  borderRadius: "50%",
  animation: "spin 0.6s linear infinite",
  "@keyframes spin": {
    to: { transform: "rotate(360deg)" },
  },
});

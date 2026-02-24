import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useVerifyEmailMutation, useResendVerificationEmailMutation } from "../services/api/authApi";
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

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Get email from registration redirect or sessionStorage fallback
  const emailFromState = (location.state as any)?.email || "";
  const fromRegistration = (location.state as any)?.fromRegistration || false;

  const [email, setEmail] = useState<string>(() => {
    if (emailFromState) {
      sessionStorage.setItem("verify_email_address", emailFromState);
      return emailFromState;
    }
    return sessionStorage.getItem("verify_email_address") || "";
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [verifyEmail] = useVerifyEmailMutation();
  const [resendEmail, { isLoading: isResending }] = useResendVerificationEmailMutation();

  const {
    attempts,
    maxAttempts,
    isLocked,
    lockRemainingSeconds,
    recordAttempt,
    resetAttempts,
  } = useRetryLimit("email_resend");

  useEffect(() => {
    logVerificationEvent(AUDIT_ACTIONS.EMAIL_VERIFICATION_PAGE_LOADED, "success", {
      hasToken: !!token,
      fromRegistration,
    });
  }, []);

  useEffect(() => {
    if (token) {
      handleVerifyEmail();
    }
  }, [token]);

  const handleVerifyEmail = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      await verifyEmail(token).unwrap();
      setIsVerified(true);
      toast.success("Email verified successfully!");
      logVerificationEvent(AUDIT_ACTIONS.EMAIL_VERIFIED_VIA_TOKEN, "success", {
        token: token.substring(0, 8) + "...",
      });
      resetAttempts();
      sessionStorage.removeItem("verify_email_address");
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to verify email");
      logVerificationEvent(AUDIT_ACTIONS.EMAIL_TOKEN_VERIFICATION_FAILED, "failure", {
        error: error?.data?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (isLocked) {
      toast.error(`Too many attempts. Try again in ${formatTime(lockRemainingSeconds)}.`);
      logVerificationEvent(AUDIT_ACTIONS.EMAIL_RESEND_LOCKED, "locked", { email });
      return;
    }

    const allowed = recordAttempt();
    if (!allowed) {
      toast.error("You have been locked out. Please wait 15 minutes.");
      logVerificationEvent(AUDIT_ACTIONS.EMAIL_RESEND_LOCKED, "locked", { email });
      return;
    }

    logVerificationEvent(AUDIT_ACTIONS.EMAIL_RESEND_REQUESTED, "success", { email });

    try {
      await resendEmail(email).unwrap();
      toast.success("Verification email sent successfully!");
      logVerificationEvent(AUDIT_ACTIONS.EMAIL_RESEND_SUCCESS, "success", { email });
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to resend verification email");
      logVerificationEvent(AUDIT_ACTIONS.EMAIL_RESEND_FAILED, "failure", {
        email,
        error: error?.data?.message,
      });
    }
  };

  if (isVerified) {
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
          aria-label="Email verification"
        >
          <Logo />
          <SuccessIcon>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </SuccessIcon>
          <Heading style={{ color: isDark ? "#f3f4f6" : "#2d2252" }}>
            Email Verified!
          </Heading>
          <Message style={{ color: isDark ? "#d1d5db" : "#6b6580" }} role="status">
            Your email has been successfully verified. You can now log in to your account.
          </Message>
          <SubmitButton onClick={() => navigate("/auth/login")}>
            Go to Login
          </SubmitButton>
        </Card>
      </PageContainer>
    );
  }

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
        aria-label="Email verification"
        aria-busy={isLoading}
      >
        <Logo />
        <Heading style={{ color: isDark ? "#f3f4f6" : "#2d2252" }}>
          Verify Your Email
        </Heading>

        {token ? (
          <>
            <Message
              style={{ color: isDark ? "#d1d5db" : "#6b6580" }}
              aria-live="polite"
            >
              {isLoading
                ? "Verifying your email..."
                : "Click the button below to verify your email address."}
            </Message>
            {!isLoading && (
              <SubmitButton onClick={handleVerifyEmail} disabled={isLoading}>
                Verify Email
              </SubmitButton>
            )}
          </>
        ) : fromRegistration || email ? (
          <>
            {/* Envelope icon */}
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
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
            </div>

            <Message style={{ color: isDark ? "#d1d5db" : "#6b6580" }} aria-live="polite">
              We've sent a verification link to{" "}
              <strong style={{ color: isDark ? "#c084fc" : "#7F56D9" }}>
                {email}
              </strong>
              . Check your inbox and click the link to verify your email address.
            </Message>

            {/* Lockout banner */}
            {isLocked && (
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
                  Too many resend attempts. Please try again in{" "}
                  {formatTime(lockRemainingSeconds)}.
                </p>
              </div>
            )}

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
              <Message style={{ color: isDark ? "#9ca3af" : "#7a7290", fontSize: "13px" }}>
                Didn't receive the email? Check your spam folder or resend below.
              </Message>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  sessionStorage.setItem("verify_email_address", e.target.value);
                }}
                aria-label="Email address"
                style={{
                  backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
                  borderColor: isDark ? "rgba(45,27,105,0.5)" : "#ddd0ec",
                  color: isDark ? "#e2e8f0" : "#2d2252",
                }}
              />
              <SubmitButton
                onClick={handleResendEmail}
                disabled={isResending || isLocked}
                aria-label="Resend verification email"
              >
                {isResending ? (
                  <>
                    <Spinner />
                    Sending...
                  </>
                ) : isLocked ? (
                  `Locked (${formatTime(lockRemainingSeconds)})`
                ) : (
                  "Resend Verification Email"
                )}
              </SubmitButton>

              {/* Attempt counter */}
              {!isLocked && attempts > 0 && (
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
                  {maxAttempts - attempts} resend attempt(s) remaining
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <Message style={{ color: isDark ? "#d1d5db" : "#6b6580" }}>
              No verification token found. Please enter your email to receive a new verification link.
            </Message>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                sessionStorage.setItem("verify_email_address", e.target.value);
              }}
              aria-label="Email address"
              style={{
                backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
                borderColor: isDark ? "rgba(45,27,105,0.5)" : "#ddd0ec",
                color: isDark ? "#e2e8f0" : "#2d2252",
              }}
            />

            {/* Lockout banner */}
            {isLocked && (
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
                  Too many resend attempts. Please try again in{" "}
                  {formatTime(lockRemainingSeconds)}.
                </p>
              </div>
            )}

            <SubmitButton
              onClick={handleResendEmail}
              disabled={isResending || isLocked}
              aria-label="Resend verification email"
            >
              {isResending ? (
                <>
                  <Spinner />
                  Sending...
                </>
              ) : isLocked ? (
                `Locked (${formatTime(lockRemainingSeconds)})`
              ) : (
                "Resend Verification Email"
              )}
            </SubmitButton>

            {/* Attempt counter */}
            {!isLocked && attempts > 0 && (
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
                {maxAttempts - attempts} resend attempt(s) remaining
              </p>
            )}
          </>
        )}

        <BackLink
          href="/auth/login"
          style={{ color: isDark ? "#c084fc" : "#7F56D9" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Login
        </BackLink>
      </Card>
    </PageContainer>
  );
};

export default VerifyEmail;

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

const SuccessIcon = styled("div")({
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "4px",
  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
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

const Input = styled("input")({
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1.5px solid #ddd0ec",
  fontSize: "14px",
  fontFamily: "'Nunito', sans-serif",
  outline: "none",
  boxShadow: "0 1px 3px rgba(91, 59, 165, 0.08)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  "&:hover": {
    borderColor: "#9B7DE8",
  },
  "&:focus": {
    borderColor: "#7F56D9",
    borderWidth: "2px",
    boxShadow: "0 0 0 3px rgba(127, 86, 217, 0.12)",
    padding: "10.5px 13.5px",
  },
  "&::placeholder": {
    color: "#7a7290",
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

const BackLink = styled("a")({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "'Nunito', sans-serif",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 0.2s",
  marginTop: "4px",
  "&:hover": {
    textDecoration: "underline",
  },
});

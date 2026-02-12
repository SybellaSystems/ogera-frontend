import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVerifyEmailMutation, useResendVerificationEmailMutation } from "../services/api/authApi";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { styled } from "@mui/material/styles";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [verifyEmail] = useVerifyEmailMutation();
  const [resendEmail, { isLoading: isResending }] = useResendVerificationEmailMutation();

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
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await resendEmail(email).unwrap();
      toast.success("Verification email sent successfully!");
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to resend verification email");
    }
  };

  if (isVerified) {
    return (
      <PageContainer>
        <Card>
          <Logo />
          <SuccessIcon>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </SuccessIcon>
          <Heading>Email Verified!</Heading>
          <Message>
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
    <PageContainer>
      <Card>
        <Logo />
        <Heading>Verify Your Email</Heading>
        {token ? (
          <>
            <Message>
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
        ) : (
          <>
            <Message>
              No verification token found. Please enter your email to receive a new verification link.
            </Message>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <SubmitButton onClick={handleResendEmail} disabled={isResending}>
              {isResending ? (
                <>
                  <Spinner />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </SubmitButton>
          </>
        )}
        <BackLink href="/auth/login">
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
  background: "linear-gradient(180deg, #e4daf5 0%, #ede7f8 50%, #f5f0fc 100%)",
  fontFamily: "'Nunito', sans-serif",
  padding: "20px",
});

const Card = styled("div")(({ theme }) => ({
  background: "#ffffff",
  borderRadius: "20px",
  padding: "36px 32px",
  maxWidth: "440px",
  width: "100%",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  boxShadow: "0 8px 30px rgba(91, 59, 165, 0.1)",
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
  color: "#2d2252",
  fontFamily: "'Nunito', sans-serif",
  lineHeight: 1.2,
});

const Message = styled("p")({
  fontSize: "14px",
  color: "#6b6580",
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
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(91, 59, 165, 0.08)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  color: "#2d2252",
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
  color: "#7F56D9",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 0.2s",
  marginTop: "4px",
  "&:hover": {
    color: "#6941C6",
    textDecoration: "underline",
  },
});

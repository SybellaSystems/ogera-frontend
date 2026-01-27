import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVerifyEmailMutation, useResendVerificationEmailMutation } from "../services/api/authApi";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { styled } from "@mui/material/styles";
import logo from "../assets/logoWhite.png";

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
      <VerifyEmailContainer>
        <VerifyEmailCard>
          <Logo />
          <SuccessIcon>✓</SuccessIcon>
          <Heading>Email Verified!</Heading>
          <Message>
            Your email has been successfully verified. You can now log in to your account.
          </Message>
          <Button onClick={() => navigate("/auth/login")}>
            Go to Login
          </Button>
        </VerifyEmailCard>
      </VerifyEmailContainer>
    );
  }

  return (
    <VerifyEmailContainer>
      <VerifyEmailCard>
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
              <Button onClick={handleVerifyEmail} disabled={isLoading}>
                Verify Email
              </Button>
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
            <Button onClick={handleResendEmail} disabled={isResending}>
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </>
        )}
        <LinkText onClick={() => navigate("/auth/login")}>
          Back to Login
        </LinkText>
      </VerifyEmailCard>
    </VerifyEmailContainer>
  );
};

export default VerifyEmail;

const VerifyEmailContainer = styled("div")`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7f56d9 0%, #5b21b6 100%);
  padding: 20px;
`;

const VerifyEmailCard = styled("div")`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const Logo = styled("div")`
  background: url(${logo}) no-repeat center center;
  background-size: contain;
  height: 50px;
  width: 120px;
  margin: 0 auto 30px;
`;

const SuccessIcon = styled("div")`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-weight: bold;
`;

const Heading = styled("h1")`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const Message = styled("p")`
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const Input = styled("input")`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 20px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #7f56d9;
  }
`;

const Button = styled("button")`
  width: 100%;
  padding: 14px;
  background: #7f56d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 16px;

  &:hover:not(:disabled) {
    background: #6e47c4;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LinkText = styled("p")`
  color: #7f56d9;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 16px;

  &:hover {
    color: #6e47c4;
  }
`;







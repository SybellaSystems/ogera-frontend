import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { styled } from "@mui/material/styles";

import RestPasswordTemplate from "../components/ResetPassword";
import Button from "../components/button";
import { phoneOtpValidation } from "../validation/Index";
import {
  useResendVerificationEmailMutation,
  useSendPhoneVerificationOTPMutation,
  useVerifyAccountMutation,
} from "../services/api/authApi";

type PhoneOtpFormValues = {
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

type VerificationView = "choose" | "verifyMobile" | "emailSent";

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailFromQuery = searchParams.get("email") || "";
  const [email, setEmail] = useState<string>(() => {
    return (
      emailFromQuery ||
      localStorage.getItem("pendingVerificationEmail") ||
      ""
    );
  });

  const pendingPhoneNumber = useMemo(
    () => localStorage.getItem("pendingVerificationPhoneNumber") || "",
    []
  );

  const [view, setView] = useState<VerificationView>("choose");
  const [emailVerified, setEmailVerified] = useState<boolean>(() => {
    return localStorage.getItem("pendingVerificationEmailVerified") === "true";
  });
  const [phoneVerified, setPhoneVerified] = useState<boolean>(() => {
    return localStorage.getItem("pendingVerificationPhoneVerified") === "true";
  });

  const [sendPhoneVerificationOtp, { isLoading: isSendingOtp }] =
    useSendPhoneVerificationOTPMutation();
  const [verifyAccount, { isLoading: isVerifyingAccount }] =
    useVerifyAccountMutation();
  const [resendVerificationEmail, { isLoading: isResendingEmail }] =
    useResendVerificationEmailMutation();

  useEffect(() => {
    if (emailFromQuery) {
      localStorage.setItem("pendingVerificationEmail", emailFromQuery);
      setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);

  useEffect(() => {
    if (!email) {
      toast.error(
        "Missing email verification context. Please log in again."
      );
      navigate("/auth/login");
    }
  }, [email, navigate]);

  // Keep localStorage flags in sync when coming back from /auth/verify-email.
  useEffect(() => {
    setEmailVerified(
      localStorage.getItem("pendingVerificationEmailVerified") === "true"
    );
    setPhoneVerified(
      localStorage.getItem("pendingVerificationPhoneVerified") === "true"
    );
  }, []);

  const otp1Ref = useRef<HTMLInputElement>(null);
  const otp2Ref = useRef<HTMLInputElement>(null);
  const otp3Ref = useRef<HTMLInputElement>(null);
  const otp4Ref = useRef<HTMLInputElement>(null);
  const otp5Ref = useRef<HTMLInputElement>(null);
  const otp6Ref = useRef<HTMLInputElement>(null);

  const refs = useMemo(
    () => [otp1Ref, otp2Ref, otp3Ref, otp4Ref, otp5Ref, otp6Ref],
    []
  );

  const formik = useFormik<PhoneOtpFormValues>({
    initialValues: {
      otp1: "",
      otp2: "",
      otp3: "",
      otp4: "",
      otp5: "",
      otp6: "",
    },
    validationSchema: phoneOtpValidation,
    onSubmit: async (values) => {
      const otp = `${values.otp1}${values.otp2}${values.otp3}${values.otp4}${values.otp5}${values.otp6}`;

      try {
        await verifyAccount({ email, otp }).unwrap();

        // Phone can be verified without email verification first.
        setPhoneVerified(true);
        localStorage.setItem("pendingVerificationPhoneVerified", "true");
        localStorage.removeItem("pendingVerificationOtp");

        toast.success("Phone number verified successfully!");
        setView("choose");
      } catch (err) {
        const error = err as FetchBaseQueryError & {
          data?: { message?: string };
        };
        toast.error(error?.data?.message || "Failed to verify phone number");
      }
    },
  });

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const name = `otp${index + 1}` as keyof PhoneOtpFormValues;
    formik.setFieldValue(name, value);

    if (value && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const name = `otp${index + 1}` as keyof PhoneOtpFormValues;
    if (e.key === "Backspace" && !formik.values[name] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);

    if (pastedData.length === 6) {
      formik.setFieldValue("otp1", pastedData[0]);
      formik.setFieldValue("otp2", pastedData[1]);
      formik.setFieldValue("otp3", pastedData[2]);
      formik.setFieldValue("otp4", pastedData[3]);
      formik.setFieldValue("otp5", pastedData[4]);
      formik.setFieldValue("otp6", pastedData[5]);
      otp6Ref.current?.focus();
    }
  };

  const otpError =
    (formik.touched.otp1 && formik.errors.otp1) ||
    (formik.touched.otp2 && formik.errors.otp2) ||
    (formik.touched.otp3 && formik.errors.otp3) ||
    (formik.touched.otp4 && formik.errors.otp4) ||
    (formik.touched.otp5 && formik.errors.otp5) ||
    (formik.touched.otp6 && formik.errors.otp6) ||
    "";

  const fields = [
    {
      type: "otp",
      names: ["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"],
      values: [
        formik.values.otp1,
        formik.values.otp2,
        formik.values.otp3,
        formik.values.otp4,
        formik.values.otp5,
        formik.values.otp6,
      ],
      refs,
      onChange: handleOtpChange,
      onKeyDown: handleOtpKeyDown,
      onPaste: handleOtpPaste,
      onBlur: formik.handleBlur,
      error: otpError,
    },
  ];

  useEffect(() => {
    if (view === "verifyMobile") {
      formik.resetForm();
      // Slight delay so RestPasswordTemplate mounts before focusing.
      setTimeout(() => otp1Ref.current?.focus(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleRequestMobileOtp = async () => {
    try {
      const result = await sendPhoneVerificationOtp({ email }).unwrap();
      toast.success(
        result?.data?.message || "OTP sent to your phone number!"
      );

      // Development convenience: show the generated OTP in toast.
      if (
        result &&
        typeof result === "object" &&
        "data" in result &&
        (result as any).data &&
        typeof (result as any).data === "object" &&
        "otp" in (result as any).data &&
        (result as any).data.otp &&
        import.meta.env.DEV
      ) {
        toast(
          `Development Mode: Your OTP is ${(result as any).data.otp}`,
          { duration: 10000 }
        );
      }

      setView("verifyMobile");
    } catch (err) {
      const error = err as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  };

  const handleSendEmailVerificationLink = async () => {
    try {
      await resendVerificationEmail(email).unwrap();
      toast.success("Verification email sent. Check your inbox.");
      setView("emailSent");
    } catch (err) {
      const error = err as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(error?.data?.message || "Failed to send verification email");
    }
  };

  if (view === "verifyMobile") {
    return (
      <form onSubmit={formik.handleSubmit}>
        <RestPasswordTemplate
          heading="Verify Mobile Number"
          subHeading={
            pendingPhoneNumber
              ? `Enter the 6-digit code sent to ${pendingPhoneNumber}.`
              : "Enter the 6-digit code sent to your phone."
          }
          fields={fields}
          buttonText={
            isVerifyingAccount ? "Verifying..." : "Verify OTP"
          }
          secondaryAction={
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Button
                backgroundcolor="#111827"
                type="button"
                text="Back"
                onClick={() => setView("choose")}
                style={{ width: "100%" }}
              />
              <Button
                backgroundcolor="#16a34a"
                type="button"
                text="Login"
                onClick={() => navigate("/auth/login")}
                style={{ width: "100%" }}
              />
            </div>
          }
        />
      </form>
    );
  }

  return (
    <VerificationContainer>
      <VerificationCard>
        <Heading>Verify your account</Heading>
        <SubHeading>
          Verify your phone and email to activate your account.
        </SubHeading>

        {pendingPhoneNumber && (
          <ContextLine>Phone: {pendingPhoneNumber}</ContextLine>
        )}
        <ContextLine>Email: {email}</ContextLine>

        <ContextLine>
          Status: Phone {phoneVerified ? "Verified" : "Not verified"} | Email{" "}
          {emailVerified ? "Verified" : "Not verified"}
        </ContextLine>

        <ActionStack>
          <Button
            backgroundcolor="#7f56d9"
            type="button"
            text={
              phoneVerified
                ? "Phone Verified"
                : isSendingOtp
                  ? "Sending OTP..."
                  : "Verify mobile number"
            }
            disabled={isSendingOtp || !email || phoneVerified}
            onClick={handleRequestMobileOtp}
          />

          <Button
            backgroundcolor="#7f56d9"
            type="button"
            text={
              emailVerified
                ? "Email Verified"
                : isResendingEmail
                  ? "Sending link..."
                  : "Verify email address"
            }
            disabled={isResendingEmail || !email || emailVerified}
            onClick={handleSendEmailVerificationLink}
          />

          {view === "emailSent" ? (
            <EmailSentMessage>
              Verification link sent. Open the link from your email to
              verify. After verification, you can return here.
            </EmailSentMessage>
          ) : null}

          <Button
            backgroundcolor="#111827"
            type="button"
            text="Login"
            onClick={() => navigate("/auth/login")}
          />
        </ActionStack>
      </VerificationCard>
    </VerificationContainer>
  );
};

export default Verification;

const VerificationContainer = styled("div")`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7f56d9 0%, #5b21b6 100%);
  padding: 20px;
`;

const VerificationCard = styled("div")`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const Heading = styled("h1")`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
`;

const SubHeading = styled("p")`
  font-size: 14px;
  color: #666;
  margin-bottom: 18px;
  line-height: 1.6;
`;

const ContextLine = styled("p")`
  font-size: 13px;
  color: #111827;
  margin: 6px 0;
  opacity: 0.9;
`;

const ActionStack = styled("div")`
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  & > button {
    width: 100%;
  }
`;

const EmailSentMessage = styled("p")`
  font-size: 13px;
  color: #4b5563;
  margin: 4px 0 2px;
`;



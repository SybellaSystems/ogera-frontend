import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import RestPasswordTemplate from "../components/ResetPassword";
import { forgotPasswordValidation } from "../validation/Index";
import { useForgotPasswordMutation } from "../services/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [forgotPassword, { data, isLoading, isSuccess, isError, error }] =
    useForgotPasswordMutation();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordValidation,
    onSubmit: async (values) => {
      try {
        await forgotPassword(values).unwrap();
      } catch (e) {
        // error handled in effect
      }
    },
  });

  // refs to show toast only on transition
  const prevError = useRef(false);
  const prevSuccess = useRef(false);

  useEffect(() => {
    if (!prevError.current && isError && error) {
      const err = error as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Something went wrong");
    }

    if (!prevSuccess.current && isSuccess && data) {
      // backend payload structure: { message: string, data: { resetToken: "..." } }
      toast.success(data?.message || "OTP sent to your email");
      const resetToken = (data?.data as any)?.resetToken;
      if (resetToken) {
        localStorage.setItem("resetToken", resetToken);
      }
      formik.resetForm();
      navigate("/auth/verify-otp");
    }

    prevError.current = isError;
    prevSuccess.current = isSuccess;
  }, [isError, isSuccess, data, error, navigate]);

  const fields = [
    {
      label: "Your registered email",
      type: "email",
      placeholder: "Enter your email",
      name: "email",
      value: formik.values.email,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      error: formik.touched.email && (formik.errors.email as string | undefined),
    },
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <RestPasswordTemplate
        heading="Forgot Password?"
        subHeading="Enter your email for the verification process. We will send a 4-digit code to your email."
        fields={fields}
        buttonText={isLoading ? "Sending..." : "Send OTP"}
        disabled={isLoading}
        showResend={false}
      />
    </form>
  );
};

export default ForgotPassword;

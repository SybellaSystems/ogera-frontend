import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import RestPasswordTemplate from "../components/ResetPassword";
import { otpValidation } from "../validation/Index";
import { useVerifyOtpMutation } from "../services/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const [verifyOtp, { data, isLoading, isSuccess, isError, error }] =
    useVerifyOtpMutation();

  // Refs for OTP input fields
  const otp1Ref = useRef<HTMLInputElement>(null);
  const otp2Ref = useRef<HTMLInputElement>(null);
  const otp3Ref = useRef<HTMLInputElement>(null);
  const otp4Ref = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: { otp1: "", otp2: "", otp3: "", otp4: "" },
    validationSchema: otpValidation,
    onSubmit: async (values) => {
      const otp = Object.values(values).join("");
      const resetToken = localStorage.getItem("resetToken");
      try {
        await verifyOtp({ otp, resetToken }).unwrap();
      } catch (e) {
        // error handled below
      }
    },
  });

  const prevError = useRef(false);
  const prevSuccess = useRef(false);

  useEffect(() => {
    if (!prevError.current && isError && error) {
      const err = error as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Invalid OTP");
    }

    if (!prevSuccess.current && isSuccess && data) {
      toast.success(data?.message || "OTP verified successfully");
      navigate("/auth/reset-password");
    }

    prevError.current = isError;
    prevSuccess.current = isSuccess;
  }, [isError, isSuccess, data, error, navigate]);

  // Auto-focus first input on mount
  useEffect(() => {
    otp1Ref.current?.focus();
  }, []);

  // Handle OTP input change with auto-focus
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Only allow digits
    const name = `otp${index + 1}` as keyof typeof formik.values;
    
    // Update formik value
    formik.setFieldValue(name, value);

    // Auto-focus next input if value is entered
    if (value && index < 3) {
      const refs = [otp1Ref, otp2Ref, otp3Ref, otp4Ref];
      refs[index + 1].current?.focus();
    }
  };

  // Handle backspace to go to previous input
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !formik.values[`otp${index + 1}` as keyof typeof formik.values] && index > 0) {
      const refs = [otp1Ref, otp2Ref, otp3Ref, otp4Ref];
      refs[index - 1].current?.focus();
    }
  };

  // Handle paste event for OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 4);
    
    if (pastedData.length === 4) {
      formik.setFieldValue("otp1", pastedData[0]);
      formik.setFieldValue("otp2", pastedData[1]);
      formik.setFieldValue("otp3", pastedData[2]);
      formik.setFieldValue("otp4", pastedData[3]);
      otp4Ref.current?.focus();
    }
  };

  const otpError =
    (formik.touched.otp1 && formik.errors.otp1) ||
    (formik.touched.otp2 && formik.errors.otp2) ||
    (formik.touched.otp3 && formik.errors.otp3) ||
    (formik.touched.otp4 && formik.errors.otp4) ||
    "";

  const fields = [
    {
      type: "otp",
      names: ["otp1", "otp2", "otp3", "otp4"],
      values: [
        formik.values.otp1,
        formik.values.otp2,
        formik.values.otp3,
        formik.values.otp4,
      ],
      refs: [otp1Ref, otp2Ref, otp3Ref, otp4Ref],
      onChange: handleOtpChange,
      onKeyDown: handleOtpKeyDown,
      onPaste: handleOtpPaste,
      onBlur: formik.handleBlur,
      error: otpError,
    },
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <RestPasswordTemplate
        heading="Verify OTP"
        subHeading="Enter the 4-digit code you received on your email."
        fields={fields}
        showResend={true}
        buttonText={isLoading ? "Verifying..." : "Verify OTP"}
      />
    </form>
  );
};

export default VerifyOtp;

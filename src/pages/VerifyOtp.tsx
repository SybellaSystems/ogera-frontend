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
      onChange: formik.handleChange,
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

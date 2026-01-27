import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import ResetPasswordTemplate from "../components/ResetPassword";
import { resetPasswordValidation } from "../validation/Index";
import { useResetPasswordMutation } from "../services/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [resetPassword, { data, isLoading, isSuccess, isError, error }] =
    useResetPasswordMutation();

  const formik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: resetPasswordValidation,
    onSubmit: async (values) => {
      const resetToken = localStorage.getItem("resetToken");
      try {
        await resetPassword({ newPassword: values.newPassword, resetToken }).unwrap();
      } catch (e) {
        // handled below
      }
    },
  });

  const prevError = useRef(false);
  const prevSuccess = useRef(false);

  useEffect(() => {
    if (!prevError.current && isError && error) {
      const err = error as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Something went wrong");
    }

    if (!prevSuccess.current && isSuccess && data) {
      toast.success(data?.message || "Password reset successful");
      localStorage.removeItem("resetToken");
      navigate("/auth/login");
    }

    prevError.current = isError;
    prevSuccess.current = isSuccess;
  }, [isError, isSuccess, data, error, navigate]);

  const fields = [
    {
      label: "Enter new password",
      type: "password",
      placeholder: "New password",
      name: "newPassword",
      value: formik.values.newPassword,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      error: formik.touched.newPassword && formik.errors.newPassword,
    },
    {
      label: "Confirm password",
      type: "password",
      placeholder: "Confirm password",
      name: "confirmPassword",
      value: formik.values.confirmPassword,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      error: formik.touched.confirmPassword && formik.errors.confirmPassword,
    },
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <ResetPasswordTemplate
        heading="Reset Password"
        subHeading="Set the new password for your account."
        fields={fields}
        buttonText={isLoading ? "Resetting..." : "Reset Password"}
        disabled={isLoading}
      />
    </form>
  );
};

export default ResetPassword;

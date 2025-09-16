import { useFormik } from "formik";
import RestPasswordTemplate from "../components/ResetPassword";
import { forgotPasswordValidation } from "../validation/Index";
import type { ForgotPasswordFormValues } from "../type/Auth";
import { useForgotPasswordMutation } from "../features/api/authApi";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotPassword, { data, isLoading, isError, error, isSuccess }] =
    useForgotPasswordMutation();

  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordValidation,
    onSubmit: async (values) => {
      try {
        await forgotPassword(values).unwrap();
      } catch (err) {
        console.error("Forgot Password error:", err);
      }
    },
  });

  const fields = [
    {
      label: "Your registered email",
      type: "email",
      placeholder: "Enter your email",
      name: "email",
      value: formik.values.email,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      error: formik.touched.email && formik.errors.email,
    },
  ];

  useEffect(() => {
    if (isError && error) {
      const err = error as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Something went wrong");
    }

    if (data && isSuccess) {
      toast.success(data?.message || "Check your email to get the OTP");

      // ✅ Save resetToken to localStorage
      if (data?.data?.resetToken) {
        localStorage.setItem("resetToken", data.data.resetToken);
      }

      formik.resetForm();
      navigate("/auth/verify-otp");
    }
  }, [isError, error, data, isSuccess, formik, navigate]);

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

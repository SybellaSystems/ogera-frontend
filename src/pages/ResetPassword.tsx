import { useFormik } from "formik";
import ResetPasswordTemplate from "../components/ResetPassword";
import { resetPasswordValidation } from "../validation/Index";
import { useResetPasswordMutation } from "../features/api/authApi";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [resetPassword, { data, isSuccess, isError, error, isLoading }] =
    useResetPasswordMutation();

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordValidation,
    onSubmit: async (values) => {
      const resetToken = localStorage.getItem("resetToken");
      if (!resetToken) {
        toast.error("Reset token not found. Please try again.");
        return;
      }

      try {
        await resetPassword({
          newPassword: values.newPassword,
          resetToken,
        }).unwrap();
      } catch (err) {
        console.error("Reset Password error:", err);
      }
    },
  });

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

  useEffect(() => {
    if (isError && error) {
      toast.error("Failed to reset password");
    }

    if (data && isSuccess) {
      toast.success(data?.message || "Password reset successful");
      localStorage.removeItem("resetToken");
      navigate("/auth/login");
    }
  }, [data, isSuccess, isError, error, navigate]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <ResetPasswordTemplate
        heading="Reset Password"
        subHeading="Set the new password for your account so you can login and access all features."
        fields={fields}
        showResend={false}
        buttonText={isLoading ? "Resetting..." : "Reset Password"}
      />
    </form>
  );
};

export default ResetPassword;

import React, { useState } from "react";
import { useFormik } from "formik";
import RestPasswordTemplate from "../components/ResetPassword";
import { changePasswordValidation } from "../validation/Index";
import toast from "react-hot-toast";

const ChangePassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: changePasswordValidation,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        // TODO: Integrate change password API when available
        // await changePasswordApi(values);
        toast.success("Password change functionality will be available soon");
        formik.resetForm();
      } catch (error: any) {
        toast.error(error?.message || "Failed to change password. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const fields = [
    {
      label: "New Password",
      type: "password",
      placeholder: "Enter new password",
      name: "newPassword",
      value: formik.values.newPassword,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      error: formik.touched.newPassword && formik.errors.newPassword,
    },
    {
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm new password",
      name: "confirmPassword",
      value: formik.values.confirmPassword,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      error: formik.touched.confirmPassword && formik.errors.confirmPassword,
    },
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <RestPasswordTemplate
        heading="Change Password"
        subHeading="Set the new password for your account so you can login and access all features."
        fields={fields}
        buttonText="Change Password"
        disabled={isSubmitting}
      />
    </form>
  );
};

export default ChangePassword;

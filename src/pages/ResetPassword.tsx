import { useFormik } from "formik";
import ResetPasswordTemplate from "../components/ResetPassword";
import { resetPasswordValidation } from "../validation/Index";

const ResetPassword = () => {
  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordValidation,
    onSubmit: (values) => {
      console.log("Reset Password values:", values);
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

  return (
    <form onSubmit={formik.handleSubmit}>
      <ResetPasswordTemplate
        heading="Reset Password"
        subHeading="Set the new password for your account so you can login and access all features."
        fields={fields}
        showResend={false}
        buttonText="Reset Password"
      />
    </form>
  );
};

export default ResetPassword;

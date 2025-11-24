import { useFormik } from "formik";
import RestPasswordTemplate from "../components/ResetPassword";
import { changePasswordValidation } from "../validation/Index";
import type { ChangePasswordFormValues } from "../type/index";

const ChangePassword = () => {
  const formik = useFormik<ChangePasswordFormValues>({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordValidation,
    onSubmit: (values) => {
      console.log("Change Password values:", values);
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
      />
    </form>
  );
};

export default ChangePassword;

import { useFormik } from "formik";
import RestPasswordTemplate from "../components/ResetPassword";
import { forgotPasswordValidation } from "../validation/Index";
import type { ForgotPasswordFormValues } from "../type/Auth";

const ForgotPassword = () => {
  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordValidation,
    onSubmit: (values) => {
      console.log("Forgot Password values:", values);
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

  return (
    <form onSubmit={formik.handleSubmit}>
      <RestPasswordTemplate
        heading="Forgot Password ?"
        subHeading="Enter your email for the verification process. We will send a 4-digit code to your email."
        fields={fields}
        buttonText="Send OTP"
        showResend={false}
      />
    </form>
  );
};

export default ForgotPassword;

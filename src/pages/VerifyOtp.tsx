import { useFormik } from "formik";
import RestPasswordTemplate from "../components/ResetPassword";
import { otpValidation } from "../validation/Index";
import type { VerifyOtpFormValues } from "../type/index";

const VerifyOtp = () => {
  const formik = useFormik<VerifyOtpFormValues>({
    initialValues: {
      otp1: "",
      otp2: "",
      otp3: "",
      otp4: "",
    },
    validationSchema: otpValidation,
    onSubmit: (values) => {
      console.log("OTP values:", values);
    },
  });

  // Combine all OTP errors into one string
  const otpError =
    formik.touched.otp1 && formik.errors.otp1
      ? formik.errors.otp1
      : formik.touched.otp2 && formik.errors.otp2
      ? formik.errors.otp2
      : formik.touched.otp3 && formik.errors.otp3
      ? formik.errors.otp3
      : formik.touched.otp4 && formik.errors.otp4
      ? formik.errors.otp4
      : "";

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
        buttonText="Verify OTP"
      />
    </form>
  );
};

export default VerifyOtp;

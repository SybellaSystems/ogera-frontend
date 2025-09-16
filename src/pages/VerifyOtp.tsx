import { useFormik } from "formik";
import RestPasswordTemplate from "../components/ResetPassword";
import { otpValidation } from "../validation/Index";
import type { VerifyOtpFormValues } from "../type/Index";
import { useVerifyOtpMutation } from "../features/api/authApi";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [verifyOtp, { data, isSuccess, isError, error, isLoading }] =
    useVerifyOtpMutation();

  const formik = useFormik<VerifyOtpFormValues>({
    initialValues: {
      otp1: "",
      otp2: "",
      otp3: "",
      otp4: "",
    },
    validationSchema: otpValidation,
    onSubmit: async (values) => {
      const resetToken = localStorage.getItem("resetToken");
      if (!resetToken) {
        toast.error("Reset token not found. Please try again.");
        return;
      }

      const otp = `${values.otp1}${values.otp2}${values.otp3}${values.otp4}`;
      try {
        await verifyOtp({ otp, resetToken }).unwrap();
      } catch (err) {
        console.error("Verify OTP error:", err);
      }
    },
  });

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

  useEffect(() => {
    if (isError && error) {
      toast.error("Invalid OTP");
    }

    if (data && isSuccess) {
      toast.success(data?.message || "OTP Verified Successfully");
      navigate("/auth/reset-password");
    }
  }, [data, isSuccess, isError, error, navigate]);

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

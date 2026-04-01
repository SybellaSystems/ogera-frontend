import * as Yup from "yup";

const otpField = Yup.string()
  .required("OTP required")
  .length(1, "Must be 1 digit")
  .matches(/^\d$/, "Must be a number");

export const otpValidation = Yup.object({
  otp1: otpField,
  otp2: otpField,
  otp3: otpField,
  otp4: otpField,
});

// Phone verification OTP (SMS) uses 6 digits.
export const phoneOtpValidation = Yup.object({
  otp1: otpField,
  otp2: otpField,
  otp3: otpField,
  otp4: otpField,
  otp5: otpField,
  otp6: otpField,
});

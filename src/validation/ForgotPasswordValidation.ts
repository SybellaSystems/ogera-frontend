import * as Yup from "yup";

export const forgotPasswordValidation = Yup.object({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),
});

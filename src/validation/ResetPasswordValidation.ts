import * as Yup from "yup";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const resetPasswordValidation = Yup.object({
  newPassword: Yup.string()
    .matches(
      strongPasswordRegex,
      "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"
    )
    .required("New password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

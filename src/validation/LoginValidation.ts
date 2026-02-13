import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is Required"),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Incorrect password"
    )
    .required("Password is required"), terms: Yup.boolean().oneOf([true], "You must accept Terms of Service"),
  privacy: Yup.boolean().oneOf([true], "You must accept Privacy Policy"),
});

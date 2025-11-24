import * as Yup from "yup";

export const registerValidationSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"
    )
    .required("Password is required"),
  nationalId: Yup.string().when("accountType", {
    is: "student",
    then: (schema) => schema.required("National ID is required"),
  }),
  businessId: Yup.string().when("accountType", {
    is: "employer",
    then: (schema) => schema.required("Business ID is required"),
  }),
  phone: Yup.string().required("Phone number is required"),
  terms: Yup.bool().oneOf([true], "You must accept the terms"),
  privacy: Yup.bool().oneOf([true], "You must accept the privacy policy"),
});

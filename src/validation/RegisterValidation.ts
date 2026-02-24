import * as Yup from "yup";
import { getCountryMobileConfig } from "../utils/mobileValidation";

export const registerValidationSchema = Yup.object({
  full_name: Yup.string().required("Full name is required"),
  email: Yup.string()
  .email("Invalid email format")
  .matches(/^[\w.-]+@([\w-]+\.)+(com|in)$/, "Email must end with .com or .in")
  .required("Email is required"),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"
    )
    .required("Password is required"),
  national_id_number: Yup.string().when("accountType", {
    is: "student",
    then: (schema) => schema.required("National ID is required"),
  }),
  businessId: Yup.string().when("accountType", {
    is: "employer",
    then: (schema) => schema.required("Business ID is required"),
  }),
  countryCode: Yup.string().required("Country is required"),
  mobile_number: Yup.string()
    .required("Phone number is required")
    .test("mobile-digits", function (value) {
      const { parent } = this as any;
      const countryCode = parent?.countryCode;

      if (!value) return this.createError({ message: "Phone number is required" });

      const config = getCountryMobileConfig(countryCode);
      if (!config) {
        return this.createError({ message: "Invalid country selected" });
      }

      const digitCount = String(value).replace(/\D/g, "").length;

      if (config.digitCountRange) {
        const { min, max } = config.digitCountRange;
        if (digitCount < min || digitCount > max) {
          return this.createError({
            message: `Phone number must be between ${min} and ${max} digits for ${config.country}`,
          });
        }
      } else {
        if (digitCount !== config.digitCount) {
          return this.createError({
            message: `Phone number must be exactly ${config.digitCount} digits for ${config.country}`,
          });
        }
      }

      return true;
    }),
  terms: Yup.bool().oneOf([true], "You must accept the terms"),
  privacy: Yup.bool().oneOf([true], "You must accept the privacy policy"),
});

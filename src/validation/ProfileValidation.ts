import * as Yup from "yup";
import { getCountryMobileConfig } from "../utils/mobileValidation";

export const createProfileUpdateValidation = (userRole: string) => {
  return Yup.object({
    firstName: Yup.string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .required("First name is required"),

    lastName: Yup.string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .required("Last name is required"),

    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),

    // mobile_number: Yup.string()
    //   .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    //   .required("Phone number is required"),

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

    national_id_number:
      userRole === "student"
        ? Yup.string()
            .required("National ID is required for students")
            .min(5, "National ID must be at least 5 characters")
        : Yup.string(),

    business_registration_id:
      userRole === "employer"
        ? Yup.string()
            .required("Business Registration ID is required for employers")
            .min(5, "Business Registration ID must be at least 5 characters")
        : Yup.string(),
  });
};


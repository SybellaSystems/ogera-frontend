import * as Yup from "yup";

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

    mobile_number: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),

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


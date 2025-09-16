export interface RegisterFormValues {
  accountType: "student" | "employer";
  full_name: string;
  email: string;
  password: string;
  national_id_number: string;
  businessId: string;
  mobile_number: string;
  terms: boolean;
  privacy: boolean;
}


export interface LoginFormValues {
  email: string;
  password: string;
  terms: boolean;
  privacy: boolean;
}

export interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface VerifyOtpFormValues {
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  
}

export interface ChangePasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}


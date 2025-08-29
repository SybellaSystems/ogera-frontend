export interface RegisterFormValues {
  accountType: "student" | "employer";
  fullName: string;
  email: string;
  password: string;
  nationalId: string;
  businessId: string;
  phone: string;
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


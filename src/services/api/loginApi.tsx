import api from "./axiosInstance";

export interface LoginApiResponse {
  data: {
    accessToken?: string;
    user?: unknown;
    requires2FA?: boolean;
    twoFactorToken?: string;
  };
}

export const loginApi = (values: { email: string; password: string; captchaToken?: string }) => async () => {
  const res = await api.post<LoginApiResponse>("/auth/login", values);
  return res.data; 
};

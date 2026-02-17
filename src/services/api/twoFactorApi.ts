import api from "./axiosInstance";

export interface Setup2FAResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    qrCode: string;
    secret: string;
  };
}

export const setup2FA = async (): Promise<Setup2FAResponse> => {
  const res = await api.post<Setup2FAResponse>("/auth/2fa/setup", {});
  return res.data;
};

export interface Verify2FAResponse {
  success: boolean;
  status: number;
  message: string;
  data: Record<string, never>;
}

export const verify2FA = async (token: string): Promise<Verify2FAResponse> => {
  const res = await api.post<Verify2FAResponse>("/auth/2fa/verify", { token });
  return res.data;
};

export const disable2FA = async (
  password: string,
  token?: string
): Promise<Verify2FAResponse> => {
  const res = await api.post<Verify2FAResponse>("/auth/2fa/disable", {
    password,
    token,
  });
  return res.data;
};

export interface VerifyLogin2FAResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    user: unknown;
    accessToken: string;
  };
}

export const verifyLogin2FA = async (
  twoFactorToken: string,
  token: string
): Promise<VerifyLogin2FAResponse> => {
  const res = await api.post<VerifyLogin2FAResponse>("/auth/2fa/verify-login", {
    twoFactorToken,
    token,
  });
  return res.data;
};


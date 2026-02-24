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

// Lost Authenticator APIs
export interface SendLostAuthenticatorOTPResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    recoveryToken: string;
  };
}

export const sendLostAuthenticatorOTP = async (
  email: string
): Promise<SendLostAuthenticatorOTPResponse> => {
  const res = await api.post<SendLostAuthenticatorOTPResponse>(
    "/auth/2fa/lost-authenticator/send-otp",
    { email }
  );
  return res.data;
};

export interface VerifyLostAuthenticatorOTPResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    setupToken: string;
    user: unknown;
  };
}

export const verifyLostAuthenticatorOTPAndDisable2FA = async (
  otp: string,
  recoveryToken: string
): Promise<VerifyLostAuthenticatorOTPResponse> => {
  const res = await api.post<VerifyLostAuthenticatorOTPResponse>(
    "/auth/2fa/lost-authenticator/verify-and-disable",
    { otp, recoveryToken }
  );
  return res.data;
};

export const setup2FAWithToken = async (
  setupToken: string
): Promise<Setup2FAResponse> => {
  const res = await api.post<Setup2FAResponse>(
    "/auth/2fa/lost-authenticator/setup",
    { setupToken }
  );
  return res.data;
};

export const verify2FAWithToken = async (
  setupToken: string,
  token: string
): Promise<Verify2FAResponse> => {
  const res = await api.post<Verify2FAResponse>(
    "/auth/2fa/lost-authenticator/verify",
    { setupToken, token }
  );
  return res.data;
};


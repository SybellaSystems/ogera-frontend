import api from "./axiosInstance";

export interface LoginApiResponse {
  data: {
    accessToken: string;
    user: any;
  };
}

export const loginApi = (values: any) => async () => {
  const res = await api.post<LoginApiResponse>("/auth/login", values);
  return res.data; 
};

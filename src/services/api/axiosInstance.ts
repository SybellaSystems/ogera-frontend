import axios from "axios";
import store from "../../appStore/store";
import { setAccessToken, logout } from "../../features/auth/authSlice";

interface RefreshResponse {
  data: {
    accessToken: string;
  };
}

const BASE_URL = import.meta.env.VITE_API_URL; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

// Attach access token and current locale for backend translations
api.interceptors.request.use((config: any) => {
  const token = store.getState().auth.accessToken;

  if (!config.headers) config.headers = {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const locale = localStorage.getItem("ogera_language") || "en";
  config.headers["Accept-Language"] = locale;

  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ⬇️ No hard-coded URL — uses BASE_URL + endpoint
        const refreshResponse = await axios.get<RefreshResponse>(
          `${BASE_URL}/auth/refresh`,
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.data.accessToken;

        store.dispatch(setAccessToken(newToken));

        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (err) {
        store.dispatch(logout());
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

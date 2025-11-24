import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAccessToken, logout } from "../features/auth/authSlice";

interface RefreshResponse {
  data: {
    accessToken: string;
  };
}

const useRefreshOnLoad = () => {
  const dispatch = useDispatch();

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const res = await axios.get<RefreshResponse>(
          `${BASE_URL}/auth/refresh`,
          { withCredentials: true }
        );

        dispatch(setAccessToken(res.data.data.accessToken));
      } catch (err) {
        dispatch(logout());
      }
    };

    refreshToken();
  }, []);
};

export default useRefreshOnLoad;

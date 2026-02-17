import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setCredentials,
  setAccessToken,
  logout,
} from "../features/auth/authSlice";

interface RefreshResponse {
  data: {
    accessToken: string;
  };
}

interface UserResponse {
  user: any;
}

const useRefreshOnLoad = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const currentRole = useSelector((state: any) => state.auth.role);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const refreshAndFetchUser = async () => {
      // ⭐ Step 0: Check for the "isLoggedIn" hint cookie
      const hasSessionHint = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("isLoggedIn="));

      if (!hasSessionHint) {
        console.log("ℹ️ No session hint found. Skipping auto-refresh.");
        setIsLoading(false);
        return;
      }

      try {
        // Step 1: Refresh the access token
        const refreshRes = await axios.get<RefreshResponse>(
          `${BASE_URL}/auth/refresh`,
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.data.accessToken;

        // Step 2: Fetch full user profile if not in state
        if (!currentRole) {
          const userRes = await axios.get<UserResponse>(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${newAccessToken}` },
            withCredentials: true,
          });

          const userData = userRes.data.user;

          dispatch(
            setCredentials({
              user: userData,
              accessToken: newAccessToken,
              role: userData.role,
              permissions: userData.permissions || null,
            })
          );
        } else {
          dispatch(setAccessToken(newAccessToken));
        }

        setIsLoading(false);
      } catch (err: any) {
        // If refresh fails (e.g., token expired), clear hint and logout
        if (err?.response?.status === 401) {
          console.warn("⚠️ Session hint was present but session is invalid.");
          document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } else {
          console.error("❌ Refresh failed unexpectedly:", err);
        }
        dispatch(logout());
        setIsLoading(false);
      }
    };

    refreshAndFetchUser();
  }, [dispatch, currentRole, BASE_URL]);

  return isLoading;
};

export default useRefreshOnLoad;
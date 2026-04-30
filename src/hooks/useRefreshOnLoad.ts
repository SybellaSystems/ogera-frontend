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
      // Session hints can come from backend (`isLoggedIn`) or shared
      // cross-app cookies (`ogera_logged_in`). In production, one of them
      // might be missing depending on domain/cookie scope.
      const hasSessionHint = document.cookie
        .split(";")
        .some((item) => {
          const key = item.trim().split("=")[0];
          return key === "isLoggedIn" || key === "ogera_logged_in";
        });

      try {
        // Step 1: Refresh the access token
        const refreshRes = await axios.get<RefreshResponse>(
          `${BASE_URL}/auth/refresh`,
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.data.accessToken;

        // Step 2: Fetch full user profile if role is missing
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
        // If refresh fails and we had a session hint, clear stale hints and logout.
        // If no hint exists, user is likely just unauthenticated, so skip logout noise.
        if (err?.response?.status === 401) {
          if (hasSessionHint) {
            console.warn("⚠️ Session hint was present but session is invalid.");
            document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "ogera_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        } else {
          console.error("❌ Refresh failed unexpectedly:", err);
        }
        if (hasSessionHint) {
          dispatch(logout());
        }
        setIsLoading(false);
      }
    };

    refreshAndFetchUser();
  }, [dispatch, currentRole, BASE_URL]);

  return isLoading;
};

export default useRefreshOnLoad;
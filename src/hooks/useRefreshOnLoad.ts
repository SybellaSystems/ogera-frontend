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
  const currentUser = useSelector((state: any) => state.auth.user);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const refreshAndFetchUser = async () => {
      // Backend session hint cookie for dashboard app auth bootstrap.
      // Do not use landing-page shared cookies for this decision.
      const hasBackendSessionHint = document.cookie
        .split(";")
        .some((item) => {
          const key = item.trim().split("=")[0];
          return key === "isLoggedIn";
        });
      const hasPersistedAuth = Boolean(currentRole && currentUser);

      // Only attempt refresh when we likely have an app session
      // (backend hint) or persisted auth state from a prior login.
      if (!hasBackendSessionHint && !hasPersistedAuth) {
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
        // If refresh fails and backend hinted there is a session, clear stale hint
        // and logout. If we only had persisted client state, avoid forced bounce.
        if (err?.response?.status === 401) {
          if (hasBackendSessionHint) {
            console.warn("⚠️ Session hint was present but session is invalid.");
            document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        } else {
          console.error("❌ Refresh failed unexpectedly:", err);
        }
        if (hasBackendSessionHint) {
          dispatch(logout());
        }
        setIsLoading(false);
      }
    };

    refreshAndFetchUser();
  }, [dispatch, currentRole, currentUser, BASE_URL]);

  return isLoading;
};

export default useRefreshOnLoad;
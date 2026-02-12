import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setCredentials,
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
        console.log('🔄 [FRONTEND] Starting token refresh...');

        // Step 1: Always refresh the access token on page load
        // (Token is never stored in localStorage for security)
        const refreshRes = await axios.get<RefreshResponse>(
          `${BASE_URL}/auth/refresh`,
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data?.data?.accessToken;

        if (!newAccessToken) {
          console.error('🔄 [FRONTEND] Refresh response missing access token:', refreshRes.data);
          dispatch(logout());
          setIsLoading(false);
          return;
        }

        console.log('🔄 [FRONTEND] Token refreshed successfully');

        // Step 2: Always fetch fresh user data to ensure it's up to date
        // This handles cases where localStorage data might be stale
        console.log('🔍 [FRONTEND] Fetching user data from /auth/me');
        const userRes = await axios.get<UserResponse>(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${newAccessToken}` },
          withCredentials: true,
        });

        const userData = userRes.data.user;

        if (!userData || !userData.role) {
          console.error('🔍 [FRONTEND] User data missing or invalid:', userRes.data);
          dispatch(logout());
          setIsLoading(false);
          return;
        }

        console.log('🔍 [FRONTEND] User data received:', {
          role: userData.role,
          userId: userData.user_id,
          full_name: userData.full_name,
          profile_image_url: userData.profile_image_url,
          permissionsCount: Array.isArray(userData.permissions) ? userData.permissions.length : 0,
        });

        // Update Redux with complete user data including the fresh token
        dispatch(
          setCredentials({
            user: userData,
            accessToken: newAccessToken,
            role: userData.role,
            permissions: userData.permissions || null,
          })
        );

        setIsLoading(false);
      } catch (err: any) {
        const status = err?.response?.status;
        const message = err?.response?.data?.message || err?.message || 'Unknown error';

        // 401 is expected when no session exists (e.g. first visit / logged out)
        if (status !== 401) {
          console.error(`🔄 [FRONTEND] Refresh failed (${status}):`, message);
        } else {
          console.log('🔄 [FRONTEND] No valid session, user needs to login');
        }

        dispatch(logout());
        setIsLoading(false);
      }
    };

    refreshAndFetchUser();
  }, [dispatch, BASE_URL]);

  return isLoading;
};

export default useRefreshOnLoad;

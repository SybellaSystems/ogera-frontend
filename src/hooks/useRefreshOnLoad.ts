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
      try {
        // Step 1: Always refresh the access token on page load
        // (Token is never stored in localStorage for security)
        const refreshRes = await axios.get<RefreshResponse>(
          `${BASE_URL}/auth/refresh`,
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.data.accessToken;

        // Step 2: If role is not in Redux (first load), fetch user data from backend
        if (!currentRole) {
          console.log('🔍 [FRONTEND] Fetching user data from /auth/me');
          const userRes = await axios.get<UserResponse>(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${newAccessToken}` },
            withCredentials: true,
          });

          const userData = userRes.data.user;
          console.log('🔍 [FRONTEND] User data received:', {
            role: userData.role,
            userId: userData.user_id,
            permissions: userData.permissions,
            permissionsType: typeof userData.permissions,
            permissionsLength: Array.isArray(userData.permissions) ? userData.permissions.length : 'not array',
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
          
          console.log('🔍 [FRONTEND] Permissions stored in Redux:', userData.permissions || null);
        } else {
          console.log('🔍 [FRONTEND] User already in Redux, just updating token');
          // If user data exists in Redux/localStorage, just update the token
          dispatch(setAccessToken(newAccessToken));
        }

        setIsLoading(false);
      } catch (err: any) {
        // 401 is expected when no session exists (e.g. first visit / logged out)
        if (err?.response?.status !== 401) {
          console.error("Refresh failed:", err);
        }
        dispatch(logout());
        setIsLoading(false);
      }
    };

    refreshAndFetchUser();
  }, []);

  return isLoading;
};

export default useRefreshOnLoad;

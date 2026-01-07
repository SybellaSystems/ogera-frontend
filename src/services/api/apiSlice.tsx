import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "../../appStore/store";
import { setAccessToken, logout } from "../../features/auth/authSlice";
import store from "../../appStore/store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with automatic token refresh on 401
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "GET",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Store the new token
      // Backend response format: { success: true, status: 200, data: { accessToken: string }, message: string }
      const refreshData = refreshResult.data as { data: { accessToken: string } };
      if (refreshData.data && refreshData.data.accessToken) {
        store.dispatch(setAccessToken(refreshData.data.accessToken));

        // Retry the original query with the new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Invalid response format, logout user
        store.dispatch(logout());
      }
    } else {
      // Refresh failed, logout user
      store.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "User", "Role", "Job", "Notification", "TrustScore"],
  endpoints: () => ({}),
});

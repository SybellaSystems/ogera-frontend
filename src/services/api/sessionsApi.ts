import { apiSlice } from "./apiSlice";

export interface Session {
  id: string;
  device_type: string;
  user_agent?: string;
  ip_address?: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export interface SessionsResponse {
  success: boolean;
  message: string;
  data: Session[];
}

export const sessionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all active sessions for the current user
     */
    getActiveSessions: builder.query<SessionsResponse, void>({
      query: () => ({
        url: "/sessions",
        method: "GET",
      }),
      providesTags: ["Sessions"],
    }),

    /**
     * Revoke a specific session
     */
    revokeSession: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sessions"],
    }),

    /**
     * Revoke all other sessions (logout from other devices)
     */
    revokeOtherSessions: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/sessions/logout/others",
        method: "POST",
      }),
      invalidatesTags: ["Sessions"],
    }),

    /**
     * Revoke all sessions (logout from everywhere)
     */
    revokeAllSessions: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/sessions/logout/all",
        method: "POST",
      }),
      invalidatesTags: ["Sessions"],
    }),
  }),
});

export const {
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useRevokeOtherSessionsMutation,
  useRevokeAllSessionsMutation,
} = sessionsApi;

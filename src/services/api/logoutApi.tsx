import api from "./axiosInstance";
import { logout as logoutAction } from "../../features/auth/authSlice";

export interface LogoutApiResponse {
  success: boolean;
  status: number;
  data: Record<string, unknown>;
  message: string;
}

// Thunk action for logout
export const logoutApi = () => async (dispatch: unknown) => {
  try {
    // Call backend to clear refresh token cookie
    await api.post<LogoutApiResponse>("/auth/logout");

    // Clear Redux state
    if (typeof dispatch === "function") {
      dispatch(logoutAction());
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Logout error:", error);

    // Even if backend fails, clear local state
    if (typeof dispatch === "function") {
      dispatch(logoutAction());
    }

    throw error;
  }
};

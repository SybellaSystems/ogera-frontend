import api from "./axiosInstance";
import { logout as logoutAction } from "../../features/auth/authSlice";

export interface LogoutApiResponse {
  success: boolean;
  status: number;
  data: {};
  message: string;
}

// Thunk action for logout
export const logoutApi = () => async (dispatch: any) => {
  try {
    // Call backend to clear refresh token cookie
    await api.post<LogoutApiResponse>("/auth/logout");
    
    // Clear Redux state
    dispatch(logoutAction());
    
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    
    // Even if backend fails, clear local state
    dispatch(logoutAction());
    
    throw error;
  }
};

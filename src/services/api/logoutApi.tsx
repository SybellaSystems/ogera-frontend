import api from "./axiosInstance";
import { logout } from "../../features/auth/authSlice";

export const logoutApi = () => async (dispatch: any) => {
  await api.post("/auth/logout");
  dispatch(logout());
};

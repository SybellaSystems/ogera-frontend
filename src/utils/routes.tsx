import type { RouteObject } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ChangePassword from "../pages/ChangePassword";
import ResetPassword from "../pages/ResetPassword";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyOtp from "../pages/VerifyOtp";

export const ROUTE_PATHS = {
  AUTH: "/auth",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_OTP: "/auth/verify-otp",
  CHANGE_PASSWORD: "/auth/change-password"
} as const;

export const authRoutes: RouteObject = {
  path: ROUTE_PATHS.AUTH,
  children: [
    { path: "login", element: <Login /> },
    { path: "register", element: <Register /> },
    { path: "reset-password", element: <ResetPassword /> },
    { path: "change-password", element: <ChangePassword /> },
    { path: "forgot-password", element: <ForgotPassword /> },
    { path: "verify-otp", element: <VerifyOtp /> },
  ],
};

export const appRoutes: RouteObject[] = [authRoutes];

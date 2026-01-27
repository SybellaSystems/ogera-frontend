// import type { RouteObject } from "react-router-dom";
// import Login from "../pages/Login";
// import Register from "../pages/Register";
// import ChangePassword from "../pages/ChangePassword";
// import ResetPassword from "../pages/ResetPassword";
// import ForgotPassword from "../pages/ForgotPassword";
// import VerifyOtp from "../pages/VerifyOtp";
// import LandingPage from "../components/LandingPage"; 

// export const ROUTE_PATHS = {
//   ROOT: "/",
//   AUTH: "/auth",
//   LOGIN: "/auth/login",
//   REGISTER: "/auth/register",
//   FORGOT_PASSWORD: "/auth/forgot-password",
//   RESET_PASSWORD: "/auth/reset-password",
//   VERIFY_OTP: "/auth/verify-otp",
//   CHANGE_PASSWORD: "/auth/change-password",
// } as const;

// export const landingRoute: RouteObject = {
//   path: ROUTE_PATHS.ROOT,
//   element: <LandingPage />, // ✅ landing page route
// };

// export const authRoutes: RouteObject = {
//   path: ROUTE_PATHS.AUTH,
//   children: [
//     { path: "login", element: <Login /> },
//     { path: "register", element: <Register /> },
//     { path: "reset-password", element: <ResetPassword /> },
//     { path: "change-password", element: <ChangePassword /> },
//     { path: "forgot-password", element: <ForgotPassword /> },
//     { path: "verify-otp", element: <VerifyOtp /> },
//   ],
// };

// // ✅ Add landingRoute as the first route
// export const appRoutes: RouteObject[] = [landingRoute, authRoutes];

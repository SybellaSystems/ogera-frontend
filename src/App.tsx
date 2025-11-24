import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useSelector } from "react-redux";

import AdminLayout from "./layouts/adminLayout";
import StudentLayout from "./layouts/StudentLayout";
import EmployerLayout from "./layouts/EmployerLayout";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ChangePassword from "./pages/ChangePassword";
import TestRefresh from "./pages/TestRefresh";
import Dashboard from "./pages/Dashboard";

import useRefreshOnLoad from "./hooks/useRefreshOnLoad";

function App() {
  useRefreshOnLoad();

  const role = useSelector((state: any) => state.auth.role);

  // Decide layout based on role
  const DashboardLayout =
    role === "admin"
      ? AdminLayout
      : role === "student"
      ? StudentLayout
      : role === "employer"
      ? EmployerLayout
      : Login; // No role → go to login

  const router = createBrowserRouter([
    /** ---------------- PUBLIC ROUTES ---------------- **/
    { path: "/", Component: Home },
    { path: "/auth/login", Component: Login },
    { path: "/auth/register", Component: Register },
    { path: "/auth/forgot-password", Component: ForgotPassword },
    { path: "/auth/reset-password", Component: ResetPassword },
    { path: "/auth/verify-otp", Component: VerifyOtp },
    { path: "/auth/change-password", Component: ChangePassword },
    { path: "/auth/me", Component: TestRefresh },

    /** ---------------- DASHBOARD (role-based) ---------------- **/
    {
      path: "/dashboard",
      Component: DashboardLayout,
      children: [
        {
          index: true,
          Component: Dashboard,
        },
      ],
    },

    /** ---------------- 404 ---------------- **/
    { path: "*", Component: NotFound },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

/** 404 PAGE **/
const NotFound = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      color: "#7F56D9",
      fontFamily: "Inter, sans-serif",
    }}
  >
    <h1 style={{ fontSize: "50px", marginBottom: "20px" }}>404</h1>
    <p style={{ fontSize: "18px" }}>Page Not Found</p>
  </div>
);

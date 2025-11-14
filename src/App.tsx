import { createBrowserRouter, RouterProvider } from "react-router-dom";  
import AdminLayout from "./layouts/adminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ChangePassword from "./pages/ChangePassword";

function App() {
  const router = createBrowserRouter([
    {
      path: "/auth/login",
      Component: Login,
    },
    {
      path: "/auth/register",
      Component: Register,
    },
    {
      path: "/auth/forgot-password",
      Component: ForgotPassword,
    },
    {
      path: "/auth/reset-password",
      Component: ResetPassword,
    },
    {
      path: "/auth/verify-otp",
      Component: VerifyOtp,
    },
    {
      path: "/auth/change-password",
      Component: ChangePassword,
    },
    {
      path: "/dashboard",
      Component: AdminLayout,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

// Simple 404 fallback
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

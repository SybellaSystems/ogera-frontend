import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/adminLayout";
import StudentLayout from "./layouts/StudentLayout";
import EmployerLayout from "./layouts/EmployerLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOtp from "./pages/VerifyOtp";
import VerifyEmail from "./pages/VerifyEmail";
import ChangePassword from "./pages/ChangePassword";
import TestRefresh from "./pages/TestRefresh";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// User Pages
import AllUsers from "./pages/Users/AllUsers";
import AllUsersWithTable from "./pages/Users/AllUsersWithTable";
import Students from "./pages/Users/Students";
import Employers from "./pages/Users/Employers";
import PendingApprovalUsers from "./pages/Users/PendingApproval";
import SuspendedUsers from "./pages/Users/Suspended";

// Academic Verification Pages
import PendingReviews from "./pages/AcademicVerification/PendingReviews";
import Approved from "./pages/AcademicVerification/Approved";
import Rejected from "./pages/AcademicVerification/Rejected";
import PerformanceTrack from "./pages/AcademicVerification/PerformanceTrack";
import AccountLocks from "./pages/AcademicVerification/AccountLocks";

// Jobs Pages
import AllJobs from "./pages/Jobs/AllJobs";
import ActiveJobs from "./pages/Jobs/ActiveJobs";
import CompletedJobs from "./pages/Jobs/Completed";
import PendingApprovalJobs from "./pages/Jobs/PendingApproval";
import JobCategories from "./pages/Jobs/JobCategories";
import CreateJob from "./pages/Jobs/CreateJob";
import JobApplications from "./pages/Jobs/JobApplications";
import ViewJobApplications from "./pages/Jobs/ViewJobApplications";
import JobDetails from "./pages/Jobs/JobDetails";
import MyApplications from "./pages/Jobs/MyApplications";
import StudentAcceptedApplications from "./pages/Jobs/StudentAcceptedApplications";
import StudentRejectedApplications from "./pages/Jobs/StudentRejectedApplications";
import EmployerAcceptedApplications from "./pages/Jobs/EmployerAcceptedApplications";
import EmployerRejectedApplications from "./pages/Jobs/EmployerRejectedApplications";

// Dispute Pages
import Disputes from "./pages/Disputes";
import OpenDisputes from "./pages/Disputes/OpenDisputes";
import InProgress from "./pages/Disputes/InProgress";
import ResolvedDisputes from "./pages/Disputes/Resolved";

// Other Pages
import Analytics from "./pages/Analytics";
import Transactions from "./pages/Transactions";

// Admin Pages
import CreateAdmin from "./pages/Admin/CreateAdmin";
import ViewAdmins from "./pages/Admin/ViewAdmins";

// Role Pages
import CreateRole from "./pages/Role/CreateRole";
import ViewRoles from "./pages/Role/ViewRoles";

import useRefreshOnLoad from "./hooks/useRefreshOnLoad";

function App() {
  const isLoading = useRefreshOnLoad();
  const role = useSelector((state: any) => state.auth.role);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Decide layout based on role
  const DashboardLayout =
    role === "admin" || role === "superadmin" || role === "verifyDocAdmin"
      ? AdminLayout
      : role === "student"
      ? StudentLayout
      : role === "employer"
      ? EmployerLayout
      : AdminLayout; // Default to AdminLayout (ProtectedRoute will handle auth)

  const router = createBrowserRouter([
    /** ---------------- ROOT REDIRECT ---------------- **/
    {
      path: "/",
      element: role ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Navigate to="/auth/login" replace />
      ),
    },

    /** ---------------- PUBLIC ROUTES ---------------- **/
    {
      path: "/auth/login",
      element: role ? <Navigate to="/dashboard" replace /> : <Login />,
    },
    {
      path: "/auth/register",
      element: role ? <Navigate to="/dashboard" replace /> : <Register />,
    },
    { path: "/auth/forgot-password", Component: ForgotPassword },
    { path: "/auth/reset-password", Component: ResetPassword },
    { path: "/auth/verify-otp", Component: VerifyOtp },
    { path: "/auth/verify-email", Component: VerifyEmail },
    { path: "/auth/change-password", Component: ChangePassword },
    { path: "/auth/me", Component: TestRefresh },

    /** ---------------- PROTECTED DASHBOARD ROUTES ---------------- **/
    {
      path: "/dashboard",
      element: <ProtectedRoute />,
      children: [
        {
          path: "",
          Component: DashboardLayout,
          children: [
            {
              index: true,
              Component: Dashboard,
            },
            {
              path: "profile",
              Component: Profile,
            },
            // User Routes (Admin/SuperAdmin Only)
            {
              path: "users",
              element: (
                <ProtectedRoute allowedRoles={["admin", "superadmin"]} />
              ),
              children: [
                {
                  path: "all",
                  Component: AllUsers,
                },
                {
                  path: "all-table",
                  Component: AllUsersWithTable,
                },
                {
                  path: "students",
                  Component: Students,
                },
                {
                  path: "employers",
                  Component: Employers,
                },
                {
                  path: "pending",
                  Component: PendingApprovalUsers,
                },
                {
                  path: "suspended",
                  Component: SuspendedUsers,
                },
              ],
            },
            // Admin Routes (SuperAdmin Only)
            {
              path: "admin",
              element: <ProtectedRoute allowedRoles={["superadmin"]} />,
              children: [
                {
                  path: "create",
                  Component: CreateAdmin,
                },
                {
                  path: "view",
                  Component: ViewAdmins,
                },
              ],
            },
            // Role Routes (SuperAdmin Only)
            {
              path: "role",
              element: <ProtectedRoute allowedRoles={["superadmin"]} />,
              children: [
                {
                  path: "create",
                  Component: CreateRole,
                },
                {
                  path: "view",
                  Component: ViewRoles,
                },
              ],
            },
            // Academic Verification Routes
            {
              path: "academic/pending",
              Component: PendingReviews,
            },
            {
              path: "academic/approved",
              Component: Approved,
            },
            {
              path: "academic/rejected",
              Component: Rejected,
            },
            {
              path: "academic/performance",
              Component: PerformanceTrack,
            },
            {
              path: "academic/locks",
              Component: AccountLocks,
            },
            // Jobs Routes - Order matters: specific routes first, then dynamic routes
            {
              path: "jobs/create",
              element: <ProtectedRoute allowedRoles={["employer", "superadmin"]} />,
              children: [
                {
                  index: true,
                  Component: CreateJob,
                },
              ],
            },
            {
              path: "jobs/all",
              Component: AllJobs,
            },
            {
              path: "jobs/active",
              Component: ActiveJobs,
            },
            {
              path: "jobs/completed",
              Component: CompletedJobs,
            },
            {
              path: "jobs/pending",
              Component: PendingApprovalJobs,
            },
            {
              path: "jobs/categories",
              Component: JobCategories,
            },
            {
              path: "jobs/applications",
              element: <ProtectedRoute allowedRoles={["employer", "superadmin"]} />,
              children: [
                {
                  index: true,
                  Component: JobApplications,
                },
                {
                  path: "accepted",
                  Component: EmployerAcceptedApplications,
                },
                {
                  path: "rejected",
                  Component: EmployerRejectedApplications,
                },
              ],
            },
            {
              path: "jobs/my-applications",
              element: <ProtectedRoute allowedRoles={["student"]} />,
              children: [
                {
                  index: true,
                  Component: MyApplications,
                },
                {
                  path: "accepted",
                  Component: StudentAcceptedApplications,
                },
                {
                  path: "rejected",
                  Component: StudentRejectedApplications,
                },
              ],
            },
            {
              path: "jobs/:id/edit",
              element: <ProtectedRoute allowedRoles={["employer", "superadmin"]} />,
              children: [
                {
                  index: true,
                  Component: CreateJob,
                },
              ],
            },
            {
              path: "jobs/:id/applications",
              element: <ProtectedRoute allowedRoles={["employer", "superadmin"]} />,
              children: [
                {
                  index: true,
                  Component: ViewJobApplications,
                },
              ],
            },
            {
              path: "jobs/:id",
              Component: JobDetails,
            },
            // Dispute Routes
            {
              path: "disputes",
              Component: Disputes,
            },
            {
              path: "disputes/open",
              Component: OpenDisputes,
            },
            {
              path: "disputes/in-progress",
              Component: InProgress,
            },
            {
              path: "disputes/resolved",
              Component: ResolvedDisputes,
            },
            // Other Routes
            {
              path: "analytics",
              Component: Analytics,
            },
            {
              path: "transactions",
              Component: Transactions,
            },
          ],
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

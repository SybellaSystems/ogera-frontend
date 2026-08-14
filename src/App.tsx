import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

import ProtectedRoute from "./components/ProtectedRoute";
import FeatureGate from "./components/FeatureGate";
import AdminLayout from "./layouts/adminLayout";
import StudentLayout from "./layouts/StudentLayout";
import EmployerLayout from "./layouts/EmployerLayout";

// Authentication
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOtp from "./pages/VerifyOtp";
import VerifyEmail from "./pages/VerifyEmail";
import Verification from "./pages/Verification";
import ChangePassword from "./pages/ChangePassword";
import TestRefresh from "./pages/TestRefresh";

// General
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EmployerSettingsAccount from "./pages/EmployerSettingsAccount";
import EmployerSettingsSecurity from "./pages/EmployerSettingsSecurity";

// User Pages
import AllUsers from "./pages/Users/AllUsers";
import AllUsersWithTable from "./pages/Users/AllUsersWithTable";
import Students from "./pages/Users/Students";
import Employers from "./pages/Users/Employers";
import PendingApprovalUsers from "./pages/Users/PendingApproval";
import SuspendedUsers from "./pages/Users/Suspended";

// Academic Verification
import PendingReviews from "./pages/AcademicVerification/PendingReviews";
import Approved from "./pages/AcademicVerification/Approved";
import Rejected from "./pages/AcademicVerification/Rejected";
import ResubmissionRequired from "./pages/AcademicVerification/ResubmissionRequired";
import PerformanceTrack from "./pages/AcademicVerification/PerformanceTrack";
import AccountLocks from "./pages/AcademicVerification/AccountLocks";

// Jobs
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
import EmployerTasks from "./pages/Jobs/EmployerTasks";
import JobTasksKanban from "./pages/Jobs/JobTasksKanban";
import StudentTasks from "./pages/StudentTasks";

// Recommendations
import RecommendedJobs from "./pages/Jobs/RecommendedJobs";
import RecommendedJobDetails from "./pages/Jobs/RecommendedJobDetails";

// Referrals
import ReferralDetails from "./pages/Jobs/ReferralDetails";
import JobReferrals from "./pages/Jobs/JobReferrals";
import CreateReferral from "./pages/Jobs/CreateReferral";
import ReferralAnalytics from "./pages/Jobs/ReferralAnalytics";

// Disputes
import Disputes from "./pages/Disputes";
import OpenDisputes from "./pages/Disputes/OpenDisputes";
import InProgress from "./pages/Disputes/InProgress";
import ResolvedDisputes from "./pages/Disputes/Resolved";
import CreateDispute from "./pages/Disputes/CreateDispute";
import DisputeDetail from "./pages/Disputes/DisputeDetail";
import MyDisputes from "./pages/Disputes/MyDisputes";

// Other
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Interviews from "./pages/Interviews";
import Messages from "./pages/Messages";
import Transactions from "./pages/Transactions";
import Pay from "./pages/Transactions/Pay";
import MoMoPayments from "./pages/Transactions/MoMoPayments";
import PaymentCallback from "./pages/PaymentCallback";
import PaymentCancelled from "./pages/PaymentCancelled";

// Admin
import CreateAdmin from "./pages/Admin/CreateAdmin";
import ViewAdmins from "./pages/Admin/ViewAdmins";

// Roles
import CreateRole from "./pages/Role/CreateRole";
import ViewRoles from "./pages/Role/ViewRoles";

// Permissions
import CreatePermission from "./pages/Permission/CreatePermission";
import ViewPermissions from "./pages/Permission/ViewPermissions";

// Courses
import AddCourse from "./pages/Courses/AddCourse";
import ViewCourse from "./pages/Courses/ViewCourse";
import CourseDetail from "./pages/Courses/CourseDetail";
import CourseAnalytics from "./pages/Courses/CourseAnalytics";

// Cognitive Tests
import CognitiveTestsHub from "./pages/CognitiveTests/CognitiveTestsHub";
import CognitiveTestEditor from "./pages/CognitiveTests/CognitiveTestEditor";
import StudentCognitiveTests from "./pages/CognitiveTests/StudentCognitiveTests";
import TakeCognitiveTest from "./pages/CognitiveTests/TakeCognitiveTest";

// Problem Metrics
import ProblemMetricsHub from "./pages/ProblemMetrics/ProblemMetricsHub";
import ProblemMetricEditor from "./pages/ProblemMetrics/ProblemMetricEditor";
import StudentProblemMetrics from "./pages/ProblemMetrics/StudentProblemMetrics";
import TakeProblemMetric from "./pages/ProblemMetrics/TakeProblemMetric";

// Academic Records
import AcademicRecords from "./pages/AcademicRecords";

import useRefreshOnLoad from "./hooks/useRefreshOnLoad";

import "./services/api/cognitiveTestApi";
import "./services/api/problemMetricApi";

function App() {
  const { t } = useTranslation();

  const isLoading = useRefreshOnLoad();

  /**
   * Get authenticated user's role.
   *
   * Always normalize the role so that:
   * "SuperAdmin"
   * "SUPERADMIN"
   * "superAdmin"
   *
   * are treated consistently as:
   * "superadmin"
   */
  const roleRaw = useSelector((state: any) => state.auth.role);

  const role = roleRaw
    ? String(roleRaw).toLowerCase().trim()
    : undefined;

  /**
   * Loading state while authentication/session
   * is being restored.
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent" />

          <p className="mt-4 text-gray-600 font-medium">
            {t("app.loading")}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Select the dashboard layout based on role.
   */
  const DashboardLayout =
    role === "admin" ||
    role === "superadmin" ||
    role === "verifydocadmin"
      ? AdminLayout
      : role === "student"
      ? StudentLayout
      : role === "employer"
      ? EmployerLayout
      : AdminLayout;

  const router = createBrowserRouter([
    /* =========================================================
       ROOT
       ========================================================= */

    {
      path: "/",
      element: role ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Navigate to="/auth/login" replace />
      ),
    },

    /* =========================================================
       PUBLIC AUTH ROUTES
       ========================================================= */

    {
      path: "/auth/login",
      element: role ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Login />
      ),
    },

    {
      path: "/auth/register",
      element: role ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Login initialView="register" />
      ),
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
      path: "/auth/verify-email",
      Component: VerifyEmail,
    },

    {
      path: "/auth/verification",
      Component: Verification,
    },

    {
      path: "/auth/change-password",
      Component: ChangePassword,
    },

    {
      path: "/auth/me",
      Component: TestRefresh,
    },

    /* =========================================================
       PAYMENT CALLBACKS
       ========================================================= */

    {
      path: "/payment/callback",
      Component: PaymentCallback,
    },

    {
      path: "/payment/cancelled",
      Component: PaymentCancelled,
    },

    /* =========================================================
       PROTECTED DASHBOARD
       ========================================================= */

    {
      path: "/dashboard",

      element: <ProtectedRoute />,

      children: [
        {
          path: "",

          Component: DashboardLayout,

          children: [
            /* =================================================
               DASHBOARD
               ================================================= */

            {
              index: true,
              Component: Dashboard,
            },

            /* =================================================
               PROFILE
               ================================================= */

            {
              path: "profile",

              element: (
                <FeatureGate feature="SETTINGS">
                  <Profile />
                </FeatureGate>
              ),
            },

            /* =================================================
               SETTINGS
               ================================================= */

            {
              path: "settings/account",

              element: (
                <FeatureGate feature="SETTINGS">
                  <EmployerSettingsAccount />
                </FeatureGate>
              ),
            },

            {
              path: "settings/security",

              element: (
                <FeatureGate feature="SETTINGS">
                  <EmployerSettingsSecurity />
                </FeatureGate>
              ),
            },

            /* =================================================
               USERS
               ================================================= */

            {
              path: "users",

              element: <ProtectedRoute />,

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

            /* =================================================
               SUPERADMIN
               ================================================= */

            {
              path: "admin",

              element: (
                <ProtectedRoute
                  allowedRoles={["superadmin"]}
                />
              ),

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

            /* =================================================
               ROLES
               ================================================= */

            {
              path: "role",

              element: (
                <ProtectedRoute
                  allowedRoles={["superadmin"]}
                />
              ),

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

            /* =================================================
               PERMISSIONS
               ================================================= */

            {
              path: "permission",

              element: (
                <ProtectedRoute
                  allowedRoles={["superadmin"]}
                />
              ),

              children: [
                {
                  path: "create",
                  Component: CreatePermission,
                },

                {
                  path: "view",
                  Component: ViewPermissions,
                },
              ],
            },

            /* =================================================
               ACADEMIC VERIFICATION
               ================================================= */

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
              path: "academic/resubmission-required",
              Component: ResubmissionRequired,
            },

            {
              path: "academic/performance",
              Component: PerformanceTrack,
            },

            {
              path: "academic/locks",
              Component: AccountLocks,
            },

            /* =================================================
               JOBS
               ================================================= */

            {
              path: "jobs/create",

              element: (
                <ProtectedRoute
                  allowedRoles={["employer", "superadmin"]}
                />
              ),

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
              path: "jobs/unfunded",

              element: (
                <ProtectedRoute
                  allowedRoles={["employer", "superadmin"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: AllJobs,
                },
              ],
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

            /* =================================================
               JOB REFERRALS
               
               ONLY SUPERADMIN
               ================================================= */

            {
              path: "jobs/referrals/create",

              element: (
                <ProtectedRoute
                  allowedRoles={["superadmin"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: CreateReferral,
                },
              ],
            },

            {
              path: "jobs/referrals",

              element: (
                <ProtectedRoute
                  allowedRoles={["superadmin"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: JobReferrals,
                },
              ],
            },

            {
              path: "jobs/referrals/:id",

              element: (
                <ProtectedRoute
                  allowedRoles={["superadmin"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: ReferralDetails,
                },
              ],
            },

            /* =================================================
               EMPLOYER TASKS
               ================================================= */

            {
              path: "jobs/tasks",

              element: (
                <ProtectedRoute
                  allowedRoles={["employer", "superadmin"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: EmployerTasks,
                },
              ],
            },

            /* =================================================
               STUDENT TASKS
               ================================================= */

            {
              path: "tasks",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: StudentTasks,
                },
              ],
            },

            /* =================================================
               EMPLOYER APPLICATIONS
               ================================================= */

            {
              path: "jobs/applications",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "employer",
                    "superadmin",
                  ]}
                />
              ),

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

            /* =================================================
               STUDENT APPLICATIONS
               ================================================= */

            {
              path: "jobs/my-applications",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

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

            /* =================================================
               REFERRAL ANALYTICS
               
               ONLY SUPERADMIN
               ================================================= */

            {
              path: "jobs/referral-analytics",

              element: (
                <ProtectedRoute
                  allowedRoles={["superadmin"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: ReferralAnalytics,
                },
              ],
            },

            /* =================================================
               JOB EDIT
               
               EMPLOYER + SUPERADMIN
               ================================================= */

            {
              path: "jobs/:id/edit",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "employer",
                    "superadmin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: CreateJob,
                },
              ],
            },

            /* =================================================
               JOB TASKS
               
               EMPLOYER + SUPERADMIN
               ================================================= */

            {
              path: "jobs/:id/tasks",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "employer",
                    "superadmin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: JobTasksKanban,
                },
              ],
            },

            /* =================================================
               JOB APPLICATION DETAILS
               
               EMPLOYER + SUPERADMIN
               ================================================= */

            {
              path: "jobs/:id/applications",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "employer",
                    "superadmin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: ViewJobApplications,
                },
              ],
            },

            /* =================================================
               RECOMMENDED JOBS
               
               ONLY STUDENTS
               ================================================= */

            {
              path: "jobs/recommended",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: RecommendedJobs,
                },
              ],
            },

            /* =================================================
               RECOMMENDED JOB DETAILS
               
               ONLY STUDENTS
               ================================================= */

            {
              path: "jobs/recommended/:id",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: RecommendedJobDetails,
                },
              ],
            },

            /* =================================================
               JOB DETAILS
               ================================================= */

            {
              path: "jobs/:id",
              Component: JobDetails,
            },

            /* =================================================
               DISPUTES
               ================================================= */

            {
              path: "disputes",

              element: (
                <FeatureGate feature="RESOLUTION_CENTER">
                  <Disputes />
                </FeatureGate>
              ),
            },

            {
              path: "disputes/create",

              element: (
                <FeatureGate feature="RESOLUTION_CENTER">
                  <CreateDispute />
                </FeatureGate>
              ),
            },

            {
              path: "disputes/open",

              element: (
                <FeatureGate feature="RESOLUTION_CENTER">
                  <OpenDisputes />
                </FeatureGate>
              ),
            },

            {
              path: "disputes/in-progress",

              element: (
                <FeatureGate feature="RESOLUTION_CENTER">
                  <InProgress />
                </FeatureGate>
              ),
            },

            {
              path: "disputes/resolved",

              element: (
                <FeatureGate feature="RESOLUTION_CENTER">
                  <ResolvedDisputes />
                </FeatureGate>
              ),
            },

            {
              path: "disputes/my-disputes",

              element: (
                <FeatureGate feature="RESOLUTION_CENTER">
                  <MyDisputes />
                </FeatureGate>
              ),
            },

            {
              path: "disputes/:id",

              element: (
                <FeatureGate feature="RESOLUTION_CENTER">
                  <DisputeDetail />
                </FeatureGate>
              ),
            },

            /* =================================================
               ANALYTICS
               ================================================= */

            {
              path: "analytics",
              Component: Analytics,
            },

            /* =================================================
               NOTIFICATIONS
               ================================================= */

            {
              path: "notifications",
              Component: Notifications,
            },

            /* =================================================
               INTERVIEWS
               
               ONLY STUDENTS
               ================================================= */

            {
              path: "interviews",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: Interviews,
                },
              ],
            },

            /* =================================================
               MESSAGES
               
               STUDENTS + EMPLOYERS
               ================================================= */

            {
              path: "messages",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "employer",
                    "student",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: Messages,
                },
              ],
            },

            /* =================================================
               TRANSACTIONS
               ================================================= */

            {
              path: "transactions",
              Component: Transactions,
            },

            {
              path: "transactions/pay",
              Component: Pay,
            },

            /* =================================================
               MOBILE MONEY PAYMENTS
               
               ADMIN + SUPERADMIN
               ================================================= */

            {
              path: "transactions/momo-payments",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "superadmin",
                    "admin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: MoMoPayments,
                },
              ],
            },

            /* =================================================
               COURSES
               ================================================= */

            {
              path: "courses/add",
              Component: AddCourse,
            },

            {
              path: "courses/view",
              Component: ViewCourse,
            },

            {
              path: "courses/analytics",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "employer",
                    "superadmin",
                    "admin",
                    "courseadmin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: CourseAnalytics,
                },
              ],
            },

            {
              path: "courses/analytics/:courseId",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "employer",
                    "superadmin",
                    "admin",
                    "courseadmin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: CourseAnalytics,
                },
              ],
            },

            {
              path: "courses/:id",
              Component: CourseDetail,
            },

            /* =================================================
               COGNITIVE TESTS
               
               ADMIN + SUPERADMIN
               ================================================= */

            {
              path: "cognitive-tests",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "superadmin",
                    "admin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: CognitiveTestsHub,
                },

                {
                  path: "edit/:id",
                  Component: CognitiveTestEditor,
                },
              ],
            },

            /* =================================================
               STUDENT COGNITIVE TESTS
               ================================================= */

            {
              path: "cognitive-tests/available",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: StudentCognitiveTests,
                },
              ],
            },

            {
              path: "cognitive-tests/attempt/:id",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: TakeCognitiveTest,
                },
              ],
            },

            /* =================================================
               ACADEMIC RECORDS
               ================================================= */

            {
              path: "academic-records",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "student",
                    "superadmin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: AcademicRecords,
                },
              ],
            },

            /* =================================================
               PROBLEM METRICS
               
               ADMIN + SUPERADMIN
               ================================================= */

            {
              path: "problem-metrics",

              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "superadmin",
                    "admin",
                  ]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: ProblemMetricsHub,
                },

                {
                  path: "edit/:id",
                  Component: ProblemMetricEditor,
                },
              ],
            },

            /* =================================================
               STUDENT PROBLEM METRICS
               ================================================= */

            {
              path: "problem-metrics/available",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: StudentProblemMetrics,
                },
              ],
            },

            {
              path: "problem-metrics/attempt/:id",

              element: (
                <ProtectedRoute
                  allowedRoles={["student"]}
                />
              ),

              children: [
                {
                  index: true,
                  Component: TakeProblemMetric,
                },
              ],
            },
          ],
        },
      ],
    },

    /* =========================================================
       404
       ========================================================= */

    {
      path: "*",
      Component: NotFound,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />

      <VercelAnalytics />
    </>
  );
}

/* =============================================================
   404 PAGE
   ============================================================= */

const NotFound = () => {
  const { t } = useTranslation();

  return (
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
      <h1
        style={{
          fontSize: "50px",
          marginBottom: "20px",
        }}
      >
        404
      </h1>

      <p
        style={{
          fontSize: "18px",
        }}
      >
        {t("common.pageNotFound")}
      </p>
    </div>
  );
};

export default App;
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const role = useSelector((state: any) => state.auth.role);
  const user = useSelector((state: any) => state.auth.user);

  // If no user is logged in, redirect to login
  if (!user || !role) {
    return <Navigate to="/auth/login" replace />;
  }

  // ⭐ Superadmin has access to all routes - bypass role checks
  const isSuperadmin = role?.toLowerCase() === 'superadmin';
  if (isSuperadmin) {
    return <Outlet />;
  }

  // If specific roles are required, check if user has access
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
          <p className="text-xl text-gray-700 mb-2">Access Denied</p>
          <p className="text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;


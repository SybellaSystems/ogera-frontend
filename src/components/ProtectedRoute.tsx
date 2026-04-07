import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const roleRaw = useSelector((state: any) => state.auth.role);
  const user = useSelector((state: any) => state.auth.user);

  // Safely extract role as string — could be object { roleName, roleType } or string
  const role = typeof roleRaw === 'object'
    ? (roleRaw?.roleType || roleRaw?.roleName || '')
    : (typeof roleRaw === 'string' ? roleRaw : '');

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
  if (allowedRoles) {
    // Check if role name matches (for superadmin)
    if (allowedRoles.includes(role)) {
      return <Outlet />;
    }
    
    // Check if user's roleType matches (for admin, student, employer)
    // user.role might be an object with roleType, or we need to check differently
    const userRoleType = user?.role?.roleType || user?.role_type;
    if (userRoleType && allowedRoles.includes(userRoleType)) {
      return <Outlet />;
    }
    
    // If role name is a custom admin role (contains "admin" but not exact "admin")
    // and allowedRoles includes "admin", check if it's an admin roleType
    if (role?.toLowerCase().includes('admin') && allowedRoles.includes('admin')) {
      // We'll allow it through - the backend PermissionChecker will handle the actual permission check
      // This is a fallback for custom admin roles
      return <Outlet />;
    }

    // No match found
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


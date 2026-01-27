import type { RoutePermission } from "../features/auth/authSlice";

/**
 * Map permission routes to actual app routes
 * Permission routes in DB: "/academic-verifications", "/jobs", "/users"
 * Actual app routes: "/dashboard/academic/...", "/dashboard/jobs/...", "/dashboard/users/..."
 */
const routeMapping: Record<string, string[]> = {
  "/academic-verifications": ["/dashboard/academic"],
  "/jobs": ["/dashboard/jobs"],
  "/users": ["/dashboard/users"],
};

/**
 * Check if a route matches a permission route
 */
const routeMatches = (appRoute: string, permRoute: string): boolean => {
  console.log('🔍 [ROUTE MATCH] Checking route match:');
  console.log('  - appRoute:', appRoute);
  console.log('  - permRoute:', permRoute);
  
  // Direct match
  if (appRoute === permRoute || appRoute.startsWith(permRoute + "/")) {
    console.log('✅ [ROUTE MATCH] Direct match found');
    return true;
  }

  // Check mapped routes
  const mappedRoutes = routeMapping[permRoute];
  if (mappedRoutes) {
    console.log('🔍 [ROUTE MATCH] Checking mapped routes:', mappedRoutes);
    const match = mappedRoutes.some(
      (mapped) => {
        const matches = appRoute === mapped || appRoute.startsWith(mapped + "/");
        console.log(`  - Checking "${mapped}" against "${appRoute}": ${matches}`);
        return matches;
      }
    );
    if (match) {
      console.log('✅ [ROUTE MATCH] Mapped route match found');
    } else {
      console.log('❌ [ROUTE MATCH] No mapped route match');
    }
    return match;
  }

  console.log('❌ [ROUTE MATCH] No match found');
  return false;
};

/**
 * Check if user has permission for a specific route and action
 * @param permissions - Array of route permissions from Redux
 * @param route - The route to check (e.g., "/academic-verifications", "/jobs")
 * @param action - The action to check ("view", "create", "edit", "delete")
 * @param role - User role for fallback checks
 * @returns boolean - true if permission is granted
 */
export const hasPermission = (
  permissions: RoutePermission[] | null,
  route: string,
  action: "view" | "create" | "edit" | "delete",
  role?: string
): boolean => {
  // For built-in admin roles, always allow access
  if (role === 'superadmin' || role === 'admin') {
    return true;
  }
  
  // For student role, allow view access to academic verifications and jobs
  if (role === 'student') {
    if ((route === '/academic-verifications' || route === '/jobs' || route === '/disputes') && action === 'view') {
      return true;
    }
  }
  
  // For employer role, allow access to jobs
  if (role === 'employer') {
    if (route === '/jobs') {
      return true;
    }
  }
  
  // For verifyDocAdmin role, allow access to academic verifications
  if (role === 'verifyDocAdmin') {
    if (route === '/academic-verifications') {
      return true;
    }
  }

  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }

  const routePermission = permissions.find((perm) => {
    const permRoute = perm.route || "";
    return routeMatches(route, permRoute);
  });

  if (!routePermission) {
    return false;
  }

  return routePermission.permission[action] === true;
};

/**
 * Check if user has ANY permission for a route (at least one action is allowed)
 * @param permissions - Array of route permissions from Redux
 * @param route - The route to check (permission route like "/academic-verifications" or "/jobs")
 * @param role - User role for fallback checks
 * @returns boolean - true if user has any permission for the route
 */
export const hasAnyPermission = (
  permissions: RoutePermission[] | null,
  route: string,
  role?: string
): boolean => {
  console.log('🔍 [PERMISSION CHECK] hasAnyPermission called with:');
  console.log('  - Route:', route);
  console.log('  - Role:', role);
  console.log('  - Permissions:', permissions);
  console.log('  - Permissions type:', typeof permissions);
  console.log('  - Is array?', Array.isArray(permissions));
  
  // For built-in admin roles, always allow access
  if (role === 'superadmin' || role === 'admin') {
    console.log('✅ [PERMISSION CHECK] Built-in admin role, allowing access');
    return true;
  }
  
  // For student role, allow access to academic verifications and jobs by default
  if (role === 'student') {
    if (route === '/academic-verifications' || route === '/jobs' || route === '/disputes') {
      console.log('✅ [PERMISSION CHECK] Student role accessing allowed route');
      return true;
    }
  }
  
  // For employer role, allow access to jobs by default
  if (role === 'employer') {
    if (route === '/jobs') {
      console.log('✅ [PERMISSION CHECK] Employer role accessing jobs');
      return true;
    }
  }
  
  // For verifyDocAdmin role, allow access to academic verifications
  if (role === 'verifyDocAdmin') {
    if (route === '/academic-verifications') {
      console.log('✅ [PERMISSION CHECK] VerifyDocAdmin role accessing academic verifications');
      return true;
    }
  }
  
  // If no permissions array, deny access (except for role-based access above)
  if (!permissions || !Array.isArray(permissions)) {
    console.log('❌ [PERMISSION CHECK] No permissions or not an array');
    return false;
  }

  console.log('🔍 [PERMISSION CHECK] Checking', permissions.length, 'permissions');
  
  const routePermission = permissions.find((perm) => {
    const permRoute = perm.route || "";
    const matches = routeMatches(route, permRoute);
    console.log(`  - Checking permission route "${permRoute}" against "${route}": ${matches}`);
    return matches;
  });

  if (!routePermission) {
    console.log('❌ [PERMISSION CHECK] No matching permission found for route:', route);
    return false;
  }

  console.log('✅ [PERMISSION CHECK] Found matching permission:', routePermission);
  
  const hasPermission = (
    routePermission.permission.view === true ||
    routePermission.permission.create === true ||
    routePermission.permission.edit === true ||
    routePermission.permission.delete === true
  );
  
  console.log('🔍 [PERMISSION CHECK] Permission check result:', hasPermission);
  console.log('  - view:', routePermission.permission.view);
  console.log('  - create:', routePermission.permission.create);
  console.log('  - edit:', routePermission.permission.edit);
  console.log('  - delete:', routePermission.permission.delete);
  
  return hasPermission;
};

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { hasAnyPermission } from "../../utils/permissionUtils";
import { SIDEBAR_MENU_CONFIG } from "../../config/sidebarMenuConfig";
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  XMarkIcon,
  CreditCardIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarSquareIcon,
  LockClosedIcon,
  FolderIcon,
  FireIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const role = useSelector((state: any) => state.auth.role);
  const permissions = useSelector((state: any) => state.auth.permissions);

  // Filter menu items based on user permissions
  const visibleMenuItems = useMemo(() => {
    if (!permissions || !Array.isArray(permissions)) {
      return [];
    }

    // For superadmin/admin/subadmin, show all menu items (they bypass permissions)
    if (role === "superadmin" || role === "admin" || role === "subadmin") {
      return SIDEBAR_MENU_CONFIG;
    }

    // For other roles, filter based on permissions
    return SIDEBAR_MENU_CONFIG.filter((config) => {
      return hasAnyPermission(permissions, config.permissionRoute);
    });
  }, [permissions, role]);

  // Log permissions on component mount/update
  React.useEffect(() => {
    console.log('🔍 [SIDEBAR] Sidebar rendered with:');
    console.log('  - Role:', role);
    console.log('  - Permissions:', permissions);
    console.log('  - Visible menu items:', visibleMenuItems.length);
  }, [role, permissions, visibleMenuItems]);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-gray-300 flex flex-col fixed left-0 top-0 
          overflow-y-auto scrollbar-hide shadow-2xl z-50 transition-transform duration-300
          lg:translate-x-0 lg:rounded-tr-3xl lg:rounded-br-3xl border-r border-slate-700/50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-purple-600/10 to-indigo-600/10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
              O
            </div>
            <div>
              <h2 className="text-white font-bold text-lg bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Ogera
              </h2>
              <p className="text-xs text-purple-300/70 uppercase font-medium">
                {role}
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* ========================= ROLE-BASED MENU ========================= */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard - All Users */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
            onClick={() => handleNavigation("/dashboard")}
          >
            <HomeIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="font-medium group-hover:text-white transition-colors">
              Dashboard
            </span>
          </div>

          {/* For verifyDocAdmin: Show only Academic Verification */}
          {role === "verifyDocAdmin" && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                onClick={() => toggleMenu("academic")}
              >
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="font-medium group-hover:text-white transition-colors">
                    Academic Verification
                  </span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                    openMenu === "academic" ? "rotate-180 text-purple-400" : ""
                  }`}
                />
              </div>

              {openMenu === "academic" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/pending")
                    }
                  >
                    <ClockIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Pending Reviews
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/approved")
                    }
                  >
                    <CheckCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-green-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Approved
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/rejected")
                    }
                  >
                    <XCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-red-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Rejected
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/performance")
                    }
                  >
                    <ChartBarSquareIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Performance Track
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/locks")
                    }
                  >
                    <LockClosedIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Account Locks
                    </span>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* User - Admin/SuperAdmin with permission check */}
          {(role === "superadmin" || hasPermission("/users")) && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                onClick={() => toggleMenu("users")}
              >
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="font-medium group-hover:text-white transition-colors">
                    User
                  </span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                    openMenu === "users" ? "rotate-180 text-purple-400" : ""
                  }`}
                />
              </div>

              {openMenu === "users" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() => handleNavigation("/dashboard/users/all")}
                  >
                    <UserGroupIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      All Users
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/users/students")
                    }
                  >
                    <AcademicCapIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Students
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/users/employers")
                    }
                  >
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Employers
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() => handleNavigation("/dashboard/users/pending")}
                  >
                    <ClockIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Pending Approval
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/users/suspended")
                    }
                  >
                    <NoSymbolIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Suspended
                    </span>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Admin - Only SuperAdmin */}
          {role === "superadmin" && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                onClick={() => toggleMenu("admin")}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="font-medium group-hover:text-white transition-colors">
                    Admin
                  </span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                    openMenu === "admin" ? "rotate-180 text-purple-400" : ""
                  }`}
                />
              </div>

              {openMenu === "admin" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() => handleNavigation("/dashboard/admin/create")}
                  >
                    <PlusIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Create
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() => handleNavigation("/dashboard/admin/view")}
                  >
                    <EyeIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      View
                    </span>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Permission - Only SuperAdmin */}
          {role === "superadmin" && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                onClick={() => toggleMenu("permission")}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="font-medium group-hover:text-white transition-colors">
                    Permission
                  </span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                    openMenu === "permission" ? "rotate-180 text-purple-400" : ""
                  }`}
                />
              </div>

              {openMenu === "permission" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() => handleNavigation("/dashboard/permission/create")}
                  >
                    <PlusIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Create
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() => handleNavigation("/dashboard/permission/view")}
                  >
                    <EyeIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      View
                    </span>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Role - Only SuperAdmin */}
          {role === "superadmin" && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                onClick={() => toggleMenu("role")}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="font-medium group-hover:text-white transition-colors">
                    Role
                  </span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                    openMenu === "role" ? "rotate-180 text-purple-400" : ""
                  }`}
                />
              </div>

              {openMenu === "role" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() => handleNavigation("/dashboard/role/create")}
                  >
                    <PlusIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Create
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() => handleNavigation("/dashboard/role/view")}
                  >
                    <EyeIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      View
                    </span>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Academic Verification - Student, Admin, or users with permission (not verifyDocAdmin, already shown above, not employer) */}
          {(() => {
            const roleCheck = role === "student" || role === "admin" || role === "superadmin";
            const permissionCheck = hasAnyPermission(permissions, "/academic-verifications");
            const shouldShow = (roleCheck || permissionCheck) && role !== "verifyDocAdmin" && role !== "employer";
            
            console.log('🔍 [SIDEBAR] Academic Verification check:');
            console.log('  - Role:', role);
            console.log('  - Role check (student/admin/superadmin):', roleCheck);
            console.log('  - Permission check result:', permissionCheck);
            console.log('  - Should show:', shouldShow);
            
            return shouldShow;
          })() && (
            <div>
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                onClick={() => toggleMenu("academic")}
              >
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="font-medium group-hover:text-white transition-colors">
                    Academic Verification
                  </span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                    openMenu === "academic" ? "rotate-180 text-purple-400" : ""
                  }`}
                />
              </div>

              {openMenu === "academic" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/pending")
                    }
                  >
                    <ClockIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Pending Reviews
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/approved")
                    }
                  >
                    <CheckCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-green-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Approved
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/rejected")
                    }
                  >
                    <XCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-red-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Rejected
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/performance")
                    }
                  >
                    <ChartBarSquareIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Performance Track
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                    onClick={() =>
                      handleNavigation("/dashboard/academic/locks")
                    }
                  >
                    <LockClosedIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                    <span className="text-gray-400 group-hover/item:text-white transition-colors">
                      Account Locks
                    </span>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Jobs - Student, Employer, Admin, or users with permission (not verifyDocAdmin) */}
          {(() => {
            const roleCheck = role === "student" || role === "employer" || role === "admin" || role === "superadmin";
            const permissionCheck = hasAnyPermission(permissions, "/jobs");
            const shouldShow = (roleCheck || permissionCheck) && role !== "verifyDocAdmin";
            
            console.log('🔍 [SIDEBAR] Jobs check:');
            console.log('  - Role:', role);
            console.log('  - Role check (student/employer/admin/superadmin):', roleCheck);
            console.log('  - Permission check result:', permissionCheck);
            console.log('  - Should show:', shouldShow);
            
            return shouldShow;
          })() && (
              <div>
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                  onClick={() => toggleMenu("jobs")}
                >
                  <div className="flex items-center gap-3">
                    <BriefcaseIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <span className="font-medium group-hover:text-white transition-colors">
                      Jobs
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                      openMenu === "jobs" ? "rotate-180 text-purple-400" : ""
                    }`}
                  />
                </div>

                {openMenu === "jobs" && (
                  <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                    {(role === "employer" || role === "superadmin") && (
                      <>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/create")}
                        >
                          <PlusIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-white transition-colors">
                            Create Job
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/applications")}
                        >
                          <BriefcaseIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-white transition-colors">
                            Applications
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/applications/accepted")}
                        >
                          <CheckCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-green-400 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-white transition-colors">
                            Accepted
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/applications/rejected")}
                        >
                          <XCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-red-400 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-white transition-colors">
                            Rejected
                          </span>
                        </li>
                      </>
                    )}
                    {role === "student" && (
                      <>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/my-applications")}
                        >
                          <BriefcaseIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-white transition-colors">
                            My Applications
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/my-applications/accepted")}
                        >
                          <CheckCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-green-400 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-white transition-colors">
                            Accepted
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/my-applications/rejected")}
                        >
                          <XCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-red-400 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-white transition-colors">
                            Rejected
                          </span>
                        </li>
                      </>
                    )}
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                      onClick={() => handleNavigation("/dashboard/jobs/all")}
                    >
                      <FolderIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                      <span className="text-gray-400 group-hover/item:text-white transition-colors">
                        All Jobs
                      </span>
                    </li>
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                      onClick={() => handleNavigation("/dashboard/jobs/active")}
                    >
                      <FireIcon className="h-4 w-4 text-gray-500 group-hover/item:text-orange-400 transition-colors" />
                      <span className="text-gray-400 group-hover/item:text-white transition-colors">
                        Active Jobs
                      </span>
                    </li>
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                      onClick={() =>
                        handleNavigation("/dashboard/jobs/completed")
                      }
                    >
                      <CheckBadgeIcon className="h-4 w-4 text-gray-500 group-hover/item:text-green-400 transition-colors" />
                      <span className="text-gray-400 group-hover/item:text-white transition-colors">
                        Completed
                      </span>
                    </li>
                    {(role === "admin" || role === "superadmin") && (
                      <li
                        className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                        onClick={() =>
                          handleNavigation("/dashboard/jobs/pending")
                        }
                      >
                        <ClockIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                        <span className="text-gray-400 group-hover/item:text-white transition-colors">
                          Pending Approval
                        </span>
                      </li>
                    )}
                    {(role === "admin" || role === "superadmin") && (
                      <li
                        className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                        onClick={() =>
                          handleNavigation("/dashboard/jobs/categories")
                        }
                      >
                        <BriefcaseIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                        <span className="text-gray-400 group-hover/item:text-white transition-colors">
                          Job Categories
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

          {/* Disputes - Student, Admin (not verifyDocAdmin, not employer) */}
          {((role === "student" || role === "admin" || role === "superadmin") &&
            role !== "verifyDocAdmin" &&
            role !== "employer" &&
            (role === "superadmin" || role === "admin" || hasPermission("/disputes"))) && (
              <div>
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                  onClick={() => toggleMenu("disputes")}
                >
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <span className="font-medium group-hover:text-white transition-colors">
                      Disputes
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                      openMenu === "disputes"
                        ? "rotate-180 text-purple-400"
                        : ""
                    }`}
                  />
                </div>

                {openMenu === "disputes" && (
                  <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                      onClick={() =>
                        handleNavigation("/dashboard/disputes/open")
                      }
                    >
                      <ExclamationTriangleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-yellow-400 transition-colors" />
                      <span className="text-gray-400 group-hover/item:text-white transition-colors">
                        Open Disputes
                      </span>
                    </li>
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                      onClick={() =>
                        handleNavigation("/dashboard/disputes/in-progress")
                      }
                    >
                      <ArrowPathIcon className="h-4 w-4 text-gray-500 group-hover/item:text-blue-400 transition-colors" />
                      <span className="text-gray-400 group-hover/item:text-white transition-colors">
                        In Progress
                      </span>
                    </li>
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                      onClick={() =>
                        handleNavigation("/dashboard/disputes/resolved")
                      }
                    >
                      <CheckCircleIcon className="h-4 w-4 text-gray-500 group-hover/item:text-green-400 transition-colors" />
                      <span className="text-gray-400 group-hover/item:text-white transition-colors">
                        Resolved
                      </span>
                    </li>
                  </ul>
                )}
              </div>
            )}

          {/* Analytics - All roles with permission check (not verifyDocAdmin) */}
          {role !== "verifyDocAdmin" &&
            (role === "superadmin" || hasPermission("/analytics")) && (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                onClick={() => handleNavigation("/dashboard/analytics")}
              >
                <ChartBarIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="font-medium group-hover:text-white transition-colors">
                  Analytics
                </span>
              </div>
            )}

          {/* Transaction - All roles with permission check (not verifyDocAdmin) */}
          {role !== "verifyDocAdmin" &&
            (role === "superadmin" || hasPermission("/transactions")) && (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                onClick={() => handleNavigation("/dashboard/transactions")}
              >
                <CreditCardIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="font-medium group-hover:text-white transition-colors">
                  Transaction
                </span>
              </div>
            )}

          {/* ========================= PERMISSION-BASED MENU ITEMS ========================= */}
          {/* Dynamically render menu items based on JSON permissions from role configuration */}
          {visibleMenuItems
            .filter((menuConfig) => {
              // Skip items that are already shown in hardcoded sections above to avoid duplicates
              
              // Role menu is hardcoded for superadmin
              if (role === "superadmin" && menuConfig.menuKey === "role") {
                return false;
              }
              
              // Academic is hardcoded for verifyDocAdmin
              if (role === "verifyDocAdmin" && menuConfig.menuKey === "academic") {
                return false;
              }
              
              // Show all other permission-based menu items
              // For custom roles with JSON permissions, these items will be displayed here
              return true;
            })
            .map((menuConfig) => {
              const IconComponent = menuConfig.icon;

              // Render menu item with submenu
              if (menuConfig.hasSubmenu && menuConfig.submenuItems) {
                return (
                  <div key={menuConfig.menuKey}>
                    <div
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                      onClick={() => toggleMenu(menuConfig.menuKey)}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                        <span className="font-medium group-hover:text-white transition-colors">
                          {menuConfig.label}
                        </span>
                      </div>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 text-gray-400 group-hover:text-white ${
                          openMenu === menuConfig.menuKey ? "rotate-180 text-purple-400" : ""
                        }`}
                      />
                    </div>

                    {openMenu === menuConfig.menuKey && (
                      <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                        {menuConfig.submenuItems.map((subItem, idx) => {
                          const SubIcon = subItem.icon || FolderIcon;
                          return (
                            <li
                              key={idx}
                              className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-slate-700/50 transition-all duration-200 group/item"
                              onClick={() => handleNavigation(subItem.path)}
                            >
                              <SubIcon className="h-4 w-4 text-gray-500 group-hover/item:text-purple-400 transition-colors" />
                              <span className="text-gray-400 group-hover/item:text-white transition-colors">
                                {subItem.label}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              }

              // Render simple menu item without submenu
              return (
                <div
                  key={menuConfig.menuKey}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                  onClick={() => handleNavigation(menuConfig.directPath || menuConfig.basePath)}
                >
                  <IconComponent className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="font-medium group-hover:text-white transition-colors">
                    {menuConfig.label}
                  </span>
                </div>
              );
            })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

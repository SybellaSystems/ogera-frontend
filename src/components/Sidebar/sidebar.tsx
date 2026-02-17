import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { hasAnyPermission } from "../../utils/permissionUtils";
import type { Role } from "../../utils/permissionUtils";
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
  DocumentTextIcon,
  BanknotesIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isActiveGroup = (prefix: string) => location.pathname.startsWith(prefix);

  const roleRaw = useSelector((state: any) => state.auth.role) as Role | string | undefined;
  const permissions = useSelector((state: any) => state.auth.permissions);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : "";

  // Check if this is a built-in admin role (superadmin or exact "admin" roleName) that bypasses permissions
  // Note: Custom admin roles like "admin1", "admin2" etc. are NOT built-in admins and must check permissions
  const isBuiltInAdmin = role === "superadmin" || role === "admin";

  // Check if this is a custom admin role (has roleType "admin" but roleName is not exactly "admin")
  // For custom admin roles, we only check permissions, not role-based checks
  const isCustomAdmin = !isBuiltInAdmin && permissions && Array.isArray(permissions) && permissions.length > 0;

  // Filter menu items based on user permissions
  const visibleMenuItems = useMemo(() => {
    // For superadmin or exact "admin" roleName, show all menu items (they bypass permissions)
    // Custom admin roles (like "admin1", "admin2") must check permissions
    if (isBuiltInAdmin) {
      return SIDEBAR_MENU_CONFIG;
    }

    // For custom admin roles and other roles, only show items they have permissions for
    // If permissions are null or empty, show nothing (only Dashboard will be visible)
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return [];
    }

    // Filter based on permissions
    return SIDEBAR_MENU_CONFIG.filter((config) => {
      return hasAnyPermission(permissions, config.permissionRoute, role);
    });
  }, [permissions, isBuiltInAdmin]);

  // Log permissions on component mount/update
  React.useEffect(() => {
    console.log('🔍 [SIDEBAR] Sidebar rendered with:');
    console.log('  - Role:', role);
    console.log('  - Is built-in admin:', isBuiltInAdmin);
    console.log('  - Is custom admin:', isCustomAdmin);
    console.log('  - Permissions:', permissions);
    console.log('  - Permissions type:', typeof permissions);
    console.log('  - Permissions is array:', Array.isArray(permissions));
    console.log('  - Visible menu items:', visibleMenuItems.length);
    if (permissions && Array.isArray(permissions)) {
      console.log('  - Permission routes:', permissions.map(p => p.route));
    }
  }, [role, permissions, visibleMenuItems, isBuiltInAdmin, isCustomAdmin]);

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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          h-screen w-64 bg-[#101828] text-white flex flex-col fixed left-0 top-0
          overflow-y-auto scrollbar-hide shadow-2xl z-50 transition-transform duration-300
          lg:translate-x-0 lg:rounded-tr-3xl lg:rounded-br-3xl border-r border-[#1D2939]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between p-6 border-b border-[#1D2939]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#7F56D9] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#7F56D9]/30">
              O
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                Ogera
              </h2>
                <p className="text-xs text-white/50 uppercase font-medium">
                {String(roleRaw || "").toUpperCase()}
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#1D2939]"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* ========================= ROLE-BASED MENU ========================= */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard - All Users */}
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
              isActive("/dashboard")
                ? "bg-[#9F7AEA]/15 text-white border-l-2 border-[#9F7AEA]"
                : "hover:bg-[#9F7AEA]/10"
            }`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <HomeIcon className={`h-5 w-5 transition-colors ${isActive("/dashboard") ? "text-white" : "text-white/70 group-hover:text-white"}`} />
            <span className={`font-medium transition-colors ${isActive("/dashboard") ? "text-white" : "group-hover:text-white"}`}>
              Dashboard
            </span>
          </div>

          {/* For verifyDocAdmin: Show only Academic Verification */}
          {role === "verifyDocAdmin" && (
            <div>
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/academic") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                onClick={() => toggleMenu("academic")}
              >
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-white transition-colors">
                      Academic Verification
                    </span>
                    {isActiveGroup("/dashboard/academic") && openMenu !== "academic" && (
                      <span className="text-xs text-[#9F7AEA] font-medium">
                        {location.pathname === "/dashboard/academic/pending" && "Pending Reviews"}
                        {location.pathname === "/dashboard/academic/approved" && "Approved"}
                        {location.pathname === "/dashboard/academic/rejected" && "Rejected"}
                        {/* {location.pathname === "/dashboard/academic/performance" && "Performance Track"} */}
                        {/* {location.pathname === "/dashboard/academic/locks" && "Account Locks"} */}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                    openMenu === "academic" ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>

              {openMenu === "academic" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/pending")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/pending")
                    }
                  >
                    <ClockIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/pending")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/pending")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Pending Reviews
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/approved")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/approved")
                    }
                  >
                    <CheckCircleIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/approved")
                        ? "text-green-400"
                        : "text-white/40 group-hover/item:text-green-400"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/approved")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Approved
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/rejected")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/rejected")
                    }
                  >
                    <XCircleIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/rejected")
                        ? "text-red-400"
                        : "text-white/40 group-hover/item:text-red-400"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/rejected")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Rejected
                    </span>
                  </li>
                  {/* <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/performance")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/performance")
                    }
                  >
                    <ChartBarSquareIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/performance")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/performance")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Performance Track
                    </span>
                  </li> */}
                  {/* <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/locks")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/locks")
                    }
                  >
                    <LockClosedIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/locks")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/locks")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Account Locks
                    </span>
                  </li> */}
                </ul>
              )}
            </div>
          )}

          {/* User - Admin/SuperAdmin with permission check */}
          {(isBuiltInAdmin || hasAnyPermission(permissions, "/users", role)) && (
            <div>
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/users") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                onClick={() => toggleMenu("users")}
              >
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-white transition-colors">
                      User
                    </span>
                    {isActiveGroup("/dashboard/users") && openMenu !== "users" && (
                      <span className="text-xs text-[#9F7AEA] font-medium">
                        {location.pathname === "/dashboard/users/all" && "All Users"}
                        {location.pathname === "/dashboard/users/students" && "Students"}
                        {location.pathname === "/dashboard/users/employers" && "Employers"}
                        {/* {location.pathname === "/dashboard/users/pending" && "Pending Approval"} */}
                        {/* {location.pathname === "/dashboard/users/suspended" && "Suspended"} */}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                    openMenu === "users" ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>

              {openMenu === "users" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/users/all")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() => handleNavigation("/dashboard/users/all")}
                  >
                    <UserGroupIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/users/all")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/users/all")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      All Users
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/users/students")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/users/students")
                    }
                  >
                    <AcademicCapIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/users/students")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/users/students")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Students
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/users/employers")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/users/employers")
                    }
                  >
                    <BuildingOfficeIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/users/employers")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/users/employers")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Employers
                    </span>
                  </li>
                  {/* <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/users/pending")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() => handleNavigation("/dashboard/users/pending")}
                  >
                    <ClockIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/users/pending")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/users/pending")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Pending Approval
                    </span>
                  </li> */}
                  {/* <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/users/suspended")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/users/suspended")
                    }
                  >
                    <NoSymbolIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/users/suspended")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/users/suspended")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Suspended
                    </span>
                  </li> */}
                </ul>
              )}
            </div>
          )}

          {/* Admin - Only SuperAdmin */}
          {role === "superadmin" && (
            <div>
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/admin") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                onClick={() => toggleMenu("admin")}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-white transition-colors">
                      Admin
                    </span>
                    {isActiveGroup("/dashboard/admin") && openMenu !== "admin" && (
                      <span className="text-xs text-[#9F7AEA] font-medium">
                        {location.pathname === "/dashboard/admin/create" && "Create"}
                        {location.pathname === "/dashboard/admin/view" && "View"}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                    openMenu === "admin" ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>

              {openMenu === "admin" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/admin/create")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() => handleNavigation("/dashboard/admin/create")}
                  >
                    <PlusIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/admin/create")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/admin/create")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Create
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/admin/view")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() => handleNavigation("/dashboard/admin/view")}
                  >
                    <EyeIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/admin/view")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/admin/view")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/permission") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                onClick={() => toggleMenu("permission")}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-white transition-colors">
                      Permission
                    </span>
                    {isActiveGroup("/dashboard/permission") && openMenu !== "permission" && (
                      <span className="text-xs text-[#9F7AEA] font-medium">
                        {location.pathname === "/dashboard/permission/create" && "Create"}
                        {location.pathname === "/dashboard/permission/view" && "View"}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                    openMenu === "permission" ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>

              {openMenu === "permission" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/permission/create")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() => handleNavigation("/dashboard/permission/create")}
                  >
                    <PlusIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/permission/create")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/permission/create")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Create
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/permission/view")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() => handleNavigation("/dashboard/permission/view")}
                  >
                    <EyeIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/permission/view")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/permission/view")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/role") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                onClick={() => toggleMenu("role")}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-white transition-colors">
                      Role
                    </span>
                    {isActiveGroup("/dashboard/role") && openMenu !== "role" && (
                      <span className="text-xs text-[#9F7AEA] font-medium">
                        {location.pathname === "/dashboard/role/create" && "Create"}
                        {location.pathname === "/dashboard/role/view" && "View"}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                    openMenu === "role" ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>

              {openMenu === "role" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/role/create")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() => handleNavigation("/dashboard/role/create")}
                  >
                    <PlusIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/role/create")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/role/create")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Create
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/role/view")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() => handleNavigation("/dashboard/role/view")}
                  >
                    <EyeIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/role/view")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/role/view")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      View
                    </span>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Academic Verification - Student, Admin, or users with permission (not verifyDocAdmin, already shown above, not employer) */}
          {(() => {
            const roleCheck = role === "student" || isBuiltInAdmin;
            const permissionCheck = hasAnyPermission(permissions, "/academic-verifications", role);
            const shouldShow = (roleCheck || permissionCheck) && role !== "verifyDocAdmin" && role !== "employer";
            
            console.log('🔍 [SIDEBAR] Academic Verification check:');
            console.log('  - Role:', role);
            console.log('  - Is built-in admin:', isBuiltInAdmin);
            console.log('  - Role check (student/built-in-admin):', roleCheck);
            console.log('  - Permission check result:', permissionCheck);
            console.log('  - Should show:', shouldShow);
            
            return shouldShow;
          })() && (
            <div>
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/academic") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                onClick={() => toggleMenu("academic")}
              >
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-white transition-colors">
                      Academic Verification
                    </span>
                    {isActiveGroup("/dashboard/academic") && openMenu !== "academic" && (
                      <span className="text-xs text-[#9F7AEA] font-medium">
                        {location.pathname === "/dashboard/academic/pending" && "Pending Reviews"}
                        {location.pathname === "/dashboard/academic/approved" && "Approved"}
                        {location.pathname === "/dashboard/academic/rejected" && "Rejected"}
                        {location.pathname === "/dashboard/academic/performance" && "Performance Track"}
                        {/* {location.pathname === "/dashboard/academic/locks" && "Account Locks"} */}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                    openMenu === "academic" ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>

              {openMenu === "academic" && (
                <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/pending")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/pending")
                    }
                  >
                    <ClockIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/pending")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/pending")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Pending Reviews
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/approved")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/approved")
                    }
                  >
                    <CheckCircleIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/approved")
                        ? "text-green-400"
                        : "text-white/40 group-hover/item:text-green-400"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/approved")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Approved
                    </span>
                  </li>
                  <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/rejected")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/rejected")
                    }
                  >
                    <XCircleIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/rejected")
                        ? "text-red-400"
                        : "text-white/40 group-hover/item:text-red-400"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/rejected")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Rejected
                    </span>
                  </li>
                  {/* <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/performance")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/performance")
                    }
                  >
                    <ChartBarSquareIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/performance")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/performance")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Performance Track
                    </span>
                  </li> */}
                  {/* <li
                    className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                      isActive("/dashboard/academic/locks")
                        ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                        : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                    }`}
                    onClick={() =>
                      handleNavigation("/dashboard/academic/locks")
                    }
                  >
                    <LockClosedIcon className={`h-4 w-4 transition-colors ${
                      isActive("/dashboard/academic/locks")
                        ? "text-[#9F7AEA]"
                        : "text-white/40 group-hover/item:text-[#9F7AEA]"
                    }`} />
                    <span className={`transition-colors ${
                      isActive("/dashboard/academic/locks")
                        ? "text-white font-medium"
                        : "group-hover/item:text-white"
                    }`}>
                      Account Locks
                    </span>
                  </li> */}
                </ul>
              )}
            </div>
          )}

          {/* Jobs - Student, Employer, Admin, or users with permission (not verifyDocAdmin) */}
          {(() => {
            // For built-in admin roles, show Jobs. For custom admin roles, only check permissions.
            const roleCheck = role === "student" || role === "employer" || isBuiltInAdmin;
            const permissionCheck = hasAnyPermission(permissions, "/jobs", role);
            const shouldShow = (roleCheck || permissionCheck) && role !== "verifyDocAdmin";
            
            console.log('🔍 [SIDEBAR] Jobs check:');
            console.log('  - Role:', role);
            console.log('  - Is built-in admin:', isBuiltInAdmin);
            console.log('  - Is custom admin:', isCustomAdmin);
            console.log('  - Role check (student/employer/built-in-admin):', roleCheck);
            console.log('  - Permission check result:', permissionCheck);
            console.log('  - Should show:', shouldShow);
            
            return shouldShow;
          })() && (
              <div>
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/jobs") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                  onClick={() => toggleMenu("jobs")}
                >
                  <div className="flex items-center gap-3">
                    <BriefcaseIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                    <div className="flex flex-col">
                      <span className="font-medium group-hover:text-white transition-colors">
                        Jobs
                      </span>
                      {isActiveGroup("/dashboard/jobs") && openMenu !== "jobs" && (
                        <span className="text-xs text-[#9F7AEA] font-medium">
                          {location.pathname === "/dashboard/jobs/create" && "Create Job"}
                          {location.pathname === "/dashboard/jobs/applications" && "Applications"}
                          {location.pathname === "/dashboard/jobs/applications/accepted" && "Accepted"}
                          {location.pathname === "/dashboard/jobs/applications/rejected" && "Rejected"}
                          {location.pathname === "/dashboard/jobs/my-applications" && "My Applications"}
                          {location.pathname === "/dashboard/jobs/my-applications/accepted" && "Accepted"}
                          {location.pathname === "/dashboard/jobs/my-applications/rejected" && "Rejected"}
                          {location.pathname === "/dashboard/jobs/my-applications/completed" && "Completed"}
                          {location.pathname === "/dashboard/jobs/categories" && "Categories"}
                          {location.pathname === "/dashboard/jobs/all" && "All Jobs"}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                      openMenu === "jobs" ? "rotate-180 text-white" : ""
                    }`}
                  />
                </div>

                {openMenu === "jobs" && (
                  <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                    {(role === "employer" || role === "superadmin") && (
                      <>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/create")}
                        >
                          <PlusIcon className="h-4 w-4 text-white/40 group-hover/item:text-[#9F7AEA] transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            Create Job
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/applications")}
                        >
                          <BriefcaseIcon className="h-4 w-4 text-white/40 group-hover/item:text-[#9F7AEA] transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            Applications
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/applications/accepted")}
                        >
                          <CheckCircleIcon className="h-4 w-4 text-white/40 group-hover/item:text-green-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            Accepted
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/applications/rejected")}
                        >
                          <XCircleIcon className="h-4 w-4 text-white/40 group-hover/item:text-red-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            Rejected
                          </span>
                        </li>
                      </>
                    )}
                    {role === "student" && (
                      <>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/my-applications")}
                        >
                          <BriefcaseIcon className="h-4 w-4 text-white/40 group-hover/item:text-[#9F7AEA] transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            My Applications
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/my-applications/accepted")}
                        >
                          <CheckCircleIcon className="h-4 w-4 text-white/40 group-hover/item:text-green-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            Accepted
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() => handleNavigation("/dashboard/jobs/my-applications/rejected")}
                        >
                          <XCircleIcon className="h-4 w-4 text-white/40 group-hover/item:text-red-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            Rejected
                          </span>
                        </li>
                      </>
                    )}
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                      onClick={() => handleNavigation("/dashboard/jobs/all")}
                    >
                      <FolderIcon className="h-4 w-4 text-white/40 group-hover/item:text-[#9F7AEA] transition-colors" />
                      <span className="text-white/60 group-hover/item:text-white transition-colors">
                        All Jobs
                      </span>
                    </li>
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                      onClick={() => handleNavigation("/dashboard/jobs/active")}
                    >
                      <FireIcon className="h-4 w-4 text-white/40 group-hover/item:text-orange-400 transition-colors" />
                      <span className="text-white/60 group-hover/item:text-white transition-colors">
                        Active Jobs
                      </span>
                    </li>
                    <li
                      className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                      onClick={() =>
                        handleNavigation("/dashboard/jobs/completed")
                      }
                    >
                      <CheckBadgeIcon className="h-4 w-4 text-white/40 group-hover/item:text-green-400 transition-colors" />
                      <span className="text-white/60 group-hover/item:text-white transition-colors">
                        Completed
                      </span>
                    </li>
                    {/* {isBuiltInAdmin && (
                      <li
                        className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                        onClick={() =>
                          handleNavigation("/dashboard/jobs/pending")
                        }
                      >
                        <ClockIcon className="h-4 w-4 text-white/40 group-hover/item:text-[#9F7AEA] transition-colors" />
                        <span className="text-white/60 group-hover/item:text-white transition-colors">
                          Pending Approval
                        </span>
                      </li>
                    )} */}
                    {isBuiltInAdmin && (
                      <li
                        className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                        onClick={() =>
                          handleNavigation("/dashboard/jobs/categories")
                        }
                      >
                        <BriefcaseIcon className="h-4 w-4 text-white/40 group-hover/item:text-[#9F7AEA] transition-colors" />
                        <span className="text-white/60 group-hover/item:text-white transition-colors">
                          Job Categories
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

          {/* Disputes - Student, Admin (not verifyDocAdmin, not employer) */}
          {/* {((role === "student" || isBuiltInAdmin) &&
            role !== "verifyDocAdmin" &&
            role !== "employer" &&
            (isBuiltInAdmin || hasAnyPermission(permissions, "/disputes", role))) && ( */}
                {(
            isBuiltInAdmin || 
            role === "superadmin" || 
           (role !== "verifyDocAdmin" && hasAnyPermission(permissions, "/disputes", role)) ||
           ((role === "student" || role === "employer") && hasAnyPermission(permissions, "/disputes", role))
            ) && (
              <div>
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/disputes") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                  onClick={() => toggleMenu("disputes")}
                >
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                    <div className="flex flex-col">
                      <span className="font-medium group-hover:text-white transition-colors">
                        Disputes
                      </span>
                      {isActiveGroup("/dashboard/disputes") && openMenu !== "disputes" && (
                        <span className="text-xs text-[#9F7AEA] font-medium">
                                                    {location.pathname === "/dashboard/disputes" && "All Disputes"}
                          {location.pathname === "/dashboard/disputes/open" && "Open Disputes"}
                          {location.pathname === "/dashboard/disputes/in-progress" && "In Progress"}
                          {location.pathname === "/dashboard/disputes/resolved" && "Resolved"}
                           {location.pathname === "/dashboard/disputes/create" && "Create Dispute"}
                          {location.pathname.startsWith("/dashboard/disputes/detail") && "Dispute Detail"}
                          {location.pathname === "/dashboard/disputes/my-disputes" && "My Disputes"}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                      openMenu === "disputes"
                        ? "rotate-180 text-white"
                        : ""
                    }`}
                  />
                </div>

                {openMenu === "disputes" && (
                  <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                    {(role !== "student" && role !== "employer") && (
                      <>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() =>
                            handleNavigation("/dashboard/disputes/open")
                          }
                        >
                          <ExclamationTriangleIcon className="h-4 w-4 text-white/40 group-hover/item:text-yellow-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            Open Disputes
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() =>
                            handleNavigation("/dashboard/disputes/in-progress")
                          }
                        >
                          <ArrowPathIcon className="h-4 w-4 text-white/40 group-hover/item:text-blue-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            In Progress
                          </span>
                        </li>
                        <li
                          className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                          onClick={() =>
                            handleNavigation("/dashboard/disputes/resolved")
                          }
                        >
                          <CheckCircleIcon className="h-4 w-4 text-white/40 group-hover/item:text-green-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                            Resolved
                          </span>
                        </li>
                        <li
                        className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                        onClick={() => handleNavigation("/dashboard/disputes")}
                        >
                          <ListBulletIcon className="h-4 w-4 text-white/40 group-hover/item:text-purple-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                         All Disputes
                         </span>
                        </li>
                      </>
                    )}

                   {/* Only show Create Dispute and My Disputes for students and employers */}
                   {(role === "student" || role === "employer") && (
                     <>
                       <li
                        className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                       onClick={() => handleNavigation("/dashboard/disputes/create")}
                       >
                         <PlusIcon className="h-4 w-4 text-white/40 group-hover/item:text-purple-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                         Create Dispute
                         </span>
                       </li>

                      <li
                       className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                      onClick={() => handleNavigation("/dashboard/disputes/my-disputes")}
                      >
                        <UsersIcon className="h-4 w-4 text-white/40 group-hover/item:text-purple-400 transition-colors" />
                          <span className="text-white/60 group-hover/item:text-white transition-colors">
                       My Disputes
                       </span>
                      </li>
                     </>
                   )}
                  </ul>
                )}
              </div>
            )}

          {/* Analytics - All roles with permission check (not verifyDocAdmin) */}
          {role !== "verifyDocAdmin" &&
            (isBuiltInAdmin || hasAnyPermission(permissions, "/analytics", role)) && (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActive("/dashboard/analytics") ? "bg-[#9F7AEA]/15 text-white border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                onClick={() => handleNavigation("/dashboard/analytics")}
              >
                <ChartBarIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                <span className="font-medium group-hover:text-white transition-colors">
                  Analytics
                </span>
              </div>
            )}

          {/* Transaction - All roles with permission check (not verifyDocAdmin) */}
          {role !== "verifyDocAdmin" &&
            (isBuiltInAdmin || hasAnyPermission(permissions, "/transactions", role)) && (
              <div>
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup("/dashboard/transactions") ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                  onClick={() => toggleMenu("transactions")}
                >
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                    <div className="flex flex-col">
                      <span className="font-medium group-hover:text-white transition-colors">
                        Transaction
                      </span>
                      {isActiveGroup("/dashboard/transactions") && openMenu !== "transactions" && (
                        <span className="text-xs text-[#9F7AEA] font-medium">
                          {location.pathname === "/dashboard/transactions" && "Transactions"}
                          {location.pathname === "/dashboard/transactions/pay" && "Pay"}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                      openMenu === "transactions" ? "rotate-180 text-white" : ""
                    }`}
                  />
                </div>

                {openMenu === "transactions" && (
                  <ul className="pl-11 space-y-1 text-sm mt-2 animate-fadeIn">
                    <li
                      className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                        isActive("/dashboard/transactions")
                          ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                          : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                      }`}
                      onClick={() => handleNavigation("/dashboard/transactions")}
                    >
                      <DocumentTextIcon className={`h-4 w-4 transition-colors ${
                        isActive("/dashboard/transactions")
                          ? "text-[#9F7AEA]"
                          : "text-white/40 group-hover/item:text-[#9F7AEA]"
                      }`} />
                      <span className={`transition-colors ${
                        isActive("/dashboard/transactions")
                          ? "text-white font-medium"
                          : "group-hover/item:text-white"
                      }`}>
                        Transactions
                      </span>
                    </li>
                    <li
                      className={`flex items-center gap-2 cursor-pointer py-2 px-2 rounded-md transition-all duration-200 group/item ${
                        isActive("/dashboard/transactions/pay")
                          ? "bg-[#9F7AEA]/20 text-[#9F7AEA]"
                          : "hover:text-purple-300 hover:bg-[#9F7AEA]/10 text-white/60"
                      }`}
                      onClick={() => handleNavigation("/dashboard/transactions/pay")}
                    >
                      <BanknotesIcon className={`h-4 w-4 transition-colors ${
                        isActive("/dashboard/transactions/pay")
                          ? "text-[#9F7AEA]"
                          : "text-white/40 group-hover/item:text-[#9F7AEA]"
                      }`} />
                      <span className={`transition-colors ${
                        isActive("/dashboard/transactions/pay")
                          ? "text-white font-medium"
                          : "group-hover/item:text-white"
                      }`}>
                        Pay
                      </span>
                    </li>
                  </ul>
                )}
              </div>
            )}

          {/* ========================= PERMISSION-BASED MENU ITEMS ========================= */}
          {/* Dynamically render menu items based on JSON permissions from role configuration */}
          {visibleMenuItems
            .filter((menuConfig) => {
              // Skip items that are already shown in hardcoded sections above to avoid duplicates
              
              // These menu items are hardcoded above, so exclude them from dynamic rendering
              const hardcodedMenuKeys = [
                "jobs",           // Hardcoded Jobs menu
                "academic",       // Hardcoded Academic Verification menu
                "disputes",       // Hardcoded Disputes menu
                "analytics",      // Hardcoded Analytics menu
                "transactions",   // Hardcoded Transaction menu
              ];
              
              // Role menu is hardcoded for superadmin
              if (role === "superadmin" && menuConfig.menuKey === "role") {
                return false;
              }
              
              // Exclude all hardcoded menu items to prevent duplicates
              if (hardcodedMenuKeys.includes(menuConfig.menuKey)) {
                return false;
              }
              
              // Show all other permission-based menu items
              // For custom roles with JSON permissions, these items will be displayed here
              // (e.g., job-applications, notifications, etc.)
              return true;
            })
            .map((menuConfig) => {
              const IconComponent = menuConfig.icon;

              // Render menu item with submenu
              if (menuConfig.hasSubmenu && menuConfig.submenuItems) {
                return (
                  <div key={menuConfig.menuKey}>
                    <div
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActiveGroup(menuConfig.basePath) ? "bg-[#9F7AEA]/15 border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                      onClick={() => toggleMenu(menuConfig.menuKey)}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-white transition-colors">
                            {menuConfig.label}
                          </span>
                          {isActiveGroup(menuConfig.basePath) && openMenu !== menuConfig.menuKey && (
                            <span className="text-xs text-[#9F7AEA] font-medium">
                              {menuConfig.submenuItems.find(item => item.path === location.pathname)?.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 text-white/50 group-hover:text-white ${
                          openMenu === menuConfig.menuKey ? "rotate-180 text-white" : ""
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
                              className="flex items-center gap-2 hover:text-purple-300 cursor-pointer py-2 px-2 rounded-md hover:bg-[#9F7AEA]/10 transition-all duration-200 group/item"
                              onClick={() => handleNavigation(subItem.path)}
                            >
                              <SubIcon className="h-4 w-4 text-white/40 group-hover/item:text-[#9F7AEA] transition-colors" />
                              <span className="text-white/60 group-hover/item:text-white transition-colors">
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
              const itemPath = menuConfig.directPath || menuConfig.basePath;
              return (
                <div
                  key={menuConfig.menuKey}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActive(itemPath) ? "bg-[#9F7AEA]/15 text-white border-l-2 border-[#9F7AEA]" : "hover:bg-[#9F7AEA]/10"}`}
                  onClick={() => handleNavigation(itemPath)}
                >
                  <IconComponent className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
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

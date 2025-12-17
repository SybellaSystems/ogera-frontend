import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

          {/* User - Only Admin/SuperAdmin (not verifyDocAdmin) */}
          {(role === "admin" || role === "superadmin") && (
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

          {/* Academic Verification - Student, Admin (not verifyDocAdmin, already shown above, not employer) */}
          {(role === "student" ||
            role === "admin" ||
            role === "superadmin") && (
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

          {/* Jobs - Student, Employer, Admin (not verifyDocAdmin) */}
          {(role === "student" ||
            role === "employer" ||
            role === "admin" ||
            role === "superadmin") &&
            role !== "verifyDocAdmin" && (
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
          {(role === "student" || role === "admin" || role === "superadmin") &&
            role !== "verifyDocAdmin" &&
            role !== "employer" && (
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

          {/* Analytics - Employer, Admin (not verifyDocAdmin) */}
          {(role === "employer" || role === "admin" || role === "superadmin") &&
            role !== "verifyDocAdmin" && (
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

          {/* Transaction - Employer, Admin (not verifyDocAdmin) */}
          {(role === "employer" || role === "admin" || role === "superadmin") &&
            role !== "verifyDocAdmin" && (
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
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

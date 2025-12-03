/**
 * Alternative Header Implementation using RTK Query
 * This file shows how to use the RTK Query hook approach for logout
 * You can use this instead of the current header.tsx if you prefer RTK Query
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useLogoutMutation } from "../../services/api/authApi";
import { logout as logoutAction } from "../../features/auth/authSlice";

interface HeaderProps {
  onMenuClick: () => void;
}

const HeaderRTKQuery: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // RTK Query logout mutation
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout with RTK Query
  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);

      // Call logout API via RTK Query
      await logout(undefined).unwrap();

      // Clear Redux state
      dispatch(logoutAction());

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      // Even if API fails, clear local state and navigate
      dispatch(logoutAction());
      navigate("/login");
    }
  };

  return (
    <header className="w-full bg-white h-16 shadow-sm flex items-center justify-between px-4 md:px-6 relative">
      {/* Left side - Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-700 hover:text-gray-900 transition-colors"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Center - Can add breadcrumbs or title here */}
      <div className="text-gray-700 font-medium text-lg"></div>

      {/* Right side (notification + profile) */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notification icon */}
        <div className="relative cursor-pointer">
          <BellIcon className="h-6 w-6 text-gray-600 hover:text-gray-800 transition" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>
        </div>

        {/* Avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center cursor-pointer border border-purple-200 hover:shadow-md transition"
          >
            <img
              src="https://i.pravatar.cc/100?img=3"
              alt="User"
              className="h-8 w-8 rounded-full"
            />
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/dashboard/profile");
                }}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                {isLoggingOut && (
                  <svg
                    className="animate-spin h-4 w-4 text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderRTKQuery;


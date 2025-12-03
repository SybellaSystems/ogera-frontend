import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { logoutApi } from "../../services/api/logoutApi";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsDropdownOpen(false);

      // Call logout API
      await dispatch(logoutApi() as any);

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Navigate to login even if logout API fails
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-lg h-16 shadow-md border-b border-gray-200/50 flex items-center justify-between px-4 md:px-6 relative z-30">
      {/* Left side - Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Center - Can add breadcrumbs or title here */}
      <div className="text-gray-700 font-medium text-lg"></div>

      {/* Right side (notification + profile) */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Notification icon */}
        <div className="relative cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors group">
          <BellIcon className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
          <span className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
            2
          </span>
        </div>

        {/* Avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center cursor-pointer border-2 border-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-2 ring-purple-200"
          >
            <img
              src="https://i.pravatar.cc/100?img=3"
              alt="User"
              className="h-full w-full rounded-full object-cover"
            />
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn overflow-hidden">
              <button
                className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 flex items-center gap-2 group"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/dashboard/profile");
                }}
              >
                <span className="group-hover:text-purple-600 transition-colors">Profile</span>
              </button>
              <button
                className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <span className="group-hover:text-red-600 transition-colors">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

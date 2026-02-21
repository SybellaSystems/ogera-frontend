import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { logoutApi } from "../../services/api/logoutApi";
import { getUserProfile } from "../../services/api/profileApi";
import { setUser } from "../../features/auth/authSlice";
import {
  useGetUnreadNotificationCountQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "../../services/api/notificationApi";

// Helper to resolve image URLs - prepend backend server URL for /uploads paths
const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  // If URL starts with /uploads, prepend the backend server URL (without /api)
  if (url.startsWith('/uploads')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove /api from the end to get the backend base URL
    const backendBaseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${backendBaseUrl}${url}`;
  }
  // Return as-is for full URLs (http/https) or other paths
  return url;
};

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state: any) => state.auth.role);
  const user = useSelector((state: any) => state.auth.user);

  // Get unread notification count for employers/superadmins and students
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGetUnreadNotificationCountQuery(undefined, {
    skip: role !== "employer" && role !== "superadmin" && role !== "student",
    pollingInterval: 30000, // Poll every 30 seconds for new notifications
  });
  
  // Get notifications for dropdown - enabled for employers/superadmins and students
  const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsQuery(
    { limit: 10 },
    {
      skip: role !== "employer" && role !== "superadmin" && role !== "student",
    }
  );

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const unreadCount = unreadCountData?.data?.count || 0;
  const notifications = notificationsData?.data || [];

  // Reset imageError when profile image URL changes
  useEffect(() => {
    setImageError(false);
  }, [user?.profile_image_url]);

  // Fetch user profile on mount to ensure we have the latest data (including profile_image_url)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response.data) {
          // Update Redux with the latest user data
          dispatch(setUser(response.data));
        }
      } catch (error) {
        console.error('Failed to fetch user profile in header:', error);
      }
    };

    // Only fetch if user is logged in
    if (user?.user_id || user?.id) {
      fetchUserProfile();
    }
  }, []); // Run once on mount

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Refetch notifications when dropdown opens to get latest data
  useEffect(() => {
    if (isNotificationDropdownOpen && (role === "employer" || role === "superadmin" || role === "student")) {
      refetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationDropdownOpen]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.notification_id);
        refetchUnreadCount();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Optionally show user-friendly error message
      }
    }

    // Navigate based on notification type
    try {
      if (notification.related_id) {
        if (notification.type === "job_application" && (role === "employer" || role === "superadmin")) {
          // Employer clicks job application notification -> go to job applications page
          if (notification.application?.job?.job_id) {
            navigate(`/dashboard/jobs/${notification.application.job.job_id}/applications`);
          } else {
            navigate("/dashboard/jobs/applications");
          }
        } else if (notification.type === "application_status" && role === "student") {
          // Student clicks application status notification -> go to their applications page
          navigate("/dashboard/jobs/my-applications");
        }
        setIsNotificationDropdownOpen(false);
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetchUnreadCount();
      refetchNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Validate date
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Recently";
    }
  };

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
    <header className="w-full bg-white/70 dark:bg-[#1a1528]/90 backdrop-blur-lg h-16 shadow-sm border-b border-[#ddd0ec]/50 dark:border-[#2d1b69]/50 flex items-center justify-between px-4 md:px-6 relative z-30 transition-colors duration-300">
      {/* Left side - Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-[#2d1b69] hover:text-[#7F56D9] transition-colors p-2 rounded-lg hover:bg-[#ede7f8]"
        aria-label="Toggle menu"
        type="button"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Center - Role + Dashboard title */}
      <div className="text-[#2d1b69] dark:text-white font-bold text-lg capitalize hidden sm:block">
        {role ? `${role} Dashboard` : "Dashboard"}
      </div>

      {/* Right side (notification + profile) */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Notification icon with dropdown */}
        {(role === "employer" || role === "superadmin" || role === "student") && (
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="relative cursor-pointer p-2 rounded-lg hover:bg-[#ede7f8] transition-colors group"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              type="button"
            >
              <BellIcon className="h-6 w-6 text-[#2d1b69] group-hover:text-[#7F56D9] transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-linear-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-lg" aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-[calc(100vw-2rem)] sm:max-w-none bg-white/95 dark:bg-[#1a1528]/95 backdrop-blur-lg border border-gray-200/50 dark:border-[#2d1b69]/50 rounded-xl shadow-2xl z-50 animate-fadeIn overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-[#2d1b69] flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification: any) => (
                      <div
                        key={notification.notification_id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 dark:border-[#2d1b69]/30 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2d1b69]/20 transition-colors ${
                          !notification.is_read ? "bg-purple-50/50 dark:bg-[#2d1b69]/15" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
                              !notification.is_read ? "bg-purple-600" : "bg-transparent"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            {notification.application && (
                              <div className="mt-2 text-xs text-gray-500 space-y-1">
                                {notification.application.student && (role === "employer" || role === "superadmin") && (
                                  <p>
                                    Student: <span className="font-medium">{notification.application.student.full_name}</span>
                                  </p>
                                )}
                                {notification.application.job && (
                                  <p>
                                    Job: <span className="font-medium">{notification.application.job.job_title}</span>
                                  </p>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationDropdownOpen(false);
                        if (role === "student") {
                          navigate("/dashboard/jobs/my-applications");
                        } else {
                          navigate("/dashboard/jobs/applications");
                        }
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {role === "student" ? "View my applications" : "View all applications"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-10 w-10 rounded-full bg-[#2d1b69] flex items-center justify-center cursor-pointer border-2 border-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-2 ring-[#ddd0ec] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 overflow-hidden"
            aria-label="User menu"
            type="button"
          >
            {user?.profile_image_url && !imageError ? (
              <img
                src={getImageUrl(user.profile_image_url) || ''}
                alt={user?.full_name || user?.name || "User"}
                className="h-full w-full rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {(user?.full_name || user?.name || user?.email)?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-[#1a1528]/95 backdrop-blur-lg border border-gray-200/50 dark:border-[#2d1b69]/50 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn overflow-hidden">
              <button
                className="w-full text-left px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-linear-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-[#2d1b69]/30 dark:hover:to-[#2d1b69]/20 transition-all duration-200 flex items-center gap-2 group"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/dashboard/profile");
                }}
              >
                <span className="group-hover:text-purple-600 transition-colors">Profile</span>
              </button>
              <button
                className="w-full text-left px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-linear-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-red-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
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

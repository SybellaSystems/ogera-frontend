import React from "react";
import {
  UserCircleIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import type { UserProfile } from "../../services/api/profileApi";

interface AccountTabProps {
  profileData: UserProfile | null;
  userData: any;
  userRole: string | null;
  onEditProfile: () => void;
  onVerifyEmail: () => void;
  onVerifyPhone: () => void;
}

const AccountTab: React.FC<AccountTabProps> = ({
  profileData,
  userData,
  userRole,
  onEditProfile,
  onVerifyEmail,
  onVerifyPhone,
}) => {
  const memberSince = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="bg-white dark:bg-[#1a1528] rounded-xl shadow-lg border border-gray-200 dark:border-[#2d1b69]/50 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#2d1b69] px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCircleIcon className="w-6 h-6" />
          Account
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="p-4 bg-gray-50 dark:bg-[#0f0a1a] rounded-lg">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {userData?.full_name || profileData?.full_name || "Not set"}
            </p>
          </div>

          {/* Email */}
          <div className="p-4 bg-gray-50 dark:bg-[#0f0a1a] rounded-lg">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-lg text-gray-700 dark:text-gray-200">
                {userData?.email || profileData?.email || "Not set"}
              </p>
              {profileData?.email_verified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <button
                  onClick={onVerifyEmail}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                >
                  <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                  Verify
                </button>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="p-4 bg-gray-50 dark:bg-[#0f0a1a] rounded-lg">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-lg text-gray-700 dark:text-gray-200">
                {userData?.mobile_number || profileData?.mobile_number || "Not set"}
              </p>
              {profileData?.phone_verified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <button
                  onClick={onVerifyPhone}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                >
                  <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                  Verify
                </button>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="p-4 bg-gray-50 dark:bg-[#0f0a1a] rounded-lg">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
            <p className="text-lg text-gray-700 dark:text-gray-200 capitalize">{userRole || "User"}</p>
          </div>

          {/* Member Since */}
          <div className="p-4 bg-gray-50 dark:bg-[#0f0a1a] rounded-lg md:col-span-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
            <p className="text-lg text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              {memberSince}
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onEditProfile}
            className="flex items-center gap-2 px-4 py-2 bg-[#2d1b69] hover:bg-[#1f1250] text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;

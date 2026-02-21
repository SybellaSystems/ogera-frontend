import React, { useState } from "react";
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  ComputerDesktopIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import type { UserProfile } from "../../services/api/profileApi";

interface SecurityTabProps {
  profileData: UserProfile | null;
  userData: any;
  onChangePassword: () => void;
  onVerifyEmail: () => void;
  onVerifyPhone: () => void;
  onDeleteAccount: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  profileData,
  userData,
  onChangePassword,
  onVerifyEmail,
  onVerifyPhone,
  onDeleteAccount,
}) => {
  const [twoFaEnabled] = useState(profileData?.two_fa_enabled || false);

  const handleTwoFaToggle = () => {
    toast("Two-factor authentication will be available soon.", { icon: "🔒" });
  };

  return (
    <div className="space-y-6">
      {/* Main Security Card */}
      <div className="bg-white dark:bg-[#1a1528] rounded-xl shadow-lg border border-gray-200 dark:border-[#2d1b69]/50 overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-[#2d1b69] px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6" />
            Security
          </h2>
        </div>

        <div className="p-6 space-y-1">
          {/* Change Password */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f4f0fa] dark:bg-[#2d1b69]/30 flex items-center justify-center">
                <LockClosedIcon className="w-5 h-5 text-[#2d1b69] dark:text-[#9F7AEA]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Password</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
              </div>
            </div>
            <button
              onClick={onChangePassword}
              className="px-4 py-2 bg-[#2d1b69] hover:bg-[#1f1250] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Change Password
            </button>
          </div>

          {/* Email Verification */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f4f0fa] dark:bg-[#2d1b69]/30 flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-[#2d1b69] dark:text-[#9F7AEA]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Verification</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData?.email || profileData?.email || "No email set"}
                </p>
              </div>
            </div>
            {profileData?.email_verified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <CheckCircleIcon className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <button
                onClick={onVerifyEmail}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                Verify Email
              </button>
            )}
          </div>

          {/* Phone Verification */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f4f0fa] dark:bg-[#2d1b69]/30 flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-[#2d1b69] dark:text-[#9F7AEA]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Phone Verification</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData?.mobile_number || profileData?.mobile_number || "No phone set"}
                </p>
              </div>
            </div>
            {profileData?.phone_verified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <CheckCircleIcon className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <button
                onClick={onVerifyPhone}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                Verify Phone
              </button>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f4f0fa] dark:bg-[#2d1b69]/30 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-[#2d1b69] dark:text-[#9F7AEA]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTwoFaToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2d1b69] focus:ring-offset-2 dark:focus:ring-offset-[#1a1528] ${
                twoFaEnabled ? "bg-[#2d1b69]" : "bg-gray-200 dark:bg-gray-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  twoFaEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Login History - Coming Soon */}
      <div className="bg-white dark:bg-[#1a1528] rounded-xl shadow-lg border border-gray-200 dark:border-[#2d1b69]/50 overflow-hidden opacity-75 transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-[#2d1b69] dark:text-[#9F7AEA]" />
            Login History
          </h3>
        </div>
        <div className="p-6">
          <div className="bg-[#f4f0fa] dark:bg-[#2d1b69]/20 rounded-xl p-6 text-center">
            <ClockIcon className="w-10 h-10 text-[#2d1b69] dark:text-[#9F7AEA] mx-auto mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Coming Soon</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Login history tracking is coming soon. You will be able to see your recent login activity here.
            </p>
          </div>
        </div>
      </div>

      {/* Active Sessions - Coming Soon */}
      <div className="bg-white dark:bg-[#1a1528] rounded-xl shadow-lg border border-gray-200 dark:border-[#2d1b69]/50 overflow-hidden opacity-75 transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ComputerDesktopIcon className="w-5 h-5 text-[#2d1b69] dark:text-[#9F7AEA]" />
            Active Sessions
          </h3>
        </div>
        <div className="p-6">
          <div className="bg-[#f4f0fa] dark:bg-[#2d1b69]/20 rounded-xl p-6 text-center">
            <ComputerDesktopIcon className="w-10 h-10 text-[#2d1b69] dark:text-[#9F7AEA] mx-auto mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Coming Soon</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Active session management is coming soon. You will be able to view and manage your active sessions here.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-[#1a1528] rounded-xl shadow-lg border border-red-200 dark:border-red-900/50 overflow-hidden transition-colors duration-300">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            Danger Zone
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={onDeleteAccount}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            <TrashIcon className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;

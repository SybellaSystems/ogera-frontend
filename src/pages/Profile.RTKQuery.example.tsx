/**
 * Alternative Profile Implementation using RTK Query
 * This file shows how to use the RTK Query hook approach
 * You can use this instead of the current Profile.tsx if you prefer RTK Query
 */

import React from "react";
import { useGetUserProfileQuery } from "../services/api/authApi";

const ProfileRTKQuery: React.FC = () => {
  // Using RTK Query hook - automatically handles loading, error, and data
  const { data, isLoading, error, refetch } = useGetUserProfileQuery(undefined);

  const profileData = data?.data;
  const userRole = profileData?.role?.roleName;

  // Format data for display
  const displayData = {
    firstName: profileData?.full_name?.split(" ")[0] || "John",
    lastName: profileData?.full_name?.split(" ")[1] || "Doe",
    email: profileData?.email || "user@example.com",
    phoneNumber: profileData?.mobile_number || "N/A",
    nationalId: profileData?.national_id_number || "N/A",
    businessId: profileData?.business_registration_id || "N/A",
    memberSince: profileData?.created_at
      ? new Date(profileData.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        })
      : "N/A",
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <div>
            <p className="font-medium">⚠️ Failed to load profile</p>
            <p className="text-sm mt-1">Please try again.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900">
          {userRole === "employer" ? "Employer" : userRole === "student" ? "Student" : "User"} Details
        </h1>
        <p className="text-gray-500 mt-2">View and manage your profile information</p>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Avatar & Basic Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-gray-100">
          {/* Avatar Illustration */}
          <div className="w-48 h-48 mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Head */}
              <circle cx="100" cy="70" r="35" fill="#F3E5F5" />
              {/* Face */}
              <path
                d="M 80 65 Q 80 60 85 60 Q 85 65 85 65"
                stroke="#333"
                fill="none"
                strokeWidth="2"
              />
              <path
                d="M 115 65 Q 115 60 120 60 Q 120 65 120 65"
                stroke="#333"
                fill="none"
                strokeWidth="2"
              />
              <circle cx="82" cy="72" r="2" fill="#333" />
              <circle cx="118" cy="72" r="2" fill="#333" />
              <path
                d="M 90 85 Q 100 90 110 85"
                stroke="#333"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Hair */}
              <path
                d="M 65 60 Q 60 50 65 45 Q 70 40 80 38 Q 90 35 100 35 Q 110 35 120 38 Q 130 40 135 45 Q 140 50 135 60"
                fill="#333"
              />
              {/* Body */}
              <ellipse cx="100" cy="140" rx="50" ry="60" fill="#7C3AED" />
              {/* Neck */}
              <rect x="90" y="100" width="20" height="25" fill="#F3E5F5" />
            </svg>
          </div>

          {/* Role Badge */}
          <div className="bg-purple-100 text-purple-700 px-6 py-2 rounded-full font-semibold text-sm mb-3 capitalize">
            {userRole || "User"}
          </div>

          {/* Email */}
          <p className="text-gray-600 text-sm">{displayData.email}</p>
        </div>

        {/* Right Section - Personal Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="text-sm font-medium text-purple-600 mb-1 block">
                First Name
              </label>
              <p className="text-gray-900 font-semibold text-lg">{displayData.firstName}</p>
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm font-medium text-purple-600 mb-1 block">
                Last Name
              </label>
              <p className="text-gray-900 font-semibold text-lg">{displayData.lastName}</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm font-medium text-purple-600 mb-1 block">
                Phone Number
              </label>
              <p className="text-gray-900 font-semibold text-lg">{displayData.phoneNumber}</p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-purple-600 mb-1 block">
                Email Address
              </label>
              <p className="text-gray-900 font-semibold text-lg">{displayData.email}</p>
            </div>

            {/* Company (if employer) */}
            {userRole === "employer" && (
              <div>
                <label className="text-sm font-medium text-purple-600 mb-1 block">
                  Business Registration ID
                </label>
                <p className="text-gray-900 font-semibold text-lg">{displayData.businessId}</p>
              </div>
            )}

            {/* National ID (if student) */}
            {userRole === "student" && (
              <div>
                <label className="text-sm font-medium text-purple-600 mb-1 block">
                  National ID
                </label>
                <p className="text-gray-900 font-semibold text-lg">{displayData.nationalId}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md hover:shadow-lg">
              Edit Profile
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-semibold transition">
              Change Password
            </button>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info Section (Optional) */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">
              Account Status
            </label>
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              Active
            </span>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">
              Member Since
            </label>
            <p className="text-gray-900 font-semibold">{displayData.memberSince}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">
              Verification Status
            </label>
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileRTKQuery;


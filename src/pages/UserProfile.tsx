import React from "react";
import { useTranslation } from "react-i18next";
import {
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  DocumentIcon,
  SparklesIcon,
  BriefcaseIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

interface UserProfileProps {
  profileData: any;
  user: any;
  userRole: string;
  loading: boolean;
  isFullProfileLoading?: boolean;
  activeSection?: any;
  setActiveSection?: (section: any) => void;
  calculateProfileCompletion?: () => number;
  handleResumeDownload?: () => void;
  handleResumeUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingResume?: boolean;
  setIsEditProfileModalOpen?: (open: boolean) => void;
  employments?: any[];
  educations?: any[];
  profileData: unknown;
  user: unknown;
  userRole: string;
  loading: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  profileData,
  user,
  userRole,
  loading,
  isFullProfileLoading,
  calculateProfileCompletion,
  handleResumeDownload,
  handleResumeUpload,
  isUploadingResume,
  setIsEditProfileModalOpen,
  employments,
  educations,
  projects,
  keySkills,
  trustScoreResponse,
  isTrustScoreLoading,
}) => {
  const { t } = useTranslation();

  const profileCompletion = calculateProfileCompletion?.() || 0;
  const userData = profileData || user;
  const initials = userData?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  // Loading state
  if (loading || isFullProfileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">{t("userProfile.loadingProfile") || "Loading profile..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between mb-4">
              {/* Avatar & Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{initials}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{userData?.full_name || "User Profile"}</h1>
                  <p className="text-base font-medium text-gray-600 mt-1">
                    {userRole || t("userProfile.regular") || "Regular User"}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditProfileModalOpen?.(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg hover:scale-105 transition-transform font-medium flex items-center gap-2"
              >
                <PencilSquareIcon className="w-5 h-5" />
                {t("userProfile.editProfile") || "Edit Profile"}
              </button>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">{t("userProfile.email") || "Email"}</p>
                  <p className="text-sm font-medium text-gray-900">{userData?.email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">{t("userProfile.phone") || "Phone"}</p>
                  <p className="text-sm font-medium text-gray-900">{userData?.mobile_number || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">{t("userProfile.profileCompletion") || "Profile Completion"}</p>
              <p className="text-3xl font-bold mt-1">{profileCompletion}%</p>
            </div>
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <p className="text-2xl font-bold text-white">{profileCompletion}%</p>
            </div>
          </div>
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Resume Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t("userProfile.resume") || "Resume"}</h3>
            </div>
            {profileData?.resume_url ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{t("userProfile.resumeUploaded") || "Resume uploaded"}</p>
                <button
                  onClick={handleResumeDownload}
                  className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                >
                  {t("userProfile.downloadResume") || "Download"}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">{t("userProfile.noResumeUploaded") || "No resume uploaded"}</p>
                <label className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors cursor-pointer block text-center">
                  {isUploadingResume ? t("userProfile.uploading") || "Uploading..." : t("userProfile.uploadResume") || "Upload Resume"}
                  <input
                    type="file"
                    id="resume-upload"
                    onChange={handleResumeUpload}
                    disabled={isUploadingResume}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.rtf"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Trust Score Card (if available) */}
          {trustScoreResponse?.data && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t("userProfile.trustScore") || "Trust Score"}</h3>
              </div>
              {isTrustScoreLoading ? (
                <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2" />
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trustScoreResponse.data.score || 0} / {trustScoreResponse.data.max_score || 100}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {((trustScoreResponse.data.score / trustScoreResponse.data.max_score) * 100).toFixed(0)}% {t("userProfile.complete") || "Complete"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: t("userProfile.employment") || "Employment",
              count: employments?.length || 0,
              icon: BriefcaseIcon,
              gradient: "from-blue-500 to-cyan-600",
            },
            {
              label: t("userProfile.education") || "Education",
              count: educations?.length || 0,
              icon: AcademicCapIcon,
              gradient: "from-indigo-500 to-blue-600",
            },
            {
              label: t("userProfile.projects") || "Projects",
              count: projects?.length || 0,
              icon: SparklesIcon,
              gradient: "from-purple-500 to-indigo-600",
            },
            {
              label: t("userProfile.skills") || "Skills",
              count: keySkills?.length || 0,
              icon: CheckCircleIcon,
              gradient: "from-rose-500 to-pink-600",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${stat.gradient} rounded-lg shadow-sm p-4 text-white transition-transform hover:scale-105`}
              >
                <Icon className="w-5 h-5 mb-2 opacity-70" />
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-xs font-medium opacity-90">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Account Status Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("userProfile.accountStatus") || "Account Status"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {profileData?.email_verified ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                )}
                <p className="font-medium text-gray-900">{t("userProfile.emailStatus") || "Email Status"}</p>
              </div>
              <p className="text-sm text-gray-600">
                {profileData?.email_verified
                  ? t("userProfile.verified") || "✓ Verified"
                  : t("userProfile.notVerified") || "✗ Not Verified"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {profileData?.phone_verified ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                )}
                <p className="font-medium text-gray-900">{t("userProfile.phoneStatus") || "Phone Status"}</p>
              </div>
              <p className="text-sm text-gray-600">
                {profileData?.phone_verified
                  ? t("userProfile.verified") || "✓ Verified"
                  : t("userProfile.notVerified") || "✗ Not Verified"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {profileData?.two_factor_enabled ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-amber-600" />
                )}
                <p className="font-medium text-gray-900">{t("userProfile.twoFactorAuth") || "2FA"}</p>
              </div>
              <p className="text-sm text-gray-600">
                {profileData?.two_factor_enabled
                  ? t("userProfile.enabled") || "Enabled"
                  : t("userProfile.disabled") || "Disabled"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

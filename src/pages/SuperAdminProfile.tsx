import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  LockClosedIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface SuperAdminProfileProps {
  profileData: any;
  user: any;
  userRole: string;
  loading: boolean;
  isFullProfileLoading?: boolean;
  fullProfileData?: any;
  trustScoreResponse?: any;
  isTrustScoreLoading?: boolean;
  employments?: any[];
  educations?: any[];
  projects?: any[];
  accomplishments?: any[];
  keySkills?: any[];
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (value: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (value: boolean) => void;
  handleProfileUpdateSuccess: () => void;
}

// Reusable Stat Card Component with Loading State - Colorful Design
const StatCard = ({ icon: Icon, label, value, isLoading }: any) => {
  const gradients = [
    'from-blue-500 to-blue-600',
    'from-indigo-500 to-indigo-600',
    'from-cyan-500 to-blue-600',
    'from-blue-600 to-indigo-600'
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80 mb-3">{label}</p>
          <p className="text-4xl font-bold">
            {isLoading ? (
              <div className="w-16 h-10 bg-white/20 rounded animate-pulse"></div>
            ) : (
              value || "—"
            )}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-white/20">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Settings Card Component - Colorful Design
const SettingsCard = ({ icon: Icon, title, description, action, actionLabel }: any) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-start justify-between hover:shadow-lg transition-all hover:border-blue-300">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
    </div>
    {actionLabel && (
      <button
        onClick={action}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex-shrink-0 ml-4 transform hover:scale-105"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// Reusable Activity Item Component - Colorful Design
const ActivityItem = ({ icon: Icon, title, description, timestamp, status }: any) => (
  <div className="flex items-start gap-4 py-4 px-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all">
    <div className="flex-shrink-0">
      <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${
        status === "success" ? "bg-gradient-to-br from-green-500 to-emerald-600" : status === "pending" ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-red-500 to-rose-600"
      }`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 text-sm">{title}</p>
      <p className="text-gray-600 text-sm mt-0.5">{description}</p>
      <p className="text-gray-500 text-xs mt-1">{timestamp}</p>
    </div>
  </div>
);

const SuperAdminProfile: React.FC<SuperAdminProfileProps> = ({
  profileData,
  user,
  isFullProfileLoading = false,
  fullProfileData: _fullProfileData,
  trustScoreResponse,
  isTrustScoreLoading = false,
  employments = [],
  educations = [],
  projects = [],
  accomplishments = [],
  keySkills = [],
  setIsChangePasswordModalOpen,
  setIsEditProfileModalOpen,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const userData = profileData || user;
  const userInitials = userData?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "SA";

  // Calculate profile completion percentage based on actual data
  const calculateCompletion = () => {
    if (!profileData) return 0;
    let completed = 0;
    const total = 10;
    if (profileData.full_name) completed++;
    if (profileData.email) completed++;
    if (profileData.mobile_number) completed++;
    if (profileData.email_verified) completed++;
    if (profileData.phone_verified) completed++;
    if (keySkills?.length > 0) completed++;
    if (employments?.length > 0) completed++;
    if (educations?.length > 0) completed++;
    if (projects?.length > 0) completed++;
    if (accomplishments?.length > 0) completed++;
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateCompletion();

  // Generate activity log from real profile data
  const generateActivityLog = () => {
    const activities = [];

    // Profile created
    if (profileData?.created_at) {
      activities.push({
        icon: CheckCircleIcon,
        title: "Profile Created",
        description: `Account established for ${userData?.full_name || "User"}`,
        timestamp: new Date(profileData.created_at).toLocaleDateString(),
        status: "success",
      });
    }

    // Latest employment
    if (employments?.length > 0) {
      const latest = employments[0];
      activities.push({
        icon: BriefcaseIcon,
        title: `Employment: ${latest.job_title}`,
        description: `at ${latest.company_name}`,
        timestamp: latest.start_date ? new Date(latest.start_date).toLocaleDateString() : "Recently",
        status: latest.is_current ? "success" : "pending",
      });
    }

    // Latest education
    if (educations?.length > 0) {
      const latest = educations[0];
      activities.push({
        icon: AcademicCapIcon,
        title: `Education: ${latest.degree}`,
        description: `from ${latest.institution_name}`,
        timestamp: latest.start_year ? `${latest.start_year}` : "Recently",
        status: "success",
      });
    }

    // Latest project
    if (projects?.length > 0) {
      const latest = projects[0];
      activities.push({
        icon: SparklesIcon,
        title: `Project: ${latest.project_title}`,
        description: latest.role_in_project || "Project added",
        timestamp: latest.start_date ? new Date(latest.start_date).toLocaleDateString() : "Recently",
        status: "success",
      });
    }

    return activities.slice(0, 4);
  };

  const activityLog = generateActivityLog();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Light Clean Design */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Profile Info */}
            <div className="flex items-start gap-6 flex-1">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl font-bold border-2 border-blue-200">
                  {userInitials}
                </div>
                <span className="absolute bottom-0 right-0 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full border-2 border-white">
                  Active
                </span>
              </div>

              {/* Info Text */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{t('pages.superAdminProfile.title')}</h1>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all hover:shadow-md transform hover:scale-110"
                    title="Edit profile"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-base font-medium text-gray-600 mb-4">{t('pages.superAdminProfile.platformSuperAdmin')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-lg">📱</span>
                    <span>{profileData?.mobile_number || "Not set"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-lg">✉️</span>
                    <span>{userData?.email || "Not set"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-lg">📅</span>
                    <span>Joined {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Not set"}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">{t('pages.superAdminProfile.profileLastUpdated')} {profileData?.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : "Recently"}</p>
              </div>
            </div>

            {/* Status Card - Colorful Design */}
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-lg p-8 w-full md:w-auto min-w-[320px] text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-102">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">{t('pages.superAdminProfile.accountStatus')}</p>
                  <span className="text-4xl font-bold">{profileCompletion}%</span>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-blue-100 text-sm mb-3">{t('pages.superAdminProfile.profileCompletion')}</p>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500 rounded-full"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-blue-100 text-xs mt-3">{profileCompletion}% complete - {100 - profileCompletion}% {t('pages.superAdminProfile.toGo')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Light Clean Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm sticky top-4">
              <div className="bg-blue-50 border-b border-gray-200 px-6 py-4">
                <h3 className="text-gray-900 font-semibold flex items-center gap-2">
                  <span className="text-lg">☰</span> {t('pages.superAdminProfile.menu')}
                </h3>
              </div>
              <nav className="p-2 space-y-1">
                {[
                  { id: "overview", label: t('pages.superAdminProfile.overview'), icon: "📊" },
                  { id: "settings", label: t('pages.superAdminProfile.accountSettings'), icon: "⚙️" },
                  { id: "permissions", label: t('pages.superAdminProfile.permissions'), icon: "🔒" },
                  { id: "stats", label: t('pages.superAdminProfile.platformStats'), icon: "📈" },
                  { id: "security", label: t('pages.superAdminProfile.auditSecurity'), icon: "🛡️" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    {t('pages.superAdminProfile.profileOverview')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard
                      icon={BriefcaseIcon}
                      label={t('pages.superAdminProfile.employmentRecords')}
                      value={employments?.length || 0}
                      isLoading={isFullProfileLoading}
                    />
                    <StatCard
                      icon={AcademicCapIcon}
                      label={t('pages.superAdminProfile.educationRecords')}
                      value={educations?.length || 0}
                      isLoading={isFullProfileLoading}
                    />
                    <StatCard
                      icon={SparklesIcon}
                      label={t('pages.superAdminProfile.projects')}
                      value={projects?.length || 0}
                      isLoading={isFullProfileLoading}
                    />
                    <StatCard
                      icon={CheckCircleIcon}
                      label={t('pages.superAdminProfile.skills')}
                      value={keySkills?.length || 0}
                      isLoading={isFullProfileLoading}
                    />
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <span className="text-2xl">📋</span>
                    </div>
                    {t('pages.superAdminProfile.recentProfileActivity')}
                  </h3>
                  <div className="space-y-0">
                    {activityLog.length > 0 ? (
                      activityLog.map((activity, idx) => (
                        <ActivityItem key={idx} {...activity} />
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-6">{t('pages.superAdminProfile.noActivityRecords')}</p>
                    )}
                  </div>
                </div>

                {/* Trust Score - if available */}
                {(trustScoreResponse?.data || isTrustScoreLoading) && (
                  <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      {t('pages.superAdminProfile.trustScore')}
                    </h3>
                    {isTrustScoreLoading ? (
                      <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div>
                      </div>
                    ) : trustScoreResponse?.data ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm mb-2">{t('pages.superAdminProfile.currentScore')}</p>
                          <p className="text-4xl font-bold">
                            {trustScoreResponse.data.score || 0}/{trustScoreResponse.data.max_score || 100}
                          </p>
                        </div>
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/20 border-2 border-white/40">
                          <span className="text-3xl font-bold">
                            {Math.round(((trustScoreResponse.data.score || 0) / (trustScoreResponse.data.max_score || 100)) * 100)}%
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Cog6ToothIcon className="w-6 h-6 text-white" />
                  </div>
                  {t('pages.superAdminProfile.accountSettingsHeading')}
                </h2>
                <div className="space-y-4">
                  <SettingsCard
                    icon={LockClosedIcon}
                    title={t('pages.superAdminProfile.credentials')}
                    description={t('pages.superAdminProfile.changePasswordDesc')}
                    action={() => setIsChangePasswordModalOpen(true)}
                    actionLabel={t('pages.superAdminProfile.changePassword')}
                  />
                  <SettingsCard
                    icon={ShieldCheckIcon}
                    title={t('pages.superAdminProfile.twoFactorAuth')}
                    description={
                      profileData?.two_factor_enabled
                        ? t('pages.superAdminProfile.statusEnabled')
                        : t('pages.superAdminProfile.statusDisabled')
                    }
                    action={() => {}}
                    actionLabel={profileData?.two_factor_enabled ? t('pages.superAdminProfile.manageTwoFA') : t('pages.superAdminProfile.enableTwoFA')}
                  />
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === "permissions" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  {t('pages.superAdminProfile.permissionsAccess')}
                </h2>
                <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md hover:shadow-lg transition-all">
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">{t('pages.superAdminProfile.role')}</p>
                      <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="inline-block h-3 w-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"></span>
                        {t('pages.superAdminProfile.superAdministrator')}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-3">{t('pages.superAdminProfile.accessLevel')}</p>
                      <div className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md">
                        {t('pages.superAdminProfile.fullPlatformAccess')}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-4">{t('pages.superAdminProfile.permissionsLabel')}</p>
                      <ul className="space-y-3">
                        {[
                          t('pages.superAdminProfile.manageUsers'),
                          t('pages.superAdminProfile.viewModerate'),
                          t('pages.superAdminProfile.approveRejectJobs'),
                          t('pages.superAdminProfile.accessAnalytics'),
                          t('pages.superAdminProfile.configureSystem'),
                        ].map((perm, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-gray-700">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                              <CheckCircleIcon className="w-4 h-4 text-white" />
                            </span>
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  {t('pages.superAdminProfile.platformStatistics')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
                    <p className="text-white/80 text-sm font-medium mb-2">{t('pages.superAdminProfile.employmentRecords')}</p>
                    <p className="text-4xl font-bold mb-1">{employments?.length || 0}</p>
                    <p className="text-white/70 text-xs">{t('pages.superAdminProfile.totalCareerHistory')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
                    <p className="text-white/80 text-sm font-medium mb-2">{t('pages.superAdminProfile.educationRecords')}</p>
                    <p className="text-4xl font-bold mb-1">{educations?.length || 0}</p>
                    <p className="text-white/70 text-xs">{t('pages.superAdminProfile.academicHistory')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
                    <p className="text-white/80 text-sm font-medium mb-2">{t('pages.superAdminProfile.projects')}</p>
                    <p className="text-4xl font-bold mb-1">{projects?.length || 0}</p>
                    <p className="text-white/70 text-xs">{t('pages.superAdminProfile.portfolioItems')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
                    <p className="text-white/80 text-sm font-medium mb-2">{t('pages.superAdminProfile.skills')}</p>
                    <p className="text-4xl font-bold mb-1">{keySkills?.length || 0}</p>
                    <p className="text-white/70 text-xs">{t('pages.superAdminProfile.professionalSkills')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  {t('pages.superAdminProfile.auditSecurityHeading')}
                </h2>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="inline-block h-3 w-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"></span>
                    {t('pages.superAdminProfile.accountInformation')}
                  </h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                      <p className="text-sm text-gray-600">{t('pages.superAdminProfile.accountCreated')}</p>
                      <p className="text-gray-900 font-semibold mt-1">
                        {profileData?.created_at
                          ? new Date(profileData.created_at).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50">
                      <p className="text-sm text-gray-600">{t('pages.superAdminProfile.lastUpdated')}</p>
                      <p className="text-gray-900 font-semibold mt-1">
                        {profileData?.updated_at
                          ? new Date(profileData.updated_at).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                      <p className="text-sm text-gray-600">{t('pages.superAdminProfile.emailStatus')}</p>
                      <p className="text-gray-900 font-semibold mt-1">
                        {profileData?.email_verified ? (
                          <span className="inline-flex items-center gap-2 text-green-700">
                            <span className="inline-block h-2 w-2 bg-green-600 rounded-full"></span>
                            {t('pages.superAdminProfile.verified')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-red-700">
                            <span className="inline-block h-2 w-2 bg-red-600 rounded-full"></span>
                            {t('pages.superAdminProfile.notVerified')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminProfile;

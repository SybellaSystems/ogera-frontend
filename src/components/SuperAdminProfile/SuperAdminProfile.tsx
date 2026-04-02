import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import {
  PencilIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "../ChangePasswordModal";
import EditProfileModal from "../EditProfileModal";
import type { UserProfile } from "../../services/api/profileApi";

type SuperAdminSection =
  | "basic-info"
  | "account-settings"
  | "permissions"
  | "platform-stats"
  | "audit-security";

type SuperAdminStats = {
  users: {
    students: number;
    employers: number;
    total: number;
  };
  recentLogins: { name: string; time: string }[];
  alerts: string[];
  securityLogs: string[];
  actions: string[];
};

interface SuperAdminProfileProps {
  userData: any;
  profileData: UserProfile | null;
  avatarUrl: string;
  superAdminSection: SuperAdminSection;
  setSuperAdminSection: (section: SuperAdminSection) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  isToggling2FA: boolean;
  handleEnable2FA: () => void;
  handleDisable2FA: () => void;
  handleProfileUpdateSuccess: () => void;
  superAdminStats: SuperAdminStats | null;
  permissions: any;
  userRole: string;
}

interface ThemeColors {
  bgPrimary: string;
  bgCard: string;
  bgCardHover: string;
  bgSidebar: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  borderDefault: string;
  borderHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPurple: string;
  accentBlue: string;
  accentGreen: string;
  accentYellow: string;
  accentRed: string;
}

// Helper function to get theme colors
const getThemeColors = (isDarkMode: boolean): ThemeColors => ({
  bgPrimary: isDarkMode ? "#0F172A" : "#F8FAFC",
  bgCard: isDarkMode ? "#1E293B" : "#FFFFFF",
  bgCardHover: isDarkMode ? "#334155" : "#F1F5F9",
  bgSidebar: isDarkMode ? "#1E293B" : "#FFFFFF",
  bgGradientStart: "#8B5CF6",
  bgGradientEnd: "#3B82F6",
  borderDefault: isDarkMode ? "#334155" : "#E2E8F0",
  borderHover: isDarkMode ? "#475569" : "#CBD5E1",
  textPrimary: isDarkMode ? "#F8FAFC" : "#0F172A",
  textSecondary: isDarkMode ? "#CBD5E1" : "#64748B",
  textMuted: isDarkMode ? "#94A3B8" : "#94A3B8",
  accentPurple: "#8B5CF6",
  accentBlue: "#3B82F6",
  accentGreen: "#10B981",
  accentYellow: "#F59E0B",
  accentRed: "#EF4444",
});

export const SuperAdminProfile: React.FC<SuperAdminProfileProps> = ({
  userData,
  profileData,
  avatarUrl,
  superAdminSection,
  setSuperAdminSection,
  isChangePasswordModalOpen,
  setIsChangePasswordModalOpen,
  isEditProfileModalOpen,
  setIsEditProfileModalOpen,
  isToggling2FA,
  handleEnable2FA,
  handleDisable2FA,
  handleProfileUpdateSuccess,
  superAdminStats,
  permissions,
  userRole,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const isDarkMode = theme === "dark";
  const tr = (key: string, fallback: string) =>
    t(key, { defaultValue: fallback });
  const colors = getThemeColors(isDarkMode);

  const quickLinks: {
    key: SuperAdminSection;
    label: string;
    hint: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "basic-info",
      label: tr("superAdminProfile.basicInfo", "Basic Info"),
      hint: tr("superAdminProfile.basicInfoHint", "Identity and contact"),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      key: "account-settings",
      label: tr("superAdminProfile.accountSettings", "Account Settings"),
      hint: tr(
        "superAdminProfile.accountSettingsHint",
        "Security and credentials",
      ),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      key: "permissions",
      label: tr("superAdminProfile.permissions", "Permissions"),
      hint: tr(
        "superAdminProfile.permissionsHint",
        "Roles and access matrix",
      ),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      key: "platform-stats",
      label: tr("superAdminProfile.platformStats", "Platform Stats"),
      hint: tr("superAdminProfile.platformStatsHint", "Users and activity"),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      key: "audit-security",
      label: tr("superAdminProfile.auditSecurity", "Audit & Security"),
      hint: tr("superAdminProfile.auditSecurityHint", "Logs and alerts"),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: colors.bgPrimary }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Card */}
        <div
          className="rounded-2xl shadow-lg border transition-all duration-300 overflow-hidden"
          style={{
            background: colors.bgCard,
            borderColor: colors.borderDefault,
          }}
        >
          {/* Gradient Header Banner */}
          <div
            className="h-32 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -mt-32 -mr-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 -mb-24 -ml-24"></div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
              {/* Avatar */}
              <div className="relative">
                <div
                  className="w-32 h-32 rounded-2xl overflow-hidden border-4 shadow-xl"
                  style={{ borderColor: colors.bgCard }}
                >
                  <img
                    src={avatarUrl}
                    alt={userData?.full_name || "SuperAdmin"}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Status Badge */}
                <div
                  className="absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                  style={{ background: colors.accentGreen, color: "white" }}
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  {tr("common.active", "Active")}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1
                    className="text-3xl font-bold leading-tight"
                    style={{ color: colors.textPrimary }}
                  >
                    {(userData?.full_name || "Super Admin").toUpperCase()}
                  </h1>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
                    style={{ color: colors.textMuted }}
                    title="Edit profile"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: `${colors.accentPurple}20`,
                      color: colors.accentPurple,
                    }}
                  >
                    SUPERADMIN
                  </span>
                </div>

                <p
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.textSecondary }}
                >
                  {tr(
                    "superAdminProfile.platformSuperAdmin",
                    "Platform SuperAdmin",
                  )}
                </p>

                {/* Contact Info Grid */}
                <div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <div className="flex items-center gap-2">
                    <PhoneIcon
                      className="w-4 h-4"
                      style={{ color: colors.accentBlue }}
                    />
                    <span>
                      {userData?.mobile_number ||
                        tr("superAdminProfile.noPhone", "No phone set")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon
                      className="w-4 h-4"
                      style={{ color: colors.accentBlue }}
                    />
                    <span className="truncate">
                      {userData?.email || tr("common.na", "N/A")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon
                      className="w-4 h-4"
                      style={{ color: colors.accentBlue }}
                    />
                    <span>
                      {tr("superAdminProfile.joined", "Joined")}{" "}
                      {profileData?.created_at
                        ? new Date(
                            profileData.created_at,
                          ).toLocaleDateString()
                        : tr("common.na", "N/A")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div
                className="rounded-xl border p-5 min-w-[220px] shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${colors.bgGradientStart}15, ${colors.bgGradientEnd}15)`,
                  borderColor: colors.borderDefault,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="text-xs uppercase tracking-wider font-semibold"
                    style={{ color: colors.textMuted }}
                  >
                    {tr("superAdminProfile.accountStatus", "Account Status")}
                  </p>
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: colors.accentGreen }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: colors.accentGreen }}
                  >
                    92%
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Profile completion
                  </p>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: colors.borderDefault }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: "92%", background: colors.accentGreen }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <p className="text-xs mt-4" style={{ color: colors.textMuted }}>
              {tr(
                "superAdminProfile.profileLastUpdated",
                "Profile last updated",
              )}{" "}
              {profileData?.updated_at
                ? new Date(profileData.updated_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )
                : tr("profile.recently", "recently")}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <SuperAdminSidebar
              colors={colors}
              quickLinks={quickLinks}
              activeSection={superAdminSection}
              onSectionChange={setSuperAdminSection}
              tr={tr}
            />
          </aside>

          {/* Main Content Area */}
          <section className="lg:col-span-9">
            <SuperAdminContent
              colors={colors}
              quickLinks={quickLinks}
              activeSection={superAdminSection}
              userData={userData}
              profileData={profileData}
              isToggling2FA={isToggling2FA}
              handleEnable2FA={handleEnable2FA}
              handleDisable2FA={handleDisable2FA}
              superAdminStats={superAdminStats}
              permissions={permissions}
              tr={tr}
            />
          </section>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        userEmail={userData?.email || ""}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profileData={profileData}
        onUpdateSuccess={handleProfileUpdateSuccess}
        userRole={userRole || ""}
      />
    </div>
  );
};

// Sub-component: Sidebar navigation
interface SuperAdminSidebarProps {
  colors: ThemeColors;
  quickLinks: Array<{
    key: SuperAdminSection;
    label: string;
    hint: string;
    icon: React.ReactNode;
  }>;
  activeSection: SuperAdminSection;
  onSectionChange: (section: SuperAdminSection) => void;
  tr: (key: string, fallback: string) => string;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  colors,
  quickLinks,
  activeSection,
  onSectionChange,
  tr,
}) => (
  <div
    className="rounded-2xl overflow-hidden shadow-lg sticky top-4"
    style={{ borderColor: colors.borderDefault }}
  >
    <div
      className="px-5 py-4"
      style={{
        background: `linear-gradient(135deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%)`,
      }}
    >
      <p className="text-lg font-bold text-white flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        {tr("profile.quickLinks", "Quick Links")}
      </p>
    </div>

    <div
      className="p-3 space-y-1"
      style={{ background: colors.bgSidebar }}
    >
      {quickLinks.map((item) => {
        const active = activeSection === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onSectionChange(item.key)}
            className="w-full text-left rounded-xl px-4 py-3.5 transition-all group"
            style={{
              background: active
                ? `linear-gradient(135deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%)`
                : "transparent",
              color: active ? "white" : colors.textSecondary,
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = colors.bgCardHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div
                style={{
                  color: active ? "white" : colors.accentBlue,
                }}
              >
                {item.icon}
              </div>
              <p className="font-semibold text-sm">{item.label}</p>
            </div>
            <p
              className="text-xs pl-8"
              style={{
                color: active ? "rgba(255,255,255,0.85)" : colors.textMuted,
              }}
            >
              {item.hint}
            </p>
          </button>
        );
      })}
    </div>
  </div>
);

// Sub-component: Content area
interface SuperAdminContentProps {
  colors: ThemeColors;
  quickLinks: Array<{
    key: SuperAdminSection;
    label: string;
    hint: string;
    icon: React.ReactNode;
  }>;
  activeSection: SuperAdminSection;
  userData: any;
  profileData: UserProfile | null;
  isToggling2FA: boolean;
  handleEnable2FA: () => void;
  handleDisable2FA: () => void;
  superAdminStats: SuperAdminStats | null;
  permissions: any;
  tr: (key: string, fallback: string) => string;
}

const SuperAdminContent: React.FC<SuperAdminContentProps> = ({
  colors,
  quickLinks,
  activeSection,
  userData,
  profileData,
  isToggling2FA,
  handleEnable2FA,
  handleDisable2FA,
  superAdminStats,
  permissions,
  tr,
}) => {
  return (
    <div
      className="rounded-2xl border shadow-lg overflow-hidden transition-all duration-300"
      style={{
        background: colors.bgCard,
        borderColor: colors.borderDefault,
      }}
    >
      {/* Section Header */}
      <div
        className="px-6 py-5"
        style={{
          background: `linear-gradient(135deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="text-white">
            {quickLinks.find((q) => q.key === activeSection)?.icon}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {quickLinks.find((q) => q.key === activeSection)?.label}
          </h2>
        </div>
      </div>

      {/* Section Content */}
      <div
        className="p-6 md:p-8"
        style={{ background: colors.bgPrimary }}
      >
        {activeSection === "basic-info" && (
          <BasicInfoSection colors={colors} userData={userData} tr={tr} />
        )}
        {activeSection === "account-settings" && (
          <AccountSettingsSection
            colors={colors}
            profileData={profileData}
            isToggling2FA={isToggling2FA}
            handleEnable2FA={handleEnable2FA}
            handleDisable2FA={handleDisable2FA}
            tr={tr}
          />
        )}
        {activeSection === "permissions" && (
          <PermissionsSection
            colors={colors}
            permissions={permissions}
          />
        )}
        {activeSection === "platform-stats" && (
          <PlatformStatsSection
            colors={colors}
            superAdminStats={superAdminStats}
          />
        )}
        {activeSection === "audit-security" && (
          <AuditSecuritySection
            colors={colors}
            profileData={profileData}
            superAdminStats={superAdminStats}
          />
        )}
      </div>
    </div>
  );
};

// Section Components
interface BasicInfoSectionProps {
  colors: ThemeColors;
  userData: any;
  tr: (key: string, fallback: string) => string;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  colors,
  userData,
  tr,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[
      {
        label: tr("register.fullName", "Full name"),
        value: userData?.full_name || tr("common.na", "N/A"),
        icon: "👤",
      },
      {
        label: tr("register.emailAddress", "Email address"),
        value: userData?.email || tr("common.na", "N/A"),
        icon: "📧",
      },
      {
        label: tr("superAdminProfile.roleType", "Role type"),
        value: "superAdmin",
        icon: "🔑",
        highlight: true,
      },
      {
        label: tr("register.mobileNumber", "Mobile number"),
        value:
          userData?.mobile_number ||
          tr("superAdminProfile.mobileOptional", "Not set"),
        icon: "📱",
      },
    ].map((item, idx) => (
      <div
        key={idx}
        className="rounded-xl border p-5 transition-all hover:shadow-md"
        style={{
          background: colors.bgCard,
          borderColor: colors.borderDefault,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{item.icon}</span>
          <p
            className="text-xs uppercase tracking-wider font-semibold"
            style={{ color: colors.textMuted }}
          >
            {item.label}
          </p>
        </div>
        <p
          className="text-lg font-semibold"
          style={{
            color: item.highlight ? colors.accentBlue : colors.textPrimary,
          }}
        >
          {item.value}
        </p>
      </div>
    ))}
  </div>
);

interface AccountSettingsSectionProps {
  colors: ThemeColors;
  profileData: UserProfile | null;
  isToggling2FA: boolean;
  handleEnable2FA: () => void;
  handleDisable2FA: () => void;
  tr: (key: string, fallback: string) => string;
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  colors,
  profileData,
  isToggling2FA,
  handleEnable2FA,
  handleDisable2FA,
  tr,
}) => (
  <div className="space-y-4">
    {/* Change Password */}
    <div
      className="rounded-xl border p-6 transition-all hover:shadow-md"
      style={{
        background: colors.bgCard,
        borderColor: colors.borderDefault,
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${colors.accentBlue}20` }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: colors.accentBlue }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <div>
            <p
              className="font-bold text-lg mb-1"
              style={{ color: colors.textPrimary }}
            >
              {tr("account.credentials", "Credentials")}
            </p>
            <p
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              {tr(
                "account.credentialsDesc",
                "Change your password and secure account credentials.",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* 2FA Settings */}
    <div
      className="rounded-xl border p-6 transition-all hover:shadow-md"
      style={{
        background: colors.bgCard,
        borderColor: colors.borderDefault,
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: profileData?.two_fa_enabled
                ? `${colors.accentGreen}20`
                : `${colors.accentYellow}20`,
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                color: profileData?.two_fa_enabled
                  ? colors.accentGreen
                  : colors.accentYellow,
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <p
              className="font-bold text-lg mb-1"
              style={{ color: colors.textPrimary }}
            >
              {tr("account.2fa", "Two-factor authentication")}
            </p>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
              <span>{tr("account.status", "Status")}:</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: profileData?.two_fa_enabled
                    ? `${colors.accentGreen}20`
                    : `${colors.accentYellow}20`,
                  color: profileData?.two_fa_enabled
                    ? colors.accentGreen
                    : colors.accentYellow,
                }}
              >
                {profileData?.two_fa_enabled
                  ? tr("common.enabled", "Enabled")
                  : tr("common.disabled", "Disabled")}
              </span>
            </div>
          </div>
        </div>
        {profileData?.two_fa_enabled ? (
          <button
            onClick={handleDisable2FA}
            disabled={isToggling2FA}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
            style={{ background: colors.accentRed }}
          >
            {isToggling2FA ? "Please wait..." : "Disable 2FA"}
          </button>
        ) : (
          <button
            onClick={handleEnable2FA}
            disabled={isToggling2FA}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
            style={{ background: colors.accentGreen }}
          >
            {isToggling2FA ? "Please wait..." : "Enable 2FA"}
          </button>
        )}
      </div>
    </div>
  </div>
);

interface PermissionsSectionProps {
  colors: ThemeColors;
  permissions: any;
}

const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  colors,
  permissions,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/dashboard/role/create")}
          className="px-5 py-3 rounded-xl font-semibold transition-all hover:opacity-90 hover:shadow-lg text-white"
          style={{ background: colors.accentBlue }}
        >
          Create Role
        </button>
        <button
          onClick={() => navigate("/dashboard/role/view")}
          className="px-5 py-3 rounded-xl font-semibold transition-all hover:opacity-90 hover:shadow-lg"
          style={{
            background: colors.bgCard,
            color: colors.textPrimary,
            border: `2px solid ${colors.borderDefault}`,
          }}
        >
          View Roles
        </button>
        <button
          onClick={() => navigate("/dashboard/permission/view")}
          className="px-5 py-3 rounded-xl font-semibold transition-all hover:opacity-90 hover:shadow-lg"
          style={{
            background: colors.bgCard,
            color: colors.textPrimary,
            border: `2px solid ${colors.borderDefault}`,
          }}
        >
          View Permissions
        </button>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: colors.bgCard,
          borderColor: colors.borderDefault,
        }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: colors.borderDefault }}
        >
          <p
            className="text-sm font-bold flex items-center gap-2"
            style={{ color: colors.textPrimary }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Permissions JSON
          </p>
        </div>
        <div className="p-4">
          <pre
            className="text-xs rounded-lg p-4 overflow-auto max-h-96 border"
            style={{
              background: colors.bgPrimary,
              color: colors.textPrimary,
              borderColor: colors.borderDefault,
            }}
          >
            {JSON.stringify(
              permissions || {
                note: "No explicit permission payload (superAdmin bypass)",
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

interface PlatformStatsSectionProps {
  colors: ThemeColors;
  superAdminStats: SuperAdminStats | null;
}

const PlatformStatsSection: React.FC<PlatformStatsSectionProps> = ({
  colors,
  superAdminStats,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        {
          label: "Students",
          value: superAdminStats?.users.students ?? 0,
          color: colors.accentBlue,
          icon: "🎓",
        },
        {
          label: "Employers",
          value: superAdminStats?.users.employers ?? 0,
          color: colors.accentYellow,
          icon: "💼",
        },
        {
          label: "Total Users",
          value: superAdminStats?.users.total ?? 0,
          color: colors.accentGreen,
          icon: "👥",
        },
      ].map((stat, idx) => (
        <div
          key={idx}
          className="rounded-xl border p-5 transition-all hover:shadow-md"
          style={{
            background: colors.bgCard,
            borderColor: colors.borderDefault,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: colors.textMuted }}
            >
              {stat.label}
            </p>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: stat.color }}>
            {stat.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>

    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: colors.bgCard,
        borderColor: colors.borderDefault,
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: colors.borderDefault }}
      >
        <p
          className="text-sm font-bold flex items-center gap-2"
          style={{ color: colors.textPrimary }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Recent user activity (last 5 logins)
        </p>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          {superAdminStats?.recentLogins?.map(
            (item: { name: string; time: string }, index: number) => (
              <li
                key={`${item.name}-${index}`}
                className="flex items-center justify-between rounded-lg px-4 py-3 transition-all hover:shadow-sm"
                style={{ background: colors.bgPrimary }}
              >
                <span
                  className="font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {item.name}
                </span>
                <span
                  className="text-sm"
                  style={{ color: colors.textMuted }}
                >
                  {item.time}
                </span>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  </div>
);

interface AuditSecuritySectionProps {
  colors: ThemeColors;
  profileData: UserProfile | null;
  superAdminStats: SuperAdminStats | null;
}

const AuditSecuritySection: React.FC<AuditSecuritySectionProps> = ({
  colors,
  profileData,
  superAdminStats,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        className="rounded-xl border p-5"
        style={{
          background: colors.bgCard,
          borderColor: colors.borderDefault,
        }}
      >
        <p
          className="text-xs uppercase tracking-wider font-semibold mb-2"
          style={{ color: colors.textMuted }}
        >
          Last login
        </p>
        <p
          className="text-lg font-bold"
          style={{ color: colors.textPrimary }}
        >
          2026-04-01 08:15
        </p>
      </div>
      <div
        className="rounded-xl border p-5"
        style={{
          background: colors.bgCard,
          borderColor: colors.borderDefault,
        }}
      >
        <p
          className="text-xs uppercase tracking-wider font-semibold mb-2"
          style={{ color: colors.textMuted }}
        >
          Account created
        </p>
        <p
          className="text-lg font-bold"
          style={{ color: colors.textPrimary }}
        >
          {profileData?.created_at
            ? new Date(profileData.created_at).toLocaleString()
            : "N/A"}
        </p>
      </div>
    </div>

    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: colors.bgCard,
        borderColor: colors.borderDefault,
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: colors.borderDefault }}
      >
        <p
          className="text-sm font-bold flex items-center gap-2"
          style={{ color: colors.textPrimary }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: colors.accentBlue }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Admin-level security logs
        </p>
      </div>
      <div className="p-4">
        <ul className="space-y-2 text-sm">
          {superAdminStats?.securityLogs?.map((log: string, index: number) => (
            <li
              key={`${log}-${index}`}
              className="rounded-lg px-4 py-3 border-l-4"
              style={{
                background: colors.bgPrimary,
                borderColor: colors.accentBlue,
              }}
            >
              <span style={{ color: colors.textPrimary }}>{log}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: `${colors.accentRed}10`,
        borderColor: `${colors.accentRed}40`,
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: `${colors.accentRed}40` }}
      >
        <p
          className="text-sm font-bold flex items-center gap-2"
          style={{ color: colors.accentRed }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Alerts and pending admin actions
        </p>
      </div>
      <div className="p-4">
        <ul
          className="list-disc pl-5 text-sm space-y-2"
          style={{ color: colors.textPrimary }}
        >
          {[
            ...(superAdminStats?.alerts ?? []),
            ...(superAdminStats?.actions ?? []),
          ].map((alert: string, index: number) => (
            <li key={`${alert}-${index}`}>{alert}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

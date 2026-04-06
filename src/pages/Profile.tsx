import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getUserProfile, updateUserProfile } from "../services/api/profileApi";
import { uploadResume } from "../services/api/resumeApi";
import type { UserProfile } from "../services/api/profileApi";
import { useGetMyTrustScoreQuery } from "../services/api/trustScoreApi";
import {
  useGetFullProfileQuery,
  useUpdateExtendedProfileMutation,
  useAddBulkSkillsMutation,
  useAddEmploymentMutation,
  useUpdateEmploymentMutation,
  useDeleteEmploymentMutation,
  useAddEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddAccomplishmentMutation,
  useDeleteAccomplishmentMutation,
  type UserEmployment,
  type UserEducation,
  type UserProject,
  type UserAccomplishment,
  type CreateEmploymentRequest,
  type CreateEducationRequest,
  type CreateProjectRequest,
  type CreateAccomplishmentRequest,
} from "../services/api/extendedProfileApi";
import { setup2FA, verify2FA, disable2FA } from "../services/api/twoFactorApi";
import ChangePasswordModal from "../components/ChangePasswordModal";
import EditProfileModal from "../components/EditProfileModal";
import TrustScoreCard from "../components/TrustScoreCard";
import PhoneVerificationModal from "../components/PhoneVerificationModal";
import { useResendVerificationEmailMutation } from "../services/api/authApi";
import { useNavigate } from "react-router-dom";
import { SuperAdminProfile } from "../components/SuperAdminProfile/SuperAdminProfile";
import {
  PencilIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type ActiveSection =
  | "resume"
  | "resume-headline"
  | "key-skills"
  | "employment"
  | "education"
  | "it-skills"
  | "projects"
  | "profile-summary"
  | "accomplishments";

type SuperAdminSection =
  | "basic-info"
  | "account-settings"
  | "permissions"
  | "platform-stats"
  | "audit-security";

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: any) => state.auth.user);
  const role = useSelector((state: any) => state.auth.role);
  const permissions = useSelector((state: any) => state.auth.permissions);

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] =
    useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("resume");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [superAdminSection, setSuperAdminSection] =
    useState<SuperAdminSection>("basic-info");
  // 2FA Modal states
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFAInput, setTwoFAInput] = useState("");
  const [twoFAField, setTwoFAField] = useState<
    "otp" | "password" | "disable-otp"
  >("otp");
  const [twoFACallback, setTwoFACallback] = useState<
    ((value: string) => Promise<void>) | null
  >(null);
  // Modal states
  const [isEmploymentModalOpen, setIsEmploymentModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAccomplishmentModalOpen, setIsAccomplishmentModalOpen] =
    useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [resumeHeadline, setResumeHeadline] = useState<string>("");
  const [profileSummary, setProfileSummary] = useState<string>("");
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [skillsInput, setSkillsInput] = useState<string>("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);

  // RTK Query hooks
  const {
    data: fullProfileData,
    isLoading: isFullProfileLoading,
    refetch: refetchFullProfile,
  } = useGetFullProfileQuery();
  const [updateExtendedProfile] = useUpdateExtendedProfileMutation();
  const [addBulkSkills] = useAddBulkSkillsMutation();
  const [addEmployment] = useAddEmploymentMutation();
  const [updateEmployment] = useUpdateEmploymentMutation();
  const [deleteEmployment] = useDeleteEmploymentMutation();
  const [addEducation] = useAddEducationMutation();
  const [updateEducation] = useUpdateEducationMutation();
  const [deleteEducation] = useDeleteEducationMutation();
  const [addProject] = useAddProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [addAccomplishment] = useAddAccomplishmentMutation();
  const [deleteAccomplishment] = useDeleteAccomplishmentMutation();
  const [resendVerificationEmail] = useResendVerificationEmailMutation();
  const navigate = useNavigate();

  // Fetch TrustScore
  const {
    data: trustScoreResponse,
    isLoading: isTrustScoreLoading,
    refetch: refetchTrustScore,
  } = useGetMyTrustScoreQuery(undefined, {
    skip: !profileData,
  });

  // Fetch user profile from API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setProfileData(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err?.response?.data?.message || t("profile.failedToLoad"));
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update local state when full profile data loads
  useEffect(() => {
    if (fullProfileData?.data) {
      const ext = fullProfileData.data.extendedProfile;
      if (ext) {
        setResumeHeadline(ext.resume_headline || "");
        setProfileSummary(ext.profile_summary || "");
      }
      // Set skills input
      const keySkills = fullProfileData.data.skills
        .filter((s) => s.skill_type === "key_skill")
        .map((s) => s.skill_name);
      setSkillsInput(keySkills.join(", "));
    }
  }, [fullProfileData]);

  const handleProfileUpdateSuccess = () => {
    fetchProfile();
    refetchTrustScore();
    refetchFullProfile();
  };

  const handlePhoneVerificationSuccess = () => {
    fetchProfile();
    refetchTrustScore();
  };

  const userData = profileData || user;
  const userRole = profileData?.role?.roleName || role;

  const normalizedRole = String(userRole || role || "")
    .toLowerCase()
    .trim();
  const isSuperAdmin = normalizedRole === "superadmin";

  // ✔ ISSUE #8 RESOLVED: Account verification helpers restored
  const isAccountVerified =
    (userData as any)?.isEmailVerified ??
    (userData as any)?.isVerified ??
    false;
  const shouldShowVerifyAccountButton = !isAccountVerified && !isSuperAdmin;
  const verificationEmail = (userData as any)?.email ?? "";
  const isVerifyAccountButtonDisabled = isAccountVerified || isSuperAdmin;
  const handleVerifyAccountClick = async () => {
    try {
      await resendVerificationEmail(verificationEmail).unwrap();
      toast.success(
        t(
          "profile.verificationEmailSent",
          "Verification email sent to your email address",
        ),
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          t(
            "profile.verificationEmailFailed",
            "Failed to send verification email",
          ),
      );
    }
  };

  // Determine avatar URL with fallback to default placeholder
  const avatarUrl =
    (userData as any)?.avatar_url ||
    (userData as any)?.avatar ||
    (userData as any)?.profile_picture ||
    "/images/default-avatar.png";

  // Get data from full profile
  const extendedProfile = fullProfileData?.data?.extendedProfile;
  const skills = fullProfileData?.data?.skills || [];
  const keySkills = skills.filter((s) => s.skill_type === "key_skill");
  const itSkills = skills.filter((s) => s.skill_type === "it_skill");
  const employments = fullProfileData?.data?.employments || [];
  const educations = fullProfileData?.data?.educations || [];
  const projects = fullProfileData?.data?.projects || [];
  const accomplishments = fullProfileData?.data?.accomplishments || [];

  // Get current employment (is_current = true) or most recent employment
  const currentEmployment =
    employments.find((emp) => emp.is_current) || employments[0];

  // Handle resume upload
  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("profile.resumeUploadValidFile"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("profile.resumeUploadSize"));
      return;
    }

    try {
      setIsUploadingResume(true);
      const response = await uploadResume(file);

      // Update user profile with the resume URL
      if (response.data?.resume_url) {
        await updateUserProfile({ resume_url: response.data.resume_url });
      }

      toast.success(t("profile.resumeUploadSuccess"));
      // Refetch profile data to get updated resume URL
      await fetchProfile();
      // Also refetch full profile if needed
      refetchFullProfile();
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      toast.error(
        error?.response?.data?.message || t("profile.resumeUploadFailed"),
      );
    } finally {
      setIsUploadingResume(false);
      // Reset file input
      const fileInput = document.getElementById(
        "resume-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  // Handle resume download
  const handleResumeDownload = () => {
    if (profileData?.resume_url) {
      window.open(profileData.resume_url, "_blank");
    }
  };

  // Handle resume headline save
  const handleSaveHeadline = async () => {
    try {
      await updateExtendedProfile({ resume_headline: resumeHeadline });
      toast.success(t("profile.headlineUpdated"));
      setIsEditingHeadline(false);
      refetchFullProfile();
    } catch (error: any) {
      toast.error(error?.data?.message || t("profile.headlineUpdateFailed"));
    }
  };

  // Handle profile summary save
  const handleSaveSummary = async () => {
    try {
      await updateExtendedProfile({ profile_summary: profileSummary });
      toast.success(t("profile.summaryUpdated"));
      setIsEditingSummary(false);
      refetchFullProfile();
    } catch (error: any) {
      toast.error(error?.data?.message || t("profile.summaryUpdateFailed"));
    }
  };

  // Handle skills save
  const handleSaveSkills = async () => {
    try {
      const skillNames = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const skillsData = skillNames.map((name) => ({
        skill_name: name,
        skill_type: "key_skill" as const,
      }));
      await addBulkSkills({ skills: skillsData });
      toast.success(t("profile.skillsUpdated"));
      setIsEditingSkills(false);
      refetchFullProfile();
    } catch (error: any) {
      toast.error(error?.data?.message || t("profile.skillsUpdateFailed"));
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    let completed = 0;
    const total = 10;

    if (profileData.full_name) completed++;
    if (profileData.email) completed++;
    if (profileData.mobile_number) completed++;
    if (profileData.resume_url) completed++;
    if (resumeHeadline) completed++;
    if (keySkills.length > 0) completed++;
    if (employments.length > 0) completed++;
    if (educations.length > 0) completed++;
    if (projects.length > 0) completed++;
    if (profileSummary) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Format duration
  const formatDuration = (
    startDate: string,
    endDate?: string | null,
    isCurrent?: boolean,
  ) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let duration = "";
    if (years > 0)
      duration += `${years} ${years > 1 ? t("profile.years") : t("profile.year")}`;
    if (remainingMonths > 0)
      duration += ` ${remainingMonths} ${remainingMonths > 1 ? t("profile.months") : t("profile.month")}`;

    const startStr = start.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const endStr = isCurrent
      ? t("profile.present")
      : endDate
        ? new Date(endDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : t("profile.present");

    return `${startStr} to ${endStr} (${duration.trim()})`;
  };

  if (loading || isFullProfileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

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

  // Only show dev stats in development mode
  // Use import.meta.env for Vite/browser env
  // ✔ ISSUE #4 RESOLVED: superAdminStats wrapped in dev-only flag (import.meta.env.MODE === "development")
  const superAdminStats: SuperAdminStats | null =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.MODE === "development"
      ? {
          users: {
            students: 1240,
            employers: 215,
            total: 1455,
          },
          recentLogins: [
            { name: "System Admin", time: "2026-04-01 08:15" },
            { name: "Alexis", time: "2026-04-01 07:42" },
            { name: "Support Admin", time: "2026-03-31 19:10" },
            { name: "Ops Admin", time: "2026-03-31 16:35" },
            { name: "Audit Admin", time: "2026-03-31 14:03" },
          ],
          alerts: [
            "Role update pending review",
            "2 failed admin login attempts detected",
            "Permission change requires audit note",
          ],
          securityLogs: [
            "Policy changed: role.permission.update",
            "Admin login from new device",
            "Manual account status review completed",
          ],
          actions: [
            "Review pending role change requests",
            "Validate newly created employer accounts",
            "Monitor suspicious login attempts",
          ],
        }
      : null;

  const handleEnable2FA = async () => {
    try {
      setIsToggling2FA(true);
      await setup2FA();

      // ✔ ISSUE #7 RESOLVED: 2FA uses secure modal input instead of window.prompt()
      setTwoFAField("otp");
      setTwoFAInput("");
      setTwoFACallback(() => async (otp: string) => {
        try {
          if (!otp.trim()) {
            toast.error(
              t(
                "profile.2faVerificationCancelled",
                "2FA verification cancelled",
              ),
            );
            return;
          }
          await verify2FA(otp.trim());
          toast.success(
            t("profile.2faEnabled", "Two-factor authentication enabled"),
          );
          await fetchProfile();
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message ||
              t("profile.2faEnableFailed", "Failed to enable 2FA"),
          );
        } finally {
          setIsToggling2FA(false);
        }
      });
      setIs2FAModalOpen(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          t("profile.2faEnableFailed", "Failed to enable 2FA"),
      );
      setIsToggling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsToggling2FA(true);
      // ✔ ISSUE #7 RESOLVED: 2FA disable uses secure modal input for password and OTP instead of window.prompt()
      setTwoFAField("password");
      setTwoFAInput("");
      setTwoFACallback(() => async (password: string) => {
        try {
          if (!password.trim()) {
            toast.error(t("profile.passwordRequired", "Password is required"));
            return;
          }

          // Ask for OTP
          setTwoFAField("disable-otp");
          setTwoFAInput("");
          setTwoFACallback(() => async (otp: string) => {
            try {
              await disable2FA(password.trim(), otp?.trim() || undefined);
              toast.success(
                t("profile.2faDisabled", "Two-factor authentication disabled"),
              );
              await fetchProfile();
              setIs2FAModalOpen(false);
            } catch (error: any) {
              toast.error(
                error?.response?.data?.message ||
                  t("profile.2faDisableFailed", "Failed to disable 2FA"),
              );
            } finally {
              setIsToggling2FA(false);
            }
          });
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message ||
              t("profile.2faDisableFailed", "Failed to disable 2FA"),
          );
          setIsToggling2FA(false);
        }
      });
      setIs2FAModalOpen(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          t("profile.2faDisableFailed", "Failed to disable 2FA"),
      );
      setIsToggling2FA(false);
    }
  };

  const handleSubmit2FA = async () => {
    if (!twoFACallback || !twoFAInput.trim()) return;
    try {
      await twoFACallback(twoFAInput);
      setIs2FAModalOpen(false);
      setTwoFAInput("");
      setTwoFACallback(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          t("profile.2faFailed", "Operation failed"),
      );
    } finally {
      setTwoFAInput("");
    }
  };
  if (isSuperAdmin) {
    return (
      <SuperAdminProfile
        userData={userData}
        profileData={profileData}
        avatarUrl={avatarUrl}
        superAdminSection={superAdminSection}
        setSuperAdminSection={setSuperAdminSection}
        isChangePasswordModalOpen={isChangePasswordModalOpen}
        setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
        isEditProfileModalOpen={isEditProfileModalOpen}
        setIsEditProfileModalOpen={setIsEditProfileModalOpen}
        isToggling2FA={isToggling2FA}
        handleEnable2FA={handleEnable2FA}
        handleDisable2FA={handleDisable2FA}
        handleProfileUpdateSuccess={handleProfileUpdateSuccess}
        superAdminStats={superAdminStats}
        permissions={permissions}
        userRole={userRole}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 mx-4 mt-4">
          <p className="font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Picture */}
            <div className="relative">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={avatarUrl}
                    alt={userData?.full_name || t("profile.user")}
                    className="w-full h-full object-cover"
                  />
                </div>
                <svg
                  className="absolute inset-0 w-32 h-32 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - profileCompletion / 100)}`}
                  />
                </svg>
                <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center border-2 border-white">
                  {profileCompletion}%
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData?.full_name?.toUpperCase() || "USER NAME"}
                </h1>
                <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <p className="text-lg text-gray-700">
                  {currentEmployment
                    ? currentEmployment.job_title
                    : role === "student"
                      ? t("profile.softwareDeveloper")
                      : t("profile.professional")}
                  {currentEmployment && (
                    <span className="text-gray-600">
                      {" "}
                      {t("profile.at")} {currentEmployment.company_name}
                    </span>
                  )}
                </p>

                {shouldShowVerifyAccountButton && (
                  <button
                    type="button"
                    onClick={handleVerifyAccountClick}
                    disabled={
                      isVerifyAccountButtonDisabled || !verificationEmail
                    }
                    className={`text-xs text-purple-600 hover:text-purple-700 font-medium underline transition-all ${
                      isAccountVerified
                        ? "opacity-60 cursor-not-allowed hover:text-purple-600"
                        : isVerifyAccountButtonDisabled || !verificationEmail
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                    }`}
                    title={
                      isAccountVerified ? "Account verified" : "Verify account"
                    }
                  >
                    Verify account
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <span>
                    {userData?.preferred_location || t("profile.location")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                  <span>
                    {extendedProfile?.total_experience_years || 0}{" "}
                    {(extendedProfile?.total_experience_years || 0) !== 1
                      ? t("profile.years")
                      : t("profile.year")}{" "}
                    {extendedProfile?.total_experience_months || 0}{" "}
                    {(extendedProfile?.total_experience_months || 0) !== 1
                      ? t("profile.months")
                      : t("profile.month")}
                  </span>
                </div>
                {role === "student" && extendedProfile?.current_salary && (
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <span>
                      ₹ {extendedProfile.current_salary.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {userData?.mobile_number || "N/A"}
                  </span>
                  {profileData?.phone_verified ? (
                    <CheckCircleIcon
                      className="w-5 h-5 text-green-500"
                      title={t("profile.phoneVerified")}
                    />
                  ) : (
                    <button
                      onClick={() => setIsPhoneVerificationModalOpen(true)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
                      title={t("profile.verifyPhone")}
                    >
                      {t("profile.verify")}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {userData?.email || "N/A"}
                  </span>
                  {profileData?.email_verified ? (
                    <CheckCircleIcon
                      className="w-5 h-5 text-green-500"
                      title={t("profile.emailVerified")}
                    />
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await resendVerificationEmail(
                            userData?.email || "",
                          ).unwrap();
                          toast.success(t("profile.verificationEmailSent"));
                        } catch (error: any) {
                          toast.error(
                            error?.data?.message ||
                              t("profile.verificationEmailFailed"),
                          );
                        }
                      }}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
                      title={t("profile.verifyEmail")}
                    >
                      {t("profile.verify")}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {extendedProfile?.notice_period ||
                      t("profile.noticePeriodDefault")}
                  </span>
                </div>
                {role === "student" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate("/dashboard/academic/pending")}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
                      title={t("profile.academicVerification")}
                    >
                      {t("profile.academicVerification")}
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                {t("profile.profileLastUpdated")} -{" "}
                {profileData?.updated_at
                  ? new Date(profileData.updated_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )
                  : t("profile.recently")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Quick Links */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  {t("profile.quickLinks")}
                </h3>
              </div>
              <nav className="p-3 space-y-1">
                {[
                  {
                    key: "resume",
                    label: t("profile.resume"),
                    action: t("profile.update"),
                    icon: "📄",
                  },
                  {
                    key: "resume-headline",
                    label: t("profile.resumeHeadline"),
                    icon: "✏️",
                  },
                  {
                    key: "key-skills",
                    label: t("profile.keySkills"),
                    icon: "⭐",
                  },
                  {
                    key: "employment",
                    label: t("profile.employment"),
                    action: t("profile.add"),
                    icon: "💼",
                  },
                  {
                    key: "education",
                    label: t("profile.education"),
                    action: t("profile.add"),
                    icon: "🎓",
                  },
                  {
                    key: "it-skills",
                    label: t("profile.itSkills"),
                    icon: "💻",
                  },
                  { key: "projects", label: t("profile.projects"), icon: "🚀" },
                  {
                    key: "profile-summary",
                    label: t("profile.profileSummary"),
                    icon: "📝",
                  },
                  {
                    key: "accomplishments",
                    label: t("profile.accomplishments"),
                    icon: "🏆",
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as ActiveSection)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${
                      activeSection === item.key
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.action && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          activeSection === item.key
                            ? "bg-white/20 text-white"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {item.action}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Resume Section */}
            {activeSection === "resume" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {t("profile.resume")}
                  </h2>
                </div>
                <div className="p-6">
                  {profileData?.resume_url && (
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 mb-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {profileData.resume_url.split("/").pop() ||
                              "resume.pdf"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">
                              {t("profile.uploadedOn")}:
                            </span>{" "}
                            {profileData.updated_at
                              ? new Date(
                                  profileData.updated_at,
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : t("profile.recently")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleResumeDownload}
                          className="p-3 rounded-xl bg-white hover:bg-purple-50 border-2 border-purple-200 transition-all hover:scale-110 shadow-sm hover:shadow-md"
                          title={t("profile.downloadResume")}
                        >
                          <ArrowDownTrayIcon className="w-5 h-5 text-purple-600" />
                        </button>
                        <button
                          className="p-3 rounded-xl bg-white hover:bg-red-50 border-2 border-red-200 transition-all hover:scale-110 shadow-sm hover:shadow-md"
                          title={t("profile.deleteResume")}
                        >
                          <TrashIcon className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-10 text-center bg-gradient-to-br from-purple-50/50 to-indigo-50/50 hover:border-purple-400 transition-all">
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.rtf"
                      onChange={handleResumeUpload}
                      disabled={isUploadingResume}
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg hover:scale-110 transition-transform">
                        <CloudArrowUpIcon className="w-10 h-10 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("resume-upload")?.click();
                        }}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={isUploadingResume}
                      >
                        {isUploadingResume ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5"
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
                            {t("profile.uploading")}
                          </span>
                        ) : (
                          t("profile.updateResume")
                        )}
                      </button>
                      <p className="text-sm text-gray-600 mt-4 font-medium">
                        {t("profile.supportedFormats")}{" "}
                        <span className="text-purple-600">
                          DOC, DOCX, RTF, PDF
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t("profile.maxFileSize")}
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Headline Section */}
            {activeSection === "resume-headline" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      {t("profile.resumeHeadline")}
                    </h2>
                    <button
                      onClick={() => setIsEditingHeadline(!isEditingHeadline)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {isEditingHeadline ? (
                    <div className="space-y-4">
                      <textarea
                        value={resumeHeadline}
                        onChange={(e) => setResumeHeadline(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                        rows={4}
                        placeholder={t("profile.resumeHeadlinePlaceholder")}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveHeadline}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          {t("profile.saveChanges")}
                        </button>
                        <button
                          onClick={() => setIsEditingHeadline(false)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all"
                        >
                          {t("profile.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-100">
                      <p className="text-gray-800 text-lg leading-relaxed">
                        {resumeHeadline || (
                          <span className="text-gray-500 italic">
                            {t("profile.addHeadlinePlaceholder")}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Skills Section */}
            {activeSection === "key-skills" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      {t("profile.keySkills")}
                    </h2>
                    <button
                      onClick={() => setIsEditingSkills(!isEditingSkills)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {isEditingSkills ? (
                    <div className="space-y-4">
                      <textarea
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
                        rows={4}
                        placeholder={t("profile.skillsPlaceholder")}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveSkills}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          {t("profile.saveSkills")}
                        </button>
                        <button
                          onClick={() => setIsEditingSkills(false)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all"
                        >
                          {t("profile.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {keySkills.length > 0 ? (
                        keySkills.map((skill) => (
                          <span
                            key={skill.skill_id}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-full text-sm font-semibold hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm hover:shadow-md border border-emerald-200 hover:border-emerald-300 transform hover:scale-105 cursor-default"
                          >
                            {skill.skill_name}
                          </span>
                        ))
                      ) : (
                        <div className="w-full p-8 text-center bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-dashed border-emerald-200">
                          <p className="text-gray-600 font-medium">
                            {t("profile.addKeySkillsHint")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Employment Section */}
            {activeSection === "employment" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <BriefcaseIcon className="w-6 h-6" />
                      {t("profile.employmentHistory")}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsEmploymentModalOpen(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />{" "}
                      {t("profile.addEmployment")}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {employments.length > 0 ? (
                      employments.map((job) => (
                        <div
                          key={job.employment_id}
                          className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <BriefcaseIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-gray-900">
                                      {job.job_title}
                                    </h3>
                                    {job.is_current && (
                                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        {t("profile.current")}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-lg font-semibold text-orange-700">
                                    {job.company_name}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                    <span className="capitalize">
                                      {job.employment_type.replace("_", " ")}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {formatDuration(
                                        job.start_date,
                                        job.end_date,
                                        job.is_current,
                                      )}
                                    </span>
                                  </p>
                                  {job.notice_period && (
                                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      {job.notice_period}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(job);
                                  setIsEmploymentModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-orange-100 text-orange-600 transition-all shadow-sm hover:shadow-md"
                                title={t("profile.edit")}
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      t("profile.confirmDeleteEmployment"),
                                    )
                                  ) {
                                    await deleteEmployment(job.employment_id);
                                    toast.success(
                                      t("profile.employmentDeleted"),
                                    );
                                    refetchFullProfile();
                                  }
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-all shadow-sm hover:shadow-md"
                                title={t("profile.delete")}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {job.description && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-orange-100">
                              <p className="text-gray-700 leading-relaxed">
                                {job.description}
                              </p>
                            </div>
                          )}
                          {job.key_skills && job.key_skills.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-3">
                                {t("profile.keySkillsUsed")}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {job.key_skills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-white border border-orange-200 text-orange-700 rounded-full text-xs font-semibold shadow-sm"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-dashed border-orange-200">
                        <BriefcaseIcon className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium text-lg mb-2">
                          {t("profile.noEmploymentYet")}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {t("profile.addEmploymentHint")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Education Section */}
            {activeSection === "education" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14v9M5 13.5A11.96 11.96 0 0112 14a11.96 11.96 0 017-1.5"
                        />
                      </svg>
                      {t("profile.education")}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsEducationModalOpen(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />{" "}
                      {t("profile.addEducation")}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {educations.length > 0 ? (
                      educations.map((edu) => (
                        <div
                          key={edu.education_id}
                          className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border-2 border-violet-200 hover:border-violet-300 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg
                                  className="w-7 h-7 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {edu.degree}
                                  </h3>
                                  {edu.is_current && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                      {t("profile.ongoing")}
                                    </span>
                                  )}
                                </div>
                                <p className="text-lg font-semibold text-violet-700 mb-1">
                                  {edu.institution_name}
                                </p>
                                <p className="text-gray-700 font-medium mb-2">
                                  {edu.field_of_study}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4" />
                                    {edu.start_year} -{" "}
                                    {edu.is_current
                                      ? t("profile.present")
                                      : edu.end_year}
                                  </span>
                                  {edu.grade && (
                                    <span className="px-3 py-1 bg-white border border-violet-200 text-violet-700 rounded-full font-semibold">
                                      Grade: {edu.grade}{" "}
                                      {edu.grade_type &&
                                        `(${edu.grade_type.toUpperCase()})`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingItem(edu);
                                  setIsEducationModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-violet-100 text-violet-600 transition-all shadow-sm hover:shadow-md"
                                title={t("profile.edit")}
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      t("profile.confirmDeleteEducation"),
                                    )
                                  ) {
                                    await deleteEducation(edu.education_id);
                                    toast.success(
                                      t("profile.educationDeleted"),
                                    );
                                    refetchFullProfile();
                                  }
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-all shadow-sm hover:shadow-md"
                                title={t("profile.delete")}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border-2 border-dashed border-violet-200">
                        <svg
                          className="w-16 h-16 text-violet-300 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <p className="text-gray-600 font-medium text-lg mb-2">
                          {t("profile.noEducationYet")}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {t("profile.addEducationHint")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* IT Skills Section */}
            {activeSection === "it-skills" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg
                      className="w-6 h-6"
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
                    {t("profile.itSkills")}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {itSkills.length > 0 ? (
                      itSkills.map((skill) => (
                        <span
                          key={skill.skill_id}
                          className="px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 rounded-full text-sm font-semibold hover:from-indigo-100 hover:to-blue-100 transition-all shadow-sm hover:shadow-md border border-indigo-200 hover:border-indigo-300 transform hover:scale-105 cursor-default"
                        >
                          {skill.skill_name}
                          {skill.proficiency_level && (
                            <span className="ml-2 text-xs opacity-75">
                              ({skill.proficiency_level})
                            </span>
                          )}
                        </span>
                      ))
                    ) : (
                      <div className="w-full p-8 text-center bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-dashed border-indigo-200">
                        <p className="text-gray-600 font-medium">
                          {t("profile.addItSkillsHint")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Projects Section */}
            {activeSection === "projects" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      {t("profile.projects")}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsProjectModalOpen(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" /> {t("profile.addProject")}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <div
                          key={project.project_id}
                          className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200 hover:border-pink-300 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg
                                  className="w-7 h-7 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {project.project_title}
                                  </h3>
                                  {project.is_ongoing && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                      {t("profile.ongoing")}
                                    </span>
                                  )}
                                </div>
                                {project.role_in_project && (
                                  <p className="text-lg font-semibold text-pink-700 mb-2">
                                    {project.role_in_project}
                                  </p>
                                )}
                                {project.project_url && (
                                  <a
                                    href={project.project_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold text-sm transition-all hover:underline"
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
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                    {t("profile.viewProject")}
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingItem(project);
                                  setIsProjectModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-pink-100 text-pink-600 transition-all shadow-sm hover:shadow-md"
                                title={t("profile.edit")}
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      t("profile.confirmDeleteProject"),
                                    )
                                  ) {
                                    await deleteProject(project.project_id);
                                    toast.success(t("profile.projectDeleted"));
                                    refetchFullProfile();
                                  }
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-all shadow-sm hover:shadow-md"
                                title={t("profile.delete")}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {project.description && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-pink-100">
                              <p className="text-gray-700 leading-relaxed">
                                {project.description}
                              </p>
                            </div>
                          )}
                          {project.technologies &&
                            project.technologies.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-3">
                                  {t("profile.technologiesUsed")}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {project.technologies.map((tech, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1.5 bg-white border border-pink-200 text-pink-700 rounded-full text-xs font-semibold shadow-sm"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-dashed border-pink-200">
                        <svg
                          className="w-16 h-16 text-pink-300 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <p className="text-gray-600 font-medium text-lg mb-2">
                          {t("profile.noProjectsYet")}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {t("profile.addProjectHint")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Summary Section */}
            {activeSection === "profile-summary" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-yellow-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
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
                      {t("profile.profileSummary")}
                    </h2>
                    <button
                      onClick={() => setIsEditingSummary(!isEditingSummary)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {isEditingSummary ? (
                    <div className="space-y-4">
                      <textarea
                        value={profileSummary}
                        onChange={(e) => setProfileSummary(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none transition-all"
                        rows={8}
                        placeholder={t("profile.summaryPlaceholder")}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveSummary}
                          className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          {t("profile.saveSummary")}
                        </button>
                        <button
                          onClick={() => setIsEditingSummary(false)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all"
                        >
                          {t("profile.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-100">
                      <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                        {profileSummary || (
                          <span className="text-gray-500 italic">
                            {t("profile.addSummaryPlaceholder")}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Accomplishments Section */}
            {activeSection === "accomplishments" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      {t("profile.accomplishments")}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsAccomplishmentModalOpen(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />{" "}
                      {t("profile.addAccomplishment")}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {accomplishments.length > 0 ? (
                      accomplishments.map((acc) => (
                        <div
                          key={acc.accomplishment_id}
                          className="bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-xl p-6 border-2 border-fuchsia-200 hover:border-fuchsia-300 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg
                                  className="w-7 h-7 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-3 py-1 bg-white border border-fuchsia-300 text-fuchsia-700 rounded-full text-xs font-bold capitalize shadow-sm">
                                    {acc.accomplishment_type}
                                  </span>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {acc.title}
                                  </h3>
                                </div>
                                {acc.issuing_organization && (
                                  <p className="text-lg font-semibold text-fuchsia-700 mb-2">
                                    {acc.issuing_organization}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                                  {acc.issue_date && (
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      Issued:{" "}
                                      {new Date(
                                        acc.issue_date,
                                      ).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </span>
                                  )}
                                  {acc.expiry_date && (
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      Expires:{" "}
                                      {new Date(
                                        acc.expiry_date,
                                      ).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </span>
                                  )}
                                </div>
                                {acc.credential_url && (
                                  <a
                                    href={acc.credential_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-fuchsia-600 hover:text-fuchsia-700 font-semibold text-sm transition-all hover:underline"
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
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                    {t("profile.viewCredential")}
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      t("profile.confirmDeleteAccomplishment"),
                                    )
                                  ) {
                                    await deleteAccomplishment(
                                      acc.accomplishment_id,
                                    );
                                    toast.success(
                                      t("profile.accomplishmentDeleted"),
                                    );
                                    refetchFullProfile();
                                  }
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-all shadow-sm hover:shadow-md"
                                title={t("profile.delete")}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {acc.description && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-fuchsia-100">
                              <p className="text-gray-700 leading-relaxed">
                                {acc.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-xl border-2 border-dashed border-fuchsia-200">
                        <svg
                          className="w-16 h-16 text-fuchsia-300 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        <p className="text-gray-600 font-medium text-lg mb-2">
                          {t("profile.noAccomplishmentsYet")}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {t("profile.addAccomplishmentsHint")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TrustScore Section */}
      {trustScoreResponse?.data && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <TrustScoreCard
            trustScore={trustScoreResponse.data}
            isLoading={isTrustScoreLoading}
          />
        </div>
      )}

      {/* Employment Modal */}
      <EmploymentModal
        isOpen={isEmploymentModalOpen}
        onClose={() => {
          setIsEmploymentModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSave={async (data) => {
          if (editingItem) {
            await updateEmployment({ id: editingItem.employment_id, data });
          } else {
            await addEmployment(data);
          }
          refetchFullProfile();
          setIsEmploymentModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* Education Modal */}
      <EducationModal
        isOpen={isEducationModalOpen}
        onClose={() => {
          setIsEducationModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSave={async (data) => {
          if (editingItem) {
            await updateEducation({ id: editingItem.education_id, data });
          } else {
            await addEducation(data);
          }
          refetchFullProfile();
          setIsEducationModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSave={async (data) => {
          if (editingItem) {
            await updateProject({ id: editingItem.project_id, data });
          } else {
            await addProject(data);
          }
          refetchFullProfile();
          setIsProjectModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* Accomplishment Modal */}
      <AccomplishmentModal
        isOpen={isAccomplishmentModalOpen}
        onClose={() => {
          setIsAccomplishmentModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSave={async (data) => {
          if (editingItem) {
            // For simplicity, delete and recreate
            await deleteAccomplishment(editingItem.accomplishment_id);
          }
          await addAccomplishment(data);
          refetchFullProfile();
          setIsAccomplishmentModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* Existing Modals */}
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
      <PhoneVerificationModal
        isOpen={isPhoneVerificationModalOpen}
        onClose={() => setIsPhoneVerificationModalOpen(false)}
        onSuccess={handlePhoneVerificationSuccess}
        phoneNumber={profileData?.mobile_number}
        email={userData?.email}
      />

      {/* 2FA Input Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {twoFAField === "otp" &&
                t("profile.2faOtpTitle", "Enter 2FA Code")}
              {twoFAField === "password" &&
                t("profile.2faPasswordTitle", "Enter Your Password")}
              {twoFAField === "disable-otp" &&
                t("profile.2faOtpTitle", "Enter 2FA Code")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {twoFAField === "otp" &&
                t(
                  "profile.2faOtpDesc",
                  "Enter the 6-digit OTP from your authenticator app",
                )}
              {twoFAField === "password" &&
                t(
                  "profile.2faPasswordDesc",
                  "Enter your current password to disable 2FA",
                )}
              {twoFAField === "disable-otp" &&
                t(
                  "profile.2faDisableOtpDesc",
                  "Enter your current 2FA token (if required)",
                )}
            </p>
            <input
              type={twoFAField === "password" ? "password" : "text"}
              value={twoFAInput}
              onChange={(e) => setTwoFAInput(e.target.value)}
              placeholder={twoFAField === "otp" ? "000000" : "••••••••"}
              maxLength={twoFAField === "otp" ? 6 : undefined}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmit2FA();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIs2FAModalOpen(false);
                  setTwoFAInput("");
                  setTwoFACallback(null);
                  setIsToggling2FA(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
              >
                {t("profile.cancel")}
              </button>
              <button
                onClick={handleSubmit2FA}
                disabled={!twoFAInput.trim() || !twoFACallback}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
interface EmploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: UserEmployment | null;
  onSave: (data: CreateEmploymentRequest) => Promise<void>;
}

const EmploymentModal: React.FC<EmploymentModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateEmploymentRequest>({
    job_title: "",
    company_name: "",
    employment_type: "full_time",
    start_date: "",
    end_date: "",
    is_current: false,
    location: "",
    description: "",
    notice_period: "",
    key_skills: [],
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        job_title: editingItem.job_title,
        company_name: editingItem.company_name,
        employment_type: editingItem.employment_type,
        start_date: editingItem.start_date.split("T")[0],
        end_date: editingItem.end_date?.split("T")[0] || "",
        is_current: editingItem.is_current,
        location: editingItem.location || "",
        description: editingItem.description || "",
        notice_period: editingItem.notice_period || "",
        key_skills: editingItem.key_skills || [],
      });
      setSkillsInput((editingItem.key_skills || []).join(", "));
    } else {
      setFormData({
        job_title: "",
        company_name: "",
        employment_type: "full_time",
        start_date: "",
        end_date: "",
        is_current: false,
        location: "",
        description: "",
        notice_period: "",
        key_skills: [],
      });
      setSkillsInput("");
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      await onSave({ ...formData, key_skills: skills });
      toast.success(
        editingItem
          ? t("profile.employmentUpdated")
          : t("profile.employmentAdded"),
      );
    } catch (error: any) {
      toast.error(error?.data?.message || t("profile.employmentSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editingItem
              ? t("profile.editEmployment")
              : t("profile.addEmploymentTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.jobTitle")}
              </label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) =>
                  setFormData({ ...formData, job_title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.companyName")}
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.employmentType")}
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employment_type: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="full_time">{t("profile.fullTime")}</option>
                <option value="part_time">{t("profile.partTime")}</option>
                <option value="contract">{t("profile.contract")}</option>
                <option value="internship">{t("profile.internship")}</option>
                <option value="freelance">{t("profile.freelance")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.location")}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.startDate")}
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.endDate")}
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                disabled={formData.is_current}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_current: e.target.checked,
                  end_date: "",
                })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="is_current" className="text-sm text-gray-700">
              {t("profile.iCurrentlyWorkHere")}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.noticePeriod")}
            </label>
            <input
              type="text"
              value={formData.notice_period}
              onChange={(e) =>
                setFormData({ ...formData, notice_period: e.target.value })
              }
              placeholder={t("profile.noticePeriodPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder={t("profile.descriptionPlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.keySkillsComma")}
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder={t("profile.keySkillsExample")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {t("profile.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? t("profile.saving") : t("profile.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: UserEducation | null;
  onSave: (data: CreateEducationRequest) => Promise<void>;
}

const EducationModal: React.FC<EducationModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateEducationRequest>({
    degree: "",
    field_of_study: "",
    institution_name: "",
    start_year: new Date().getFullYear(),
    end_year: undefined,
    is_current: false,
    grade: "",
    grade_type: undefined,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        degree: editingItem.degree,
        field_of_study: editingItem.field_of_study,
        institution_name: editingItem.institution_name,
        start_year: editingItem.start_year,
        end_year: editingItem.end_year || undefined,
        is_current: editingItem.is_current,
        grade: editingItem.grade || "",
        grade_type: editingItem.grade_type,
        description: editingItem.description || "",
      });
    } else {
      setFormData({
        degree: "",
        field_of_study: "",
        institution_name: "",
        start_year: new Date().getFullYear(),
        end_year: undefined,
        is_current: false,
        grade: "",
        grade_type: undefined,
        description: "",
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success(
        editingItem
          ? t("profile.educationUpdated")
          : t("profile.educationAdded"),
      );
    } catch (error: any) {
      toast.error(error?.data?.message || t("profile.educationSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editingItem
              ? t("profile.editEducation")
              : t("profile.addEducationTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.degree")}
            </label>
            <input
              type="text"
              required
              value={formData.degree}
              onChange={(e) =>
                setFormData({ ...formData, degree: e.target.value })
              }
              placeholder={t("profile.degreePlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.fieldOfStudy")}
            </label>
            <input
              type="text"
              required
              value={formData.field_of_study}
              onChange={(e) =>
                setFormData({ ...formData, field_of_study: e.target.value })
              }
              placeholder={t("profile.fieldOfStudyPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.institutionName")}
            </label>
            <input
              type="text"
              required
              value={formData.institution_name}
              onChange={(e) =>
                setFormData({ ...formData, institution_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.startYear")}
              </label>
              <input
                type="number"
                required
                min="1950"
                max="2030"
                value={formData.start_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    start_year: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.endYear")}
              </label>
              <input
                type="number"
                min="1950"
                max="2030"
                value={formData.end_year || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    end_year: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                disabled={formData.is_current}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current_edu"
              checked={formData.is_current}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_current: e.target.checked,
                  end_year: undefined,
                })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="is_current_edu" className="text-sm text-gray-700">
              {t("profile.currentlyPursuing")}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.grade")}
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                placeholder={t("profile.gradePlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.gradeType")}
              </label>
              <select
                value={formData.grade_type || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    grade_type: (e.target.value as any) || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{t("profile.selectType")}</option>
                <option value="percentage">{t("profile.percentage")}</option>
                <option value="cgpa">{t("profile.cgpa")}</option>
                <option value="gpa">{t("profile.gpa")}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {t("profile.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? t("profile.saving") : t("profile.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: UserProject | null;
  onSave: (data: CreateProjectRequest) => Promise<void>;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateProjectRequest>({
    project_title: "",
    project_url: "",
    start_date: "",
    end_date: "",
    is_ongoing: false,
    description: "",
    technologies: [],
    role_in_project: "",
  });
  const [techInput, setTechInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        project_title: editingItem.project_title,
        project_url: editingItem.project_url || "",
        start_date: editingItem.start_date?.split("T")[0] || "",
        end_date: editingItem.end_date?.split("T")[0] || "",
        is_ongoing: editingItem.is_ongoing,
        description: editingItem.description || "",
        technologies: editingItem.technologies || [],
        role_in_project: editingItem.role_in_project || "",
      });
      setTechInput((editingItem.technologies || []).join(", "));
    } else {
      setFormData({
        project_title: "",
        project_url: "",
        start_date: "",
        end_date: "",
        is_ongoing: false,
        description: "",
        technologies: [],
        role_in_project: "",
      });
      setTechInput("");
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const technologies = techInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      await onSave({ ...formData, technologies });
      toast.success(
        editingItem ? t("profile.projectUpdated") : t("profile.projectAdded"),
      );
    } catch (error: any) {
      toast.error(error?.data?.message || t("profile.projectSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editingItem
              ? t("profile.editProject")
              : t("profile.addProjectTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.projectTitle")}
            </label>
            <input
              type="text"
              required
              value={formData.project_title}
              onChange={(e) =>
                setFormData({ ...formData, project_title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.yourRole")}
            </label>
            <input
              type="text"
              value={formData.role_in_project}
              onChange={(e) =>
                setFormData({ ...formData, role_in_project: e.target.value })
              }
              placeholder={t("profile.yourRolePlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.projectUrl")}
            </label>
            <input
              type="url"
              value={formData.project_url}
              onChange={(e) =>
                setFormData({ ...formData, project_url: e.target.value })
              }
              placeholder={t("profile.projectUrlPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder={t("profile.describeProject")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.technologiesComma")}
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder={t("profile.technologiesExample")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_ongoing"
              checked={formData.is_ongoing}
              onChange={(e) =>
                setFormData({ ...formData, is_ongoing: e.target.checked })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="is_ongoing" className="text-sm text-gray-700">
              {t("profile.ongoingProject")}
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {t("profile.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? t("profile.saving") : t("profile.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AccomplishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: UserAccomplishment | null;
  onSave: (data: CreateAccomplishmentRequest) => Promise<void>;
}

const AccomplishmentModal: React.FC<AccomplishmentModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateAccomplishmentRequest>({
    accomplishment_type: "certification",
    title: "",
    issuing_organization: "",
    issue_date: "",
    expiry_date: "",
    credential_id: "",
    credential_url: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        accomplishment_type: editingItem.accomplishment_type,
        title: editingItem.title,
        issuing_organization: editingItem.issuing_organization || "",
        issue_date: editingItem.issue_date?.split("T")[0] || "",
        expiry_date: editingItem.expiry_date?.split("T")[0] || "",
        credential_id: editingItem.credential_id || "",
        credential_url: editingItem.credential_url || "",
        description: editingItem.description || "",
      });
    } else {
      setFormData({
        accomplishment_type: "certification",
        title: "",
        issuing_organization: "",
        issue_date: "",
        expiry_date: "",
        credential_id: "",
        credential_url: "",
        description: "",
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success(
        editingItem
          ? t("profile.accomplishmentUpdated")
          : t("profile.accomplishmentAdded"),
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message || t("profile.accomplishmentSaveFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editingItem
              ? t("profile.editAccomplishment")
              : t("profile.addAccomplishmentTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.type")}
            </label>
            <select
              value={formData.accomplishment_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accomplishment_type: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="certification">
                {t("profile.certification")}
              </option>
              <option value="award">{t("profile.award")}</option>
              <option value="publication">{t("profile.publication")}</option>
              <option value="patent">{t("profile.patent")}</option>
              <option value="other">{t("profile.other")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.title")}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.issuingOrganization")}
            </label>
            <input
              type="text"
              value={formData.issuing_organization}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  issuing_organization: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.issueDate")}
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.expiryDate")}
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.credentialUrl")}
            </label>
            <input
              type="url"
              value={formData.credential_url}
              onChange={(e) =>
                setFormData({ ...formData, credential_url: e.target.value })
              }
              placeholder={t("profile.projectUrlPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {t("profile.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? t("profile.saving") : t("profile.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

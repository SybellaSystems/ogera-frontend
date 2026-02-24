import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import { getUserProfile, updateUserProfile } from "../services/api/profileApi";
import { uploadResume } from "../services/api/resumeApi";
import { uploadProfileImage } from "../services/api/profileImageApi";
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
import ChangePasswordModal from "../components/ChangePasswordModal";
import EditProfileModal from "../components/EditProfileModal";
import TrustScoreCard from "../components/TrustScoreCard";
import PhoneVerificationModal from "../components/PhoneVerificationModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import EmailVerificationModal from "../components/EmailVerificationModal";
import { useSendPhoneVerificationOTPMutation } from "../services/api/authApi";
import { useNavigate } from "react-router-dom";
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
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  StarIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
  RocketLaunchIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  CameraIcon,
  UserCircleIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { ProfileMilestones, ProfileCompletionWizard } from "../components/ProfileCompletion";
import { MILESTONES } from "../components/ProfileCompletion/milestoneConfig";
import { AccountTab, PreferencesTab, SecurityTab, NotificationsTab } from "../components/ProfileSettings";

type ActiveSection =
  | "resume"
  | "resume-headline"
  | "key-skills"
  | "employment"
  | "education"
  | "it-skills"
  | "projects"
  | "profile-summary"
  | "accomplishments"
  // Employer-specific sections
  | "company-info"
  | "company-description"
  | "posted-jobs"
  // Admin-specific sections
  | "account-settings"
  // Universal settings sections
  | "account"
  | "preferences"
  | "notifications"
  | "security";

// Section configuration with metadata
interface SectionConfig {
  key: ActiveSection;
  label: string;
  action?: string;
  Icon: React.ComponentType<{ className?: string }>;
}

// Shared settings sections appended to all roles
const SETTINGS_SECTIONS: SectionConfig[] = [
  { key: "account", label: "Account", Icon: UserCircleIcon },
  { key: "preferences", label: "Preferences", Icon: AdjustmentsHorizontalIcon },
  { key: "notifications", label: "Notifications", Icon: BellIcon },
  { key: "security", label: "Security", Icon: ShieldCheckIcon },
];

// Role-to-sections mapping
const ROLE_SECTIONS: Record<string, SectionConfig[]> = {
  student: [
    { key: "resume", label: "Resume", action: "Update", Icon: DocumentTextIcon },
    { key: "resume-headline", label: "Resume headline", Icon: PencilSquareIcon },
    { key: "key-skills", label: "Key skills", Icon: StarIcon },
    { key: "employment", label: "Employment", action: "Add", Icon: BriefcaseIcon },
    { key: "education", label: "Education", action: "Add", Icon: AcademicCapIcon },
    { key: "it-skills", label: "IT skills", Icon: ComputerDesktopIcon },
    { key: "projects", label: "Projects", Icon: RocketLaunchIcon },
    { key: "profile-summary", label: "Profile summary", Icon: ClipboardDocumentListIcon },
    { key: "accomplishments", label: "Accomplishments", Icon: TrophyIcon },
    ...SETTINGS_SECTIONS,
  ],
  employer: [
    { key: "company-info", label: "Company Info", action: "Edit", Icon: BuildingOfficeIcon },
    { key: "company-description", label: "About Company", Icon: ClipboardDocumentListIcon },
    { key: "posted-jobs", label: "Posted Jobs", Icon: BriefcaseIcon },
    ...SETTINGS_SECTIONS,
  ],
  admin: [
    { key: "account-settings", label: "Account Settings", Icon: Cog6ToothIcon },
    { key: "profile-summary", label: "Profile Summary", Icon: ClipboardDocumentListIcon },
    ...SETTINGS_SECTIONS,
  ],
  superadmin: [
    { key: "account-settings", label: "Account Settings", Icon: Cog6ToothIcon },
    { key: "profile-summary", label: "Profile Summary", Icon: ClipboardDocumentListIcon },
    ...SETTINGS_SECTIONS,
  ],
};

// Helper function to get sections for a role
const getSectionsForRole = (role: string | null): SectionConfig[] => {
  if (!role) return ROLE_SECTIONS.student;
  return ROLE_SECTIONS[role.toLowerCase()] || ROLE_SECTIONS.student;
};

// Helper to get default section for a role
const getDefaultSectionForRole = (role: string | null): ActiveSection => {
  const sections = getSectionsForRole(role);
  return sections[0]?.key || "profile-summary";
};

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

const Profile: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const role = useSelector((state: any) => state.auth.role);

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] = useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>(() =>
    getDefaultSectionForRole(role)
  );
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const profileImageInputRef = React.useRef<HTMLInputElement>(null);

  // Modal states
  const [isEmploymentModalOpen, setIsEmploymentModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAccomplishmentModalOpen, setIsAccomplishmentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCompletionWizardOpen, setIsCompletionWizardOpen] = useState(false);

  // Form states
  const [resumeHeadline, setResumeHeadline] = useState<string>("");
  const [profileSummary, setProfileSummary] = useState<string>("");
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [skillsInput, setSkillsInput] = useState<string>("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [itSkillsInput, setItSkillsInput] = useState<string>("");
  const [isEditingItSkills, setIsEditingItSkills] = useState(false);

  // RTK Query hooks
  const { data: fullProfileData, isLoading: isFullProfileLoading, refetch: refetchFullProfile } = useGetFullProfileQuery();
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
  const [_sendPhoneVerificationOTP] = useSendPhoneVerificationOTPMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

      // Sync the updated profile to Redux state so Header updates immediately
      if (response.data) {
        console.log('📝 [PROFILE] Syncing to Redux:', {
          full_name: response.data.full_name,
          profile_image_url: response.data.profile_image_url,
        });
        dispatch(setUser({
          full_name: response.data.full_name,
          email: response.data.email,
          mobile_number: response.data.mobile_number,
          profile_image_url: response.data.profile_image_url,
        }));
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err?.response?.data?.message || "Failed to load profile");
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
        .filter(s => s.skill_type === "key_skill")
        .map(s => s.skill_name);
      setSkillsInput(keySkills.join(", "));
      // Set IT skills input
      const itSkillsList = fullProfileData.data.skills
        .filter(s => s.skill_type === "it_skill")
        .map(s => s.skill_name);
      setItSkillsInput(itSkillsList.join(", "));
    }
  }, [fullProfileData]);

  // Reset activeSection when role changes
  useEffect(() => {
    setActiveSection(getDefaultSectionForRole(role));
  }, [role]);


  const handleProfileUpdateSuccess = () => {
    // Refetch profile data (fetchProfile also syncs to Redux)
    fetchProfile();
    refetchTrustScore();
    refetchFullProfile();
  };

  const handlePhoneVerificationSuccess = () => {
    fetchProfile();
    refetchTrustScore();
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Please upload an image smaller than 5MB.');
      return;
    }

    try {
      setIsUploadingProfileImage(true);

      const response = await uploadProfileImage(file);

      if (response.success) {
        // Update Redux state
        dispatch(setUser({ profile_image_url: response.data.profile_image_url }));

        // Update local profile data immediately
        setProfileData(prev => prev ? { ...prev, profile_image_url: response.data.profile_image_url } : prev);

        // Refetch profile data
        fetchProfile();
        toast.success('Profile image updated successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setIsUploadingProfileImage(false);
      // Reset the input so the same file can be selected again
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    }
  };

  const userData = profileData || user;
  const userRole = profileData?.role?.roleName || role;

  // Get data from full profile
  const extendedProfile = fullProfileData?.data?.extendedProfile;
  const skills = fullProfileData?.data?.skills || [];
  const keySkills = skills.filter(s => s.skill_type === "key_skill");
  const itSkills = skills.filter(s => s.skill_type === "it_skill");
  const employments = fullProfileData?.data?.employments || [];
  const educations = fullProfileData?.data?.educations || [];
  const projects = fullProfileData?.data?.projects || [];
  const accomplishments = fullProfileData?.data?.accomplishments || [];

  // Get current employment (is_current = true) or most recent employment
  const currentEmployment = employments.find(emp => emp.is_current) || employments[0];

  // Handle resume upload
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/rtf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid file (doc, docx, rtf, pdf)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }

    try {
      setIsUploadingResume(true);
      const response = await uploadResume(file);
      
      // Update user profile with the resume URL
      if (response.data?.resume_url) {
        await updateUserProfile({ resume_url: response.data.resume_url });
      }
      
      toast.success("Resume uploaded successfully!");
      // Refetch profile data to get updated resume URL
      await fetchProfile();
      // Also refetch full profile if needed
      refetchFullProfile();
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      toast.error(error?.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
      // Reset file input
      const fileInput = document.getElementById("resume-upload") as HTMLInputElement;
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
      toast.success("Resume headline updated!");
      setIsEditingHeadline(false);
      refetchFullProfile();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update headline");
    }
  };

  // Handle profile summary save
  const handleSaveSummary = async () => {
    try {
      await updateExtendedProfile({ profile_summary: profileSummary });
      toast.success("Profile summary updated!");
      setIsEditingSummary(false);
      refetchFullProfile();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update summary");
    }
  };

  // Handle skills save
  const handleSaveSkills = async () => {
    try {
      const skillNames = skillsInput.split(",").map(s => s.trim()).filter(s => s);
      const skillsData = skillNames.map(name => ({
        skill_name: name,
        skill_type: "key_skill" as const,
      }));
      await addBulkSkills({ skills: skillsData });
      toast.success("Skills updated!");
      setIsEditingSkills(false);
      refetchFullProfile();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update skills");
    }
  };

  // Handle IT skills save
  const handleSaveItSkills = async () => {
    try {
      const skillNames = itSkillsInput.split(",").map(s => s.trim()).filter(s => s);
      const skillsData = skillNames.map(name => ({
        skill_name: name,
        skill_type: "it_skill" as const,
      }));
      await addBulkSkills({ skills: skillsData });
      toast.success("IT Skills updated!");
      setIsEditingItSkills(false);
      refetchFullProfile();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update IT skills");
    }
  };

  // Calculate profile completion percentage (role-aware)
  // This should match the backend calculation in profileCompletion.controller.js
  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    let completedWeight = 0;
    let totalWeight = 100;

    // Basic fields for all roles (40% total)
    if (profileData.full_name && profileData.full_name.trim().length > 0) completedWeight += 10;
    if (profileData.email_verified === true) completedWeight += 5;
    if (profileData.phone_verified === true) completedWeight += 5;
    if (profileData.profile_image_url) completedWeight += 10;
    if (profileData.bio && profileData.bio.trim().length > 20) completedWeight += 10;

    if (role === "student") {
      // Student-specific fields (60% total)
      if (profileData.resume_url) completedWeight += 10;
      if (keySkills.length >= 3) completedWeight += 15;
      if (educations.length >= 1) completedWeight += 15;
      if (employments.length >= 1) completedWeight += 10;
      if (projects.length >= 1) completedWeight += 5;
      if (userData?.preferred_location) completedWeight += 5;
    } else if (role === "employer") {
      // Employer-specific fields (60% total)
      if (profileData.business_registration_id) completedWeight += 20;
      if (profileSummary && profileSummary.length > 50) completedWeight += 20;
      if (userData?.preferred_location) completedWeight += 20;
    } else {
      // Admin/SuperAdmin: only basic fields (40%)
      totalWeight = 40;
    }

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Format duration
  const formatDuration = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let duration = "";
    if (years > 0) duration += `${years} year${years > 1 ? "s" : ""}`;
    if (remainingMonths > 0) duration += ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;

    const startStr = start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const endStr = isCurrent ? "Present" : (endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present");

    return `${startStr} to ${endStr} (${duration.trim()})`;
  };

  if (loading || isFullProfileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#2d1b69]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 mx-4 mt-4">
          <p className="font-medium flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
            {error}
          </p>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Student Profile Header */}
          {role === "student" && (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Picture with completion ring */}
              <div className="relative group cursor-pointer" onClick={() => profileImageInputRef.current?.click()}>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                    {profileData?.profile_image_url ? (
                      <img
                        src={getImageUrl(profileData.profile_image_url) || ''}
                        alt={userData?.full_name || "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken image and show fallback
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    {/* Fallback initials - shown behind image or when no image */}
                    <div className="absolute inset-0 bg-[#2d1b69] flex items-center justify-center -z-10">
                      <span className="text-white font-bold text-4xl">
                        {userData?.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>
                  {/* Camera overlay for upload */}
                  <button
                    onClick={() => profileImageInputRef.current?.click()}
                    disabled={isUploadingProfileImage}
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    {isUploadingProfileImage ? (
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CameraIcon className="w-10 h-10 text-white" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={profileImageInputRef}
                    onChange={handleProfileImageUpload}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  <svg className="absolute inset-0 w-32 h-32 transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#e5e7eb" strokeWidth="6" />
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
                {/* Next milestone hint */}
                {profileCompletion < 100 && (() => {
                  const next = MILESTONES.find(m => m.threshold > profileCompletion);
                  return next ? (
                    <p className="text-[10px] text-center mt-1 text-[#2d1b69] font-medium">
                      Next: {next.name} at {next.threshold}%
                    </p>
                  ) : null;
                })()}
              </div>

              {/* Student Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData?.full_name?.toUpperCase() || "USER NAME"}
                  </h1>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Student
                  </span>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="text-gray-400 hover:text-[#2d1b69] transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-lg text-gray-700 mb-1">
                  {currentEmployment
                    ? currentEmployment.job_title
                    : "Software Developer"}
                  {currentEmployment && (
                    <span className="text-gray-600"> at {currentEmployment.company_name}</span>
                  )}
                </p>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <span>{userData?.preferred_location || "Location"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                    <span>
                      {extendedProfile?.total_experience_years || 0} Year{(extendedProfile?.total_experience_years || 0) !== 1 ? "s" : ""}{" "}
                      {extendedProfile?.total_experience_months || 0} Month{(extendedProfile?.total_experience_months || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {extendedProfile?.current_salary && (
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                      <span>₹ {extendedProfile.current_salary.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{userData?.mobile_number || "N/A"}</span>
                    {profileData?.phone_verified ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" title="Phone verified" />
                    ) : (
                      <button
                        onClick={() => setIsPhoneVerificationModalOpen(true)}
                        className="text-xs text-[#2d1b69] hover:text-[#2d1b69] font-medium underline cursor-pointer"
                        title="Verify phone number"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{userData?.email || "N/A"}</span>
                    {profileData?.email_verified ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" title="Email verified" />
                    ) : (
                      <button
                        onClick={() => setIsEmailVerificationModalOpen(true)}
                        className="text-xs text-[#2d1b69] hover:text-[#2d1b69] font-medium underline cursor-pointer"
                        title="Verify email"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{extendedProfile?.notice_period || "15 Days or less notice period"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate("/dashboard/academic/pending")}
                      className="text-xs text-[#2d1b69] hover:text-[#2d1b69] font-medium underline cursor-pointer"
                      title="Academic Verification"
                    >
                      Academic Verification
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                  </button>
                  <button
                    onClick={() => setIsDeleteAccountModalOpen(true)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Profile last updated - {profileData?.updated_at
                    ? new Date(profileData.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Recently"}
                </p>
              </div>

              {/* Achievements Card */}
              <div className="hidden lg:block w-72 flex-shrink-0">
                <ProfileMilestones
                  profileCompletion={profileCompletion}
                  userId={profileData?.user_id || user?.user_id}
                  onStartWizard={() => setIsCompletionWizardOpen(true)}
                />
              </div>
            </div>
          )}

          {/* Employer Profile Header */}
          {role === "employer" && (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Company Logo */}
              <div className="relative group cursor-pointer" onClick={() => profileImageInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-[#2d1b69] relative">
                  {profileData?.profile_image_url ? (
                    <img
                      src={getImageUrl(profileData.profile_image_url) || ''}
                      alt={userData?.full_name || "Company"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  {/* Fallback - shown behind image */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                    {userData?.full_name ? (
                      <span className="text-white font-bold text-4xl">
                        {userData.full_name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <BuildingOfficeIcon className="w-16 h-16 text-white" />
                    )}
                  </div>
                </div>
                {/* Camera overlay for upload */}
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={isUploadingProfileImage}
                  className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {isUploadingProfileImage ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CameraIcon className="w-10 h-10 text-white" />
                  )}
                </button>
                <input
                  type="file"
                  ref={profileImageInputRef}
                  onChange={handleProfileImageUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <div className="absolute bottom-0 right-0 bg-[#f4f0fa]0 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center border-2 border-white">
                  {profileCompletion}%
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData?.full_name?.toUpperCase() || "COMPANY NAME"}
                  </h1>
                  <span className="px-3 py-1 bg-[#e8dff5] text-[#2d1b69] rounded-full text-sm font-semibold">
                    Employer
                  </span>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="text-gray-400 hover:text-[#2d1b69] transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </div>

                {profileData?.business_registration_id && (
                  <p className="text-sm text-gray-600 mb-2">
                    Registration ID: {profileData.business_registration_id}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <span>{userData?.preferred_location || "Location not set"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{userData?.mobile_number || "N/A"}</span>
                    {profileData?.phone_verified ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" title="Phone verified" />
                    ) : (
                      <button
                        onClick={() => setIsPhoneVerificationModalOpen(true)}
                        className="text-xs text-[#2d1b69] hover:text-[#2d1b69] font-medium underline cursor-pointer"
                        title="Verify phone number"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{userData?.email || "N/A"}</span>
                    {profileData?.email_verified ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" title="Email verified" />
                    ) : (
                      <button
                        onClick={() => setIsEmailVerificationModalOpen(true)}
                        className="text-xs text-[#2d1b69] hover:text-[#2d1b69] font-medium underline cursor-pointer"
                        title="Verify email"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                  </button>
                  <button
                    onClick={() => setIsDeleteAccountModalOpen(true)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Profile last updated - {profileData?.updated_at
                    ? new Date(profileData.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Recently"}
                </p>
              </div>
            </div>
          )}

          {/* Admin Profile Header */}
          {(role === "admin" || role === "superadmin") && (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Admin Avatar */}
              <div className="relative group cursor-pointer" onClick={() => profileImageInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#2d1b69] relative">
                  {profileData?.profile_image_url ? (
                    <img
                      src={getImageUrl(profileData.profile_image_url) || ''}
                      alt={userData?.full_name || "Admin"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  {/* Fallback - shown behind image */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <span className="text-3xl font-bold text-white">
                      {userData?.full_name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                </div>
                {/* Camera overlay for upload */}
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={isUploadingProfileImage}
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {isUploadingProfileImage ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CameraIcon className="w-8 h-8 text-white" />
                  )}
                </button>
                <input
                  type="file"
                  ref={profileImageInputRef}
                  onChange={handleProfileImageUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
              </div>

              {/* Admin Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData?.full_name || "Administrator"}
                  </h1>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    {userRole || "Admin"}
                  </span>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="text-gray-400 hover:text-[#2d1b69] transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{userData?.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{userData?.mobile_number || "N/A"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>

                {/* Danger Zone - Delete Account */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-red-600 font-semibold mb-2">Danger Zone</p>
                  <button
                    onClick={() => setIsDeleteAccountModalOpen(true)}
                    className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Profile last updated - {profileData?.updated_at
                    ? new Date(profileData.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Recently"}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Quick Links */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-4">
              <div className="bg-[#2d1b69] px-4 py-3">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Quick Links
                </h3>
              </div>
              <nav className="p-3 space-y-1">
                {getSectionsForRole(role).map((item, index) => {
                  const isFirstSettingsTab = item.key === "account" && index > 0;
                  return (
                    <React.Fragment key={item.key}>
                      {isFirstSettingsTab && (
                        <div className="border-t border-gray-200 my-2 pt-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-1">Settings</p>
                        </div>
                      )}
                      <button
                        onClick={() => setActiveSection(item.key as ActiveSection)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                          activeSection === item.key
                            ? "bg-[#2d1b69] text-white shadow-lg transform scale-105"
                            : "text-gray-700 hover:bg-[#f4f0fa] hover:shadow-md"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <item.Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </span>
                        {item.action && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            activeSection === item.key
                              ? "bg-white/20 text-white"
                              : "bg-[#e8dff5] text-[#2d1b69]"
                          }`}>
                            {item.action}
                          </span>
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">

            {/* =================== STUDENT SECTIONS =================== */}
            {role === "student" && (
              <>
                {/* Resume Section */}
                {activeSection === "resume" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#2d1b69] px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Resume
                  </h2>
                </div>
                <div className="p-6">
                  {profileData?.resume_url && (
                    <div className="flex items-center justify-between p-5 bg-[#f4f0fa] rounded-xl border-2 border-[#e8dff5] mb-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#2d1b69] rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{profileData.resume_url.split("/").pop() || "resume.pdf"}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Uploaded on:</span> {profileData.updated_at
                              ? new Date(profileData.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleResumeDownload} 
                          className="p-3 rounded-xl bg-white hover:bg-[#f4f0fa] border-2 border-[#e8dff5] transition-all hover:scale-110 shadow-sm hover:shadow-md" 
                          title="Download Resume"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5 text-[#2d1b69]" />
                        </button>
                        <button 
                          className="p-3 rounded-xl bg-white hover:bg-red-50 border-2 border-red-200 transition-all hover:scale-110 shadow-sm hover:shadow-md" 
                          title="Delete Resume"
                        >
                          <TrashIcon className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-[#c4b5fd] rounded-xl p-10 text-center bg-[#f4f0fa] hover:border-[#a78bfa] transition-all">
                    <input 
                      type="file" 
                      id="resume-upload" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.rtf" 
                      onChange={handleResumeUpload} 
                      disabled={isUploadingResume} 
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-20 h-20 bg-[#2d1b69] rounded-full flex items-center justify-center mb-6 shadow-lg hover:scale-110 transition-transform">
                        <CloudArrowUpIcon className="w-10 h-10 text-white" />
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("resume-upload")?.click();
                        }}
                        className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={isUploadingResume}
                      >
                        {isUploadingResume ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </span>
                        ) : (
                          "Update Resume"
                        )}
                      </button>
                      <p className="text-sm text-gray-600 mt-4 font-medium">Supported Formats: <span className="text-[#2d1b69]">DOC, DOCX, RTF, PDF</span></p>
                      <p className="text-xs text-gray-500 mt-1">Maximum file size: 2 MB</p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Headline Section */}
            {activeSection === "resume-headline" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#2d1b69] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Resume Headline
                    </h2>
                    <button
                      onClick={() => setIsEditingHeadline(!isEditingHeadline)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d1b69] focus:border-[#2d1b69] resize-none transition-all"
                        rows={4}
                        placeholder="Enter your resume headline (e.g., Software Developer with 5+ years of experience in React, Node.js, and TypeScript)..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveHeadline}
                          className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditingHeadline(false)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-[#f4f0fa] rounded-xl border-2 border-[#e8dff5]">
                      <p className="text-gray-800 text-lg leading-relaxed">
                        {resumeHeadline || (
                          <span className="text-gray-500 italic">Add a compelling resume headline to summarize your professional experience and stand out to employers...</span>
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
                <div className="bg-[#2d1b69] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Key Skills
                    </h2>
                    <button
                      onClick={() => {
                        if (!isEditingSkills) {
                          // Pre-populate input with existing skills when entering edit mode
                          setSkillsInput(keySkills.map(s => s.skill_name).join(", "));
                        }
                        setIsEditingSkills(!isEditingSkills);
                      }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d1b69] focus:border-[#2d1b69] resize-none transition-all"
                        rows={4}
                        placeholder="Enter skills separated by commas (e.g., React.js, Node.js, TypeScript, MongoDB, AWS)"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveSkills}
                          className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                        >
                          Save Skills
                        </button>
                        <button
                          onClick={() => {
                            setSkillsInput(keySkills.map(s => s.skill_name).join(", "));
                            setIsEditingSkills(false);
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {keySkills.length > 0 ? (
                        keySkills.map((skill) => (
                          <span 
                            key={skill.skill_id} 
                            className="px-5 py-2.5 bg-[#f4f0fa] text-[#2d1b69] rounded-full text-sm font-semibold hover:bg-[#e8dff5] transition-all shadow-sm hover:shadow-md border border-[#e8dff5] hover:border-[#c4b5fd] transform hover:scale-105 cursor-default"
                          >
                            {skill.skill_name}
                          </span>
                        ))
                      ) : (
                        <div className="w-full p-8 text-center bg-[#f4f0fa] rounded-xl border-2 border-dashed border-[#e8dff5]">
                          <p className="text-gray-600 font-medium">Add your key skills to help employers find you</p>
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
                <div className="bg-[#2d1b69] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <BriefcaseIcon className="w-6 h-6" />
                      Employment History
                    </h2>
                    <button
                      onClick={() => { setEditingItem(null); setIsEmploymentModalOpen(true); }}
                      className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" /> Add Employment
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {employments.length > 0 ? (
                      employments.map((job) => (
                        <div key={job.employment_id} className="bg-[#f4f0fa] rounded-xl p-6 border-2 border-[#e8dff5] hover:border-[#c4b5fd] transition-all shadow-sm hover:shadow-md">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-[#f4f0fa]0 rounded-xl flex items-center justify-center shadow-lg">
                                  <BriefcaseIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-gray-900">{job.job_title}</h3>
                                    {job.is_current && (
                                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Current</span>
                                    )}
                                  </div>
                                  <p className="text-lg font-semibold text-[#2d1b69]">{job.company_name}</p>
                                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                    <span className="capitalize">{job.employment_type.replace("_", " ")}</span>
                                    <span>•</span>
                                    <span>{formatDuration(job.start_date, job.end_date, job.is_current)}</span>
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
                                onClick={() => { setEditingItem(job); setIsEmploymentModalOpen(true); }}
                                className="p-2 rounded-lg bg-white hover:bg-[#e8dff5] text-[#2d1b69] transition-all shadow-sm hover:shadow-md"
                                title="Edit"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to delete this employment?")) {
                                    await deleteEmployment(job.employment_id);
                                    toast.success("Employment deleted");
                                    refetchFullProfile();
                                  }
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-all shadow-sm hover:shadow-md"
                                title="Delete"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {job.description && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-[#e8dff5]">
                              <p className="text-gray-700 leading-relaxed">{job.description}</p>
                            </div>
                          )}
                          {job.key_skills && job.key_skills.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-3">Key Skills Used:</p>
                              <div className="flex flex-wrap gap-2">
                                {job.key_skills.map((skill, idx) => (
                                  <span key={idx} className="px-3 py-1.5 bg-white border border-[#e8dff5] text-[#2d1b69] rounded-full text-xs font-semibold shadow-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-[#f4f0fa] rounded-xl border-2 border-dashed border-[#e8dff5]">
                        <BriefcaseIcon className="w-16 h-16 text-[#c4b5fd] mx-auto mb-4" />
                        <p className="text-gray-600 font-medium text-lg mb-2">No employment history yet</p>
                        <p className="text-gray-500 text-sm">Click "Add Employment" to showcase your work experience</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Education Section */}
            {activeSection === "education" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#2d1b69] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M5 13.5A11.96 11.96 0 0112 14a11.96 11.96 0 017-1.5" />
                      </svg>
                      Education
                    </h2>
                    <button
                      onClick={() => { setEditingItem(null); setIsEducationModalOpen(true); }}
                      className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" /> Add Education
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {educations.length > 0 ? (
                      educations.map((edu) => (
                        <div key={edu.education_id} className="bg-[#f4f0fa] rounded-xl p-6 border-2 border-[#e8dff5] hover:border-[#c4b5fd] transition-all shadow-sm hover:shadow-md">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-14 h-14 bg-[#f4f0fa]0 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                                  {edu.is_current && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Ongoing</span>
                                  )}
                                </div>
                                <p className="text-lg font-semibold text-[#2d1b69] mb-1">{edu.institution_name}</p>
                                <p className="text-gray-700 font-medium mb-2">{edu.field_of_study}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4" />
                                    {edu.start_year} - {edu.is_current ? "Present" : edu.end_year}
                                  </span>
                                  {edu.grade && (
                                    <span className="px-3 py-1 bg-white border border-[#e8dff5] text-[#2d1b69] rounded-full font-semibold">
                                      Grade: {edu.grade} {edu.grade_type && `(${edu.grade_type.toUpperCase()})`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => { setEditingItem(edu); setIsEducationModalOpen(true); }}
                                className="p-2 rounded-lg bg-white hover:bg-[#e8dff5] text-[#2d1b69] transition-all shadow-sm hover:shadow-md"
                                title="Edit"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to delete this education?")) {
                                    await deleteEducation(edu.education_id);
                                    toast.success("Education deleted");
                                    refetchFullProfile();
                                  }
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-all shadow-sm hover:shadow-md"
                                title="Delete"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-[#f4f0fa] rounded-xl border-2 border-dashed border-[#e8dff5]">
                        <svg className="w-16 h-16 text-[#c4b5fd] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-gray-600 font-medium text-lg mb-2">No education added yet</p>
                        <p className="text-gray-500 text-sm">Click "Add Education" to showcase your academic background</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* IT Skills Section */}
            {activeSection === "it-skills" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#2d1b69] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      IT Skills
                    </h2>
                    <button
                      onClick={() => {
                        if (!isEditingItSkills) {
                          // Pre-populate input with existing IT skills when entering edit mode
                          setItSkillsInput(itSkills.map(s => s.skill_name).join(", "));
                        }
                        setIsEditingItSkills(!isEditingItSkills);
                      }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {isEditingItSkills ? (
                    <div className="space-y-4">
                      <textarea
                        value={itSkillsInput}
                        onChange={(e) => setItSkillsInput(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d1b69] focus:border-[#2d1b69] resize-none transition-all"
                        rows={4}
                        placeholder="Enter IT skills separated by commas (e.g., Python, Java, SQL, AWS, Docker)"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveItSkills}
                          className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                        >
                          Save IT Skills
                        </button>
                        <button
                          onClick={() => {
                            setItSkillsInput(itSkills.map(s => s.skill_name).join(", "));
                            setIsEditingItSkills(false);
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {itSkills.length > 0 ? (
                        itSkills.map((skill) => (
                          <span
                            key={skill.skill_id}
                            className="px-5 py-2.5 bg-[#f4f0fa] text-[#2d1b69] rounded-full text-sm font-semibold hover:bg-[#e8dff5] transition-all shadow-sm hover:shadow-md border border-[#e8dff5] hover:border-[#c4b5fd] transform hover:scale-105 cursor-default"
                          >
                            {skill.skill_name}
                            {skill.proficiency_level && (
                              <span className="ml-2 text-xs opacity-75">({skill.proficiency_level})</span>
                            )}
                          </span>
                        ))
                      ) : (
                        <div className="w-full p-8 text-center bg-[#f4f0fa] rounded-xl border-2 border-dashed border-[#e8dff5]">
                          <p className="text-gray-600 font-medium">Add your IT skills with proficiency levels</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {activeSection === "projects" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#2d1b69] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Projects
                    </h2>
                    <button
                      onClick={() => { setEditingItem(null); setIsProjectModalOpen(true); }}
                      className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" /> Add Project
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <div key={project.project_id} className="bg-[#f4f0fa] rounded-xl p-6 border-2 border-[#e8dff5] hover:border-[#c4b5fd] transition-all shadow-sm hover:shadow-md">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-14 h-14 bg-[#f4f0fa]0 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">{project.project_title}</h3>
                                  {project.is_ongoing && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Ongoing</span>
                                  )}
                                </div>
                                {project.role_in_project && (
                                  <p className="text-lg font-semibold text-pink-700 mb-2">{project.role_in_project}</p>
                                )}
                                {project.project_url && (
                                  <a 
                                    href={project.project_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold text-sm transition-all hover:underline"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View Project
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => { setEditingItem(project); setIsProjectModalOpen(true); }}
                                className="p-2 rounded-lg bg-white hover:bg-pink-100 text-pink-600 transition-all shadow-sm hover:shadow-md"
                                title="Edit"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to delete this project?")) {
                                    await deleteProject(project.project_id);
                                    toast.success("Project deleted");
                                    refetchFullProfile();
                                  }
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-all shadow-sm hover:shadow-md"
                                title="Delete"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {project.description && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-pink-100">
                              <p className="text-gray-700 leading-relaxed">{project.description}</p>
                            </div>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-3">Technologies Used:</p>
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, idx) => (
                                  <span key={idx} className="px-3 py-1.5 bg-white border border-[#e8dff5] text-pink-700 rounded-full text-xs font-semibold shadow-sm">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-[#f4f0fa] rounded-xl border-2 border-dashed border-[#e8dff5]">
                        <svg className="w-16 h-16 text-pink-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-gray-600 font-medium text-lg mb-2">No projects added yet</p>
                        <p className="text-gray-500 text-sm">Click "Add Project" to showcase your work</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Summary Section */}
            {activeSection === "profile-summary" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#2d1b69] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Summary
                    </h2>
                    <button
                      onClick={() => setIsEditingSummary(!isEditingSummary)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d1b69] focus:border-[#2d1b69] resize-none transition-all"
                        rows={8}
                        placeholder="Write a compelling profile summary about yourself, your experience, skills, and career goals. This helps employers understand who you are and what you bring to the table..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveSummary}
                          className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                        >
                          Save Summary
                        </button>
                        <button
                          onClick={() => setIsEditingSummary(false)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-[#f4f0fa] rounded-xl border-2 border-[#e8dff5]">
                      <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                        {profileSummary || (
                          <span className="text-gray-500 italic">Add a compelling profile summary to tell employers about yourself, your experience, and career goals...</span>
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
                <div className="bg-[#2d1b69] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Accomplishments
                    </h2>
                    <button
                      onClick={() => { setEditingItem(null); setIsAccomplishmentModalOpen(true); }}
                      className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" /> Add Accomplishment
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {accomplishments.length > 0 ? (
                      accomplishments.map((acc) => (
                        <div key={acc.accomplishment_id} className="bg-[#f4f0fa] rounded-xl p-6 border-2 border-[#e8dff5] hover:border-[#c4b5fd] transition-all shadow-sm hover:shadow-md">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-14 h-14 bg-[#f4f0fa]0 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-3 py-1 bg-white border border-fuchsia-300 text-fuchsia-700 rounded-full text-xs font-bold capitalize shadow-sm">
                                    {acc.accomplishment_type}
                                  </span>
                                  <h3 className="text-xl font-bold text-gray-900">{acc.title}</h3>
                                </div>
                                {acc.issuing_organization && (
                                  <p className="text-lg font-semibold text-fuchsia-700 mb-2">{acc.issuing_organization}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                                  {acc.issue_date && (
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      Issued: {new Date(acc.issue_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </span>
                                  )}
                                  {acc.expiry_date && (
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      Expires: {new Date(acc.expiry_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </span>
                                  )}
                                </div>
                                {acc.credential_url && (
                                  <a 
                                    href={acc.credential_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-2 text-[#2d1b69] hover:text-[#2d1b69] font-semibold text-sm transition-all hover:underline"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View Credential
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to delete this accomplishment?")) {
                                    await deleteAccomplishment(acc.accomplishment_id);
                                    toast.success("Accomplishment deleted");
                                    refetchFullProfile();
                                  }
                                }}
                                className="p-2 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-all shadow-sm hover:shadow-md"
                                title="Delete"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {acc.description && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-fuchsia-100">
                              <p className="text-gray-700 leading-relaxed">{acc.description}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-[#f4f0fa] rounded-xl border-2 border-dashed border-[#e8dff5]">
                        <svg className="w-16 h-16 text-[#c4b5fd] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <p className="text-gray-600 font-medium text-lg mb-2">No accomplishments added yet</p>
                        <p className="text-gray-500 text-sm">Add certifications, awards, publications, patents, and more</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
              </>
            )}

            {/* =================== EMPLOYER SECTIONS =================== */}
            {role === "employer" && (
              <>
                {/* Company Info Section */}
                {activeSection === "company-info" && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-[#2d1b69] px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <BuildingOfficeIcon className="w-6 h-6" />
                          Company Information
                        </h2>
                        <button
                          onClick={() => setIsEditProfileModalOpen(true)}
                          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Company Name</label>
                            <p className="text-lg font-semibold text-gray-900">{profileData?.full_name || "Not set"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Business Registration ID</label>
                            <p className="text-lg text-gray-700">{profileData?.business_registration_id || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Location</label>
                            <p className="text-lg text-gray-700 flex items-center gap-2">
                              <MapPinIcon className="w-5 h-5 text-gray-400" />
                              {userData?.preferred_location || "Not set"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Contact Email</label>
                            <p className="text-lg text-gray-700 flex items-center gap-2">
                              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                              {userData?.email || "Not set"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                            <p className="text-lg text-gray-700 flex items-center gap-2">
                              <PhoneIcon className="w-5 h-5 text-gray-400" />
                              {userData?.mobile_number || "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Description Section */}
                {activeSection === "company-description" && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-[#2d1b69] px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <ClipboardDocumentListIcon className="w-6 h-6" />
                          About Company
                        </h2>
                        <button
                          onClick={() => setIsEditingSummary(!isEditingSummary)}
                          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d1b69] focus:border-[#2d1b69] resize-none transition-all"
                            rows={8}
                            placeholder="Describe your company, its mission, values, culture, and what makes it a great place to work..."
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={handleSaveSummary}
                              className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                            >
                              Save Description
                            </button>
                            <button
                              onClick={() => setIsEditingSummary(false)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-[#f4f0fa] rounded-xl border-2 border-[#e8dff5]">
                          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                            {profileSummary || (
                              <span className="text-gray-500 italic">Add a description about your company, its mission, values, and culture...</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Profile Summary (for employers) */}
                {activeSection === "profile-summary" && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-[#2d1b69] px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <DocumentTextIcon className="w-6 h-6" />
                          Company Summary
                        </h2>
                        <button
                          onClick={() => setIsEditingSummary(!isEditingSummary)}
                          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d1b69] focus:border-[#2d1b69] resize-none transition-all"
                            rows={8}
                            placeholder="Write a compelling summary about your company..."
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={handleSaveSummary}
                              className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                            >
                              Save Summary
                            </button>
                            <button
                              onClick={() => setIsEditingSummary(false)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-[#f4f0fa] rounded-xl border-2 border-[#e8dff5]">
                          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                            {profileSummary || (
                              <span className="text-gray-500 italic">Add a compelling company summary...</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Posted Jobs Section */}
                {activeSection === "posted-jobs" && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-[#2d1b69] px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BriefcaseIcon className="w-6 h-6" />
                        Posted Jobs
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="text-center py-8">
                        <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">View and manage your job postings</p>
                        <button
                          onClick={() => navigate("/dashboard/jobs")}
                          className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                        >
                          View All Jobs
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* =================== ADMIN SECTIONS =================== */}
            {(role === "admin" || role === "superadmin") && (
              <>
                {/* Account Settings Section */}
                {activeSection === "account-settings" && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-[#2d1b69] px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Cog6ToothIcon className="w-6 h-6" />
                        Account Settings
                      </h2>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Account Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="text-lg font-semibold text-gray-900">{userData?.full_name || "Administrator"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-lg text-gray-700">{userData?.email || "Not set"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-lg text-gray-700">{userData?.mobile_number || "Not set"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">Role</label>
                          <p className="text-lg text-gray-700">{userRole || "Admin"}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => setIsEditProfileModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2d1b69] hover:bg-[#1f1250] text-white rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          <PencilIcon className="w-5 h-5" />
                          Edit Profile
                        </button>
                        <button
                          onClick={() => setIsChangePasswordModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Change Password
                        </button>
                        <button
                          onClick={() => setIsDeleteAccountModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          <TrashIcon className="w-5 h-5" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Summary (for admins) */}
                {activeSection === "profile-summary" && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-[#2d1b69] px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <ClipboardDocumentListIcon className="w-6 h-6" />
                          Profile Summary
                        </h2>
                        <button
                          onClick={() => setIsEditingSummary(!isEditingSummary)}
                          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d1b69] focus:border-[#2d1b69] resize-none transition-all"
                            rows={8}
                            placeholder="Add a brief summary about yourself..."
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={handleSaveSummary}
                              className="bg-[#2d1b69] hover:bg-[#1f1250] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                            >
                              Save Summary
                            </button>
                            <button
                              onClick={() => setIsEditingSummary(false)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-[#f4f0fa] rounded-xl border-2 border-[#e8dff5]">
                          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                            {profileSummary || (
                              <span className="text-gray-500 italic">Add a brief summary about yourself...</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* =================== UNIVERSAL SETTINGS SECTIONS =================== */}

            {/* Account Tab */}
            {activeSection === "account" && (
              <AccountTab
                profileData={profileData}
                userData={userData}
                userRole={userRole}
                onEditProfile={() => setIsEditProfileModalOpen(true)}
                onVerifyEmail={() => setIsEmailVerificationModalOpen(true)}
                onVerifyPhone={() => setIsPhoneVerificationModalOpen(true)}
              />
            )}

            {/* Preferences Tab */}
            {activeSection === "preferences" && (
              <PreferencesTab />
            )}

            {/* Notifications Tab */}
            {activeSection === "notifications" && (
              <NotificationsTab userId={profileData?.user_id || user?.user_id} />
            )}

            {/* Security Tab */}
            {activeSection === "security" && (
              <SecurityTab
                profileData={profileData}
                userData={userData}
                onChangePassword={() => setIsChangePasswordModalOpen(true)}
                onVerifyEmail={() => setIsEmailVerificationModalOpen(true)}
                onVerifyPhone={() => setIsPhoneVerificationModalOpen(true)}
                onDeleteAccount={() => setIsDeleteAccountModalOpen(true)}
              />
            )}

          </div>
        </div>
      </div>

      {/* TrustScore Section - Only for students */}
      {role === "student" && trustScoreResponse?.data && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <TrustScoreCard trustScore={trustScoreResponse.data} isLoading={isTrustScoreLoading} />
        </div>
      )}

      {/* Student-Specific Modals */}
      {role === "student" && (
        <>
          {/* Employment Modal */}
          <EmploymentModal
            isOpen={isEmploymentModalOpen}
            onClose={() => { setIsEmploymentModalOpen(false); setEditingItem(null); }}
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
            onClose={() => { setIsEducationModalOpen(false); setEditingItem(null); }}
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
            onClose={() => { setIsProjectModalOpen(false); setEditingItem(null); }}
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
            onClose={() => { setIsAccomplishmentModalOpen(false); setEditingItem(null); }}
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
        </>
      )}

      {/* Profile Completion Wizard */}
      <ProfileCompletionWizard
        isOpen={isCompletionWizardOpen}
        onClose={() => setIsCompletionWizardOpen(false)}
        onComplete={() => {
          setIsCompletionWizardOpen(false);
          refetchFullProfile();
        }}
      />

      {/* Common Modals - Available for all roles */}
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} userEmail={userData?.email || ""} />
      <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} profileData={profileData} onUpdateSuccess={handleProfileUpdateSuccess} userRole={userRole || ""} />
      <PhoneVerificationModal isOpen={isPhoneVerificationModalOpen} onClose={() => setIsPhoneVerificationModalOpen(false)} onSuccess={handlePhoneVerificationSuccess} phoneNumber={profileData?.mobile_number} />
      <EmailVerificationModal isOpen={isEmailVerificationModalOpen} onClose={() => setIsEmailVerificationModalOpen(false)} onSuccess={() => { refetchFullProfile(); }} email={userData?.email} />
      <DeleteAccountModal isOpen={isDeleteAccountModalOpen} onClose={() => setIsDeleteAccountModalOpen(false)} />
    </div>
  );
};

// ====================== MODAL COMPONENTS ======================

interface EmploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: UserEmployment | null;
  onSave: (data: CreateEmploymentRequest) => Promise<void>;
}

const EmploymentModal: React.FC<EmploymentModalProps> = ({ isOpen, onClose, editingItem, onSave }) => {
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
      const skills = skillsInput.split(",").map(s => s.trim()).filter(s => s);
      await onSave({ ...formData, key_skills: skills });
      toast.success(editingItem ? "Employment updated!" : "Employment added!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save employment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{editingItem ? "Edit Employment" : "Add Employment"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input type="text" required value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
              <select value={formData.employment_type} onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} disabled={formData.is_current} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69] disabled:bg-gray-100" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_current" checked={formData.is_current} onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: "" })} className="rounded border-gray-300 text-[#2d1b69] focus:ring-[#2d1b69]" />
            <label htmlFor="is_current" className="text-sm text-gray-700">I currently work here</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
            <input type="text" value={formData.notice_period} onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })} placeholder="e.g., 15 Days or less" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" placeholder="Describe your responsibilities and achievements..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Skills (comma separated)</label>
            <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="React.js, Node.js, TypeScript" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-[#2d1b69] rounded-lg hover:bg-[#1f1250] transition disabled:opacity-50">{isSubmitting ? "Saving..." : "Save"}</button>
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

const EducationModal: React.FC<EducationModalProps> = ({ isOpen, onClose, editingItem, onSave }) => {
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
      toast.success(editingItem ? "Education updated!" : "Education added!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save education");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{editingItem ? "Edit Education" : "Add Education"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
            <input type="text" required value={formData.degree} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} placeholder="e.g., Bachelor of Technology" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
            <input type="text" required value={formData.field_of_study} onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })} placeholder="e.g., Computer Science" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
            <input type="text" required value={formData.institution_name} onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Year *</label>
              <input type="number" required min="1950" max="2030" value={formData.start_year} onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
              <input type="number" min="1950" max="2030" value={formData.end_year || ""} onChange={(e) => setFormData({ ...formData, end_year: e.target.value ? parseInt(e.target.value) : undefined })} disabled={formData.is_current} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69] disabled:bg-gray-100" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_current_edu" checked={formData.is_current} onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_year: undefined })} className="rounded border-gray-300 text-[#2d1b69] focus:ring-[#2d1b69]" />
            <label htmlFor="is_current_edu" className="text-sm text-gray-700">Currently pursuing</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <input type="text" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} placeholder="e.g., 8.5 or 85%" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Type</label>
              <select value={formData.grade_type || ""} onChange={(e) => setFormData({ ...formData, grade_type: e.target.value as any || undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]">
                <option value="">Select type</option>
                <option value="percentage">Percentage</option>
                <option value="cgpa">CGPA</option>
                <option value="gpa">GPA</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-[#2d1b69] rounded-lg hover:bg-[#1f1250] transition disabled:opacity-50">{isSubmitting ? "Saving..." : "Save"}</button>
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

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, editingItem, onSave }) => {
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
      const technologies = techInput.split(",").map(s => s.trim()).filter(s => s);
      await onSave({ ...formData, technologies });
      toast.success(editingItem ? "Project updated!" : "Project added!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{editingItem ? "Edit Project" : "Add Project"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
            <input type="text" required value={formData.project_title} onChange={(e) => setFormData({ ...formData, project_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
            <input type="text" value={formData.role_in_project} onChange={(e) => setFormData({ ...formData, role_in_project: e.target.value })} placeholder="e.g., Lead Developer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
            <input type="url" value={formData.project_url} onChange={(e) => setFormData({ ...formData, project_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" placeholder="Describe the project..." />
      </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma separated)</label>
            <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="React, Node.js, MongoDB" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_ongoing" checked={formData.is_ongoing} onChange={(e) => setFormData({ ...formData, is_ongoing: e.target.checked })} className="rounded border-gray-300 text-[#2d1b69] focus:ring-[#2d1b69]" />
            <label htmlFor="is_ongoing" className="text-sm text-gray-700">Ongoing project</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-[#2d1b69] rounded-lg hover:bg-[#1f1250] transition disabled:opacity-50">{isSubmitting ? "Saving..." : "Save"}</button>
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

const AccomplishmentModal: React.FC<AccomplishmentModalProps> = ({ isOpen, onClose, editingItem, onSave }) => {
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
      toast.success(editingItem ? "Accomplishment updated!" : "Accomplishment added!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save accomplishment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{editingItem ? "Edit Accomplishment" : "Add Accomplishment"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select value={formData.accomplishment_type} onChange={(e) => setFormData({ ...formData, accomplishment_type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]">
              <option value="certification">Certification</option>
              <option value="award">Award</option>
              <option value="publication">Publication</option>
              <option value="patent">Patent</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
            <input type="text" value={formData.issuing_organization} onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
            <input type="url" value={formData.credential_url} onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d1b69]" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-[#2d1b69] rounded-lg hover:bg-[#1f1250] transition disabled:opacity-50">{isSubmitting ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

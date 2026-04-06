import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getUserProfile, updateUserProfile } from "../services/api/profileApi";
import { uploadResume } from "../services/api/resumeApi";
import type { UserProfile as UserProfileType } from "../services/api/profileApi";
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
} from "../services/api/extendedProfileApi";
import { useResendVerificationEmailMutation } from "../services/api/authApi";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import UserProfile from "./UserProfile";
import SuperAdminProfile from "./SuperAdminProfile";

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

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: any) => state.auth.user);
  const role = useSelector((state: any) => state.auth.role);

  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("resume");
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Modal states
  const [isEmploymentModalOpen, setIsEmploymentModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAccomplishmentModalOpen, setIsAccomplishmentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [resumeHeadline, setResumeHeadline] = useState<string>("");
  const [profileSummary, setProfileSummary] = useState<string>("");
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [skillsInput, setSkillsInput] = useState<string>("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);

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
        .filter(s => s.skill_type === "key_skill")
        .map(s => s.skill_name);
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
  const normalizedUserRole = (userRole || "").toString().toLowerCase();
  const shouldShowVerifyAccountButton =
    normalizedUserRole !== "admin" && normalizedUserRole !== "superadmin";

  const isEmailVerified = Boolean(profileData?.email_verified);
  const isPhoneVerified = Boolean(profileData?.phone_verified);
  const isAccountVerified = isEmailVerified && isPhoneVerified;
  const isVerifyAccountButtonDisabled = loading || !profileData;
  const verificationEmail = userData?.email || "";

  const handleVerifyAccountClick = () => {
    if (isAccountVerified) return;
    if (!verificationEmail) return;
    localStorage.setItem("pendingVerificationEmail", verificationEmail);
    navigate("/auth/verification");
  };

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
      toast.error(error?.response?.data?.message || t("profile.resumeUploadFailed"));
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
      const skillNames = skillsInput.split(",").map(s => s.trim()).filter(s => s);
      const skillsData = skillNames.map(name => ({
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

  // Format duration
  const formatDuration = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let duration = "";
    if (years > 0) duration += `${years} ${years > 1 ? t("profile.years") : t("profile.year")}`;
    if (remainingMonths > 0) duration += ` ${remainingMonths} ${remainingMonths > 1 ? t("profile.months") : t("profile.month")}`;

    const startStr = start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const endStr = isCurrent ? t("profile.present") : (endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : t("profile.present"));

    return `${startStr} to ${endStr} (${duration.trim()})`;
  };

  if (loading || isFullProfileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  // Role detection for conditional rendering
  const isSuperAdmin = normalizedUserRole === "superadmin";

  // Render SuperAdminProfile for SuperAdmin users
  if (isSuperAdmin) {
    return (
      <SuperAdminProfile
        profileData={profileData}
        user={user}
        userRole={userRole}
        loading={loading}
        isChangePasswordModalOpen={isChangePasswordModalOpen}
        setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
        isEditProfileModalOpen={isEditProfileModalOpen}
        setIsEditProfileModalOpen={setIsEditProfileModalOpen}
        handleProfileUpdateSuccess={handleProfileUpdateSuccess}
      />
    );
  }

  // Render UserProfile for all other users
  return (
    <UserProfile
      profileData={profileData}
      user={user}
      userRole={userRole}
      loading={loading}
      isFullProfileLoading={isFullProfileLoading}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      isChangePasswordModalOpen={isChangePasswordModalOpen}
      setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
      isEditProfileModalOpen={isEditProfileModalOpen}
      setIsEditProfileModalOpen={setIsEditProfileModalOpen}
      isPhoneVerificationModalOpen={isPhoneVerificationModalOpen}
      setIsPhoneVerificationModalOpen={setIsPhoneVerificationModalOpen}
      isEmploymentModalOpen={isEmploymentModalOpen}
      setIsEmploymentModalOpen={setIsEmploymentModalOpen}
      isEducationModalOpen={isEducationModalOpen}
      setIsEducationModalOpen={setIsEducationModalOpen}
      isProjectModalOpen={isProjectModalOpen}
      setIsProjectModalOpen={setIsProjectModalOpen}
      isAccomplishmentModalOpen={isAccomplishmentModalOpen}
      setIsAccomplishmentModalOpen={setIsAccomplishmentModalOpen}
      editingItem={editingItem}
      setEditingItem={setEditingItem}
      resumeHeadline={resumeHeadline}
      setResumeHeadline={setResumeHeadline}
      profileSummary={profileSummary}
      setProfileSummary={setProfileSummary}
      isEditingHeadline={isEditingHeadline}
      setIsEditingHeadline={setIsEditingHeadline}
      isEditingSummary={isEditingSummary}
      setIsEditingSummary={setIsEditingSummary}
      skillsInput={skillsInput}
      setSkillsInput={setSkillsInput}
      isEditingSkills={isEditingSkills}
      setIsEditingSkills={setIsEditingSkills}
      isUploadingResume={isUploadingResume}
      handleResumeUpload={handleResumeUpload}
      handleResumeDownload={handleResumeDownload}
      handleSaveHeadline={handleSaveHeadline}
      handleSaveSummary={handleSaveSummary}
      handleSaveSkills={handleSaveSkills}
      calculateProfileCompletion={calculateProfileCompletion}
      formatDuration={formatDuration}
      fullProfileData={fullProfileData}
      error={error}
      shouldShowVerifyAccountButton={shouldShowVerifyAccountButton}
      isVerifyAccountButtonDisabled={isVerifyAccountButtonDisabled}
      verificationEmail={verificationEmail}
      handleVerifyAccountClick={handleVerifyAccountClick}
      trustScoreResponse={trustScoreResponse}
      isTrustScoreLoading={isTrustScoreLoading}
      handleProfileUpdateSuccess={handleProfileUpdateSuccess}
      handlePhoneVerificationSuccess={handlePhoneVerificationSuccess}
      employments={employments}
      educations={educations}
      projects={projects}
      accomplishments={accomplishments}
      keySkills={keySkills}
      itSkills={itSkills}
      currentEmployment={currentEmployment}
      extendedProfile={extendedProfile}
      onEmploymentSave={async (data: any) => {
        if (editingItem) {
          await updateEmployment({ id: editingItem.employment_id, data });
        } else {
          await addEmployment(data);
        }
        refetchFullProfile();
        setIsEmploymentModalOpen(false);
        setEditingItem(null);
      }}
      onEducationSave={async (data: any) => {
        if (editingItem) {
          await updateEducation({ id: editingItem.education_id, data });
        } else {
          await addEducation(data);
        }
        refetchFullProfile();
        setIsEducationModalOpen(false);
        setEditingItem(null);
      }}
      onProjectSave={async (data: any) => {
        if (editingItem) {
          await updateProject({ id: editingItem.project_id, data });
        } else {
          await addProject(data);
        }
        refetchFullProfile();
        setIsProjectModalOpen(false);
        setEditingItem(null);
      }}
      onAccomplishmentSave={async (data: any) => {
        if (editingItem) {
          await deleteAccomplishment(editingItem.accomplishment_id);
        }
        await addAccomplishment(data);
        refetchFullProfile();
        setIsAccomplishmentModalOpen(false);
        setEditingItem(null);
      }}
      onEmploymentDelete={async (id: string) => {
        await deleteEmployment(id);
        toast.success(t("profile.employmentDeleted"));
        refetchFullProfile();
      }}
      onEducationDelete={async (id: string) => {
        await deleteEducation(id);
        toast.success(t("profile.educationDeleted"));
        refetchFullProfile();
      }}
      onProjectDelete={async (id: string) => {
        await deleteProject(id);
        toast.success(t("profile.projectDeleted"));
        refetchFullProfile();
      }}
      onAccomplishmentDelete={async (id: string) => {
        await deleteAccomplishment(id);
        toast.success(t("profile.accomplishmentDeleted"));
        refetchFullProfile();
      }}
      handleResendVerificationEmail={async () => {
        try {
          await resendVerificationEmail(userData?.email || "").unwrap();
          toast.success(t("profile.verificationEmailSent"));
        } catch (error: any) {
          toast.error(error?.data?.message || t("profile.verificationEmailFailed"));
        }
      }}
    />
  );
};

export default Profile;

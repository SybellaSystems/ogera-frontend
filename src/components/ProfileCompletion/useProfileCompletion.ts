import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { getUserProfile } from "../../services/api/profileApi";
import { useGetFullProfileQuery } from "../../services/api/extendedProfileApi";

export function useProfileCompletion() {
  const user = useSelector((state: any) => state.auth.user);
  const roleRaw = useSelector((state: any) => state.auth.role);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : undefined;

  const [profileData, setProfileData] = useState<any>(null);
  const { data: fullProfileData } = useGetFullProfileQuery();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfileData(response.data);
      } catch {
        // silently fail
      }
    };
    fetchProfile();
  }, []);

  const profileCompletion = useMemo(() => {
    if (!profileData) return 0;
    let completedWeight = 0;
    let totalWeight = 100;

    const skills = fullProfileData?.data?.skills || [];
    const keySkills = skills.filter((s: any) => s.skill_type === "key_skill");
    const educations = fullProfileData?.data?.educations || [];
    const employments = fullProfileData?.data?.employments || [];
    const projects = fullProfileData?.data?.projects || [];
    const profileSummary = fullProfileData?.data?.extendedProfile?.profile_summary || "";

    // Basic fields for all roles (40% total)
    if (profileData.full_name && profileData.full_name.trim().length > 0) completedWeight += 10;
    if (profileData.email_verified === true) completedWeight += 5;
    if (profileData.phone_verified === true) completedWeight += 5;
    if (profileData.profile_image_url) completedWeight += 10;
    if (profileData.bio && profileData.bio.trim().length > 20) completedWeight += 10;

    if (role === "student") {
      if (profileData.resume_url) completedWeight += 10;
      if (keySkills.length >= 3) completedWeight += 15;
      if (educations.length >= 1) completedWeight += 15;
      if (employments.length >= 1) completedWeight += 10;
      if (projects.length >= 1) completedWeight += 5;
      if (profileData.preferred_location || user?.preferred_location) completedWeight += 5;
    } else if (role === "employer") {
      if (profileData.business_registration_id) completedWeight += 20;
      if (profileSummary && profileSummary.length > 50) completedWeight += 20;
      if (profileData.preferred_location || user?.preferred_location) completedWeight += 20;
    } else {
      totalWeight = 40;
    }

    return Math.round((completedWeight / totalWeight) * 100);
  }, [profileData, fullProfileData, role, user]);

  return {
    profileCompletion,
    userId: profileData?.user_id || user?.user_id,
    role,
  };
}

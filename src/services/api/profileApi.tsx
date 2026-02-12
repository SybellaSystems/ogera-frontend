import api from "./axiosInstance";

export interface UserProfile {
  user_id: string;
  email: string;
  mobile_number: string;
  full_name: string;
  profile_image_url?: string;
  bio?: string;
  national_id_number?: string;
  business_registration_id?: string;
  resume_url?: string;
  cover_letter?: string;
  preferred_location?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  two_fa_enabled: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  profile_completion_percentage?: number;
  created_at: string;
  updated_at: string;
  role: {
    id: string;
    roleName: string;
    roleType: 'student' | 'employer' | 'superAdmin' | 'admin';
  };
}

export interface ProfileApiResponse {
  success: boolean;
  status: number;
  data: UserProfile;
  message: string;
}

export const getUserProfile = async (): Promise<ProfileApiResponse> => {
  const res = await api.get<ProfileApiResponse>("/auth/profile");
  return res.data;
};

export interface UpdateProfileData {
  full_name?: string;
  email?: string;
  mobile_number?: string;
  national_id_number?: string;
  business_registration_id?: string;
  resume_url?: string;
  cover_letter?: string;
  preferred_location?: string;
}

export const updateUserProfile = async (
  data: UpdateProfileData
): Promise<ProfileApiResponse> => {
  const res = await api.put<ProfileApiResponse>("/auth/profile", data);
  return res.data;
};

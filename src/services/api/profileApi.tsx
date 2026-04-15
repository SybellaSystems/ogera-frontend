import api from "./axiosInstance";

export interface UserProfile {
  user_id: string;
  email: string;
  mobile_number: string;
  full_name: string;
  national_id_number?: string;
  business_registration_id?: string;
  resume_url?: string;
  cover_letter?: string;
  preferred_location?: string;
  profile_image_url?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  two_fa_enabled: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
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
  resume_url?: string | null;
  cover_letter?: string | null;
  preferred_location?: string | null;
}

export const updateUserProfile = async (
  data: UpdateProfileData
): Promise<ProfileApiResponse> => {
  const res = await api.put<ProfileApiResponse>("/auth/profile", data);
  return res.data;
};

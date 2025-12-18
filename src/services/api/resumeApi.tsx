import api from "./axiosInstance";

export interface ResumeUploadResponse {
  success: boolean;
  status: number;
  data: {
    resume_url: string;
    path: string;
    storageType: string;
  };
  message: string;
}

/**
 * Upload resume file for job application
 */
export const uploadResume = async (file: File): Promise<ResumeUploadResponse> => {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await api.post<ResumeUploadResponse>(
    "/upload-resume",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};


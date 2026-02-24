import api from "./axiosInstance";

export type IdentityVerificationStatus = "pending" | "accepted" | "rejected";
export type StorageType = "local" | "s3";
export type IdentityDocumentType =
  | "national_id"
  | "passport"
  | "drivers_license"
  | "business_registration"
  | "tax_certificate"
  | "utility_bill";
export type IdentityUserType = "student" | "employer";

export interface IdentityVerification {
  id: string;
  user_id: string;
  user_type: IdentityUserType;
  document_type: IdentityDocumentType;
  document_path: string;
  storage_type: StorageType;
  status: IdentityVerificationStatus;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  assigned_to?: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  user?: {
    user_id: string;
    full_name: string;
    email: string;
    mobile_number?: string;
    role_type?: string;
  };
  reviewer?: {
    user_id: string;
    full_name: string;
    email: string;
  } | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const DOCUMENT_TYPE_LABELS: Record<IdentityDocumentType, string> = {
  national_id: "National ID Card",
  passport: "Passport",
  drivers_license: "Driver's License",
  business_registration: "Business Registration Certificate",
  tax_certificate: "Tax Certificate",
  utility_bill: "Utility Bill",
};

export const STUDENT_DOC_TYPES: IdentityDocumentType[] = [
  "national_id",
  "passport",
  "drivers_license",
];

export const EMPLOYER_DOC_TYPES: IdentityDocumentType[] = [
  "business_registration",
  "tax_certificate",
  "utility_bill",
];

// -------- STUDENT / EMPLOYER --------

export const getMyIdentityVerification = async () => {
  const res = await api.get<PaginatedResponse<IdentityVerification>>(
    "/identity-verifications/my-verification"
  );
  return res.data;
};

export const uploadIdentityVerification = async (
  file: File,
  document_type: IdentityDocumentType
) => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("document_type", document_type);

  const res = await api.post<PaginatedResponse<IdentityVerification>>(
    "/identity-verifications",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const reuploadIdentityVerification = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("document", file);

  const res = await api.post<PaginatedResponse<IdentityVerification>>(
    `/identity-verifications/${id}/reupload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

// -------- ADMIN --------

export const getPendingIdentityVerifications = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const { page = 1, limit = 10 } = params || {};
  const res = await api.get<PaginatedResponse<IdentityVerification[]>>(
    "/identity-verifications/pending/list",
    { params: { page, limit } }
  );
  return res.data;
};

export const getIdentityVerificationsByStatus = async (
  status: IdentityVerificationStatus,
  params?: { page?: number; limit?: number }
) => {
  const { page = 1, limit = 10 } = params || {};
  const res = await api.get<PaginatedResponse<IdentityVerification[]>>(
    "/identity-verifications",
    { params: { status, page, limit } }
  );
  return res.data;
};

export const reviewIdentityVerification = async (options: {
  id: string;
  status: "accepted" | "rejected";
  rejection_reason?: string;
}) => {
  const res = await api.patch<PaginatedResponse<IdentityVerification>>(
    `/identity-verifications/${options.id}/review`,
    { status: options.status, rejection_reason: options.rejection_reason }
  );
  return res.data;
};

export const getOverdueIdentityVerifications = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const { page = 1, limit = 10 } = params || {};
  const res = await api.get<PaginatedResponse<IdentityVerification[]>>(
    "/identity-verifications/overdue/list",
    { params: { page, limit } }
  );
  return res.data;
};

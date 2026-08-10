export type ReferralStatus =
  | "draft"
  | "pending_verification"
  | "verified"
  | "active"
  | "closed"
  | "rejected"
  | "expired";

export type VerificationStatus =
  | "Not Checked"
  | "Contact Attempted"
  | "Confirmed"
  | "Could Not Confirm"
  | "Vacancy Closed";

export type PermissionStatus =
  | "Not Asked"
  | "Granted"
  | "Declined"
  | "Not Required"
  | "Unknown";

export interface JobReferral {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  description: string;
  source: string;
  originalUrl: string;

  verificationStatus: VerificationStatus;
  permissionStatus: PermissionStatus;
  verificationNotes: string;

  status: ReferralStatus;

  expiryDate: string;

  createdAt: string;
  createdBy: string;

  views: number;
  applyClicks: number;
  reportedApplications: number;
}
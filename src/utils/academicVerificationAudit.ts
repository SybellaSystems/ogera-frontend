export interface AcademicAuditEntry {
  timestamp: string;
  action: string;
  status: "success" | "failure";
  verificationId: string;
  userName: string;
  userEmail: string;
  performedBy: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "academic_verification_audit_log";
const MAX_ENTRIES = 100;

export const ACADEMIC_ACTIONS = {
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
  DOCUMENT_REUPLOADED: "DOCUMENT_REUPLOADED",
  VERIFICATION_APPROVED: "VERIFICATION_APPROVED",
  VERIFICATION_REJECTED: "VERIFICATION_REJECTED",
  DOCUMENT_VIEWED: "DOCUMENT_VIEWED",
} as const;

export const logAcademicVerificationEvent = (
  action: string,
  status: AcademicAuditEntry["status"],
  verification: {
    verificationId: string;
    userName: string;
    userEmail: string;
  },
  performedBy: string,
  reason?: string,
  metadata?: Record<string, unknown>
): void => {
  try {
    const log = getAcademicVerificationAuditLog();
    const entry: AcademicAuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      status,
      verificationId: verification.verificationId,
      userName: verification.userName,
      userEmail: verification.userEmail,
      performedBy,
      reason,
      metadata,
    };

    log.push(entry);

    const trimmed = log.length > MAX_ENTRIES ? log.slice(-MAX_ENTRIES) : log;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail — audit logging should never break the app
  }
};

export const getAcademicVerificationAuditLog = (): AcademicAuditEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AcademicAuditEntry[];
  } catch {
    return [];
  }
};

export const getAuditLogForVerification = (
  verificationId: string
): AcademicAuditEntry[] => {
  return getAcademicVerificationAuditLog().filter(
    (entry) => entry.verificationId === verificationId
  );
};

export const clearAcademicVerificationAuditLog = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

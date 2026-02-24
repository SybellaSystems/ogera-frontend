export interface AuditEntry {
  timestamp: string;
  action: string;
  status: "success" | "failure" | "locked";
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "verification_audit_log";
const MAX_ENTRIES = 50;

export const AUDIT_ACTIONS = {
  EMAIL_VERIFICATION_PAGE_LOADED: "EMAIL_VERIFICATION_PAGE_LOADED",
  EMAIL_RESEND_REQUESTED: "EMAIL_RESEND_REQUESTED",
  EMAIL_RESEND_SUCCESS: "EMAIL_RESEND_SUCCESS",
  EMAIL_RESEND_FAILED: "EMAIL_RESEND_FAILED",
  EMAIL_RESEND_LOCKED: "EMAIL_RESEND_LOCKED",
  EMAIL_VERIFIED_VIA_TOKEN: "EMAIL_VERIFIED_VIA_TOKEN",
  EMAIL_TOKEN_VERIFICATION_FAILED: "EMAIL_TOKEN_VERIFICATION_FAILED",
  PHONE_VERIFICATION_PAGE_LOADED: "PHONE_VERIFICATION_PAGE_LOADED",
  PHONE_OTP_SEND_REQUESTED: "PHONE_OTP_SEND_REQUESTED",
  PHONE_OTP_SEND_SUCCESS: "PHONE_OTP_SEND_SUCCESS",
  PHONE_OTP_SEND_FAILED: "PHONE_OTP_SEND_FAILED",
  PHONE_OTP_SEND_LOCKED: "PHONE_OTP_SEND_LOCKED",
  PHONE_OTP_VERIFY_REQUESTED: "PHONE_OTP_VERIFY_REQUESTED",
  PHONE_OTP_VERIFY_SUCCESS: "PHONE_OTP_VERIFY_SUCCESS",
  PHONE_OTP_VERIFY_FAILED: "PHONE_OTP_VERIFY_FAILED",
  PHONE_OTP_VERIFY_LOCKED: "PHONE_OTP_VERIFY_LOCKED",
  PHONE_VERIFICATION_SKIPPED: "PHONE_VERIFICATION_SKIPPED",
} as const;

export const logVerificationEvent = (
  action: string,
  status: AuditEntry["status"],
  metadata?: Record<string, unknown>
): void => {
  try {
    const log = getAuditLog();
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      status,
      metadata,
    };

    log.push(entry);

    // Keep only the last MAX_ENTRIES (FIFO)
    const trimmed = log.length > MAX_ENTRIES ? log.slice(-MAX_ENTRIES) : log;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail — audit logging should never break the app
  }
};

export const getAuditLog = (): AuditEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
};

export const clearAuditLog = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

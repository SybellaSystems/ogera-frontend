export interface UserManagementAuditEntry {
  timestamp: string;
  action: string;
  status: "success" | "failure";
  userId: string;
  userName: string;
  userEmail: string;
  performedBy: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "user_management_audit_log";
const MAX_ENTRIES = 100;

export const USER_ACTIONS = {
  USER_APPROVED: "USER_APPROVED",
  USER_REJECTED: "USER_REJECTED",
  USER_DELETED: "USER_DELETED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_REINSTATED: "USER_REINSTATED",
  USER_BANNED: "USER_BANNED",
  USER_SUSPENSION_EXTENDED: "USER_SUSPENSION_EXTENDED",
  USER_ESCALATED: "USER_ESCALATED",
  BULK_APPROVE: "BULK_APPROVE",
  BULK_REJECT: "BULK_REJECT",
  BULK_REINSTATE: "BULK_REINSTATE",
} as const;

export const logUserManagementEvent = (
  action: string,
  status: UserManagementAuditEntry["status"],
  user: { userId: string; userName: string; userEmail: string },
  performedBy: string,
  reason?: string,
  metadata?: Record<string, unknown>
): void => {
  try {
    const log = getUserManagementAuditLog();
    const entry: UserManagementAuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      status,
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      performedBy,
      reason,
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

export const getUserManagementAuditLog = (): UserManagementAuditEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserManagementAuditEntry[];
  } catch {
    return [];
  }
};

export const clearUserManagementAuditLog = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

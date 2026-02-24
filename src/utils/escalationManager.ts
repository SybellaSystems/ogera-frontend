export interface EscalatedUser {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  reason: string;
  priority: "low" | "medium" | "high" | "critical";
  escalatedBy: string;
  createdAt: string;
  status: "open" | "resolved" | "dismissed";
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export type EscalationPriority = EscalatedUser["priority"];
export type EscalationStatus = EscalatedUser["status"];

const STORAGE_KEY = "escalation_log";
const MAX_ENTRIES = 100;

const generateId = (): string =>
  `esc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const loadEscalations = (): EscalatedUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EscalatedUser[];
  } catch {
    return [];
  }
};

const saveEscalations = (data: EscalatedUser[]): void => {
  try {
    const trimmed = data.length > MAX_ENTRIES ? data.slice(-MAX_ENTRIES) : data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail
  }
};

export const escalateUser = (data: Omit<EscalatedUser, "id" | "createdAt" | "status">): EscalatedUser => {
  const escalations = loadEscalations();
  const entry: EscalatedUser = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: "open",
  };
  escalations.push(entry);
  saveEscalations(escalations);
  return entry;
};

export const getEscalations = (filter?: {
  status?: EscalationStatus;
  priority?: EscalationPriority;
}): EscalatedUser[] => {
  let escalations = loadEscalations();
  if (filter?.status) {
    escalations = escalations.filter((e) => e.status === filter.status);
  }
  if (filter?.priority) {
    escalations = escalations.filter((e) => e.priority === filter.priority);
  }
  // Return newest first
  return escalations.reverse();
};

export const resolveEscalation = (
  id: string,
  resolution: string,
  resolvedBy: string
): boolean => {
  const escalations = loadEscalations();
  const index = escalations.findIndex((e) => e.id === id);
  if (index === -1) return false;
  escalations[index] = {
    ...escalations[index],
    status: "resolved",
    resolvedAt: new Date().toISOString(),
    resolvedBy,
    resolution,
  };
  saveEscalations(escalations);
  return true;
};

export const dismissEscalation = (id: string, resolvedBy: string): boolean => {
  const escalations = loadEscalations();
  const index = escalations.findIndex((e) => e.id === id);
  if (index === -1) return false;
  escalations[index] = {
    ...escalations[index],
    status: "dismissed",
    resolvedAt: new Date().toISOString(),
    resolvedBy,
  };
  saveEscalations(escalations);
  return true;
};

export const getEscalationCount = (status: EscalationStatus = "open"): number => {
  return loadEscalations().filter((e) => e.status === status).length;
};

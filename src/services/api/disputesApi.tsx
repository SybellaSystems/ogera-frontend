import api from './axiosInstance';

export type Dispute = {
  dispute_id: string;
  job_id: string;
  job_application_id?: string;
  student_id: string;
  employer_id: string;
  type: 'Payment' | 'Contract Violation' | 'Quality Issue' | 'Timeline';
  status: 'Open' | 'Under Review' | 'Mediation' | 'Resolved' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  reported_by: 'student' | 'employer';
  moderator_id?: string | null;
  escalated_to?: string | null;
  resolution?: 'Refunded' | 'Settled' | 'Dismissed' | 'Escalated' | null;
  resolution_notes?: string;
  escrow_amount?: number;
  refund_amount?: number;
  fee_penalty?: number;
  auto_escalated_at?: string | null;
  last_response_at?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  student?: { user_id: string; full_name: string; email: string };
  employer?: { user_id: string; full_name: string; email: string };
  moderator?: { user_id: string; full_name: string; email: string; role?: { roleName: string; roleType: string } };
  job?: { job_id: string; job_title: string; budget?: number };
};

export type DisputeEvidence = {
  evidence_id: string;
  dispute_id: string;
  uploaded_by: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  description?: string;
  created_at: string;
  uploader?: { user_id: string; full_name: string };
};

export type DisputeMessage = {
  message_id: string;
  dispute_id: string;
  sender_id: string;
  sender_type: 'student' | 'employer' | 'moderator';
  message: string;
  is_internal?: boolean;
  created_at: string;
  sender?: { user_id: string; full_name: string; email: string };
};

export type DisputeTimeline = {
  timeline_id: string;
  dispute_id: string;
  action: string;
  performed_by: string;
  performed_by_type: 'student' | 'employer' | 'moderator' | 'system';
  details?: string;
  created_at: string;
  performer?: { user_id: string; full_name: string; email?: string; role?: { roleName: string; roleType: string } };
};

export type CreateDisputeRequest = {
  job_id: string;
  job_application_id?: string;
  type: 'Payment' | 'Contract Violation' | 'Quality Issue' | 'Timeline';
  title: string;
  description: string;
  evidence_files?: File[];
  priority?: 'High' | 'Medium' | 'Low';
};

export type DisputeStats = {
  open: number;
  underReview: number;
  resolved: number;
  highPriority: number;
};

export type DisputeResponse = {
  success: boolean;
  data: Dispute | Dispute[] | { data: Dispute[]; pagination: any } | DisputeStats;
  message: string;
};

// Get all disputes
export const getAllDisputes = async (filters?: {
  status?: string | string[];
  priority?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Dispute[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach(s => params.append('status', s));
    } else {
      params.append('status', filters.status);
    }
  }
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await api.get<DisputeResponse>(`/disputes?${params.toString()}`);
  return response.data.data as { data: Dispute[]; pagination: any };
};

// Get dispute by ID
export const getDisputeById = async (id: string): Promise<{
  dispute: Dispute;
  evidence: DisputeEvidence[];
  messages: DisputeMessage[];
  timeline: DisputeTimeline[];
}> => {
  const response = await api.get<DisputeResponse>(`/disputes/${id}`);
  return response.data.data as any;
};

// Create dispute
export const createDispute = async (data: CreateDisputeRequest): Promise<Dispute> => {
  const formData = new FormData();
  formData.append('job_id', data.job_id);
  if (data.job_application_id) formData.append('job_application_id', data.job_application_id);
  formData.append('type', data.type);
  formData.append('title', data.title);
  formData.append('description', data.description);
  if (data.priority) formData.append('priority', data.priority);

  if (data.evidence_files) {
    data.evidence_files.forEach((file) => {
      formData.append('evidence_files', file);
    });
  }

  const response = await api.post<DisputeResponse>('/disputes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data as Dispute;
};

// Update dispute
export const updateDispute = async (
  id: string,
  data: {
    status?: string;
    priority?: string;
    moderator_id?: string;
    resolution?: string;
    resolution_notes?: string;
    refund_amount?: number;
  }
): Promise<Dispute> => {
  const response = await api.put<DisputeResponse>(`/disputes/${id}`, data);
  return response.data.data as Dispute;
};

// Resolve dispute
export const resolveDispute = async (
  id: string,
  resolution: 'Refunded' | 'Settled' | 'Dismissed' | 'Escalated',
  resolution_notes: string,
  refund_amount?: number
): Promise<Dispute> => {
  const response = await api.post<DisputeResponse>(`/disputes/${id}/resolve`, {
    resolution,
    resolution_notes,
    refund_amount,
  });
  return response.data.data as Dispute;
};

// Add message to dispute
export const addDisputeMessage = async (
  id: string,
  message: string,
  is_internal?: boolean
): Promise<DisputeMessage> => {
  const response = await api.post<DisputeResponse>(`/disputes/${id}/messages`, {
    message,
    is_internal,
  });
  return response.data.data as DisputeMessage;
};

// Upload evidence
export const uploadEvidence = async (
  id: string,
  file: File,
  description?: string
): Promise<DisputeEvidence> => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);

  const response = await api.post<DisputeResponse>(`/disputes/${id}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data as DisputeEvidence;
};

// Get dispute statistics
export const getDisputeStats = async (): Promise<DisputeStats> => {
  const response = await api.get<DisputeResponse>('/disputes/stats');
  return response.data.data as DisputeStats;
};

// Get user disputes
export const getUserDisputes = async (): Promise<Dispute[]> => {
  const response = await api.get<DisputeResponse>('/disputes/my-disputes');
  // Backend returns array directly in data.data
  return (response.data.data as Dispute[]) || [];
};
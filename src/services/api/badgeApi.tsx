import { apiSlice } from "./apiSlice";

export type BadgeType = "FREE" | "PREMIUM" | "PIONEER";

export interface BadgeConfig {
  applyLimit: number;
  canSeeLatestJobs: boolean;
  jobDelayDays?: number;
  priorityAccess?: boolean;
}

export interface BadgeStatus {
  badge: BadgeType;
  storedBadge: BadgeType;
  pioneerEligible: boolean;
  badgeExpiryDate: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  subscriptionDaysLeft: number | null;
  isPremiumActive: boolean;
  applicationsUsed: number;
  applicationsRemaining: number;
  config: BadgeConfig;
}

export interface BadgePurchase {
  id: string;
  user_id: string;
  from_badge: string;
  to_badge: string;
  amount: number;
  currency: string;
  usd_amount?: number | null;
  exchange_rate?: number | null;
  momo_reference_id?: string | null;
  payment_status: "PENDING" | "SUCCESSFUL" | "FAILED";
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  created_at: string;
  user?: {
    user_id: string;
    full_name: string;
    email: string;
    mobile_number?: string;
    badge?: BadgeType;
  };
}

export interface BadgeStats {
  totalStudents: number;
  freeBadgeStudents: number;
  premiumStudents: number;
  pioneerStudents: number;
}

export interface SubscribePremiumRequest {
  currency: string;
  payerPhone: string;
}

export interface SubscribePremiumResponse {
  success: boolean;
  data?: {
    referenceId: string;
    purchaseId: string;
    amount: number;
    currency: string;
    durationDays: number;
    price: number;
  };
  message?: string;
}

export const badgeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBadgeStatus: builder.query<{ success: boolean; data: BadgeStatus }, void>({
      query: () => ({ url: "/badge/status", method: "GET" }),
      providesTags: ["Badge"],
    }),
    subscribePremium: builder.mutation<SubscribePremiumResponse, SubscribePremiumRequest>({
      query: (body) => ({
        url: "/badge/subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Badge"],
    }),
    getSubscriptionPaymentStatus: builder.query<
      { success: boolean; data: { status: string; badge: BadgeStatus | null } },
      string
    >({
      query: (referenceId) => ({
        url: `/badge/subscribe/status/${referenceId}`,
        method: "GET",
      }),
    }),
    getBadgePurchaseHistory: builder.query<{ success: boolean; data: BadgePurchase[] }, void>({
      query: () => ({ url: "/badge/history", method: "GET" }),
      providesTags: ["Badge"],
    }),
    getAdminBadgePurchases: builder.query<
      { success: boolean; data: BadgePurchase[]; pagination: { total: number; page: number; limit: number; totalPages: number } },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/badge/admin/purchases?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Badge"],
    }),
    getAdminBadgeStats: builder.query<{ success: boolean; data: BadgeStats }, void>({
      query: () => ({ url: "/badge/admin/stats", method: "GET" }),
      providesTags: ["Badge"],
    }),
  }),
});

export const {
  useGetBadgeStatusQuery,
  useSubscribePremiumMutation,
  useLazyGetSubscriptionPaymentStatusQuery,
  useGetBadgePurchaseHistoryQuery,
  useGetAdminBadgePurchasesQuery,
  useGetAdminBadgeStatsQuery,
} = badgeApi;

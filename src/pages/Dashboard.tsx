import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ProfileMilestones, ProfileCompletionWizard } from "../components/ProfileCompletion";
import { useProfileCompletion } from "../components/ProfileCompletion/useProfileCompletion";
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardMetrics {
  totalUsers: number;
  totalStudents: number;
  activeJobs: number;
  totalEarnings: number;
}

interface ApiErrorPayload {
  message?: string;
}

interface EmployerNotificationItem {
  notification_id: string;
  type?: string;
  title?: string;
  message?: string;
  created_at?: string;
  application?: {
    status?: string;
    job?: {
      job_title?: string;
    };
  };
}

interface StudentNotificationItem {
  notification_id: string;
  type?: string;
  title?: string;
  message?: string;
  created_at?: string;
  application?: {
    status?: string;
    job?: {
      job_title?: string;
    };
  };
}

interface EmployerDashboardResponse {
  jobsPosted: { value: number; change: number | null };
  applicationsReceived: { value: number; change: number | null };
  activeHires: { value: number; change: number | null };
  totalSpent: { value: number; change: number | null; currency: string | null };
}

type ChartRow = {
  day: string;
  [key: string]: string | number;
};

type StatItem = {
  title: string;
  value: string;
  change?: string;
  trending: "up" | "down";
  icon: React.ReactNode;
  color: string;
  bg: string;
  changeBg: string;
};

const Dashboard: React.FC = () => {
  const ACTIVITY_LIMIT = 5;
  const { t } = useTranslation();
  const user = useSelector((state: any) => state.auth.user);
  const roleRaw = useSelector((state: any) => state.auth.role);
  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : undefined;
  const isAdminDashboardRole = role === "superadmin" || Boolean(role?.includes("admin"));
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const showProfileCompletion = role === "student" || role === "employer";
  const { profileCompletion, userId: profileUserId } = useProfileCompletion();
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("dashboard.goodMorning")
      : hour < 17
      ? t("dashboard.goodAfternoon")
      : t("dashboard.goodEvening");

  // State for dashboard metrics
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  // Student-specific metrics fetched from backend
  const [studentMetrics, setStudentMetrics] = useState<any | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  // Employer-specific metrics fetched from backend
  const [employerMetrics, setEmployerMetrics] = useState<EmployerDashboardResponse | null>(null);
  const [employerLoading, setEmployerLoading] = useState(false);
  const [employerError, setEmployerError] = useState<string | null>(null);
  // Student recent activity from notifications
  const [studentActivities, setStudentActivities] = useState<StudentNotificationItem[]>([]);
  const [studentActivitiesLoading, setStudentActivitiesLoading] = useState(false);
  // Employer recent activity from notifications
  const [employerActivities, setEmployerActivities] = useState<EmployerNotificationItem[]>([]);
  const [employerActivitiesLoading, setEmployerActivitiesLoading] = useState(false);
  // Superadmin recent activity from notifications
  const [adminActivities, setAdminActivities] = useState<EmployerNotificationItem[]>([]);
  const [adminActivitiesLoading, setAdminActivitiesLoading] = useState(false);

  const parseApiErrorMessage = (status: number, payload?: ApiErrorPayload) => {
    const backendMessage = payload?.message?.trim();
    if (backendMessage) return `${status}: ${backendMessage}`;
    return `HTTP ${status}`;
  };

  // Fetch dashboard metrics for all admin-type roles
  useEffect(() => {
    if (isAdminDashboardRole) {
      setMetricsLoading(true);
      setMetricsError(null);
      console.log("[Dashboard] Fetching metrics for admin-type role...");
      fetch("/api/dashboard/metrics", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then(async (res) => {
          console.log("[Dashboard] Response status:", res.status);
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(parseApiErrorMessage(res.status, data));
          }
          return data;
        })
        .then((data) => {
          console.log("[Dashboard] Response data:", data);
          if (data && data.success && data.data) {
            // Ensure the backend returned numeric values; do not coerce here.
            const d = data.data as DashboardMetrics;
            setMetrics(d);
          } else {
            console.warn("[Dashboard] Invalid response format:", data);
            setMetrics(null);
            setMetricsError("Invalid response format from server");
          }
        })
        .catch((error) => {
          console.error("[Dashboard] Failed to fetch dashboard metrics:", error);
          setMetrics(null);
          setMetricsError(error?.message || String(error));
        })
        .finally(() => {
          setMetricsLoading(false);
        });
    }
  }, [isAdminDashboardRole, accessToken]);

  // Fetch student-specific dashboard metrics
  useEffect(() => {
    if (role === 'student') {
      setStudentLoading(true);
      setStudentError(null);
      fetch('/api/dashboard/student', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.data) {
            setStudentMetrics(data.data);
          } else {
            setStudentMetrics(null);
            setStudentError('Invalid response from server');
          }
        })
        .catch((err) => {
          console.error('[Dashboard] Failed to fetch student metrics:', err);
          setStudentMetrics(null);
          setStudentError(String(err));
        })
        .finally(() => setStudentLoading(false));
    }
  }, [role, accessToken]);

  // Fetch employer-specific dashboard metrics
  useEffect(() => {
    if (role === "employer") {
      setEmployerLoading(true);
      setEmployerError(null);
      fetch("/api/dashboard/employer", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.data) {
            setEmployerMetrics(data.data);
          } else {
            setEmployerMetrics(null);
            setEmployerError("Invalid response from server");
          }
        })
        .catch((error) => {
          console.error("[Dashboard] Failed to fetch employer metrics:", error);
          setEmployerMetrics(null);
          setEmployerError(String(error));
        })
        .finally(() => setEmployerLoading(false));
    }
  }, [role, accessToken]);

  // Fetch top 5 recent notifications for student activity feed
  useEffect(() => {
    if (role === "student") {
      setStudentActivitiesLoading(true);
      fetch(`/api/notifications?limit=${ACTIVITY_LIMIT}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.data)) {
            setStudentActivities(data.data);
          } else {
            setStudentActivities([]);
          }
        })
        .catch((error) => {
          console.error("[Dashboard] Failed to fetch student notifications:", error);
          setStudentActivities([]);
        })
        .finally(() => setStudentActivitiesLoading(false));
    }
  }, [role, accessToken, ACTIVITY_LIMIT]);

  // Fetch top 5 recent notifications for employer activity feed
  useEffect(() => {
    if (role === "employer") {
      setEmployerActivitiesLoading(true);
      fetch(`/api/notifications?limit=${ACTIVITY_LIMIT}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.data)) {
            setEmployerActivities(data.data);
          } else {
            setEmployerActivities([]);
          }
        })
        .catch((error) => {
          console.error("[Dashboard] Failed to fetch employer notifications:", error);
          setEmployerActivities([]);
        })
        .finally(() => setEmployerActivitiesLoading(false));
    }
  }, [role, accessToken, ACTIVITY_LIMIT]);

  // Fetch top 5 recent notifications for all admin-type roles activity feed
  useEffect(() => {
    if (isAdminDashboardRole) {
      setAdminActivitiesLoading(true);
      fetch(`/api/notifications?limit=${ACTIVITY_LIMIT}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.data)) {
            setAdminActivities(data.data);
          } else {
            setAdminActivities([]);
          }
        })
        .catch((error) => {
          console.error("[Dashboard] Failed to fetch admin-type notifications:", error);
          setAdminActivities([]);
        })
        .finally(() => setAdminActivitiesLoading(false));
    }
  }, [isAdminDashboardRole, accessToken, ACTIVITY_LIMIT]);

  const getStats = (): StatItem[] => {
    const formatNumber = (v: unknown) => {
      if (v === null || v === undefined) return t("common.na");
      if (typeof v === "number") return v.toLocaleString();
      if (!Number.isNaN(Number(v))) return String(v);
      return String(v);
    };
    const formatChange = (value: number | null | undefined) => {
      if (value === null || value === undefined) return undefined;
      if (value > 0) return `+${value}`;
      return String(value);
    };

    if (role === "student") {
      // Use backend-provided student metrics when available
      const appsValue = studentMetrics?.applications?.value ?? null;
      const appsChange = studentMetrics?.applications?.change ?? null;
      const earningsValue = studentMetrics?.earnings?.value ?? null;
      const earningsCurrency = studentMetrics?.earnings?.currency ?? null;
      const jobsCompletedValue = studentMetrics?.jobsCompleted?.value ?? null;
      const interviewsValue = studentMetrics?.interviews?.value ?? null;

      const formatNumber = (v: any) => {
        if (v === null || v === undefined) return t("common.na");
        if (typeof v === 'number') return v.toLocaleString();
        return String(v);
      };

      return [
        {
          title: t("dashboard.applicationsSent"),
          value: studentLoading ? "..." : (appsValue !== null ? formatNumber(appsValue) : (studentError ? t("dashboard.error") : (studentMetrics?.applications?.note || t("common.na")))),
          change: appsChange !== null && appsChange !== undefined ? (appsChange >= 0 ? `+${appsChange}` : String(appsChange)) : undefined,
          trending: appsChange !== null && appsChange !== undefined ? (appsChange >= 0 ? 'up' as const : 'down' as const) : 'up' as const,
          icon: <BriefcaseIcon className="h-4 w-4" />,
          color: 'text-[#7f56d9]',
          bg: 'bg-[#f5f3ff]',
          changeBg: 'bg-green-50 text-green-700',
        },
        {
          title: t("dashboard.jobsCompleted"),
          value: studentLoading ? "..." : (jobsCompletedValue !== null && jobsCompletedValue !== undefined ? String(jobsCompletedValue) : (studentMetrics?.jobsCompleted?.note || t("common.na"))),
          change: undefined,
          trending: 'up' as const,
          icon: <AcademicCapIcon className="h-4 w-4" />,
          color: 'text-[#7f56d9]',
          bg: 'bg-[#f5f3ff]',
          changeBg: 'bg-green-50 text-green-700',
        },
        {
          title: t("dashboard.interviews"),
          value: studentLoading ? "..." : (interviewsValue !== null && interviewsValue !== undefined ? String(interviewsValue) : (studentMetrics?.interviews?.note || t("common.na"))),
          change: interviewsValue !== null && interviewsValue !== undefined && studentMetrics?.interviews?.growthPercentage !== null && studentMetrics?.interviews?.growthPercentage !== undefined
            ? (studentMetrics.interviews.growthPercentage >= 0
                ? `+${studentMetrics.interviews.growthPercentage}%`
                : `${studentMetrics.interviews.growthPercentage}%`)
            : undefined,
          trending:
            studentMetrics?.interviews?.growthPercentage !== null &&
            studentMetrics?.interviews?.growthPercentage !== undefined &&
            studentMetrics.interviews.growthPercentage < 0
              ? 'down' as const
              : 'up' as const,
          icon: <UserGroupIcon className="h-4 w-4" />,
          color: 'text-[#7f56d9]',
          bg: 'bg-[#f5f3ff]',
          changeBg: 'bg-green-50 text-green-700',
        },
        {
          title: t("dashboard.earnings"),
          value: studentLoading ? "..." : (earningsValue !== null ? `${earningsCurrency ?? "$"}${formatNumber(earningsValue)}` : (studentError ? t("dashboard.error") : t("common.na"))),
          change: undefined,
          trending: 'up' as const,
          icon: <ChartBarIcon className="h-4 w-4" />,
          color: 'text-[#7F56D9]',
          bg: 'bg-[#f5f3ff]',
          changeBg: 'bg-green-50 text-green-700',
        },
      ];
    }
    if (role === "employer") {
      const jobsPostedValue = employerMetrics?.jobsPosted?.value ?? null;
      const jobsPostedChange = employerMetrics?.jobsPosted?.change ?? null;
      const applicationsReceivedValue = employerMetrics?.applicationsReceived?.value ?? null;
      const applicationsReceivedChange = employerMetrics?.applicationsReceived?.change ?? null;
      const activeHiresValue = employerMetrics?.activeHires?.value ?? null;
      const activeHiresChange = employerMetrics?.activeHires?.change ?? null;
      const totalSpentValue = employerMetrics?.totalSpent?.value ?? null;
      const totalSpentChange = employerMetrics?.totalSpent?.change ?? null;
      const totalSpentCurrency = employerMetrics?.totalSpent?.currency ?? "$";

      return [
        {
          title: t("dashboard.jobsPosted"),
          value: employerLoading ? "..." : (jobsPostedValue !== null ? formatNumber(jobsPostedValue) : (employerError ? t("dashboard.error") : t("common.na"))),
          change: formatChange(jobsPostedChange),
          trending: (jobsPostedChange ?? 0) >= 0 ? "up" as const : "down" as const,
          icon: <BriefcaseIcon className="h-4 w-4" />,
          color: "text-[#7f56d9]",
          bg: "bg-[#f5f3ff]",
          changeBg: (jobsPostedChange ?? 0) >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
        },
        {
          title: t("dashboard.applicationsReceived"),
          value: employerLoading ? "..." : (applicationsReceivedValue !== null ? formatNumber(applicationsReceivedValue) : (employerError ? t("dashboard.error") : t("common.na"))),
          change: formatChange(applicationsReceivedChange),
          trending: (applicationsReceivedChange ?? 0) >= 0 ? "up" as const : "down" as const,
          icon: <UserGroupIcon className="h-4 w-4" />,
          color: "text-[#7f56d9]",
          bg: "bg-[#f5f3ff]",
          changeBg: (applicationsReceivedChange ?? 0) >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
        },
        {
          title: t("dashboard.activeHires"),
          value: employerLoading ? "..." : (activeHiresValue !== null ? formatNumber(activeHiresValue) : (employerError ? t("dashboard.error") : t("common.na"))),
          change: formatChange(activeHiresChange),
          trending: (activeHiresChange ?? 0) >= 0 ? "up" as const : "down" as const,
          icon: <AcademicCapIcon className="h-4 w-4" />,
          color: "text-[#7f56d9]",
          bg: "bg-[#f5f3ff]",
          changeBg: (activeHiresChange ?? 0) >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
        },
        {
          title: t("dashboard.totalSpent"),
          value: employerLoading ? "..." : (totalSpentValue !== null ? `${totalSpentCurrency}${formatNumber(totalSpentValue)}` : (employerError ? t("dashboard.error") : t("common.na"))),
          change: formatChange(totalSpentChange),
          trending: (totalSpentChange ?? 0) >= 0 ? "up" as const : "down" as const,
          icon: <ChartBarIcon className="h-4 w-4" />,
          color: "text-[#7F56D9]",
          bg: "bg-[#f5f3ff]",
          changeBg: (totalSpentChange ?? 0) >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
        },
      ];
    }
    // superadmin / default
    return [
      {
        title: t("dashboard.totalUsers"),
        value: metricsLoading ? "..." : (metrics ? formatNumber(metrics.totalUsers) : (metricsError ? `ERR (${metricsError})` : t("common.na"))),
        change: undefined,
        trending: "up" as const,
        icon: <UserGroupIcon className="h-4 w-4" />,
        color: "text-[#7f56d9]",
        bg: "bg-[#f5f3ff]",
        changeBg: "bg-green-50 text-green-700",
      },
      {
        title: t("dashboard.totalStudents"),
        value: metricsLoading ? "..." : (metrics ? formatNumber(metrics.totalStudents) : (metricsError ? `ERR (${metricsError})` : t("common.na"))),
        change: undefined,
        trending: "up" as const,
        icon: <AcademicCapIcon className="h-4 w-4" />,
        color: "text-[#7f56d9]",
        bg: "bg-[#f5f3ff]",
        changeBg: "bg-green-50 text-green-700",
      },
      {
        title: t("dashboard.activeJobs"),
        value: metricsLoading ? "..." : (metrics ? formatNumber(metrics.activeJobs) : (metricsError ? `ERR (${metricsError})` : t("common.na"))),
        change: undefined,
        trending: "up" as const,
        icon: <BriefcaseIcon className="h-4 w-4" />,
        color: "text-[#7f56d9]",
        bg: "bg-[#f5f3ff]",
        changeBg: "bg-red-50 text-red-600",
      },
      {
        title: t("dashboard.totalEarnings"),
        value: metricsLoading ? "..." : (metrics ? (`$${formatNumber(metrics.totalEarnings)}`) : (metricsError ? `ERR (${metricsError})` : t("common.na"))),
        change: undefined,
        trending: "up" as const,
        icon: <ChartBarIcon className="h-4 w-4" />,
        color: "text-[#7F56D9]",
        bg: "bg-[#f5f3ff]",
        changeBg: "bg-green-50 text-green-700",
      },
    ];
  };

  const getQuickStats = () => {
    if (role === "student") {
      return [
        { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.applicationsShortlisted") },
        { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.jobsInProgress") },
        { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.interviewScheduled") },
        { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.newJobMatches") },
      ];
    }
    if (role === "employer") {
      return [
        { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.newApplicantsThisWeek") },
        { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.positionsFilledThisMonth") },
        { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.interviewsPending") },
        { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.contractsExpiringSoon") },
      ];
    }
    return [
      { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.newStudentsThisWeek") },
      { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.jobsPostedThisWeek") },
      { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.academicVerificationsPending") },
      { color: "text-[#7f56d9]", hoverBg: "hover:bg-[#f5f3ff]", text: t("dashboard.disputesResolved") },
    ];
  };

  const getRecentActivity = () => {
    const toActivityMessage = (item: {
      type?: string;
      message?: string;
      title?: string;
      application?: { status?: string; job?: { job_title?: string } };
    }) => {
      const message = item.message?.trim();
      if (message) return message;

      const jobTitle = item.application?.job?.job_title?.trim();
      const status = item.application?.status?.trim().toLowerCase();
      if (jobTitle && status && item.type === "application_status") {
        return `Your application for "${jobTitle}" has been ${status}`;
      }

      return item.title?.trim() || t("common.na");
    };

    const mapTopFiveMessages = (items: Array<{ type?: string; message?: string; title?: string; created_at?: string; application?: { status?: string; job?: { job_title?: string } } }>) =>
      [...items]
        .sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, ACTIVITY_LIMIT)
        .map((item) => toActivityMessage(item));

    if (role === "student") {
      if (studentActivitiesLoading) return ["..."];
      if (studentActivities.length > 0) {
        return mapTopFiveMessages(studentActivities);
      }
      return [t("common.noData")];
    }
    if (role === "employer") {
      if (employerActivitiesLoading) return ["..."];
      if (employerActivities.length > 0) {
        return mapTopFiveMessages(employerActivities);
      }
      return [t("common.noData")];
    }
    if (adminActivitiesLoading) return ["..."];
    if (adminActivities.length > 0) {
      return mapTopFiveMessages(adminActivities);
    }
    return [t("common.noData")];
  };

  const getSubtitle = () => {
    if (role === "student") return t("dashboard.subtitleStudent");
    if (role === "employer") return t("dashboard.subtitleEmployer");
    return t("dashboard.subtitleAdmin");
  };

  const getChartData = () => {
    if (role === "student") {
      return {
        data: [
          { day: "Mon", applications: 2, completed: 1 },
          { day: "Tue", applications: 3, completed: 2 },
          { day: "Wed", applications: 1, completed: 1 },
          { day: "Thu", applications: 4, completed: 3 },
          { day: "Fri", applications: 5, completed: 2 },
          { day: "Sat", applications: 1, completed: 0 },
          { day: "Sun", applications: 0, completed: 0 },
        ],
        bars: [
          { key: "applications", name: t("dashboard.applications"), fill: "#7F56D9" },
          { key: "completed", name: t("dashboard.jobsCompleted"), fill: "#E9D5FF" },
        ],
        title: t("dashboard.weeklyActivity"),
      };
    }
    if (role === "employer") {
      return {
        data: [
          { day: "Mon", applications: 15, hires: 2 },
          { day: "Tue", applications: 22, hires: 3 },
          { day: "Wed", applications: 18, hires: 1 },
          { day: "Thu", applications: 30, hires: 4 },
          { day: "Fri", applications: 35, hires: 5 },
          { day: "Sat", applications: 8, hires: 1 },
          { day: "Sun", applications: 5, hires: 0 },
        ],
        bars: [
          { key: "applications", name: t("dashboard.applications"), fill: "#7F56D9" },
          { key: "hires", name: t("dashboard.hires"), fill: "#E9D5FF" },
        ],
        title: t("dashboard.weeklyHiringActivity"),
      };
    }
    return {
      data: [
        { day: "Mon", students: 120, employers: 45 },
        { day: "Tue", students: 190, employers: 60 },
        { day: "Wed", students: 150, employers: 38 },
        { day: "Thu", students: 230, employers: 72 },
        { day: "Fri", students: 280, employers: 90 },
        { day: "Sat", students: 95, employers: 25 },
        { day: "Sun", students: 65, employers: 18 },
      ],
      bars: [
        { key: "students", name: t("dashboard.students"), fill: "#7F56D9" },
        { key: "employers", name: t("dashboard.employers"), fill: "#E9D5FF" },
      ],
      title: t("dashboard.weeklyUserGrowth"),
    };
  };

  const stats = getStats();
  const quickStats = getQuickStats();
  const recentActivity = getRecentActivity();
  const subtitle = getSubtitle();
  const chartConfig = getChartData();

  return (
    <div className="space-y-3 animate-fadeIn max-w-full overflow-x-hidden">
      {/* Welcome Section */}
      <div className="bg-[#7f56d9] rounded-lg p-3 text-white shadow-sm">
        <h1 className="text-sm md:text-base font-bold">
          {greeting}, {user?.full_name || t("dashboard.user")}
        </h1>
        <p className="text-[11px] text-white/70 mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Profile Completion */}
      {showProfileCompletion && (
        <ProfileMilestones profileCompletion={profileCompletion} userId={profileUserId} onStartWizard={() => setIsWizardOpen(true)} />
      )}
      {showProfileCompletion && (
        <ProfileCompletionWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={() => setIsWizardOpen(false)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className={`p-1.5 rounded ${item.bg}`}>
                <span className={item.color}>{item.icon}</span>
              </div>
              {item.change ? (
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded-full animate-trend ${item.changeBg}`}>
                  {item.trending === "up" ? (
                    <ArrowTrendingUpIcon className="h-2.5 w-2.5" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-2.5 w-2.5" />
                  )}
                  {item.change}
                </span>
              ) : null}
            </div>
            <p className="text-base font-bold text-gray-900">{item.value}</p>
            <p className="text-[11px] text-gray-500">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Graph + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Graph Section */}
        <div className="bg-white rounded-lg p-3 shadow-sm lg:col-span-2 border border-gray-100">
          <h2 className="text-xs font-semibold mb-2 text-gray-800">{chartConfig.title}</h2>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartConfig.data as ChartRow[]} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  width={25}
                />
                <Tooltip
                  cursor={{ fill: "rgba(127, 86, 217, 0.06)" }}
                  contentStyle={{
                    borderRadius: "6px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    padding: "6px 10px",
                    fontSize: "11px",
                  }}
                />
                {chartConfig.bars.map((bar) => (
                  <Bar
                    key={bar.key}
                    dataKey={bar.key}
                    name={bar.name}
                    fill={bar.fill}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <h2 className="text-xs font-semibold text-gray-800 mb-2">{t("dashboard.quickStats")}</h2>

          {/* Student Rating */}
          {role === "student" && (
            <div className="mb-2 p-2 rounded bg-[#f5f3ff] border border-[#e0d8f0]">
              <p className="text-[10px] text-gray-500 mb-0.5">{t("dashboard.yourRating")}</p>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-px">
                  {[1, 2, 3, 4, 5].map((star) => (
                    star <= 4 ? (
                      <StarIconSolid key={star} className="h-3.5 w-3.5 text-yellow-400" />
                    ) : (
                      <StarIcon key={star} className="h-3.5 w-3.5 text-gray-300" />
                    )
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-900">4.0</span>
                <span className="text-[9px] text-gray-400">({t("dashboard.reviews", { count: 12 })})</span>
              </div>
            </div>
          )}

          <ul className="space-y-1 text-gray-700 text-[11px]">
            {quickStats.map((stat, index) => (
              <li key={index} className={`flex items-center gap-1.5 p-1.5 rounded ${stat.hoverBg} transition-colors`}>
                <span className={`${stat.color} font-bold text-xs`}>•</span>
                <span>{stat.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <h2 className="text-xs font-semibold mb-2 text-gray-800">{t("dashboard.recentActivity")}</h2>
        <ul className="space-y-1">
          {recentActivity.map((activity, index) => (
            <li
              key={index}
              className="pb-1.5 border-b last:border-none text-[11px] text-gray-600 hover:text-[#7f56d9] transition-colors duration-200 flex items-center gap-1.5 group cursor-pointer"
            >
              <span className="w-1 h-1 rounded-full bg-[#7f56d9] group-hover:bg-[#5b3ba5] transition-colors shrink-0"></span>
              <span>{activity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Student KPIs */}
      {role === "student" && (
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <h2 className="text-xs font-semibold mb-2.5 text-gray-800">{t("dashboard.yourProgress")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Profile Completion */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">{t("dashboard.profileCompletion")}</span>
                <span className="text-[11px] font-bold text-[#7F56D9]">75%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7f56d9] rounded-full transition-all duration-500"
                  style={{ width: "75%" }}
                />
              </div>
              <p className="text-[9px] text-gray-400">{t("dashboard.addSkillsAndBio")}</p>
            </div>

            {/* Job Completion Rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">Job Completion</span>
                <span className="text-[11px] font-bold text-[#7f56d9]">85%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7f56d9] rounded-full transition-all duration-500"
                  style={{ width: "85%" }}
                />
              </div>
              <p className="text-[9px] text-gray-400">{t("dashboard.jobsCompletedOnTime")}</p>
            </div>

            {/* Application Success Rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">{t("dashboard.applicationSuccess")}</span>
                <span className="text-[11px] font-bold text-[#7f56d9]">42%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7f56d9] rounded-full transition-all duration-500"
                  style={{ width: "42%" }}
                />
              </div>
              <p className="text-[9px] text-gray-400">{t("dashboard.applicationsAccepted")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

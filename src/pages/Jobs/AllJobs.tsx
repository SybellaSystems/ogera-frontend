import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BookmarkIcon,
  PlusIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  UserGroupIcon,
  ChartBarIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkSolidIcon,
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/24/solid";
import {
  useGetAllJobsQuery,
  useToggleJobStatusMutation,
  useReviewJobMutation,
} from "../../services/api/jobsApi";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import ApplyJobModal from "../../components/ApplyJobModal";
import JobReaction from "../../components/Jobs/JobReaction";
import { formatRelativeTime } from "../../utils/timeUtils";
import { formatBudgetWithCurrency } from "../../constants/currencies";
import CardsPerRowSelector from "../../components/Jobs/CardsPerRowSelector";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  Active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Active",
  },
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Pending",
  },
  Inactive: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    label: "Inactive",
  },
  Completed: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    label: "Completed",
  },
};

const getStatusCfg = (s: string) =>
  STATUS_CONFIG[s] ?? {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    label: s,
  };

// ─── Funding badge ────────────────────────────────────────────────────────────
const FundingBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  const funded = status === "Funded" || status === "Paid";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
        funded
          ? "bg-violet-50/80 text-violet-700 border-violet-200/60"
          : "bg-orange-50/80 text-orange-700 border-orange-200/60"
      }`}
    >
      {funded ? (
        <CheckCircleSolid className="w-3 h-3" />
      ) : (
        <ExclamationCircleIcon className="w-3 h-3" />
      )}
      {funded ? "Funded" : "Unfunded"}
    </span>
  );
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
        <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 bg-slate-100 rounded-full" />
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
          <div className="h-6 w-14 bg-slate-100 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-24">
        <div className="h-8 bg-slate-100 rounded-lg" />
        <div className="h-8 bg-slate-100 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Stat tile ────────────────────────────────────────────────────────────────
const StatTile: React.FC<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = ({ label, value, icon: Icon, color, bg }) => (
  <div
    className={`${bg} rounded-2xl border border-slate-100/80 p-4 flex items-center gap-3 hover:shadow-md hover:border-slate-200 transition-all duration-200 group cursor-default`}
  >
    <div
      className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-800 leading-tight">
        {value}
      </p>
      <p className="text-xs text-slate-600 font-semibold mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Action button ────────────────────────────────────────────────────────────
const ActionBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  children: React.ReactNode;
  size?: "sm" | "xs";
}> = ({ onClick, disabled, variant = "secondary", children, size = "sm" }) => {
  const variants = {
    primary:
      "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200/50 border border-violet-500/20",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60",
    success:
      "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60",
    ghost: "hover:bg-slate-100 text-slate-600 border border-transparent",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold",
    xs: "px-2.5 py-1 text-[11px] font-semibold",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap`}
    >
      {children}
    </button>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const AllJobs: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const roleRaw = useSelector((state: any) => state.auth.role);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : "";
  const isRoleReady = Boolean(role);
  const isUnfundedRoute = location.pathname === "/dashboard/jobs/unfunded";

  const [cardsPerRow, setCardsPerRow] = useState<2 | 3>(2);
  const isThreeColumnLayout = cardsPerRow === 3;

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleJobStatusMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPaymentRange, setSelectedPaymentRange] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20);
  const [reviewJob, { isLoading: isReviewingJob }] = useReviewJobMutation();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const jobsQueryParams = {
    page: currentPage,
    limit: pageLimit,
    ...(role === "employer" && isUnfundedRoute ? { funded: false } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(selectedLocation ? { location: selectedLocation } : {}),
    ...(selectedStatus ? { status: selectedStatus as any } : {}),
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(selectedPaymentRange ? { payment_range: selectedPaymentRange } : {}),
  };
  const { data, isLoading, isFetching, error, refetch } = useGetAllJobsQuery(
    jobsQueryParams,
    {
      skip: !isRoleReady,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const { data: studentApplications, refetch: refetchApplications } =
    useGetStudentApplicationsQuery(undefined, {
      skip: role !== "student",
    });

  useEffect(() => {
    if (!isRoleReady) return;
    refetch();
  }, [isRoleReady, isUnfundedRoute, refetch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedLocation,
    selectedStatus,
    selectedCategory,
    selectedPaymentRange,
    isUnfundedRoute,
  ]);

  // Close dropdown on outside click - simplified
  useEffect(() => {
    if (!openMenuId) return; // Only listen if menu is open

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside all menu-related elements
      const isMenuClick =
        target.closest('[role="menu"]') ||
        target.closest("button[data-menu-trigger]");
      if (!isMenuClick) {
        setOpenMenuId(null);
      }
    };

    // Small delay to avoid immediately closing
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  const appliedJobIds = new Set(
    (studentApplications?.data || []).map((app: any) => app.job_id),
  );

  const jobs = data?.data || [];
  const isFundedJob = (fundingStatus?: string | null) =>
    fundingStatus === "Funded" || fundingStatus === "Paid";
  const filteredJobs = jobs.filter((job: any) => {
    // Backend now handles filtering; keep only route-level constraints.
    if (
      (role === "superadmin" || role === "admin") &&
      isUnfundedRoute &&
      isFundedJob(job.funding_status)
    ) {
      return false;
    }

    return true;
  });

  const locations = Array.from(
    new Set(jobs.map((j: any) => j.location).filter(Boolean)),
  );
  const statuses = ["Active", "Pending", "Inactive", "Completed"];
  const categories = Array.from(
    new Set(jobs.map((j: any) => j.category).filter(Boolean)),
  );

  const totalJobs = data?.pagination?.total ?? filteredJobs.length;
  const activeJobs = filteredJobs.filter(
    (j: any) => j.status === "Active",
  ).length;
  const pendingJobs =
    role === "student"
      ? (studentApplications?.data || []).filter(
          (a: any) => a.status === "Pending",
        ).length
      : filteredJobs.filter((j: any) => j.status === "Pending").length;
  const totalApplicants = filteredJobs.reduce(
    (sum: number, j: any) => sum + (j.applications || 0),
    0,
  );

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const handleApply = (job: any) => {
    if (job.status === "Completed") return;
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    refetch();
    if (role === "student") refetchApplications();
  };

  const handleToggleStatus = async (jobId: string, _currentStatus: string) => {
    try {
      await toggleStatus(jobId).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to toggle job status:", err);
    }
  };

  const handleAdminReview = async (
    jobId: string,
    status: "Active" | "Inactive",
  ) => {
    try {
      await reviewJob({ id: jobId, status }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to review unfunded job:", err);
    }
  };

  const hasActiveFilters =
    searchQuery ||
    selectedLocation ||
    selectedStatus ||
    selectedCategory ||
    selectedPaymentRange;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!isRoleReady || (isLoading && !data) || (isFetching && !data)) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <XCircleIcon className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          Failed to load jobs
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {t("pages.jobs.failedToLoad")}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition"
        >
          <ArrowPathIcon className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200/50">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {isUnfundedRoute ? "Unfunded Jobs" : t("pages.jobs.allJobs")}
            </h1>
            {isFetching && data && (
              <ArrowPathIcon className="w-5 h-5 text-violet-500 animate-spin ml-2" />
            )}
          </div>
          <p className="text-sm text-slate-600 font-medium ml-[52px]">
            {role === "employer"
              ? t("pages.jobs.managePostings")
              : role === "student"
                ? t("pages.jobs.browseAndApply")
                : t("pages.jobs.browseAndManage")}
          </p>
        </div>

        {(role === "employer" || role === "superadmin") && (
          <button
            onClick={() => navigate("/dashboard/jobs/create")}
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-violet-200/50 transition-all active:scale-95 whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Post a Job
          </button>
        )}
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label={t("pages.jobs.totalJobs")}
          value={totalJobs}
          icon={BriefcaseIcon}
          color="bg-violet-500"
          bg="bg-violet-50/60"
        />
        <StatTile
          label={t("pages.jobs.activeJobs")}
          value={activeJobs}
          icon={CheckCircleIcon}
          color="bg-emerald-500"
          bg="bg-emerald-50/60"
        />
        <StatTile
          label={t("pages.jobs.totalApplicants")}
          value={totalApplicants}
          icon={UserGroupIcon}
          color="bg-sky-500"
          bg="bg-sky-50/60"
        />
        <StatTile
          label={t("pages.jobs.pendingReview")}
          value={pendingJobs}
          icon={ChartBarIcon}
          color="bg-amber-500"
          bg="bg-amber-50/60"
        />
      </div>

      {/* ── Control bar ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Main row */}
        <div className="flex items-center gap-2.5 p-4">
          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t("pages.jobs.searchJobs")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
            />
          </div>

          {/* Status quick pills — desktop */}
          <div className="hidden md:flex items-center gap-1.5">
            {["", ...statuses].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                  selectedStatus === s
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-200/50"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/50"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 ${
              showFilters || hasActiveFilters
                ? "bg-violet-50 border-violet-300 text-violet-700"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-violet-600 ml-1" />
            )}
            <ChevronDownIcon
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Expanded filter row */}
        {showFilters && (
          <div className="px-4 py-3.5 bg-slate-50/80 flex flex-wrap gap-3">
            {/* Location */}
            <div className="relative">
              <MapPinIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-9 pl-8 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 appearance-none cursor-pointer"
              >
                <option value="">{t("pages.jobs.allLocations")}</option>
                {(locations as string[]).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 cursor-pointer"
            >
              <option value="">All Categories</option>
              {(categories as string[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Payment */}
            <select
              value={selectedPaymentRange}
              onChange={(e) => setSelectedPaymentRange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 cursor-pointer"
            >
              <option value="">All Budgets</option>
              <option value="under-500">Under 500</option>
              <option value="500-2000">500 – 2,000</option>
              <option value="2000-5000">2,000 – 5,000</option>
              <option value="5000-plus">Above 5,000</option>
            </select>

            {/* Mobile status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="md:hidden h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 cursor-pointer"
            >
              <option value="">{t("pages.jobs.allStatus")}</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLocation("");
                  setSelectedStatus("");
                  setSelectedCategory("");
                  setSelectedPaymentRange("");
                }}
                className="h-9 px-4 rounded-lg border border-red-200/60 bg-red-50 text-xs text-red-700 font-bold hover:bg-red-100 transition-colors duration-150"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-5">
            <BriefcaseIcon className="w-10 h-10 text-violet-300" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">
            {hasActiveFilters
              ? t("pages.jobs.noJobsMatching")
              : t("pages.jobs.noJobsAvailable")}
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            {hasActiveFilters
              ? t("pages.jobs.tryAdjusting")
              : t("pages.jobs.noPostingsCheckBack")}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLocation("");
                setSelectedStatus("");
                setSelectedCategory("");
                setSelectedPaymentRange("");
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
            >
              Clear filters
            </button>
          ) : role === "employer" || role === "superadmin" ? (
            <button
              onClick={() => navigate("/dashboard/jobs/create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-md shadow-violet-200 hover:bg-violet-700 transition active:scale-95"
            >
              <PlusIcon className="w-4 h-4" /> Post Your First Job
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Job cards ─────────────────────────────────────────────────────────── */}
          {/* ── Results Count + Cards Per Row ──────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4">
            {/* Results count */}
            <p className="text-xs text-slate-500 font-medium px-1">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {filteredJobs.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {data?.pagination?.total ?? filteredJobs.length}
              </span>{" "}
              job
              {(data?.pagination?.total ?? filteredJobs.length) !== 1
                ? "s"
                : ""}
              {hasActiveFilters && " · filtered"}
            </p>

            {/* Cards Per Row - Desktop Only */}
            <CardsPerRowSelector
              cardsPerRow={cardsPerRow}
              setCardsPerRow={setCardsPerRow}
            />
          </div>

          {/* ── Job Cards Grid ─────────────────────────────────────────────────── */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch ${
              cardsPerRow === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
            }`}
          >
            {filteredJobs.map((job: any) => {
              const employerName =
                job.employer?.full_name || t("pages.jobs.unknownEmployer");

              const companyInitial = employerName.charAt(0).toUpperCase();

              const isSaved = savedJobs.has(job.job_id);
              const isCompletedJob = job.status === "Completed";
              const hasAlreadyApplied = appliedJobIds.has(job.job_id);
              const isApplyDisabled = hasAlreadyApplied || isCompletedJob;

              const statusCfg = getStatusCfg(job.status);

              // Gradient avatar color
              const avatarGradients = [
                "from-violet-500 to-violet-700",
                "from-sky-500 to-sky-700",
                "from-emerald-500 to-teal-600",
                "from-amber-500 to-orange-600",
                "from-pink-500 to-rose-600",
              ];

              const gradIdx =
                companyInitial.charCodeAt(0) % avatarGradients.length;

              return (
                <div
                  key={job.job_id}
                  className={`
            group w-full h-full bg-white rounded-2xl
            border border-slate-100
            hover:border-violet-200
            shadow-sm hover:shadow-lg
            hover:shadow-violet-100/40
            transition-all duration-300
            overflow-hidden
            flex flex-col
            ${isThreeColumnLayout ? "lg:min-h-[500px]" : "lg:min-h-[480px]"}
          `}
                >
                  {/* ── Funding Accent Stripe ───────────────────────────────────── */}
                  <div
                    className={`h-1 w-full flex-shrink-0 ${
                      isFundedJob(job.funding_status)
                        ? "bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500"
                        : "bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300"
                    }`}
                  />

                  {/* ── Card Content ────────────────────────────────────────────── */}
                  <div
                    className={`
              flex flex-col flex-1
              ${isThreeColumnLayout ? "p-4 lg:p-5" : "p-5"}
            `}
                  >
                    {/* ── Card Header ───────────────────────────────────────────── */}
                    <div
                      className={`
    flex items-start gap-10
    ${isThreeColumnLayout ? "lg:gap-3" : "pb-4"}
  `}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div
                          className={`
        rounded-xl
        bg-gradient-to-br ${avatarGradients[gradIdx]}
        flex items-center justify-center
        text-white font-black
        shadow-md
        ${isThreeColumnLayout ? "w-11 h-11 text-base" : "w-12 h-12 text-lg"}
      `}
                        >
                          {companyInitial}
                        </div>
                      </div>

                      {/* Main Header Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title + Bookmark */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3
                              onClick={() =>
                                navigate(`/dashboard/jobs/${job.job_id}`)
                              }
                              className={`
            font-bold text-slate-800
            hover:text-violet-700
            cursor-pointer
            transition-colors
            ${
              isThreeColumnLayout
                ? "text-sm lg:text-[15px] leading-5 line-clamp-2"
                : "text-base truncate"
            }
          `}
                            >
                              {job.job_title}
                            </h3>

                            {/* Employer */}
                            <p className="text-xs font-medium text-slate-500 truncate mt-1">
                              {employerName}
                            </p>
                          </div>

                          {/* Bookmark */}
                          {role === "student" && (
                            <button
                              onClick={() => toggleSaveJob(job.job_id)}
                              title={
                                isSaved
                                  ? t("pages.jobs.removeFromSaved")
                                  : t("pages.jobs.saveJob")
                              }
                              className="
            flex-shrink-0
            p-1.5
            rounded-lg
            hover:bg-slate-100
            transition-colors
            duration-200
          "
                            >
                              {isSaved ? (
                                <BookmarkSolidIcon className="w-5 h-5 text-violet-600" />
                              ) : (
                                <BookmarkIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* ── Status + Funding ─────────────────────────────────── */}
                        <div
                          className={`
        flex flex-wrap items-center gap-2
        ${isThreeColumnLayout ? "mt-2" : "mt-2"}
      `}
                        >
                          {/* Status */}
                          <span
                            className={`
          inline-flex items-center gap-1.5
          px-2.5 py-1
          rounded-full
          text-[10px]
          font-bold
          tracking-wide
          ${statusCfg.bg}
          ${statusCfg.text}
          border border-current/10
        `}
                          >
                            <span
                              className={`
            w-1.5 h-1.5
            rounded-full
            ${statusCfg.dot}
            animate-pulse
          `}
                            />
                            {statusCfg.label}
                          </span>

                          {/* Funding */}
                          <FundingBadge status={job.funding_status} />
                        </div>
                      </div>
                    </div>

                    {/* ── Meta Information ─────────────────────────────────────── */}
                    <div
                      className={`
                grid grid-cols-2
                gap-x-3 gap-y-3
                text-xs text-slate-600
                font-medium
                border-y border-slate-100
                ${isThreeColumnLayout ? "mt-4 py-3" : "mt-4 py-4"}
              `}
                    >
                      {/* Location */}
                      {job.location ? (
                        <span className="flex items-start gap-1.5 min-w-0">
                          <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                          <span className="truncate">{job.location}</span>
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* Budget */}
                      <span className="flex items-start gap-1.5 min-w-0">
                        <CurrencyDollarIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                        <span className="truncate">
                          {formatBudgetWithCurrency(
                            job.budget,
                            job.currency || "USD",
                          )}
                        </span>
                      </span>

                      {/* Duration */}
                      {job.duration ? (
                        <span className="flex items-start gap-1.5 min-w-0">
                          <ClockIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                          <span className="truncate">{job.duration}</span>
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* Created */}
                      {job.created_at ? (
                        <span className="flex items-start gap-1.5 min-w-0 text-slate-400">
                          <ClockIcon className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span className="leading-4">
                            {t("pages.jobs.posted")}{" "}
                            {formatRelativeTime(job.created_at)}
                          </span>
                        </span>
                      ) : (
                        <span />
                      )}
                    </div>

                    {/* ── Description ───────────────────────────────────────────── */}
                    {job.description && (
                      <div
                        className={`
      rounded-xl
      border border-slate-200
      bg-slate-50
      ${isThreeColumnLayout ? "mt-4 p-3 h-[48px]" : "p-3 h-[48px]"}
    `}
                      >
                        <p
                          className="
        text-xs
        text-slate-600
        leading-relaxed
        truncate
        whitespace-nowrap
        overflow-hidden
      "
                          title={job.description}
                        >
                          {job.description}
                        </p>
                      </div>
                    )}

                    {/* ── Tags ──────────────────────────────────────────────────── */}
                    <div
                      className={`
                flex flex-wrap gap-2
                mt-4
                ${
                  isThreeColumnLayout
                    ? "mt-4 min-h-[58px] content-start"
                    : "pb-4"
                }
              `}
                    >
                      {/* Category */}
                      {job.category && (
                        <span
                          className="
                  
                    px-2.5 py-1
                    rounded-lg
                    bg-violet-50
                    text-violet-700
                    text-[10px]
                    font-bold
                    border border-violet-200/50
                    whitespace-nowrap
                  "
                        >
                          {job.category}
                        </span>
                      )}

                      {/* Employment Type */}
                      {job.employment_type && (
                        <span
                          className="
                    px-2.5 py-1
                    rounded-lg
                    bg-sky-50
                    text-sky-700
                    text-[10px]
                    font-bold
                    border border-sky-200/50
                    whitespace-nowrap
                  "
                        >
                          {job.employment_type}
                        </span>
                      )}

                      {/* Experience */}
                      {job.experience_level && (
                        <span
                          className="
                    px-2.5 py-1
                    rounded-lg
                    bg-slate-100
                    text-slate-700
                    text-[10px]
                    font-bold
                    border border-slate-200/50
                    whitespace-nowrap
                  "
                        >
                          {job.experience_level}
                        </span>
                      )}

                      {/* Applicants */}
                      <span
                        className="
                  px-2.5 py-1
                  rounded-lg
                  bg-slate-100
                  text-slate-700
                  text-[10px]
                  font-bold
                  border border-slate-200/50
                  flex items-center gap-1.5
                  whitespace-nowrap
                "
                      >
                        <UserGroupIcon className="w-3 h-3 flex-shrink-0" />
                        {job.applications || 0} {t("pages.jobs.applicants")}
                      </span>
                    </div>

                    {/* ── Like / Dislike ────────────────────────────────────────── */}
                    <div
                      className={`
                flex items-center
                ${isThreeColumnLayout ? "py-3" : "py-4"}
              `}
                    >
                      <JobReaction job={job} />
                    </div>

                    {/* ── Actions ───────────────────────────────────────────────── */}
                    <div
                      className={`
                mt-4
                pt-3
                pl-5
                border-t border-slate-100
                flex flex-wrap
                items-center
                gap-4
                ${isThreeColumnLayout ? "lg:gap-2" : ""}
              `}
                    >
                      {/* ========================================================= */}
                      {/* STUDENT ACTIONS                                           */}
                      {/* ========================================================= */}
                      {role === "student" ? (
                        <div className="relative group/apply">
                          <button
                            onClick={() => !isApplyDisabled && handleApply(job)}
                            disabled={isApplyDisabled}
                            className={`
                      px-4 py-2
                      rounded-lg
                      text-xs
                      font-bold
                      transition-all
                      active:scale-95
                      ${
                        isApplyDisabled
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200"
                      }
                    `}
                          >
                            {hasAlreadyApplied
                              ? "✓ Applied"
                              : isCompletedJob
                                ? t("pages.jobs.completed", {
                                    defaultValue: "Completed",
                                  })
                                : t("pages.jobs.applyNow")}
                          </button>

                          {isCompletedJob && (
                            <div className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-52 rounded-xl bg-slate-900 px-3 py-2 text-center text-xs text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover/apply:opacity-100 z-20">
                              {t("pages.jobs.completedNoApplyMessage", {
                                defaultValue:
                                  "Applications are closed for this job.",
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* ===================================================== */}
                          {/* VIEW DETAILS                                          */}
                          {/* ===================================================== */}
                          <ActionBtn
                            onClick={() =>
                              navigate(`/dashboard/jobs/${job.job_id}`)
                            }
                          >
                            {t("pages.jobs.viewDetails")}
                          </ActionBtn>

                          {/* ===================================================== */}
                          {/* EMPLOYER / SUPERADMIN ACTIONS                        */}
                          {/* ===================================================== */}
                          {(role === "employer" ||
                            (role === "superadmin" && !isUnfundedRoute)) && (
                            <>
                              {/* Tasks */}
                              <ActionBtn
                                onClick={() =>
                                  navigate(
                                    `/dashboard/jobs/${job.job_id}/tasks`,
                                  )
                                }
                                variant="secondary"
                              >
                                Tasks
                              </ActionBtn>

                              {/* Applications */}
                              <ActionBtn
                                onClick={() =>
                                  navigate(
                                    `/dashboard/jobs/${job.job_id}/applications`,
                                  )
                                }
                                variant="primary"
                              >
                                Applications
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
                                  {job.applications || 0}
                                </span>
                              </ActionBtn>

                              {/* Activate / Deactivate */}
                              {(job.status === "Active" ||
                                job.status === "Inactive") && (
                                <ActionBtn
                                  onClick={() =>
                                    handleToggleStatus(job.job_id, job.status)
                                  }
                                  disabled={isToggling}
                                  variant={
                                    job.status === "Active"
                                      ? "danger"
                                      : "success"
                                  }
                                >
                                  {isToggling
                                    ? t("pages.jobs.updating")
                                    : job.status === "Active"
                                      ? t("pages.jobs.deactivate")
                                      : t("pages.jobs.activate")}
                                </ActionBtn>
                              )}
                            </>
                          )}

                          {/* ===================================================== */}
                          {/* ADMIN REVIEW                                          */}
                          {/* ===================================================== */}
                          {(role === "admin" || role === "superadmin") &&
                            isUnfundedRoute && (
                              <>
                                {/* Approve */}
                                <ActionBtn
                                  onClick={() =>
                                    handleAdminReview(job.job_id, "Active")
                                  }
                                  disabled={isReviewingJob}
                                  variant="success"
                                >
                                  ✓ Approve
                                </ActionBtn>

                                {/* Disapprove */}
                                <ActionBtn
                                  onClick={() =>
                                    handleAdminReview(job.job_id, "Inactive")
                                  }
                                  disabled={isReviewingJob}
                                  variant="danger"
                                >
                                  ✕ Disapprove
                                </ActionBtn>
                              </>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ─────────────────────────────────────────────────────── */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500 font-medium">
                Page{" "}
                <span className="font-bold text-slate-700">
                  {data.pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700">
                  {data.pagination.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1 || isFetching}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="
            px-4 py-2
            rounded-lg
            border border-slate-200
            bg-white
            text-xs font-semibold
            text-slate-700
            hover:bg-slate-50
            disabled:opacity-40
            disabled:cursor-not-allowed
            transition
          "
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    {
                      length: data.pagination.totalPages,
                    },
                    (_, index) => index + 1,
                  )
                    .filter((page) => {
                      const totalPages = data.pagination.totalPages;

                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, pages) => {
                      const previousPage = pages[index - 1];

                      return (
                        <React.Fragment key={page}>
                          {previousPage && page - previousPage > 1 && (
                            <span className="px-1 text-slate-400">...</span>
                          )}

                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            disabled={isFetching}
                            className={`
                      w-9 h-9
                      rounded-lg
                      text-xs font-bold
                      transition
                      ${
                        currentPage === page
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      }
                      disabled:opacity-50
                    `}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  type="button"
                  disabled={
                    currentPage >= data.pagination.totalPages || isFetching
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, data.pagination.totalPages),
                    )
                  }
                  className="
            px-4 py-2
            rounded-lg
            border border-slate-200
            bg-white
            text-xs font-semibold
            text-slate-700
            hover:bg-slate-50
            disabled:opacity-40
            disabled:cursor-not-allowed
            transition
          "
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {selectedJob && (
            <ApplyJobModal
              job={selectedJob}
              isOpen={isModalOpen}
              onClose={handleModalClose}
              onSuccess={handleModalClose}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AllJobs;

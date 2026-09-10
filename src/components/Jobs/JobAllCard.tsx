import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BookmarkIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkSolidIcon,
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/24/solid";

import JobReaction from "./JobReaction";
import { formatRelativeTime } from "../../utils/timeUtils";
import { formatBudgetWithCurrency } from "../../constants/currencies";

interface JobCardProps {
  job: any;
  role: string;
  t: any;

  isSaved: boolean;
  toggleSaveJob: (jobId: string) => void;

  hasAlreadyApplied: boolean;
  handleApply: (job: any) => void;

  isToggling: boolean;
  handleToggleStatus: (
    jobId: string,
    currentStatus: string
  ) => void;

  isReviewingJob: boolean;
  handleAdminReview: (
    jobId: string,
    status: "Active" | "Inactive"
  ) => void;

  isUnfundedRoute: boolean;
}

const STATUS_CONFIG: Record<
  string,
  {
    bg: string;
    text: string;
    dot: string;
    label: string;
  }
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

const getStatusCfg = (status: string) =>
  STATUS_CONFIG[status] ?? {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    label: status,
  };

const isFundedJob = (fundingStatus?: string | null) =>
  fundingStatus === "Funded" || fundingStatus === "Paid";

const FundingBadge: React.FC<{
  status?: string | null;
}> = ({ status }) => {
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

const ActionBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  children: React.ReactNode;
  size?: "sm" | "xs";
}> = ({
  onClick,
  disabled,
  variant = "secondary",
  children,
  size = "sm",
}) => {
  const variants = {
    primary:
      "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200/50 border border-violet-500/20",

    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",

    danger:
      "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60",

    success:
      "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60",

    ghost:
      "hover:bg-slate-100 text-slate-600 border border-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold",
    xs: "px-2.5 py-1 text-[11px] font-semibold",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap`}
    >
      {children}
    </button>
  );
};

const JobCard: React.FC<JobCardProps> = ({
  job,
  role,
  t,
  isSaved,
  toggleSaveJob,
  hasAlreadyApplied,
  handleApply,
  isToggling,
  handleToggleStatus,
  isReviewingJob,
  handleAdminReview,
  isUnfundedRoute,
}) => {
  const navigate = useNavigate();

  const employerName =
    job.employer?.full_name ||
    t("pages.jobs.unknownEmployer");

  const companyInitial =
    employerName.charAt(0).toUpperCase() || "J";

  const isCompletedJob = job.status === "Completed";
  const isApplyDisabled =
    hasAlreadyApplied || isCompletedJob;

  const statusCfg = getStatusCfg(job.status);

  const avatarGradients = [
    "from-violet-500 to-violet-700",
    "from-sky-500 to-sky-700",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
  ];

  const gradIdx =
    companyInitial.charCodeAt(0) %
    avatarGradients.length;

  return (
    <div
      className="
        group
        w-full
        h-full
        bg-white
        rounded-2xl
        border
        border-slate-100
        hover:border-violet-200
        shadow-sm
        hover:shadow-lg
        hover:shadow-violet-100/40
        transition-all
        duration-300
        overflow-hidden
        flex
        flex-col
        lg:min-h-[480px]
      "
    >
      {/* Funding Accent */}
      <div
        className={`h-1 w-full flex-shrink-0 ${
          isFundedJob(job.funding_status)
            ? "bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500"
            : "bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300"
        }`}
      />

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start gap-4 pb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className={`
                w-12
                h-12
                rounded-xl
                bg-gradient-to-br
                ${avatarGradients[gradIdx]}
                flex
                items-center
                justify-center
                text-white
                font-black
                text-lg
                shadow-md
              `}
            >
              {companyInitial}
            </div>
          </div>

          {/* Header Content */}
          <div className="flex-1 min-w-0">
            {/* Title + Bookmark */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  onClick={() =>
                    navigate(
                      `/dashboard/jobs/${job.job_id}`
                    )
                  }
                  className="
                    text-base
                    font-bold
                    text-slate-800
                    hover:text-violet-700
                    cursor-pointer
                    transition-colors
                    truncate
                  "
                >
                  {job.job_title}
                </h3>

                <p className="text-xs font-medium text-slate-500 truncate mt-1">
                  {employerName}
                </p>
              </div>

              {/* Student Bookmark */}
              {role === "student" && (
                <button
                  type="button"
                  onClick={() =>
                    toggleSaveJob(job.job_id)
                  }
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

            {/* Status + Funding */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`
                  inline-flex
                  items-center
                  gap-1.5
                  px-2.5
                  py-1
                  rounded-full
                  text-[10px]
                  font-bold
                  tracking-wide
                  ${statusCfg.bg}
                  ${statusCfg.text}
                  border
                  border-current/10
                `}
              >
                <span
                  className={`
                    w-1.5
                    h-1.5
                    rounded-full
                    ${statusCfg.dot}
                    animate-pulse
                  `}
                />

                {statusCfg.label}
              </span>

              <FundingBadge
                status={job.funding_status}
              />
            </div>
          </div>
        </div>

        {/* Meta Information */}
        <div
          className="
            grid
            grid-cols-2
            gap-x-3
            gap-y-3
            text-xs
            text-slate-600
            font-medium
            border-y
            border-slate-100
            mt-4
            py-4
          "
        >
          {/* Location */}
          {job.location ? (
            <span className="flex items-start gap-1.5 min-w-0">
              <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />

              <span className="truncate">
                {job.location}
              </span>
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
                job.currency || "USD"
              )}
            </span>
          </span>

          {/* Duration */}
          {job.duration ? (
            <span className="flex items-start gap-1.5 min-w-0">
              <ClockIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />

              <span className="truncate">
                {job.duration}
              </span>
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

        {/* Description */}
        {job.description && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 h-[48px] mt-4">
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

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4 pb-4">
          {job.category && (
            <span
              className="
                px-2.5
                py-1
                rounded-lg
                bg-violet-50
                text-violet-700
                text-[10px]
                font-bold
                border
                border-violet-200/50
                whitespace-nowrap
              "
            >
              {job.category}
            </span>
          )}

          {job.employment_type && (
            <span
              className="
                px-2.5
                py-1
                rounded-lg
                bg-sky-50
                text-sky-700
                text-[10px]
                font-bold
                border
                border-sky-200/50
                whitespace-nowrap
              "
            >
              {job.employment_type}
            </span>
          )}

          {job.experience_level && (
            <span
              className="
                px-2.5
                py-1
                rounded-lg
                bg-slate-100
                text-slate-700
                text-[10px]
                font-bold
                border
                border-slate-200/50
                whitespace-nowrap
              "
            >
              {job.experience_level}
            </span>
          )}

          <span
            className="
              px-2.5
              py-1
              rounded-lg
              bg-slate-100
              text-slate-700
              text-[10px]
              font-bold
              border
              border-slate-200/50
              flex
              items-center
              gap-1.5
              whitespace-nowrap
            "
          >
            <UserGroupIcon className="w-3 h-3 flex-shrink-0" />

            {job.applications || 0}{" "}
            {t("pages.jobs.applicants")}
          </span>
        </div>

        {/* Reactions */}
        <div className="flex items-center py-4">
          <JobReaction job={job} />
        </div>

        {/* Actions */}
        <div
          className="
            mt-4
            pt-3
            pl-5
            border-t
            border-slate-100
            flex
            flex-wrap
            items-center
            gap-4
          "
        >
          {/* STUDENT */}
          {role === "student" ? (
            <div className="relative group/apply">
              <button
                type="button"
                onClick={() =>
                  !isApplyDisabled &&
                  handleApply(job)
                }
                disabled={isApplyDisabled}
                className={`
                  px-4
                  py-2
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
                  {t(
                    "pages.jobs.completedNoApplyMessage",
                    {
                      defaultValue:
                        "Applications are closed for this job.",
                    }
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* VIEW DETAILS */}
              <ActionBtn
                onClick={() =>
                  navigate(
                    `/dashboard/jobs/${job.job_id}`
                  )
                }
              >
                {t("pages.jobs.viewDetails")}
              </ActionBtn>

              {/* EMPLOYER / SUPERADMIN */}
              {(role === "employer" ||
                (role === "superadmin" &&
                  !isUnfundedRoute)) && (
                <>
                  {/* Tasks */}
                  <ActionBtn
                    onClick={() =>
                      navigate(
                        `/dashboard/jobs/${job.job_id}/tasks`
                      )
                    }
                  >
                    Tasks
                  </ActionBtn>

                  {/* Applications */}
                  <ActionBtn
                    onClick={() =>
                      navigate(
                        `/dashboard/jobs/${job.job_id}/applications`
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
                        handleToggleStatus(
                          job.job_id,
                          job.status
                        )
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

              {/* ADMIN REVIEW */}
              {(role === "admin" ||
                role === "superadmin") &&
                isUnfundedRoute && (
                  <>
                    {/* Approve */}
                    <ActionBtn
                      onClick={() =>
                        handleAdminReview(
                          job.job_id,
                          "Active"
                        )
                      }
                      disabled={isReviewingJob}
                      variant="success"
                    >
                      ✓ Approve
                    </ActionBtn>

                    {/* Disapprove */}
                    <ActionBtn
                      onClick={() =>
                        handleAdminReview(
                          job.job_id,
                          "Inactive"
                        )
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
};

export default JobCard;
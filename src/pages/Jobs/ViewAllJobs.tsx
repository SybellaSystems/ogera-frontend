import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  BriefcaseIcon,
  ArrowPathIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import { useGetAllJobsQuery ,useToggleJobStatusMutation,
  useReviewJobMutation,} from "../../services/api/jobsApi";
  import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import Loader from "../../components/Loader";
import JobAllCard from "../../components/Jobs/JobAllCard";
import ApplyJobModal from "../../components/ApplyJobModal";
import CardsPerRowSelector from "../../components/Jobs/CardsPerRowSelector";
import PaginationControls from "../../components/Jobs/PaginationControls";

type JobStatus = "all" | "active" | "pending" | "inactive" | "completed";

const VALID_STATUSES: JobStatus[] = [
  "all",
  "active",
  "pending",
  "inactive",
  "completed",
];

const STATUS_MAP: Record<
  JobStatus,
  "Pending" | "Active" | "Inactive" | "Completed" | undefined
> = {
  all: undefined,
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
  completed: "Completed",
};

const TITLE_MAP: Record<JobStatus, string> = {
  all: "All Jobs",
  active: "Active Jobs",
  pending: "Pending Jobs",
  inactive: "Inactive Jobs",
  completed: "Completed Jobs",
};

const JOBS_PER_PAGE = 20;

const ViewAllJobs: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const location = useLocation();

  const roleRaw = useSelector((state: any) => state.auth.role);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : "";
  const {
  data: studentApplications,
  refetch: refetchApplications,
} = useGetStudentApplicationsQuery(undefined, {
  skip: role !== "student",
});

const appliedJobIds = new Set(
  (studentApplications?.data || []).map((app: any) => app.job_id),
);

  const [cardsPerRow, setCardsPerRow] = useState<2 | 3>(2);

  const isUnfundedRoute = location.pathname === "/dashboard/jobs/unfunded";
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [toggleStatus, { isLoading: isToggling }] =
      useToggleJobStatusMutation();

      const [reviewJob, { isLoading: isReviewingJob }] = useReviewJobMutation();

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Pagination
   */
  const [currentPage, setCurrentPage] = useState(1);

  const statusParam = (searchParams.get("status") || "all").toLowerCase();

  const status: JobStatus = VALID_STATUSES.includes(statusParam as JobStatus)
    ? (statusParam as JobStatus)
    : "all";

  /**
   * Reset pagination whenever the status changes.
   *
   * Example:
   * Active page 4 -> switch to Pending
   * Pending will start from page 1.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  

  /**
   * API status.
   *
   * "all" intentionally sends no status parameter.
   */
  const apiStatus = STATUS_MAP[status];

  /**
   * Fetch jobs with pagination.
   *
   * cardsPerRow is only a UI layout setting.
   * JOBS_PER_PAGE controls how many jobs the API returns.
   */
  const {
    data: jobsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllJobsQuery(
    {
      page: currentPage,
      limit: JOBS_PER_PAGE,
      ...(apiStatus ? { status: apiStatus } : {}),
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const jobs = jobsData?.data ?? [];

  /**
   * Pagination information returned by the API.
   *
   * Expected structure:
   *
   * pagination: {
   *   page: 1,
   *   totalPages: 5,
   *   total: 100
   * }
   */
  const pagination = jobsData?.pagination;

  /**
   * Saved jobs
   */
  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);

      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }

      return next;
    });
  };

  /**
   * Apply job
   */
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


  /**
   * Empty action handlers.
   *
   * These are intentionally kept compatible with JobAllCard.
   * The actual mutations remain on the main AllJobs page.
   */
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

  /**
   * Loading
   */
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  /**
   * Error
   */
  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 px-6 py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-100">
            <XCircleIcon className="h-7 w-7 text-red-500" />
          </div>

          <h3 className="text-base font-bold text-red-700">
            Failed to load jobs
          </h3>

          <p className="mt-1 text-sm text-red-600/80">
            {t("pages.jobs.failedToLoad")}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-violet-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-violet-700
            "
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ================================================================
          HEADER
          Only page title + cards per row.
      ================================================================= */}

      {/* ================================================================
    HEADER
================================================================= */}
      <div className="space-y-3">
        {/* Back Button - separate row */}
        <div>
          <button
            type="button"
            onClick={() => {
              const previousRoute =
                (location.state as { from?: string } | null)?.from ||
                "/dashboard/jobs/all";

              navigate(previousRoute);
            }}
            className="
        inline-flex
        items-center
        gap-1.5
        text-sm
        font-medium
        text-slate-700
        transition-colors
        hover:text-violet-700
      "
            aria-label="Go back"
            title="Back"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Title + Cards Per Row - second row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Page Title */}
          <div className="flex items-center gap-3">
            <div
              className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-gradient-to-br
          from-violet-600
          to-purple-700
          shadow-sm
        "
            >
              <BriefcaseIcon className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {TITLE_MAP[status]}
              </h1>

              <p className="mt-0.5 text-sm text-gray-600">
                Showing the latest {JOBS_PER_PAGE} jobs per page
              </p>
            </div>

            {isFetching && (
              <ArrowPathIcon className="h-4 w-4 animate-spin text-violet-500" />
            )}
          </div>

          {/* Cards Per Row */}
          <div className="flex items-center gap-2">
            {/* Cards Per Row */}
            <CardsPerRowSelector
              cardsPerRow={cardsPerRow}
              setCardsPerRow={setCardsPerRow}
            />
          </div>
        </div>
      </div>

      {/* ================================================================
          RESULTS COUNT
      ================================================================= */}

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-700">{jobs.length}</span> jobs
          {pagination?.total !== undefined && (
            <>
              {" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {pagination.total}
              </span>
            </>
          )}
        </p>
      </div>

      {/* ================================================================
          JOB CARDS
          Existing card functionality remains unchanged.
      ================================================================= */}

      {jobs.length > 0 ? (
        <div
          className={`
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
            lg:gap-6
            items-stretch
            ${cardsPerRow === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}
          `}
        >
          {jobs.map((job: any) => (
            <JobAllCard
              key={job.job_id}
              job={job}
              role={role}
              t={t}
              isSaved={savedJobs.has(job.job_id)}
              toggleSaveJob={toggleSaveJob}
              hasAlreadyApplied={appliedJobIds.has(job.job_id)}
              handleApply={handleApply}
              isToggling={isToggling}
              handleToggleStatus={handleToggleStatus}
              isReviewingJob={isReviewingJob}
              handleAdminReview={handleAdminReview}
              isUnfundedRoute={isUnfundedRoute}
            />
          ))}
        </div>
      ) : (
        /* ================================================================
            EMPTY STATE
        ================================================================= */

        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="px-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <BriefcaseIcon className="h-7 w-7 text-gray-400" />
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              No {status === "all" ? "" : status} jobs found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no jobs available for this status.
            </p>
          </div>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          isFetching={isFetching}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* ================================================================
          APPLY MODAL
      ================================================================= */}

      {selectedJob && (
        <ApplyJobModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
};

export default ViewAllJobs;

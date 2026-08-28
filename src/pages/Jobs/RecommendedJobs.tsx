
import React, { useState } from "react";

import {
  useGetActiveVerifiedReferralsQuery,
} from "../../services/api/jobReferralsApi";

import type { JobReferral } from "../../services/api/jobReferralsApi";

import JobCards from "@/components/Jobs/JobCards";

const RECOMMENDED_JOBS_LIMIT = 9;

const RecommendedJobs: React.FC = () => {

  /*
   * false = initially show only 9 jobs
   * true  = fetch and show all jobs
   */
  const [showAll, setShowAll] = useState(false);

  /*
   * Fetch recommended jobs.
   *
   * Initial request:
   * limit = 9
   * all = false
   *
   * After clicking View More:
   * limit = 9
   * all = true
   */
  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetActiveVerifiedReferralsQuery({
    limit: RECOMMENDED_JOBS_LIMIT,
    all: showAll,
  });

  /*
   * Backend response.
   *
   * Your ActiveVerifiedReferralsResponse should have:
   *
   * data: JobReferral[]
   */
  const referrals: JobReferral[] = data?.data ?? [];

  console.log(
    referrals,
    "Recommended Jobs: referrals from backend",
  );

  /*
   * Show View More when:
   *
   * - We are not already showing all jobs
   * - Backend returned the full 9 jobs
   *
   * If backend has fewer than 9 jobs, there is nothing
   * more to display.
   */
  const showViewMore =
    !showAll &&
    referrals.length >= RECOMMENDED_JOBS_LIMIT;

  /*
   * Fetch all recommended jobs.
   */
  const handleViewMore = () => {
    if (!isFetching) {
      setShowAll(true);
    }
  };

  return (
    <div className="mx-auto max-w-8xl">
      {/* Header */}
      <div className="mb-0">
        <h1 className="text-2xl font-bold text-gray-900">
          Recommended Jobs
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Job opportunities verified and shared by the Ogera team.
        </p>
      </div>

      {/* Information */}
      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm leading-6 text-blue-800">
          These opportunities are sourced from external employers and
          platforms. Ogera verifies the opportunities before sharing them
          with students. Applications are completed on the original
          employer or job platform.
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
            Loading recommended jobs...
          </p>
        </div>
      ) : isError ? (
        /* Error State */
        <div className="mt-4 rounded-xl border border-red-200 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Unable to load recommended jobs
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please try again later.
          </p>
        </div>
      ) : referrals.length === 0 ? (
        /* Empty State */
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No recommended jobs available
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            The Ogera team is currently looking for opportunities that may
            be suitable for students.
          </p>
        </div>
      ) : (
        <>
          {/* Referral List */}
          <div className="mx-auto max-w-6xl">
            <JobCards
              jobs={referrals}
              detailsPath="/dashboard/jobs/recommended"
            />
          </div>

          {/* View More */}
          {showViewMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleViewMore}
                disabled={isFetching}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFetching ? "Loading..." : "View More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendedJobs;

import { useMemo } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import JobCards from "../../components/Jobs/JobCards";
import {
  useGetAllJobReferralsQuery,
} from "../../services/api/jobReferralsApi";

import type {
  ReferralTab,
} from "../../services/api/jobReferralsApi";

const AllJobReferrals: React.FC = () => {
  const [searchParams] =
    useSearchParams();

  const navigate = useNavigate();

  /*
   * Get status from URL
   *
   * Example:
   * /dashboard/jobs/referrals/all?status=active
   *
   * status = active
   */
  const statusFromUrl =
    searchParams.get("status") || "all";

  /*
   * Make sure only valid ReferralTab values
   * are passed to the API.
   */
  const tab: ReferralTab = useMemo(() => {
    switch (statusFromUrl.toLowerCase()) {
      case "pending":
        return "pending";

      case "verified":
        return "verified";

      case "active":
        return "active";

      case "closed":
        return "closed";

      case "all":
      default:
        return "all";
    }
  }, [statusFromUrl]);

  /*
   * IMPORTANT:
   *
   * all: true
   *
   * This tells the backend:
   * "Don't apply pagination."
   */
  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetAllJobReferralsQuery({
    status: tab,
    all: true,
  });

  const referrals =
    data?.data?.referrals ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tab} Job Referrals
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Browse all job referrals based on their current
            status.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard/jobs/referrals")
          }
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Job Referrals
        </button>
      </div>

      {/* Tabs */}
      {/* <JobTabs
        count={counts}
        onTabChange={handleTabChange}
      /> */}

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading job referrals...
          </p>
        </div>
      )}

      {/* Fetching after changing tab */}
      {!isLoading && isFetching && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            Loading referrals...
          </p>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-red-600">
            Failed to load job referrals.
          </p>
        </div>
      )}

      {/* No data */}
      {!isLoading &&
        !isFetching &&
        !isError &&
        referrals.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center">
            <p className="text-sm text-gray-500">
              No job referrals found for this status.
            </p>
          </div>
        )}

      {/* All referrals */}
      {!isLoading &&
        !isError &&
        referrals.length > 0 && (
          <JobCards jobs={referrals} />
        )}
    </div>
  );
};

export default AllJobReferrals;

import React from "react";

import {
  useGetAllJobReferralsQuery,
  useGetJobReferralStatisticsQuery,
} from "../../services/api/jobReferralsApi";
import { useNavigate } from "react-router-dom";
import type { JobReferral } from "../../services/api/jobReferralsApi";

const ReferralAnalytics: React.FC = () => {
  const navigate = useNavigate();
  /*
   * Get all referrals from the backend.
   * No localStorage is used.
   */
  const {
    data: referralsData,
    isLoading: referralsLoading,
  } = useGetAllJobReferralsQuery({
    page: 1,
    limit: 100,
    status: "all",
  });

  /*
   * Get analytics/statistics from the backend.
   */
  const {
    data: statisticsData,
    isLoading: statisticsLoading,
  } = useGetJobReferralStatisticsQuery();

  // const referrals = referralsData?.data ?? [];
  const referrals: JobReferral[] = referralsData?.data?.referrals ?? [];
  const statistics = statisticsData?.data;

  /*
   * Use backend statistics.
   */
  const totalReferrals = statistics?.totalReferrals ?? 0;
  const pending = statistics?.pendingReferrals ?? 0;
  const verified = statistics?.verifiedReferrals ?? 0;
  const active = statistics?.activeReferrals ?? 0;
  const totalViews = statistics?.totalViews ?? 0;
  const applyClicks = statistics?.totalApplyClicks ?? 0;
  const reportedApplications =
    statistics?.totalReportedApplications ?? 0;

  const clickRate =
    totalViews > 0
      ? (applyClicks / totalViews) * 100
      : 0;

  const isLoading =
    referralsLoading || statisticsLoading;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";

      case "Verified":
        return "bg-blue-100 text-blue-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Inactive":
        return "bg-gray-100 text-gray-700";

      case "Expired":
        return "bg-gray-200 text-gray-600";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Referral Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Monitor how students are engaging with curated job
            opportunities.
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

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Referrals */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Referrals
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalReferrals}
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {pending}
            </p>
          </div>

          {/* Active */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {active}
            </p>
          </div>

          {/* Views */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Student Views
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalViews}
            </p>
          </div>

          {/* Apply Clicks */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Apply Clicks
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {applyClicks}
            </p>
          </div>

          {/* Applications */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Reported Applications
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {reportedApplications}
            </p>
          </div>

          {/* Click Rate */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Apply Click Rate
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {clickRate.toFixed(1)}%
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Apply clicks ÷ student views
            </p>
          </div>

          {/* Verified */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Verified Referrals
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {verified}
            </p>
          </div>
        </div>

        {/* Referral Performance */}
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Referral Performance
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              See how each opportunity is performing.
            </p>
          </div>

          {isLoading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-500">
                Loading referral analytics...
              </p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-base font-semibold text-gray-900">
                No referrals yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create your first referral to start collecting
                analytics.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Opportunity
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Views
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Apply Clicks
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Click Rate
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Applications
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">

                  {referrals.map((referral) => {
                    const views =
                      referral.views_count ?? 0;

                    const applyClicks =
                      referral.apply_clicks ?? 0;

                    const applications =
                      referral.reported_applications ?? 0;

                    const referralClickRate =
                      views > 0
                        ? (applyClicks / views) * 100
                        : 0;

                    return (
                      <tr
                        key={referral.referral_id}
                        className="hover:bg-gray-50"
                      >
                        {/* Opportunity */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {referral.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {referral.company}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                              referral.status,
                            )}`}
                          >
                            {referral.status}
                          </span>
                        </td>

                        {/* Views */}
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                          {views}
                        </td>

                        {/* Apply Clicks */}
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                          {applyClicks}
                        </td>

                        {/* Click Rate */}
                        <td className="px-6 py-4 text-right text-sm font-medium text-purple-600">
                          {referralClickRate.toFixed(1)}%
                        </td>

                        {/* Applications */}
                        <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                          {applications}
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralAnalytics;
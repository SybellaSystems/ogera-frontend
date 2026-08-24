import React, { useEffect, useMemo, useState } from "react";
import type { JobReferral } from "../../type/jobs/referral";
import { getReferrals } from "../../services/referralStorage";

const ReferralAnalytics: React.FC = () => {
  const [referrals, setReferrals] = useState<JobReferral[]>([]);

  useEffect(() => {
    setReferrals(getReferrals());
  }, []);

  const metrics = useMemo(() => {
    const totalReferrals = referrals.length;

    const pending = referrals.filter(
      (referral) => referral.status === "pending_verification",
    ).length;

    const verified = referrals.filter(
      (referral) => referral.status === "verified",
    ).length;

    const active = referrals.filter(
      (referral) => referral.status === "active",
    ).length;

    const totalViews = referrals.reduce(
      (total, referral) =>
        total + (referral.views || 0),
      0,
    );

    const applyClicks = referrals.reduce(
      (total, referral) =>
        total + (referral.applyClicks || 0),
      0,
    );

    const reportedApplications = referrals.reduce(
      (total, referral) =>
        total + (referral.reportedApplications || 0),
      0,
    );

    const clickRate =
      totalViews > 0
        ? (applyClicks / totalViews) * 100
        : 0;

    return {
      totalReferrals,
      pending,
      verified,
      active,
      totalViews,
      applyClicks,
      reportedApplications,
      clickRate,
    };
  }, [referrals]);

  const getStatusClasses = (status: JobReferral["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";

      case "verified":
        return "bg-blue-100 text-blue-700";

      case "pending_verification":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Referral Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Monitor how students are engaging with curated job
            opportunities.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Referrals */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Referrals
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {metrics.totalReferrals}
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {metrics.pending}
            </p>
          </div>

          {/* Active */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {metrics.active}
            </p>
          </div>

          {/* Views */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Student Views
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {metrics.totalViews}
            </p>
          </div>

          {/* Apply Clicks */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Apply Clicks
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {metrics.applyClicks}
            </p>
          </div>

          {/* Applications */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Reported Applications
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {metrics.reportedApplications}
            </p>
          </div>

          {/* Click Rate */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Apply Click Rate
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {metrics.clickRate.toFixed(1)}%
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
              {metrics.verified}
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

          {referrals.length === 0 ? (
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
                    const views = referral.views || 0;
                    const applyClicks =
                      referral.applyClicks || 0;
                    const applications =
                      referral.reportedApplications || 0;

                    const clickRate =
                      views > 0
                        ? (applyClicks / views) * 100
                        : 0;

                    return (
                      <tr
                        key={referral.id}
                        className="hover:bg-gray-50"
                      >
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

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                              referral.status,
                            )}`}
                          >
                            {referral.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                          {views}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                          {applyClicks}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-medium text-purple-600">
                          {clickRate.toFixed(1)}%
                        </td>

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
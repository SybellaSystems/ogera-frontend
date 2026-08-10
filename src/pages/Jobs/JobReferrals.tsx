import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { JobReferral } from "../../type/jobs/referral";
import { getReferrals } from "../../services/referralStorage";

type ReferralFilter =
  | "all"
  | "draft"
  | "pending_verification"
  | "verified"
  | "active"
  | "closed"
  | "rejected"
  | "expired";

const JobReferrals: React.FC = () => {
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState<JobReferral[]>([]);
  const [status, setStatus] = useState<ReferralFilter>("all");

  useEffect(() => {
    setReferrals(getReferrals());
  }, []);

  const tabs: { label: string; value: ReferralFilter }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Pending Verification", value: "pending_verification" },
    { label: "Verified", value: "verified" },
    { label: "Active", value: "active" },
    { label: "Closed", value: "closed" },
  ];

  const filteredReferrals = referrals.filter(
    (job) => status === "all" || job.status === status,
  );

  const getStatusLabel = (jobStatus: JobReferral["status"]) => {
    switch (jobStatus) {
      case "draft":
        return "Draft";

      case "pending_verification":
        return "Pending Verification";

      case "verified":
        return "Verified";

      case "active":
        return "Active";

      case "closed":
        return "Closed";

      case "rejected":
        return "Rejected";

      case "expired":
        return "Expired";

      default:
        return jobStatus;
    }
  };

  const getStatusClasses = (jobStatus: JobReferral["status"]) => {
    switch (jobStatus) {
      case "active":
        return "bg-green-100 text-green-700";

      case "verified":
        return "bg-blue-100 text-blue-700";

      case "pending_verification":
        return "bg-yellow-100 text-yellow-700";

      case "draft":
        return "bg-gray-100 text-gray-700";

      case "closed":
        return "bg-red-100 text-red-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "expired":
        return "bg-gray-200 text-gray-600";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Job Referrals
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              External job opportunities found, verified, and curated by the
              Ogera team.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/jobs/referrals/create")
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Create Referral
          </button>
        </div>

        {/* Status Tabs */}
        <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  status === tab.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Referral Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredReferrals.length}
            </span>{" "}
            referral
            {filteredReferrals.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Referral List */}
        {filteredReferrals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No referrals found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Create your first external job referral to begin building the
              referral engine.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/jobs/referrals/create")
              }
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Referral
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReferrals.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Top Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          job.status,
                        )}`}
                      >
                        {getStatusLabel(job.status)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {job.company}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {job.location} · {job.type}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-400">
                      Referral ID
                    </p>

                    <p className="text-sm font-semibold text-gray-700">
                      {job.id}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {job.description}
                </p>

                {/* Metadata */}
                <div className="mt-5 grid gap-3 border-t border-gray-100 pt-4 text-sm md:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      Category
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {job.category || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Source
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {job.source || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Verification
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {job.verificationStatus}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {job.expiryDate ? (
                      <p className="text-xs text-gray-500">
                        Expiry: {job.expiryDate}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        No expiry date set
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/dashboard/jobs/referrals/${job.id}`,
                      )
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    View Opportunity
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobReferrals;
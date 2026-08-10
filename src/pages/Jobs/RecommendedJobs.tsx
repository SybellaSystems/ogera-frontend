import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { JobReferral } from "../../type/jobs/referral";
import { getReferrals } from "../../services/referralStorage";

const RecommendedJobs: React.FC = () => {
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState<JobReferral[]>([]);

  useEffect(() => {
    const allReferrals = getReferrals();

    const activeReferrals = allReferrals.filter(
      (referral) => referral.status === "active",
    );

    setReferrals(activeReferrals);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Recommended Jobs
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Job opportunities verified and shared by the Ogera team.
          </p>
        </div>

        {/* Information */}
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-800">
            These opportunities are sourced from external employers and
            platforms. Ogera verifies the opportunities before sharing them
            with students. Applications are completed on the original
            employer or job platform.
          </p>
        </div>

        {/* Empty State */}
        {referrals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No recommended jobs available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              The Ogera team is currently looking for opportunities that may
              be suitable for students.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {job.company}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {job.location} · {job.type}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Verified
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {job.description}
                </p>

                <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {job.category || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Source
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {job.source || "External employer"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Deadline
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {job.expiryDate || "See original posting"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/dashboard/jobs/recommended/${job.id}`,
                      )
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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

export default RecommendedJobs;
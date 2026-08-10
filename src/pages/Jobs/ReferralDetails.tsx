import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { JobReferral } from "../../type/jobs/referral";
import {
  getReferrals,
  saveReferral,
} from "../../services/referralStorage";

const ReferralDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [referral, setReferral] = useState<JobReferral | null>(null);

  useEffect(() => {
    if (!id) return;

    const referrals = getReferrals();
    const found = referrals.find((item) => item.id === id);

    setReferral(found ?? null);
  }, [id]);

  const updateStatus = (newStatus: JobReferral["status"]) => {
    if (!referral) return;

    const updatedReferral: JobReferral = {
      ...referral,
      status: newStatus,
    };

    saveReferral(updatedReferral);
    setReferral(updatedReferral);
  };

  if (!referral) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/jobs/referrals")
            }
            className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Job Referrals
          </button>

          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Referral Not Found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              The referral you are looking for does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate("/dashboard/jobs/referrals")
          }
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Job Referrals
        </button>

        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {referral.title}
                </h1>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {referral.status}
                </span>
              </div>

              <p className="mt-2 text-base font-medium text-gray-700">
                {referral.company}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {referral.location} · {referral.type}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-gray-400">
                Referral ID
              </p>

              <p className="font-semibold text-gray-700">
                {referral.id}
              </p>
            </div>
          </div>
        </div>

        {/* Main Information */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Opportunity Description
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
                {referral.description || "No description provided."}
              </p>
            </section>

            {/* Verification */}
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Verification
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-400">
                    Verification Status
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {referral.verificationStatus}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Permission Status
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {referral.permissionStatus}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-gray-400">
                    Verification Notes
                  </p>

                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {referral.verificationNotes ||
                      "No verification notes added."}
                  </p>
                </div>
              </div>
            </section>

            {/* Source */}
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Original Opportunity
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Source: {referral.source}
              </p>

              <a
                href={referral.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Open Original Job Post
              </a>
            </section>
          </div>

          {/* Admin Controls */}
          <aside>
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Controls
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                A referral must be verified before it is activated for
                students.
              </p>

              <div className="mt-6 space-y-3">
                {referral.status !== "verified" &&
                  referral.status !== "active" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus("verified")
                      }
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Mark as Verified
                    </button>
                  )}

                {referral.status === "verified" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus("active")
                    }
                    className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Activate Referral
                  </button>
                )}

                {referral.status === "active" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus("closed")
                    }
                    className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Close Referral
                  </button>
                )}
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-400">
                  Created
                </p>

                <p className="mt-1 text-sm text-gray-700">
                  {new Date(
                    referral.createdAt,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-400">
                  Category
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {referral.category || "Not specified"}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-400">
                  Expiry
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {referral.expiryDate || "No expiry date"}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetails;
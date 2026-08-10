import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { JobReferral } from "../../type/jobs/referral";
import {
  getReferrals,
  incrementReferralViews,
  incrementReferralApplyClicks,
  reportReferralApplication,
} from "../../services/referralStorage";

const RecommendedJobDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [referral, setReferral] = useState<JobReferral | null>(null);
  const [reportedApplication, setReportedApplication] =
    useState(false);

  useEffect(() => {
    if (!id) return;

    const referrals = getReferrals();

    const found = referrals.find(
      (item) =>
        item.id === id &&
        item.status === "active",
    );

    if (found) {
      setReferral(found);

      incrementReferralViews(id);
    } else {
      setReferral(null);
    }
  }, [id]);

  const handleApplyClick = () => {
    if (!referral) return;

    incrementReferralApplyClicks(referral.id);
  };

  const handleReportApplication = () => {
    if (!referral || reportedApplication) return;

    reportReferralApplication(referral.id);

    setReportedApplication(true);
  };

  if (!referral) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/jobs/recommended")
            }
            className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Recommended Jobs
          </button>

          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">
              Opportunity Not Available
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              This opportunity may have been closed or is no longer
              available.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/jobs/recommended")
              }
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View Recommended Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() =>
            navigate("/dashboard/jobs/recommended")
          }
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Recommended Jobs
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {referral.title}
              </h1>

              <p className="mt-2 text-base font-medium text-gray-700">
                {referral.company}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {referral.location} · {referral.type}
              </p>
            </div>

            <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Verified by Ogera
            </span>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              About this opportunity
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
              {referral.description}
            </p>
          </div>

          {/* Opportunity Information */}
          <div className="mt-8 grid gap-5 border-t border-gray-100 pt-6 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">
                Category
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {referral.category || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Source
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {referral.source || "External employer"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Deadline
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {referral.expiryDate || "Check original posting"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Referral Status
              </p>

              <p className="mt-1 text-sm font-medium capitalize text-green-700">
                {referral.status}
              </p>
            </div>
          </div>

          {/* External Application Notice */}
          <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm leading-6 text-yellow-800">
              You will complete your application on the original
              employer or job platform. Ogera does not collect your
              application for this opportunity.
            </p>
          </div>

          {/* Application Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={referral.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Apply on Original Site
            </a>

            <button
              type="button"
              onClick={handleReportApplication}
              disabled={reportedApplication}
              className={`rounded-lg border px-5 py-3 text-sm font-semibold transition ${
                reportedApplication
                  ? "cursor-not-allowed border-green-200 bg-green-50 text-green-600"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
            >
              {reportedApplication
                ? "Application Reported"
                : "I Applied"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/jobs/recommended")
              }
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Opportunities
            </button>
          </div>

          {/* Application confirmation */}
          {reportedApplication && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Thank you. Your application has been recorded.
              </p>

              <p className="mt-1 text-sm text-green-700">
                This helps the Ogera team understand which opportunities
                are useful to students.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendedJobDetails;
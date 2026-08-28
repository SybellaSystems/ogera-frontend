
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BuildingOffice2Icon,
  MapPinIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

import {
  useGetJobReferralByIdQuery,
  useIncrementJobReferralCounterMutation,
} from "../../services/api/jobReferralsApi";

const RecommendedJobDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [reportedApplication, setReportedApplication] =
    useState(false);

  /*
   * Get referral directly from backend.
   *
   * No localStorage is used.
   */
  const {
    data,
    isLoading,
    isError,
  } = useGetJobReferralByIdQuery(id!, {
    skip: !id,
  });

  /*
   * Single counter mutation.
   *
   * Backend route:
   * POST /job-referrals/:referral_id/counter
   *
   * Supported types:
   * - views_count
   * - apply_clicks
   * - reported_applications
   */
  const [incrementCounter] =
    useIncrementJobReferralCounterMutation();

  /*
   * Prevent the view counter from being incremented
   * multiple times during the same page visit.
   */
  const viewRecordedRef = useRef(false);

  const referral = data?.data;

  /*
   * Record a view once when the referral is successfully loaded.
   */
  useEffect(() => {
    if (
      !referral ||
      !id ||
      viewRecordedRef.current
    ) {
      return;
    }

    /*
     * Student should only be able to view referrals that are:
     *
     * Active
     * Verified
     * Approved
     */
    if (
      referral.status !== "Active" ||
      referral.verification_status !== "Verified" ||
      referral.permission_status !== "Approved"
    ) {
      return;
    }

    viewRecordedRef.current = true;

    incrementCounter({
      referralId: referral.referral_id,
      type: "views_count",
    })
      .unwrap()
      .catch((error) => {
        console.error(
          "Failed to record referral view:",
          error,
        );
      });
  }, [
    referral,
    id,
    incrementCounter,
  ]);

  /*
   * Handle Apply button.
   */
  const handleApplyClick = () => {
    if (!referral) return;

    incrementCounter({
      referralId: referral.referral_id,
      type: "apply_clicks",
    })
      .unwrap()
      .catch((error) => {
        console.error(
          "Failed to record referral apply click:",
          error,
        );
      });
  };

  /*
   * Handle "I Applied".
   */
  const handleReportApplication = () => {
    if (
      !referral ||
      reportedApplication
    ) {
      return;
    }

    incrementCounter({
      referralId: referral.referral_id,
      type: "reported_applications",
    })
      .unwrap()
      .then(() => {
        /*
         * Keep the existing UI behavior.
         */
        setReportedApplication(true);
      })
      .catch((error) => {
        console.error(
          "Failed to report application:",
          error,
        );
      });
  };

  /*
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard/jobs/recommended",
              )
            }
            className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Recommended Jobs
          </button>

          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading opportunity...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * API error or referral not found
   */
  if (
    isError ||
    !referral
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard/jobs/recommended",
              )
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
                navigate(
                  "/dashboard/jobs/recommended",
                )
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

  /*
   * Extra frontend protection.
   *
   * The backend should already restrict students to:
   * Active + Verified + Approved.
   */
  if (
    referral.status !== "Active" ||
    referral.verification_status !== "Verified" ||
    referral.permission_status !== "Approved"
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard/jobs/recommended",
              )
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
                navigate(
                  "/dashboard/jobs/recommended",
                )
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
    <div className="min-h-screen overflow-x-hidden bg-slate-50 px-3 py-5 sm:px-6 sm:py-6 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard/jobs/recommended",
            )
          }
          className="mb-6 inline-flex text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
        >
          ← Back to Recommended Jobs
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex min-w-0 flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="wrap-break-word text-2xl -mt-2 font-bold tracking-tight text-slate-900 md:text-3xl">
                {referral.title}
              </h1>

             <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-6">
                  {/* Company */}
                  <div className="flex items-center gap-2">
                    <BuildingOffice2Icon className="h-4 w-4 text-purple-500" />
                    <span className="min-w-0 wrap-break-word text-lg font-medium text-gray-700">
                      {referral.company}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-purple-500" />
                    <span className="min-w-0 wrap-break-word text-lg text-gray-600">
                      {referral.location}
                    </span>
                  </div>

                  {/* Job Type */}
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="h-4 w-4 text-purple-500" />
                    <span className="min-w-0 wrap-break-word text-lg text-gray-600">{referral.employment_type || "Not specified"}</span>
                  </div>
                </div>
            </div>

            <span className="w-fit max-w-full rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              Verified by Ogera
            </span>
          </div>

          <div className="mt-8 grid items-stretch gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Description */}
          <div className="order-2 grid min-h-0 grid-rows-[auto_minmax(0,1fr)] p-0 lg:order-2 lg:h-full lg:p-5">
            <h2 className="text-lg font-bold text-slate-800">
              About this opportunity
            </h2>

            <p className="mt-3 h-auto min-h-0 overflow-y-visible rounded-xl border border-purple-200 bg-purple-50 px-4 py-4 whitespace-pre-line wrap-break-word text-sm leading-7 text-slate-600 lg:h-full lg:overflow-y-auto">
              {referral.description}
            </p>
          </div>

          {/* Opportunity Information */}
          <div className="order-1 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:order-1">
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Category
              </p>

                <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-700">
                {referral.category ||
                  "Not specified"}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source
              </p>

                <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-700">
                {referral.source ||
                  "External employer"}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Deadline
              </p>

                <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-700">
                {referral.expiry_date ? referral.expiry_date.split("T")[0] : "Check original posting"}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Referral Status
              </p>

                <p className="mt-2 wrap-break-word text-sm font-semibold capitalize text-green-600">
                {referral.status}
              </p>
            </div>
          </div>
          </div>

          {/* External Application Notice */}
          <div className="mt-8 rounded-xl border border-purple-200 bg-purple-100 p-4">
            <p className="wrap-break-word text-sm leading-6 text-purple-800">
              You will complete your application on the original
              employer or job platform. Ogera does not collect your
              application for this opportunity.
            </p>
          </div>

          {/* Application Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={
                referral.original_url ||
                "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
            >
              Apply on Original Site
            </a>

            <button
              type="button"
              onClick={handleReportApplication}
              disabled={reportedApplication}
              className={`w-full rounded-lg border px-5 py-3 text-sm font-semibold transition sm:w-auto ${
                reportedApplication
                  ? "cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              {reportedApplication
                ? "Application Reported"
                : "I Applied"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard/jobs/recommended",
                )
              }
              className="w-full rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Back to Opportunities
            </button>
          </div>

          {/* Application confirmation */}
          {reportedApplication && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">
                Thank you. Your application has been recorded.
              </p>

              <p className="mt-1 text-sm text-emerald-700">
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
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useGetJobReferralByIdQuery,
  useUpdateJobReferralVerificationMutation,
  useUpdateJobReferralStatusMutation,
} from "../../services/api/jobReferralsApi";

import {
  BuildingOffice2Icon,
  MapPinIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

import type { JobReferral } from "../../services/api/jobReferralsApi";
import { getStatusClasses, getStatusLabel } from "../../components/StatusLabels";
import type { ReferralFilter } from "../../components/StatusLabels";


type UiReferralStatus = ReferralFilter;

// type UiReferralStatus =
//   | "draft"
//   | "pending"
//   | "verified"
//   | "active"
//   | "closed"
//   | "rejected"
//   | "expired";

interface UiReferral {
  id: string;

  // User-facing referral ID
  createdReferralId: string;

  title: string;
  company: string;
  location: string;
  type: string;

  category?: string | null;
  description?: string | null;

  source?: string | null;
  originalUrl?: string | null;

  verificationStatus: string;
  permissionStatus: string;
  verificationNotes?: string | null;

  expiryDate?: string | null;

  status: UiReferralStatus;

  createdAt: string;

  views: number;
  applyClicks: number;
  reportedApplications: number;
}

const ReferralDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  /*
   * Get referral directly from backend.
   *
   * No localStorage is used anymore.
   */
  const { data, isLoading, isError } = useGetJobReferralByIdQuery(id ?? "", {
    skip: !id,
  });

  /*
   * Backend mutation for verification / permission.
   */
  const [updateVerification, { isLoading: isUpdatingVerification }] =
    useUpdateJobReferralVerificationMutation();

  /*
   * Backend mutation for Active / Inactive status.
   */
  const [updateStatusMutation, { isLoading: isUpdatingStatus }] =
    useUpdateJobReferralStatusMutation();

  /*
   * Convert backend referral structure to the structure
   * expected by the existing UI.
   *
   * This does NOT change the UI.
   */
  const referral: UiReferral | null = React.useMemo(() => {
    if (!data?.data) {
      return null;
    }

    const apiReferral: JobReferral = data.data;

    let uiStatus: UiReferralStatus;

    /*
     * The backend has separate:
     *
     * verification_status:
     * Pending | Verified | Rejected
     *
     * status:
     * Active | Inactive | Expired
     *
     * The old UI had:
     *
     * draft
     * pending_verification
     * verified
     * active
     * closed
     * rejected
     * expired
     */

    if (apiReferral.verification_status === "Rejected") {
      uiStatus = "Rejected";
    } else if (apiReferral.status === "Closed") {
      uiStatus = "Closed";
    } else if (apiReferral.status === "Active") {
      uiStatus = "Active";
    } else if (apiReferral.status === "Verified") {
      uiStatus = "Verified";
    } else {
      uiStatus = "Pending";
    }

    return {
      id: apiReferral.referral_id,

      createdReferralId: apiReferral.created_referral_id,

      title: apiReferral.title,
      company: apiReferral.company,
      location: apiReferral.location,

      type: apiReferral.employment_type || "Not specified",

      category: apiReferral.category,
      description: apiReferral.description,

      source: apiReferral.source,
      originalUrl: apiReferral.original_url,

      verificationStatus: apiReferral.verification_status,

      permissionStatus: apiReferral.permission_status,

      verificationNotes: apiReferral.verification_notes,

      expiryDate: apiReferral.expiry_date,

      status: uiStatus,

      createdAt: apiReferral.created_at,

      views: apiReferral.views_count,
      applyClicks: apiReferral.apply_clicks,
      reportedApplications: apiReferral.reported_applications,
    };
  }, [data]);
console.log(referral, "referral");
  /*
   * Mark referral as verified.
   *
   * This now updates the database instead of localStorage.
   */
  const handleMarkAsVerified = async () => {
    if (!id) return;

    try {
      await updateVerification({
        referralId: id,
        data: {
          verification_status: "Verified",
          permission_status: "Approved",
          
        },
      }).unwrap();
      await updateStatusMutation({
        referralId: id,
        status: "Verified",
      }).unwrap();
    } catch (error) {
      console.error("Failed to verify referral:", error);

      toast.error("Failed to verify referral. Please try again.");
    }
  };

  /*
   * Activate referral.
   *
   * This updates the backend status to Active.
   */
  const handleActivate = async () => {
    if (!id) return;

    try {
      await updateStatusMutation({
        referralId: id,
        status: "Active",
      }).unwrap();
    } catch (error) {
      console.error("Failed to activate referral:", error);

      toast.error("Failed to activate referral. Please try again.");
    }
  };

  /*
   * Close referral.
   *
   * Backend uses Inactive instead of the old
   * frontend "closed" status.
   */
  const handleClose = async () => {
    if (!id) return;

    try {
      await updateStatusMutation({
        referralId: id,
        status: "Closed",
      }).unwrap();
    } catch (error) {
      console.error("Failed to close referral:", error);

      toast.error("Failed to close referral. Please try again.");
    }
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
            onClick={() => navigate("/dashboard/jobs/referrals")}
            className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Job Referrals
          </button>

          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">Loading referral...</p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Error / referral not found
   */
  if (isError || !referral) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate("/dashboard/jobs/referrals")}
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

  const isUpdating = isUpdatingVerification || isUpdatingStatus;

  return (
    // <div className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto max-w-8xl">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/dashboard/jobs/referrals")}
        className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        ← Back to Job Referrals
      </button>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-gray-200 bg-white pt-3 pl-6 pr-6 pb-3 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {referral.title}
                  </h1>

                   <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                    referral.status,
                                  )}`}
                                >
                                  {getStatusLabel(referral.status)}
                                </span>
                </div>

  {/* {referral.status} */}
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Company */}
                  <div className="flex items-center gap-2">
                    <BuildingOffice2Icon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {referral.company}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">
                      {referral.location}
                    </span>
                  </div>

                  {/* Job Type */}
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">{referral.type}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-xs text-gray-400">Referral ID</p>

                <p className="text-sm font-medium text-gray-300">{referral.createdReferralId}</p>
              </div>
            </div>
          </div>

          {/* Main Information */}
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Verification */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 pt-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Verification
              </h2>

              <div className="mt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-16">
                  <div>
                    <p className="text-xs text-gray-400">Verification Status</p>

                    <p className="mt-1 font-medium text-gray-800">
                      {referral.verificationStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 pl-5">Permission Status</p>

                    <p className="mt-1 font-medium text-gray-800 pl-5">
                      {referral.permissionStatus}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs text-gray-400">Verification Notes</p>

                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {referral.verificationNotes || "No verification notes added."}
                  </p>
                </div>
              </div>
            </section>

            {/* Source */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 pt-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Original Opportunity
              </h2>

              <div>
                <p className="mt-5 text-xs text-gray-400">Source</p>

                <p className="mt-1 font-medium text-gray-700">
                  {referral.source || "Not specified"}
                </p>
              </div>

              {referral.originalUrl && (
                <a
                  href={referral.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                >
                  Open Original Job Post
                </a>
              )}
            </section>
          </div>

        </div>

        {/* Admin Controls */}
        <aside className="self-start">
          <section className="rounded-xl border border-gray-200 bg-white p-6 pt-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Admin Controls
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              A referral must be verified before it is activated for students.
            </p>

            <div className="mt-6 space-y-3">
              {/* Verify */}
              {referral.status !== "Verified" &&
                referral.status !== "Active" &&
                (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleMarkAsVerified}
                    className="w-full rounded-lg bg-purple-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:ring-offset-2 active:bg-[#a995df] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdatingVerification
                      ? "Verifying..."
                      : "Mark as Verified"}
                  </button>
                )}

              {/* Activate */}
              {referral.status === "Verified" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleActivate}
                  className="w-full rounded-lg bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/40 focus:ring-offset-2 active:bg-[#7f56d9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Activating..." : "Activate Referral"}
                </button>
              )}

              {/* Close */}
              {referral.status === "Active" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleClose}
                  className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/50 focus:ring-offset-2 active:bg-[#5b3ba5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Closing..." : "Close Referral"}
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Created</p>

                <p className="mt-1 text-sm text-gray-700">
                  {new Date(referral.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Category</p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {referral.category || "Not specified"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-gray-400">Expiry</p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {referral.expiryDate
                  ? new Date(referral.expiryDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "No expiry date"}
              </p>
            </div>
          </section>
        </aside>
      </div>

      {/* Description */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 pt-3">
        <h2 className="text-lg font-semibold -translate-y-1 text-gray-900">
          Description
        </h2>

        <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
          {referral.description || "No description provided."}
        </p>
      </section>
    </div>
    // </div>
  );
};

export default ReferralDetails;


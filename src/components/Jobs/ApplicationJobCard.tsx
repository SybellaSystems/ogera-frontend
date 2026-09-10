import React from "react";
import {
  BriefcaseIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

import TrustScoreCard from "../TrustScoreCard";
import { StudentBadgeChip } from "../Profile/StudentBadgeCard";
import type { TrustScore } from "../../services/api/trustScoreApi";

interface ApplicationJobCardProps {
  application: any;

  isUpdating: boolean;
  updatingId: string | null;

  onStatusUpdate: (
    applicationId: string,
    status: "Accepted" | "Rejected",
  ) => void;

  onViewResume: (resumeUrl: string) => void;

  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;

  formatDate: (dateString: string) => string;

  trustScoreFromStudentUser: (student: any) => TrustScore | null;

  t: (key: string) => string;
}

const ApplicationJobCard: React.FC<ApplicationJobCardProps> = ({
  application,
  isUpdating,
  updatingId,
  onStatusUpdate,
  onViewResume,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  formatDate,
  trustScoreFromStudentUser,
  t,
}) => {
  const trustScore = application.student
    ? trustScoreFromStudentUser(application.student)
    : null;

  return (
    <div
      key={application.application_id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all overflow-hidden group"
    >
      {/* Status Bar */}
      <div
        className={`h-1.5 ${
          application.status === "Accepted"
            ? "bg-green-500"
            : application.status === "Rejected"
              ? "bg-red-500"
              : "bg-orange-500"
        }`}
      />

      <div className="p-4">
        {/* Student Info Section */}
        <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="h-11 w-11 rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:shadow-md transition-shadow">
            {application.student?.full_name?.charAt(0) || "S"}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate flex items-center gap-2 flex-wrap">
              {application.student?.full_name ||
                t("pages.jobs.unknownStudent")}

              {application.student?.badge && (
                <StudentBadgeChip badge={application.student.badge} />
              )}
            </h3>

            <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
              <EnvelopeIcon className="h-3 w-3 text-gray-400 shrink-0" />

              <span className="truncate">
                {application.student?.email ||
                  t("pages.jobs.noEmail")}
              </span>
            </div>

            {application.student?.mobile_number && (
              <p className="text-xs text-gray-600">
                📞 {application.student.mobile_number}
              </p>
            )}

            {trustScore ? (
              <div className="mt-1">
                <TrustScoreCard
                  variant="compact"
                  trustScore={trustScore}
                />
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                {t("pages.jobs.trustScoreNotCalculated")}
              </p>
            )}
          </div>
        </div>

        {/* Job Details Section */}
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
          {/* Job Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BriefcaseIcon className="h-4 w-4 text-purple-600 shrink-0" />

              <span className="text-gray-700 font-semibold text-sm">
                {application.job?.job_title ||
                  t("pages.jobs.unknownJob")}
              </span>
            </div>
          </div>

          {/* Location + Budget */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />

              <span className="text-gray-600 truncate">
                {application.job?.location || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />

              <span className="text-gray-600">
                $
                {application.job?.budget?.toLocaleString() || "N/A"}
              </span>
            </div>
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                {t("pages.jobs.coverLetter")}
              </p>

              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {application.cover_letter}
              </p>
            </div>
          )}

          {/* Resume */}
          {application.resume_url && (
            <button
              onClick={() => onViewResume(application.resume_url!)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-500 font-semibold rounded-lg transition-colors text-xs border border-blue-200"
            >
              <DocumentTextIcon className="h-4 w-4" />

              {t("pages.jobs.viewResume")}
            </button>
          )}
        </div>

        {/* Footer Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {/* Status + Dates */}
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(application.status)}

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                  application.status,
                )}`}
              >
                {getStatusLabel(application.status)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ClockIcon className="h-3 w-3" />

              <span>{formatDate(application.applied_at)}</span>
            </div>

            {application.reviewed_at && (
              <p className="text-xs text-gray-500">
                ✓ {t("pages.jobs.reviewed")}:{" "}
                {formatDate(application.reviewed_at)}
              </p>
            )}
          </div>

          {/* Accept / Reject */}
          {application.status === "Pending" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() =>
                  onStatusUpdate(
                    application.application_id,
                    "Accepted",
                  )
                }
                disabled={
                  isUpdating &&
                  updatingId ===
                    `${application.application_id}_Accepted`
                }
                className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition text-xs whitespace-nowrap cursor-pointer"
              >
                {isUpdating &&
                updatingId ===
                  `${application.application_id}_Accepted`
                  ? t("pages.jobs.updating")
                  : t("pages.jobs.accept")}
              </button>

              <button
                onClick={() =>
                  onStatusUpdate(
                    application.application_id,
                    "Rejected",
                  )
                }
                disabled={
                  isUpdating &&
                  updatingId ===
                    `${application.application_id}_Rejected`
                }
                className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition text-xs whitespace-nowrap cursor-pointer"
              >
                {isUpdating &&
                updatingId ===
                  `${application.application_id}_Rejected`
                  ? t("pages.jobs.updating")
                  : t("pages.jobs.reject")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationJobCard;


import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { formatRelativeTime } from "../../utils/timeUtils";

interface MyApplicationJobCardProps {
  application: any;
  onViewDetails: (jobId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Accepted":
      return "from-green-500 to-emerald-500";
    case "Rejected":
      return "from-red-500 to-pink-500";
    case "Pending":
      return "from-amber-500 to-orange-500";
    default:
      return "from-gray-500 to-slate-500";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Accepted":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "Pending":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Accepted":
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    case "Rejected":
      return <XCircleIcon className="h-5 w-5 text-red-600" />;
    case "Pending":
      return <ClockIcon className="h-5 w-5 text-orange-600" />;
    default:
      return null;
  }
};

const MyApplicationJobCard: React.FC<MyApplicationJobCardProps> = ({
  application,
  onViewDetails,
}) => {
  const employerName =
    application.job?.employer?.full_name || "Unknown Employer";
  const companyInitial = employerName.charAt(0).toUpperCase();
  const statusGradient = getStatusColor(application.status);

  return (
    <div
      className="h-full bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
      onClick={() => onViewDetails(application.job_id)}
    >
      <div className={`h-1 bg-linear-to-r ${statusGradient}`} />

      <div className="flex flex-col h-full flex-1 p-5">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div
              className={`h-12 w-12 rounded-lg bg-linear-to-br ${statusGradient} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow`}
            >
              {companyInitial}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-purple-600 hover:text-purple-800 truncate">
                    {application.job?.job_title || "Unknown Job"}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${getStatusBadgeColor(
                      application.status,
                    )}`}
                  >
                    {getStatusIcon(application.status)}
                    {application.status}
                  </span>
                </div>
                <p className="text-gray-700 font-medium text-sm">
                  {employerName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                {application.job?.location || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                ${application.job?.budget?.toLocaleString() || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                Applied {formatRelativeTime(application.applied_at)}
              </span>
              {application.reviewed_at && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Reviewed {formatRelativeTime(application.reviewed_at)}
                </span>
              )}
            </div>

            {application.cover_letter && (
              <div className="p-3 bg-gray-50 rounded-lg mb-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Your Cover Letter:
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {application.cover_letter}
                </p>
              </div>
            )}

            <div className="mt-auto pt-4 flex gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onViewDetails(application.job_id);
                }}
                className="px-4 py-2 w-30px bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-sm text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRightIcon className="h-4 w-4" />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplicationJobCard;

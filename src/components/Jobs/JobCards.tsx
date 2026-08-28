import {
  BuildingOffice2Icon,
  MapPinIcon,
  BriefcaseIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  getStatusClasses,
  getStatusLabel,
} from "../../../src/components/StatusLabels";
interface JobCardsProps {
  jobs: any[];
  detailsPath?: string;
}
const JobCards: React.FC<JobCardsProps> = ({ jobs, detailsPath = "/dashboard/jobs/referrals", }) => {
  const navigate = useNavigate();
  return (
<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {jobs.map((job) => (
    <div
      key={job.referral_id}
      className="flex h-full min-w-0 flex-col space-y-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* Header */}
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h2 className="min-w-0 break-words text-lg font-semibold text-gray-900">
            {job.title}
          </h2>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
              job.status,
            )}`}
          >
            {getStatusLabel(job.status)}
          </span>
        </div>

        {/* Referral ID */}
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:mt-1.5">
          <IdentificationIcon className="h-4 w-4 shrink-0 text-purple-500" />

          <span className="break-all text-xs font-medium text-gray-400">
            {job.created_referral_id}
          </span>
        </div>
      </div>

      {/* Company / Location / Job Type */}
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
        {/* Company */}
        <div className="flex min-w-0 items-center gap-2">
          <BuildingOffice2Icon className="h-4 w-4 shrink-0 text-purple-500" />

          <span className="min-w-0 break-words text-sm font-medium text-gray-700">
            {job.company}
          </span>
        </div>

        {/* Location */}
        <div className="flex min-w-0 items-center gap-2">
          <MapPinIcon className="h-4 w-4 shrink-0 text-purple-500" />

          <span className="min-w-0 break-words text-sm text-gray-600">
            {job.location}
          </span>
        </div>

        {/* Job Type */}
        <div className="flex min-w-0 items-center gap-2">
          <BriefcaseIcon className="h-4 w-4 shrink-0 text-purple-500" />

          <span className="min-w-0 break-words text-sm text-gray-600">
            {job.employment_type}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mt-1 min-w-0">
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
          Description
        </p>

        <div className="w-full overflow-hidden rounded-lg border border-[#D6BBFB] bg-[#F9F5FF] px-3 py-1.5 sm:px-4">
          <p className="line-clamp-1 break-words text-sm leading-6 text-gray-600">
            {job.description || "No description available"}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid min-w-0 grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:grid-cols-3">
        {/* Category */}
        <div className="min-w-0">
          <p className="text-xs text-gray-400">Category</p>

          <p className="mt-1 break-words font-medium text-gray-700">
            {job.category || "Not specified"}
          </p>
        </div>

        {/* Source */}
        <div className="min-w-0">
          <p className="text-xs text-gray-400">Source</p>

          <p className="mt-1 break-words font-medium text-gray-700">
            {job.source || "Not specified"}
          </p>
        </div>

        {/* Verification */}
        <div className="min-w-0">
          <p className="text-xs text-gray-400">Verification</p>

          <p className="mt-1 break-words font-medium text-gray-700">
            {job.verification_status || "Not specified"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Expiry Date */}
        <div className="min-w-0">
          {job.expiry_date ? (
            <p className="break-words text-xs text-gray-500">
              Expiry: {job.expiry_date.split("T")[0]}
            </p>
          ) : (
            <p className="text-xs text-gray-400">No expiry date set</p>
          )}
        </div>

        {/* View Opportunity Button */}
        <button
          type="button"
          onClick={() => {
            navigate(`${detailsPath}/${job.referral_id}`);
          }}
          className="w-full shrink-0 rounded-lg bg-[#9333EA] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7E22CE] sm:w-auto"
        >
          View Opportunity
        </button>
      </div>
    </div>
  ))}
</div>


  );
};

export default JobCards;

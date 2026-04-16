import React from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useGetMyInterviewsQuery, type InterviewItem } from "../services/api/interviewsApi";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const relativeTime = (iso: string) => {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0) return "Past";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return formatDate(iso);
};

const statusBadge = (status: InterviewItem["status"]) => {
  const styles: Record<InterviewItem["status"], string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
};

const InterviewCard: React.FC<{ item: InterviewItem; isUpcoming: boolean }> = ({ item, isUpcoming }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#f5f3ff] rounded-lg">
            <CalendarDaysIcon className="h-5 w-5 text-[#7f56d9]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{formatDate(item.scheduled_at)}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {formatTime(item.scheduled_at)}
              {isUpcoming && (
                <span className="ml-2 text-[#7f56d9] font-semibold">{relativeTime(item.scheduled_at)}</span>
              )}
            </p>
          </div>
        </div>
        {statusBadge(item.status)}
      </div>

      {item.job ? (
        <div className="border-t border-gray-100 pt-3 mt-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <BriefcaseIcon className="h-4 w-4 text-gray-400" />
            {item.job.job_title}
          </div>
          {item.job.employer?.full_name && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <BuildingOfficeIcon className="h-3.5 w-3.5 text-gray-400" />
              {item.job.employer.full_name}
            </div>
          )}
          {item.job.location && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
              {item.job.location}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic mt-2">Job details unavailable</p>
      )}

      {item.notes && (
        <p className="text-xs text-gray-600 mt-3 p-2 bg-gray-50 rounded border border-gray-100">
          <span className="font-semibold">Notes:</span> {item.notes}
        </p>
      )}
    </div>
  );
};

const Interviews: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetMyInterviewsQuery();

  const upcoming = data?.data?.upcoming ?? [];
  const past = data?.data?.past ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className="space-y-4 animate-fadeIn max-w-5xl">
      <div className="bg-[#7f56d9] rounded-lg p-4 text-white shadow-sm">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5" />
          {t("interviews.title", "My Interviews")}
        </h1>
        <p className="text-xs text-white/80 mt-0.5">
          {t("interviews.subtitle", "Track your scheduled and past interviews with employers")}
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-200">
          Loading interviews...
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-4 text-sm text-red-700 border border-red-200">
          Failed to load interviews. Please try again.
        </div>
      ) : total === 0 ? (
        <div className="bg-white rounded-lg p-10 text-center border border-gray-200">
          <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">
            {t("interviews.emptyTitle", "No interviews yet")}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t("interviews.emptyHint", "Keep applying — employers will reach out when they want to interview you.")}
          </p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              {t("interviews.upcoming", "Upcoming")}
              <span className="text-xs font-normal text-gray-400">({upcoming.length})</span>
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-xs text-gray-500 italic mb-4">No upcoming interviews.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {upcoming.map((i) => (
                  <InterviewCard key={i.id} item={i} isUpcoming />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                {t("interviews.past", "Past")}
                <span className="text-xs font-normal text-gray-400">({past.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {past.map((i) => (
                  <InterviewCard key={i.id} item={i} isUpcoming={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Interviews;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useGetCompletedJobsQuery } from "../../services/api/jobsApi";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const Completed: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCompletedJobsQuery();

  const completedJobs = data?.data || [];

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            {t("pages.jobs.failedToLoadCompleted")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <CheckCircleIcon className="h-10 w-10 text-blue-600" />
          {t("pages.jobs.completedJobsTitle")}
        </h1>
        <p className="text-gray-500 mt-2">{t("pages.jobs.completedSubtitle")}</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <p className="text-blue-800 font-medium">{t("pages.jobs.jobsCompletedCount", { count: completedJobs.length })}</p>
      </div>

      {completedJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <CheckCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("pages.jobs.noCompletedJobs")}
          </h3>
          <p className="text-gray-600">
            {t("pages.jobs.noCompletedJobsMessage")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t("pages.jobs.jobTitle")}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t("pages.jobs.employer")}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t("pages.jobs.location")}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t("pages.jobs.budget")}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t("pages.jobs.applicants")}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t("pages.jobs.completedDate")}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t("pages.jobs.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedJobs.map((job: any) => {
                const employerName = job.employer?.full_name || t("pages.jobs.unknownEmployer");
                const completedDate = job.updated_at || job.created_at;

                return (
                  <tr key={job.job_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{job.job_title}</td>
                    <td className="px-6 py-4 text-gray-600">{employerName}</td>
                    <td className="px-6 py-4 text-gray-600">{job.location}</td>
                    <td className="px-6 py-4 text-gray-600">${job.budget?.toLocaleString() || t("common.na")}</td>
                    <td className="px-6 py-4 text-gray-600">{job.applications || 0}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {completedDate ? formatRelativeTime(completedDate) : t("common.na")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        {t("pages.jobs.viewDetails")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Completed;


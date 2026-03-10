import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useGetPendingJobsQuery, useToggleJobStatusMutation } from "../../services/api/jobsApi";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const PendingApproval: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const { data, isLoading, error, refetch } = useGetPendingJobsQuery();
  const [toggleStatus, { isLoading: isToggling }] = useToggleJobStatusMutation();

  const pendingJobs = data?.data || [];

  const handleApprove = async (jobId: string) => {
    try {
      await toggleStatus(jobId).unwrap();
      refetch();
    } catch (error: any) {
      console.error("Failed to approve job:", error);
      alert(t("pages.jobs.failedToApprove"));
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            {t("pages.jobs.failedToLoadPendingJobs")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <ClockIcon className="h-10 w-10 text-orange-600" />
          Pending Approval
        </h1>
        <p className="text-gray-500 mt-2">Job postings awaiting admin approval</p>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
        <p className="text-orange-800 font-medium">⚠️ {pendingJobs.length} jobs waiting for approval</p>
      </div>

      {pendingJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No pending jobs
          </h3>
          <p className="text-gray-600">
            There are no job postings awaiting approval at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingJobs.map((job: any) => {
            const employerName = job.employer?.full_name || t("pages.jobs.unknownEmployer");
            const employerEmail = job.employer?.email || t("common.na");

            return (
              <div key={job.job_id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.job_title}</h3>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                        {t("pages.jobs.pendingReview")}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium mb-3">{employerName}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>💰 ${job.budget?.toLocaleString() || t("common.na")}</span>
                      <span>📍 {job.location}</span>
                      {employerEmail && <span>📧 {employerEmail}</span>}
                      {job.created_at && (
                        <span>📅 {t("pages.jobs.submitted")}: {formatRelativeTime(job.created_at)}</span>
                      )}
                      {job.category && <span>🏷️ {job.category}</span>}
                    </div>
                    {job.description && (
                      <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 ml-6">
                    {(role === "superadmin" || role === "admin") && (
                      <>
                        <button
                          onClick={() => handleApprove(job.job_id)}
                          disabled={isToggling}
                          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isToggling ? t("pages.jobs.approving") : t("pages.jobs.approve")}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap"
                    >
                      {t("pages.jobs.viewFullDetails")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingApproval;


import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";

const StudentRejectedApplications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentApplicationsQuery(
    { status: "Rejected" },
    { refetchOnMountOrArgChange: true }
  );

  const applications = data?.data || [];
  const rejectedApplications = applications;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "en" ? "en-US" : i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            {t("pages.jobs.failedToLoadApplications")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page-bg space-y-6 animate-fadeIn min-h-full p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-[var(--theme-text-primary)] flex items-center gap-3">
            <XCircleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
            {t("pages.jobs.rejectedApplicationsTitle")}
          </h1>
          <p className="text-gray-500 dark:text-[var(--theme-text-secondary)] mt-2">
            {t("pages.jobs.rejectedApplicationsSubtitleStudent")}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/my-applications")}
          className=" text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold transition shadow-sm cursor-pointer"
        >
          {t("pages.jobs.viewAllApplications")}
        </button>
      </div>

      {/* Statistics */}
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <p className="text-sm text-red-700 font-medium">
          {t("pages.jobs.totalRejected")}
        </p>
        <p className="text-3xl font-bold text-red-900 mt-2">
          {rejectedApplications.length}
        </p>
      </div>

      {rejectedApplications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <XCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("pages.jobs.noRejectedYet")}
          </h3>
          <p className="text-gray-600 mb-4">
            {t("pages.jobs.noRejectedMessageStudent")}
          </p>
          <button
            onClick={() => navigate("/dashboard/jobs/all")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
          >
            {t("pages.jobs.browseJobs")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rejectedApplications.map((application) => (
            <div
              key={application.application_id}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/jobs/${application.job_id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg">
                      {application.job?.job_title?.charAt(0) || "J"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.job?.job_title ||
                          t("pages.jobs.unknownJob")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.job?.location || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-16 space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        💰 $
                        {application.job?.budget?.toLocaleString() || "N/A"}
                      </span>
                      <span>
                        📍 {application.job?.location || "N/A"}
                      </span>
                    </div>
                    {application.cover_letter && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {t("pages.jobs.yourCoverLetter")}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {t("pages.jobs.appliedLabel")}:{" "}
                        {formatDate(application.applied_at)}
                      </span>
                    </div>
                    {application.reviewed_at && (
                      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                        <XCircleIcon className="h-4 w-4" />
                        <span>
                          {t("pages.jobs.rejectedAtLabel")}:{" "}
                          {formatDate(application.reviewed_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-6">
                  <div className="flex items-center gap-2">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      {t("pages.jobs.rejectedLabel")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentRejectedApplications;

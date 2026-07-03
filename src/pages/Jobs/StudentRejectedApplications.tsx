import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  XCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const StudentRejectedApplications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentApplicationsQuery(
    { status: "Rejected" },
    { refetchOnMountOrArgChange: true },
  );

  const rejectedApplications = data?.data || [];

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 animate-fadeIn">
        <div className="px-6 py-16 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 font-medium">
              {t("pages.jobs.failedToLoadApplications")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-linear-to-br from-red-600 to-rose-600 flex items-center justify-center">
                <XCircleIcon className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {t("pages.jobs.rejectedApplicationsTitle")}
              </h1>
            </div>
            <button
              onClick={() => navigate("/dashboard/jobs/my-applications")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-sm text-sm cursor-pointer"
            >
              {t("pages.jobs.viewAllApplications")}
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            {t("pages.jobs.rejectedApplicationsSubtitleStudent")}
          </p>
        </div>
      </div>

      {/* Statistics Banner */}
      {rejectedApplications.length > 0 && (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="bg-linear-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-900 font-semibold text-base">
                  ✗ {rejectedApplications.length} Rejected Application
                  {rejectedApplications.length !== 1 ? "s" : ""}
                </p>
                <p className="text-red-700 text-sm mt-1">
                  Don't be discouraged. Keep applying and improving your
                  applications!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {rejectedApplications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <XCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("pages.jobs.noRejectedYet")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("pages.jobs.noRejectedMessageStudent")}
            </p>
            <button
              onClick={() => navigate("/dashboard/jobs/all")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md cursor-pointer"
            >
              {t("pages.jobs.browseJobs")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {rejectedApplications.map((application: any) => {
              const employerName =
                application.job?.employer?.full_name || "Unknown Employer";
              const companyInitial = employerName.charAt(0).toUpperCase();

              return (
                <div
                  key={application.application_id}
                  onClick={() =>
                    navigate(`/dashboard/jobs/${application.job_id}`)
                  }
                  className="group w-full h-full bg-white rounded-2xl border border-slate-100 hover:border-red-300 shadow-sm hover:shadow-lg hover:shadow-red-100/40 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Top colored bar - Red for rejected */}
                  <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-400"></div>

                  <div className="flex flex-col h-full p-5">
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                          {companyInitial}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-red-600 hover:text-red-800 truncate">
                                {application.job?.job_title || "Unknown Job"}
                              </h3>
                              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                                <XCircleIcon className="h-3 w-3" />
                                Rejected
                              </span>
                            </div>
                            <p className="text-gray-700 font-medium text-sm">
                              {employerName}
                            </p>
                          </div>
                        </div>

                        {/* Job Info Row */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {application.job?.location || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="h-3.5 w-3.5" />$
                            {application.job?.budget?.toLocaleString() || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Applied {formatRelativeTime(application.applied_at)}
                          </span>
                          {application.reviewed_at && (
                            <span className="flex items-center gap-1 text-red-600 font-semibold">
                              <XCircleIcon className="h-3.5 w-3.5" />
                              Rejected{" "}
                              {formatRelativeTime(application.reviewed_at)}
                            </span>
                          )}
                        </div>

                        {/* Cover Letter Preview */}
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

                        {/* Action Button */}
                        <div className="mt-auto pt-4 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/jobs/${application.job_id}`);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm text-xs flex items-center justify-center gap-2 cursor-pointer"
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRejectedApplications;

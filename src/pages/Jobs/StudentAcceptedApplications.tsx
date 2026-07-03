import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  CheckCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const StudentAcceptedApplications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentApplicationsQuery(
    { status: "Accepted" },
    { refetchOnMountOrArgChange: true }
  );

  const acceptedApplications = data?.data || [];

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
              <div className="h-12 w-12 rounded-lg bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <CheckCircleIcon className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {t("pages.jobs.acceptedApplicationsTitle")}
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
            {t("pages.jobs.acceptedApplicationsSubtitleStudent")}
          </p>
        </div>
      </div>

      {/* Statistics Banner */}
      {acceptedApplications.length > 0 && (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-900 font-semibold text-base">
                  ✓ {acceptedApplications.length} Accepted Application{acceptedApplications.length !== 1 ? "s" : ""}
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Congratulations! These applications have been approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {acceptedApplications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <CheckCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("pages.jobs.noAcceptedYet")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("pages.jobs.noAcceptedMessageStudent")}
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
            {acceptedApplications.map((application: any) => {
              const employerName =
                application.job?.employer?.full_name || "Unknown Employer";
              const companyInitial = employerName.charAt(0).toUpperCase();

              return (
                <div
                  key={application.application_id}
                  className="group w-full h-full bg-white rounded-2xl border border-slate-100 hover:border-green-300 shadow-sm hover:shadow-lg hover:shadow-green-100/40 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/dashboard/jobs/${application.job_id}`)}
                >
                  {/* Top colored bar - Green for accepted */}
                  <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>

                  <div className="flex flex-col h-full p-5">
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                          {companyInitial}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-800 hover:text-green-700 truncate">
                                {application.job?.job_title || "Unknown Job"}
                              </h3>
                              <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                                <CheckCircleIcon className="h-3 w-3" />
                                Accepted
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500">
                              {employerName}
                            </p>
                          </div>
                        </div>

                        {/* Job Info Row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 font-medium mb-4">
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
                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              Accepted {formatRelativeTime(application.reviewed_at)}
                            </span>
                          )}
                        </div>

                        {/* Cover Letter Preview */}
                        {application.cover_letter && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
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
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-green-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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

export default StudentAcceptedApplications;

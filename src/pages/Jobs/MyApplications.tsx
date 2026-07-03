import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const MyApplications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentApplicationsQuery();

  const applications = data?.data || [];

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

  // Calculate statistics
  const pendingCount = applications.filter(
    (app) => app.status === "Pending"
  ).length;
  const acceptedCount = applications.filter(
    (app) => app.status === "Accepted"
  ).length;
  const rejectedCount = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 animate-fadeIn">
        <div className="px-6 py-16 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 font-medium">
              {t("pages.myApplications.failedToLoad")}
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
              <div className="h-12 w-12 rounded-lg bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <BriefcaseIcon className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {t("pages.myApplications.title")}
              </h1>
            </div>
            <button
              onClick={() => navigate("/dashboard/jobs/all")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-sm text-sm cursor-pointer"
            >
              {t("pages.myApplications.browseJobs")}
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            {t("pages.myApplications.subtitle")}
          </p>
        </div>
      </div>

      {/* Statistics */}
      {applications.length > 0 && (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold">
                {t("pages.myApplications.totalApplications")}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {applications.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
              <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">
                {t("pages.jobs.pendingReview")}
              </p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {pendingCount}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
              <p className="text-xs uppercase tracking-wider text-green-700 font-semibold">
                {t("pages.myApplications.accepted")}
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {acceptedCount}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-red-200 hover:shadow-md transition-shadow">
              <p className="text-xs uppercase tracking-wider text-red-700 font-semibold">
                {t("pages.myApplications.rejected")}
              </p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {rejectedCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("pages.myApplications.noApplicationsYet")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("pages.myApplications.startBrowsing")}
            </p>
            <button
              onClick={() => navigate("/dashboard/jobs/all")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md cursor-pointer"
            >
              {t("pages.myApplications.browseJobs")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {applications.map((application: any) => {
              const employerName =
                application.job?.employer?.full_name || "Unknown Employer";
              const companyInitial = employerName.charAt(0).toUpperCase();
              const statusGradient = getStatusColor(application.status);

              return (
                <div
                  key={application.application_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/dashboard/jobs/${application.job_id}`)}
                >
                  {/* Top colored bar */}
                  <div
                    className={`h-1 bg-linear-to-r ${statusGradient}`}
                  ></div>

                  <div className="flex flex-col h-full p-5">
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div
                          className={`h-12 w-12 rounded-lg bg-linear-to-br ${statusGradient} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow`}
                        >
                          {companyInitial}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-purple-600 hover:text-purple-800 truncate">
                                {application.job?.job_title || "Unknown Job"}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${getStatusBadgeColor(
                                  application.status
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

                        {/* Job Info Row */}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;



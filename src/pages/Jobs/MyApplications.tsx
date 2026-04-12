import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";

const MyApplications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentApplicationsQuery();

  const applications = data?.data || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
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
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            {t("pages.myApplications.failedToLoad")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <BriefcaseIcon className="h-10 w-10 text-purple-600" />
            {t("pages.myApplications.title")}
          </h1>
          <p className="text-gray-500 mt-2">
            {t("pages.myApplications.subtitle")}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/all")}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap cursor-pointer"
        >
          {t("pages.myApplications.browseJobs")}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2"> 
  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 hover:shadow-sm transition-shadow">
    <p className="text-xs uppercase tracking-wider text-purple-700 font-semibold">{t("pages.myApplications.totalApplications")}</p>
    <p className="text-2xl font-bold text-purple-900 mt-1">
            {applications.length}
          </p>
        </div>
  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 hover:shadow-sm transition-shadow">
    <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">{t("pages.jobs.pendingReview")}</p>
    <p className="text-2xl font-bold text-orange-900 mt-1">{pendingCount}</p>
        </div>
  <div className="bg-green-50 rounded-xl p-4 border border-green-200 hover:shadow-sm transition-shadow">
    <p className="text-xs uppercase tracking-wider text-green-700 font-semibold">{t("pages.myApplications.accepted")}</p>
    <p className="text-2xl font-bold text-green-900 mt-1">{acceptedCount}</p>
        </div>
  <div className="bg-red-50 rounded-xl p-4 border border-red-200 hover:shadow-sm transition-shadow">
    <p className="text-xs uppercase tracking-wider text-red-700 font-semibold">{t("pages.myApplications.rejected")}</p>
    <p className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("pages.myApplications.noApplicationsYet")}
          </h3>
          <p className="text-gray-600 mb-4">
            {t("pages.myApplications.startBrowsing")}
          </p>
          <button
            onClick={() => navigate("/dashboard/jobs/all")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
          >
            {t("pages.myApplications.browseJobs")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map((application) => (
            <div
              key={application.application_id}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/jobs/${application.job_id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {application.job?.job_title?.charAt(0) || "J"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.job?.job_title || "Unknown Job"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.job?.location || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-16 space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>💰 ${application.job?.budget?.toLocaleString() || "N/A"}</span>
                      <span>📍 {application.job?.location || "N/A"}</span>
                    </div>
                    {application.cover_letter && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Your Cover Letter:
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>Applied: {formatDate(application.applied_at)}</span>
                    </div>
                    {application.reviewed_at && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4" />
                        <span>Reviewed: {formatDate(application.reviewed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-6">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status}
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

export default MyApplications;



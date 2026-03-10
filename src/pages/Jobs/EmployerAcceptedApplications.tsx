import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetEmployerApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import api from "../../services/api/axiosInstance";
import toast from "react-hot-toast";

const EmployerAcceptedApplications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetEmployerApplicationsQuery(
    { status: "Accepted" },
    { refetchOnMountOrArgChange: true }
  );

  const applications = data?.data || [];
  const acceptedApplications = applications;

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

  const handleViewResume = async (resumeUrl: string) => {
    try {
      let filePath = resumeUrl;

      if (resumeUrl.includes("/api/resumes/download")) {
        const url = new URL(resumeUrl, window.location.origin);
        filePath = url.searchParams.get("path") || resumeUrl;
      } else if (resumeUrl.startsWith("http://") || resumeUrl.startsWith("https://")) {
        window.open(resumeUrl, "_blank");
        return;
      }

      const response = await api.get(`/resumes/download?path=${encodeURIComponent(filePath)}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data as BlobPart], {
        type: (response.data as any)?.type || "application/pdf",
      });
      const blobUrl = window.URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error: any) {
      console.error("Error viewing resume:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("pages.jobs.failedToViewResume")
      );
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
            <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
            {t("pages.jobs.acceptedApplicationsTitle")}
          </h1>
          <p className="text-gray-500 dark:text-[var(--theme-text-secondary)] mt-2">
            {t("pages.jobs.acceptedApplicationsSubtitle")}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/applications")}
          className=" text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold transition shadow-sm cursor-pointer"
        >
          {t("pages.jobs.viewAllApplications")}
        </button>
      </div>

      {/* Statistics */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <p className="text-sm text-green-700 font-medium">
          {t("pages.jobs.totalAccepted")}
        </p>
        <p className="text-3xl font-bold text-green-900 mt-2">
          {acceptedApplications.length}
        </p>
      </div>

      {acceptedApplications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <CheckCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("pages.jobs.noAcceptedYet")}
          </h3>
          <p className="text-gray-600">{t("pages.jobs.noAcceptedMessage")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {acceptedApplications.map((application) => (
            <div
              key={application.application_id}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                      {application.student?.full_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.student?.full_name ||
                          t("pages.jobs.unknownStudent")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.student?.email ||
                          t("pages.jobs.noEmail")}
                      </p>
                      {application.student?.mobile_number && (
                        <p className="text-sm text-gray-500">
                          📞 {application.student.mobile_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="ml-16 space-y-2">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">
                        {application.job?.job_title ||
                          t("pages.jobs.unknownJob")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        📍 {application.job?.location || "N/A"}
                      </span>
                      <span>
                        💰 $
                        {application.job?.budget?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                    {application.cover_letter && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {t("pages.jobs.coverLetter")}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                    {application.resume_url && (
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            handleViewResume(application.resume_url!)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition text-sm"
                        >
                          <BriefcaseIcon className="h-4 w-4" />
                          {t("pages.jobs.viewResume")}
                        </button>
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
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>
                          {t("pages.jobs.acceptedAtLabel")}:{" "}
                          {formatDate(application.reviewed_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-6">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {t("pages.jobs.acceptedLabel")}
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

export default EmployerAcceptedApplications;

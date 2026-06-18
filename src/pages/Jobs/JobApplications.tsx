import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetEmployerApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import api from "../../services/api/axiosInstance";
import TrustScoreCard from "../../components/TrustScoreCard";
import { StudentBadgeChip } from "../../components/Profile/StudentBadgeCard";
import type { TrustScore, TrustLevel } from "../../services/api/trustScoreApi";

function levelFromNumericScore(score: number): TrustLevel {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Competent";
  if (score >= 55) return "Developing";
  if (score >= 40) return "Emerging";
  return "Limited";
}

/** Build card payload from applicant user row (fields from users table when present). */
function trustScoreFromStudentUser(student: any): TrustScore | null {
  if (!student?.user_id || student.trust_score == null) return null;
  const trust = Number(student.trust_score);
  const I = Number(student.intelligence_score ?? 0);
  const E = Number(student.experience_score ?? 0);
  const C = Number(student.interaction_score ?? 0);
  const level = (student.trust_level as TrustLevel) || levelFromNumericScore(trust);
  return {
    user_id: student.user_id,
    trust_score: trust,
    intelligence_score: I,
    experience_score: E,
    interaction_score: C,
    intelligence_percent: I * 100,
    experience_percent: E * 100,
    interaction_percent: C * 100,
    level,
    description: "",
    suggestions: [],
    source: "cached",
  };
}

const JobApplications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetEmployerApplicationsQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateApplicationStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Accepted" | "Rejected">("All");

  const applications = data?.data || [];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Accepted":
        return t("pages.jobs.acceptedLabel");
      case "Rejected":
        return t("pages.jobs.rejectedLabel");
      case "Pending":
        return t("pages.jobs.pendingLabel");
      default:
        return status;
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    status: "Accepted" | "Rejected"
  ) => {
    try {
      setUpdatingId(`${applicationId}_${status}`);
      await updateStatus({
        application_id: applicationId,
        data: { status },
      }).unwrap();
      toast.success(
        status === "Accepted"
          ? t("pages.jobs.applicationAcceptedSuccess")
          : t("pages.jobs.applicationRejectedSuccess")
      );
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          err?.data?.error ||
          t("pages.jobs.failedToUpdateApplication")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      i18n.language === "en" ? "en-US" : i18n.language,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
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

  const handleViewResume = async (resumeUrl: string) => {
    try {
      let filePath = resumeUrl;

      if (resumeUrl.includes("/api/resumes/download")) {
        const url = new URL(resumeUrl, window.location.origin);
        filePath = url.searchParams.get("path") || resumeUrl;
      } else if (
        resumeUrl.startsWith("http://") ||
        resumeUrl.startsWith("https://")
      ) {
        window.open(resumeUrl, "_blank");
        return;
      }

      const response = await api.get(
        `/resumes/download?path=${encodeURIComponent(filePath)}`,
        { responseType: "blob" }
      );

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

  const pendingCount = applications.filter(
    (app) => app.status === "Pending"
  ).length;
  const acceptedCount = applications.filter(
    (app) => app.status === "Accepted"
  ).length;
  const rejectedCount = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  // Filter applications
  const filteredApplications = filterStatus === "All"
    ? applications
    : applications.filter((app) => app.status === filterStatus);

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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <BriefcaseIcon className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {t("pages.jobs.jobApplicationsTitle")}
                </h1>
              </div>
              <p className="text-gray-600 text-sm md:text-base">
                {t("pages.jobs.jobApplicationsSubtitle")}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/jobs/all")}
              className="inline-flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <BriefcaseIcon className="h-5 w-5" />
              {t("pages.jobs.viewAllJobs")}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      {applications.length > 0 && (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Applications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-200 transition-all group cursor-pointer"
              onClick={() => setFilterStatus("All")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("pages.jobs.totalApplications")}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {applications.length}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <BriefcaseIcon className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Pending Applications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all group cursor-pointer"
              onClick={() => setFilterStatus("Pending")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("pages.jobs.pendingReview")}
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {pendingCount}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <ClockIcon className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Accepted Applications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-200 transition-all group cursor-pointer"
              onClick={() => setFilterStatus("Accepted")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("pages.jobs.acceptedLabel")}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {acceptedCount}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCircleIcon className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </div>

            {/* Rejected Applications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-red-200 transition-all group cursor-pointer"
              onClick={() => setFilterStatus("Rejected")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("pages.jobs.rejectedLabel")}
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {rejectedCount}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <XCircleIcon className="h-7 w-7 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="px-6 py-16">
          <div className="max-w-md mx-auto bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BriefcaseIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("pages.jobs.noApplicationsYet")}
            </h3>
            <p className="text-gray-600 text-sm">
              {t("pages.jobs.noApplicationsCheckBack")}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Filter and Sort Section */}
          <div className="mb-8 space-y-4">
            {/* Filter Tabs */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FunnelIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Filter by Status</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["All", "Pending", "Accepted", "Rejected"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      filterStatus === status
                        ? status === "All"
                          ? "bg-purple-600 text-white shadow-md"
                          : status === "Pending"
                          ? "bg-orange-600 text-white shadow-md"
                          : status === "Accepted"
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-red-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Count */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredApplications.length}</span> {filterStatus === "All" ? "application" : filterStatus.toLowerCase()}{filteredApplications.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Applications Grid */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No applications with status: {filterStatus}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.application_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all overflow-hidden group"
                >
                  {/* Status Bar */}
                  <div className={`h-1.5 ${
                    application.status === "Accepted"
                      ? "bg-green-500"
                      : application.status === "Rejected"
                      ? "bg-red-500"
                      : "bg-orange-500"
                  }`}></div>

                  <div className="p-4">
                    {/* Student Info Section */}
                    <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="h-11 w-11 rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:shadow-md transition-shadow">
                        {application.student?.full_name?.charAt(0) || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate flex items-center gap-2 flex-wrap">
                          {application.student?.full_name ||
                            t("pages.jobs.unknownStudent")}
                          {(application.student as any)?.badge && (
                            <StudentBadgeChip badge={(application.student as any).badge} />
                          )}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                          <EnvelopeIcon className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {application.student?.email ||
                              t("pages.jobs.noEmail")}
                          </span>
                        </div>
                        {application.student?.mobile_number && (
                          <p className="text-xs text-gray-600">
                            📞 {application.student.mobile_number}
                          </p>
                        )}
                        {(() => {
                          const ts = application.student
                            ? trustScoreFromStudentUser(application.student)
                            : null;
                          return ts ? (
                            <div className="mt-1">
                              <TrustScoreCard variant="compact" trustScore={ts} />
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">
                              {t("pages.jobs.trustScoreNotCalculated")}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <BriefcaseIcon className="h-4 w-4 text-purple-600 shrink-0" />
                          <span className="text-gray-700 font-semibold text-sm">
                            {application.job?.job_title ||
                              t("pages.jobs.unknownJob")}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="text-gray-600 truncate">
                            {application.job?.location || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="text-gray-600">
                            ${application.job?.budget?.toLocaleString() || "N/A"}
                          </span>
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                            {t("pages.jobs.coverLetter")}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {application.resume_url && (
                        <button
                          onClick={() =>
                            handleViewResume(application.resume_url!)
                          }
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors text-xs border border-blue-200"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                          {t("pages.jobs.viewResume")}
                        </button>
                      )}
                    </div>

                    {/* Footer Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(application.status)}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(application.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            {formatDate(application.applied_at)}
                          </span>
                        </div>
                        {application.reviewed_at && (
                          <p className="text-xs text-gray-500">
                            ✓ {t("pages.jobs.reviewed")}: {formatDate(application.reviewed_at)}
                          </p>
                        )}
                      </div>

                      {application.status === "Pending" && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                application.application_id,
                                "Accepted"
                              )
                            }
                            disabled={
                              isUpdating &&
                              updatingId === `${application.application_id}_Accepted`
                            }
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition text-xs whitespace-nowrap cursor-pointer"
                          >
                            {isUpdating &&
                            updatingId === `${application.application_id}_Accepted`
                              ? t("pages.jobs.updating")
                              : t("pages.jobs.accept")}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                application.application_id,
                                "Rejected"
                              )
                            }
                            disabled={
                              isUpdating &&
                              updatingId === `${application.application_id}_Rejected`
                            }
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition text-xs whitespace-nowrap cursor-pointer"
                          >
                            {isUpdating &&
                            updatingId === `${application.application_id}_Rejected`
                              ? t("pages.jobs.updating")
                              : t("pages.jobs.reject")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobApplications;

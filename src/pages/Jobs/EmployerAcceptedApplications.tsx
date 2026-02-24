import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployerApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import api from "../../services/api/axiosInstance";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

const EmployerAcceptedApplications: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetEmployerApplicationsQuery(
    { status: "Accepted" },
    { refetchOnMountOrArgChange: true }
  );

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return "";
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
      const response = await api.get(`/resumes/download?path=${encodeURIComponent(filePath)}`, { responseType: "blob" });
      const blob = new Blob([response.data as BlobPart], { type: (response.data as any)?.type || "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error: any) {
      console.error("Error viewing resume:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to view resume. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading accepted applications">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="space-y-4 animate-fadeIn"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)"
            : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
          minHeight: "100%",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        <div
          role="alert"
          className="rounded-lg p-4"
          style={{
            backgroundColor: isDark ? "rgba(220, 38, 38, 0.15)" : "#fef2f2",
            border: isDark ? "1px solid rgba(220, 38, 38, 0.3)" : "1px solid #fecaca",
            color: isDark ? "#fca5a5" : "#991b1b",
          }}
        >
          <p className="font-medium text-sm">Failed to load applications. Please try again later.</p>
          <button
            onClick={() => refetch()}
            className="mt-2 underline text-xs"
            style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 animate-fadeIn"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)"
          : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-6 w-6" style={{ color: isDark ? "#34d399" : "#16a34a" }} />
          <h1 className="text-xl font-bold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
            Accepted Applications
          </h1>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/applications")}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
          style={{ backgroundColor: isDark ? "#7F56D9" : "#2d1b69", color: "#ffffff" }}
        >
          View All Applications
        </button>
      </div>
      <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
        View all accepted job applications for your posted jobs
      </p>

      {/* Statistics */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: isDark ? "rgba(22, 163, 74, 0.15)" : "#f0fdf4",
          border: isDark ? "1px solid rgba(22, 163, 74, 0.3)" : "1px solid #bbf7d0",
        }}
        aria-label={`${applications.length} accepted applications`}
      >
        <p className="text-xs font-medium" style={{ color: isDark ? "#34d399" : "#15803d" }}>Total Accepted</p>
        <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#f3f4f6" : "#166534" }}>
          {applications.length}
        </p>
      </div>

      {applications.length === 0 ? (
        <div
          role="status"
          className="text-center py-8 rounded-lg"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px dashed rgba(45, 27, 105, 0.5)" : "1px dashed #e5e7eb",
          }}
        >
          <CheckCircleIcon className="h-10 w-10 mx-auto mb-2" style={{ color: isDark ? "#4b5563" : "#d1d5db" }} />
          <p className="text-sm font-medium" style={{ color: isDark ? "#d1d5db" : "#1f2937" }}>
            No accepted applications yet
          </p>
          <p className="text-xs mt-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            You haven't accepted any job applications yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {applications.map((application) => (
            <article
              key={application.application_id}
              aria-label={`Accepted application from ${application.student?.full_name || "Unknown"} for ${application.job?.job_title || "Unknown Job"}`}
              className="rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              style={{
                backgroundColor: isDark ? "#1e1833" : "#ffffff",
                border: isDark ? "1px solid rgba(45, 27, 105, 0.5)" : "1px solid #ede7f8",
                borderLeft: `4px solid ${isDark ? "#34d399" : "#16a34a"}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
                    >
                      {application.student?.full_name?.charAt(0) || "S"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                        {application.student?.full_name || "Unknown Student"}
                      </h3>
                      <p className="text-xs truncate" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                        {application.student?.email || "No email"}
                      </p>
                      {application.student?.mobile_number && (
                        <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                          {application.student.mobile_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5" style={{ marginLeft: "52px" }}>
                    <div className="flex items-center gap-2 text-xs">
                      <BriefcaseIcon className="h-3.5 w-3.5" style={{ color: isDark ? "#9ca3af" : "#9ca3af" }} />
                      <span className="font-medium" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                        {application.job?.job_title || "Unknown Job"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>
                      <span>{application.job?.location || "N/A"}</span>
                      <span>${application.job?.budget?.toLocaleString() || "N/A"}</span>
                    </div>
                    {application.cover_letter && (
                      <div
                        className="p-2 rounded text-xs"
                        style={{ backgroundColor: isDark ? "rgba(45, 27, 105, 0.2)" : "#f9fafb" }}
                      >
                        <p className="font-medium mb-0.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                          Cover Letter:
                        </p>
                        <p className="line-clamp-3" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                    {application.resume_url && (
                      <button
                        onClick={() => handleViewResume(application.resume_url!)}
                        aria-label={`View resume from ${application.student?.full_name || "applicant"}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition"
                        style={{
                          backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
                          color: isDark ? "#93c5fd" : "#1d4ed8",
                        }}
                      >
                        <BriefcaseIcon className="h-3.5 w-3.5" />
                        View Resume
                      </button>
                    )}
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                      <ClockIcon className="h-3.5 w-3.5" />
                      <span>
                        Applied: {formatDate(application.applied_at)}
                        {getRelativeTime(application.applied_at) && (
                          <span className="ml-1" style={{ color: isDark ? "#c084fc" : "#7F56D9" }}>
                            ({getRelativeTime(application.applied_at)})
                          </span>
                        )}
                      </span>
                    </div>
                    {application.reviewed_at && (
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: isDark ? "#34d399" : "#16a34a" }}>
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        <span>
                          Accepted: {formatDate(application.reviewed_at)}
                          {getRelativeTime(application.reviewed_at) && (
                            <span className="ml-1 font-normal" style={{ color: isDark ? "#c084fc" : "#7F56D9" }}>
                              ({getRelativeTime(application.reviewed_at)})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircleIcon className="h-5 w-5" style={{ color: isDark ? "#34d399" : "#16a34a" }} />
                    <span
                      role="status"
                      aria-label="Application status: Accepted"
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: isDark ? "rgba(22, 163, 74, 0.15)" : "#dcfce7",
                        color: isDark ? "#34d399" : "#15803d",
                      }}
                    >
                      Accepted
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerAcceptedApplications;

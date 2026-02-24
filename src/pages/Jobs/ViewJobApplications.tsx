import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetJobApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "../../services/api/jobApplicationApi";
import { useGetJobByIdQuery } from "../../services/api/jobsApi";
import {
  BriefcaseIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import api from "../../services/api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

const ViewJobApplications: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: jobData, isLoading: isLoadingJob } = useGetJobByIdQuery(id || "");
  const { data, isLoading, error, refetch } = useGetJobApplicationsQuery(id || "");
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateApplicationStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const applications = data?.data || [];
  const job = jobData?.data;

  const handleStatusUpdate = async (
    applicationId: string,
    status: "Accepted" | "Rejected"
  ) => {
    try {
      setUpdatingId(applicationId);
      await updateStatus({
        application_id: applicationId,
        data: { status },
      }).unwrap();
      toast.success(`Application ${status.toLowerCase()} successfully!`);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.data?.error || "Failed to update application"
      );
    } finally {
      setUpdatingId(null);
    }
  };

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

  const getStatusBorderColor = (status: string) => {
    if (status === "Accepted") return isDark ? "#34d399" : "#16a34a";
    if (status === "Rejected") return isDark ? "#f87171" : "#dc2626";
    return isDark ? "#fbbf24" : "#f59e0b";
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status === "Accepted")
      return { backgroundColor: isDark ? "rgba(22, 163, 74, 0.15)" : "#dcfce7", color: isDark ? "#34d399" : "#15803d" };
    if (status === "Rejected")
      return { backgroundColor: isDark ? "rgba(220, 38, 38, 0.15)" : "#fee2e2", color: isDark ? "#f87171" : "#b91c1c" };
    return { backgroundColor: isDark ? "rgba(234, 88, 12, 0.15)" : "#ffedd5", color: isDark ? "#fbbf24" : "#c2410c" };
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusBadgeStyle(status).color;
    if (status === "Accepted") return <CheckCircleIcon className="h-5 w-5" style={{ color }} />;
    if (status === "Rejected") return <XCircleIcon className="h-5 w-5" style={{ color }} />;
    return <ClockIcon className="h-5 w-5" style={{ color }} />;
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

      const blob = new Blob([response.data as BlobPart], { type: (response.data as any)?.type || "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error: any) {
      console.error("Error viewing resume:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to view resume. Please try again.");
    }
  };

  if (isLoading || isLoadingJob) {
    return (
      <div aria-busy="true" aria-label="Loading job applications">
        <Loader />
      </div>
    );
  }

  if (error || !job) {
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
          <p className="font-medium text-sm">Failed to load job applications. Please try again later.</p>
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

  const pendingCount = applications.filter((app) => app.status === "Pending").length;
  const acceptedCount = applications.filter((app) => app.status === "Accepted").length;
  const rejectedCount = applications.filter((app) => app.status === "Rejected").length;

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/jobs/all")}
            className="p-1.5 rounded-lg transition"
            style={{
              backgroundColor: isDark ? "rgba(45, 27, 105, 0.25)" : "#f3f4f6",
            }}
            aria-label="Go back to all jobs"
          >
            <ArrowLeftIcon className="h-5 w-5" style={{ color: isDark ? "#d1d5db" : "#4b5563" }} />
          </button>
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
            >
              <BriefcaseIcon className="h-6 w-6" style={{ color: isDark ? "#c084fc" : "#6941C6" }} />
              Applications for {job.job_title}
            </h1>
            <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
              View and manage applications for this job posting
            </p>
          </div>
        </div>
      </div>

      {/* Job Info Card */}
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: isDark ? "#1e1833" : "#ffffff",
          border: isDark ? "1px solid rgba(45, 27, 105, 0.5)" : "1px solid #ede7f8",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Location</p>
            <p className="text-sm font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>{job.location}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Budget</p>
            <p className="text-sm font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
              ${job.budget.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Duration</p>
            <p className="text-sm font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>{job.duration}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Status</p>
            <span
              role="status"
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5"
              style={
                job.status === "Active"
                  ? { backgroundColor: isDark ? "rgba(22, 163, 74, 0.15)" : "#dcfce7", color: isDark ? "#34d399" : "#15803d" }
                  : job.status === "Pending"
                  ? { backgroundColor: isDark ? "rgba(234, 88, 12, 0.15)" : "#ffedd5", color: isDark ? "#fbbf24" : "#c2410c" }
                  : { backgroundColor: isDark ? "rgba(107, 114, 128, 0.15)" : "#f3f4f6", color: isDark ? "#9ca3af" : "#4b5563" }
              }
            >
              {job.status}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? "rgba(45, 27, 105, 0.25)" : "#f5f0fc",
            border: isDark ? "1px solid rgba(45, 27, 105, 0.5)" : "1px solid #ddd0ec",
          }}
          aria-label={`${applications.length} total applications`}
        >
          <p className="text-xs font-medium" style={{ color: isDark ? "#c084fc" : "#6941C6" }}>Total Applications</p>
          <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#f3f4f6" : "#2d1b69" }}>
            {applications.length}
          </p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? "rgba(234, 88, 12, 0.15)" : "#fff7ed",
            border: isDark ? "1px solid rgba(234, 88, 12, 0.3)" : "1px solid #fed7aa",
          }}
          aria-label={`${pendingCount} applications pending review`}
        >
          <p className="text-xs font-medium" style={{ color: isDark ? "#fbbf24" : "#c2410c" }}>Pending Review</p>
          <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#f3f4f6" : "#9a3412" }}>{pendingCount}</p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? "rgba(22, 163, 74, 0.15)" : "#f0fdf4",
            border: isDark ? "1px solid rgba(22, 163, 74, 0.3)" : "1px solid #bbf7d0",
          }}
          aria-label={`${acceptedCount} applications accepted`}
        >
          <p className="text-xs font-medium" style={{ color: isDark ? "#34d399" : "#15803d" }}>Accepted</p>
          <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#f3f4f6" : "#166534" }}>{acceptedCount}</p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? "rgba(220, 38, 38, 0.15)" : "#fef2f2",
            border: isDark ? "1px solid rgba(220, 38, 38, 0.3)" : "1px solid #fecaca",
          }}
          aria-label={`${rejectedCount} applications rejected`}
        >
          <p className="text-xs font-medium" style={{ color: isDark ? "#f87171" : "#b91c1c" }}>Rejected</p>
          <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#f3f4f6" : "#991b1b" }}>{rejectedCount}</p>
        </div>
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
          <UserIcon className="h-10 w-10 mx-auto mb-2" style={{ color: isDark ? "#4b5563" : "#d1d5db" }} />
          <p className="text-sm font-medium" style={{ color: isDark ? "#d1d5db" : "#1f2937" }}>
            No applications yet
          </p>
          <p className="text-xs mt-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            This job hasn't received any applications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <article
              key={application.application_id}
              aria-label={`Application from ${application.student?.full_name || "Unknown"} - Status: ${application.status}`}
              className="rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              style={{
                backgroundColor: isDark ? "#1e1833" : "#ffffff",
                border: isDark ? "1px solid rgba(45, 27, 105, 0.5)" : "1px solid #ede7f8",
                borderLeft: `4px solid ${getStatusBorderColor(application.status)}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #6941C6, #2d1b69)" }}
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
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(application.status)}
                    <span
                      role="status"
                      aria-label={`Application status: ${application.status}`}
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={getStatusBadgeStyle(application.status)}
                    >
                      {application.status}
                    </span>
                  </div>

                  {application.status === "Pending" && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleStatusUpdate(application.application_id, "Accepted")}
                        disabled={isUpdating && updatingId === application.application_id}
                        aria-label={`Accept application from ${application.student?.full_name || "applicant"}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                        style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                      >
                        {isUpdating && updatingId === application.application_id ? "..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.application_id, "Rejected")}
                        disabled={isUpdating && updatingId === application.application_id}
                        aria-label={`Reject application from ${application.student?.full_name || "applicant"}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                        style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                      >
                        {isUpdating && updatingId === application.application_id ? "..." : "Reject"}
                      </button>
                    </div>
                  )}

                  {application.reviewed_at && (
                    <p className="text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                      Reviewed: {formatDate(application.reviewed_at)}
                      {getRelativeTime(application.reviewed_at) && (
                        <span className="ml-1" style={{ color: isDark ? "#c084fc" : "#7F56D9" }}>
                          ({getRelativeTime(application.reviewed_at)})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewJobApplications;

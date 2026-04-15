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
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import api from "../../services/api/axiosInstance";
import ScheduleInterviewModal from "../../components/ScheduleInterviewModal";

const ViewJobApplications: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: jobData, isLoading: isLoadingJob } = useGetJobByIdQuery(id || "");
  const { data, isLoading, error, refetch } = useGetJobApplicationsQuery(id || "");
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateApplicationStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [scheduleFor, setScheduleFor] = useState<{
    studentId: string;
    studentName: string;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Accepted" | "Rejected">("Pending");
  const [searchTerm, setSearchTerm] = useState("");

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
      // Extract the path from the resume URL
      // It might be in format: /api/resumes/download?path=...
      let filePath = resumeUrl;
      
      if (resumeUrl.includes('/api/resumes/download')) {
        const url = new URL(resumeUrl, window.location.origin);
        filePath = url.searchParams.get('path') || resumeUrl;
      } else if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
        // If it's an external URL (S3), open directly
        window.open(resumeUrl, '_blank');
        return;
      }

      // Fetch resume with authentication
      const response = await api.get(`/resumes/download?path=${encodeURIComponent(filePath)}`, {
        responseType: 'blob',
      });

      // Create a blob URL and open it
      const blob = new Blob([response.data as BlobPart], { type: (response.data as any)?.type || 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(blobUrl, '_blank');
      
      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error: any) {
      console.error('Error viewing resume:', error);
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to view resume. Please try again.'
      );
    }
  };

  if (isLoading || isLoadingJob) {
    return <Loader />;
  }

  if (error || !job) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            Failed to load job applications. Please try again later.
          </p>
        </div>
      </div>
    );
  }

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

  // Apply filters: status tab + name search
  const filteredApplications = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const name = app.student?.full_name?.toLowerCase() || "";
      const email = app.student?.email?.toLowerCase() || "";
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="theme-page-bg space-y-6 animate-fadeIn min-h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/jobs/all")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-[var(--theme-text-primary)] flex items-center gap-3">
              <BriefcaseIcon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              Applications for {job.job_title}
            </h1>
            <p className="text-gray-500 dark:text-[var(--theme-text-secondary)] mt-2">
              View and manage applications for this job posting
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/dashboard/jobs/${id}/tasks`)}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Manage Tasks
        </button>
      </div>

      {/* Job Info Card */}
      <div className="bg-white dark:border-[var(--theme-border)] rounded-xl p-6 shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-[var(--theme-text-secondary)]">Location</p>
            <p className="font-semibold text-gray-900 dark:text-[var(--theme-text-primary)]">{job.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-[var(--theme-text-secondary)]">Budget</p>
            <p className="font-semibold text-gray-900 dark:text-[var(--theme-text-primary)]">
              ${job.budget.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-[var(--theme-text-secondary)]">Duration</p>
            <p className="font-semibold text-gray-900 dark:text-[var(--theme-text-primary)]">{job.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-[var(--theme-text-secondary)]">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                job.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : job.status === "Pending"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {job.status}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Total Applications</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">
            {applications.length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Pending Review</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Accepted</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{acceptedCount}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{rejectedCount}</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 dark:border-[var(--theme-border)] text-center">
          <UserIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-[var(--theme-text-primary)] mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600 dark:text-[var(--theme-text-secondary)]">
            This job hasn't received any applications yet.
          </p>
        </div>
      ) : (
        <>
          {/* Filter tabs + search */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-1">
              {([
                { key: "Pending", label: "Pending", count: pendingCount, color: "orange" },
                { key: "Accepted", label: "Accepted", count: acceptedCount, color: "green" },
                { key: "Rejected", label: "Rejected", count: rejectedCount, color: "red" },
                { key: "all", label: "All", count: applications.length, color: "purple" },
              ] as const).map((tab) => {
                const active = statusFilter === tab.key;
                const colorClasses: Record<string, string> = {
                  orange: active ? "bg-orange-100 text-orange-700 border-orange-300" : "text-gray-600 border-gray-200 hover:bg-orange-50",
                  green: active ? "bg-green-100 text-green-700 border-green-300" : "text-gray-600 border-gray-200 hover:bg-green-50",
                  red: active ? "bg-red-100 text-red-700 border-red-300" : "text-gray-600 border-gray-200 hover:bg-red-50",
                  purple: active ? "bg-purple-100 text-purple-700 border-purple-300" : "text-gray-600 border-gray-200 hover:bg-purple-50",
                };
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${colorClasses[tab.color]}`}
                  >
                    {tab.label}
                    <span className="ml-1.5 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px]">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <input
              type="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs w-full sm:w-56 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                No applications match your filter
                {searchTerm && ` "${searchTerm}"`}.
              </p>
            </div>
          ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.application_id}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 dark:border-[var(--theme-border)] hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {application.student?.full_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-[var(--theme-text-primary)]">
                        {application.student?.full_name || "Unknown Student"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-[var(--theme-text-secondary)]">
                        {application.student?.email || "No email"}
                      </p>
                      {application.student?.mobile_number && (
                        <p className="text-sm text-gray-500 dark:text-[var(--theme-text-secondary)]">
                          📞 {application.student.mobile_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="ml-16 space-y-2">
                    {application.cover_letter && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-[var(--theme-text-primary)] mb-1">
                          Cover Letter:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-[var(--theme-text-secondary)]">{application.cover_letter}</p>
                      </div>
                    )}
                    {application.resume_url && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleViewResume(application.resume_url!)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition text-sm"
                        >
                          <BriefcaseIcon className="h-4 w-4" />
                          View Resume
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--theme-text-secondary)]">
                      <ClockIcon className="h-4 w-4" />
                      <span>Posted: {formatDate(application.applied_at)}</span>
                    </div>
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

                  {application.status === "Pending" && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        onClick={() =>
                          setScheduleFor({
                            studentId: application.student_id,
                            studentName: application.student?.full_name || "Student",
                          })
                        }
                        className="inline-flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap"
                      >
                        <CalendarDaysIcon className="h-4 w-4" />
                        Schedule Interview
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(application.application_id, "Accepted")
                        }
                        disabled={
                          isUpdating && updatingId === application.application_id
                        }
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap"
                      >
                        {isUpdating && updatingId === application.application_id
                          ? "Updating..."
                          : "Accept"}
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(application.application_id, "Rejected")
                        }
                        disabled={
                          isUpdating && updatingId === application.application_id
                        }
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap"
                      >
                        {isUpdating && updatingId === application.application_id
                          ? "Updating..."
                          : "Reject"}
                      </button>
                    </div>
                  )}

                  {application.reviewed_at && (
                    <p className="text-xs text-gray-500 dark:text-[var(--theme-text-secondary)]">
                      Reviewed: {formatDate(application.reviewed_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
          )}
        </>
      )}

      {scheduleFor && job && (
        <ScheduleInterviewModal
          isOpen={!!scheduleFor}
          onClose={() => setScheduleFor(null)}
          studentId={scheduleFor.studentId}
          studentName={scheduleFor.studentName}
          jobId={job.job_id}
          jobTitle={job.job_title}
          onScheduled={() => refetch()}
        />
      )}
    </div>
  );
};

export default ViewJobApplications;


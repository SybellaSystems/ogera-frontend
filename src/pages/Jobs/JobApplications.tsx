import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetEmployerApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import api from "../../services/api/axiosInstance";

const JobApplications: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetEmployerApplicationsQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateApplicationStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const applications = data?.data || [];

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
            Failed to load applications. Please try again later.
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
            <BriefcaseIcon className="h-10 w-10 text-[#6941C6]" />
            Job Applications
          </h1>
          <p className="text-gray-500 mt-2">
            View and manage all job applications for your posted jobs
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/all")}
          className="bg-[#2d1b69] hover:bg-[#1a1035] text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md cursor-pointer"
        >
          View All Jobs
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#f5f0fc] rounded-xl p-6 border border-[#ddd0ec]">
          <p className="text-sm text-[#6941C6] font-medium">Total Applications</p>
          <p className="text-3xl font-bold text-[#2d1b69] mt-2">
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
        <div className="bg-white rounded-xl p-12 shadow-md border border-[#ede7f8] text-center">
          <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600">
            You haven't received any job applications yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map((application) => (
            <div
              key={application.application_id}
              className="bg-white rounded-xl p-6 shadow-md border border-[#ede7f8] hover:shadow-lg transition-shadow"
            >
               <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#6941C6] to-[#2d1b69] flex items-center justify-center text-white font-bold text-lg">
                      {application.student?.full_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.student?.full_name || "Unknown Student"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.student?.email || "No email"}
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
                        {application.job?.job_title || "Unknown Job"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📍 {application.job?.location || "N/A"}</span>
                      <span>💰 ${application.job?.budget?.toLocaleString() || "N/A"}</span>
                    </div>
                    {application.cover_letter && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Cover Letter:
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                    {application.resume_url && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleViewResume(application.resume_url!)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition text-sm"
                        >
                          <BriefcaseIcon className="h-4 w-4" />
                          View Resume
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
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
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusUpdate(application.application_id, "Accepted")
                        }
                        disabled={
                          isUpdating && updatingId === application.application_id
                        }
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap cursor-pointer"
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
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap cursor-pointer"
                      >
                        {isUpdating && updatingId === application.application_id
                          ? "Updating..."
                          : "Reject"}
                      </button>
                    </div>
                  )}

                  {application.reviewed_at && (
                    <p className="text-xs text-gray-500">
                      Reviewed: {formatDate(application.reviewed_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;


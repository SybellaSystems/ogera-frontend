import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetStudentApplicationsQuery, useWithdrawApplicationMutation } from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetStudentApplicationsQuery();
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const applications = data?.data || [];

  const handleWithdraw = async (applicationId: string, jobTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
      try {
        setWithdrawingId(applicationId);
        await withdrawApplication(applicationId).unwrap();
        toast.success("Application withdrawn successfully");
        refetch();
      } catch (error: any) {
        console.error("Failed to withdraw application:", error);
        toast.error(error?.data?.message || "Failed to withdraw application");
      } finally {
        setWithdrawingId(null);
      }
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
            My Applications
          </h1>
          <p className="text-gray-500 mt-2">
            View all your job applications and their status
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/all")}
          className="bg-[#2d1b69] hover:bg-[#1a1035] text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md"
        >
          Browse Jobs
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
          <p className="text-gray-600 mb-4">
            You haven't applied to any jobs yet. Start browsing jobs to apply!
          </p>
          <button
            onClick={() => navigate("/dashboard/jobs/all")}
            className="bg-[#2d1b69] hover:bg-[#1a1035] text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.application_id}
              className="bg-white rounded-xl p-6 shadow-md border border-[#ede7f8] hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/jobs/${application.job_id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#6941C6] to-[#2d1b69] flex items-center justify-center text-white font-bold text-lg">
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
                  {/* Withdraw button - only for pending applications */}
                  {application.status === "Pending" && (
                    <button
                      onClick={(e) => handleWithdraw(application.application_id, application.job?.job_title || "this job", e)}
                      disabled={isWithdrawing && withdrawingId === application.application_id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="h-4 w-4" />
                      {isWithdrawing && withdrawingId === application.application_id ? "Withdrawing..." : "Withdraw"}
                    </button>
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

export default MyApplications;



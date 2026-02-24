import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";

const StudentAcceptedApplications: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentApplicationsQuery(
    { status: "Accepted" },
    { refetchOnMountOrArgChange: true }
  );

  const applications = data?.data || [];
  const acceptedApplications = applications;

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
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
            Accepted Applications
          </h1>
          <p className="text-gray-500 mt-2">
            View all your accepted job applications
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/my-applications")}
          className="bg-[#2d1b69] hover:bg-[#1a1035] text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md"
        >
          View All Applications
        </button>
      </div>

      {/* Statistics */}
      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
        <p className="text-sm text-green-700 font-medium">Total Accepted</p>
        <p className="text-3xl font-bold text-green-900 mt-2">
          {acceptedApplications.length}
        </p>
      </div>

      {acceptedApplications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-[#ede7f8] text-center">
          <CheckCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No accepted applications yet
          </h3>
          <p className="text-gray-600 mb-4">
            You don't have any accepted applications at the moment.
          </p>
          <button
            onClick={() => navigate("/dashboard/jobs/all")}
            className="bg-[#2d1b69] hover:bg-[#1a1035] text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {acceptedApplications.map((application) => (
            <div
              key={application.application_id}
              className="bg-white rounded-xl p-6 shadow-md border border-[#ede7f8] hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/jobs/${application.job_id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
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
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Accepted: {formatDate(application.reviewed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-6">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Accepted
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

export default StudentAcceptedApplications;



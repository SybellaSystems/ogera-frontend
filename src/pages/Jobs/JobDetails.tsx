import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useGetJobByIdQuery } from "../../services/api/jobsApi";
import { useGetUserProfileQuery } from "../../services/api/authApi";
import ApplyJobModal from "../../components/ApplyJobModal";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";
import Button from "../../components/button";

const JobDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useSelector((state: any) => state.auth.role);
  const { data, isLoading, error } = useGetJobByIdQuery(id || "");
  const { data: profileData } = useGetUserProfileQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const job = data?.data;
  const currentUserId = profileData?.data?.user_id;
  const isSaved = id ? savedJobs.has(id) : false;

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Completed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !job) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            Job not found or failed to load. Please try again later.
          </p>
          <button
            onClick={() => navigate("/dashboard/jobs/all")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to All Jobs
          </button>
        </div>
      </div>
    );
  }

  // Check if employer can view this job (only their own jobs)
  if (role === "employer" && currentUserId && job.employer_id !== currentUserId) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            You don't have permission to view this job.
          </p>
          <button
            onClick={() => navigate("/dashboard/jobs/all")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to All Jobs
          </button>
        </div>
      </div>
    );
  }

  const employerName = job.employer?.full_name || "Unknown Employer";
  const companyInitial = employerName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/dashboard/jobs/all")}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <BriefcaseIcon className="h-6 w-6 md:h-10 md:w-10 text-purple-600" />
            {job.job_title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                job.status
              )}`}
            >
              {job.status}
            </span>
            {role === "student" && (
              <button
                onClick={() => id && toggleSaveJob(id)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title={isSaved ? "Remove from saved" : "Save job"}
              >
                {isSaved ? (
                  <BookmarkSolidIcon className="h-5 w-5 text-blue-600" />
                ) : (
                  <BookmarkIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>
        {role === "student" && (
          <Button
            backgroundcolor="#7f56d9"
            text="Apply Now"
            onClick={() => setIsModalOpen(true)}
          />
        )}
        {(role === "employer" || role === "superadmin") && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              backgroundcolor="#7f56d9"
              text={`Manage Applications (${job.applications || 0})`}
              onClick={() => navigate(`/dashboard/jobs/${id}/applications`)}
            />
            <Button
              backgroundcolor="#6b7280"
              text="Edit Job"
              onClick={() => navigate(`/dashboard/jobs/${id}/edit`)}
            />
          </div>
        )}
      </div>

      {/* Job Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Company Info */}
          <div className="flex-shrink-0">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-md">
              {companyInitial}
            </div>
          </div>

          {/* Job Details */}
          <div className="flex-1 space-y-4">
            {/* Employer Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  {employerName}
                </h2>
              </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPinIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm md:text-base">
                  <strong>Location:</strong> {job.location}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm md:text-base">
                  <strong>Budget:</strong> ${job.budget?.toLocaleString() || "Not specified"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm md:text-base">
                  <strong>Duration:</strong> {job.duration || "Not specified"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm md:text-base">
                  <strong>Posted:</strong>{" "}
                  {job.created_at ? formatRelativeTime(job.created_at) : "Unknown"}
                </span>
              </div>
            </div>

            {/* Category and Tags */}
            <div className="flex flex-wrap gap-2">
              {job.category && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {job.category}
                </span>
              )}
              {job.employment_type && (
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  {job.employment_type}
                </span>
              )}
              {job.experience_level && (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                  {job.experience_level}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {job.applications || 0} applicants
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
            Job Description
          </h3>
          <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
            Requirements
          </h3>
          <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap">
            {job.requirements}
          </p>
        </div>
      )}

      {/* Skills */}
      {job.skills && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
            Skills Required
          </h3>
          <p className="text-gray-700 text-sm md:text-base">{job.skills}</p>
        </div>
      )}

      {/* Questions Preview (for students) */}
      {role === "student" && job.questions && job.questions.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-blue-900 mb-2">
            Application Questions
          </h3>
          <p className="text-sm md:text-base text-blue-700 mb-3">
            You will be asked to answer {job.questions.length} question
            {job.questions.length > 1 ? "s" : ""} when applying for this job.
          </p>
          <ul className="space-y-2">
            {job.questions
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((question, index) => (
                <li key={question.question_id || index} className="text-sm md:text-base text-blue-800">
                  <span className="font-medium">{index + 1}.</span> {question.question_text}
                  {question.is_required && (
                    <span className="text-red-600 ml-1">*</span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Apply Job Modal */}
      {isModalOpen && job && (
        <ApplyJobModal
          job={job}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            navigate("/dashboard/jobs/all");
          }}
        />
      )}
    </div>
  );
};

export default JobDetails;


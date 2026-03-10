import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useGetAllJobsQuery, useToggleJobStatusMutation } from "../../services/api/jobsApi";
import { useGetUserProfileQuery } from "../../services/api/authApi";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import ApplyJobModal from "../../components/ApplyJobModal";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const AllJobs: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const { data, isLoading, error, refetch } = useGetAllJobsQuery();
  const { data: profileData } = useGetUserProfileQuery(undefined);
  const { data: studentApplications, refetch: refetchApplications } = useGetStudentApplicationsQuery(undefined, {
    skip: role !== "student",
  });
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toggleStatus, { isLoading: isToggling }] = useToggleJobStatusMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  
  // Create a Set of job IDs the student has applied to
  const appliedJobIds = new Set(
    (studentApplications?.data || []).map((app: any) => app.job_id)
  );

  const jobs = data?.data || [];
  const currentUserId = profileData?.data?.user_id;

  // Filter jobs based on role, search, location, and status
  const filteredJobs = jobs.filter((job: any) => {
    // For employers, only show their own jobs
    if (role === "employer" && currentUserId && job.employer_id !== currentUserId) {
      return false;
    }
    
    const matchesSearch =
      !searchQuery ||
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.employer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation =
      !selectedLocation || job.location?.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesStatus =
      !selectedStatus || job.status === selectedStatus;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Get unique locations and statuses for filters
  const locations = Array.from(
    new Set(jobs.map((job: any) => job.location).filter(Boolean))
  );
  const statuses = ["Active", "Pending", "Inactive", "Completed"];

  // Calculate statistics
  const totalJobs = filteredJobs.length;
  const activeJobs = filteredJobs.filter((job) => job.status === "Active").length;
  const pendingJobs = filteredJobs.filter((job) => job.status === "Pending").length;
  const totalApplicants = filteredJobs.reduce((sum, job) => sum + (job.applications || 0), 0);

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

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    refetch();
    // Refetch student applications to update applied status
    if (role === "student") {
      refetchApplications();
    }
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

  const handleToggleStatus = async (jobId: string, _currentStatus: string) => {
    try {
      await toggleStatus(jobId).unwrap();
      refetch();
    } catch (error: any) {
      console.error("Failed to toggle job status:", error);
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
            {t("pages.jobs.failedToLoad")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <BriefcaseIcon className="h-6 w-6 md:h-10 md:w-10 text-purple-600" />
            {t("pages.jobs.allJobs")}
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            {role === "employer"
              ? t("pages.jobs.managePostings")
              : role === "student"
              ? t("pages.jobs.browseAndApply")
              : t("pages.jobs.browseAndManage")}
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2"> 
  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 hover:shadow-sm transition-shadow">
    <p className="text-xs uppercase tracking-wider text-purple-700 font-semibold">{t("pages.jobs.totalJobs")}</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{totalJobs}</p>
        </div>
  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 hover:shadow-sm transition-shadow">
    <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">{t("pages.jobs.activeJobs")}</p>
    <p className="text-2xl font-bold text-orange-900 mt-1">{activeJobs}</p>
        </div>
  <div className="bg-green-50 rounded-xl p-4 border border-green-200 hover:shadow-sm transition-shadow">
    <p className="text-xs uppercase tracking-wider text-green-700 font-semibold">{t("pages.jobs.totalApplicants")}</p>
 <p className="text-2xl font-bold text-green-900 mt-1">            {totalApplicants}
          </p>
        </div>
  <div className="bg-red-50 rounded-xl p-4 border border-red-200 hover:shadow-sm transition-shadow">
    <p className="text-xs uppercase tracking-wider text-red-700 font-semibold">{t("pages.jobs.pendingReview")}</p>
    <p className="text-2xl font-bold text-red-900 mt-1">{pendingJobs}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 md:p-3">
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4  text-gray-400" />
            <input
              type="text"
              placeholder={t("pages.jobs.searchJobs")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
className="w-full pl-9 pr-4 py-1.5 md:py-2 text-xs md:text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"            />
          </div>

          {/* Location Filter */}
          <div className="relative sm:w-48">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
className="w-full pl-9 pr-8 py-1.5 md:py-2 text-xs md:text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all outline-none"            >
              <option value="">{t("pages.jobs.allLocations")}</option>
              {locations.map((location: string) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
className="w-full pl-9 pr-8 py-1.5 md:py-2 text-xs md:text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all outline-none"            >
              <option value="">{t("pages.jobs.allStatus")}</option>
              {statuses.map((status: string) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || selectedLocation || selectedStatus
              ? t("pages.jobs.noJobsMatching")
              : t("pages.jobs.noJobsAvailable")}
          </h3>
          <p className="text-gray-600">
            {searchQuery || selectedLocation || selectedStatus
              ? t("pages.jobs.tryAdjusting")
              : t("pages.jobs.noPostingsCheckBack")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job: any) => {
            const employerName = job.employer?.full_name || t("pages.jobs.unknownEmployer");
            const companyInitial = employerName.charAt(0).toUpperCase();
            const isSaved = savedJobs.has(job.job_id);

            return (
              <div
                key={job.job_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-4 md:p-5"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Company Logo and Title Section */}
                  <div className="flex gap-3 md:gap-4 flex-1 min-w-0">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 md:h-16 md:w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md">
                        {companyInitial}
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3
                              onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                              className="text-base md:text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer break-words"
                            >
                              {job.job_title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                                job.status
                              )}`}
                            >
                              {job.status}
                            </span>
                          </div>
                          <p className="text-sm md:text-base text-gray-700 font-medium mb-2 truncate">
                            {employerName}
                          </p>
                        </div>
                        {/* Only show bookmark for students */}
                        {role === "student" && (
                          <button
                            onClick={() => toggleSaveJob(job.job_id)}
                            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition"
                            title={isSaved ? t("pages.jobs.removeFromSaved") : t("pages.jobs.saveJob")}
                          >
                            {isSaved ? (
                              <BookmarkSolidIcon className="h-5 w-5 text-blue-600" />
                            ) : (
                              <BookmarkIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Job Info Row */}
                      <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="truncate">{job.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <CurrencyDollarIcon className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="truncate">${job.budget?.toLocaleString() || t("pages.jobs.notSpecified")}</span>
                        </span>
                        {job.duration && (
                          <span className="flex items-center gap-1">
                            <BriefcaseIcon className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="truncate">{job.duration}</span>
                          </span>
                        )}
                        {job.created_at && (
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="truncate">{t("pages.jobs.posted")} {formatRelativeTime(job.created_at)}</span>
                          </span>
                        )}
                      </div>

                      {/* Job Description Preview */}
                      {job.description && (
                        <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {/* Skills/Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.category && (
                          <span className="px-2 md:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {job.category}
                          </span>
                        )}
                        {job.employment_type && (
                          <span className="px-2 md:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            {job.employment_type}
                          </span>
                        )}
                        {job.experience_level && (
                          <span className="px-2 md:px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                            {job.experience_level}
                          </span>
                        )}
                        <span className="px-2 md:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {job.applications || 0} {t("pages.jobs.applicants")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-1.5 md:ml-4 md:flex-shrink-0">
                    {role === "student" ? (
                      <button
                        onClick={() => !appliedJobIds.has(job.job_id) && handleApply(job)}
                        disabled={appliedJobIds.has(job.job_id)}
className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md font-medium transition shadow-sm whitespace-nowrap text-xs md:text-sm flex-1 sm:flex-none cursor-pointer ${                          appliedJobIds.has(job.job_id)
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {appliedJobIds.has(job.job_id) ? t("jobs.applied") : t("pages.jobs.applyNow")}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition shadow-sm whitespace-nowrap text-xs md:text-sm flex-1 sm:flex-none cursor-pointer"                        >
                          {t("pages.jobs.viewDetails")}
                        </button>
                        {(role === "employer" || role === "superadmin") && (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/dashboard/jobs/${job.job_id}/applications`)
                              }
className="px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition shadow-sm whitespace-nowrap text-xs md:text-sm flex-1 sm:flex-none cursor-pointer"                            >
                              {t("pages.jobs.manage")} ({job.applications || 0})
                            </button>
                            {(job.status === "Active" || job.status === "Inactive" || job.status === "Pending") && (
                              <button
                                onClick={() => handleToggleStatus(job.job_id, job.status)}
                                disabled={isToggling}
className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md font-medium transition shadow-sm whitespace-nowrap text-xs md:text-sm flex-1 sm:flex-none cursor-pointer ${                                  job.status === "Active"
                                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                                    : job.status === "Pending"
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {isToggling
                                  ? t("pages.jobs.updating")
                                  : job.status === "Active"
                                  ? t("pages.jobs.deactivate")
                                  : t("pages.jobs.activate")}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                navigate(`/dashboard/jobs/${job.job_id}/edit`)
                              }
className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition shadow-sm whitespace-nowrap text-xs md:text-sm flex-1 sm:flex-none border border-gray-200 cursor-pointer"                            >
                              {t("common.edit")}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Job Modal */}
      {selectedJob && (
        <ApplyJobModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
};

export default AllJobs;

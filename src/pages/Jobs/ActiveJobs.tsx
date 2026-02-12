import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useGetActiveJobsQuery } from "../../services/api/jobsApi";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import ApplyJobModal from "../../components/ApplyJobModal";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const ActiveJobs: React.FC = () => {
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const { data, isLoading, error } = useGetActiveJobsQuery();
  const { data: studentApplications, refetch: refetchApplications } = useGetStudentApplicationsQuery(undefined, {
    skip: role !== "student",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  
  // Create a Set of job IDs the student has applied to
  const appliedJobIds = new Set(
    (studentApplications?.data || []).map((app: any) => app.job_id)
  );

  const activeJobs = data?.data || [];

  // Filter jobs based on search and location
  const filteredJobs = activeJobs.filter((job: any) => {
    const matchesSearch =
      !searchQuery ||
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.employer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation =
      !selectedLocation || job.location?.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter
  const locations = Array.from(
    new Set(activeJobs.map((job: any) => job.location).filter(Boolean))
  );

  const handleApply = (job: any) => {
    if (role === "student") {
      setSelectedJob(job);
      setIsModalOpen(true);
    } else {
      navigate(`/dashboard/jobs/${job.job_id}`);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    // Refetch student applications to update applied status
    if (role === "student") {
      refetchApplications();
    }
  };

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

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            Failed to load active jobs. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckBadgeIcon className="h-8 w-8 text-green-600" />
            Active Jobs
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredJobs.length} jobs found
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location Filter */}
          <div className="relative md:w-64">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Locations</option>
              {locations.map((location: string) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-[#ede7f8] text-center">
          <CheckBadgeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || selectedLocation
              ? "No jobs found matching your criteria"
              : "No active jobs available"}
          </h3>
          <p className="text-gray-600">
            {searchQuery || selectedLocation
              ? "Try adjusting your search or filters"
              : "There are no active job postings at the moment. Check back later!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job: any) => {
            const employerName = job.employer?.full_name || "Unknown Employer";
            const companyInitial = employerName.charAt(0).toUpperCase();
            const isSaved = savedJobs.has(job.job_id);

            return (
              <div
                key={job.job_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5"
              >
                <div className="flex gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[#6941C6] to-[#2d1b69] flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {companyInitial}
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3
                          onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer mb-1"
                        >
                          {job.job_title}
                        </h3>
                        <p className="text-gray-700 font-medium mb-2">
                          {employerName}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSaveJob(job.job_id)}
                        className="flex-shrink-0 ml-4 p-2 hover:bg-gray-100 rounded-full transition"
                        title={isSaved ? "Remove from saved" : "Save job"}
                      >
                        {isSaved ? (
                          <BookmarkSolidIcon className="h-5 w-5 text-blue-600" />
                        ) : (
                          <BookmarkIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Job Info Row */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        ${job.budget?.toLocaleString() || "Not specified"}
                      </span>
                      {job.duration && (
                        <span className="flex items-center gap-1">
                          <BriefcaseIcon className="h-4 w-4" />
                          {job.duration}
                        </span>
                      )}
                      {job.created_at && (
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          Posted {formatRelativeTime(job.created_at)}
                        </span>
                      )}
                    </div>

                    {/* Job Description Preview */}
                    {job.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    {/* Skills/Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.category && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                      )}
                      {job.employment_type && (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          {job.employment_type}
                        </span>
                      )}
                      {job.experience_level && (
                        <span className="px-3 py-1 bg-[#f5f0fc] text-[#6941C6] rounded-full text-xs font-medium">
                          {job.experience_level}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {job.applications || 0} applicants
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex flex-col gap-2 ml-4">
                    {role === "student" ? (
                      <button
                        onClick={() => !appliedJobIds.has(job.job_id) && handleApply(job)}
                        disabled={appliedJobIds.has(job.job_id)}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition shadow-sm whitespace-nowrap min-w-[120px] ${
                          appliedJobIds.has(job.job_id)
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {appliedJobIds.has(job.job_id) ? "Applied" : "Apply Now"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/jobs/${job.job_id}`)}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm whitespace-nowrap min-w-[120px]"
                        >
                          View Details
                        </button>
                        {(role === "employer" || role === "superadmin") && (
                          <button
                            onClick={() =>
                              navigate(`/dashboard/jobs/${job.job_id}/applications`)
                            }
                            className="px-6 py-2.5 bg-[#2d1b69] hover:bg-[#1a1035] text-white rounded-lg font-semibold transition shadow-sm whitespace-nowrap min-w-[120px]"
                          >
                            Manage ({job.applications || 0})
                          </button>
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

export default ActiveJobs;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon,
  BookmarkIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useGetAllJobsQuery } from "../../services/api/jobsApi";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import ApplyJobModal from "../../components/ApplyJobModal";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";

const ActiveJobs: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const roleRaw = useSelector((state: any) => state.auth.role);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const { data, isLoading, error } = useGetAllJobsQuery(
    {
      status: "Active",
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(selectedLocation ? { location: selectedLocation } : {}),
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const { data: studentApplications, refetch: refetchApplications } =
    useGetStudentApplicationsQuery(undefined, {
      skip: role !== "student",
    });
  // Create a Set of job IDs the student has applied to
  const appliedJobIds = new Set(
    (studentApplications?.data || []).map((app: any) => app.job_id),
  );

  const activeJobs = data?.data || [];
  const isFundedJob = (fundingStatus?: string | null) =>
    fundingStatus === "Funded" || fundingStatus === "Paid";

  const filteredJobs = activeJobs.filter((job: any) => {
    if (role === "student" && !isFundedJob(job.funding_status)) {
      return false;
    }
    return true;
  });

  // Get unique locations for filter
  const locations = Array.from(
    new Set(activeJobs.map((job: any) => job.location).filter(Boolean)),
  );

  const handleApply = (job: any) => {
    if (job.status === "Completed") return;
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
            {t("pages.jobs.failedToLoadActive")}
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
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <CheckBadgeIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("pages.jobs.activeJobsTitle")}
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            {t("pages.jobs.jobsFound", { count: filteredJobs.length })}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("pages.jobs.searchPlaceholderActive")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Location Filter */}
            <div className="relative md:w-72">
              <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white transition"
              >
                <option value="">{t("pages.jobs.allLocations")}</option>
                {locations.map((location: string) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="px-6 py-16 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CheckBadgeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedLocation
                ? t("pages.jobs.noJobsMatching")
                : t("pages.jobs.noActiveJobsAvailable")}
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedLocation
                ? t("pages.jobs.tryAdjusting")
                : t("pages.jobs.noActiveCheckBack")}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Result Count */}
          <div className="mb-6 text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredJobs.length}
            </span>{" "}
            active job{filteredJobs.length !== 1 ? "s" : ""}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {filteredJobs.map((job: any) => {
              const employerName =
                job.employer?.full_name || t("pages.jobs.unknownEmployer");
              const companyInitial = employerName.charAt(0).toUpperCase();
              const isSaved = savedJobs.has(job.job_id);
              const isCompletedJob = job.status === "Completed";
              const hasAlreadyApplied = appliedJobIds.has(job.job_id);
              const isApplyDisabled = hasAlreadyApplied || isCompletedJob;

              return (
                <div
                  key={job.job_id}
                  className="group w-full h-full bg-white rounded-2xl border border-slate-100 hover:border-green-300 shadow-sm hover:shadow-lg hover:shadow-green-100/40 transition-all duration-300 overflow-hidden"
                >
                  {/* Top colored bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-400"></div>

                  <div className="flex flex-col h-full p-5">
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                          {companyInitial}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 flex flex-col min-w-0">
                            <h3
                              onClick={() =>
                                navigate(`/dashboard/jobs/${job.job_id}`)
                              }
                              className="text-base font-semibold text-green-600 hover:text-green-800 cursor-pointer mb-0.5"
                            >
                              {job.job_title}
                            </h3>
                            <p className="text-gray-700 font-medium text-sm mb-2">
                              {employerName}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleSaveJob(job.job_id)}
                            className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-full transition"
                            title={
                              isSaved
                                ? t("pages.jobs.removeFromSaved")
                                : t("pages.jobs.saveJob")
                            }
                          >
                            {isSaved ? (
                              <BookmarkSolidIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <BookmarkIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>

                        {/* Job Info Row */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="h-3.5 w-3.5" />$
                            {job.budget?.toLocaleString() ||
                              t("pages.jobs.notSpecified")}
                          </span>
                          {job.duration && (
                            <span className="flex items-center gap-1">
                              <BriefcaseIcon className="h-3.5 w-3.5" />
                              {job.duration}
                            </span>
                          )}
                          {job.created_at && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3.5 w-3.5" />
                              {t("pages.jobs.posted")}{" "}
                              {formatRelativeTime(job.created_at)}
                            </span>
                          )}
                        </div>

                        {/* Job Description Preview */}
                        {job.description && (
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        )}

                        {/* Skills/Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.category && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {job.category}
                            </span>
                          )}
                          {job.employment_type && (
                            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                              {job.employment_type}
                            </span>
                          )}
                          {job.experience_level && (
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                              {job.experience_level}
                            </span>
                          )}
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                            <SparklesIcon className="h-3 w-3" />
                            {job.applications || 0} {t("pages.jobs.applicants")}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {role === "student" ? (
                            <div className="relative group inline-block">
                              <button
                                onClick={() =>
                                  !isApplyDisabled && handleApply(job)
                                }
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
                                  isApplyDisabled
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                              >
                                <ArrowRightIcon className="h-4 w-4" />
                                {hasAlreadyApplied
                                  ? t("pages.jobs.applied")
                                  : isCompletedJob
                                    ? t("pages.jobs.completed", {
                                        defaultValue: "Completed",
                                      })
                                    : t("pages.jobs.applyNow")}
                              </button>
                              {isCompletedJob && (
                                <div className="pointer-events-none absolute left-1/2 bottom-full z-10 mb-2 w-56 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-center text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                  {t("pages.jobs.completedNoApplyMessage", {
                                    defaultValue:
                                      "This job is already completed, so applications are closed.",
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  navigate(`/dashboard/jobs/${job.job_id}`)
                                }
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                <ArrowRightIcon className="h-4 w-4" />
                                {t("pages.jobs.viewDetails")}
                              </button>
                              {(role === "employer" ||
                                role === "superadmin") && (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/jobs/${job.job_id}/applications`,
                                    )
                                  }
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm whitespace-nowrap text-xs flex-1 min-w-[160px] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <BriefcaseIcon className="h-4 w-4" />
                                  Manage ({job.applications || 0})
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

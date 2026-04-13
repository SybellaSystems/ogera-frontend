import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import JobCard from "../../components/Jobs/JobCard";
import { useGetEmployerTaskOverviewQuery } from "../../services/api/tasksApi";

const EmployerTasks: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetEmployerTaskOverviewQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const jobs = data?.data || [];

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.job_title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || 
        (filterStatus === "active" && job.overall_progress < 100) ||
        (filterStatus === "completed" && job.overall_progress === 100);

      return matchesSearch && matchesFilter;
    });
  }, [jobs, searchQuery, filterStatus]);

  const handleManageTasks = (jobId: string) => {
    navigate(`/dashboard/jobs/${jobId}/tasks`);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        Unable to load task management jobs right now.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-[#7f56d9] to-[#6e48c7] p-3">
            <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Task Management</h1>
        </div>
        <p className="text-base text-gray-600">
          Manage all active jobs and track task progress across your teams.
        </p>
      </div>

      {/* Search & Filter Section */}
      {jobs.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 py-3 text-sm outline-none transition focus:border-[#7f56d9] focus:ring-2 focus:ring-[#f5f3ff]"
            />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-[#7f56d9] focus:ring-2 focus:ring-[#f5f3ff]"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      )}

      {/* Jobs Grid or Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <BriefcaseIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {jobs.length === 0
              ? "No active jobs ready for tasks"
              : "No jobs match your search"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {jobs.length === 0
              ? "Create or activate a job first, then approve applicants before assigning tasks."
              : "Try adjusting your search criteria or filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.job_id}
              job={job}
              onManageClick={handleManageTasks}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {jobs.length > 0 && filteredJobs.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2">
          <span className="font-semibold text-gray-900">{filteredJobs.length}</span>
          <span>
            {filteredJobs.length === 1 ? "job" : "jobs"} showing
          </span>
        </div>
      )}
    </div>
  );
};

export default EmployerTasks;

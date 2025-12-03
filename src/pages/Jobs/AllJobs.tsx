import React from "react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

const AllJobs: React.FC = () => {
  const jobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Google",
      location: "Remote",
      salary: "$80-100K",
      status: "Active",
      posted: "2024-03-10",
      applicants: 45,
    },
    {
      id: 2,
      title: "Data Analyst",
      company: "Microsoft",
      location: "Seattle, WA",
      salary: "$70-90K",
      status: "Active",
      posted: "2024-03-12",
      applicants: 32,
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "Amazon",
      location: "Remote",
      salary: "$75-95K",
      status: "Closed",
      posted: "2024-03-05",
      applicants: 28,
    },
    {
      id: 4,
      title: "Backend Engineer",
      company: "Tesla",
      location: "Austin, TX",
      salary: "$90-120K",
      status: "Active",
      posted: "2024-03-14",
      applicants: 67,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <BriefcaseIcon className="h-10 w-10 text-purple-600" />
            All Jobs
          </h1>
          <p className="text-gray-500 mt-2">
            Browse and manage all job postings
          </p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md">
          + Post New Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Total Jobs</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">1,480</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Active Jobs</p>
          <p className="text-3xl font-bold text-green-900 mt-2">842</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Applicants</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">12,450</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Pending Review</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">38</p>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {job.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="text-gray-600 font-medium mb-3">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary}</span>
                  <span>👥 {job.applicants} applicants</span>
                  <span>📅 Posted {job.posted}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-6">
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition whitespace-nowrap">
                  View Details
                </button>
                <button className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition whitespace-nowrap">
                  View Applicants
                </button>
                <button className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition whitespace-nowrap">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllJobs;

import React from "react";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

const ActiveJobs: React.FC = () => {
  const activeJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Google",
      salary: "$120-150K",
      applicants: 89,
      deadline: "2024-04-15",
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Meta",
      salary: "$110-140K",
      applicants: 56,
      deadline: "2024-04-20",
    },
    {
      id: 3,
      title: "DevOps Engineer",
      company: "Netflix",
      salary: "$100-130K",
      applicants: 34,
      deadline: "2024-04-10",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <CheckBadgeIcon className="h-10 w-10 text-green-600" />
          Active Jobs
        </h1>
        <p className="text-gray-500 mt-2">
          Currently open and accepting applications
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
        <p className="text-green-800 font-medium">
          ✓ {activeJobs.length} jobs actively hiring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
                {job.company.charAt(0)}
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Active
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium mb-4">{job.company}</p>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>💰 {job.salary}</p>
              <p>👥 {job.applicants} applicants</p>
              <p>⏰ Deadline: {job.deadline}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm">
                View
              </button>
              <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition text-sm">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveJobs;

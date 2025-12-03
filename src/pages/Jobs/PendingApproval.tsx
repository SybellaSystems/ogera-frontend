import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

const PendingApproval: React.FC = () => {
  const pendingJobs = [
    { id: 1, title: "Machine Learning Engineer", company: "OpenAI", salary: "$150-180K", submittedDate: "2024-03-15", employer: "hr@openai.com" },
    { id: 2, title: "Blockchain Developer", company: "Coinbase", salary: "$140-170K", submittedDate: "2024-03-14", employer: "jobs@coinbase.com" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <ClockIcon className="h-10 w-10 text-orange-600" />
          Pending Approval
        </h1>
        <p className="text-gray-500 mt-2">Job postings awaiting admin approval</p>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
        <p className="text-orange-800 font-medium">⚠️ {pendingJobs.length} jobs waiting for approval</p>
      </div>

      <div className="space-y-4">
        {pendingJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-gray-600 font-medium mb-3">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>💰 {job.salary}</span>
                  <span>📧 {job.employer}</span>
                  <span>📅 Submitted: {job.submittedDate}</span>
                </div>
              </div>
              <div className="flex gap-3 ml-6">
                <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap">
                  Approve
                </button>
                <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap">
                  Reject
                </button>
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap">
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingApproval;


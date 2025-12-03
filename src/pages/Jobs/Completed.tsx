import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const Completed: React.FC = () => {
  const completedJobs = [
    { id: 1, title: "Junior Developer", company: "Apple", hiredStudent: "John Doe", completedDate: "2024-02-28", rating: 4.8 },
    { id: 2, title: "Intern - Marketing", company: "Amazon", hiredStudent: "Sarah Smith", completedDate: "2024-02-25", rating: 4.9 },
    { id: 3, title: "Data Entry Clerk", company: "IBM", hiredStudent: "Mike Johnson", completedDate: "2024-02-20", rating: 4.5 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <CheckCircleIcon className="h-10 w-10 text-blue-600" />
          Completed Jobs
        </h1>
        <p className="text-gray-500 mt-2">Successfully completed job assignments</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <p className="text-blue-800 font-medium">✓ {completedJobs.length} jobs completed this month</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Job Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hired Student</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Completed Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {completedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                <td className="px-6 py-4 text-gray-600">{job.company}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {job.hiredStudent.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{job.hiredStudent}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{job.completedDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="font-semibold text-gray-900">{job.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Report</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Completed;


import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const PerformanceTrack: React.FC = () => {
  const students = [
    {
      id: 1,
      name: "John Doe",
      university: "MIT",
      gpa: "3.8",
      jobsCompleted: 12,
      rating: 4.8,
      earnings: "$2,450",
    },
    {
      id: 2,
      name: "Emily Davis",
      university: "Stanford",
      gpa: "3.9",
      jobsCompleted: 18,
      rating: 4.9,
      earnings: "$3,200",
    },
    {
      id: 3,
      name: "Michael Chen",
      university: "Harvard",
      gpa: "3.7",
      jobsCompleted: 8,
      rating: 4.5,
      earnings: "$1,800",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <ChartBarIcon className="h-10 w-10 text-purple-600" />
          Performance Track
        </h1>
        <p className="text-gray-500 mt-2">
          Monitor student performance and job completion metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Avg Performance</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">4.7/5.0</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Total Jobs</p>
          <p className="text-3xl font-bold text-green-900 mt-2">1,245</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Completion Rate</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">94%</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Total Earnings</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">$124K</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Student
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                University
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                GPA
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Jobs Completed
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Earnings
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">
                      {student.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {student.university}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {student.gpa}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {student.jobsCompleted}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="font-semibold text-gray-900">
                      {student.rating}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-semibold">
                  {student.earnings}
                </td>
                <td className="px-6 py-4">
                  <button className="text-purple-600 hover:text-purple-800 font-medium text-sm">
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceTrack;

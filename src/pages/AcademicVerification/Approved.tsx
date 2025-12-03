import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const Approved: React.FC = () => {
  const approved = [
    {
      id: 1,
      student: "Sarah Wilson",
      university: "Yale",
      degree: "Medicine",
      gpa: "3.9",
      approvedDate: "2024-03-05",
      approvedBy: "Admin",
    },
    {
      id: 2,
      student: "David Lee",
      university: "Princeton",
      degree: "Physics",
      gpa: "3.8",
      approvedDate: "2024-03-03",
      approvedBy: "Admin",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
          Approved Verifications
        </h1>
        <p className="text-gray-500 mt-2">
          Successfully verified academic credentials
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
        <p className="text-green-800 font-medium">
          ✓ {approved.length} verifications approved this week
        </p>
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
                Degree
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                GPA
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Approved Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {approved.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                      {item.student.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">
                      {item.student}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {item.university}
                </td>
                <td className="px-6 py-4 text-gray-600">{item.degree}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {item.gpa}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.approvedDate}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    View Details
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

export default Approved;

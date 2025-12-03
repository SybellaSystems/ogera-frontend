import React from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

const Rejected: React.FC = () => {
  const rejected = [
    {
      id: 1,
      student: "Tom Anderson",
      university: "Unknown",
      reason: "Invalid documents",
      rejectedDate: "2024-03-08",
    },
    {
      id: 2,
      student: "Lisa Brown",
      university: "ABC College",
      reason: "Incomplete information",
      rejectedDate: "2024-03-06",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <XCircleIcon className="h-10 w-10 text-red-600" />
          Rejected Verifications
        </h1>
        <p className="text-gray-500 mt-2">
          Academic verification requests that were rejected
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 font-medium">
          ✗ {rejected.length} verifications rejected this week
        </p>
      </div>

      <div className="space-y-4">
        {rejected.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-6 shadow-md border border-red-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
                  {item.student.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.student}
                  </h3>
                  <p className="text-sm text-gray-500">{item.university}</p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 font-medium">
                      Reason:{" "}
                    </span>
                    <span className="text-sm text-red-600 font-semibold">
                      {item.reason}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Rejected on: {item.rejectedDate}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                  Review Again
                </button>
                <button className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rejected;

import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

const PendingApproval: React.FC = () => {
  const pendingUsers = [
    {
      id: 1,
      name: "Alice Cooper",
      email: "alice@example.com",
      role: "Student",
      requestDate: "2024-03-15",
      university: "MIT",
    },
    {
      id: 2,
      name: "Bob Martin",
      email: "bob@company.com",
      role: "Employer",
      requestDate: "2024-03-14",
      company: "Tech Corp",
    },
    {
      id: 3,
      name: "Carol White",
      email: "carol@example.com",
      role: "Student",
      requestDate: "2024-03-13",
      university: "Stanford",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <ClockIcon className="h-10 w-10 text-orange-600" />
          Pending Approval
        </h1>
        <p className="text-gray-500 mt-2">
          Review and approve new user registrations
        </p>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
        <p className="text-orange-800 font-medium">
          ⚠️ {pendingUsers.length} users waiting for approval
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        {pendingUsers.map((user) => (
          <div
            key={user.id}
            className="p-6 border-b border-gray-200 last:border-none hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {user.role}
                    </span>
                    {user.role === "Student" && (
                      <span className="text-sm text-gray-500">
                        {user.university}
                      </span>
                    )}
                    {user.role === "Employer" && (
                      <span className="text-sm text-gray-500">
                        {user.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md">
                  Approve
                </button>
                <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-md">
                  Reject
                </button>
                <button className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition">
                  View Details
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Requested on: {user.requestDate}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingApproval;

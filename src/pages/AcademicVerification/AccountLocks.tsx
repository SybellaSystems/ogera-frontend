import React from "react";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const AccountLocks: React.FC = () => {
  const lockedAccounts = [
    {
      id: 1,
      name: "Robert Smith",
      reason: "Suspicious activity",
      lockedDate: "2024-03-10",
      duration: "7 days",
    },
    {
      id: 2,
      name: "Anna Johnson",
      reason: "Multiple violations",
      lockedDate: "2024-03-08",
      duration: "30 days",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <LockClosedIcon className="h-10 w-10 text-red-600" />
          Account Locks
        </h1>
        <p className="text-gray-500 mt-2">
          Manage suspended and locked user accounts
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 font-medium">
          🔒 {lockedAccounts.length} accounts currently locked
        </p>
      </div>

      <div className="space-y-4">
        {lockedAccounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-xl p-6 shadow-md border border-red-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <LockClosedIcon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {account.name}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span>{" "}
                      {account.reason}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Locked on:</span>{" "}
                      {account.lockedDate}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span>{" "}
                      {account.duration}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md">
                  Unlock
                </button>
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md">
                  View History
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountLocks;

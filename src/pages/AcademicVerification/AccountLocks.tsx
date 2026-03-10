import React from "react";
import { useTranslation } from "react-i18next";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const AccountLocks: React.FC = () => {
  const { t } = useTranslation();
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
    <div className="academic-page theme-page-bg space-y-6 animate-fadeIn p-4 min-h-full">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <LockClosedIcon className="h-10 w-10 text-red-600" />
          {t("pages.academic.accountLocks")}
        </h1>
        <p className="text-gray-500 mt-2">
          {t("pages.academic.accountLocksSubtitle")}
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 font-medium">
          🔒 {t("pages.academic.accountsLocked", { count: lockedAccounts.length })}
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
                      <span className="font-medium">{t("pages.academic.lockedReason")}:</span>{" "}
                      {account.reason}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t("pages.academic.lockedOn")}:</span>{" "}
                      {account.lockedDate}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t("pages.academic.duration")}:</span>{" "}
                      {account.duration}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md">
                  {t("pages.academic.unlock")}
                </button>
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md">
                  {t("pages.academic.viewHistory")}
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

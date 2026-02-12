import React, { useState } from "react";
import {
  LockClosedIcon,
  LockOpenIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  useGetLockedAccountsQuery,
  useUnlockUserAccountMutation,
} from "../../services/api/usersApi";

const AccountLocks: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useGetLockedAccountsQuery({
    page,
    limit,
  });

  const [unlockAccount, { isLoading: isUnlocking }] = useUnlockUserAccountMutation();

  const lockedAccounts = data?.data || [];
  const pagination = data?.pagination;

  const handleUnlock = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to unlock ${userName}'s account?`)) {
      try {
        await unlockAccount(userId).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to unlock account:", err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LockClosedIcon className="h-6 w-6 text-red-600" />
          <h1 className="text-xl font-bold text-gray-900">Account Locks</h1>
        </div>
        <p className="text-xs text-gray-500">
          {pagination?.total || 0} locked accounts
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
        <p className="text-sm text-red-800 font-medium flex items-center gap-2">
          <LockClosedIcon className="h-4 w-4" />
          {lockedAccounts.length} accounts currently locked
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>
            {"status" in error && (error as any).status === 403
              ? "Access denied. Only admins can view locked accounts."
              : "Failed to load locked accounts"}
          </span>
          {"status" in error && (error as any).status !== 403 && (
            <button onClick={() => refetch()} className="ml-auto text-red-700 underline">
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
          <span className="text-xs text-gray-500 ml-2">Loading...</span>
        </div>
      ) : lockedAccounts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <LockOpenIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No locked accounts</p>
          <p className="text-xs text-gray-400 mt-1">All accounts are active</p>
        </div>
      ) : (
        <>
          {/* Locked Accounts List */}
          <div className="space-y-2">
            {lockedAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-red-100 hover:border-red-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                      <LockClosedIcon className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {account.name}
                        </h3>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600">
                          {account.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{account.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUnlock(account.id, account.name)}
                      disabled={isUnlocking}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition disabled:opacity-50 flex items-center gap-1"
                    >
                      <LockOpenIcon className="h-3 w-3" />
                      Unlock
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Reason</p>
                    <p className="font-medium text-gray-900 truncate">{account.reason}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Locked On</p>
                    <p className="font-medium text-gray-900">{formatDate(account.lockedDate)}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{account.duration}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Locked By</p>
                    <p className="font-medium text-gray-900 truncate">{account.lockedBy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-gray-500">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccountLocks;

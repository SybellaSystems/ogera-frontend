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
import { useTheme } from "../../context/ThemeContext";

const AccountLocks: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
    <div
      className="space-y-4 animate-fadeIn"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)"
          : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LockClosedIcon
            className="h-6 w-6"
            style={{ color: isDark ? "#f87171" : "#dc2626" }}
          />
          <h1
            className="text-xl font-bold"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            Account Locks
          </h1>
        </div>
        <p
          className="text-xs"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          {pagination?.total || 0} locked accounts
        </p>
      </div>

      {/* Summary Card */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: isDark ? "rgba(127, 29, 29, 0.25)" : "#fef2f2",
          border: isDark
            ? "1px solid rgba(127, 29, 29, 0.5)"
            : "1px solid #fecaca",
        }}
      >
        <p
          className="text-sm font-medium flex items-center gap-2"
          style={{ color: isDark ? "#fca5a5" : "#991b1b" }}
        >
          <LockClosedIcon className="h-4 w-4" />
          {lockedAccounts.length} accounts currently locked
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="text-xs rounded px-3 py-2 flex items-center gap-2"
          style={{
            backgroundColor: isDark ? "rgba(127, 29, 29, 0.2)" : "#fef2f2",
            border: isDark
              ? "1px solid rgba(127, 29, 29, 0.4)"
              : "1px solid #fecaca",
            color: isDark ? "#fca5a5" : "#dc2626",
          }}
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>
            {"status" in error && (error as any).status === 403
              ? "Access denied. Only admins can view locked accounts."
              : "Failed to load locked accounts"}
          </span>
          {"status" in error && (error as any).status !== 403 && (
            <button
              onClick={() => refetch()}
              className="ml-auto underline"
              style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon
            className="h-5 w-5 animate-spin"
            style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}
          />
          <span
            className="text-xs ml-2"
            style={{ color: isDark ? "#d1d5db" : "#6b7280" }}
          >
            Loading...
          </span>
        </div>
      ) : lockedAccounts.length === 0 ? (
        /* Empty State */
        <div
          className="text-center py-8 rounded-lg"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#f9fafb",
            border: isDark
              ? "1px dashed rgba(45, 27, 105, 0.5)"
              : "1px dashed #e5e7eb",
          }}
        >
          <LockOpenIcon
            className="h-8 w-8 mx-auto mb-2"
            style={{ color: isDark ? "#4b5563" : "#d1d5db" }}
          />
          <p
            className="text-sm"
            style={{ color: isDark ? "#d1d5db" : "#6b7280" }}
          >
            No locked accounts
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}
          >
            All accounts are active
          </p>
        </div>
      ) : (
        <>
          {/* Locked Accounts List */}
          <div className="space-y-2">
            {lockedAccounts.map((account) => (
              <div
                key={account.id}
                className="rounded-lg p-4 shadow-sm transition-all"
                style={{
                  backgroundColor: isDark ? "#1e1833" : "#ffffff",
                  border: isDark
                    ? "1px solid rgba(45, 27, 105, 0.5)"
                    : "1px solid #fecaca",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(127, 29, 29, 0.3)"
                          : "#fee2e2",
                        color: isDark ? "#f87171" : "#dc2626",
                      }}
                    >
                      <LockClosedIcon className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-sm font-semibold truncate"
                          style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                        >
                          {account.name}
                        </h3>
                        <span
                          className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                          style={{
                            backgroundColor: isDark
                              ? "rgba(45, 27, 105, 0.5)"
                              : "#f3f4f6",
                            color: isDark ? "#c084fc" : "#4b5563",
                          }}
                        >
                          {account.role}
                        </span>
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                      >
                        {account.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUnlock(account.id, account.name)}
                      disabled={isUnlocking}
                      className="px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50 flex items-center gap-1"
                      style={{
                        backgroundColor: isDark ? "#16a34a" : "#16a34a",
                        color: "#ffffff",
                      }}
                    >
                      <LockOpenIcon className="h-3 w-3" />
                      Unlock
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Reason - prominently styled */}
                  <div
                    className="p-2 rounded"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(194, 65, 12, 0.2)"
                        : "#fff7ed",
                      border: isDark
                        ? "1px solid rgba(194, 65, 12, 0.4)"
                        : "1px solid #fed7aa",
                    }}
                  >
                    <p
                      style={{
                        color: isDark ? "#fdba74" : "#c2410c",
                        fontWeight: 600,
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Reason
                    </p>
                    <p
                      className="truncate"
                      style={{
                        color: isDark ? "#fed7aa" : "#9a3412",
                        fontWeight: 700,
                      }}
                    >
                      {account.reason}
                    </p>
                  </div>
                  <div
                    className="p-2 rounded"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(45, 27, 105, 0.25)"
                        : "#f9fafb",
                    }}
                  >
                    <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                      Locked On
                    </p>
                    <p
                      className="font-medium"
                      style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                    >
                      {formatDate(account.lockedDate)}
                    </p>
                  </div>
                  <div
                    className="p-2 rounded"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(45, 27, 105, 0.25)"
                        : "#f9fafb",
                    }}
                  >
                    <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                      Duration
                    </p>
                    <p
                      className="font-medium"
                      style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                    >
                      {account.duration}
                    </p>
                  </div>
                  <div
                    className="p-2 rounded"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(45, 27, 105, 0.25)"
                        : "#f9fafb",
                    }}
                  >
                    <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                      Locked By
                    </p>
                    <p
                      className="font-medium truncate"
                      style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                    >
                      {account.lockedBy}
                    </p>
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
                className="px-2 py-1 rounded disabled:opacity-50"
                style={{
                  backgroundColor: isDark
                    ? "rgba(45, 27, 105, 0.4)"
                    : "#f3f4f6",
                  color: isDark ? "#d1d5db" : "#4b5563",
                }}
              >
                Prev
              </button>
              <span style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-2 py-1 rounded disabled:opacity-50"
                style={{
                  backgroundColor: isDark
                    ? "rgba(45, 27, 105, 0.4)"
                    : "#f3f4f6",
                  color: isDark ? "#d1d5db" : "#4b5563",
                }}
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

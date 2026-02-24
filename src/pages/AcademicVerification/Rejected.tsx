import React, { useEffect, useState } from "react";
import {
  XCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import { getAcademicVerificationsByStatus } from "../../services/api/academicVerificationApi";
import { useTheme } from "../../context/ThemeContext";
import AcademicVerificationDetailModal from "../../components/AcademicVerificationDetailModal";

const Rejected: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [rejected, setRejected] = useState<AcademicVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] =
    useState<AcademicVerification | null>(null);

  useEffect(() => {
    const loadRejected = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAcademicVerificationsByStatus("rejected", {
          page: 1,
          limit: 50,
        });
        setRejected(res.data || []);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load rejected verifications";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void loadRejected();
  }, []);

  return (
    <div
      className="space-y-6 animate-fadeIn p-4 min-h-full"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)"
          : undefined,
        borderRadius: "0.5rem",
      }}
    >
      <div>
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold flex items-center gap-3"
          style={{ color: isDark ? "#f3f4f6" : "#111827" }}
        >
          <XCircleIcon
            className="h-8 w-8 sm:h-10 sm:w-10"
            style={{ color: isDark ? "#f87171" : "#dc2626" }}
          />
          Rejected Verifications
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          Review rejected academic verification requests and resubmit with
          corrections
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: isDark ? "rgba(220,38,38,0.1)" : undefined,
            border: isDark
              ? "1px solid rgba(220,38,38,0.25)"
              : "1px solid #fecaca",
            background: isDark
              ? undefined
              : "linear-gradient(to bottom right, #fef2f2, #fee2e2)",
          }}
        >
          <div className="flex items-center gap-3">
            <XCircleIcon
              className="h-6 w-6 flex-shrink-0"
              style={{ color: isDark ? "#f87171" : "#dc2626" }}
            />
            <div>
              <p
                className="font-medium text-lg"
                style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}
              >
                {rejected.length} Rejection
                {rejected.length !== 1 ? "s" : ""}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: isDark ? "#f87171" : "#dc2626" }}
              >
                Awaiting your action
              </p>
            </div>
          </div>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: isDark ? "rgba(245,158,11,0.1)" : undefined,
            border: isDark
              ? "1px solid rgba(245,158,11,0.25)"
              : "1px solid #fde68a",
            background: isDark
              ? undefined
              : "linear-gradient(to bottom right, #fffbeb, #fef3c7)",
          }}
        >
          <div className="flex items-center gap-3">
            <ClipboardDocumentListIcon
              className="h-6 w-6 flex-shrink-0"
              style={{ color: isDark ? "#fbbf24" : "#d97706" }}
            />
            <div>
              <p
                className="font-medium text-lg"
                style={{ color: isDark ? "#fbbf24" : "#92400e" }}
              >
                Next Step
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: isDark ? "#f59e0b" : "#d97706" }}
              >
                Review feedback & resubmit
              </p>
            </div>
          </div>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: isDark ? "rgba(59,130,246,0.1)" : undefined,
            border: isDark
              ? "1px solid rgba(59,130,246,0.25)"
              : "1px solid #bfdbfe",
            background: isDark
              ? undefined
              : "linear-gradient(to bottom right, #eff6ff, #dbeafe)",
          }}
        >
          <div className="flex items-center gap-3">
            <LightBulbIcon
              className="h-6 w-6 flex-shrink-0"
              style={{ color: isDark ? "#60a5fa" : "#2563eb" }}
            />
            <div>
              <p
                className="font-medium text-lg"
                style={{ color: isDark ? "#60a5fa" : "#1e40af" }}
              >
                Tip
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: isDark ? "#3b82f6" : "#2563eb" }}
              >
                Address all noted issues
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="text-sm rounded-lg px-4 py-3 flex items-start gap-3"
          style={{
            backgroundColor: isDark ? "rgba(220,38,38,0.1)" : "#fef2f2",
            border: `1px solid ${isDark ? "rgba(220,38,38,0.25)" : "#fecaca"}`,
            color: isDark ? "#fca5a5" : "#dc2626",
          }}
        >
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error Loading Verifications</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin mb-4">
            <ArrowPathIcon
              className="h-8 w-8"
              style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}
            />
          </div>
          <p
            className="text-sm"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Loading rejected verifications...
          </p>
        </div>
      ) : rejected.length === 0 ? (
        <div
          className="text-center py-12 rounded-xl"
          style={{
            backgroundColor: isDark ? "rgba(45,27,105,0.1)" : "#f9fafb",
            border: `2px dashed ${isDark ? "rgba(45,27,105,0.3)" : "#d1d5db"}`,
          }}
        >
          <XCircleIcon
            className="h-12 w-12 mx-auto mb-3"
            style={{ color: isDark ? "#4b5563" : "#d1d5db" }}
          />
          <p
            className="text-lg font-medium"
            style={{ color: isDark ? "#f3f4f6" : "#374151" }}
          >
            No Rejected Verifications
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Great news! All your submissions have been approved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rejected.map((item) => (
            <div
              key={item.id}
              className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1e1833" : "#ffffff",
                border: isDark
                  ? "2px solid rgba(220,38,38,0.2)"
                  : "2px solid #fecaca",
              }}
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                className="w-full text-left p-6 transition-colors"
                style={{
                  backgroundColor: "transparent",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(220,38,38,0.15)"
                          : "#fef2f2",
                        color: isDark ? "#f87171" : "#dc2626",
                      }}
                    >
                      {item.user?.full_name?.charAt(0)?.toUpperCase() ||
                        item.user_id.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: isDark ? "#f3f4f6" : "#111827" }}
                      >
                        {item.user?.full_name ||
                          `User ${item.user_id.slice(0, 8)}`}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                      >
                        {item.user?.email || "N/A"}
                      </p>
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="inline-flex items-start gap-2">
                          <span
                            className="text-xs font-medium px-2 py-1 rounded"
                            style={{
                              backgroundColor: isDark
                                ? "rgba(45,27,105,0.2)"
                                : "#f3f4f6",
                              color: isDark ? "#d1d5db" : "#374151",
                            }}
                          >
                            Rejection Reason:
                          </span>
                          <span
                            className="text-sm font-semibold px-2 py-1 rounded"
                            style={{
                              backgroundColor: isDark
                                ? "rgba(220,38,38,0.1)"
                                : "#fef2f2",
                              color: isDark ? "#fca5a5" : "#dc2626",
                            }}
                          >
                            {item.rejection_reason || "No reason provided"}
                          </span>
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
                        >
                          Rejected on{" "}
                          {item.reviewed_at
                            ? new Date(item.reviewed_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-200 flex-shrink-0 ${
                      expandedId === item.id ? "rotate-180" : ""
                    }`}
                    style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}
                  />
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === item.id && (
                <div
                  className="p-6 space-y-4"
                  style={{
                    borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}`,
                    backgroundColor: isDark
                      ? "rgba(45,27,105,0.08)"
                      : "#f9fafb",
                  }}
                >
                  {/* Full Details Section */}
                  <div className="space-y-3">
                    <h4
                      className="font-semibold text-sm"
                      style={{ color: isDark ? "#f3f4f6" : "#111827" }}
                    >
                      Verification Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          label: "Submitted On",
                          value: new Date(
                            item.created_at
                          ).toLocaleDateString(),
                        },
                        {
                          label: "Storage Type",
                          value: item.storage_type || "N/A",
                        },
                        { label: "Status", value: "Rejected" },
                        {
                          label: "Reviewed By",
                          value: item.reviewer?.full_name || "System",
                        },
                      ].map((field) => (
                        <div
                          key={field.label}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: isDark ? "#0f0a1a" : "#ffffff",
                            border: `1px solid ${isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}`,
                          }}
                        >
                          <p
                            className="text-xs font-medium"
                            style={{
                              color: isDark ? "#9ca3af" : "#6b7280",
                            }}
                          >
                            {field.label}
                          </p>
                          <p
                            className="text-sm font-semibold mt-1"
                            style={{
                              color:
                                field.label === "Status"
                                  ? isDark
                                    ? "#f87171"
                                    : "#dc2626"
                                  : isDark
                                  ? "#e2e8f0"
                                  : "#111827",
                            }}
                          >
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rejection Reason Details */}
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(220,38,38,0.08)"
                        : "#fef2f2",
                      border: `1px solid ${isDark ? "rgba(220,38,38,0.2)" : "#fecaca"}`,
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-2"
                      style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}
                    >
                      Rejection Feedback
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: isDark ? "#f87171" : "#991b1b" }}
                    >
                      {item.rejection_reason ||
                        "No detailed feedback provided"}
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(59,130,246,0.08)"
                        : "#eff6ff",
                      border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "#bfdbfe"}`,
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-3"
                      style={{ color: isDark ? "#60a5fa" : "#1e40af" }}
                    >
                      Recommended Actions
                    </p>
                    <ul className="space-y-2 text-sm">
                      {[
                        "Review the rejection reason carefully",
                        "Gather required documents or correct information",
                        "Resubmit your verification with corrections",
                      ].map((step) => (
                        <li
                          key={step}
                          className="flex items-start gap-2"
                          style={{
                            color: isDark ? "#93c5fd" : "#1e40af",
                          }}
                        >
                          <span className="text-base mt-0.5">&#10003;</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      className="flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: isDark ? "#dc2626" : "#dc2626",
                      }}
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Resubmit Verification
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVerification(item);
                        setDetailModalOpen(true);
                      }}
                      className="flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition"
                      style={{
                        backgroundColor: isDark ? "#7c3aed" : "#7F56D9",
                      }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(45,27,105,0.2)"
                          : "#f3f4f6",
                        color: isDark ? "#d1d5db" : "#374151",
                        border: `1px solid ${isDark ? "rgba(45,27,105,0.3)" : "#d1d5db"}`,
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AcademicVerificationDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedVerification(null);
        }}
        verification={selectedVerification}
      />
    </div>
  );
};

export default Rejected;

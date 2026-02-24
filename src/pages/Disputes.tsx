import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useGetDisputesQuery, useGetDisputeStatsQuery } from "../services/api/disputeApi";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";

const Disputes: React.FC = () => {
  const role = useSelector((state: any) => state.auth.role);
  const navigate = useNavigate();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Non-admin users should be redirected to My Disputes
  const normalizedRole = role?.toLowerCase()?.trim() || "";
  const isAdmin = normalizedRole === "superadmin" || normalizedRole === "admin";
  if (!isAdmin) {
    return <Navigate to="/dashboard/disputes/my-disputes" replace />;
  }

  return <DisputesAdmin isDark={isDark} navigate={navigate} />;
};

const DisputesAdmin: React.FC<{ isDark: boolean; navigate: ReturnType<typeof useNavigate> }> = ({ isDark, navigate }) => {
  const { data: disputesData, isLoading: disputesLoading, error: disputesError, refetch } = useGetDisputesQuery();
  const { data: statsData, isLoading: statsLoading } = useGetDisputeStatsQuery();

  const disputes = disputesData?.data || [];
  const stats = statsData?.data;

  if (disputesLoading || statsLoading) {
    return (
      <div aria-busy="true" aria-label="Loading disputes" className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 animate-spin" style={{ color: "#7F56D9" }} />
        <span className="ml-2" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Loading disputes...</span>
      </div>
    );
  }

  if (disputesError) {
    return (
      <div
        className="space-y-4 animate-fadeIn"
        style={{
          background: isDark ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)" : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
          minHeight: "100%", padding: "1rem", borderRadius: "0.5rem",
        }}
      >
        <div
          role="alert"
          className="rounded-lg p-4 flex items-center gap-3"
          style={{
            backgroundColor: isDark ? "rgba(220, 38, 38, 0.15)" : "#fef2f2",
            border: isDark ? "1px solid rgba(220, 38, 38, 0.3)" : "1px solid #fecaca",
          }}
        >
          <ExclamationTriangleIcon className="h-6 w-6" style={{ color: isDark ? "#f87171" : "#ef4444" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: isDark ? "#fca5a5" : "#991b1b" }}>Failed to load disputes</p>
            <p className="text-xs mt-1" style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}>Please try again later</p>
          </div>
          <button
            onClick={() => refetch()}
            className="ml-auto px-3 py-1.5 rounded text-xs font-medium transition"
            style={{ backgroundColor: isDark ? "rgba(220,38,38,0.25)" : "#fee2e2", color: isDark ? "#fca5a5" : "#b91c1c" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 animate-fadeIn"
      style={{
        background: isDark ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)" : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%", padding: "1rem", borderRadius: "0.5rem",
      }}
    >
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
          <ExclamationTriangleIcon className="h-6 w-6" style={{ color: isDark ? "#f87171" : "#dc2626" }} />
          Disputes
        </h1>
        <p className="text-xs mt-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
          Manage and resolve disputes between students and employers
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
            border: isDark ? "1px solid rgba(220,38,38,0.3)" : "1px solid #fecaca",
          }}
          aria-label={`${stats?.byStatus?.open || 0} open disputes`}
        >
          <p className="text-xs font-medium" style={{ color: isDark ? "#f87171" : "#b91c1c" }}>Open Disputes</p>
          <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#f3f4f6" : "#991b1b" }}>{stats?.byStatus?.open || 0}</p>
        </div>
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: isDark ? "rgba(234,88,12,0.15)" : "#fff7ed",
            border: isDark ? "1px solid rgba(234,88,12,0.3)" : "1px solid #fed7aa",
          }}
          aria-label={`${stats?.byStatus?.inProgress || 0} disputes under review`}
        >
          <p className="text-xs font-medium" style={{ color: isDark ? "#fbbf24" : "#c2410c" }}>Under Review</p>
          <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#f3f4f6" : "#9a3412" }}>{stats?.byStatus?.inProgress || 0}</p>
        </div>
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: isDark ? "rgba(22,163,74,0.15)" : "#f0fdf4",
            border: isDark ? "1px solid rgba(22,163,74,0.3)" : "1px solid #bbf7d0",
          }}
          aria-label={`${stats?.resolvedThisMonth || 0} resolved this month`}
        >
          <p className="text-xs font-medium" style={{ color: isDark ? "#34d399" : "#15803d" }}>Resolved This Month</p>
          <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#f3f4f6" : "#166534" }}>{stats?.resolvedThisMonth || 0}</p>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div
          role="status"
          className="text-center py-8 rounded-lg"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px dashed rgba(45,27,105,0.5)" : "1px dashed #e5e7eb",
          }}
        >
          <ExclamationTriangleIcon className="h-10 w-10 mx-auto mb-2" style={{ color: isDark ? "#4b5563" : "#d1d5db" }} />
          <p className="text-sm font-medium" style={{ color: isDark ? "#d1d5db" : "#1f2937" }}>No disputes found</p>
          <p className="text-xs mt-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            All disputes will appear here when created
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <article
              key={dispute.dispute_id}
              aria-label={`Dispute: ${dispute.description} - Status: ${dispute.status}`}
              className="rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              style={{
                backgroundColor: isDark ? "#1e1833" : "#ffffff",
                border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
                borderLeft: `4px solid ${
                  dispute.status === "Open" ? (isDark ? "#f87171" : "#dc2626")
                  : dispute.status === "In Progress" ? (isDark ? "#fbbf24" : "#f59e0b")
                  : (isDark ? "#34d399" : "#16a34a")
                }`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      role="status"
                      aria-label={`Status: ${dispute.status}`}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={
                        dispute.status === "Open"
                          ? { backgroundColor: isDark ? "rgba(220,38,38,0.15)" : "#fee2e2", color: isDark ? "#f87171" : "#b91c1c" }
                          : dispute.status === "In Progress"
                          ? { backgroundColor: isDark ? "rgba(234,88,12,0.15)" : "#ffedd5", color: isDark ? "#fbbf24" : "#c2410c" }
                          : { backgroundColor: isDark ? "rgba(22,163,74,0.15)" : "#dcfce7", color: isDark ? "#34d399" : "#15803d" }
                      }
                    >
                      {dispute.status}
                    </span>
                    <span
                      role="status"
                      aria-label={`Priority: ${dispute.priority}`}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={
                        dispute.priority === "High"
                          ? { backgroundColor: isDark ? "rgba(220,38,38,0.15)" : "#fee2e2", color: isDark ? "#f87171" : "#b91c1c" }
                          : dispute.priority === "Medium"
                          ? { backgroundColor: isDark ? "rgba(234,88,12,0.15)" : "#ffedd5", color: isDark ? "#fbbf24" : "#c2410c" }
                          : { backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "#dbeafe", color: isDark ? "#93c5fd" : "#1e40af" }
                      }
                    >
                      {dispute.priority} Priority
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: isDark ? "rgba(45,27,105,0.25)" : "#f3e8ff", color: isDark ? "#c084fc" : "#7c3aed" }}
                    >
                      {dispute.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                    {dispute.description}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Student</p>
                      <p className="text-xs font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                        {dispute.student?.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Employer</p>
                      <p className="text-xs font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                        {dispute.employer?.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Reported</p>
                      <p className="text-xs font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                        {new Date(dispute.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 ml-4 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/dashboard/disputes/${dispute.dispute_id}`)}
                    aria-label={`View details for dispute`}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                    style={{ backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "#eff6ff", color: isDark ? "#93c5fd" : "#1d4ed8" }}
                  >
                    View Details
                  </button>
                  {dispute.status !== "Resolved" && (
                    <button
                      onClick={() => navigate(`/dashboard/disputes/${dispute.dispute_id}`)}
                      aria-label="Resolve dispute"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                      style={{ backgroundColor: isDark ? "rgba(22,163,74,0.15)" : "#f0fdf4", color: isDark ? "#34d399" : "#16a34a" }}
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/dashboard/disputes/${dispute.dispute_id}`)}
                    aria-label="Message parties"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                    style={{ backgroundColor: isDark ? "rgba(45,27,105,0.25)" : "#f5f0fc", color: isDark ? "#c084fc" : "#7c3aed" }}
                  >
                    Message Parties
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Disputes;

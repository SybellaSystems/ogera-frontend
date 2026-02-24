import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useGetDisputeStatsQuery } from "../services/api/disputeApi";
import { useTheme } from "../context/ThemeContext";

const DisputesAdmin: React.FC = () => {
  const { data: statsData, isLoading } = useGetDisputeStatsQuery();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const stats = statsData?.data;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1
          className="text-2xl md:text-4xl font-extrabold flex items-center gap-2 md:gap-3"
          style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
        >
          <ExclamationTriangleIcon className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
          Disputes Overview
        </h1>
        <p
          className="text-sm md:text-base mt-2"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          Manage and resolve disputes between students and employers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div
          className="rounded-xl p-6"
          style={{
            background: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
            border: isDark ? "1px solid rgba(220,38,38,0.3)" : "1px solid #fecaca",
          }}
          role="status"
          aria-label={`${stats?.byStatus?.open || 0} open disputes`}
        >
          <p
            className="text-sm font-medium"
            style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}
          >
            Open Disputes
          </p>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: isDark ? "#fca5a5" : "#7f1d1d" }}
          >
            {isLoading ? "..." : stats?.byStatus?.open || 0}
          </p>
        </div>
        <div
          className="rounded-xl p-6"
          style={{
            background: isDark ? "rgba(234,88,12,0.15)" : "#fff7ed",
            border: isDark ? "1px solid rgba(234,88,12,0.3)" : "1px solid #fed7aa",
          }}
          role="status"
          aria-label={`${stats?.byStatus?.inProgress || 0} disputes under review`}
        >
          <p
            className="text-sm font-medium"
            style={{ color: isDark ? "#fdba74" : "#c2410c" }}
          >
            Under Review
          </p>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: isDark ? "#fdba74" : "#7c2d12" }}
          >
            {isLoading ? "..." : stats?.byStatus?.inProgress || 0}
          </p>
        </div>
        <div
          className="rounded-xl p-6"
          style={{
            background: isDark ? "rgba(22,163,74,0.15)" : "#f0fdf4",
            border: isDark ? "1px solid rgba(22,163,74,0.3)" : "1px solid #bbf7d0",
          }}
          role="status"
          aria-label={`${stats?.resolvedThisMonth || 0} resolved this month`}
        >
          <p
            className="text-sm font-medium"
            style={{ color: isDark ? "#86efac" : "#15803d" }}
          >
            Resolved This Month
          </p>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: isDark ? "#86efac" : "#14532d" }}
          >
            {isLoading ? "..." : stats?.resolvedThisMonth || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

const Disputes: React.FC = () => {
  const role = useSelector((state: any) => state.auth.role);
  const normalizedRole = role?.toLowerCase()?.trim() || "";
  const isAdmin = normalizedRole === "superadmin" || normalizedRole === "admin";

  if (!isAdmin) {
    return <Navigate to="/dashboard/disputes/my-disputes" replace />;
  }

  return <DisputesAdmin />;
};

export default Disputes;

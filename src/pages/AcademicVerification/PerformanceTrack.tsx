import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  StarIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useGetStudentPerformanceQuery } from "../../services/api/usersApi";
import { useTheme } from "../../context/ThemeContext";

const PerformanceTrack: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "earnings" | "completion">("rating");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useGetStudentPerformanceQuery({
    page,
    limit,
    sortBy,
  });

  const students = data?.data || [];
  const summary = data?.summary;
  const pagination = data?.pagination;

  return (
    <div
      className="space-y-4 animate-fadeIn"
      style={{
        background: isDark
          ? "linear-gradient(to bottom right, #0f0a1a, #1a1528)"
          : "linear-gradient(to bottom right, #faf5ff, #eef2ff)",
        minHeight: "100%",
        padding: isDark ? "1rem" : undefined,
        borderRadius: isDark ? "0.5rem" : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartBarIcon
            className="h-6 w-6"
            style={{ color: isDark ? "#c084fc" : "#7c3aed" }}
          />
          <h1
            className="text-xl font-bold"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            Performance Track
          </h1>
        </div>
        <p
          className="text-xs"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          {pagination?.total || 0} students
        </p>
      </div>

      {/* KPI Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: isDark ? "rgba(59,130,246,0.1)" : "#eff6ff",
            borderColor: isDark ? "rgba(59,130,246,0.25)" : "#dbeafe",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: isDark ? "#93c5fd" : "#2563eb" }}>
                Avg Rating
              </p>
              <p className="text-lg font-bold" style={{ color: isDark ? "#dbeafe" : "#1e3a5f" }}>
                {summary?.avgRating?.toFixed(1) || "0.0"}
              </p>
            </div>
            <StarIcon className="h-5 w-5" style={{ color: isDark ? "#60a5fa" : "#93c5fd" }} />
          </div>
        </div>

        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: isDark ? "rgba(34,197,94,0.1)" : "#f0fdf4",
            borderColor: isDark ? "rgba(34,197,94,0.25)" : "#dcfce7",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: isDark ? "#86efac" : "#16a34a" }}>
                Jobs Done
              </p>
              <p className="text-lg font-bold" style={{ color: isDark ? "#dcfce7" : "#14532d" }}>
                {summary?.totalJobsCompleted || 0}
              </p>
            </div>
            <BriefcaseIcon className="h-5 w-5" style={{ color: isDark ? "#4ade80" : "#86efac" }} />
          </div>
        </div>

        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: isDark ? "rgba(168,85,247,0.1)" : "#faf5ff",
            borderColor: isDark ? "rgba(168,85,247,0.25)" : "#f3e8ff",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: isDark ? "#d8b4fe" : "#9333ea" }}>
                Completion
              </p>
              <p className="text-lg font-bold" style={{ color: isDark ? "#f3e8ff" : "#3b0764" }}>
                {summary?.avgCompletionRate || "0%"}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5" style={{ color: isDark ? "#c084fc" : "#d8b4fe" }} />
          </div>
        </div>

        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: isDark ? "rgba(249,115,22,0.1)" : "#fff7ed",
            borderColor: isDark ? "rgba(249,115,22,0.25)" : "#fed7aa",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: isDark ? "#fdba74" : "#ea580c" }}>
                Earnings
              </p>
              <p className="text-lg font-bold" style={{ color: isDark ? "#fed7aa" : "#431407" }}>
                {summary?.totalEarnings || "$0"}
              </p>
            </div>
            <SparklesIcon className="h-5 w-5" style={{ color: isDark ? "#fb923c" : "#fdba74" }} />
          </div>
        </div>
      </div>

      {/* Filters - Compact */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
          Sort:
        </span>
        <div className="flex gap-1">
          {(["rating", "earnings", "completion"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className="px-2 py-1 rounded text-xs font-medium transition"
              style={
                sortBy === s
                  ? { backgroundColor: isDark ? "#c084fc" : "#7c3aed", color: "#ffffff" }
                  : {
                      backgroundColor: isDark ? "rgba(45,27,105,0.5)" : "#f3f4f6",
                      color: isDark ? "#d1d5db" : "#4b5563",
                    }
              }
            >
              {s === "completion" ? "Jobs" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="text-xs rounded px-3 py-2 flex items-center gap-2 border"
          style={{
            backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
            borderColor: isDark ? "rgba(239,68,68,0.3)" : "#fecaca",
            color: isDark ? "#fca5a5" : "#dc2626",
          }}
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>Failed to load data</span>
          <button
            onClick={() => refetch()}
            className="ml-auto underline"
            style={{ color: isDark ? "#f87171" : "#b91c1c" }}
          >
            Retry
          </button>
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
      ) : students.length === 0 ? (
        <div
          className="text-center py-8 rounded-lg border border-dashed"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#f9fafb",
            borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
          }}
        >
          <ChartBarIcon
            className="h-8 w-8 mx-auto mb-2"
            style={{ color: isDark ? "#4a5568" : "#d1d5db" }}
          />
          <p className="text-sm" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            No students found
          </p>
        </div>
      ) : (
        <>
          {/* Student List - Compact */}
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="rounded-lg shadow-sm border transition-all overflow-hidden"
                style={{
                  backgroundColor: isDark ? "#1e1833" : "#ffffff",
                  borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                }}
              >
                <button
                  onClick={() =>
                    setExpandedStudent(expandedStudent === student.id ? null : student.id)
                  }
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                      ? "rgba(45,27,105,0.3)"
                      : "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: isDark ? "rgba(168,85,247,0.2)" : "#f3e8ff",
                        color: isDark ? "#c084fc" : "#7c3aed",
                      }}
                    >
                      {student.name?.charAt(0) || "?"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-sm font-medium truncate"
                          style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                        >
                          {student.name}
                        </h3>
                        <span
                          className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                          style={
                            student.status === "Active"
                              ? {
                                  backgroundColor: isDark ? "rgba(34,197,94,0.15)" : "#dcfce7",
                                  color: isDark ? "#4ade80" : "#15803d",
                                }
                              : {
                                  backgroundColor: isDark ? "rgba(234,179,8,0.15)" : "#fef9c3",
                                  color: isDark ? "#fbbf24" : "#a16207",
                                }
                          }
                        >
                          {student.status === "Active" ? "Active" : "Pending"}
                        </span>
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                      >
                        {student.university}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="hidden sm:flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <div className="flex items-center gap-0.5">
                          <StarIcon className="h-3 w-3" style={{ color: "#eab308" }} />
                          <span
                            className="font-semibold"
                            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                          >
                            {student.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span
                          className="font-semibold"
                          style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                        >
                          {student.jobsCompleted}
                        </span>
                        <span className="ml-0.5" style={{ color: "#9ca3af" }}>
                          jobs
                        </span>
                      </div>
                      <div className="text-center">
                        <span
                          className="font-semibold"
                          style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                        >
                          {student.earnings}
                        </span>
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: isDark ? "#4ade80" : "#16a34a" }}
                      >
                        {student.trend}
                      </span>
                    </div>

                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${
                        expandedStudent === student.id ? "rotate-180" : ""
                      }`}
                      style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}
                    />
                  </div>
                </button>

                {/* Expanded */}
                {expandedStudent === student.id && (
                  <div
                    className="border-t px-4 py-3 space-y-3"
                    style={{
                      borderColor: isDark ? "rgba(45,27,105,0.5)" : "#f3f4f6",
                      backgroundColor: isDark ? "rgba(15,10,26,0.5)" : "#f9fafb",
                    }}
                  >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div
                        className="p-2 rounded border"
                        style={{
                          backgroundColor: isDark ? "#1e1833" : "#ffffff",
                          borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                        }}
                      >
                        <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>GPA</p>
                        <p className="font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                          {student.gpa}
                        </p>
                      </div>
                      <div
                        className="p-2 rounded border"
                        style={{
                          backgroundColor: isDark ? "#1e1833" : "#ffffff",
                          borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                        }}
                      >
                        <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Degree</p>
                        <p className="font-semibold truncate" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                          {student.degree}
                        </p>
                      </div>
                      <div
                        className="p-2 rounded border"
                        style={{
                          backgroundColor: isDark ? "#1e1833" : "#ffffff",
                          borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                        }}
                      >
                        <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Engagement</p>
                        <p className="font-semibold" style={{ color: isDark ? "#c084fc" : "#7c3aed" }}>
                          {student.engagement}
                        </p>
                      </div>
                      <div
                        className="p-2 rounded border"
                        style={{
                          backgroundColor: isDark ? "#1e1833" : "#ffffff",
                          borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                        }}
                      >
                        <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Apps</p>
                        <p className="font-semibold">
                          <span style={{ color: isDark ? "#4ade80" : "#16a34a" }}>{student.jobsCompleted}</span>/
                          <span style={{ color: isDark ? "#fbbf24" : "#ca8a04" }}>{student.jobsPending}</span>/
                          <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>{student.jobsRejected}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div
                      className="flex items-center gap-4 text-xs"
                      style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
                    >
                      <span>
                        Email: {student.verificationStatus.email ? "\u2713" : "\u2717"}
                      </span>
                      <span>
                        Phone: {student.verificationStatus.phone ? "\u2713" : "\u2717"}
                      </span>
                      <span>{student.totalApplications} total applications</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/academic/performance/${student.id}/report`)
                        }
                        className="flex-1 px-3 py-1.5 text-white rounded text-xs font-medium transition"
                        style={{ backgroundColor: isDark ? "#c084fc" : "#7c3aed" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                            ? "#a855f7"
                            : "#6d28d9";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                            ? "#c084fc"
                            : "#7c3aed";
                        }}
                      >
                        View Report
                      </button>
                      <button
                        className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition"
                        style={{
                          backgroundColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                          color: isDark ? "#d1d5db" : "#374151",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                            ? "rgba(45,27,105,0.7)"
                            : "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                            ? "rgba(45,27,105,0.5)"
                            : "#e5e7eb";
                        }}
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination - Compact */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 rounded disabled:opacity-50 transition"
                style={{
                  backgroundColor: isDark ? "rgba(45,27,105,0.5)" : "#f3f4f6",
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
                className="px-2 py-1 rounded disabled:opacity-50 transition"
                style={{
                  backgroundColor: isDark ? "rgba(45,27,105,0.5)" : "#f3f4f6",
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

export default PerformanceTrack;

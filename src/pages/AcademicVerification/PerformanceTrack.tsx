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

const PerformanceTrack: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">Performance Track</h1>
        </div>
        <p className="text-xs text-gray-500">
          {pagination?.total || 0} students
        </p>
      </div>

      {/* KPI Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Avg Rating</p>
              <p className="text-lg font-bold text-blue-900">
                {summary?.avgRating?.toFixed(1) || "0.0"}
              </p>
            </div>
            <StarIcon className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Jobs Done</p>
              <p className="text-lg font-bold text-green-900">
                {summary?.totalJobsCompleted || 0}
              </p>
            </div>
            <BriefcaseIcon className="h-5 w-5 text-green-400" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Completion</p>
              <p className="text-lg font-bold text-purple-900">
                {summary?.avgCompletionRate || "0%"}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-purple-400" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium">Earnings</p>
              <p className="text-lg font-bold text-orange-900">
                {summary?.totalEarnings || "$0"}
              </p>
            </div>
            <SparklesIcon className="h-5 w-5 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters - Compact */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Sort:</span>
        <div className="flex gap-1">
          {(["rating", "earnings", "completion"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                sortBy === s
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "completion" ? "Jobs" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>Failed to load data</span>
          <button onClick={() => refetch()} className="ml-auto text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
          <span className="text-xs text-gray-500 ml-2">Loading...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <ChartBarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No students found</p>
        </div>
      ) : (
        <>
          {/* Student List - Compact */}
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-purple-200 transition-all overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedStudent(expandedStudent === student.id ? null : student.id)
                  }
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
                      {student.name?.charAt(0) || "?"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {student.name}
                        </h3>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                            student.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {student.status === "Active" ? "Active" : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{student.university}</p>
                    </div>

                    {/* Metrics */}
                    <div className="hidden sm:flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <div className="flex items-center gap-0.5">
                          <StarIcon className="h-3 w-3 text-yellow-500" />
                          <span className="font-semibold">{student.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold">{student.jobsCompleted}</span>
                        <span className="text-gray-400 ml-0.5">jobs</span>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold">{student.earnings}</span>
                      </div>
                      <span className="text-green-600 font-medium">{student.trend}</span>
                    </div>

                    <ChevronDownIcon
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedStudent === student.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded */}
                {expandedStudent === student.id && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2 rounded border">
                        <p className="text-gray-500">GPA</p>
                        <p className="font-semibold">{student.gpa}</p>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <p className="text-gray-500">Degree</p>
                        <p className="font-semibold truncate">{student.degree}</p>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <p className="text-gray-500">Engagement</p>
                        <p className="font-semibold text-purple-600">{student.engagement}</p>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <p className="text-gray-500">Apps</p>
                        <p className="font-semibold">
                          <span className="text-green-600">{student.jobsCompleted}</span>/
                          <span className="text-yellow-600">{student.jobsPending}</span>/
                          <span className="text-red-600">{student.jobsRejected}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>
                        Email: {student.verificationStatus.email ? "✓" : "✗"}
                      </span>
                      <span>
                        Phone: {student.verificationStatus.phone ? "✓" : "✗"}
                      </span>
                      <span>{student.totalApplications} total applications</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/academic/performance/${student.id}/report`)
                        }
                        className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition"
                      >
                        View Report
                      </button>
                      <button className="flex-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition">
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

export default PerformanceTrack;

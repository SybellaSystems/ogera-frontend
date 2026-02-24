import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  StarIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useGetStudentPerformanceDetailQuery,
  useGetStudentPerformanceQuery,
} from "../../services/api/usersApi";
import { useTheme } from "../../context/ThemeContext";

const StudentPerformanceReport: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "earnings">(
    "overview"
  );

  // Try the detail endpoint first
  const {
    data: detailData,
    isLoading: detailLoading,
    error: detailError,
  } = useGetStudentPerformanceDetailQuery(studentId || "", {
    skip: !studentId,
  });

  // Fallback: fetch from the list endpoint and filter
  const {
    data: listData,
    isLoading: listLoading,
  } = useGetStudentPerformanceQuery({ page: 1, limit: 100 }, {
    skip: !detailError || !studentId,
  });

  const isLoading = detailLoading || (detailError && listLoading);

  // Derive student data from detail endpoint or fallback to list
  const detailStudent = detailData?.data?.student;
  const fallbackStudent = detailError
    ? listData?.data?.find((s) => s.id === studentId)
    : undefined;
  const student = detailStudent || fallbackStudent;

  const jobHistory = detailData?.data?.jobHistory || [];
  const monthlyEarnings = detailData?.data?.monthlyEarnings || [];
  const metrics = detailData?.data?.metrics;

  // Download report as CSV
  const handleDownload = () => {
    if (!student) return;
    const lines = [
      "Performance Report",
      `Student: ${student.name}`,
      `Email: ${student.email}`,
      `University: ${student.university}`,
      `GPA: ${student.gpa}`,
      `Rating: ${student.rating}`,
      `Jobs Completed: ${student.jobsCompleted}`,
      `Total Earnings: ${student.earnings}`,
      `Engagement: ${student.engagement}`,
      `Trend: ${student.trend}`,
      "",
      "Job History",
      "Title,Company,Amount,Rating,Date,Status",
      ...jobHistory.map(
        (j) => `${j.title},${j.company},${j.amount},${j.rating},${j.date},${j.status}`
      ),
      "",
      "Monthly Earnings",
      "Month,Amount",
      ...monthlyEarnings.map((e) => `${e.month},${e.amount}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-report-${student.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Styles
  const pageBg = isDark
    ? { background: "linear-gradient(to bottom right, #0f0a1a, #1a1528)" }
    : { background: "linear-gradient(to bottom right, #faf5ff, #eef2ff)" };

  const cardBg = isDark
    ? { backgroundColor: "#1e1833", borderColor: "rgba(45,27,105,0.5)" }
    : { backgroundColor: "#fff", borderColor: "#e5e7eb" };

  const headingColor = isDark ? "#f3f4f6" : "#1f2937";
  const bodyColor = isDark ? "#d1d5db" : "#4b5563";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";
  const purpleAccent = isDark ? "#c084fc" : "#7c3aed";

  if (isLoading) {
    return (
      <div
        className="space-y-6 animate-fadeIn"
        style={{ ...pageBg, minHeight: "100%", padding: 24, borderRadius: 12 }}
      >
        <div className="flex items-center justify-center py-16">
          <ArrowPathIcon className="h-6 w-6 animate-spin" style={{ color: purpleAccent }} />
          <span className="ml-2 text-sm" style={{ color: mutedColor }}>
            Loading performance report...
          </span>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div
        className="space-y-6 animate-fadeIn"
        style={{ ...pageBg, minHeight: "100%", padding: 24, borderRadius: 12 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/academic/performance")}
            className="p-2 rounded-lg transition cursor-pointer"
            style={{ backgroundColor: isDark ? "rgba(45,27,105,0.5)" : "#f3f4f6" }}
          >
            <ArrowLeftIcon className="h-5 w-5" style={{ color: bodyColor }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: headingColor }}>
            Performance Report
          </h1>
        </div>
        <div
          className="rounded-xl p-8 text-center border"
          style={cardBg}
        >
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: mutedColor }} />
          <p className="font-semibold" style={{ color: headingColor }}>
            Student not found
          </p>
          <p className="text-sm mt-2" style={{ color: mutedColor }}>
            Could not load performance data for this student
          </p>
        </div>
      </div>
    );
  }

  // Compute derived values
  const completionRate =
    student.totalApplications > 0
      ? Math.round((student.jobsCompleted / student.totalApplications) * 100)
      : 0;
  const profileCompletion = metrics?.profileCompletion ?? 0;
  const responseTime = metrics?.responseTime ?? "N/A";
  const acceptanceRate = metrics?.acceptanceRate ?? 0;
  const repeatClients = metrics?.repeatClients ?? 0;
  const hasDetailData = !!detailData;

  // Chart data for rating comparison
  const ratingChartData = [
    { name: "Current", rating: student.rating },
  ];

  return (
    <div
      className="space-y-6 animate-fadeIn"
      style={{ ...pageBg, minHeight: "100%", padding: 24, borderRadius: 12 }}
    >
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/academic/performance")}
            className="p-2 rounded-lg transition cursor-pointer"
            style={{ backgroundColor: isDark ? "rgba(45,27,105,0.5)" : "#f3f4f6" }}
          >
            <ArrowLeftIcon className="h-5 w-5" style={{ color: bodyColor }} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: headingColor }}>
              Performance Report
            </h1>
            <p className="mt-1 text-sm" style={{ color: mutedColor }}>
              Detailed analytics for {student.name}
            </p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="px-5 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 cursor-pointer text-white"
          style={{ backgroundColor: isDark ? "#2563eb" : "#2563eb" }}
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Download Report
        </button>
      </div>

      {/* Student Card */}
      <div
        className="rounded-xl p-8 text-white"
        style={{
          background: isDark
            ? "linear-gradient(to right, #6d28d9, #2563eb)"
            : "linear-gradient(to right, #7c3aed, #2563eb)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl">
              {student.name?.charAt(0) || "?"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-white/80 mt-1 text-sm">{student.email}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {student.university}
                </span>
                <span className="px-3 py-1 bg-green-400/30 rounded-full text-xs font-medium">
                  {student.status}
                </span>
                <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                  {student.degree} — {student.fieldOfStudy}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <StarIcon className="h-6 w-6 fill-yellow-300 text-yellow-300" />
              <span className="text-3xl font-bold">{student.rating.toFixed(1)}</span>
            </div>
            <p className="text-white/80 text-xs">Overall Rating</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Profile Completion",
            value: hasDetailData ? `${profileCompletion}%` : "N/A",
            icon: <CheckCircleIcon className="h-5 w-5" style={{ color: isDark ? "#60a5fa" : "#2563eb" }} />,
            accent: isDark ? "#60a5fa" : "#2563eb",
            showBar: hasDetailData,
            barPercent: profileCompletion,
          },
          {
            label: "Total Earnings",
            value: student.earnings,
            icon: <CurrencyDollarIcon className="h-5 w-5" style={{ color: isDark ? "#4ade80" : "#16a34a" }} />,
            accent: isDark ? "#4ade80" : "#16a34a",
            sub: `${student.trend} from last period`,
          },
          {
            label: "Jobs Completed",
            value: String(student.jobsCompleted),
            icon: <BriefcaseIcon className="h-5 w-5" style={{ color: purpleAccent }} />,
            accent: purpleAccent,
            sub: `${student.jobsPending} pending`,
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: <CheckCircleIcon className="h-5 w-5" style={{ color: isDark ? "#34d399" : "#059669" }} />,
            accent: isDark ? "#34d399" : "#059669",
            sub: completionRate >= 80 ? "Excellent performance" : "Room to improve",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-xl p-5 border transition hover:shadow-md"
            style={cardBg}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: mutedColor }}>
                {card.label}
              </p>
              {card.icon}
            </div>
            <p className="text-2xl font-bold" style={{ color: headingColor }}>
              {card.value}
            </p>
            {card.showBar && (
              <div
                className="w-full rounded-full h-2 mt-3"
                style={{ backgroundColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb" }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${card.barPercent}%`,
                    backgroundColor: card.accent,
                  }}
                />
              </div>
            )}
            {card.sub && (
              <p className="text-xs mt-2" style={{ color: card.accent }}>
                {card.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Response Time", value: responseTime, sub: "Average response to job offers" },
          { label: "Acceptance Rate", value: hasDetailData ? `${acceptanceRate}%` : "N/A", sub: "Job offer acceptance" },
          { label: "Repeat Clients", value: hasDetailData ? `${repeatClients}%` : "N/A", sub: "Return client rate" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-5 border" style={cardBg}>
            <p className="text-xs font-medium mb-3" style={{ color: mutedColor }}>
              {stat.label}
            </p>
            <p className="text-xl font-bold" style={{ color: headingColor }}>
              {stat.value}
            </p>
            <p className="text-xs mt-2" style={{ color: mutedColor }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-xl border overflow-hidden" style={cardBg}>
        <div className="flex" style={{ borderBottom: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}` }}>
          {(["overview", "jobs", "earnings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 px-6 py-3 font-semibold text-sm transition"
              style={{
                color:
                  activeTab === tab ? purpleAccent : mutedColor,
                borderBottom:
                  activeTab === tab ? `2px solid ${purpleAccent}` : "2px solid transparent",
                backgroundColor:
                  activeTab === tab
                    ? isDark
                      ? "rgba(139,92,246,0.1)"
                      : "#faf5ff"
                    : "transparent",
              }}
            >
              {tab === "overview" ? "Overview" : tab === "jobs" ? "Job History" : "Earnings"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Performance Highlights */}
              <div
                className="rounded-lg p-6 border"
                style={{
                  background: isDark
                    ? "linear-gradient(to right, rgba(37,99,235,0.1), rgba(99,102,241,0.1))"
                    : "linear-gradient(to right, #eff6ff, #eef2ff)",
                  borderColor: isDark ? "rgba(37,99,235,0.3)" : "#bfdbfe",
                }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: headingColor }}>
                  <ArrowTrendingUpIcon className="h-5 w-5" style={{ color: isDark ? "#60a5fa" : "#2563eb" }} />
                  Performance Highlights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "GPA", value: student.gpa, color: headingColor },
                    { label: "Engagement Level", value: student.engagement, color: purpleAccent },
                    {
                      label: "Member Since",
                      value: new Date(student.createdAt).toLocaleDateString(),
                      color: headingColor,
                    },
                    {
                      label: "Total Applications",
                      value: String(student.totalApplications),
                      color: isDark ? "#4ade80" : "#16a34a",
                    },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-xs" style={{ color: mutedColor }}>
                        {item.label}
                      </p>
                      <p className="text-lg font-bold mt-1" style={{ color: item.color }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Chart */}
              <div
                className="rounded-lg p-6 border"
                style={{
                  background: isDark
                    ? "linear-gradient(to right, rgba(16,185,129,0.08), rgba(52,211,153,0.08))"
                    : "linear-gradient(to right, #f0fdf4, #ecfdf5)",
                  borderColor: isDark ? "rgba(16,185,129,0.3)" : "#bbf7d0",
                }}
              >
                <h3 className="font-semibold mb-4" style={{ color: headingColor }}>
                  Rating Overview
                </h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs" style={{ color: mutedColor }}>
                      Current Rating
                    </p>
                    <p
                      className="text-4xl font-bold mt-2"
                      style={{ color: isDark ? "#4ade80" : "#16a34a" }}
                    >
                      {student.rating.toFixed(1)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: mutedColor }}>
                      out of 5.0
                    </p>
                  </div>
                  <div className="flex-1 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingChartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: mutedColor, fontSize: 12 }}
                          axisLine={{ stroke: isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb" }}
                        />
                        <YAxis
                          domain={[0, 5]}
                          tick={{ fill: mutedColor, fontSize: 12 }}
                          axisLine={{ stroke: isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#1e1833" : "#fff",
                            borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                            color: headingColor,
                            borderRadius: 8,
                          }}
                        />
                        <Bar
                          dataKey="rating"
                          fill={isDark ? "#4ade80" : "#16a34a"}
                          radius={[6, 6, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="space-y-4">
              {!hasDetailData ? (
                <div className="text-center py-8">
                  <BriefcaseIcon className="h-10 w-10 mx-auto mb-3" style={{ color: mutedColor }} />
                  <p className="text-sm font-medium" style={{ color: headingColor }}>
                    Job history not available
                  </p>
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>
                    Detailed job history requires the performance detail API
                  </p>
                </div>
              ) : jobHistory.length === 0 ? (
                <div className="text-center py-8">
                  <BriefcaseIcon className="h-10 w-10 mx-auto mb-3" style={{ color: mutedColor }} />
                  <p className="text-sm" style={{ color: mutedColor }}>
                    No job history available
                  </p>
                </div>
              ) : (
                jobHistory.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-lg p-5 border transition hover:shadow-md"
                    style={cardBg}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold" style={{ color: headingColor }}>
                          {job.title}
                        </h4>
                        <p className="text-sm mt-1" style={{ color: mutedColor }}>
                          {job.company}
                        </p>
                        <p className="text-xs mt-2" style={{ color: mutedColor }}>
                          {job.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: headingColor }}>
                          {job.amount}
                        </p>
                        <div className="flex items-center gap-1 justify-end mt-2">
                          <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold" style={{ color: headingColor }}>
                            {job.rating}
                          </span>
                        </div>
                        <span
                          className="inline-block px-3 py-1 text-xs font-medium rounded-full mt-2"
                          style={{
                            backgroundColor: isDark ? "rgba(16,185,129,0.2)" : "#dcfce7",
                            color: isDark ? "#4ade80" : "#16a34a",
                          }}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "earnings" && (
            <div className="space-y-6">
              {/* Monthly Earnings Chart */}
              <div
                className="rounded-lg p-6 border"
                style={{
                  background: isDark
                    ? "linear-gradient(to right, rgba(234,179,8,0.08), rgba(245,158,11,0.08))"
                    : "linear-gradient(to right, #fffbeb, #fef3c7)",
                  borderColor: isDark ? "rgba(234,179,8,0.3)" : "#fde68a",
                }}
              >
                <h3 className="font-semibold mb-4" style={{ color: headingColor }}>
                  Monthly Earnings Trend
                </h3>
                {!hasDetailData || monthlyEarnings.length === 0 ? (
                  <div className="text-center py-8">
                    <CurrencyDollarIcon className="h-10 w-10 mx-auto mb-3" style={{ color: mutedColor }} />
                    <p className="text-sm" style={{ color: mutedColor }}>
                      {!hasDetailData
                        ? "Earnings chart requires the performance detail API"
                        : "No earnings data available"}
                    </p>
                  </div>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyEarnings}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: mutedColor, fontSize: 12 }}
                          axisLine={{ stroke: isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb" }}
                        />
                        <YAxis
                          tick={{ fill: mutedColor, fontSize: 12 }}
                          axisLine={{ stroke: isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#1e1833" : "#fff",
                            borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                            color: headingColor,
                            borderRadius: 8,
                          }}
                          formatter={(value) => [`$${value}`, "Earnings"]}
                        />
                        <Bar
                          dataKey="amount"
                          fill={isDark ? "#f59e0b" : "#d97706"}
                          radius={[6, 6, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Earnings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg p-5 border" style={cardBg}>
                  <p className="text-xs font-medium" style={{ color: mutedColor }}>
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold mt-2" style={{ color: headingColor }}>
                    {student.earnings}
                  </p>
                  <p className="text-xs mt-2" style={{ color: isDark ? "#4ade80" : "#16a34a" }}>
                    {student.trend} trend
                  </p>
                </div>
                <div className="rounded-lg p-5 border" style={cardBg}>
                  <p className="text-xs font-medium" style={{ color: mutedColor }}>
                    Average Per Job
                  </p>
                  <p className="text-2xl font-bold mt-2" style={{ color: headingColor }}>
                    {student.jobsCompleted > 0
                      ? `$${(
                          parseFloat(student.earnings.replace(/[^0-9.]/g, "")) /
                          student.jobsCompleted
                        ).toFixed(0)}`
                      : "N/A"}
                  </p>
                  <p className="text-xs mt-2" style={{ color: mutedColor }}>
                    Across {student.jobsCompleted} completed jobs
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div
        className="rounded-xl p-6 border"
        style={{
          background: isDark
            ? "linear-gradient(to right, rgba(139,92,246,0.1), rgba(37,99,235,0.1))"
            : "linear-gradient(to right, #faf5ff, #eff6ff)",
          borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e9d5ff",
        }}
      >
        <h3 className="font-semibold mb-4" style={{ color: headingColor }}>
          Contact Student
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href={`mailto:${student.email}`}
            className="flex-1 px-5 py-3 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: isDark ? "#7c3aed" : "#7c3aed" }}
          >
            <EnvelopeIcon className="h-5 w-5" />
            Send Email
          </a>
          <button
            className="flex-1 px-5 py-3 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: isDark ? "#2563eb" : "#2563eb" }}
          >
            <BriefcaseIcon className="h-5 w-5" />
            Send Job Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceReport;

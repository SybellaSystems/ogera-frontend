import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGetDashboardMetricsQuery } from "../services/api/dashboardApi";
import { useGetAllUsersQuery, useGetStudentPerformanceQuery } from "../services/api/usersApi";
import { useGetAllCategoriesQuery } from "../services/api/jobCategoriesApi";
import { useGetCourseStatisticsQuery } from "../services/api/coursesApi";
import { getDisputeStats, type DisputeStats } from "../services/api/disputesApi";
import { useTheme } from "../context/ThemeContext";

// ─── Helpers ────────────────────────────────────────────────────────

const exportCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportSVG = (containerRef: React.RefObject<HTMLDivElement | null>, filename: string) => {
  const svg = containerRef.current?.querySelector("svg");
  if (!svg) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Shared Sub-components ──────────────────────────────────────────

const ChartSpinner: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className="flex items-center justify-center h-full" aria-busy="true">
    <ArrowPathIcon
      className="h-5 w-5 animate-spin"
      style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}
    />
    <span className="text-xs ml-2" style={{ color: isDark ? "#d1d5db" : "#6b7280" }}>
      Loading...
    </span>
  </div>
);

const ChartError: React.FC<{ isDark: boolean; message?: string; onRetry?: () => void }> = ({
  isDark,
  message = "Failed to load data",
  onRetry,
}) => (
  <div
    className="flex items-center gap-2 rounded px-3 py-2 text-xs"
    role="alert"
    style={{
      backgroundColor: isDark ? "rgba(127, 29, 29, 0.2)" : "#fef2f2",
      border: isDark ? "1px solid rgba(127, 29, 29, 0.4)" : "1px solid #fecaca",
      color: isDark ? "#fca5a5" : "#dc2626",
    }}
  >
    <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
    <span>{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="ml-auto underline"
        style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}
      >
        Retry
      </button>
    )}
  </div>
);

const ExportButtons: React.FC<{
  isDark: boolean;
  chartRef: React.RefObject<HTMLDivElement | null>;
  csvData: Record<string, unknown>[];
  baseName: string;
  chartLabel: string;
}> = ({ isDark, chartRef, csvData, baseName, chartLabel }) => (
  <div className="flex gap-1.5">
    <button
      onClick={() => exportCSV(csvData, baseName)}
      className="px-2 py-1 rounded text-[10px] font-medium transition"
      style={{
        backgroundColor: isDark ? "rgba(45, 27, 105, 0.4)" : "#f3f4f6",
        color: isDark ? "#c084fc" : "#4b5563",
      }}
      aria-label={`Export ${chartLabel} data as CSV`}
    >
      CSV
    </button>
    <button
      onClick={() => exportSVG(chartRef, baseName)}
      className="px-2 py-1 rounded text-[10px] font-medium transition"
      style={{
        backgroundColor: isDark ? "rgba(45, 27, 105, 0.4)" : "#f3f4f6",
        color: isDark ? "#c084fc" : "#4b5563",
      }}
      aria-label={`Export ${chartLabel} chart as SVG`}
    >
      SVG
    </button>
  </div>
);

// ─── Chart Card Wrapper ─────────────────────────────────────────────

const ChartCard: React.FC<{
  isDark: boolean;
  id: string;
  title: string;
  children: React.ReactNode;
  exportButtons?: React.ReactNode;
  fullWidth?: boolean;
}> = ({ isDark, id, title, children, exportButtons, fullWidth }) => (
  <section
    className={`rounded-lg p-4 shadow-sm ${fullWidth ? "col-span-full" : ""}`}
    aria-labelledby={id}
    style={{
      backgroundColor: isDark ? "#1e1833" : "#ffffff",
      border: isDark ? "1px solid rgba(45, 27, 105, 0.5)" : "1px solid #ede7f8",
    }}
  >
    <div className="flex items-center justify-between mb-3">
      <h2
        id={id}
        className="text-sm font-semibold"
        style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
      >
        {title}
      </h2>
      {exportButtons}
    </div>
    {children}
  </section>
);

// ─── Pie Custom Label ───────────────────────────────────────────────

const RADIAN = Math.PI / 180;
const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (!percent || percent < 0.05) return null;
  const radius = (innerRadius || 0) + ((outerRadius || 0) - (innerRadius || 0)) * 0.5;
  const x = (cx || 0) + radius * Math.cos(-(midAngle || 0) * RADIAN);
  const y = (cy || 0) + radius * Math.sin(-(midAngle || 0) * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Tooltip Styles ─────────────────────────────────────────────────

const getTooltipStyle = (isDark: boolean) => ({
  borderRadius: "6px",
  border: isDark ? "1px solid rgba(45, 27, 105, 0.5)" : "none",
  boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
  padding: "6px 10px",
  fontSize: "11px",
  backgroundColor: isDark ? "#1a1528" : "#fff",
  color: isDark ? "#e2e8f0" : undefined,
});

// ─── Main Component ─────────────────────────────────────────────────

const Analytics: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Refs for SVG export
  const userDemoRef = useRef<HTMLDivElement>(null);
  const jobCatRef = useRef<HTMLDivElement>(null);
  const disputeRef = useRef<HTMLDivElement>(null);
  const courseRef = useRef<HTMLDivElement>(null);
  const perfRef = useRef<HTMLDivElement>(null);

  // ── API Calls ───────────────────────────────────────────────────

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: metricsRefetch,
  } = useGetDashboardMetricsQuery();

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: usersRefetch,
  } = useGetAllUsersQuery({ page: 1, limit: 1, type: "all" });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: categoriesRefetch,
  } = useGetAllCategoriesQuery();

  const {
    data: courseStatsData,
    isLoading: courseStatsLoading,
    error: courseStatsError,
    refetch: courseStatsRefetch,
  } = useGetCourseStatisticsQuery();

  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
    refetch: performanceRefetch,
  } = useGetStudentPerformanceQuery({ page: 1, limit: 1 });

  // Dispute stats via axios (not RTK Query)
  const [disputeStats, setDisputeStats] = useState<DisputeStats | null>(null);
  const [disputeLoading, setDisputeLoading] = useState(true);
  const [disputeError, setDisputeError] = useState(false);

  const fetchDisputeStats = useCallback(async () => {
    setDisputeLoading(true);
    setDisputeError(false);
    try {
      const stats = await getDisputeStats();
      setDisputeStats(stats);
    } catch {
      setDisputeError(true);
    } finally {
      setDisputeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputeStats();
  }, [fetchDisputeStats]);

  // ── Derived Data ────────────────────────────────────────────────

  const metrics = metricsData?.data;

  const kpiCards = [
    {
      title: "Total Users",
      value: metrics?.totalUsers?.toLocaleString() || "0",
      icon: <UserGroupIcon className="h-4 w-4" />,
      color: "#7F56D9",
      bg: isDark ? "rgba(45, 27, 105, 0.25)" : "#f5f0fc",
    },
    {
      title: "Total Students",
      value: metrics?.totalStudents?.toLocaleString() || "0",
      icon: <AcademicCapIcon className="h-4 w-4" />,
      color: "#6941C6",
      bg: isDark ? "rgba(45, 27, 105, 0.25)" : "#ede7f8",
    },
    {
      title: "Active Jobs",
      value: metrics?.activeJobs?.toLocaleString() || "0",
      icon: <BriefcaseIcon className="h-4 w-4" />,
      color: "#7F56D9",
      bg: isDark ? "rgba(45, 27, 105, 0.25)" : "#f5f0fc",
    },
    {
      title: "Total Earnings",
      value: `$${metrics?.totalEarnings?.toLocaleString() || "0"}`,
      icon: <CurrencyDollarIcon className="h-4 w-4" />,
      color: "#2d1b69",
      bg: isDark ? "rgba(45, 27, 105, 0.25)" : "#ede7f8",
    },
  ];

  // User demographics
  const studentCount = usersData?.counts?.students || 0;
  const employerCount = usersData?.counts?.employers || 0;
  const userDemoData = [
    { name: "Students", value: studentCount },
    { name: "Employers", value: employerCount },
  ];
  const USER_COLORS = ["#7F56D9", "#E9D5FF"];

  // Job categories
  const jobCatData = (categoriesData?.data || [])
    .map((cat) => ({ name: cat.name, jobs: cat.job_count || cat.jobCount || 0 }))
    .sort((a, b) => b.jobs - a.jobs)
    .slice(0, 8);

  // Dispute stats
  const disputeData = disputeStats
    ? [
        { name: "Open", value: disputeStats.open },
        { name: "Under Review", value: disputeStats.underReview },
        { name: "Resolved", value: disputeStats.resolved },
        { name: "High Priority", value: disputeStats.highPriority },
      ]
    : [];
  const DISPUTE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"];

  // Course stats
  const courseStats = courseStatsData?.data;
  const courseData = courseStats
    ? [
        { name: "Total Courses", value: courseStats.total_courses },
        { name: "Enrolled Students", value: courseStats.total_students_enrolled },
        { name: "Completions", value: courseStats.total_course_completions },
      ]
    : [];

  // Performance summary
  const perfSummary = performanceData?.summary;
  const perfData = perfSummary
    ? [
        { name: "Total Students", value: perfSummary.totalStudents },
        { name: "Jobs Completed", value: perfSummary.totalJobsCompleted },
        { name: "Avg Rating", value: perfSummary.avgRating },
      ]
    : [];

  // ── Render ──────────────────────────────────────────────────────

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
          <ChartBarIcon
            className="h-6 w-6"
            style={{ color: isDark ? "#c084fc" : "#7F56D9" }}
          />
          <h1
            className="text-xl font-bold"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            Analytics & Reports
          </h1>
        </div>
        <button
          onClick={() => {
            const allData = [
              ...(metrics
                ? [{ metric: "Total Users", value: metrics.totalUsers }, { metric: "Total Students", value: metrics.totalStudents }, { metric: "Active Jobs", value: metrics.activeJobs }, { metric: "Total Earnings", value: metrics.totalEarnings }]
                : []),
              ...userDemoData.map((d) => ({ metric: `User - ${d.name}`, value: d.value })),
              ...jobCatData.map((d) => ({ metric: `Category - ${d.name}`, value: d.jobs })),
              ...disputeData.map((d) => ({ metric: `Dispute - ${d.name}`, value: d.value })),
              ...courseData.map((d) => ({ metric: `Course - ${d.name}`, value: d.value })),
              ...perfData.map((d) => ({ metric: `Performance - ${d.name}`, value: d.value })),
            ];
            if (allData.length) exportCSV(allData, "analytics-report");
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition"
          style={{
            backgroundColor: isDark ? "#7F56D9" : "#7F56D9",
            color: "#ffffff",
          }}
          aria-label="Export all analytics data as CSV"
        >
          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
          Export All
        </button>
      </div>

      <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
        Platform insights, trends, and performance metrics
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2" aria-label="Key performance indicators">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-3 animate-pulse"
              style={{
                backgroundColor: isDark ? "#1e1833" : "#f9fafb",
                border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
                height: "80px",
              }}
            />
          ))
        ) : metricsError ? (
          <div className="col-span-full">
            <ChartError isDark={isDark} message="Failed to load metrics" onRetry={metricsRefetch} />
          </div>
        ) : (
          kpiCards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg p-3 shadow-sm border transition-all hover:shadow-md"
              style={{
                backgroundColor: isDark ? "#1e1833" : "#ffffff",
                borderColor: isDark ? "rgba(45,27,105,0.5)" : "#ede7f8",
              }}
            >
              <div
                className="p-1.5 rounded w-fit mb-2"
                style={{ backgroundColor: card.bg }}
              >
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
              <p
                className="text-lg font-bold"
                style={{ color: isDark ? "#ffffff" : "#111827" }}
              >
                {card.value}
              </p>
              <p
                className="text-[11px]"
                style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
              >
                {card.title}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Charts Row 1: User Demographics + Job Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Demographics PieChart */}
        <ChartCard
          isDark={isDark}
          id="chart-user-demographics"
          title="User Demographics"
          exportButtons={
            !usersLoading && !usersError && (studentCount > 0 || employerCount > 0) ? (
              <ExportButtons
                isDark={isDark}
                chartRef={userDemoRef}
                csvData={userDemoData}
                baseName="user-demographics"
                chartLabel="user demographics"
              />
            ) : null
          }
        >
          <div ref={userDemoRef} style={{ height: 280 }}>
            {usersLoading ? (
              <ChartSpinner isDark={isDark} />
            ) : usersError ? (
              <ChartError isDark={isDark} message="Failed to load user data" onRetry={usersRefetch} />
            ) : studentCount === 0 && employerCount === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}>
                  No user data available
                </p>
              </div>
            ) : (
              <>
                <div
                  role="img"
                  aria-label={`Pie chart showing ${studentCount} students and ${employerCount} employers`}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={userDemoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={90}
                        dataKey="value"
                      >
                        {userDemoData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={USER_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={getTooltipStyle(isDark)} />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", color: isDark ? "#d1d5db" : "#4b5563" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <span className="sr-only">
                  User demographics: {studentCount} students ({((studentCount / (studentCount + employerCount)) * 100).toFixed(1)}%) and {employerCount} employers ({((employerCount / (studentCount + employerCount)) * 100).toFixed(1)}%).
                </span>
              </>
            )}
          </div>
        </ChartCard>

        {/* Job Categories BarChart */}
        <ChartCard
          isDark={isDark}
          id="chart-job-categories"
          title="Top Job Categories"
          exportButtons={
            !categoriesLoading && !categoriesError && jobCatData.length > 0 ? (
              <ExportButtons
                isDark={isDark}
                chartRef={jobCatRef}
                csvData={jobCatData}
                baseName="job-categories"
                chartLabel="job categories"
              />
            ) : null
          }
        >
          <div ref={jobCatRef} style={{ height: 280 }}>
            {categoriesLoading ? (
              <ChartSpinner isDark={isDark} />
            ) : categoriesError ? (
              <ChartError isDark={isDark} message="Failed to load categories" onRetry={categoriesRefetch} />
            ) : jobCatData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}>
                  No job categories available
                </p>
              </div>
            ) : (
              <>
                <div
                  role="img"
                  aria-label={`Bar chart showing top ${jobCatData.length} job categories by job count`}
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={jobCatData} layout="vertical" barGap={3}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "rgba(45, 27, 105, 0.3)" : "#f0f0f0"}
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#718096" : "#9ca3af", fontSize: 10 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#d1d5db" : "#4b5563", fontSize: 10 }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={getTooltipStyle(isDark)}
                        cursor={{ fill: isDark ? "rgba(45,27,105,0.15)" : "rgba(127,86,217,0.06)" }}
                      />
                      <Bar dataKey="jobs" name="Jobs" fill="#7F56D9" radius={[0, 4, 4, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <span className="sr-only">
                  Top job categories: {jobCatData.map((d) => `${d.name} (${d.jobs} jobs)`).join(", ")}.
                </span>
              </>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2: Dispute Status + Course Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dispute Status PieChart */}
        <ChartCard
          isDark={isDark}
          id="chart-dispute-status"
          title="Dispute Status Overview"
          exportButtons={
            !disputeLoading && !disputeError && disputeData.length > 0 ? (
              <ExportButtons
                isDark={isDark}
                chartRef={disputeRef}
                csvData={disputeData}
                baseName="dispute-status"
                chartLabel="dispute status"
              />
            ) : null
          }
        >
          <div ref={disputeRef} style={{ height: 280 }}>
            {disputeLoading ? (
              <ChartSpinner isDark={isDark} />
            ) : disputeError ? (
              <ChartError isDark={isDark} message="Failed to load dispute data" onRetry={fetchDisputeStats} />
            ) : disputeData.every((d) => d.value === 0) ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}>
                  No dispute data available
                </p>
              </div>
            ) : (
              <>
                <div
                  role="img"
                  aria-label={`Pie chart showing dispute status: ${disputeData.map((d) => `${d.value} ${d.name.toLowerCase()}`).join(", ")}`}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={disputeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={90}
                        dataKey="value"
                      >
                        {disputeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DISPUTE_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={getTooltipStyle(isDark)} />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", color: isDark ? "#d1d5db" : "#4b5563" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <span className="sr-only">
                  Dispute status: {disputeData.map((d) => `${d.name}: ${d.value}`).join(", ")}.
                </span>
              </>
            )}
          </div>
        </ChartCard>

        {/* Course Statistics BarChart */}
        <ChartCard
          isDark={isDark}
          id="chart-course-stats"
          title="Course Statistics"
          exportButtons={
            !courseStatsLoading && !courseStatsError && courseData.length > 0 ? (
              <ExportButtons
                isDark={isDark}
                chartRef={courseRef}
                csvData={courseData}
                baseName="course-statistics"
                chartLabel="course statistics"
              />
            ) : null
          }
        >
          <div ref={courseRef} style={{ height: 280 }}>
            {courseStatsLoading ? (
              <ChartSpinner isDark={isDark} />
            ) : courseStatsError ? (
              <ChartError isDark={isDark} message="Failed to load course data" onRetry={courseStatsRefetch} />
            ) : courseData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}>
                  No course data available
                </p>
              </div>
            ) : (
              <>
                <div
                  role="img"
                  aria-label={`Bar chart showing ${courseData.map((d) => `${d.value} ${d.name.toLowerCase()}`).join(", ")}`}
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={courseData} barGap={8}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "rgba(45, 27, 105, 0.3)" : "#f0f0f0"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#d1d5db" : "#4b5563", fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#718096" : "#9ca3af", fontSize: 10 }}
                        width={35}
                      />
                      <Tooltip
                        contentStyle={getTooltipStyle(isDark)}
                        cursor={{ fill: isDark ? "rgba(45,27,105,0.15)" : "rgba(127,86,217,0.06)" }}
                      />
                      <Bar dataKey="value" name="Count" fill="#6941C6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <span className="sr-only">
                  Course statistics: {courseData.map((d) => `${d.name}: ${d.value}`).join(", ")}.
                </span>
              </>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Full-width: Student Performance Overview */}
      <ChartCard
        isDark={isDark}
        id="chart-performance-overview"
        title="Student Performance Overview"
        fullWidth
        exportButtons={
          !performanceLoading && !performanceError && perfData.length > 0 ? (
            <ExportButtons
              isDark={isDark}
              chartRef={perfRef}
              csvData={perfSummary ? [
                { metric: "Total Students", value: perfSummary.totalStudents },
                { metric: "Jobs Completed", value: perfSummary.totalJobsCompleted },
                { metric: "Avg Rating", value: perfSummary.avgRating },
                { metric: "Total Earnings", value: perfSummary.totalEarnings },
                { metric: "Avg Completion Rate", value: perfSummary.avgCompletionRate },
              ] : []}
              baseName="student-performance"
              chartLabel="student performance"
            />
          ) : null
        }
      >
        <div ref={perfRef} style={{ height: 300 }}>
          {performanceLoading ? (
            <ChartSpinner isDark={isDark} />
          ) : performanceError ? (
            <ChartError isDark={isDark} message="Failed to load performance data" onRetry={performanceRefetch} />
          ) : perfData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs" style={{ color: isDark ? "#9ca3af" : "#9ca3af" }}>
                No performance data available
              </p>
            </div>
          ) : (
            <>
              {/* Summary stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {[
                  { label: "Students", value: perfSummary?.totalStudents || 0 },
                  { label: "Jobs Done", value: perfSummary?.totalJobsCompleted || 0 },
                  { label: "Avg Rating", value: perfSummary?.avgRating?.toFixed(1) || "0" },
                  { label: "Earnings", value: perfSummary?.totalEarnings || "$0" },
                  { label: "Completion", value: perfSummary?.avgCompletionRate || "0%" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded p-2 text-center"
                    style={{
                      backgroundColor: isDark ? "rgba(45, 27, 105, 0.25)" : "#f9fafb",
                    }}
                  >
                    <p
                      className="text-sm font-bold"
                      style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div
                role="img"
                aria-label={`Bar chart showing student performance: ${perfData.map((d) => `${d.name}: ${d.value}`).join(", ")}`}
              >
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={perfData} barGap={8}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "rgba(45, 27, 105, 0.3)" : "#f0f0f0"}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#d1d5db" : "#4b5563", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#718096" : "#9ca3af", fontSize: 10 }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={getTooltipStyle(isDark)}
                      cursor={{ fill: isDark ? "rgba(45,27,105,0.15)" : "rgba(127,86,217,0.06)" }}
                    />
                    <Bar dataKey="value" name="Value" fill="#7F56D9" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <span className="sr-only">
                Student performance overview: {perfSummary?.totalStudents} total students, {perfSummary?.totalJobsCompleted} jobs completed, average rating {perfSummary?.avgRating}, total earnings {perfSummary?.totalEarnings}, average completion rate {perfSummary?.avgCompletionRate}.
              </span>
            </>
          )}
        </div>
      </ChartCard>
    </div>
  );
};

export default Analytics;

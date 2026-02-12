import React from "react";
import { useSelector } from "react-redux";
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
  useGetDashboardMetricsQuery,
  useGetStudentDashboardQuery,
} from "../services/api/dashboardApi";
import { ProfileCompletionCard, ProfileCompletionWizard } from "../components/ProfileCompletion";

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const Dashboard: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const roleRaw = useSelector((state: any) => state.auth.role);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : undefined;
  const greeting = getGreeting();
  const [showWizard, setShowWizard] = React.useState(false);

  const isAdmin = role === "superadmin" || role === "admin" || role === "verifydocadmin";
  const isStudent = role === "student";

  // Use the correct query based on role
  const {
    data: adminData,
    isLoading: adminLoading,
    error: adminError,
    refetch: adminRefetch,
  } = useGetDashboardMetricsQuery(undefined, { skip: !isAdmin });

  const {
    data: studentData,
    isLoading: studentLoading,
    error: studentError,
    refetch: studentRefetch,
  } = useGetStudentDashboardQuery(undefined, { skip: !isStudent });

  const isLoading = isAdmin ? adminLoading : isStudent ? studentLoading : false;
  const error = isAdmin ? adminError : isStudent ? studentError : null;
  const refetch = isAdmin ? adminRefetch : isStudent ? studentRefetch : () => {};

  const getStats = () => {
    if (isStudent && studentData?.data) {
      const d = studentData.data;
      return [
        {
          title: "Applications Sent",
          value: d.applications?.value?.toString() || "0",
          change: d.applications?.change != null ? `${d.applications.change >= 0 ? "+" : ""}${d.applications.change}` : "--",
          trending: (d.applications?.change ?? 0) >= 0 ? "up" as const : "down" as const,
          icon: <BriefcaseIcon className="h-4 w-4" />,
          color: "text-[#7F56D9]",
          bg: "bg-[#f5f0fc]",
          changeBg: "bg-[#f5f0fc] text-[#6941C6]",
        },
        {
          title: "Jobs Completed",
          value: d.jobsCompleted?.value?.toString() || "0",
          change: d.jobsCompleted?.change != null ? `${d.jobsCompleted.change >= 0 ? "+" : ""}${d.jobsCompleted.change}` : "--",
          trending: (d.jobsCompleted?.change ?? 0) >= 0 ? "up" as const : "down" as const,
          icon: <AcademicCapIcon className="h-4 w-4" />,
          color: "text-[#6941C6]",
          bg: "bg-[#ede7f8]",
          changeBg: "bg-[#f5f0fc] text-[#6941C6]",
        },
        {
          title: "Interviews",
          value: d.interviews?.value?.toString() || "0",
          change: d.interviews?.growthPercentage != null ? `${d.interviews.growthPercentage >= 0 ? "+" : ""}${d.interviews.growthPercentage}%` : "--",
          trending: (d.interviews?.growthPercentage ?? 0) >= 0 ? "up" as const : "down" as const,
          icon: <UserGroupIcon className="h-4 w-4" />,
          color: "text-[#7F56D9]",
          bg: "bg-[#f5f0fc]",
          changeBg: "bg-[#f5f0fc] text-[#6941C6]",
        },
        {
          title: "Earnings",
          value: d.earnings?.currency
            ? `${d.earnings.currency} ${d.earnings.value?.toLocaleString() || "0"}`
            : `$${d.earnings?.value?.toLocaleString() || "0"}`,
          change: "--",
          trending: "up" as const,
          icon: <ChartBarIcon className="h-4 w-4" />,
          color: "text-[#2d1b69]",
          bg: "bg-[#ede7f8]",
          changeBg: "bg-[#f5f0fc] text-[#6941C6]",
        },
      ];
    }

    if (isAdmin && adminData?.data) {
      const d = adminData.data;
      return [
        {
          title: "Total Users",
          value: d.totalUsers?.toLocaleString() || "0",
          change: "--",
          trending: "up" as const,
          icon: <UserGroupIcon className="h-4 w-4" />,
          color: "text-[#7F56D9]",
          bg: "bg-[#f5f0fc]",
          changeBg: "bg-[#f5f0fc] text-[#6941C6]",
        },
        {
          title: "Total Students",
          value: d.totalStudents?.toLocaleString() || "0",
          change: "--",
          trending: "up" as const,
          icon: <AcademicCapIcon className="h-4 w-4" />,
          color: "text-[#6941C6]",
          bg: "bg-[#ede7f8]",
          changeBg: "bg-[#f5f0fc] text-[#6941C6]",
        },
        {
          title: "Active Jobs",
          value: d.activeJobs?.toLocaleString() || "0",
          change: "--",
          trending: "up" as const,
          icon: <BriefcaseIcon className="h-4 w-4" />,
          color: "text-[#7F56D9]",
          bg: "bg-[#f5f0fc]",
          changeBg: "bg-[#f5f0fc] text-[#6941C6]",
        },
        {
          title: "Total Earnings",
          value: `$${d.totalEarnings?.toLocaleString() || "0"}`,
          change: "--",
          trending: "up" as const,
          icon: <ChartBarIcon className="h-4 w-4" />,
          color: "text-[#2d1b69]",
          bg: "bg-[#ede7f8]",
          changeBg: "bg-[#f5f0fc] text-[#6941C6]",
        },
      ];
    }

    // Employer or no data
    return [];
  };

  const getSubtitle = () => {
    if (role === "student") return "Track your applications, jobs & earnings.";
    if (role === "employer") return "Manage your jobs, applicants & hiring pipeline.";
    return "Insights across students, employers, jobs & overall activity.";
  };

  const getChartData = () => {
    if (isStudent) {
      return {
        data: [
          { day: "Mon", applications: 0, completed: 0 },
          { day: "Tue", applications: 0, completed: 0 },
          { day: "Wed", applications: 0, completed: 0 },
          { day: "Thu", applications: 0, completed: 0 },
          { day: "Fri", applications: 0, completed: 0 },
          { day: "Sat", applications: 0, completed: 0 },
          { day: "Sun", applications: 0, completed: 0 },
        ],
        bars: [
          { key: "applications", name: "Applications", fill: "#7F56D9" },
          { key: "completed", name: "Jobs Completed", fill: "#E9D5FF" },
        ],
        title: "Weekly Activity",
      };
    }
    if (role === "employer") {
      return {
        data: [
          { day: "Mon", applications: 0, hires: 0 },
          { day: "Tue", applications: 0, hires: 0 },
          { day: "Wed", applications: 0, hires: 0 },
          { day: "Thu", applications: 0, hires: 0 },
          { day: "Fri", applications: 0, hires: 0 },
          { day: "Sat", applications: 0, hires: 0 },
          { day: "Sun", applications: 0, hires: 0 },
        ],
        bars: [
          { key: "applications", name: "Applications", fill: "#7F56D9" },
          { key: "hires", name: "Hires", fill: "#E9D5FF" },
        ],
        title: "Weekly Hiring Activity",
      };
    }
    return {
      data: [
        { day: "Mon", students: 0, employers: 0 },
        { day: "Tue", students: 0, employers: 0 },
        { day: "Wed", students: 0, employers: 0 },
        { day: "Thu", students: 0, employers: 0 },
        { day: "Fri", students: 0, employers: 0 },
        { day: "Sat", students: 0, employers: 0 },
        { day: "Sun", students: 0, employers: 0 },
      ],
      bars: [
        { key: "students", name: "Students", fill: "#7F56D9" },
        { key: "employers", name: "Employers", fill: "#E9D5FF" },
      ],
      title: "Weekly User Growth",
    };
  };

  const stats = getStats();
  const subtitle = getSubtitle();
  const chartConfig = getChartData();
  const quickStats = [
    { color: "text-green-600", hoverBg: "hover:bg-green-50", text: "No recent updates" },
  ];
  const recentActivity = ["No recent activity"];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-[#7F56D9] animate-spin" />
        <span className="ml-2 text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    const isAuthError = 'status' in error && (error.status === 401 || error.status === 'FETCH_ERROR');
    const errorMessage = 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data
      ? (error.data as { message: string }).message
      : 'status' in error && error.status === 'FETCH_ERROR'
        ? 'Unable to connect to server. Please check your connection.'
        : 'Failed to load dashboard data';

    if (isAuthError) {
      return (
        <div className="space-y-3 animate-fadeIn max-w-full overflow-x-hidden">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Session Expired</p>
                <p className="text-xs text-red-600 mt-1">Your session has expired. Please log in again.</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition"
              >
                Go to Login
              </button>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 animate-fadeIn max-w-full overflow-x-hidden">
        <div className="bg-gradient-to-r from-[#2d1b69] to-[#1a1035] rounded-lg p-3 text-white shadow-sm">
          <h1 className="text-sm md:text-base font-bold">
            {greeting}, {user?.full_name || "User"}
          </h1>
          <p className="text-[11px] text-purple-200 mt-0.5">
            {subtitle}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load dashboard data</p>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="ml-auto px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fadeIn max-w-full overflow-x-hidden">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#2d1b69] to-[#1a1035] rounded-lg p-3 text-white shadow-sm">
        <h1 className="text-sm md:text-base font-bold">
          {greeting}, {user?.full_name || "User"}
        </h1>
        <p className="text-[11px] text-purple-200 mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-all duration-300 border border-[#ede7f8]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`p-1.5 rounded ${item.bg}`}>
                  <span className={item.color}>{item.icon}</span>
                </div>
                {item.change !== "--" && (
                  <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded-full animate-trend ${item.changeBg}`}>
                    {item.trending === "up" ? (
                      <ArrowTrendingUpIcon className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-2.5 w-2.5" />
                    )}
                    {item.change}
                  </span>
                )}
              </div>
              <p className="text-base font-bold text-gray-900">{item.value}</p>
              <p className="text-[11px] text-gray-500">{item.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Employer placeholder - no backend endpoint yet */}
      {role === "employer" && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ede7f8] text-center">
          <BriefcaseIcon className="h-10 w-10 text-[#7F56D9] mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Employer dashboard coming soon</p>
          <p className="text-xs text-gray-500 mt-1">Check the Jobs section for your postings and applications.</p>
        </div>
      )}

      {/* Profile Completion Card - Only for students and employers */}
      {(role === "student" || role === "employer") && (
        <ProfileCompletionCard onStartWizard={() => setShowWizard(true)} />
      )}

      {/* Profile Completion Wizard Modal */}
      <ProfileCompletionWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          refetch();
        }}
      />

      {/* Graph + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Graph Section */}
        <div className="bg-white rounded-lg p-3 shadow-sm lg:col-span-2 border border-gray-100">
          <h2 className="text-xs font-semibold mb-2 text-gray-800">{chartConfig.title}</h2>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartConfig.data} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  width={25}
                />
                <Tooltip
                  cursor={{ fill: "rgba(127, 86, 217, 0.06)" }}
                  contentStyle={{
                    borderRadius: "6px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    padding: "6px 10px",
                    fontSize: "11px",
                  }}
                />
                {chartConfig.bars.map((bar) => (
                  <Bar
                    key={bar.key}
                    dataKey={bar.key}
                    name={bar.name}
                    fill={bar.fill}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#ede7f8]">
          <h2 className="text-xs font-semibold text-gray-800 mb-2">Quick Stats</h2>
          <ul className="space-y-1 text-gray-700 text-[11px]">
            {quickStats.map((stat, index) => (
              <li key={index} className={`flex items-center gap-1.5 p-1.5 rounded ${stat.hoverBg} transition-colors`}>
                <span className={`${stat.color} font-bold text-xs`}>•</span>
                <span>{stat.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-[#ede7f8]">
        <h2 className="text-xs font-semibold mb-2 text-gray-800">Recent Activity</h2>
        <ul className="space-y-1">
          {recentActivity.map((activity, index) => (
            <li
              key={index}
              className="pb-1.5 border-b last:border-none text-[11px] text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center gap-1.5 group cursor-pointer"
            >
              <span className="w-1 h-1 rounded-full bg-purple-400 group-hover:bg-purple-600 transition-colors shrink-0"></span>
              <span>{activity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

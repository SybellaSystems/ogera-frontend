import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardMetrics {
  totalUsers: number;
  totalStudents: number;
  activeJobs: number;
  totalEarnings: number;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const Dashboard: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const roleRaw = useSelector((state: any) => state.auth.role);
  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : undefined;
  const greeting = getGreeting();

  // State for dashboard metrics
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  // Student-specific metrics fetched from backend
  const [studentMetrics, setStudentMetrics] = useState<any | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Fetch dashboard metrics for superadmin
  useEffect(() => {
    // Only superadmin should fetch these metrics
    if (role === "superadmin") {
      setMetricsLoading(true);
      setMetricsError(null);
      console.log("[Dashboard] Fetching metrics for superadmin...");
      fetch("/api/dashboard/metrics", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then((res) => {
          console.log("[Dashboard] Response status:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("[Dashboard] Response data:", data);
          if (data && data.success && data.data) {
            // Ensure the backend returned numeric values; do not coerce here.
            const d = data.data as DashboardMetrics;
            setMetrics(d);
          } else {
            console.warn("[Dashboard] Invalid response format:", data);
            setMetrics(null);
            setMetricsError("Invalid response format from server");
          }
        })
        .catch((error) => {
          console.error("[Dashboard] Failed to fetch dashboard metrics:", error);
          setMetrics(null);
          setMetricsError(String(error));
        })
        .finally(() => {
          setMetricsLoading(false);
        });
    }
  }, [role]);

  // Fetch student-specific dashboard metrics
  useEffect(() => {
    if (role === 'student') {
      setStudentLoading(true);
      setStudentError(null);
      fetch('/api/dashboard/student', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.data) {
            setStudentMetrics(data.data);
          } else {
            setStudentMetrics(null);
            setStudentError('Invalid response from server');
          }
        })
        .catch((err) => {
          console.error('[Dashboard] Failed to fetch student metrics:', err);
          setStudentMetrics(null);
          setStudentError(String(err));
        })
        .finally(() => setStudentLoading(false));
    }
  }, [role, accessToken]);

  const getStats = () => {
    if (role === "student") {
      // Use backend-provided student metrics when available
      const appsValue = studentMetrics?.applications?.value ?? null;
      const appsChange = studentMetrics?.applications?.change ?? null;
      const earningsValue = studentMetrics?.earnings?.value ?? null;
      const earningsCurrency = studentMetrics?.earnings?.currency ?? null;
      const jobsCompletedValue = studentMetrics?.jobsCompleted?.value ?? null;
      const interviewsValue = studentMetrics?.interviews?.value ?? null;

      const formatNumber = (v: any) => {
        if (v === null || v === undefined) return 'N/A';
        if (typeof v === 'number') return v.toLocaleString();
        return String(v);
      };

      return [
        {
          title: 'Applications Sent',
          value: studentLoading ? '...' : (appsValue !== null ? formatNumber(appsValue) : (studentError ? 'Error' : (studentMetrics?.applications?.note || 'N/A'))),
          change: appsChange !== null && appsChange !== undefined ? (appsChange >= 0 ? `+${appsChange}` : String(appsChange)) : undefined,
          trending: appsChange !== null && appsChange !== undefined ? (appsChange >= 0 ? 'up' as const : 'down' as const) : 'up' as const,
          icon: <BriefcaseIcon className="h-4 w-4" />,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          changeBg: 'bg-green-50 text-green-700',
        },
        {
          title: 'Jobs Completed',
          value: studentLoading ? '...' : (jobsCompletedValue !== null && jobsCompletedValue !== undefined ? String(jobsCompletedValue) : (studentMetrics?.jobsCompleted?.note || 'N/A')),
          change: undefined,
          trending: 'up' as const,
          icon: <AcademicCapIcon className="h-4 w-4" />,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          changeBg: 'bg-green-50 text-green-700',
        },
        {
          title: 'Interviews',
          value: studentLoading ? '...' : (interviewsValue !== null && interviewsValue !== undefined ? String(interviewsValue) : (studentMetrics?.interviews?.note || 'N/A')),
          change: undefined,
          trending: 'up' as const,
          icon: <UserGroupIcon className="h-4 w-4" />,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          changeBg: 'bg-green-50 text-green-700',
        },
        {
          title: 'Earnings',
          value: studentLoading ? '...' : (earningsValue !== null ? `${earningsCurrency ?? '$'}${formatNumber(earningsValue)}` : (studentError ? 'Error' : 'N/A')),
          change: undefined,
          trending: 'up' as const,
          icon: <ChartBarIcon className="h-4 w-4" />,
          color: 'text-[#7F56D9]',
          bg: 'bg-purple-50',
          changeBg: 'bg-green-50 text-green-700',
        },
      ];
    }
    if (role === "employer") {
      return [
        {
          title: "Jobs Posted",
          value: "18",
          change: "+3",
          trending: "up" as const,
          icon: <BriefcaseIcon className="h-4 w-4" />,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
          changeBg: "bg-green-50 text-green-700",
        },
        {
          title: "Applications Received",
          value: "245",
          change: "+12.4%",
          trending: "up" as const,
          icon: <UserGroupIcon className="h-4 w-4" />,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          changeBg: "bg-green-50 text-green-700",
        },
        {
          title: "Active Hires",
          value: "12",
          change: "+2",
          trending: "up" as const,
          icon: <AcademicCapIcon className="h-4 w-4" />,
          color: "text-orange-600",
          bg: "bg-orange-50",
          changeBg: "bg-green-50 text-green-700",
        },
        {
          title: "Total Spent",
          value: "$34,500",
          change: "+8.7%",
          trending: "up" as const,
          icon: <ChartBarIcon className="h-4 w-4" />,
          color: "text-[#7F56D9]",
          bg: "bg-purple-50",
          changeBg: "bg-green-50 text-green-700",
        },
      ];
    }
    // superadmin / default
    const formatNumber = (v: unknown) => {
      if (v === null || v === undefined) return "N/A";
      if (typeof v === "number") return v.toLocaleString();
      // if value is a numeric string, still show it raw
      if (!Number.isNaN(Number(v))) return String(v);
      return String(v);
    };

    return [
      {
        title: "Total Users",
        // Show loading indicator while loading. When loaded, show exact number returned by API.
        value: metricsLoading ? "..." : (metrics ? formatNumber(metrics.totalUsers) : (metricsError ? "Error" : "N/A")),
        change: "+12.5%",
        trending: "up" as const,
        icon: <UserGroupIcon className="h-4 w-4" />,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        changeBg: "bg-green-50 text-green-700",
      },
      {
        title: "Total Students",
        value: metricsLoading ? "..." : (metrics ? formatNumber(metrics.totalStudents) : (metricsError ? "Error" : "N/A")),
        change: "+8.2%",
        trending: "up" as const,
        icon: <AcademicCapIcon className="h-4 w-4" />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        changeBg: "bg-green-50 text-green-700",
      },
      {
        title: "Active Jobs",
        value: metricsLoading ? "..." : (metrics ? formatNumber(metrics.activeJobs) : (metricsError ? "Error" : "N/A")),
        change: "-3.1%",
        trending: "down" as const,
        icon: <BriefcaseIcon className="h-4 w-4" />,
        color: "text-orange-600",
        bg: "bg-orange-50",
        changeBg: "bg-red-50 text-red-600",
      },
      {
        title: "Total Earnings",
        value: metricsLoading ? "..." : (metrics ? (`$${formatNumber(metrics.totalEarnings)}`) : (metricsError ? "Error" : "N/A")),
        change: "+18.7%",
        trending: "up" as const,
        icon: <ChartBarIcon className="h-4 w-4" />,
        color: "text-[#7F56D9]",
        bg: "bg-purple-50",
        changeBg: "bg-green-50 text-green-700",
      },
    ];
  };

  const getQuickStats = () => {
    if (role === "student") {
      return [
        { color: "text-green-600", hoverBg: "hover:bg-green-50", text: "3 applications shortlisted" },
        { color: "text-blue-600", hoverBg: "hover:bg-blue-50", text: "2 jobs in progress" },
        { color: "text-orange-600", hoverBg: "hover:bg-orange-50", text: "1 interview scheduled" },
        { color: "text-purple-600", hoverBg: "hover:bg-purple-50", text: "5 new job matches" },
      ];
    }
    if (role === "employer") {
      return [
        { color: "text-green-600", hoverBg: "hover:bg-green-50", text: "32 new applicants this week" },
        { color: "text-blue-600", hoverBg: "hover:bg-blue-50", text: "5 positions filled this month" },
        { color: "text-orange-600", hoverBg: "hover:bg-orange-50", text: "8 interviews pending" },
        { color: "text-red-600", hoverBg: "hover:bg-red-50", text: "3 contracts expiring soon" },
      ];
    }
    // superadmin / default
    return [
      { color: "text-green-600", hoverBg: "hover:bg-green-50", text: "540 new students this week" },
      { color: "text-blue-600", hoverBg: "hover:bg-blue-50", text: "230 jobs posted this week" },
      { color: "text-orange-600", hoverBg: "hover:bg-orange-50", text: "120 academic verifications pending" },
      { color: "text-red-600", hoverBg: "hover:bg-red-50", text: "87 disputes resolved" },
    ];
  };

  const getRecentActivity = () => {
    if (role === "student") {
      return [
        "You applied for Frontend Developer at TechCorp",
        "Your application was shortlisted for UI Designer",
        "Job completed: Logo Design for StartupXYZ",
        "Interview scheduled for Thursday at 2:00 PM",
        "Payment of $350 received from employer",
      ];
    }
    if (role === "employer") {
      return [
        "New application received for Backend Developer",
        "Interview completed with John Doe",
        "Job posting 'Data Analyst' expires in 3 days",
        "Payment of $500 processed to hired student",
        "New candidate matched your job requirements",
      ];
    }
    // superadmin / default
    return [
      "New student registered",
      "Employer posted a new job",
      "Student completed a training module",
      "Admin approved an academic verification",
      "Employer paid out $500 to student",
    ];
  };

  const getSubtitle = () => {
    if (role === "student") return "Track your applications, jobs & earnings.";
    if (role === "employer") return "Manage your jobs, applicants & hiring pipeline.";
    return "Insights across students, employers, jobs & overall activity.";
  };

  const getChartData = () => {
    if (role === "student") {
      return {
        data: [
          { day: "Mon", applications: 2, completed: 1 },
          { day: "Tue", applications: 3, completed: 2 },
          { day: "Wed", applications: 1, completed: 1 },
          { day: "Thu", applications: 4, completed: 3 },
          { day: "Fri", applications: 5, completed: 2 },
          { day: "Sat", applications: 1, completed: 0 },
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
          { day: "Mon", applications: 15, hires: 2 },
          { day: "Tue", applications: 22, hires: 3 },
          { day: "Wed", applications: 18, hires: 1 },
          { day: "Thu", applications: 30, hires: 4 },
          { day: "Fri", applications: 35, hires: 5 },
          { day: "Sat", applications: 8, hires: 1 },
          { day: "Sun", applications: 5, hires: 0 },
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
        { day: "Mon", students: 120, employers: 45 },
        { day: "Tue", students: 190, employers: 60 },
        { day: "Wed", students: 150, employers: 38 },
        { day: "Thu", students: 230, employers: 72 },
        { day: "Fri", students: 280, employers: 90 },
        { day: "Sat", students: 95, employers: 25 },
        { day: "Sun", students: 65, employers: 18 },
      ],
      bars: [
        { key: "students", name: "Students", fill: "#7F56D9" },
        { key: "employers", name: "Employers", fill: "#E9D5FF" },
      ],
      title: "Weekly User Growth",
    };
  };

  const stats = getStats();
  const quickStats = getQuickStats();
  const recentActivity = getRecentActivity();
  const subtitle = getSubtitle();
  const chartConfig = getChartData();

  return (
    <div className="space-y-3 animate-fadeIn max-w-full overflow-x-hidden">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#7F56D9] to-[#6941C6] rounded-lg p-3 text-white shadow-sm">
        <h1 className="text-sm md:text-base font-bold">
          {greeting}, {user?.full_name || "User"}
        </h1>
        <p className="text-[11px] text-purple-200 mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className={`p-1.5 rounded ${item.bg}`}>
                <span className={item.color}>{item.icon}</span>
              </div>
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded-full animate-trend ${item.changeBg}`}>
                {item.trending === "up" ? (
                  <ArrowTrendingUpIcon className="h-2.5 w-2.5" />
                ) : (
                  <ArrowTrendingDownIcon className="h-2.5 w-2.5" />
                )}
                {item.change}
              </span>
            </div>
            <p className="text-base font-bold text-gray-900">{item.value}</p>
            <p className="text-[11px] text-gray-500">{item.title}</p>
          </div>
        ))}
      </div>

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
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <h2 className="text-xs font-semibold text-gray-800 mb-2">Quick Stats</h2>

          {/* Student Rating */}
          {role === "student" && (
            <div className="mb-2 p-2 rounded bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
              <p className="text-[10px] text-gray-500 mb-0.5">Your Rating</p>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-px">
                  {[1, 2, 3, 4, 5].map((star) => (
                    star <= 4 ? (
                      <StarIconSolid key={star} className="h-3.5 w-3.5 text-yellow-400" />
                    ) : (
                      <StarIcon key={star} className="h-3.5 w-3.5 text-gray-300" />
                    )
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-900">4.0</span>
                <span className="text-[9px] text-gray-400">(12 reviews)</span>
              </div>
            </div>
          )}

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
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
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

      {/* Student KPIs */}
      {role === "student" && (
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <h2 className="text-xs font-semibold mb-2.5 text-gray-800">Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Profile Completion */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">Profile Completion</span>
                <span className="text-[11px] font-bold text-[#7F56D9]">75%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7F56D9] to-[#9E77ED] rounded-full transition-all duration-500"
                  style={{ width: "75%" }}
                />
              </div>
              <p className="text-[9px] text-gray-400">Add skills & bio to reach 100%</p>
            </div>

            {/* Job Completion Rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">Job Completion</span>
                <span className="text-[11px] font-bold text-emerald-600">85%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: "85%" }}
                />
              </div>
              <p className="text-[9px] text-gray-400">11 of 13 jobs completed on time</p>
            </div>

            {/* Application Success Rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">Application Success</span>
                <span className="text-[11px] font-bold text-orange-600">42%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: "42%" }}
                />
              </div>
              <p className="text-[9px] text-gray-400">10 of 24 applications accepted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

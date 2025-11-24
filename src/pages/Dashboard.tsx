import React from "react";
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: "Total Users",
      value: "12,450",
      icon: <UserGroupIcon className="h-7 w-7 text-indigo-600" />,
      bg: "bg-indigo-50",
      glow: "shadow-indigo-200",
    },
    {
      title: "Total Students",
      value: "8,120",
      icon: <AcademicCapIcon className="h-7 w-7 text-green-600" />,
      bg: "bg-green-50",
      glow: "shadow-green-200",
    },
    {
      title: "Active Jobs",
      value: "1,480",
      icon: <BriefcaseIcon className="h-7 w-7 text-orange-600" />,
      bg: "bg-orange-50",
      glow: "shadow-orange-200",
    },
    {
      title: "Total Earnings",
      value: "$240,000",
      icon: <ChartBarIcon className="h-7 w-7 text-purple-600" />,
      bg: "bg-purple-50",
      glow: "shadow-purple-200",
    },
  ];

  const recentActivity = [
    "New student registered",
    "Employer posted a new job",
    "Student completed a training module",
    "Admin approved an academic verification",
    "Employer paid out $500 to student",
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* ----------------------------- */}
      {/* Welcome Section */}
      {/* ----------------------------- */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Insights across students, employers, jobs & overall activity.
        </p>
      </div>

      {/* ----------------------------- */}
      {/* Stats Cards */}
      {/* ----------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${item.glow}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${item.bg}`}>{item.icon}</div>

              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-3xl font-bold mt-1">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------- */}
      {/* Graph + Stats */}
      {/* ----------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graph Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md lg:col-span-2 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Weekly User Growth</h2>

          <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-400 text-sm">📊 Chart Placeholder</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold">Quick Stats</h2>

          <ul className="space-y-4 mt-4 text-gray-700 text-[15px]">
            <li className="flex gap-3">
              <span className="text-green-600 font-bold">•</span>
              540 new students this week
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              230 jobs posted this week
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-bold">•</span>
              120 academic verifications pending
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              87 disputes resolved
            </li>
          </ul>
        </div>
      </div>

      {/* ----------------------------- */}
      {/* Recent Activity */}
      {/* ----------------------------- */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

        <ul className="space-y-4">
          {recentActivity.map((activity, index) => (
            <li
              key={index}
              className="pb-3 border-b last:border-none text-gray-700 hover:text-indigo-600 transition"
            >
              {activity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

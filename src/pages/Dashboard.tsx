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
    <div className="space-y-6 md:space-y-10 animate-fadeIn max-w-full overflow-x-hidden">
      {/* ----------------------------- */}
      {/* Welcome Section */}
      {/* ----------------------------- */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <h1 className="text-2xl md:text-4xl font-extrabold mb-2">Welcome Back! 👋</h1>
        <p className="text-sm md:text-base text-purple-100">
          Insights across students, employers, jobs & overall activity.
        </p>
      </div>

      {/* ----------------------------- */}
      {/* Stats Cards */}
      {/* ----------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 ${item.glow}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${item.bg} shadow-md`}>{item.icon}</div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 font-medium">{item.title}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------- */}
      {/* Graph + Stats */}
      {/* ----------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Graph Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg lg:col-span-2 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Weekly User Growth</h2>

          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
            <p className="text-gray-400 text-sm font-medium">📊 Chart Placeholder</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h2>

          <ul className="space-y-4 mt-4 text-gray-700 text-[15px]">
            <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 transition-colors">
              <span className="text-green-600 font-bold text-xl">•</span>
              <span>540 new students this week</span>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-bold text-xl">•</span>
              <span>230 jobs posted this week</span>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors">
              <span className="text-orange-600 font-bold text-xl">•</span>
              <span>120 academic verifications pending</span>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 transition-colors">
              <span className="text-red-600 font-bold text-xl">•</span>
              <span>87 disputes resolved</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ----------------------------- */}
      {/* Recent Activity */}
      {/* ----------------------------- */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activity</h2>

        <ul className="space-y-3">
          {recentActivity.map((activity, index) => (
            <li
              key={index}
              className="pb-3 border-b last:border-none text-gray-700 hover:text-purple-600 transition-colors duration-200 flex items-center gap-3 group cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 group-hover:bg-purple-600 transition-colors"></span>
              <span>{activity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

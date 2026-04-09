import React from "react";
import { useTranslation } from "react-i18next";
import {
  useGetDashboardMetricsQuery,
} from "../services/api/dashboardApi";
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const PlatformStatistics: React.FC = () => {
  const { t } = useTranslation();
  const { data: metricsResponse, isLoading, error } = useGetDashboardMetricsQuery();

  // Format numbers with thousand separators
  const formatNumber = (value: any) => {
    if (value === null || value === undefined) return t("common.na", { defaultValue: "N/A" });
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
          <h2 className="text-2xl font-bold">
            {t("profile.dashboardPlatformStatistics", { defaultValue: "Platform Statistics" })}
          </h2>
          <p className="text-white/80 mt-2">
            {t("profile.analyticsDesc", { defaultValue: "Detailed analytics and reporting" })}
          </p>
        </div>
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
          <h2 className="text-2xl font-bold">
            {t("profile.dashboardPlatformStatistics", { defaultValue: "Platform Statistics" })}
          </h2>
          <p className="text-white/80 mt-2">
            {t("profile.analyticsDesc", { defaultValue: "Detailed analytics and reporting" })}
          </p>
        </div>
        <div className="p-8 text-center">
          <p className="text-red-500">
            {t("dashboard.error", { defaultValue: "Failed to load platform statistics" })}
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!metricsResponse?.data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
          <h2 className="text-2xl font-bold">
            {t("profile.dashboardPlatformStatistics", { defaultValue: "Platform Statistics" })}
          </h2>
          <p className="text-white/80 mt-2">
            {t("profile.analyticsDesc", { defaultValue: "Detailed analytics and reporting" })}
          </p>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">{t("common.na", { defaultValue: "No data available" })}</p>
        </div>
      </div>
    );
  }

  const metrics = metricsResponse.data;

  // Stat cards configuration
  const statCards = [
    {
      title: t("dashboard.totalUsers", { defaultValue: "Total Users" }),
      value: formatNumber(metrics.totalUsers),
      icon: <UserGroupIcon className="w-5 h-5" />,
      color: "text-[#7f56d9]",
      bg: "bg-[#f5f3ff]",
    },
    {
      title: t("dashboard.totalStudents", { defaultValue: "Total Students" }),
      value: formatNumber(metrics.totalStudents),
      icon: <AcademicCapIcon className="w-5 h-5" />,
      color: "text-[#7f56d9]",
      bg: "bg-[#f5f3ff]",
    },
    {
      title: t("dashboard.activeJobs", { defaultValue: "Active Jobs" }),
      value: formatNumber(metrics.activeJobs),
      icon: <BriefcaseIcon className="w-5 h-5" />,
      color: "text-[#7f56d9]",
      bg: "bg-[#f5f3ff]",
    },
    {
      title: t("dashboard.totalEarnings", { defaultValue: "Platform Wallet" }),
      value: `$${formatNumber(metrics.totalEarnings)}`,
      icon: <ChartBarIcon className="w-5 h-5" />,
      color: "text-[#7f56d9]",
      bg: "bg-[#f5f3ff]",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
        <h2 className="text-2xl font-bold">
          {t("profile.dashboardPlatformStatistics", { defaultValue: "Platform Statistics" })}
        </h2>
        <p className="text-white/80 mt-2">
          {t("profile.analyticsDesc", { defaultValue: "Detailed analytics and reporting" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Icon */}
              <div className={`${stat.bg} p-3 rounded-lg w-fit mb-4`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>

              {/* Value */}
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>

              {/* Title */}
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Analytics Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                {t("dashboard.analyticsInfo", { defaultValue: "Analytics Information" })}
              </h3>
              <p className="text-sm text-blue-700">
                {t("dashboard.analyticsInfoDesc", {
                  defaultValue:
                    "These metrics are updated in real-time from your database. Total Users includes all registered accounts, Total Students represents users with student role, Active Jobs shows jobs currently open for applications, and Platform Wallet displays the total platform earnings minus payouts to students.",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformStatistics;

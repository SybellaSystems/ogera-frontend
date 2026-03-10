import React from "react";
import { useTranslation } from "react-i18next";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <ChartBarIcon className="h-10 w-10 text-purple-600" />
          {t("pages.analytics.title")}
        </h1>
        <p className="text-gray-500 mt-2">{t("pages.analytics.subtitle")}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">{t("pages.analytics.totalRevenue")}</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">$2.4M</p>
          <p className="text-sm text-blue-600 mt-2">{t("pages.analytics.fromLastMonth", { percent: 18 })}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200">
          <p className="text-sm text-green-700 font-medium">{t("pages.analytics.activeUsers")}</p>
          <p className="text-3xl font-bold text-green-900 mt-2">12,450</p>
          <p className="text-sm text-green-600 mt-2">{t("pages.analytics.fromLastMonth", { percent: 12 })}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-md border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">{t("pages.analytics.jobsPosted")}</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">1,480</p>
          <p className="text-sm text-purple-600 mt-2">{t("pages.analytics.fromLastMonth", { percent: 8 })}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-md border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">{t("pages.analytics.successRate")}</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">94%</p>
          <p className="text-sm text-orange-600 mt-2">{t("pages.analytics.fromLastMonth", { percent: 3 })}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("pages.analytics.userGrowthTrend")}</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{t("pages.analytics.chartPlaceholder")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("pages.analytics.lineChartDesc")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("pages.analytics.revenueAnalytics")}</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{t("pages.analytics.chartPlaceholder")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("pages.analytics.barChartDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("pages.analytics.topJobCategories")}</h2>
          <div className="space-y-3">
            {[
              { name: "Software Dev", percentage: 32 },
              { name: "Marketing", percentage: 24 },
              { name: "Design", percentage: 18 },
              { name: "Data Science", percentage: 15 },
              { name: t("pages.analytics.others"), percentage: 11 },
            ].map((cat, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  <span className="text-sm font-semibold text-purple-600">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Demographics */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("pages.analytics.userDemographics")}</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{t("dashboard.students")}</span>
              <span className="text-lg font-bold text-blue-600">8,120</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{t("dashboard.employers")}</span>
              <span className="text-lg font-bold text-green-600">1,245</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Admins</span>
              <span className="text-lg font-bold text-purple-600">15</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("pages.analytics.platformActivity")}</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{t("pages.analytics.newRegistrations")}</p>
                <p className="text-xs text-gray-500">{t("pages.analytics.last7Days")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-blue-600 text-xl">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{t("pages.analytics.jobsPostedCount")}</p>
                <p className="text-xs text-gray-500">{t("pages.analytics.last7Days")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-purple-600 text-xl">⭐</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{t("pages.analytics.jobsCompletedCount")}</p>
                <p className="text-xs text-gray-500">{t("pages.analytics.last7Days")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;


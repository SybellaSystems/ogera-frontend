import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <ChartBarIcon className="h-10 w-10 text-purple-600" />
          Analytics & Reports
        </h1>
        <p className="text-gray-500 mt-2">Platform insights, trends, and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">$2.4M</p>
          <p className="text-sm text-blue-600 mt-2">↑ 18% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200">
          <p className="text-sm text-green-700 font-medium">Active Users</p>
          <p className="text-3xl font-bold text-green-900 mt-2">12,450</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-md border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Jobs Posted</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">1,480</p>
          <p className="text-sm text-purple-600 mt-2">↑ 8% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-md border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Success Rate</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">94%</p>
          <p className="text-sm text-orange-600 mt-2">↑ 3% from last month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth Trend</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart Placeholder</p>
              <p className="text-sm text-gray-400 mt-1">Line chart showing user growth over time</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Analytics</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart Placeholder</p>
              <p className="text-sm text-gray-400 mt-1">Bar chart showing monthly revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Job Categories</h2>
          <div className="space-y-3">
            {[
              { name: "Software Dev", percentage: 32 },
              { name: "Marketing", percentage: 24 },
              { name: "Design", percentage: 18 },
              { name: "Data Science", percentage: 15 },
              { name: "Others", percentage: 11 },
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Demographics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Students</span>
              <span className="text-lg font-bold text-blue-600">8,120</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Employers</span>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Activity</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">540 new registrations</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-blue-600 text-xl">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-900">230 jobs posted</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-purple-600 text-xl">⭐</span>
              <div>
                <p className="text-sm font-medium text-gray-900">89 jobs completed</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;


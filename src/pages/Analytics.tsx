import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetAdminTrustSummaryQuery } from "../services/api/trustScoreApi";

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const roleRaw = useSelector((state: any) => state.auth.role);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : "";
  const isAdminAnalytics =
    role === "superadmin" || role === "admin" || Boolean(role?.includes("admin"));

  const { data: trustApi, isLoading: trustLoading, isError: trustError } =
    useGetAdminTrustSummaryQuery(undefined, {
      skip: !isAdminAnalytics,
    });

  const trust = trustApi?.data;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <ChartBarIcon className="h-10 w-10 text-purple-600" />
          {t("pages.analytics.title")}
        </h1>
        <p className="text-gray-500 mt-2">{t("pages.analytics.subtitle")}</p>
      </div>

      {isAdminAnalytics && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("pages.analytics.trustScoreSection")}
          </h2>

          {trustLoading && (
            <p className="text-sm text-gray-500">{t("common.loading")}</p>
          )}
          {trustError && (
            <p className="text-sm text-red-600">{t("common.error")}</p>
          )}

          {trust && !trustLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-6 shadow-md border border-violet-200">
                  <p className="text-sm text-violet-700 font-medium">
                    {t("pages.analytics.avgTrustScore")}
                  </p>
                  <p className="text-3xl font-bold text-violet-900 mt-2">
                    {trust.average_trust_score != null
                      ? trust.average_trust_score.toFixed(1)
                      : "—"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 shadow-md border border-slate-200 md:col-span-2">
                  <p className="text-sm text-slate-700 font-medium">
                    {t("pages.analytics.studentsWithScore")}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {trust.students_with_score}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("pages.analytics.trustDistribution")}
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trust.distribution.map((d) => ({
                          name: d.label,
                          count: d.count,
                        }))}
                        margin={{ top: 8, right: 8, left: 0, bottom: 32 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          angle={-18}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis allowDecimals={false} width={36} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#7f56d9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("pages.analytics.topStudentsTrust")}
                  </h3>
                  <ul className="space-y-3">
                    {trust.top_users.map((u) => (
                      <li
                        key={u.user_id}
                        className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0"
                      >
                        <span className="font-medium text-gray-800 truncate pr-2">
                          {u.full_name}
                        </span>
                        <span className="shrink-0 text-purple-700 font-bold">
                          {u.trust_score != null ? u.trust_score.toFixed(0) : "—"}
                          {u.trust_level ? (
                            <span className="text-gray-400 font-normal text-xs ml-2">
                              {u.trust_level}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                    {!trust.top_users.length && (
                      <li className="text-sm text-gray-500">{t("common.noData")}</li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!isAdminAnalytics && (
        <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
          {t("pages.analytics.trustAdminOnly")}
        </p>
      )}

      {/* Key Metrics (existing placeholders) */}
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
    </div>
  );
};

export default Analytics;

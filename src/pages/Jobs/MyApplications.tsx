import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import CardsPerRowSelector from "../../components/Jobs/CardsPerRowSelector";
import MyApplicationJobCard from "../../components/Jobs/MyApplicationJobCard";

const MyApplications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = React.useState<
    "All" | "Pending" | "Accepted" | "Rejected"
  >("All");
  const [cardsPerRow, setCardsPerRow] = React.useState<2 | 3>(2);
  const [page, setPage] = React.useState(1);
  const { data: summaryData } = useGetStudentApplicationsQuery({ limit: 100 });
  const { data, isLoading, error } = useGetStudentApplicationsQuery(
    selectedStatus === "All"
      ? { page, limit: 10 }
      : { status: selectedStatus, page, limit: 10 },
  );

  const applications = data?.data || [];
  const summaryApplications = summaryData?.data || [];
  const pagination = data?.pagination;
  const viewAllLabel =
    selectedStatus === "All" ? "View All" : `View All ${selectedStatus}`;

  // Calculate statistics
  const pendingCount = summaryApplications.filter(
    (app) => app.status === "Pending"
  ).length;
  const acceptedCount = summaryApplications.filter(
    (app) => app.status === "Accepted"
  ).length;
  const rejectedCount = summaryApplications.filter(
    (app) => app.status === "Rejected"
  ).length;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="px-6 py-16 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 font-medium">
              {t("pages.myApplications.failedToLoad")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-fadeIn">
      {/* Header Section */}
      <div className="bg-white">
        <div className="px-6  max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <BriefcaseIcon className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {t("pages.myApplications.title")}
              </h1>
            </div>
            <button
              onClick={() => navigate("/dashboard/jobs/all")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-sm text-sm cursor-pointer"
            >
              {t("pages.myApplications.browseJobs")}
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            {t("pages.myApplications.subtitle")}
          </p>
        </div>
      </div>

      {/* Statistics */}
      {summaryApplications.length > 0 && (
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="flex items-center justify-between min-h-27.5 bg-white rounded-xl px-6 py-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                {t("pages.myApplications.totalApplications")}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {summaryApplications.length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-lg bg-purple-100 flex items-center justify-center">
                <BriefcaseIcon className="h-7 w-7 text-purple-600" />
              </div>
            </div>

            <div className="flex items-center justify-between min-h-27.5 bg-white rounded-xl px-6 py-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  {t("pages.jobs.pendingReview")}
                </p>
                <p className="text-3xl font-bold text-orange-500 mt-1">
                  {pendingCount}
                </p>
              </div>
              <div className="h-14 w-14 rounded-lg bg-orange-100 flex items-center justify-center">
                <ClockIcon className="h-7 w-7 text-orange-500" />
              </div>
            </div>

            <div className="flex items-center justify-between min-h-27.5 bg-white rounded-xl px-6 py-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  {t("pages.myApplications.accepted")}
                </p>
                <p className="text-3xl font-bold text-green-500 mt-1">
                  {acceptedCount}
                </p>
              </div>
              <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-7 w-7 text-green-500" />
              </div>
            </div>

            <div className="flex items-center justify-between min-h-27.5 bg-white rounded-xl px-6 py-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  {t("pages.myApplications.rejected")}
                </p>
                <p className="text-3xl font-bold text-red-500 mt-1">
                  {rejectedCount}
                </p>
              </div>
              <div className="h-14 w-14 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircleIcon className="h-7 w-7 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="px-6 pt-1 pb-2 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl px-4 py-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FunnelIcon className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">
              Filter by Status
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["All", "Pending", "Accepted", "Rejected"] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(status);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStatus === status
                      ? "bg-purple-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Results and layout controls */}
      <div className="px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-600">
              Showing {applications.length} of {pagination?.total ?? summaryApplications.length} applications
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/dashboard/jobs/my-applications/view-all?status=${selectedStatus.toLowerCase()}`,
                )
              }
              className="inline-flex items-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100 active:scale-95"
            >
              {viewAllLabel}
            </button>
          </div>
          <CardsPerRowSelector
            cardsPerRow={cardsPerRow}
            setCardsPerRow={setCardsPerRow}
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="px-6 py-4 max-w-7xl mx-auto">
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("pages.myApplications.noApplicationsYet")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("pages.myApplications.startBrowsing")}
            </p>
            <button
              onClick={() => navigate("/dashboard/jobs/all")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md cursor-pointer"
            >
              {t("pages.myApplications.browseJobs")}
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch ${
              cardsPerRow === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
            }`}
          >
            {applications.map((application: any) => (
              <MyApplicationJobCard
                key={application.application_id}
                application={application}
                onViewDetails={(jobId) => navigate(`/dashboard/jobs/${jobId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;



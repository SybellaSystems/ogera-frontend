import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/Loader";
import CardsPerRowSelector from "../../components/Jobs/CardsPerRowSelector";
import MyApplicationJobCard from "../../components/Jobs/MyApplicationJobCard";
import PaginationControls from "../../components/Jobs/PaginationControls";
import { useGetStudentApplicationsQuery } from "../../services/api/jobApplicationApi";

type ApplicationStatus = "all" | "pending" | "accepted" | "rejected";
type ApiApplicationStatus = "Pending" | "Accepted" | "Rejected";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

const ViewAllStudentApplications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerRow, setCardsPerRow] = useState<2 | 3>(2);

  const statusParam = searchParams.get("status")?.toLowerCase() || "all";
  const status: ApplicationStatus = Object.prototype.hasOwnProperty.call(
    STATUS_LABELS,
    statusParam,
  )
    ? (statusParam as ApplicationStatus)
    : "all";
  const apiStatus = status === "all"
    ? undefined
    : (STATUS_LABELS[status] as ApiApplicationStatus);

  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  const { data, isLoading, isFetching, error } =
    useGetStudentApplicationsQuery({
      ...(apiStatus ? { status: apiStatus } : {}),
      page: currentPage,
      limit: 20,
    });

  const applications = data?.data || [];
  const pagination = data?.pagination;
  const title = status === "all"
    ? "All Applications"
    : `${STATUS_LABELS[status]} Applications`;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="px-5 py-10 max-w-7xl mx-auto">
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
      <div className="px-5 pt-8 pb-5 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/dashboard/jobs/my-applications")}
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-slate-700 hover:text-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm">
              <BriefcaseIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Showing the latest 10 applications per page
              </p>
            </div>
          </div>

          <CardsPerRowSelector
            cardsPerRow={cardsPerRow}
            setCardsPerRow={setCardsPerRow}
          />
        </div>
      </div>

      <div className="px-5 pb-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-7">
          <p className="text-sm text-slate-600">
            Showing {applications.length} of {pagination?.total ?? applications.length} applications
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("pages.myApplications.noApplicationsYet")}
            </h3>
            <p className="text-gray-600">
              {t("pages.myApplications.startBrowsing")}
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch ${
              cardsPerRow === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
            }`}
          >
            {applications.map((application) => (
              <MyApplicationJobCard
                key={application.application_id}
                application={application}
                onViewDetails={(jobId) => navigate(`/dashboard/jobs/${jobId}`)}
              />
            ))}
          </div>
        )}

        {pagination && (
          <div className="mt-8">
            <PaginationControls
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              isFetching={isFetching}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllStudentApplications;

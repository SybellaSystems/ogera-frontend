
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import {
  useGetEmployerApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "../../services/api/jobApplicationApi";

import Loader from "../../components/Loader";
import ApplicationJobCard from "../../components/Jobs/ApplicationJobCard";
import toast from "react-hot-toast";
import api from "../../services/api/axiosInstance";
import CardsPerRowSelector from "../../components/Jobs/CardsPerRowSelector";
import PaginationControls from "../../components/Jobs/PaginationControls";

import type {
  TrustScore,
  TrustLevel,
} from "../../services/api/trustScoreApi";

function levelFromNumericScore(score: number): TrustLevel {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Competent";
  if (score >= 55) return "Developing";
  if (score >= 40) return "Emerging";
  return "Limited";
}

function trustScoreFromStudentUser(student: any): TrustScore | null {
  if (!student?.user_id || student.trust_score == null) {
    return null;
  }

  const trust = Number(student.trust_score);
  const I = Number(student.intelligence_score ?? 0);
  const E = Number(student.experience_score ?? 0);
  const C = Number(student.interaction_score ?? 0);

  const level =
    (student.trust_level as TrustLevel) ||
    levelFromNumericScore(trust);

  return {
    user_id: student.user_id,
    trust_score: trust,
    intelligence_score: I,
    experience_score: E,
    interaction_score: C,
    intelligence_percent: I * 100,
    experience_percent: E * 100,
    interaction_percent: C * 100,
    level,
    description: "",
    suggestions: [],
    source: "cached",
  };
}

type UrlStatus =
  | "all"
  | "pending"
  | "accepted"
  | "rejected";

type ApiStatus =
  | "Pending"
  | "Accepted"
  | "Rejected";

const AllJobApplications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const urlStatus =
    (searchParams.get("status") as UrlStatus) || "all";

  const [cardsPerRow, setCardsPerRow] = useState<2 | 3>(2);
  const [currentPage, setCurrentPage] = useState(1);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateApplicationStatusMutation();

  /**
   * Convert URL status to API status.
   *
   * all      -> undefined
   * pending  -> Pending
   * accepted -> Accepted
   * rejected -> Rejected
   */
  const apiStatus = useMemo<ApiStatus | undefined>(() => {
    switch (urlStatus) {
      case "pending":
        return "Pending";

      case "accepted":
        return "Accepted";

      case "rejected":
        return "Rejected";

      case "all":
      default:
        return undefined;
    }
  }, [urlStatus]);

  /**
   * Fetch latest 20 applications.
   *
   * For "all", status is intentionally omitted.
   */
  const {
    data: applicationsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetEmployerApplicationsQuery({
    ...(apiStatus ? { status: apiStatus } : {}),
    page: currentPage,
    limit: 20,
  });

  const applications = applicationsData?.data || [];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Accepted":
        return t("pages.jobs.acceptedLabel");

      case "Rejected":
        return t("pages.jobs.rejectedLabel");

      case "Pending":
        return t("pages.jobs.pendingLabel");

      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Pending":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return (
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
        );

      case "Rejected":
        return (
          <XCircleIcon className="h-5 w-5 text-red-600" />
        );

      case "Pending":
        return (
          <ClockIcon className="h-5 w-5 text-orange-600" />
        );

      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString(
      i18n.language === "en" ? "en-US" : i18n.language,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const handleStatusUpdate = async (
    applicationId: string,
    status: "Accepted" | "Rejected",
  ) => {
    try {
      setUpdatingId(`${applicationId}_${status}`);

      await updateStatus({
        application_id: applicationId,
        data: { status },
      }).unwrap();

      toast.success(
        status === "Accepted"
          ? t("pages.jobs.applicationAcceptedSuccess")
          : t("pages.jobs.applicationRejectedSuccess"),
      );

      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          err?.data?.error ||
          t("pages.jobs.failedToUpdateApplication"),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewResume = async (resumeUrl: string) => {
    try {
      let filePath = resumeUrl;

      if (resumeUrl.includes("/api/resumes/download")) {
        const url = new URL(
          resumeUrl,
          window.location.origin,
        );

        filePath =
          url.searchParams.get("path") || resumeUrl;
      } else if (
        resumeUrl.startsWith("http://") ||
        resumeUrl.startsWith("https://")
      ) {
        window.open(resumeUrl, "_blank");
        return;
      }

      const response = await api.get(
        `/resumes/download?path=${encodeURIComponent(filePath)}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob(
        [response.data as BlobPart],
        {
          type:
            (response.data as any)?.type ||
            "application/pdf",
        },
      );

      const blobUrl =
        window.URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error: any) {
      console.error(
        "Error viewing resume:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("pages.jobs.failedToViewResume"),
      );
    }
  };

  const getPageTitle = () => {
    switch (urlStatus) {
      case "pending":
        return t("pages.jobs.pendingLabel");

      case "accepted":
        return t("pages.jobs.acceptedLabel");

      case "rejected":
        return t("pages.jobs.rejectedLabel");

      default:
        return "All Applications";
    }
  };

  const applicationsPerPage = 4;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [urlStatus]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 font-medium">
              {t("pages.jobs.failedToLoadApplications")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/jobs/applications")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-violet-700"
            aria-label="Go back"
            title="Back"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-sm">
              <BriefcaseIcon className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {getPageTitle()}
              </h1>

              <p className="mt-0.5 text-sm text-gray-600">
                Showing the latest {applicationsPerPage} applications per page
              </p>
            </div>
          </div>

          <CardsPerRowSelector
            cardsPerRow={cardsPerRow}
            setCardsPerRow={setCardsPerRow}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-700">
            {applications.length}
          </span>{" "}
          {applications.length === 1 ? "application" : "applications"}
          {applicationsData?.pagination?.total !== undefined && (
            <>
              {" "}of{" "}
              <span className="font-bold text-slate-700">
                {applicationsData.pagination.total}
              </span>
            </>
          )}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16">
          <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No applications found
          </h3>

          <p className="text-sm text-gray-600">
            There are no applications matching this status.
          </p>
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              cardsPerRow === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
            }`}
          >
            {applications.map((application) => (
              <ApplicationJobCard
                key={application.application_id}
                application={application}
                isUpdating={isUpdating}
                updatingId={updatingId}
                onStatusUpdate={handleStatusUpdate}
                onViewResume={handleViewResume}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatDate={formatDate}
                trustScoreFromStudentUser={trustScoreFromStudentUser}
                t={t}
              />
            ))}
          </div>

          {applicationsData?.pagination?.totalPages &&
            applicationsData.pagination.totalPages > 1 && (
              <div className="pt-2">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={applicationsData.pagination.totalPages}
                  isFetching={isFetching}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}

          {isFetching && (
            <div className="flex justify-center mt-6">
              <div className="text-sm text-gray-500">
                Loading applications...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllJobApplications;


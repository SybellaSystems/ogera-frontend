import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";
import { getUserDisputes, type Dispute } from "../../services/api/disputesApi";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const MyDisputes: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const disputes = await getUserDisputes();
      setDisputes(disputes || []);
    } catch (error: any) {
      console.error("Failed to fetch my disputes:", error);
      toast.error(error?.response?.data?.message || t("disputes.failedToLoadDisputes"));
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Open":
        return t("disputes.statusOpen");
      case "Under Review":
        return t("disputes.statusUnderReview");
      case "Mediation":
        return t("disputes.statusMediation");
      case "Resolved":
        return t("disputes.statusResolved");
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "High":
        return t("disputes.high");
      case "Medium":
        return t("disputes.medium");
      case "Low":
        return t("disputes.low");
      default:
        return priority;
    }
  };

  const columns: Column<Dispute>[] = [
    {
      id: "type",
      label: t("disputes.type"),
      minWidth: 130,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: "var(--chip-permission-yes-bg)",
            color: "var(--chip-permission-yes-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "title",
      label: t("disputes.title"),
      minWidth: 250,
      format: (value) => (
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "var(--theme-text-primary, #374151)",
            fontWeight: 600,
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "status",
      label: t("disputes.statusLabel"),
      minWidth: 120,
      format: (value) => (
        <Chip
          label={getStatusLabel(value)}
          size="small"
          sx={{
            bgcolor:
              value === "Open"
                ? "var(--chip-status-suspended-bg)"
                : value === "Under Review" || value === "Mediation"
                ? "var(--chip-warning-bg)"
                : "var(--chip-verified-bg)",
            color:
              value === "Open"
                ? "var(--chip-status-suspended-text)"
                : value === "Under Review" || value === "Mediation"
                ? "var(--chip-warning-text)"
                : "var(--chip-verified-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "priority",
      label: t("disputes.priority"),
      minWidth: 100,
      format: (value) => (
        <Chip
          label={getPriorityLabel(value)}
          size="small"
          sx={{
            bgcolor:
              value === "High"
                ? "var(--chip-status-suspended-bg)"
                : value === "Medium"
                ? "var(--chip-warning-bg)"
                : "var(--chip-permission-yes-bg)",
            color:
              value === "High"
                ? "var(--chip-status-suspended-text)"
                : value === "Medium"
                ? "var(--chip-warning-text)"
                : "var(--chip-permission-yes-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "created_at",
      label: t("disputes.created"),
      minWidth: 120,
      format: (value) =>
        new Date(value).toLocaleDateString(
          i18n.language === "en" ? "en-US" : i18n.language
        ),
    },
  ];

  const actions: TableAction<Dispute>[] = [
    {
      label: t("disputes.viewDetails"),
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        navigate(`/dashboard/disputes/${row.dispute_id}`);
      },
      color: "primary",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <ExclamationTriangleIcon className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
            {t("disputes.myDisputesTitle")}
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            {t("disputes.myDisputesSubtitle")}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/disputes/create")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          {t("disputes.fileNewDispute")}
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("disputes.noDisputesYet")}
          </h3>
          <p className="text-gray-500 mb-6">{t("disputes.noDisputesMessage")}</p>
          <button
            onClick={() => navigate("/dashboard/disputes/create")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            {t("disputes.fileFirstDispute")}
          </button>
        </div>
      ) : (
        <CustomTable
          columns={columns}
          data={disputes}
          actions={actions}
          searchable={true}
          searchPlaceholder={t("disputes.searchPlaceholder")}
          rowsPerPageOptions={[5, 10, 25]}
          defaultRowsPerPage={10}
        />
      )}
    </div>
  );
};

export default MyDisputes;

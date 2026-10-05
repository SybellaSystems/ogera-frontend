import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClockIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  MessageOutlined as MessageIcon,
} from "@mui/icons-material";

import {
  getAllDisputes,
  getDisputeStats,
  type Dispute,
} from "../../services/api/disputesApi";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

const InProgress: React.FC = () => {
  const { t } = useTranslation();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [priorityCounts, setPriorityCounts] = useState({
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      // Fetch disputes with status "Under Review" or "Mediation" (in progress)
      const [result, statsResult] = await Promise.all([
        getAllDisputes({
          status: ["Under Review", "Mediation"],
          page: 1,
          limit: 100,
        }),
        getDisputeStats().catch((error) => {
          console.error("Failed to fetch in-progress priority counts:", error);
          return null;
        }),
      ]);
      setDisputes(result.data || []);
      if (statsResult) {
        setPriorityCounts(
          statsResult.inProgressPriorityCounts || { high: 0, medium: 0, low: 0 },
        );
      }
    } catch (error) {
      console.error("Failed to fetch in-progress disputes:", error);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Dispute>[] = [
    {
      id: "type",
      label: t("disputes.type"),
      minWidth: 150,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: "var(--chip-warning-bg)",
            color: "var(--chip-warning-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "title",
      label: t("disputes.description"),
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
      id: "student",
      label: t("disputes.student"),
      minWidth: 150,
       format: (value: any, row: any) => {
        return row.reported_by === 'student' ? (value?.full_name || t("disputes.na")) : "-";
      },
    },
    {
      id: "employer",
      label: t("disputes.employer"),
      minWidth: 150,
      format: (value: any) => value?.full_name || t("disputes.na"),
    },
    {
      id: "moderator",
      label: t("disputes.assignedTo"),
      minWidth: 130,
      format: (value: any) => (
        <Chip
          label={value?.full_name || t("disputes.unassigned")} 
                   size="small"
          sx={{
            bgcolor: "var(--chip-role-admin-bg)",
            color: "var(--chip-role-admin-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "created_at",
      label: t("disputes.started"),
      minWidth: 120,
            format: (value) => new Date(value).toLocaleDateString(),
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
    {
      label: t("disputes.message"),
      icon: <MessageIcon fontSize="small" />,
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
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <ClockIcon className="h-8 w-8 md:h-10 md:w-10 text-orange-600" />
          {t("disputes.inProgressTitle")}
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          {t("disputes.inProgressSubtitle")}
        </p>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
        <p className="text-orange-800 font-medium text-sm md:text-base">
          🔄 {t("disputes.inProgressCountMessage", { count: disputes.length })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">{t("disputes.highPriority")}</p>
          <p className="mt-2 text-3xl font-bold text-red-900">{priorityCounts.high}</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-medium text-orange-700">{t("disputes.mediumPriority")}</p>
          <p className="mt-2 text-3xl font-bold text-orange-900">{priorityCounts.medium}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-700">{t("disputes.lowPriority")}</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">{priorityCounts.low}</p>
        </div>
      </div>

      <CustomTable
        columns={columns}
        data={disputes}
        actions={actions}
        searchable={true}
        searchPlaceholder={t("disputes.searchPlaceholder")}
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default InProgress;


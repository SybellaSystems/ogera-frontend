import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";

import { getAllDisputes, type Dispute } from "../../services/api/disputesApi";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

const Resolved: React.FC = () => {
  const { t } = useTranslation();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      // Fetch disputes with status "Resolved"
      const result = await getAllDisputes({ 
        status: "Resolved", 
        page: 1, 
        limit: 100 
      });
      setDisputes(result.data || []);
    } catch (error) {
      console.error("Failed to fetch resolved disputes:", error);
    } finally {
      setLoading(false);
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
      format: (value: any, row: any) => {
        return row.reported_by === 'employer' ? (value?.full_name || t("disputes.na")) : "-";
      },
    },
    {
      id: "resolution",
      label: t("disputes.outcome"),
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value || t("disputes.pending")}
          size="small"
          sx={{
            bgcolor: "var(--chip-verified-bg)",
            color: "var(--chip-verified-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "resolved_at",
      label: t("disputes.resolvedDate"),
      minWidth: 130,
            format: (value) => value ? new Date(value).toLocaleDateString() : t("disputes.na"),
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

   // Calculate resolved this month
  const resolvedThisMonth = disputes.filter((d) => {
    if (!d.resolved_at) return false;
    const resolvedDate = new Date(d.resolved_at);
    const now = new Date();
    return resolvedDate.getMonth() === now.getMonth() && 
           resolvedDate.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <CheckCircleIcon className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
          {t("disputes.resolvedTitle")}
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          {t("disputes.resolvedSubtitle")}
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
        <p className="text-green-800 font-medium text-sm md:text-base">
          ✓ {t("disputes.resolvedCountMessage", { count: resolvedThisMonth })}
        </p>
      </div>

      <CustomTable
        columns={columns}
        data={disputes}
        actions={actions}
        searchable={true}
        searchPlaceholder={t("disputes.searchResolvedPlaceholder")}
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default Resolved;


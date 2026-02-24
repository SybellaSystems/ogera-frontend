import React from "react";
import { ExclamationCircleIcon, ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  MessageOutlined as MessageIcon,
  CheckCircle as ResolveIcon,
} from "@mui/icons-material";
import { useGetDisputesQuery, useGetDisputeStatsQuery, type Dispute as ApiDispute } from "../../services/api/disputeApi";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

interface DisputeRow {
  id: string;
  dispute_id: string;
  type: string;
  student: string;
  employer: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  reportedDate: string;
}

const OpenDisputes: React.FC = () => {
  const { data: disputesData, isLoading, error, refetch } = useGetDisputesQuery({ status: "Open" });
  const { data: statsData } = useGetDisputeStatsQuery();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const stats = statsData?.data;

  // Transform API data to table format
  const disputes: DisputeRow[] = (disputesData?.data || []).map((dispute: ApiDispute) => ({
    id: dispute.dispute_id,
    dispute_id: dispute.dispute_id,
    type: dispute.type,
    student: dispute.student?.full_name || 'N/A',
    employer: dispute.employer?.full_name || 'N/A',
    description: dispute.description,
    priority: dispute.priority,
    reportedDate: new Date(dispute.created_at).toLocaleDateString(),
  }));

  const columns: Column<DisputeRow>[] = [
    {
      id: "type",
      label: "Type",
      minWidth: 150,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: isDark ? "rgba(127,86,217,0.2)" : "#f3e8ff",
            color: isDark ? "#c084fc" : "#7c3aed",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "title",
      label: "Title",
      minWidth: 200,
      format: (value) => (
        <Typography sx={{ fontSize: "0.875rem", color: isDark ? "#d1d5db" : "#374151", fontWeight: 600 }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "student",
      label: "Student",
      minWidth: 150,
       format: (value: any, row: any) => {
        return row.reported_by === 'student' ? (value?.full_name || "N/A") : "-";
      },
    },
    {
      id: "employer",
      label: "Employer",
      minWidth: 150,
      format: (value: any, row: any) => {
        return row.reported_by === 'employer' ? (value?.full_name || "N/A") : "-";
      },
    },
    {
      id: "priority",
      label: "Priority",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          role="status"
          aria-label={`Priority: ${value}`}
          sx={{
            bgcolor:
              value === "High"
                ? isDark ? "rgba(220,38,38,0.2)" : "#fee2e2"
                : value === "Medium"
                ? isDark ? "rgba(234,88,12,0.2)" : "#fed7aa"
                : isDark ? "rgba(59,130,246,0.2)" : "#dbeafe",
            color:
              value === "High"
                ? isDark ? "#fca5a5" : "#991b1b"
                : value === "Medium"
                ? isDark ? "#fdba74" : "#9a3412"
                : isDark ? "#93c5fd" : "#1e40af",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "created_at",
      label: "Reported Date",
      minWidth: 130,
            format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions: TableAction<DisputeRow>[] = [
    {
      label: "View Details",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
                navigate(`/dashboard/disputes/${row.dispute_id}`);
      },
      color: "primary",
    },
    {
      label: "Message Parties",
      icon: <MessageIcon fontSize="small" />,
      onClick: (row) => {
                navigate(`/dashboard/disputes/${row.dispute_id}`);
      },
      color: "primary",
    },
    {
      label: "Resolve",
      icon: <ResolveIcon fontSize="small" />,
      onClick: (row) => {
                navigate(`/dashboard/disputes/${row.dispute_id}`);
      },
      color: "success",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" aria-busy="true" aria-label="Loading open disputes">
        <ArrowPathIcon className="h-8 w-8 text-[#7F56D9] animate-spin" />
        <span className="ml-2" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Loading open disputes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div
          className="rounded-lg p-4 flex items-center gap-3"
          style={{
            background: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
            border: isDark ? "1px solid rgba(220,38,38,0.3)" : "1px solid #fecaca",
          }}
          role="alert"
        >
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-sm font-medium" style={{ color: isDark ? "#fca5a5" : "#991b1b" }}>Failed to load open disputes</p>
            <p className="text-xs mt-1" style={{ color: isDark ? "#f87171" : "#dc2626" }}>Please try again later</p>
          </div>
          <button
            onClick={() => refetch()}
            className="ml-auto px-3 py-1.5 rounded text-xs font-medium transition"
            style={{
              background: isDark ? "rgba(220,38,38,0.2)" : "#fee2e2",
              color: isDark ? "#fca5a5" : "#b91c1c",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1
          className="text-2xl md:text-4xl font-extrabold flex items-center gap-2 md:gap-3"
          style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
        >
          <ExclamationCircleIcon className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
          Open Disputes
        </h1>
        <p className="text-sm md:text-base mt-2" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
          Disputes that require immediate attention
        </p>
      </div>

      <div
        className="p-4 rounded-lg"
        style={{
          background: isDark ? "rgba(220,38,38,0.1)" : "#fef2f2",
          borderLeft: "4px solid #ef4444",
        }}
        role="status"
      >
        <p className="font-medium text-sm md:text-base flex items-center gap-2" style={{ color: isDark ? "#fca5a5" : "#991b1b" }}>
          {disputes.length > 0 ? (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span>{disputes.length} open dispute{disputes.length > 1 ? 's' : ''} requiring action</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span style={{ color: isDark ? "#86efac" : "#065f46" }}>No open disputes requiring attention</span>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div
          className="rounded-xl p-6"
          style={{
            background: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
            border: isDark ? "1px solid rgba(220,38,38,0.3)" : "1px solid #fecaca",
          }}
          aria-label={`${stats?.byPriority?.high || 0} high priority disputes`}
        >
          <p className="text-sm font-medium" style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}>High Priority</p>
          <p className="text-3xl font-bold mt-2" style={{ color: isDark ? "#fca5a5" : "#7f1d1d" }}>{stats?.byPriority?.high || 0}</p>
        </div>
        <div
          className="rounded-xl p-6"
          style={{
            background: isDark ? "rgba(234,88,12,0.15)" : "#fff7ed",
            border: isDark ? "1px solid rgba(234,88,12,0.3)" : "1px solid #fed7aa",
          }}
          aria-label={`${stats?.byPriority?.medium || 0} medium priority disputes`}
        >
          <p className="text-sm font-medium" style={{ color: isDark ? "#fdba74" : "#c2410c" }}>Medium Priority</p>
          <p className="text-3xl font-bold mt-2" style={{ color: isDark ? "#fdba74" : "#7c2d12" }}>{stats?.byPriority?.medium || 0}</p>
        </div>
        <div
          className="rounded-xl p-6"
          style={{
            background: isDark ? "rgba(59,130,246,0.15)" : "#eff6ff",
            border: isDark ? "1px solid rgba(59,130,246,0.3)" : "1px solid #bfdbfe",
          }}
          aria-label={`${stats?.byPriority?.low || 0} low priority disputes`}
        >
          <p className="text-sm font-medium" style={{ color: isDark ? "#93c5fd" : "#1d4ed8" }}>Low Priority</p>
          <p className="text-3xl font-bold mt-2" style={{ color: isDark ? "#93c5fd" : "#1e3a5f" }}>{stats?.byPriority?.low || 0}</p>
        </div>
      </div>

      <CustomTable
        columns={columns}
        data={disputes}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search disputes..."
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default OpenDisputes;

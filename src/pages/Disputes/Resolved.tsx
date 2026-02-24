import React from "react";
import { CheckCircleIcon, ArrowPathIcon, ExclamationCircleIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";
import { useGetDisputesQuery, type Dispute as ApiDispute } from "../../services/api/disputeApi";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

interface DisputeRow {
  id: string;
  dispute_id: string;
  type: string;
  student: string;
  employer: string;
  description: string;
  resolvedDate: string;
  outcome: string;
}

const Resolved: React.FC = () => {
  const { data: disputesData, isLoading, error, refetch } = useGetDisputesQuery({ status: "Resolved" });
  const navigate = useNavigate();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Transform API data to table format
  const disputes: DisputeRow[] = (disputesData?.data || []).map((dispute: ApiDispute) => ({
    id: dispute.dispute_id,
    dispute_id: dispute.dispute_id,
    type: dispute.type,
    student: dispute.student?.full_name || 'N/A',
    employer: dispute.employer?.full_name || 'N/A',
    description: dispute.description,
    resolvedDate: dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleDateString() : 'N/A',
    outcome: dispute.outcome || 'Resolved',
  }));

  const columns: Column<DisputeRow>[] = [
    {
      id: "type",
      label: "Type",
      minWidth: 130,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: isDark ? "rgba(59,130,246,0.15)" : "#dbeafe",
            color: isDark ? "#93c5fd" : "#1e40af",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "title",
      label: "Description",
      minWidth: 250,
      format: (value) => (
        <Typography sx={{ fontSize: "0.875rem", color: isDark ? "#f3f4f6" : "#374151", fontWeight: 600 }}>
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
      id: "resolution",
      label: "Outcome",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value || "Pending"}
          size="small"
          sx={{
            bgcolor: isDark ? "rgba(22,163,74,0.15)" : "#d1fae5",
            color: isDark ? "#34d399" : "#065f46",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "resolved_at",
      label: "Resolved Date",
      minWidth: 130,
      format: (value) => (
        <span style={{ color: isDark ? "#d1d5db" : "#374151" }}>
          {value ? new Date(value).toLocaleDateString() : "N/A"}
        </span>
      ),
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
  ];

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading resolved disputes"
        className="flex items-center justify-center h-64"
      >
        <ArrowPathIcon className="h-8 w-8 animate-spin" style={{ color: "#7F56D9" }} />
        <span className="ml-2 text-sm" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Loading resolved disputes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="space-y-4 animate-fadeIn"
        style={{
          background: isDark ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)" : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
          minHeight: "100%", padding: "1rem", borderRadius: "0.5rem",
        }}
      >
        <div
          role="alert"
          className="rounded-lg p-4 flex items-center gap-3"
          style={{
            backgroundColor: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
            border: isDark ? "1px solid rgba(220,38,38,0.3)" : "1px solid #fecaca",
          }}
        >
          <ExclamationCircleIcon className="h-6 w-6" style={{ color: isDark ? "#f87171" : "#ef4444" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: isDark ? "#fca5a5" : "#991b1b" }}>Failed to load resolved disputes</p>
            <p className="text-xs mt-1" style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}>Please try again later</p>
          </div>
          <button
            onClick={() => refetch()}
            className="ml-auto px-3 py-1.5 rounded text-xs font-medium transition"
            style={{ backgroundColor: isDark ? "rgba(220,38,38,0.25)" : "#fee2e2", color: isDark ? "#fca5a5" : "#b91c1c" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 animate-fadeIn"
      style={{
        background: isDark ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)" : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
          <CheckCircleIcon className="h-6 w-6" style={{ color: isDark ? "#34d399" : "#16a34a" }} />
          Resolved Disputes
        </h1>
        <p className="text-xs mt-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
          Successfully resolved disputes archive
        </p>
      </div>

      <div
        className="rounded-lg p-3"
        role="status"
        aria-label={`${disputes.length} resolved disputes`}
        style={{
          backgroundColor: isDark ? "rgba(22,163,74,0.15)" : "#f0fdf4",
          borderLeft: `4px solid ${isDark ? "#34d399" : "#16a34a"}`,
        }}
      >
        <p className="text-xs font-medium flex items-center gap-2" style={{ color: isDark ? "#34d399" : "#15803d" }}>
          {disputes.length > 0 ? (
            <>
              <CheckCircleIcon className="h-4 w-4 flex-shrink-0" style={{ color: isDark ? "#34d399" : "#16a34a" }} />
              <span>{disputes.length} dispute{disputes.length > 1 ? 's' : ''} resolved</span>
            </>
          ) : (
            <>
              <ClipboardDocumentListIcon className="h-4 w-4 flex-shrink-0" style={{ color: isDark ? "#34d399" : "#16a34a" }} />
              <span>No resolved disputes yet</span>
            </>
          )}
        </p>
      </div>

      <CustomTable
        columns={columns}
        data={disputes}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search resolved disputes..."
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default Resolved;

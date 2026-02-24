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
            bgcolor: "#f3e8ff",
            color: "#7c3aed",
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
        <Typography sx={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "student",
      label: "Student",
      minWidth: 150,
       format: (value: any, row: any) => {
        // If dispute was created by student, show name, otherwise show "-"
        return row.reported_by === 'student' ? (value?.full_name || "N/A") : "-";
      },
    },
    {
      id: "employer",
      label: "Employer",
      minWidth: 150,
      format: (value: any, row: any) => {
        // If dispute was created by employer, show name, otherwise show "-"
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
          sx={{
            bgcolor:
              value === "High"
                ? "#fee2e2"
                : value === "Medium"
                ? "#fed7aa"
                : "#dbeafe",
            color:
              value === "High"
                ? "#991b1b"
                : value === "Medium"
                ? "#9a3412"
                : "#1e40af",
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
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-[#7F56D9] animate-spin" />
        <span className="ml-2 text-gray-500">Loading open disputes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load open disputes</p>
            <p className="text-xs text-red-600 mt-1">Please try again later</p>
          </div>
          <button
            onClick={() => refetch()}
            className="ml-auto px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition"
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
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <ExclamationCircleIcon className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
          Open Disputes
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Disputes that require immediate attention
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 font-medium text-sm md:text-base flex items-center gap-2">
          {disputes.length > 0 ? (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span>{disputes.length} open dispute{disputes.length > 1 ? 's' : ''} requiring action</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span>No open disputes requiring attention</span>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-medium">High Priority</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{stats?.byPriority?.high || 0}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Medium Priority</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">{stats?.byPriority?.medium || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Low Priority</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.byPriority?.low || 0}</p>
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

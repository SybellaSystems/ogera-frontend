import React from "react";
import { ClockIcon, ArrowPathIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  MessageOutlined as MessageIcon,
} from "@mui/icons-material";
import { useGetDisputesQuery, type Dispute as ApiDispute } from "../../services/api/disputeApi";
import { useNavigate } from "react-router-dom";

interface DisputeRow {
  id: string;
  dispute_id: string;
  type: string;
  student: string;
  employer: string;
  description: string;
  assignedTo: string;
  startedDate: string;
}

const InProgress: React.FC = () => {
  const { data: disputesData, isLoading, error, refetch } = useGetDisputesQuery({ status: "In Progress" });
  const navigate = useNavigate();

  // Transform API data to table format
  const disputes: DisputeRow[] = (disputesData?.data || []).map((dispute: ApiDispute) => ({
    id: dispute.dispute_id,
    dispute_id: dispute.dispute_id,
    type: dispute.type,
    student: dispute.student?.full_name || 'N/A',
    employer: dispute.employer?.full_name || 'N/A',
    description: dispute.description,
    assignedTo: dispute.assignedAdmin?.full_name || 'Unassigned',
    startedDate: dispute.started_at ? new Date(dispute.started_at).toLocaleDateString() : new Date(dispute.created_at).toLocaleDateString(),
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
            bgcolor: "#fef3c7",
            color: "#92400e",
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
      id: "moderator",
      label: "Assigned To",
      minWidth: 130,
      format: (value: any) => (
        <Chip
          label={value?.full_name || "Unassigned"}
                   size="small"
          sx={{
            bgcolor: "#dbeafe",
            color: "#1e40af",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "created_at",
      label: "Started",
      minWidth: 120,
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
      label: "Message",
      icon: <MessageIcon fontSize="small" />,
      onClick: (row) => {
                navigate(`/dashboard/disputes/${row.dispute_id}`);
      },
      color: "primary",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-[#7F56D9] animate-spin" />
        <span className="ml-2 text-gray-500">Loading in-progress disputes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load in-progress disputes</p>
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
          <ClockIcon className="h-8 w-8 md:h-10 md:w-10 text-orange-600" />
          In Progress Disputes
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Disputes currently being reviewed and resolved
        </p>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
        <p className="text-orange-800 font-medium text-sm md:text-base flex items-center gap-2">
          {disputes.length > 0 ? (
            <>
              <ArrowPathIcon className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <span>{disputes.length} dispute{disputes.length > 1 ? 's' : ''} under review</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span>No disputes currently under review</span>
            </>
          )}
        </p>
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

export default InProgress;

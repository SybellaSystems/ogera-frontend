import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Box, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  MessageOutlined as MessageIcon,
  CheckCircle as ResolveIcon,
} from "@mui/icons-material";

interface Dispute {
  id: number;
  type: string;
  student: string;
  employer: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  reportedDate: string;
}

const OpenDisputes: React.FC = () => {
  const disputes: Dispute[] = [
    {
      id: 1,
      type: "Payment",
      student: "John Doe",
      employer: "TechCorp",
      description: "Payment not received for completed work",
      priority: "High",
      reportedDate: "2024-03-10",
    },
    {
      id: 2,
      type: "Contract Violation",
      student: "Emily Smith",
      employer: "StartupXYZ",
      description: "Work hours exceeded agreement",
      priority: "Medium",
      reportedDate: "2024-03-12",
    },
    {
      id: 3,
      type: "Quality Issue",
      student: "Mike Johnson",
      employer: "DesignHub",
      description: "Deliverables quality disputed",
      priority: "Low",
      reportedDate: "2024-03-14",
    },
  ];

  const columns: Column<Dispute>[] = [
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
      id: "description",
      label: "Description",
      minWidth: 250,
      format: (value) => (
        <Typography sx={{ fontSize: "0.875rem", color: "#374151" }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "student",
      label: "Student",
      minWidth: 150,
    },
    {
      id: "employer",
      label: "Employer",
      minWidth: 150,
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
      id: "reportedDate",
      label: "Reported Date",
      minWidth: 130,
    },
  ];

  const actions: TableAction<Dispute>[] = [
    {
      label: "View Details",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View dispute:", row);
      },
      color: "primary",
    },
    {
      label: "Message Parties",
      icon: <MessageIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Message:", row);
      },
      color: "primary",
    },
    {
      label: "Resolve",
      icon: <ResolveIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Resolve dispute:", row);
      },
      color: "success",
    },
  ];

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
        <p className="text-red-800 font-medium text-sm md:text-base">
          ⚠️ {disputes.length} open disputes requiring action
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-medium">High Priority</p>
          <p className="text-3xl font-bold text-red-900 mt-2">1</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Medium Priority</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">1</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Low Priority</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">1</p>
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


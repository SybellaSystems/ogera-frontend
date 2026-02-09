import React from "react";
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

interface Dispute {
  id: number;
  type: string;
  student: string;
  employer: string;
  description: string;
  assignedTo: string;
  startedDate: string;
}

const InProgress: React.FC = () => {
  const disputes: Dispute[] = [
    {
      id: 1,
      type: "Service Quality",
      student: "Sarah Wilson",
      employer: "Marketing Pro",
      description: "Dispute over service quality standards",
      assignedTo: "Admin John",
      startedDate: "2024-03-08",
    },
    {
      id: 2,
      type: "Timeline",
      student: "David Lee",
      employer: "DevShop",
      description: "Project deadline extension dispute",
      assignedTo: "Admin Sarah",
      startedDate: "2024-03-09",
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
            bgcolor: "#fef3c7",
            color: "#92400e",
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
      id: "assignedTo",
      label: "Assigned To",
      minWidth: 130,
      format: (value) => (
        <Chip
          label={value}
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
      id: "startedDate",
      label: "Started",
      minWidth: 120,
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
      label: "Message",
      icon: <MessageIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Message:", row);
      },
      color: "primary",
    },
  ];

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
        <p className="text-orange-800 font-medium text-sm md:text-base">
          🔄 {disputes.length} disputes under review
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


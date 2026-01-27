import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";

interface Dispute {
  id: number;
  type: string;
  student: string;
  employer: string;
  description: string;
  resolvedDate: string;
  outcome: string;
}

const Resolved: React.FC = () => {
  const disputes: Dispute[] = [
    {
      id: 1,
      type: "Payment",
      student: "Alice Brown",
      employer: "WebDesign Co",
      description: "Payment issue resolved with refund",
      resolvedDate: "2024-03-05",
      outcome: "Refunded",
    },
    {
      id: 2,
      type: "Quality",
      student: "Tom Wilson",
      employer: "App Builders",
      description: "Quality dispute settled with additional work",
      resolvedDate: "2024-03-03",
      outcome: "Settled",
    },
  ];

  const columns: Column<Dispute>[] = [
    {
      id: "type",
      label: "Type",
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
      id: "outcome",
      label: "Outcome",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: "#d1fae5",
            color: "#065f46",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "resolvedDate",
      label: "Resolved Date",
      minWidth: 130,
    },
  ];

  const actions: TableAction<Dispute>[] = [
    {
      label: "View Details",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View resolved dispute:", row);
      },
      color: "primary",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <CheckCircleIcon className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
          Resolved Disputes
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Successfully resolved disputes archive
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
        <p className="text-green-800 font-medium text-sm md:text-base">
          ✓ {disputes.length} disputes resolved this month
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


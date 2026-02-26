import React from "react";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Avatar, Box, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  LockOpen as UnlockIcon,
  History as HistoryIcon,
} from "@mui/icons-material";

interface SuspendedUser {
  id: number;
  name: string;
  email: string;
  role: "Student" | "Employer";
  reason: string;
  suspendedDate: string;
  duration: string;
}

const Suspended: React.FC = () => {
  const suspendedUsers: SuspendedUser[] = [
    {
      id: 1,
      name: "Robert Smith",
      email: "robert@example.com",
      role: "Student",
      reason: "Suspicious activity",
      suspendedDate: "2024-03-10",
      duration: "7 days",
    },
    {
      id: 2,
      name: "Anna Johnson",
      email: "anna@company.com",
      role: "Employer",
      reason: "Multiple violations",
      suspendedDate: "2024-03-08",
      duration: "30 days",
    },
    {
      id: 3,
      name: "Tom Wilson",
      email: "tom@example.com",
      role: "Student",
      reason: "Policy violation",
      suspendedDate: "2024-03-12",
      duration: "14 days",
    },
  ];

  const columns: Column<SuspendedUser>[] = [
    {
      id: "name",
      label: "User",
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#ef4444",
              width: 40,
              height: 40,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 500, color: "var(--theme-text-primary, #111827)" }}>
              {value}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--theme-text-secondary, #6b7280)" }}>
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "role",
      label: "Role",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: value === "Student" ? "var(--chip-role-student-bg)" : "var(--chip-role-employer-bg)",
            color: value === "Student" ? "var(--chip-role-student-text)" : "var(--chip-role-employer-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "reason",
      label: "Suspension Reason",
      minWidth: 200,
      format: (value) => (
        <Typography sx={{ fontSize: "0.875rem", color: "#ef4444", fontWeight: 500 }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "suspendedDate",
      label: "Suspended Date",
      minWidth: 130,
    },
    {
      id: "duration",
      label: "Duration",
      minWidth: 100,
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
  ];

  const actions: TableAction<SuspendedUser>[] = [
    {
      label: "View Details",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View suspended user:", row);
      },
      color: "primary",
    },
    {
      label: "View History",
      icon: <HistoryIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View history:", row);
      },
      color: "primary",
    },
    {
      label: "Unsuspend",
      icon: <UnlockIcon fontSize="small" />,
      onClick: (row) => {
        if (window.confirm(`Unsuspend ${row.name}?`)) {
          console.log("Unsuspend user:", row);
        }
      },
      color: "success",
    },
  ];

  return (
    <div className="theme-page-bg space-y-6 animate-fadeIn min-h-full p-4">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-[var(--theme-text-primary)] flex items-center gap-2 md:gap-3">
          <ShieldExclamationIcon className="h-8 w-8 md:h-10 md:w-10 text-red-600 dark:text-red-400" />
          Suspended Users
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-[var(--theme-text-secondary)] mt-2">
          Manage suspended and temporarily locked user accounts
        </p>
      </div>

      <div className="bg-red-50 dark:border-red-400/80 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200 font-medium text-sm md:text-base">
          🔒 {suspendedUsers.length} accounts currently suspended
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Total Suspended</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{suspendedUsers.length}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">This Week</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">2</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Avg Duration</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">14 days</p>
        </div>
      </div>

      {/* Suspended Users Table */}
      <CustomTable
        columns={columns}
        data={suspendedUsers}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search suspended users..."
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default Suspended;


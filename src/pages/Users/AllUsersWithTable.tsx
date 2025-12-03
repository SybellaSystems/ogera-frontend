import React from "react";
import { UsersIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Avatar, Box, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Student" | "Employer";
  status: "Active" | "Pending" | "Suspended";
  joinDate: string;
}

const AllUsersWithTable: React.FC = () => {
  const users: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Student",
      status: "Active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Employer",
      status: "Active",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Student",
      status: "Pending",
      joinDate: "2024-03-10",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "Employer",
      status: "Active",
      joinDate: "2024-01-25",
    },
    {
      id: 5,
      name: "David Brown",
      email: "david@example.com",
      role: "Student",
      status: "Suspended",
      joinDate: "2024-02-05",
    },
  ];

  // Define table columns
  const columns: Column<User>[] = [
    {
      id: "name",
      label: "User",
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#9333ea",
              width: 40,
              height: 40,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Typography sx={{ fontWeight: 500, color: "#111827" }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "email",
      label: "Email",
      minWidth: 200,
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
            bgcolor: value === "Student" ? "#dbeafe" : "#d1fae5",
            color: value === "Student" ? "#1e40af" : "#065f46",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "Active"
                ? "#d1fae5"
                : value === "Pending"
                ? "#fed7aa"
                : "#fee2e2",
            color:
              value === "Active"
                ? "#065f46"
                : value === "Pending"
                ? "#9a3412"
                : "#991b1b",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "joinDate",
      label: "Join Date",
      minWidth: 120,
    },
  ];

  // Define table actions
  const actions: TableAction<User>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View user:", row);
        alert(`Viewing ${row.name}`);
      },
      color: "primary",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Edit user:", row);
        alert(`Editing ${row.name}`);
      },
      color: "primary",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Delete user:", row);
        if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
          alert(`Deleted ${row.name}`);
        }
      },
      color: "error",
    },
  ];

  // Handle row click
  const handleRowClick = (user: User) => {
    console.log("Row clicked:", user);
  };

  // Handle selection change
  const handleSelectionChange = (selected: User[]) => {
    console.log("Selected users:", selected);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <UsersIcon className="h-10 w-10 text-purple-600" />
            All Users (With Custom Table)
          </h1>
          <p className="text-gray-500 mt-2">
            Manage all registered users in the platform
          </p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md hover:shadow-lg">
          + Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">12,450</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Active Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">10,234</p>
          <p className="text-sm text-green-600 mt-2">↑ 8% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
          <p className="text-sm text-orange-600 mt-2">Requires attention</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Suspended</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">60</p>
          <p className="text-sm text-red-600 mt-2">↓ 5% from last month</p>
        </div>
      </div>

      {/* Custom Table */}
      <CustomTable
        columns={columns}
        data={users}
        actions={actions}
        onRowClick={handleRowClick}
        selectable={true}
        searchable={true}
        searchPlaceholder="Search users by name, email..."
        onSelectionChange={handleSelectionChange}
        loading={false}
        emptyMessage="No users found"
        rowsPerPageOptions={[5, 10, 25, 50]}
        defaultRowsPerPage={10}
        stickyHeader={true}
        maxHeight={600}
        dense={false}
        hover={true}
      />
    </div>
  );
};

export default AllUsersWithTable;

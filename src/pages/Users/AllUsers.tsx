import React, { useState, useMemo } from "react";
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
import { useGetAllStudentsQuery, useGetAllEmployersQuery } from "../../services/api/usersApi";
import type { UserProfile } from "../../services/api/profileApi";

interface User {
  index: number;
  id: number;
  name: string;
  email: string;
  role: "Student" | "Employer";
  status: "Active" | "Pending" | "Suspended";
  joinDate: string;
}

const AllUsers: React.FC = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // Fetch students and employers separately - these endpoints include role information
  const { 
    data: studentsData, 
    isLoading: isLoadingStudents, 
    isError: isErrorStudents 
  } = useGetAllStudentsQuery({
    page: 1, // Fetch all pages - we'll do client-side pagination
    limit: 1000, // Fetch a large number to get all users
  });

  const { 
    data: employersData, 
    isLoading: isLoadingEmployers, 
    isError: isErrorEmployers 
  } = useGetAllEmployersQuery({
    page: 1,
    limit: 1000, // Fetch a large number to get all users
  });

  const isLoading = isLoadingStudents || isLoadingEmployers;
  const isError = isErrorStudents || isErrorEmployers;

  // Combine students and employers into a single array
  // Role differentiation:
  // - "student" - Regular student users (from getAllStudents)
  // - "employer" - Employer/business users (from getAllEmployers)
  const allUsers: UserProfile[] = useMemo(() => {
    const students = (studentsData?.data || []).map((user) => ({
      ...user,
      role: { roleName: "student", id: user.role?.id || "" },
    }));
    const employers = (employersData?.data || []).map((user) => ({
      ...user,
      role: { roleName: "employer", id: user.role?.id || "" },
    }));
    
    // Combine and sort by created_at descending (most recent first)
    return [...students, ...employers].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [studentsData?.data, employersData?.data]);

  // Apply client-side pagination to the combined results
  const paginatedUsers = useMemo(() => {
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    return allUsers.slice(startIndex, endIndex);
  }, [allUsers, page, limit]);

  const mapUser = (user: UserProfile, index: number): User => {
    const roleName = user.role?.roleName?.toLowerCase() || "";
    const startIndex = page * limit;
    return {
      index: startIndex + index + 1,
      id: Number(user.user_id),
      name: user.full_name,
      email: user.email,
      role:
        roleName === "student"
          ? "Student"
          : roleName === "employer"
          ? "Employer"
          : "Student",
      status: "Active",
      joinDate: user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "-",
    };
  };

  const users: User[] = paginatedUsers.map((user, index) =>
    mapUser(user, index)
  );
  
  // Calculate counts
  const totalCount = allUsers.length;
  const studentCount = (studentsData?.data || []).length;
  const employerCount = (employersData?.data || []).length;

  const columns: Column<User>[] = [
    {
      id: "index",
      label: "#",
      minWidth: 60,
      align: "center",
      sortable: false,
      format: (value) => (
        <Typography sx={{ fontWeight: 500, color: "#6b7280" }}>
          {value}
        </Typography>
      ),
    },
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

  const actions: TableAction<User>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View user:", row);
      },
      color: "primary",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Edit user:", row);
      },
      color: "primary",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => {
        if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
          console.log("Delete user:", row);
        }
      },
      color: "error",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <UsersIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
            All Users
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            View and manage all students and employers in the platform
          </p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2.5 rounded-lg font-semibold transition shadow-md hover:shadow-lg whitespace-nowrap self-start md:self-auto">
          + Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : totalCount}
          </p>
          <p className="text-sm text-green-600 mt-2">
            Students & Employers only
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : studentCount}
          </p>
          <p className="text-sm text-blue-600 mt-2">Student accounts</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Employers</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : employerCount}
          </p>
          <p className="text-sm text-purple-600 mt-2">Employer accounts</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">On This Page</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : users.length}
          </p>
          <p className="text-sm text-gray-600 mt-2">Currently displayed</p>
        </div>
      </div>

      {/* Custom Table */}
      <CustomTable
        columns={columns}
        data={users}
        actions={actions}
        loading={isLoading}
        emptyMessage={
          isError ? "Failed to load users. Please try again." : "No users found"
        }
        selectable={true}
        searchable={true}
        searchPlaceholder="Search users by name, email..."
        rowsPerPageOptions={[5, 10, 25, 50]}
        defaultRowsPerPage={limit}
        serverSidePagination={false}
        totalCount={totalCount}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(0);
        }}
      />
    </div>
  );
};

export default AllUsers;

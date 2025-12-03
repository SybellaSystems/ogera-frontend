import React, { useState } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Avatar, Box, Typography } from "@mui/material";
import { Visibility as ViewIcon, Edit as EditIcon } from "@mui/icons-material";
import { useGetAllStudentsQuery } from "../../services/api/usersApi";
import type { UserProfile } from "../../services/api/profileApi";

interface Student {
  index: number;
  id: number;
  name: string;
  email: string;
  university: string;
  gpa: string;
  status: "Active" | "Pending";
  verified: boolean;
}

const Students: React.FC = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError } = useGetAllStudentsQuery({
    page: page + 1,
    limit,
  });

  // Map API user profile to Student row
  const mapStudent = (user: UserProfile, index: number): Student => ({
    index: page * limit + index + 1,
    id: Number(user.user_id),
    name: user.full_name,
    email: user.email,
    university: "-", // adjust when backend adds field
    gpa: "-",
    status: "Active",
    verified: true,
  });

  const students: Student[] = (data?.data || []).map((user, index) =>
    mapStudent(user, index)
  );
  const totalCount = data?.pagination?.total || students.length;

  const columns: Column<Student>[] = [
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
      label: "Student",
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#3b82f6",
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
      id: "university",
      label: "University",
      minWidth: 150,
    },
    {
      id: "gpa",
      label: "GPA",
      minWidth: 100,
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
      id: "verified",
      label: "Verified",
      minWidth: 120,
      format: (value) =>
        value ? (
          <Chip
            label="✓ Verified"
            size="small"
            sx={{
              bgcolor: "#d1fae5",
              color: "#065f46",
              fontWeight: 600,
            }}
          />
        ) : (
          <Chip
            label="Pending"
            size="small"
            sx={{
              bgcolor: "#fed7aa",
              color: "#9a3412",
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
            bgcolor: value === "Active" ? "#d1fae5" : "#fed7aa",
            color: value === "Active" ? "#065f46" : "#9a3412",
            fontWeight: 600,
          }}
        />
      ),
    },
  ];

  const actions: TableAction<Student>[] = [
    {
      label: "View Profile",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View student:", row);
      },
      color: "primary",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Edit student:", row);
      },
      color: "primary",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <AcademicCapIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            Students
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Manage all student accounts and their academic information
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Students</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {isLoading ? "…" : totalCount}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200">
          <p className="text-sm text-green-700 font-medium">
            Verified Students
          </p>
          <p className="text-3xl font-bold text-green-900 mt-2">7,845</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-md border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">
            Pending Verification
          </p>
          <p className="text-3xl font-bold text-orange-900 mt-2">275</p>
        </div>
      </div>

      {/* Students Table */}
      <CustomTable
        columns={columns}
        data={students}
        actions={actions}
        loading={isLoading}
        emptyMessage={
          isError
            ? "Failed to load students. Please try again."
            : "No students found"
        }
        searchable={true}
        searchPlaceholder="Search students..."
        rowsPerPageOptions={[5, 10, 25, 50]}
        defaultRowsPerPage={limit}
        serverSidePagination={true}
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

export default Students;

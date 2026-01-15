import React, { useState } from "react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Avatar, Box, Typography } from "@mui/material";
import { Visibility as ViewIcon, Edit as EditIcon } from "@mui/icons-material";
import { useGetAllEmployersQuery } from "../../services/api/usersApi";
import type { UserProfile } from "../../services/api/profileApi";

interface Employer {
  index: number;
  id: number;
  name: string;
  contact: string;
  jobsPosted: number;
  activeJobs: number;
  verified: boolean;
}

const Employers: React.FC = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError } = useGetAllEmployersQuery({
    page: page + 1,
    limit,
  });

  const mapEmployer = (user: UserProfile, index: number): Employer => ({
    index: page * limit + index + 1,
    id: Number(user.user_id),
    name: user.full_name,
    contact: user.email,
    jobsPosted: 0,
    activeJobs: 0,
    verified: true,
  });

  const employers: Employer[] = (data?.data || []).map((user, index) =>
    mapEmployer(user, index)
  );
  const totalCount = data?.pagination?.total || employers.length;

  const columns: Column<Employer>[] = [
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
      label: "Company",
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#10b981",
              width: 40,
              height: 40,
              fontSize: "1.2rem",
              fontWeight: 700,
              borderRadius: "8px",
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Typography sx={{ fontWeight: 600, color: "#111827" }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "contact",
      label: "Contact",
      minWidth: 200,
    },
    {
      id: "jobsPosted",
      label: "Jobs Posted",
      minWidth: 120,
      align: "center",
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
      id: "activeJobs",
      label: "Active Jobs",
      minWidth: 120,
      align: "center",
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
  ];

  const actions: TableAction<Employer>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View employer:", row);
      },
      color: "success",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Edit employer:", row);
      },
      color: "primary",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <BriefcaseIcon className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
            Employers
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Manage employer accounts and their job postings
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200">
          <p className="text-sm text-green-700 font-medium">Total Employers</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {isLoading ? "…" : totalCount}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">
            Active Jobs Posted
          </p>
          <p className="text-3xl font-bold text-blue-900 mt-2">1,480</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-md border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">
            Verified Employers
          </p>
          <p className="text-3xl font-bold text-purple-900 mt-2">1,120</p>
        </div>
      </div>

      {/* Employers Table */}
      <CustomTable
        columns={columns}
        data={employers}
        actions={actions}
        loading={isLoading}
        emptyMessage={
          isError
            ? "Failed to load employers. Please try again."
            : totalCount === 0
            ? "No employers present"
            : "No employers found"
        }
        searchable={true}
        searchPlaceholder="Search employers..."
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

export default Employers;

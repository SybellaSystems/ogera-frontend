import React, { useState } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
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
import { useGetAllAdminsQuery, useDeleteAdminMutation } from "../../services/api/adminApi";
import type { AdminProfile } from "../../services/api/adminApi";
import toast from "react-hot-toast";

interface Admin {
  index: number;
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Subadmin";
  joinDate: string;
  mobile_number?: string;
}

const ViewAdmins: React.FC = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, refetch } = useGetAllAdminsQuery({
    page: page + 1, // API uses 1-based page, table uses 0-based
    limit,
  });

  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteAdmin(id).unwrap();
        toast.success("Admin deleted successfully");
        refetch();
      } catch (error: any) {
        toast.error(
          error?.data?.message || "Failed to delete admin. Please try again."
        );
      }
    }
  };

  const mapAdmin = (admin: AdminProfile, index: number): Admin => ({
    index: page * limit + index + 1, // Calculate index based on current page
    id: admin.user_id,
    name: admin.full_name,
    email: admin.email,
    role:
      admin.role?.roleName === "admin" ? "Admin" : "Subadmin",
    joinDate: admin.created_at
      ? new Date(admin.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "-",
    mobile_number: admin.mobile_number,
  });

  const admins: Admin[] = (data?.data || []).map((admin, index) =>
    mapAdmin(admin, index)
  );
  const totalCount = data?.pagination?.total || admins.length;

  const columns: Column<Admin>[] = [
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
      label: "Admin",
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
            bgcolor: value === "Admin" ? "#dbeafe" : "#fef3c7",
            color: value === "Admin" ? "#1e40af" : "#92400e",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "mobile_number",
      label: "Mobile",
      minWidth: 120,
      format: (value) => (
        <Typography sx={{ color: "#6b7280" }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "joinDate",
      label: "Created Date",
      minWidth: 120,
    },
  ];

  const actions: TableAction<Admin>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        // Navigate to detail page or show modal
        console.log("View admin:", row);
        toast.info("View functionality coming soon");
      },
      color: "primary",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        // Navigate to edit page or show modal
        console.log("Edit admin:", row);
        toast.info("Edit functionality coming soon");
      },
      color: "primary",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => handleDelete(row.id, row.name),
      color: "error",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <UserGroupIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
            Admins & Subadmins
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Manage all admin and subadmin accounts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Admins</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : totalCount}
          </p>
          <p className="text-sm text-green-600 mt-2">Live data</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Admins</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading
              ? "…"
              : admins.filter((a) => a.role === "Admin").length}
          </p>
          <p className="text-sm text-blue-600 mt-2">Full admin access</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Subadmins</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading
              ? "…"
              : admins.filter((a) => a.role === "Subadmin").length}
          </p>
          <p className="text-sm text-amber-600 mt-2">Limited admin access</p>
        </div>
      </div>

      {/* Custom Table */}
      <CustomTable
        columns={columns}
        data={admins}
        actions={actions}
        loading={isLoading || isDeleting}
        emptyMessage={
          isError
            ? "Failed to load admins. Please try again."
            : "No admins found"
        }
        selectable={true}
        searchable={true}
        searchPlaceholder="Search admins by name, email..."
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

export default ViewAdmins;



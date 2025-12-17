import React, { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Box, Typography } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  useGetAllRolesQuery,
  useDeleteRoleMutation,
  type Role,
} from "../../services/api/adminApi";
import toast from "react-hot-toast";

interface RoleRow {
  index: number;
  id: string;
  roleName: string;
  roleType: string;
  createdDate: string;
}

const ViewRoles: React.FC = () => {
  const { data: rolesData, isLoading, isError, refetch } = useGetAllRolesQuery();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const handleDelete = async (id: string, roleName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete role "${roleName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteRole(id).unwrap();
        toast.success("Role deleted successfully");
        refetch();
      } catch (error: any) {
        toast.error(
          error?.data?.error || error?.data?.message || "Failed to delete role. Please try again."
        );
      }
    }
  };

  const mapRole = (role: Role, index: number): RoleRow => ({
    index: index + 1,
    id: role.id,
    roleName: role.roleName,
    roleType: role.roleType,
    createdDate: role.created_at
      ? new Date(role.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "-",
  });

  const roles: RoleRow[] = (rolesData || []).map((role, index) =>
    mapRole(role, index)
  );

  const getRoleTypeColor = (roleType: string) => {
    switch (roleType?.toLowerCase()) {
      case "admin":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "superadmin":
        return { bg: "#fce7f3", color: "#9f1239" };
      case "student":
        return { bg: "#dcfce7", color: "#166534" };
      case "employer":
        return { bg: "#fef3c7", color: "#92400e" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const columns: Column<RoleRow>[] = [
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
      id: "roleName",
      label: "Role Name",
      minWidth: 200,
      format: (value) => (
        <Typography sx={{ fontWeight: 600, color: "#111827" }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "roleType",
      label: "Role Type",
      minWidth: 150,
      format: (value) => {
        const colors = getRoleTypeColor(value as string);
        return (
          <Chip
            label={value}
            size="small"
            sx={{
              bgcolor: colors.bg,
              color: colors.color,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          />
        );
      },
    },
    {
      id: "createdDate",
      label: "Created Date",
      minWidth: 120,
    },
  ];

  const actions: TableAction<RoleRow>[] = [
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        // Navigate to edit page or show modal
        console.log("Edit role:", row);
        toast.info("Edit functionality coming soon");
      },
      color: "primary",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => handleDelete(row.id, row.roleName),
      color: "error",
    },
  ];

  // Group roles by type for stats
  const rolesByType = roles.reduce((acc, role) => {
    acc[role.roleType] = (acc[role.roleType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <ShieldCheckIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
            Roles Management
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Manage all system roles and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Roles</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : roles.length}
          </p>
          <p className="text-sm text-green-600 mt-2">Live data</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Admin Roles</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : rolesByType["admin"] || 0}
          </p>
          <p className="text-sm text-blue-600 mt-2">Admin access</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Student Roles</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : rolesByType["student"] || 0}
          </p>
          <p className="text-sm text-green-600 mt-2">Student access</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Employer Roles</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : rolesByType["employer"] || 0}
          </p>
          <p className="text-sm text-amber-600 mt-2">Employer access</p>
        </div>
      </div>

      {/* Custom Table */}
      <CustomTable
        columns={columns}
        data={roles}
        actions={actions}
        loading={isLoading || isDeleting}
        emptyMessage={
          isError
            ? "Failed to load roles. Please try again."
            : "No roles found"
        }
        selectable={true}
        searchable={true}
        searchPlaceholder="Search roles by name or type..."
        rowsPerPageOptions={[5, 10, 25, 50]}
        defaultRowsPerPage={10}
        serverSidePagination={false}
      />
    </div>
  );
};

export default ViewRoles;




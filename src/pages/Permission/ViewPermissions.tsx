import React from "react";
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
  useGetAllPermissionsQuery,
  useDeletePermissionMutation,
  type Permission,
} from "../../services/api/adminApi";
import toast from "react-hot-toast";

interface PermissionRow {
  index: number;
  id: string;
  api_name: string;
  route: string;
  permissions: string;
  createdDate: string;
}

const ViewPermissions: React.FC = () => {
  const { data: permissionsData, isLoading, isError, refetch } = useGetAllPermissionsQuery();
  const [deletePermission, { isLoading: isDeleting }] = useDeletePermissionMutation();

  const handleDelete = async (id: string, apiName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete permission "${apiName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deletePermission(id).unwrap();
        toast.success("Permission deleted successfully");
        refetch();
      } catch (error: any) {
        toast.error(
          error?.data?.error || error?.data?.message || "Failed to delete permission. Please try again."
        );
      }
    }
  };

  const formatPermissions = (permission: Permission["permission"]) => {
    const perms: string[] = [];
    if (permission.view) perms.push("View");
    if (permission.create) perms.push("Create");
    if (permission.edit) perms.push("Update");
    if (permission.delete) perms.push("Delete");
    return perms.length > 0 ? perms.join(", ") : "None";
  };

  const mapPermission = (permission: Permission, index: number): PermissionRow => ({
    index: index + 1,
    id: permission.id,
    api_name: permission.api_name,
    route: permission.route,
    permissions: formatPermissions(permission.permission),
    createdDate: permission.created_at
      ? new Date(permission.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "-",
  });

  const permissions: PermissionRow[] = (permissionsData?.data || []).map((permission, index) =>
    mapPermission(permission, index)
  );

  const columns: Column<PermissionRow>[] = [
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
      id: "api_name",
      label: "API Name",
      minWidth: 200,
      format: (value) => (
        <Typography sx={{ fontWeight: 600, color: "#111827" }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "route",
      label: "Route",
      minWidth: 250,
      format: (value) => (
        <Typography sx={{ color: "#6b7280", fontFamily: "monospace" }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "permissions",
      label: "Permissions",
      minWidth: 200,
      format: (value) => {
        const permString = value as string;
        const permCount = permString.split(", ").length;
        return (
          <Chip
            label={permString || "None"}
            size="small"
            sx={{
              bgcolor: permCount > 0 ? "#dbeafe" : "#f3f4f6",
              color: permCount > 0 ? "#1e40af" : "#6b7280",
              fontWeight: 500,
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

  const actions: TableAction<PermissionRow>[] = [
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Edit permission:", row);
        toast.info("Edit functionality coming soon");
      },
      color: "primary",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => handleDelete(row.id, row.api_name),
      color: "error",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <ShieldCheckIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
            Permissions Management
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Manage all API permissions and routes
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Permissions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : permissions.length}
          </p>
          <p className="text-sm text-green-600 mt-2">Live data</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Active Routes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : new Set(permissions.map(p => p.route)).size}
          </p>
          <p className="text-sm text-blue-600 mt-2">Unique routes</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">API Names</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : new Set(permissions.map(p => p.api_name)).size}
          </p>
          <p className="text-sm text-purple-600 mt-2">Unique APIs</p>
        </div>
      </div>

      {/* Custom Table */}
      <CustomTable
        columns={columns}
        data={permissions}
        actions={actions}
        loading={isLoading || isDeleting}
        emptyMessage={
          isError
            ? "Failed to load permissions. Please try again."
            : "No permissions found"
        }
        selectable={true}
        searchable={true}
        searchPlaceholder="Search permissions by API name or route..."
        rowsPerPageOptions={[5, 10, 25, 50]}
        defaultRowsPerPage={10}
        serverSidePagination={false}
      />
    </div>
  );
};

export default ViewPermissions;



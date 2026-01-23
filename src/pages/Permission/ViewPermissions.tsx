import React, { useState, useEffect } from "react";
import { ShieldCheckIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
  useGetPermissionByIdQuery,
  useUpdatePermissionMutation,
  useGetAllRoutesQuery,
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
  const { data: routesData } = useGetAllRoutesQuery();
  const [deletePermission, { isLoading: isDeleting }] = useDeletePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<PermissionRow | null>(null);
  const [editForm, setEditForm] = useState<{
    api_name: string;
    route: string;
    permission: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  }>({
    api_name: "",
    route: "",
    permission: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
  });

  const selectedPermissionId = selectedPermission?.id || "";
  const { data: permissionDetails, refetch: refetchPermissionDetails } = useGetPermissionByIdQuery(selectedPermissionId, {
    skip: !selectedPermissionId || !showEditModal,
  });

  useEffect(() => {
    if (permissionDetails?.data && showEditModal) {
      setEditForm({
        api_name: permissionDetails.data.api_name || "",
        route: permissionDetails.data.route || "",
        permission: {
          view: permissionDetails.data.permission?.view || false,
          create: permissionDetails.data.permission?.create || false,
          edit: permissionDetails.data.permission?.edit || false,
          delete: permissionDetails.data.permission?.delete || false,
        },
      });
    }
  }, [permissionDetails, showEditModal]);

  const handleEditClick = (row: PermissionRow) => {
    setSelectedPermission(row);
    setShowEditModal(true);
    refetchPermissionDetails();
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedPermission(null);
    setEditForm({
      api_name: "",
      route: "",
      permission: {
        view: false,
        create: false,
        edit: false,
        delete: false,
      },
    });
  };

  const handleEditSave = async () => {
    if (!selectedPermission) return;

    try {
      await updatePermission({
        id: selectedPermission.id,
        data: editForm,
      }).unwrap();
      toast.success("Permission updated successfully");
      handleEditClose();
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.error || error?.data?.message || "Failed to update permission. Please try again."
      );
    }
  };

  const handleDeleteClick = (id: string, apiName: string) => {
    setPermissionToDelete({ id, name: apiName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!permissionToDelete) return;

    try {
      await deletePermission(permissionToDelete.id).unwrap();
      toast.success("Permission deleted successfully");
      setShowDeleteModal(false);
      setPermissionToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.error || error?.data?.message || "Failed to delete permission. Please try again."
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPermissionToDelete(null);
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
      onClick: (row) => handleEditClick(row),
      color: "primary",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => handleDeleteClick(row.id, row.api_name),
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

      {/* Edit Permission Modal */}
      {showEditModal && selectedPermission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border-2 border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Permission</h2>
              <button
                onClick={handleEditClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleEditSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.api_name}
                  onChange={(e) => setEditForm({ ...editForm, api_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Jobs Management"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route *
                </label>
                <select
                  required
                  value={editForm.route}
                  onChange={(e) => setEditForm({ ...editForm, route: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a route</option>
                  {routesData?.data?.map((route: string) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.permission.view}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        permission: { ...editForm.permission, view: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">View</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.permission.create}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        permission: { ...editForm.permission, create: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Create</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.permission.edit}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        permission: { ...editForm.permission, edit: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Edit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.permission.delete}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        permission: { ...editForm.permission, delete: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Delete</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleEditClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update Permission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && permissionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-2 border-red-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Permission?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{permissionToDelete.name}"</span>? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-5 w-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPermissions;



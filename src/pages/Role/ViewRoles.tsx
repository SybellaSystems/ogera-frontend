import React, { useState, useEffect } from "react";
import { ShieldCheckIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  useGetAllRolesQuery,
  useDeleteRoleMutation,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
  useGetAllPermissionsQuery,
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
  const { data: permissionsData } = useGetAllPermissionsQuery();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);
  const [editForm, setEditForm] = useState<{
    roleName: string;
    permission_json: Array<{
      route: string;
      permission: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
    }>;
  }>({
    roleName: "",
    permission_json: [],
  });

  const selectedRoleId = selectedRole?.id || "";
  const { data: roleDetails, refetch: refetchRoleDetails } = useGetRoleByIdQuery(selectedRoleId, {
    skip: !selectedRoleId || !showEditModal,
  });

  useEffect(() => {
    if (roleDetails && showEditModal) {
      const role = Array.isArray(roleDetails) ? roleDetails[0] : roleDetails;
      let permissionJson = [];
      
      if (role?.permission_json) {
        if (typeof role.permission_json === 'string') {
          try {
            permissionJson = JSON.parse(role.permission_json);
          } catch {
            permissionJson = [];
          }
        } else if (Array.isArray(role.permission_json)) {
          permissionJson = role.permission_json;
        }
      }

      setEditForm({
        roleName: role?.roleName || "",
        permission_json: permissionJson,
      });
    }
  }, [roleDetails, showEditModal]);

  const handleEditClick = (row: RoleRow) => {
    setSelectedRole(row);
    setShowEditModal(true);
    refetchRoleDetails();
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedRole(null);
    setEditForm({
      roleName: "",
      permission_json: [],
    });
  };

  const handleEditSave = async () => {
    if (!selectedRole) return;

    try {
      await updateRole({
        id: selectedRole.id,
        data: {
          roleName: editForm.roleName,
          permission_json: editForm.permission_json,
        },
      }).unwrap();
      toast.success("Role updated successfully");
      handleEditClose();
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.error || error?.data?.message || "Failed to update role. Please try again."
      );
    }
  };

  const handleDeleteClick = (id: string, roleName: string) => {
    setRoleToDelete({ id, name: roleName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.id).unwrap();
      toast.success("Role deleted successfully");
      setShowDeleteModal(false);
      setRoleToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.error || error?.data?.message || "Failed to delete role. Please try again."
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  const togglePermissionRoute = (route: string) => {
    setEditForm(prev => {
      const existingIndex = prev.permission_json.findIndex(p => p.route === route);
      if (existingIndex >= 0) {
        // Remove if exists
        return {
          ...prev,
          permission_json: prev.permission_json.filter(p => p.route !== route)
        };
      } else {
        // Add if doesn't exist
        return {
          ...prev,
          permission_json: [
            ...prev.permission_json,
            {
              route,
              permission: {
                view: false,
                create: false,
                edit: false,
                delete: false,
              }
            }
          ]
        };
      }
    });
  };

  const updatePermissionFlags = (route: string, flag: 'view' | 'create' | 'edit' | 'delete', value: boolean) => {
    setEditForm(prev => ({
      ...prev,
      permission_json: prev.permission_json.map(p => 
        p.route === route 
          ? { ...p, permission: { ...p.permission, [flag]: value } }
          : p
      )
    }));
  };

  const hasRoute = (route: string) => {
    return editForm.permission_json.some(p => p.route === route);
  };

  const getPermissionForRoute = (route: string) => {
    const perm = editForm.permission_json.find(p => p.route === route);
    return perm?.permission || { view: false, create: false, edit: false, delete: false };
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
      onClick: (row) => handleEditClick(row),
      color: "primary",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => handleDeleteClick(row.id, row.roleName),
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

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border-2 border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Role</h2>
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
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.roleName}
                  onChange={(e) => setEditForm({ ...editForm, roleName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Job Admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {permissionsData?.data && permissionsData.data.length > 0 ? (
                    <div className="space-y-4">
                      {permissionsData.data.map((permission: any) => {
                        const isRouteSelected = hasRoute(permission.route);
                        const routePerms = getPermissionForRoute(permission.route);
                        return (
                          <div key={permission.id} className="border border-gray-200 rounded-lg p-3">
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={isRouteSelected}
                                onChange={() => togglePermissionRoute(permission.route)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{permission.api_name}</span>
                                <span className="text-xs text-gray-500 ml-2">({permission.route})</span>
                              </div>
                            </label>
                            {isRouteSelected && (
                              <div className="ml-6 grid grid-cols-2 gap-2 mt-2">
                                {(['view', 'create', 'edit', 'delete'] as const).map((flag) => (
                                  <label key={flag} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={routePerms[flag]}
                                      onChange={(e) => updatePermissionFlags(permission.route, flag, e.target.checked)}
                                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-xs text-gray-700 capitalize">{flag}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No permissions available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select routes and configure permissions for this role</p>
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
                  {isUpdating ? "Updating..." : "Update Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roleToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-2 border-red-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Role?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{roleToDelete.name}"</span>? 
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

export default ViewRoles;






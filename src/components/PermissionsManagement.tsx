import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetAllPermissionsQuery,
  useUpdatePermissionMutation,
  type Permission,
} from "../services/api/permissionsApi";
import toast from "react-hot-toast";
import {
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface PermissionsByCategory {
  [category: string]: Permission[];
}

const PermissionsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch all permissions
  const { data: permissionsResponse, isLoading, error } = useGetAllPermissionsQuery();
  const [updatePermission] = useUpdatePermissionMutation();

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    if (!permissionsResponse?.data) return {};

    const grouped: PermissionsByCategory = {};
    permissionsResponse.data.forEach((permission) => {
      const category = permission.category || permission.api_name.split(".")[0] || "General";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });

    // Sort categories
    return Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as PermissionsByCategory);
  }, [permissionsResponse]);

  const handlePermissionToggle = async (
    permissionId: string,
    field: "view" | "create" | "edit" | "delete",
    currentValue: boolean
  ) => {
    try {
      setUpdatingId(permissionId);

      const permission = permissionsResponse?.data.find((p) => p.id === permissionId);
      if (!permission) return;

      const updatedPermission = {
        ...permission,
        permission: {
          ...permission.permission,
          [field]: !currentValue,
        },
      };

      await updatePermission({
        id: permissionId,
        data: updatedPermission,
      }).unwrap();

      toast.success(t("permissions.updatedSuccess", { defaultValue: "Permission updated successfully" }));
    } catch (err: any) {
      console.error("Error updating permission:", err);
      toast.error(err?.data?.message || t("permissions.updateError", { defaultValue: "Failed to update permission" }));
    } finally {
      setUpdatingId(null);
    }
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
          <h2 className="text-2xl font-bold">
            {t("profile.dashboardPermissionsManagement", { defaultValue: "Permissions Management" })}
          </h2>
          <p className="text-white/80 mt-2">
            {t("profile.permissionsManagementDesc", { defaultValue: "Manage system permissions and user access levels" })}
          </p>
        </div>
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
          <h2 className="text-2xl font-bold">
            {t("profile.dashboardPermissionsManagement", { defaultValue: "Permissions Management" })}
          </h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-red-500">
            {t("permissions.loadError", { defaultValue: "Failed to load permissions" })}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!permissionsResponse?.data || permissionsResponse.data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
          <h2 className="text-2xl font-bold">
            {t("profile.dashboardPermissionsManagement", { defaultValue: "Permissions Management" })}
          </h2>
          <p className="text-white/80 mt-2">
            {t("profile.permissionsManagementDesc", { defaultValue: "Manage system permissions and user access levels" })}
          </p>
        </div>
        <div className="p-8 text-center">
          <XMarkIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            {t("permissions.noneAssigned", { defaultValue: "No permissions assigned" })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
        <h2 className="text-2xl font-bold">
          {t("profile.dashboardPermissionsManagement", { defaultValue: "Permissions Management" })}
        </h2>
        <p className="text-white/80 mt-2">
          {t("profile.permissionsManagementDesc", { defaultValue: "Manage system permissions and user access levels" })}
        </p>
      </div>

      <div className="p-8 space-y-4">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() =>
                setExpandedCategory(expandedCategory === category ? null : category)
              }
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-25 hover:from-purple-100 hover:to-purple-50 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {category}
                </h3>
                <span className="ml-auto text-sm text-gray-600">
                  {permissions.length} {permissions.length === 1 ? "permission" : "permissions"}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  expandedCategory === category ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Permissions List */}
            {expandedCategory === category && (
              <div className="divide-y divide-gray-200">
                {permissions.map((permission) => (
                  <div key={permission.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {permission.api_name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{permission.route}</p>
                      </div>
                    </div>

                    {/* Permission Toggles */}
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {(["view", "create", "edit", "delete"] as const).map(
                        (field) => (
                          <button
                            key={field}
                            onClick={() =>
                              handlePermissionToggle(
                                permission.id,
                                field,
                                permission.permission[field]
                              )
                            }
                            disabled={updatingId === permission.id}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all border-2 ${
                              permission.permission[field]
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-gray-50 border-gray-300 text-gray-600"
                            } hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center justify-center w-6 h-6">
                              {permission.permission[field] ? (
                                <CheckIcon className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XMarkIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span className="text-xs font-medium capitalize">
                              {t(`permissions.${field}`, { defaultValue: field })}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default PermissionsManagement;

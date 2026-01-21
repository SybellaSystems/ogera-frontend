import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import {
  useCreateRoleMutation,
  useGetAllPermissionsQuery,
  type Permission,
} from "../../services/api/adminApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import Button from "../../components/button";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import * as Yup from "yup";

interface CreateRoleFormValues {
  roleName: string;
  roleType: "student" | "employer" | "admin";
  permission_json: Array<{
    route: string;
    permission: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  }>;
}

const validationSchema = Yup.object({
  roleName: Yup.string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must not exceed 50 characters")
    .required("Role name is required")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Role name can only contain letters, numbers, and underscores"
    ),
  roleType: Yup.string()
    .oneOf(["student", "employer", "admin"], "Invalid role type")
    .required("Role type is required"),
  permission_json: Yup.array()
    .of(
      Yup.object({
        route: Yup.string().required("Route is required"),
        permission: Yup.object({
          view: Yup.boolean().required(),
          create: Yup.boolean().required(),
          edit: Yup.boolean().required(),
          delete: Yup.boolean().required(),
        }).required(),
      })
    )
    .optional(),
});

const CreateRole: React.FC = () => {
  const navigate = useNavigate();

  const [createRole, { isLoading, isError, error, isSuccess, data }] =
    useCreateRoleMutation();

  const { data: permissionsData, isLoading: isLoadingPermissions } =
    useGetAllPermissionsQuery();

  const availablePermissions = permissionsData?.data || [];

  const [selectedApiNames, setSelectedApiNames] = useState<string[]>([]);

  // When an API name is selected, add it to permission_json
  const handleApiNameSelect = (apiName: string) => {
    if (selectedApiNames.includes(apiName)) {
      // Remove if already selected
      setSelectedApiNames(selectedApiNames.filter((name) => name !== apiName));
      const newPermissions = formik.values.permission_json.filter(
        (perm) => perm.route !== getRouteForApiName(apiName)
      );
      formik.setFieldValue("permission_json", newPermissions);
    } else {
      // Add if not selected
      const permission = availablePermissions.find(
        (p) => p.api_name === apiName
      );
      if (permission) {
        setSelectedApiNames([...selectedApiNames, apiName]);
        const newPermissions = [
          ...formik.values.permission_json,
          {
            route: permission.route,
            permission: {
              view: false,
              create: false,
              edit: false,
              delete: false,
            },
          },
        ];
        formik.setFieldValue("permission_json", newPermissions);
      }
    }
  };

  const getRouteForApiName = (apiName: string) => {
    const permission = availablePermissions.find((p) => p.api_name === apiName);
    return permission?.route || "";
  };

  const getPermissionForApiName = (apiName: string) => {
    const permission = availablePermissions.find((p) => p.api_name === apiName);
    return permission?.permission || null;
  };

  const removePermission = (apiName: string) => {
    setSelectedApiNames(selectedApiNames.filter((name) => name !== apiName));
    const route = getRouteForApiName(apiName);
    const newPermissions = formik.values.permission_json.filter(
      (perm) => perm.route !== route
    );
    formik.setFieldValue("permission_json", newPermissions);
  };

  const updatePermission = (
    apiName: string,
    permissionType: "view" | "create" | "edit" | "delete",
    value: boolean
  ) => {
    const route = getRouteForApiName(apiName);
    const newPermissions = formik.values.permission_json.map((perm) => {
      if (perm.route === route) {
        return {
          ...perm,
          permission: {
            ...perm.permission,
            [permissionType]: value,
          },
        };
      }
      return perm;
    });
    formik.setFieldValue("permission_json", newPermissions);
  };

  const getPermissionValue = (apiName: string, permissionType: string) => {
    const route = getRouteForApiName(apiName);
    const perm = formik.values.permission_json.find((p) => p.route === route);
    return perm?.permission[permissionType as keyof typeof perm.permission] || false;
  };

  const initialValues: CreateRoleFormValues = {
    roleName: "",
    roleType: "admin",
    permission_json: [],
  };

  const formik = useFormik<CreateRoleFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          roleName: values.roleName.trim(),
          roleType: values.roleType,
          permission_json: values.permission_json || [],
        };
        await createRole(payload).unwrap();
      } catch (err) {
        console.error("Create role error:", err);
      }
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (isError && error) {
      const err = error as FetchBaseQueryError & {
        data?: { error?: string; message?: string };
      };
      toast.error(
        err?.data?.error || err?.data?.message || "Failed to create role"
      );
    }

    if (data && isSuccess) {
      toast.success(data?.message || "Role created successfully!");
      resetForm();
      navigate("/dashboard/role/view");
    }
  }, [isError, error, data, isSuccess, resetForm, navigate]);

  return (
    <Container>
      <FormContainer onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
          </IconWrapper>
          <Title>Create Role</Title>
          <Subtitle>
            Create a new role. Only superadmin can create roles.
          </Subtitle>
        </Header>

        {/* Role Name */}
        <FormGroup>
          <Label htmlFor="roleName">Role Name *</Label>
          <Input
            id="roleName"
            name="roleName"
            placeholder="Enter role name (e.g., xyz, admin, verifyDocAdmin)"
            value={formik.values.roleName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.roleName && formik.errors.roleName && (
            <ErrorText>{formik.errors.roleName}</ErrorText>
          )}
          <HelperText>
            Role name can only contain letters, numbers, and underscores
          </HelperText>
        </FormGroup>

        {/* Role Type */}
        <FormGroup>
          <Label htmlFor="roleType">Role Type *</Label>
          <Select
            id="roleType"
            name="roleType"
            value={formik.values.roleType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="employer">Employer</option>
          </Select>
          {formik.touched.roleType && formik.errors.roleType && (
            <ErrorText>{formik.errors.roleType}</ErrorText>
          )}
        </FormGroup>

        {/* Permissions */}
        <FormGroup>
          <Label>Select API Permissions (Optional)</Label>
          {isLoadingPermissions ? (
            <HelperText>Loading permissions...</HelperText>
          ) : availablePermissions.length === 0 ? (
            <HelperText>
              No permissions available. Please create permissions first in the Permission section.
            </HelperText>
          ) : (
            <>
              <HelperText style={{ marginBottom: "12px" }}>
                Select API names from the list below. For each selected API, you can choose which permissions to grant.
              </HelperText>

              {/* API Name Selection */}
              <ApiNameList>
                {availablePermissions.map((perm) => (
                  <ApiNameItem
                    key={perm.id}
                    selected={selectedApiNames.includes(perm.api_name)}
                    onClick={() => handleApiNameSelect(perm.api_name)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedApiNames.includes(perm.api_name)}
                      onChange={() => handleApiNameSelect(perm.api_name)}
                    />
                    <div>
                      <span className="api-name">{perm.api_name}</span>
                      <span className="api-route">{perm.route}</span>
                    </div>
                  </ApiNameItem>
                ))}
              </ApiNameList>

              {/* Selected Permissions Details */}
              {selectedApiNames.length > 0 && (
                <SelectedPermissionsSection>
                  <Label style={{ marginBottom: "16px" }}>
                    Configure Permissions for Selected APIs
                  </Label>
                  {selectedApiNames.map((apiName) => {
                    const availablePerm = getPermissionForApiName(apiName);
                    return (
                      <PermissionCard key={apiName}>
                        <PermissionHeader>
                          <div>
                            <span style={{ fontWeight: 600, color: "#374151" }}>
                              {apiName}
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginLeft: "8px",
                              }}
                            >
                              ({getRouteForApiName(apiName)})
                            </span>
                          </div>
                          <RemoveButton
                            type="button"
                            onClick={() => removePermission(apiName)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </RemoveButton>
                        </PermissionHeader>

                        <PermissionCheckboxes>
                          <CheckboxGroup>
                            {availablePerm?.view && (
                              <CheckboxLabel>
                                <input
                                  type="checkbox"
                                  checked={getPermissionValue(apiName, "view")}
                                  onChange={(e) =>
                                    updatePermission(apiName, "view", e.target.checked)
                                  }
                                />
                                <span>View</span>
                              </CheckboxLabel>
                            )}
                            {availablePerm?.create && (
                              <CheckboxLabel>
                                <input
                                  type="checkbox"
                                  checked={getPermissionValue(apiName, "create")}
                                  onChange={(e) =>
                                    updatePermission(apiName, "create", e.target.checked)
                                  }
                                />
                                <span>Create</span>
                              </CheckboxLabel>
                            )}
                            {availablePerm?.edit && (
                              <CheckboxLabel>
                                <input
                                  type="checkbox"
                                  checked={getPermissionValue(apiName, "edit")}
                                  onChange={(e) =>
                                    updatePermission(apiName, "edit", e.target.checked)
                                  }
                                />
                                <span>Update</span>
                              </CheckboxLabel>
                            )}
                            {availablePerm?.delete && (
                              <CheckboxLabel>
                                <input
                                  type="checkbox"
                                  checked={getPermissionValue(apiName, "delete")}
                                  onChange={(e) =>
                                    updatePermission(apiName, "delete", e.target.checked)
                                  }
                                />
                                <span>Delete</span>
                              </CheckboxLabel>
                            )}
                          </CheckboxGroup>
                        </PermissionCheckboxes>
                      </PermissionCard>
                    );
                  })}
                </SelectedPermissionsSection>
              )}
            </>
          )}
        </FormGroup>

        <Button
          backgroundcolor="#7f56d9"
          type="submit"
          text={isLoading ? "Creating..." : "Create Role"}
          disabled={isLoading}
        />
      </FormContainer>
    </Container>
  );
};

export default CreateRole;

const Container = styled("div")`
  width: 100%;
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background: #f9fafb;
`;

const FormContainer = styled("form")`
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled("div")`
  text-align: center;
  margin-bottom: 32px;
`;

const IconWrapper = styled("div")`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const Title = styled("h1")`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const Subtitle = styled("p")`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled("label")`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled("input")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #7f56d9;
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const HelperText = styled("div")`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const Select = styled("select")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #7f56d9;
  }

  option {
    padding: 8px;
  }
`;

const ApiNameList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  margin-bottom: 16px;
`;

const ApiNameItem = styled("div")<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.selected ? "#ede9fe" : "white")};
  border: 1px solid ${(props) => (props.selected ? "#7f56d9" : "#e5e7eb")};

  &:hover {
    background: ${(props) => (props.selected ? "#ddd6fe" : "#f3f4f6")};
    border-color: ${(props) => (props.selected ? "#7f56d9" : "#d1d5db")};
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #7f56d9;
  }

  .api-name {
    font-weight: 600;
    color: #111827;
    display: block;
  }

  .api-route {
    font-size: 12px;
    color: #6b7280;
    font-family: monospace;
    display: block;
    margin-top: 4px;
  }
`;

const SelectedPermissionsSection = styled("div")`
  margin-top: 16px;
`;

const PermissionCard = styled("div")`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
`;

const PermissionHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const RemoveButton = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #fecaca;
  }
`;

const PermissionCheckboxes = styled("div")`
  margin-top: 12px;
`;

const CheckboxGroup = styled("div")`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CheckboxLabel = styled("label")`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #7f56d9;
  }

  span {
    user-select: none;
  }
`;

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import {
  useCreatePermissionMutation,
  useGetAllRoutesQuery,
} from "../../services/api/adminApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShieldCheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import Button from "../../components/button";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import * as Yup from "yup";

interface CreatePermissionFormValues {
  api_name: string;
  route: string;
  permission: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

const validationSchema = Yup.object({
  api_name: Yup.string()
    .min(2, "API name must be at least 2 characters")
    .max(100, "API name must not exceed 100 characters")
    .required("API name is required")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "API name can only contain letters, numbers, underscores, and hyphens"
    ),
  route: Yup.string()
    .required("Route is required")
    .matches(/^\//, "Route must start with /"),
  permission: Yup.object({
    view: Yup.boolean().required(),
    create: Yup.boolean().required(),
    edit: Yup.boolean().required(),
    delete: Yup.boolean().required(),
  }).required(),
});

const CreatePermission: React.FC = () => {
  const navigate = useNavigate();

  const [createPermission, { isLoading, isError, error, isSuccess, data }] =
    useCreatePermissionMutation();

  const { data: routesData, isLoading: isLoadingRoutes } = useGetAllRoutesQuery();

  const availableRoutes = routesData?.data || [];

  const initialValues: CreatePermissionFormValues = {
    api_name: "",
    route: "",
    permission: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
  };

  const formik = useFormik<CreatePermissionFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          api_name: values.api_name.trim(),
          route: values.route.trim(),
          permission: values.permission,
        };
        await createPermission(payload).unwrap();
      } catch (err) {
        console.error("Create permission error:", err);
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
        err?.data?.error || err?.data?.message || "Failed to create permission"
      );
    }

    if (data && isSuccess) {
      toast.success(data?.message || "Permission created successfully!");
      resetForm();
      navigate("/dashboard/permission/view");
    }
  }, [isError, error, data, isSuccess, resetForm, navigate]);

  const updatePermission = (
    permissionType: "view" | "create" | "edit" | "delete",
    value: boolean
  ) => {
    formik.setFieldValue(`permission.${permissionType}`, value);
  };

  return (
    <Container>
      <FormContainer onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
          </IconWrapper>
          <Title>Create Permission</Title>
          <Subtitle>
            Create a new permission for an API route. Only superadmin can create permissions.
          </Subtitle>
        </Header>

        {/* API Name */}
        <FormGroup>
          <Label htmlFor="api_name">API Name *</Label>
          <Input
            id="api_name"
            name="api_name"
            placeholder="Enter API name (e.g., job-route, academic-route)"
            value={formik.values.api_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.api_name && formik.errors.api_name && (
            <ErrorText>{formik.errors.api_name}</ErrorText>
          )}
          <HelperText>
            API name can only contain letters, numbers, underscores, and hyphens
          </HelperText>
        </FormGroup>

        {/* Route */}
        <FormGroup>
          <Label htmlFor="route">Route *</Label>
          <Select
            id="route"
            name="route"
            value={formik.values.route}
            onChange={(e) => {
              formik.setFieldValue("route", e.target.value);
            }}
            onBlur={formik.handleBlur}
            disabled={isLoadingRoutes}
          >
            <option value="">Select a route</option>
            {availableRoutes.map((route: string) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </Select>
          {formik.touched.route && formik.errors.route && (
            <ErrorText>{formik.errors.route}</ErrorText>
          )}
          <HelperText>
            Select a route from available routes (excluding auth routes)
          </HelperText>
        </FormGroup>

        {/* Permissions */}
        <FormGroup>
          <Label>Permissions *</Label>
          <PermissionCheckboxes>
            <CheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formik.values.permission.view}
                  onChange={(e) => updatePermission("view", e.target.checked)}
                />
                <span>View</span>
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formik.values.permission.create}
                  onChange={(e) => updatePermission("create", e.target.checked)}
                />
                <span>Create</span>
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formik.values.permission.edit}
                  onChange={(e) => updatePermission("edit", e.target.checked)}
                />
                <span>Update</span>
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formik.values.permission.delete}
                  onChange={(e) => updatePermission("delete", e.target.checked)}
                />
                <span>Delete</span>
              </CheckboxLabel>
            </CheckboxGroup>
          </PermissionCheckboxes>
          <HelperText>
            Select which permissions should be available for this API route
          </HelperText>
        </FormGroup>

        <Button
          backgroundcolor="#7f56d9"
          type="submit"
          text={isLoading ? "Creating..." : "Create Permission"}
          disabled={isLoading}
        />
      </FormContainer>
    </Container>
  );
};

export default CreatePermission;

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

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  option {
    padding: 8px;
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



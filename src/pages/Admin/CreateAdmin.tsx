import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useCreateAdminMutation } from "../../services/api/adminApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "../../components/button";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import * as Yup from "yup";

interface CreateAdminFormValues {
  email: string;
  password: string;
  role: "admin" | "subadmin";
  full_name: string;
  mobile_number: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(["admin", "subadmin"], "Role must be either admin or subadmin")
    .required("Role is required"),
  full_name: Yup.string()
    .min(2, "Full name must be at least 2 characters")
    .required("Full name is required"),
  mobile_number: Yup.string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must not exceed 15 digits")
    .optional(),
});

const CreateAdmin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [createAdmin, { isLoading, isError, error, isSuccess, data }] =
    useCreateAdminMutation();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const initialValues: CreateAdminFormValues = {
    email: "",
    password: "",
    role: "subadmin",
    full_name: "",
    mobile_number: "",
  };

  const formik = useFormik<CreateAdminFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          email: values.email,
          password: values.password,
          role: values.role,
          full_name: values.full_name,
          mobile_number: values.mobile_number || undefined,
        };
        await createAdmin(payload).unwrap();
      } catch (err) {
        console.error("Create admin error:", err);
      }
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (isError && error) {
      const err = error as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(err?.data?.message || "Failed to create admin");
    }

    if (data && isSuccess) {
      toast.success(data?.message || "Admin created successfully!");
      resetForm();
      navigate("/dashboard/admin/view");
    }
  }, [isError, error, data, isSuccess, resetForm, navigate]);

  return (
    <Container>
      <FormContainer onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <UserPlusIcon className="h-8 w-8 text-purple-600" />
          </IconWrapper>
          <Title>Create Admin / Subadmin</Title>
          <Subtitle>
            Create a new admin or subadmin account. Only superadmin can create
            admin accounts.
          </Subtitle>
        </Header>

        {/* Role Selection */}
        <FormGroup>
          <Label>Role *</Label>
          <ToggleGroup>
            {(["admin", "subadmin"] as const).map((type) => (
              <ToggleOption key={type}>
                <input
                  type="radio"
                  name="role"
                  value={type}
                  checked={formik.values.role === type}
                  onChange={formik.handleChange}
                />
                <span>
                  {type === "admin"
                    ? "Admin"
                    : "Subadmin"}
                </span>
              </ToggleOption>
            ))}
          </ToggleGroup>
          {formik.touched.role && formik.errors.role && (
            <ErrorText>{formik.errors.role}</ErrorText>
          )}
        </FormGroup>

        {/* Full Name */}
        <FormGroup>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            name="full_name"
            placeholder="Enter full name"
            value={formik.values.full_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.full_name && formik.errors.full_name && (
            <ErrorText>{formik.errors.full_name}</ErrorText>
          )}
        </FormGroup>

        {/* Email */}
        <FormGroup>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <ErrorText>{formik.errors.email}</ErrorText>
          )}
        </FormGroup>

        {/* Password */}
        <FormGroup>
          <Label htmlFor="password">Password *</Label>
          <TextField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            variant="outlined"
            fullWidth
            size="small"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            InputProps={{
              style: { borderRadius: "8px", fontSize: "14px" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    type="button"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {formik.touched.password && formik.errors.password && (
            <ErrorText>{formik.errors.password}</ErrorText>
          )}
        </FormGroup>

        {/* Mobile Number */}
        <FormGroup>
          <Label htmlFor="mobile_number">Mobile Number (Optional)</Label>
          <Input
            id="mobile_number"
            name="mobile_number"
            placeholder="Enter mobile number"
            value={formik.values.mobile_number}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9]/g, "");
              formik.setFieldValue("mobile_number", cleaned);
            }}
            onBlur={formik.handleBlur}
          />
          {formik.touched.mobile_number && formik.errors.mobile_number && (
            <ErrorText>{formik.errors.mobile_number}</ErrorText>
          )}
        </FormGroup>

        <Button
          backgroundcolor="#7f56d9"
          type="submit"
          text={isLoading ? "Creating..." : "Create Admin"}
          disabled={isLoading}
        />
      </FormContainer>
    </Container>
  );
};

export default CreateAdmin;

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

const ToggleGroup = styled("div")`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
`;

const ToggleOption = styled("label")`
  flex: 1;
  padding: 14px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  input {
    display: none;
  }

  &:has(input:checked) {
    background: #f3ebff;
    border-color: #7f56d9;
    color: #7f56d9;
    font-weight: 600;
  }

  span {
    user-select: none;
  }
`;



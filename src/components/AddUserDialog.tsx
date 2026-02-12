import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close as CloseIcon, Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import { registerValidationSchema } from "../validation/RegisterValidation";
import { useAddUserMutation } from "../services/api/usersApi";
import toast from "react-hot-toast";
import CountryCodeSelector from "./CountryCodeSelector";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
}

interface AddUserFormValues {
  accountType: "student" | "employer";
  full_name: string;
  email: string;
  password: string;
  national_id_number: string;
  businessId: string;
  mobile_number: string;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  
  // Refs to track previous state - only show toast on state transitions
  const prevErrorRef = useRef(false);
  const prevSuccessRef = useRef(false);

  const [addUser, { isLoading, isError, error, isSuccess }] = useAddUserMutation();

  const initialValues: AddUserFormValues = {
    accountType: "student",
    full_name: "",
    email: "",
    password: "",
    national_id_number: "",
    businessId: "",
    mobile_number: "",
  };

  const formik = useFormik<AddUserFormValues>({
    initialValues,
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        const fullPhoneNumber = `${countryCode}${values.mobile_number}`;
        
        const payload = {
          full_name: values.full_name,
          email: values.email,
          mobile_number: fullPhoneNumber,
          password: values.password,
          role: values.accountType,
          national_id_number:
            values.accountType === "student" ? values.national_id_number : undefined,
          business_registration_id:
            values.accountType === "employer" ? values.businessId : undefined,
        };

        await addUser(payload).unwrap();
      } catch (err) {
        console.error("Add user error:", err);
      }
    },
  });

  // Handle success/error - only show toast on state transitions (when dialog is open)
  useEffect(() => {
    // Only show error if dialog is open and error state just changed to true
    if (!prevErrorRef.current && isError && error && open) {
      const err = error as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(err?.data?.message || "Failed to add user");
    }

    // Only show success if dialog is open and success state just changed to true
    if (!prevSuccessRef.current && isSuccess && open) {
      toast.success("Add user Successfully");
      formik.resetForm();
      // Close dialog after showing success message
      setTimeout(() => {
        onClose();
      }, 100);
    }

    // Update refs to track current state
    prevErrorRef.current = isError;
    prevSuccessRef.current = isSuccess;
  }, [isError, error, isSuccess, open, onClose]);

  // Reset form and refs when dialog closes
  useEffect(() => {
    if (!open) {
      formik.resetForm();
      setCountryCode("+1");
      setShowPassword(false);
      // Reset refs when dialog closes so next time it opens, we can show messages again
      prevErrorRef.current = false;
      prevSuccessRef.current = false;
    }
  }, [open]);

  // Prevent page/body from scrolling while dialog is open (especially with keyboard arrows)
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          m: fullScreen ? 0 : 2,
          maxHeight: fullScreen ? "100vh" : "90vh",
          height: fullScreen ? "100vh" : "auto",
          display: "flex !important",
          flexDirection: "column !important",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Add New User
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 }, flex: "1 1 0%", overflowY: "auto", minHeight: 0 }}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* Account Type */}
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ mb: 1, fontWeight: 500, fontSize: "0.875rem" }}
            >
              Account Type
            </FormLabel>
            <RadioGroup
              row
              name="accountType"
              value={formik.values.accountType}
              onChange={formik.handleChange}
              sx={{
                "& .MuiFormControlLabel-root": {
                  flex: 1,
                  mx: 0,
                },
                "& .MuiRadio-root": {
                  py: 1.5,
                },
              }}
            >
              <FormControlLabel
                value="student"
                control={<Radio size="small" sx={{ color: "#2d1b69", "&.Mui-checked": { color: "#2d1b69" } }} />}
                label="Student"
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  mr: 1,
                  px: 2,
                  "&:has(input:checked)": {
                    borderColor: "#2d1b69",
                    backgroundColor: "rgba(45,27,105,0.06)",
                  },
                }}
              />
              <FormControlLabel
                value="employer"
                control={<Radio size="small" sx={{ color: "#2d1b69", "&.Mui-checked": { color: "#2d1b69" } }} />}
                label="Employer"
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  px: 2,
                  "&:has(input:checked)": {
                    borderColor: "#2d1b69",
                    backgroundColor: "rgba(45,27,105,0.06)",
                  },
                }}
              />
            </RadioGroup>
          </FormControl>

          {/* Full Name */}
          <TextField
            id="full_name"
            name="full_name"
            label="Full Name"
            placeholder="Enter full name"
            value={formik.values.full_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.full_name && Boolean(formik.errors.full_name)}
            helperText={formik.touched.full_name && formik.errors.full_name}
            fullWidth
            size="small"
            inputProps={{ maxLength: 255 }}
          />

          {/* Email */}
          <TextField
            id="email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            fullWidth
            size="small"
          />

          {/* Password */}
          <TextField
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    type="button"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Conditional Fields */}
          {formik.values.accountType === "student" ? (
            <TextField
              id="national_id_number"
              name="national_id_number"
              label="National ID Number"
              placeholder="Enter national ID number"
              value={formik.values.national_id_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.national_id_number &&
                Boolean(formik.errors.national_id_number)
              }
              helperText={
                formik.touched.national_id_number && formik.errors.national_id_number
              }
              fullWidth
              size="small"
              inputProps={{ maxLength: 50 }}
            />
          ) : (
            <TextField
              id="businessId"
              name="businessId"
              label="Business Registration ID"
              placeholder="Enter business registration ID"
              value={formik.values.businessId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.businessId && Boolean(formik.errors.businessId)}
              helperText={formik.touched.businessId && formik.errors.businessId}
              fullWidth
              size="small"
              inputProps={{ maxLength: 50 }}
            />
          )}

          {/* Mobile Number - same behaviour as Register page */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.875rem" }}
            >
              Mobile Number
            </Typography>
            <PhoneInputContainer>
              <CountryCodeSelector
                value={countryCode}
                onChange={setCountryCode}
              />
              <PhoneInput
                id="mobile_number"
                name="mobile_number"
                type="tel"
                placeholder="Enter your mobile number"
                value={formik.values.mobile_number}
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  formik.setFieldValue("mobile_number", cleaned);
                }}
              />
            </PhoneInputContainer>
            {formik.touched.mobile_number && formik.errors.mobile_number && (
              <Typography
                variant="caption"
                sx={{ color: "error.main", mt: 0.5, display: "block" }}
              >
                {formik.errors.mobile_number}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 3, sm: 3 },
          pt: 2,
          borderTop: "1px solid #e5e7eb",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
          sx={{
            minWidth: 100,
            borderColor: "#2d1b69",
            color: "#2d1b69",
            "&:hover": { borderColor: "#1a1035", backgroundColor: "rgba(45,27,105,0.04)" },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={() => formik.handleSubmit()}
          disabled={isLoading}
          sx={{
            minWidth: 100,
            backgroundColor: "#2d1b69",
            "&:hover": { backgroundColor: "#1a1035" },
          }}
        >
          {isLoading ? "Adding..." : "Add User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;

// Reuse same layout pattern as Register page for phone input
const PhoneInputContainer = styled("div")`
  display: flex;
  align-items: stretch;
`;

const PhoneInput = styled("input")`
  flex: 1;
  padding: 12px;
  border-radius: 0 8px 8px 0;
  border: 1px solid #ddd;
  border-left: none;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #7f56d9;
    border-left: 1px solid #7f56d9;
  }
`;


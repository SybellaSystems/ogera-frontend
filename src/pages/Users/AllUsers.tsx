import React, { useState, useEffect, useRef, useCallback } from "react";
import { UsersIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { 
  Chip, 
  Avatar, 
  Box, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  Grid,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useGetAllUsersQuery, useGetUserByIdQuery, useUpdateUserByIdMutation, useDeleteUserMutation } from "../../services/api/usersApi";
import type { UserProfile } from "../../services/api/profileApi";
import toast from "react-hot-toast";
import AddUserDialog from "../../components/AddUserDialog";

interface User {
  index: number;
  id: number;
  userId: string; // Store the actual user_id (UUID) for API calls
  name: string;
  email: string;
  role: "Student" | "Employer" | "Admin";
  status: "Active" | "Pending" | "Suspended";
  joinDate: string;
  profileImage?: string;
}

const AllUsers: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = isMobile; // Alias for consistency with existing code
  
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  const [countdown, setCountdown] = useState(3);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserByIdMutation();
  
  // Fetch full user details when viewing/editing
  const { data: userDetails, isLoading: isLoadingUserDetails } = useGetUserByIdQuery(
    userToView?.userId || userToEdit?.userId || "",
    { skip: !userToView && !userToEdit }
  );

  // Update form data when user details are loaded
  useEffect(() => {
    if (userDetails?.data && userToEdit) {
      setEditFormData({
        full_name: userDetails.data.full_name,
        email: userDetails.data.email,
        mobile_number: userDetails.data.mobile_number,
        national_id_number: userDetails.data.national_id_number,
        business_registration_id: userDetails.data.business_registration_id,
        preferred_location: userDetails.data.preferred_location,
      });
    }
  }, [userDetails, userToEdit]);

  // Use getAllUsers API with server-side pagination - this endpoint uses roleType from roles table
  // Now includes counts for students and employers in a single API call
  // No type parameter means fetch all users (students and employers)
  const { 
    data: usersData, 
    isLoading, 
    isError 
  } = useGetAllUsersQuery({
    page: page + 1, // Backend uses 1-based pagination
    limit: limit,
    // No type parameter = fetch all users
  });

  const allUsers: UserProfile[] = usersData?.data || [];

  const mapUser = (user: UserProfile, index: number): User => {
    // Use roleType / roleName from the role object (now available from the API)
    const rawRoleType = user.role?.roleType || user.role?.roleName || "";
    const roleType = rawRoleType.toLowerCase();
    const startIndex = page * limit;

    let uiRole: User["role"];
    if (roleType === "student") {
      uiRole = "Student";
    } else if (roleType === "employer") {
      uiRole = "Employer";
    } else {
      // Any admin-type role (admin / superAdmin / custom admin names) will
      // be normalised to "Admin" for display. These should generally be
      // managed from the Admin section, not this Users list.
      uiRole = "Admin";
    }

    return {
      index: startIndex + index + 1,
      id: Number(user.user_id),
      userId: user.user_id, // Store the UUID string for API calls
      name: user.full_name,
      email: user.email,
      role: uiRole,
      status: "Active",
      joinDate: user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "-",
      profileImage: user.profile_image_url,
    };
  };

  const users: User[] = allUsers.map((user, index) => mapUser(user, index));
  
  // Calculate counts from pagination metadata and counts from API
  const totalCount = usersData?.pagination?.total || 0;
  const studentCount = usersData?.counts?.students || 0;
  const employerCount = usersData?.counts?.employers || 0;

  // Lock body scroll when any full-screen dialog (view/edit/add user) is open
  useEffect(() => {
    const anyDialogOpen = viewDialogOpen || editDialogOpen || addUserDialogOpen;
    if (!anyDialogOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [viewDialogOpen, editDialogOpen, addUserDialogOpen]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    setCountdown(3);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.userId).unwrap();
        // The mutation will automatically invalidate the cache and refetch the data
      } catch (error) {
        console.error("Failed to delete user:", error);
        // You can add a toast notification here if needed
      }
    }
    handleCloseDeleteDialog();
  }, [userToDelete, deleteUser, handleCloseDeleteDialog]);

  const handleDeleteClick = (row: User) => {
    setUserToDelete(row);
    setDeleteDialogOpen(true);
    setCountdown(3);
  };

  const handleViewClick = (row: User) => {
    setUserToView(row);
    setViewDialogOpen(true);
  };

  const handleEditClick = (row: User) => {
    setUserToEdit(row);
    setEditDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setUserToView(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setUserToEdit(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    if (!userToEdit) return;

    try {
      await updateUser({ id: userToEdit.userId, data: editFormData }).unwrap();
      toast.success("User updated successfully");
      handleCloseEditDialog();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  // Handle delete dialog countdown
  useEffect(() => {
    if (!deleteDialogOpen) {
      return;
    }

    // Reset countdown when dialog opens
    setCountdown(3);

    // Start countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          // Auto-delete when countdown reaches 0
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          handleConfirmDelete();
          return 0;
        }
        return newCount;
      });
    }, 1000);

    // Cleanup on unmount or when dialog closes
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [deleteDialogOpen, handleConfirmDelete]);

  const columns: Column<User>[] = [
    {
      id: "index",
      label: "#",
      minWidth: isMobile ? 32 : 40,
      align: "center",
      sortable: false,
      format: (value) => (
        <Typography sx={{ fontWeight: 500, color: "#6b7280", fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "name",
      label: "User",
      minWidth: isMobile ? 120 : 160,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: isMobile ? 0.75 : 1 }}>
          <Avatar
            src={row.profileImage || undefined}
            sx={{
              bgcolor: "#9333ea",
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
              fontSize: isMobile ? "0.65rem" : "0.75rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 500, color: "#111827", fontSize: isMobile ? "0.75rem" : "0.8125rem", lineHeight: 1.3 }}>
              {value}
            </Typography>
            {/* Show email below name on mobile since email column is hidden */}
            {isMobile && (
              <Typography sx={{ fontSize: "0.65rem", color: "#6b7280", lineHeight: 1.2 }}>
                {row.email}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    // Hide email column on mobile - shown inline with name instead
    ...(!isMobile ? [{
      id: "email" as keyof User,
      label: "Email",
      minWidth: 170,
    }] : []),
    {
      id: "role",
      label: "Role",
      minWidth: isMobile ? 70 : 90,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: value === "Student" ? "#dbeafe" : "#d1fae5",
            color: value === "Student" ? "#1e40af" : "#065f46",
            fontWeight: 600,
            fontSize: isMobile ? "0.625rem" : "0.7rem",
            height: isMobile ? 20 : 22,
          }}
        />
      ),
    },
    // Hide status column on mobile
    ...(!isMobile ? [{
      id: "status" as keyof User,
      label: "Status",
      minWidth: 90,
      format: (value: any) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "Active"
                ? "#d1fae5"
                : value === "Pending"
                ? "#fed7aa"
                : "#fee2e2",
            color:
              value === "Active"
                ? "#065f46"
                : value === "Pending"
                ? "#9a3412"
                : "#991b1b",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 22,
          }}
        />
      ),
    }] : []),
    // Hide joined date column on mobile
    ...(!isMobile ? [{
      id: "joinDate" as keyof User,
      label: "Joined",
      minWidth: 90,
    }] : []),
  ];

  const actions: TableAction<User>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        handleViewClick(row);
      },
      color: "primary",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        handleEditClick(row);
      },
      color: "primary",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => {
        handleDeleteClick(row);
      },
      color: "error",
    },
  ];

  return (
    <div className="space-y-3 animate-fadeIn max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
            <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600 flex-shrink-0" />
            <span>All Users</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
            Manage all students and employers
          </p>
        </div>
        <button
          onClick={() => setAddUserDialogOpen(true)}
          className="bg-[#2d1b69] hover:bg-[#1a1035] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
        >
          + Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Total Users</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 sm:mt-1">
            {isLoading ? "…" : totalCount}
          </p>
          <p className="text-[9px] sm:text-[10px] text-green-600 mt-0.5 truncate">
            Students & Employers
          </p>
        </div>
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Students</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 sm:mt-1">
            {isLoading ? "…" : studentCount}
          </p>
          <p className="text-[9px] sm:text-[10px] text-blue-600 mt-0.5">Student accounts</p>
        </div>
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Employers</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 sm:mt-1">
            {isLoading ? "…" : employerCount}
          </p>
          <p className="text-[9px] sm:text-[10px] text-purple-600 mt-0.5">Employer accounts</p>
        </div>
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">On This Page</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 sm:mt-1">
            {isLoading ? "…" : users.length}
          </p>
          <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5">Currently displayed</p>
        </div>
      </div>

      {/* Custom Table */}
      <CustomTable
        columns={columns}
        data={users}
        actions={actions}
        loading={isLoading}
        emptyMessage={
          isError
            ? "Failed to load users. Please try again."
            : totalCount === 0
            ? "No users present"
            : "No users found"
        }
        selectable={true}
        searchable={true}
        searchPlaceholder="Search users by name, email..."
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

      {/* View User Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? "100vh" : "90vh",
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
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {userDetails?.data?.role?.roleType === "student" ? "Student" : userDetails?.data?.role?.roleType === "employer" ? "Employer" : "User"} Details
          </Typography>
          <IconButton
            onClick={handleCloseViewDialog}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
          {isLoadingUserDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: isMobile ? 2 : 4 }}>
              <CircularProgress size={isMobile ? 32 : 40} />
            </Box>
          ) : userDetails?.data ? (
            <Box>
              {/* User Profile Header Card */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
                  mb: isSmallMobile ? 1.5 : isMobile ? 2 : 2,
                  p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                  borderRadius: 1.5,
                  backgroundColor: userDetails.data.role?.roleType === "student" 
                    ? "rgba(59, 130, 246, 0.08)" 
                    : "rgba(16, 185, 129, 0.08)",
                  border: `1px solid ${userDetails.data.role?.roleType === "student" 
                    ? "rgba(59, 130, 246, 0.2)" 
                    : "rgba(16, 185, 129, 0.2)"}`,
                  flexDirection: isMobile ? "column" : "row",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: userDetails.data.role?.roleType === "student" ? "#3b82f6" : "#10b981",
                    width: isSmallMobile ? 48 : isMobile ? 56 : 64,
                    height: isSmallMobile ? 48 : isMobile ? 56 : 64,
                    fontSize: isSmallMobile ? "1.25rem" : isMobile ? "1.5rem" : "1.75rem",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {userDetails.data.full_name?.charAt(0) || "U"}
                </Avatar>
                <Box sx={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
                  <Typography 
                    variant={isSmallMobile ? "subtitle2" : isMobile ? "subtitle1" : "h6"} 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: isSmallMobile ? "0.9375rem" : isMobile ? "1.125rem" : "1.25rem",
                      mb: 0.5,
                      color: "text.primary",
                    }}
                  >
                    {userDetails.data.full_name}
                  </Typography>
                  <Chip
                    label={userDetails.data.role?.roleType === "student" ? "Student" : "Employer"}
                    size="small"
                    sx={{
                      bgcolor: userDetails.data.role?.roleType === "student" ? "#dbeafe" : "#d1fae5",
                      color: userDetails.data.role?.roleType === "student" ? "#1e40af" : "#065f46",
                      fontWeight: 600,
                      fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                      height: isSmallMobile ? "20px" : isMobile ? "22px" : "24px",
                      px: 0.75,
                    }}
                  />
                </Box>
              </Box>

              {/* Details Section */}
              <Grid container spacing={isSmallMobile ? 1.5 : isMobile ? 2 : 2}>
                {/* Email */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Email Address
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        wordBreak: "break-word",
                        color: "text.primary",
                      }}
                    >
                      {userDetails.data.email}
                    </Typography>
                  </Box>
                </Grid>

                {/* Mobile Number */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Mobile Number
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        color: "text.primary",
                      }}
                    >
                      {userDetails.data.mobile_number || "-"}
                    </Typography>
                  </Box>
                </Grid>

                {/* National ID Number - Only for Students */}
                {userDetails.data.role?.roleType === "student" && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                        borderRadius: 1.5,
                        backgroundColor: "rgba(59, 130, 246, 0.05)",
                        border: "1px solid rgba(59, 130, 246, 0.15)",
                        height: "100%",
                        minHeight: "80px",
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: isSmallMobile ? 0.5 : 0.75, 
                          fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        National ID Number
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                          wordBreak: "break-word",
                          color: "text.primary",
                        }}
                      >
                        {userDetails.data.national_id_number || "-"}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {/* Business Registration ID - Only for Employers */}
                {userDetails.data.role?.roleType === "employer" && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                        borderRadius: 1.5,
                        backgroundColor: "rgba(16, 185, 129, 0.05)",
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                        height: "100%",
                        minHeight: "80px",
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: isSmallMobile ? 0.5 : 0.75, 
                          fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Business Registration ID
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                          wordBreak: "break-word",
                          color: "text.primary",
                        }}
                      >
                        {userDetails.data.business_registration_id || "-"}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {/* Preferred Location */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Preferred Location
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        color: "text.primary",
                      }}
                    >
                      {userDetails.data.preferred_location || "-"}
                    </Typography>
                  </Box>
                </Grid>
                {/* Verification Status */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: userDetails.data.email_verified 
                        ? "rgba(16, 185, 129, 0.08)" 
                        : "rgba(153, 27, 27, 0.08)",
                      border: `1px solid ${userDetails.data.email_verified 
                        ? "rgba(16, 185, 129, 0.2)" 
                        : "rgba(153, 27, 27, 0.2)"}`,
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Email Verification
                    </Typography>
                    <Chip
                      icon={userDetails.data.email_verified ? (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#065f46",
                          }}
                        />
                      ) : undefined}
                      label={userDetails.data.email_verified ? "Verified" : "Not Verified"}
                      size="small"
                      sx={{
                        bgcolor: userDetails.data.email_verified ? "#d1fae5" : "#fee2e2",
                        color: userDetails.data.email_verified ? "#065f46" : "#991b1b",
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        height: isSmallMobile ? "22px" : isMobile ? "24px" : "26px",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: userDetails.data.phone_verified 
                        ? "rgba(16, 185, 129, 0.08)" 
                        : "rgba(153, 27, 27, 0.08)",
                      border: `1px solid ${userDetails.data.phone_verified 
                        ? "rgba(16, 185, 129, 0.2)" 
                        : "rgba(153, 27, 27, 0.2)"}`,
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Phone Verification
                    </Typography>
                    <Chip
                      icon={userDetails.data.phone_verified ? (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#065f46",
                          }}
                        />
                      ) : undefined}
                      label={userDetails.data.phone_verified ? "Verified" : "Not Verified"}
                      size="small"
                      sx={{
                        bgcolor: userDetails.data.phone_verified ? "#d1fae5" : "#fee2e2",
                        color: userDetails.data.phone_verified ? "#065f46" : "#991b1b",
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        height: isSmallMobile ? "22px" : isMobile ? "24px" : "26px",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>

                {/* Account Dates */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Account Created
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        color: "text.primary",
                      }}
                    >
                      {userDetails.data.created_at
                        ? new Date(userDetails.data.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: isSmallMobile ? "0.625rem" : isMobile ? "0.65rem" : "0.7rem",
                        color: "text.secondary",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {userDetails.data.created_at
                        ? new Date(userDetails.data.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      minHeight: "80px",
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isSmallMobile ? 0.5 : 0.75, 
                        fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Last Updated
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.9375rem",
                        color: "text.primary",
                      }}
                    >
                      {userDetails.data.updated_at
                        ? new Date(userDetails.data.updated_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: isSmallMobile ? "0.625rem" : isMobile ? "0.65rem" : "0.7rem",
                        color: "text.secondary",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {userDetails.data.updated_at
                        ? new Date(userDetails.data.updated_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>User details not found</Typography>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: isSmallMobile ? 1.5 : isMobile ? 2 : 2.5, 
            pb: isSmallMobile ? 1.25 : isMobile ? 1.5 : 1.75,
            pt: isSmallMobile ? 1 : isMobile ? 1.25 : 1.5,
            flexDirection: isMobile ? "column" : "row",
            gap: isSmallMobile ? 0.75 : isMobile ? 1 : 0,
            borderTop: isMobile ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
            position: isMobile ? "sticky" : "relative",
            bottom: 0,
            backgroundColor: "background.paper",
            zIndex: 1,
            boxShadow: isMobile ? "0 -2px 8px rgba(0, 0, 0, 0.1)" : "none",
            flexShrink: 0,
          }}
        >
          <Button 
            onClick={handleCloseViewDialog} 
            variant="outlined" 
            color="inherit"
            fullWidth={isMobile}
            size={isSmallMobile ? "medium" : isMobile ? "large" : "medium"}
            sx={{
              minHeight: isSmallMobile ? "42px" : isMobile ? "48px" : "36px",
              fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.9375rem" : "0.875rem",
              fontWeight: isMobile ? 500 : 400,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <AddUserDialog
        open={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
      />

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? "100vh" : "90vh",
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
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit {userDetails?.data?.role?.roleType === "student" ? "Student" : userDetails?.data?.role?.roleType === "employer" ? "Employer" : "User"}
          </Typography>
          <IconButton
            onClick={handleCloseEditDialog}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
          {isLoadingUserDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: isMobile ? 2 : 4 }}>
              <CircularProgress size={isMobile ? 32 : 40} />
            </Box>
          ) : userDetails?.data ? (
            <Box>
              {/* User Info Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
                  mb: isSmallMobile ? 1.5 : isMobile ? 2 : 3,
                  p: isSmallMobile ? 1.5 : isMobile ? 2 : 2.5,
                  borderRadius: 2,
                  backgroundColor: "rgba(147, 51, 234, 0.05)",
                  border: "1px solid rgba(147, 51, 234, 0.1)",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: userDetails.data.role?.roleType === "student" ? "#3b82f6" : "#10b981",
                    width: isSmallMobile ? 48 : isMobile ? 56 : 64,
                    height: isSmallMobile ? 48 : isMobile ? 56 : 64,
                    fontSize: isSmallMobile ? "1rem" : isMobile ? "1.25rem" : "1.5rem",
                    fontWeight: 600,
                  }}
                >
                  {userDetails.data.full_name?.charAt(0) || "U"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant={isSmallMobile ? "body2" : isMobile ? "body1" : "subtitle1"}
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.9375rem" : "1rem",
                    }}
                  >
                    {userDetails.data.full_name}
                  </Typography>
                  <Chip
                    label={userDetails.data.role?.roleType === "student" ? "Student" : "Employer"}
                    size="small"
                    sx={{
                      bgcolor: userDetails.data.role?.roleType === "student" ? "#dbeafe" : "#d1fae5",
                      color: userDetails.data.role?.roleType === "student" ? "#1e40af" : "#065f46",
                      fontWeight: 600,
                      mt: 0.5,
                      fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.7rem" : "0.75rem",
                      height: isSmallMobile ? "20px" : isMobile ? "22px" : "24px",
                    }}
                  />
                </Box>
              </Box>

              <Grid container spacing={isSmallMobile ? 2 : isMobile ? 2.5 : 3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editFormData.full_name || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, full_name: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={editFormData.mobile_number || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, mobile_number: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
                {/* Show National ID only for Students */}
                {userDetails.data.role?.roleType === "student" && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="National ID Number"
                      value={editFormData.national_id_number || ""}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, national_id_number: e.target.value })
                      }
                      variant="outlined"
                      size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiInputBase-root": {
                          fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                          minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                          backgroundColor: "background.paper",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                        },
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                    />
                  </Grid>
                )}
                {/* Show Business Registration ID only for Employers */}
                {userDetails.data.role?.roleType === "employer" && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Business Registration ID"
                      value={editFormData.business_registration_id || ""}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, business_registration_id: e.target.value })
                      }
                      variant="outlined"
                      size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiInputBase-root": {
                          fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                          minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                          backgroundColor: "background.paper",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                        },
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Preferred Location"
                    value={editFormData.preferred_location || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, preferred_location: e.target.value })
                    }
                    variant="outlined"
                    size={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.875rem" : "1rem",
                        minHeight: isSmallMobile ? "44px" : isMobile ? "48px" : "56px",
                        backgroundColor: "background.paper",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.8125rem" : "0.875rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>User details not found</Typography>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: isSmallMobile ? 1.5 : isMobile ? 2 : 3, 
            pb: isSmallMobile ? 1.5 : isMobile ? 2 : 2,
            pt: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
            flexDirection: isMobile ? "column-reverse" : "row",
            gap: isSmallMobile ? 0.75 : isMobile ? 1 : 0,
            borderTop: isMobile ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
            position: isMobile ? "sticky" : "relative",
            bottom: 0,
            backgroundColor: "background.paper",
            zIndex: 1,
            boxShadow: isMobile ? "0 -2px 8px rgba(0, 0, 0, 0.1)" : "none",
          }}
        >
          <Button 
            onClick={handleCloseEditDialog} 
            variant="outlined" 
            color="inherit"
            fullWidth={isMobile}
            size={isSmallMobile ? "medium" : isMobile ? "large" : "medium"}
            sx={{
              minHeight: isSmallMobile ? "42px" : isMobile ? "48px" : "36px",
              fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.9375rem" : "0.875rem",
              fontWeight: isMobile ? 500 : 400,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            disabled={isUpdating || isLoadingUserDetails}
            startIcon={isUpdating ? <CircularProgress size={isSmallMobile ? 16 : isMobile ? 18 : 20} /> : <EditIcon />}
            fullWidth={isMobile}
            size={isSmallMobile ? "medium" : isMobile ? "large" : "medium"}
            sx={{
              minHeight: isSmallMobile ? "42px" : isMobile ? "48px" : "36px",
              fontSize: isSmallMobile ? "0.875rem" : isMobile ? "0.9375rem" : "0.875rem",
              fontWeight: isMobile ? 600 : 500,
            }}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth={isSmallMobile ? "xs" : isMobile ? "sm" : "sm"}
        fullWidth={false}
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{
          sx: {
            m: isMobile ? 0 : isSmallMobile ? 0.5 : 1,
            width: isMobile ? "100%" : isSmallMobile ? "90%" : "480px",
            maxWidth: isMobile ? "100%" : isSmallMobile ? "90%" : "480px",
            maxHeight: isMobile ? "100vh" : isSmallMobile ? "90vh" : "85vh",
            height: isMobile ? "100vh" : "auto",
            borderRadius: isMobile ? 0 : isSmallMobile ? 1 : 2,
            marginLeft: isMobile ? 0 : "auto",
            marginRight: isMobile ? 0 : isSmallMobile ? "8px" : "16px",
            marginTop: isMobile ? 0 : isSmallMobile ? "8px" : "16px",
            marginBottom: isMobile ? 0 : isSmallMobile ? "8px" : "16px",
          },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: isMobile ? "flex-end" : "flex-start",
            justifyContent: isMobile ? "center" : "flex-end",
            padding: isSmallMobile ? "4px" : isMobile ? "8px" : "8px",
          },
          "& .MuiDialogContent-root": {
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: isSmallMobile ? "10px" : isMobile ? "12px" : "16px",
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            gap: 0.75,
            px: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
            py: isSmallMobile ? 0.75 : isMobile ? 1 : 1.5,
            fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.9375rem" : "1rem",
            position: isMobile ? "sticky" : "relative",
            top: 0,
            backgroundColor: "background.paper",
            zIndex: 2,
            borderBottom: isMobile ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flex: 1 }}>
            <DeleteIcon 
              color="error" 
              fontSize={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
              sx={{ fontSize: isSmallMobile ? "16px" : isMobile ? "18px" : "20px" }}
            />
            <Typography 
              variant={isSmallMobile ? "body2" : isMobile ? "body1" : "subtitle1"} 
              component="span"
              sx={{ 
                fontWeight: 600,
                fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.9375rem" : "1rem",
              }}
            >
              Delete User
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDeleteDialog}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "text.primary",
              },
              width: isSmallMobile ? 24 : isMobile ? 28 : 32,
              height: isSmallMobile ? 24 : isMobile ? 28 : 32,
              position: "absolute",
              right: isSmallMobile ? 8 : isMobile ? 12 : 16,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <CloseIcon 
              fontSize={isSmallMobile ? "small" : isMobile ? "small" : "medium"}
              sx={{ fontSize: isSmallMobile ? "16px" : isMobile ? "18px" : "20px" }}
            />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            px: isSmallMobile ? 1 : isMobile ? 1.5 : 2, 
            pb: isSmallMobile ? 0.75 : isMobile ? 1 : 1.5,
            pt: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
            overflowY: "auto",
            maxHeight: isMobile ? "calc(100vh - 180px)" : "none",
            "&::-webkit-scrollbar": {
              width: isMobile ? "4px" : "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
            },
          }}
        >
          <Typography 
            variant={isSmallMobile ? "body2" : isMobile ? "body1" : "body1"} 
            sx={{ 
              mb: isSmallMobile ? 1.5 : isMobile ? 2 : 2,
              fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "1rem",
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isSmallMobile ? 1 : isMobile ? 1.5 : 2,
              mt: isSmallMobile ? 1.5 : isMobile ? 2 : 2,
              p: isSmallMobile ? 1.5 : isMobile ? 2 : 2,
              bgcolor: "#fee2e2",
              borderRadius: isSmallMobile ? 1.5 : 2,
            }}
          >
            <CircularProgress 
              size={isSmallMobile ? 20 : isMobile ? 22 : 24} 
              thickness={4}
              sx={{ color: "#ef4444" }}
            />
            <Typography 
              variant={isSmallMobile ? "caption" : isMobile ? "body2" : "body2"} 
              color="error" 
              fontWeight={600}
              sx={{
                fontSize: isSmallMobile ? "0.7rem" : isMobile ? "0.75rem" : "0.875rem",
              }}
            >
              Auto-deleting in {countdown} second{countdown !== 1 ? "s" : ""}...
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: isSmallMobile ? 1 : isMobile ? 1.5 : 2, 
            pb: isSmallMobile ? 1 : isMobile ? 1.5 : 1.5,
            pt: isSmallMobile ? 0.75 : isMobile ? 1 : 1.5,
            flexDirection: isMobile ? "column-reverse" : "row",
            gap: isSmallMobile ? 0.5 : isMobile ? 0.75 : 0,
            borderTop: isMobile ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
            position: isMobile ? "sticky" : "relative",
            bottom: 0,
            backgroundColor: "background.paper",
            zIndex: 1,
            boxShadow: isMobile ? "0 -2px 8px rgba(0, 0, 0, 0.1)" : "none",
          }}
        >
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            color="inherit"
            fullWidth={isMobile}
            size={isSmallMobile ? "small" : isMobile ? "medium" : "small"}
            sx={{
              minHeight: isSmallMobile ? "36px" : isMobile ? "40px" : "32px",
              fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.8125rem",
              fontWeight: isMobile ? 500 : 400,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon sx={{ fontSize: isSmallMobile ? "14px" : isMobile ? "16px" : "18px" }} />}
            fullWidth={isMobile}
            size={isSmallMobile ? "small" : isMobile ? "medium" : "small"}
            sx={{
              minHeight: isSmallMobile ? "36px" : isMobile ? "40px" : "32px",
              fontSize: isSmallMobile ? "0.8125rem" : isMobile ? "0.875rem" : "0.8125rem",
              fontWeight: isMobile ? 600 : 500,
            }}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AllUsers;

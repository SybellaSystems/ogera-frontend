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
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useGetAllUsersQuery, useDeleteUserMutation } from "../../services/api/usersApi";
import type { UserProfile } from "../../services/api/profileApi";

interface User {
  index: number;
  id: number;
  userId: string; // Store the actual user_id (UUID) for API calls
  name: string;
  email: string;
  role: "Student" | "Employer";
  status: "Active" | "Pending" | "Suspended";
  joinDate: string;
}

const AllUsers: React.FC = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [countdown, setCountdown] = useState(3);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [deleteUser] = useDeleteUserMutation();

  // Use getAllUsers API with server-side pagination - this endpoint uses roleType from roles table
  // Now includes counts for students and employers in a single API call
  const { 
    data: usersData, 
    isLoading, 
    isError 
  } = useGetAllUsersQuery({
    page: page + 1, // Backend uses 1-based pagination
    limit: limit,
  });

  const allUsers: UserProfile[] = usersData?.data || [];

  const mapUser = (user: UserProfile, index: number): User => {
    // Use roleType from the role object (now available from the API)
    const roleType = user.role?.roleType?.toLowerCase() || user.role?.roleName?.toLowerCase() || "";
    const startIndex = page * limit;
    return {
      index: startIndex + index + 1,
      id: Number(user.user_id),
      userId: user.user_id, // Store the UUID string for API calls
      name: user.full_name,
      email: user.email,
      role:
        roleType === "student"
          ? "Student"
          : roleType === "employer"
          ? "Employer"
          : "Student",
      status: "Active",
      joinDate: user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "-",
    };
  };

  const users: User[] = allUsers.map((user, index) =>
    mapUser(user, index)
  );
  
  // Calculate counts from pagination metadata and counts from API
  const totalCount = usersData?.pagination?.total || 0;
  const studentCount = usersData?.counts?.students || 0;
  const employerCount = usersData?.counts?.employers || 0;

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
      id: "name",
      label: "User",
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#9333ea",
              width: 40,
              height: 40,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Typography sx={{ fontWeight: 500, color: "#111827" }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "email",
      label: "Email",
      minWidth: 200,
    },
    {
      id: "role",
      label: "Role",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: value === "Student" ? "#dbeafe" : "#d1fae5",
            color: value === "Student" ? "#1e40af" : "#065f46",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      format: (value) => (
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
          }}
        />
      ),
    },
    {
      id: "joinDate",
      label: "Join Date",
      minWidth: 120,
    },
  ];

  const actions: TableAction<User>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View user:", row);
      },
      color: "primary",
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Edit user:", row);
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <UsersIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
            All Users
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            View and manage all students and employers in the platform
          </p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2.5 rounded-lg font-semibold transition shadow-md hover:shadow-lg whitespace-nowrap self-start md:self-auto">
          + Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : totalCount}
          </p>
          <p className="text-sm text-green-600 mt-2">
            Students & Employers only
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : studentCount}
          </p>
          <p className="text-sm text-blue-600 mt-2">Student accounts</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Employers</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : employerCount}
          </p>
          <p className="text-sm text-purple-600 mt-2">Employer accounts</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">On This Page</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? "…" : users.length}
          </p>
          <p className="text-sm text-gray-600 mt-2">Currently displayed</p>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteIcon color="error" />
          <Typography variant="h6" component="span">
            Delete User
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mt: 2,
              p: 2,
              bgcolor: "#fee2e2",
              borderRadius: 2,
            }}
          >
            <CircularProgress size={24} thickness={4} />
            <Typography variant="body2" color="error" fontWeight={600}>
              Auto-deleting in {countdown} second{countdown !== 1 ? "s" : ""}...
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AllUsers;

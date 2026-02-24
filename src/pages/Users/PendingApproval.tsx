import React, { useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
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
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useLockUserAccountMutation,
} from "../../services/api/usersApi";
import type { UserProfile } from "../../services/api/profileApi";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

interface PendingUser {
  index: number;
  id: number;
  userId: string;
  name: string;
  email: string;
  role: string;
  requestDate: string;
}

const PendingApproval: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down("md"));

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [page] = useState(0);
  const [limit] = useState(10);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [userToView, setUserToView] = useState<PendingUser | null>(null);
  const [userToReject, setUserToReject] = useState<PendingUser | null>(null);

  const { data: usersData, isLoading, isError } = useGetAllUsersQuery({
    page: page + 1,
    limit: 100, // Fetch more to filter client-side for unverified
  });

  const [updateUser, { isLoading: isApproving }] = useUpdateUserByIdMutation();
  const [lockUser, { isLoading: isRejecting }] = useLockUserAccountMutation();

  const { data: userDetails, isLoading: isLoadingDetails } = useGetUserByIdQuery(
    userToView?.userId || "",
    { skip: !userToView }
  );

  // Filter for users with email_verified === false
  const allUsers: UserProfile[] = usersData?.data || [];
  const pendingUsers = allUsers.filter(
    (u) => u.email_verified === false
  );

  const mapUser = (user: UserProfile, index: number): PendingUser => {
    const rawRoleType = user.role?.roleType || user.role?.roleName || "Unknown";
    return {
      index: index + 1,
      id: Number(user.user_id),
      userId: user.user_id,
      name: user.full_name || "N/A",
      email: user.email,
      role: rawRoleType.charAt(0).toUpperCase() + rawRoleType.slice(1),
      requestDate: user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "-",
    };
  };

  const users: PendingUser[] = pendingUsers.map((u, i) => mapUser(u, i));
  const totalPending = users.length;
  const studentsPending = pendingUsers.filter(
    (u) => (u.role?.roleType || "").toLowerCase() === "student"
  ).length;
  const employersPending = pendingUsers.filter(
    (u) => (u.role?.roleType || "").toLowerCase() === "employer"
  ).length;

  const handleApprove = async (row: PendingUser) => {
    try {
      await updateUser({
        id: row.userId,
        data: { email_verified: true } as any,
      }).unwrap();
      toast.success(`${row.name} has been approved`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve user");
    }
  };

  const handleRejectConfirm = async () => {
    if (!userToReject) return;
    try {
      await lockUser({
        userId: userToReject.userId,
        reason: "Registration rejected by admin",
        duration: "permanent",
      }).unwrap();
      toast.success(`${userToReject.name} has been rejected`);
      setRejectDialogOpen(false);
      setUserToReject(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject user");
    }
  };

  const columns: Column<PendingUser>[] = [
    {
      id: "index",
      label: "#",
      minWidth: isMobile ? 32 : 40,
      align: "center",
      sortable: false,
      format: (value) => (
        <Typography
          sx={{
            fontWeight: 500,
            color: isDark ? "#9ca3af" : "#6b7280",
            fontSize: isMobile ? "0.7rem" : "0.75rem",
          }}
        >
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
            sx={{
              bgcolor: "#f59e0b",
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
              fontSize: isMobile ? "0.65rem" : "0.75rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontWeight: 500,
                color: isDark ? "#f3f4f6" : "#111827",
                fontSize: isMobile ? "0.75rem" : "0.8125rem",
                lineHeight: 1.3,
              }}
            >
              {value}
            </Typography>
            {isMobile && (
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: isDark ? "#9ca3af" : "#6b7280",
                  lineHeight: 1.2,
                }}
              >
                {row.email}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    ...(!isMobile
      ? [
          {
            id: "email" as keyof PendingUser,
            label: "Email",
            minWidth: 170,
          },
        ]
      : []),
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
    ...(!isMobile
      ? [
          {
            id: "requestDate" as keyof PendingUser,
            label: "Requested",
            minWidth: 100,
          },
        ]
      : []),
  ];

  const actions: TableAction<PendingUser>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        setUserToView(row);
        setViewDialogOpen(true);
      },
      color: "primary",
    },
    {
      label: "Approve",
      icon: <ApproveIcon fontSize="small" />,
      onClick: (row) => handleApprove(row),
      color: "success",
    },
    {
      label: "Reject",
      icon: <RejectIcon fontSize="small" />,
      onClick: (row) => {
        setUserToReject(row);
        setRejectDialogOpen(true);
      },
      color: "error",
    },
  ];

  return (
    <div
      className="space-y-3 animate-fadeIn max-w-full overflow-x-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)"
          : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1
            className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-1.5 sm:gap-2"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            <ClockIcon
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0"
              style={{ color: isDark ? "#fb923c" : "#ea580c" }}
            />
            <span>Pending Approval</span>
          </h1>
          <p
            className="text-[10px] sm:text-xs mt-0.5"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Review and approve new user registrations
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {totalPending > 0 && (
        <div
          role="alert"
          style={{
            backgroundColor: isDark ? "rgba(234,88,12,0.15)" : "#fff7ed",
            border: `1px solid ${isDark ? "rgba(234,88,12,0.3)" : "#fed7aa"}`,
            borderRadius: "8px",
            padding: "10px 14px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: isDark ? "#fb923c" : "#9a3412",
              fontFamily: "'Nunito', sans-serif",
              margin: 0,
            }}
          >
            {totalPending} user{totalPending !== 1 ? "s" : ""} waiting for approval
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">
        <div
          style={{
            backgroundColor: isDark ? "rgba(234,88,12,0.1)" : "#fff7ed",
            border: `1px solid ${isDark ? "rgba(234,88,12,0.25)" : "#fed7aa"}`,
            borderRadius: "10px",
            padding: isMobile ? "8px 10px" : "12px 16px",
          }}
        >
          <p
            style={{
              fontSize: isMobile ? "10px" : "11px",
              fontWeight: 600,
              color: isDark ? "#fb923c" : "#9a3412",
              margin: 0,
            }}
          >
            Total Pending
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#fdba74" : "#7c2d12",
              margin: "4px 0 0",
            }}
          >
            {isLoading ? "…" : totalPending}
          </p>
        </div>
        <div
          style={{
            backgroundColor: isDark ? "rgba(59,130,246,0.1)" : "#eff6ff",
            border: `1px solid ${isDark ? "rgba(59,130,246,0.25)" : "#bfdbfe"}`,
            borderRadius: "10px",
            padding: isMobile ? "8px 10px" : "12px 16px",
          }}
        >
          <p
            style={{
              fontSize: isMobile ? "10px" : "11px",
              fontWeight: 600,
              color: isDark ? "#60a5fa" : "#1e40af",
              margin: 0,
            }}
          >
            Students
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#93bbfd" : "#1e3a5f",
              margin: "4px 0 0",
            }}
          >
            {isLoading ? "…" : studentsPending}
          </p>
        </div>
        <div
          style={{
            backgroundColor: isDark ? "rgba(22,163,74,0.1)" : "#f0fdf4",
            border: `1px solid ${isDark ? "rgba(22,163,74,0.25)" : "#bbf7d0"}`,
            borderRadius: "10px",
            padding: isMobile ? "8px 10px" : "12px 16px",
          }}
        >
          <p
            style={{
              fontSize: isMobile ? "10px" : "11px",
              fontWeight: 600,
              color: isDark ? "#4ade80" : "#166534",
              margin: 0,
            }}
          >
            Employers
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#86efac" : "#14532d",
              margin: "4px 0 0",
            }}
          >
            {isLoading ? "…" : employersPending}
          </p>
        </div>
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={users}
        actions={actions}
        loading={isLoading}
        emptyMessage={
          isError
            ? "Failed to load users. Please try again."
            : totalPending === 0
            ? "No pending approvals"
            : "No users found"
        }
        searchable={true}
        searchPlaceholder="Search pending users..."
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={limit}
        serverSidePagination={false}
      />

      {/* View User Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setUserToView(null);
        }}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : "12px",
            bgcolor: isDark ? "#1e1833" : "#ffffff",
            color: isDark ? "#f3f4f6" : "#1f2937",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
            color: isDark ? "#f3f4f6" : "#1f2937",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EyeIcon className="h-5 w-5" style={{ color: isDark ? "#fb923c" : "#ea580c" }} />
            <span>User Details</span>
          </Box>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setUserToView(null);
            }}
            sx={{ minWidth: "auto", color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {isLoadingDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : userDetails?.data ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
              {[
                { label: "Full Name", value: userDetails.data.full_name },
                { label: "Email", value: userDetails.data.email },
                { label: "Phone", value: userDetails.data.mobile_number || "N/A" },
                { label: "Role", value: userDetails.data.role?.roleType || "N/A" },
                { label: "Email Verified", value: userDetails.data.email_verified ? "Yes" : "No" },
                { label: "Phone Verified", value: userDetails.data.phone_verified ? "Yes" : "No" },
                {
                  label: "Registered",
                  value: userDetails.data.created_at
                    ? new Date(userDetails.data.created_at).toLocaleString()
                    : "N/A",
                },
              ].map((item) => (
                <Box key={item.label}>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: isDark ? "#9ca3af" : "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: isDark ? "#e2e8f0" : "#1f2937",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: isDark ? "#9ca3af" : "#6b7280", textAlign: "center", py: 4 }}>
              Could not load user details
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`, p: 2 }}>
          {userToView && (
            <>
              <Button
                onClick={() => {
                  handleApprove(userToView);
                  setViewDialogOpen(false);
                  setUserToView(null);
                }}
                disabled={isApproving}
                sx={{
                  bgcolor: "#16a34a",
                  color: "#fff",
                  "&:hover": { bgcolor: "#15803d" },
                  fontWeight: 600,
                  fontSize: "13px",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                }}
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setUserToReject(userToView);
                  setRejectDialogOpen(true);
                  setUserToView(null);
                }}
                sx={{
                  bgcolor: "#dc2626",
                  color: "#fff",
                  "&:hover": { bgcolor: "#b91c1c" },
                  fontWeight: 600,
                  fontSize: "13px",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                }}
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setUserToReject(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            bgcolor: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px solid rgba(45,27,105,0.5)" : "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: isDark ? "#f3f4f6" : "#1f2937",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          Confirm Rejection
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
            }}
          >
            Are you sure you want to reject <strong>{userToReject?.name}</strong>'s
            registration? Their account will be locked.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setUserToReject(null);
            }}
            sx={{
              color: isDark ? "#d1d5db" : "#374151",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            disabled={isRejecting}
            sx={{
              bgcolor: "#dc2626",
              color: "#fff",
              "&:hover": { bgcolor: "#b91c1c" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
            }}
          >
            {isRejecting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PendingApproval;

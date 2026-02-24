import React, { useState, useMemo, useCallback } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
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
  Tooltip,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  DoneAll as BulkApproveIcon,
  RemoveCircleOutline as BulkRejectIcon,
} from "@mui/icons-material";
import {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useLockUserAccountMutation,
  useDeleteUserMutation,
} from "../../services/api/usersApi";
import type { UserProfile } from "../../services/api/profileApi";
import { useTheme } from "../../context/ThemeContext";
import SuspendUserModal from "../../components/SuspendUserModal";
import EscalateUserModal from "../../components/EscalateUserModal";
import toast from "react-hot-toast";

interface PendingUser {
  index: number;
  id: number;
  userId: string;
  name: string;
  email: string;
  role: string;
  roleType: string;
  requestDate: string;
}

type RoleFilter = "all" | "student" | "employer";

const PendingApproval: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down("md"));

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // State
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkApproveDialogOpen, setBulkApproveDialogOpen] = useState(false);
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [userToView, setUserToView] = useState<PendingUser | null>(null);
  const [userToReject, setUserToReject] = useState<PendingUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<PendingUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selectedUsers, setSelectedUsers] = useState<PendingUser[]>([]);

  // Suspend & Escalate modal state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [suspendUser, setSuspendUser] = useState<{
    userId: string;
    name: string;
    email: string;
  } | null>(null);
  const [escalateUser, setEscalateUser] = useState<{
    userId: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // API Hooks
  const {
    data: usersData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAllUsersQuery({
    page: 1,
    limit: 100, // Fetch more to filter client-side for unverified
  });

  const [updateUser, { isLoading: isApproving }] =
    useUpdateUserByIdMutation();
  const [lockUser, { isLoading: isRejecting }] =
    useLockUserAccountMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  const { data: userDetails, isLoading: isLoadingDetails } =
    useGetUserByIdQuery(userToView?.userId || "", { skip: !userToView });

  // Filter for users with email_verified === false
  const allUsers: UserProfile[] = usersData?.data || [];
  const pendingUsers = allUsers.filter((u) => u.email_verified === false);

  const mapUser = useCallback(
    (user: UserProfile, index: number): PendingUser => {
      const rawRoleType =
        user.role?.roleType || user.role?.roleName || "Unknown";
      return {
        index: index + 1,
        id: Number(user.user_id),
        userId: user.user_id,
        name: user.full_name || "N/A",
        email: user.email,
        role: rawRoleType.charAt(0).toUpperCase() + rawRoleType.slice(1),
        roleType: rawRoleType.toLowerCase(),
        requestDate: user.created_at
          ? new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "-",
      };
    },
    []
  );

  // Apply role filter
  const filteredPendingUsers = useMemo(() => {
    if (roleFilter === "all") return pendingUsers;
    return pendingUsers.filter(
      (u) => (u.role?.roleType || "").toLowerCase() === roleFilter
    );
  }, [pendingUsers, roleFilter]);

  const users: PendingUser[] = useMemo(
    () => filteredPendingUsers.map((u, i) => mapUser(u, i)),
    [filteredPendingUsers, mapUser]
  );

  const totalPending = pendingUsers.length;
  const studentsPending = pendingUsers.filter(
    (u) => (u.role?.roleType || "").toLowerCase() === "student"
  ).length;
  const employersPending = pendingUsers.filter(
    (u) => (u.role?.roleType || "").toLowerCase() === "employer"
  ).length;

  // ── Actions ──────────────────────────────────

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
    const reason = rejectReason.trim() || "Registration rejected by admin";
    try {
      await lockUser({
        userId: userToReject.userId,
        reason,
        duration: "permanent",
      }).unwrap();
      toast.success(`${userToReject.name} has been rejected`);
      setRejectDialogOpen(false);
      setUserToReject(null);
      setRejectReason("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject user");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation(userToDelete.userId).unwrap();
      toast.success(`${userToDelete.name} has been permanently deleted`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    let successCount = 0;
    let failCount = 0;
    for (const user of selectedUsers) {
      try {
        await updateUser({
          id: user.userId,
          data: { email_verified: true } as any,
        }).unwrap();
        successCount++;
      } catch {
        failCount++;
      }
    }
    if (successCount > 0)
      toast.success(`${successCount} user(s) approved successfully`);
    if (failCount > 0) toast.error(`${failCount} user(s) failed to approve`);
    setBulkApproveDialogOpen(false);
    setSelectedUsers([]);
  };

  const handleBulkReject = async () => {
    let successCount = 0;
    let failCount = 0;
    for (const user of selectedUsers) {
      try {
        await lockUser({
          userId: user.userId,
          reason: "Bulk rejection by admin",
          duration: "permanent",
        }).unwrap();
        successCount++;
      } catch {
        failCount++;
      }
    }
    if (successCount > 0)
      toast.success(`${successCount} user(s) rejected successfully`);
    if (failCount > 0) toast.error(`${failCount} user(s) failed to reject`);
    setBulkRejectDialogOpen(false);
    setSelectedUsers([]);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Refreshing pending approvals...");
  };

  // ── Table Config ──────────────────────────────

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 0.75 : 1,
          }}
        >
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
            bgcolor:
              value === "Student"
                ? isDark
                  ? "rgba(59,130,246,0.15)"
                  : "#dbeafe"
                : isDark
                ? "rgba(22,163,74,0.15)"
                : "#d1fae5",
            color:
              value === "Student"
                ? isDark
                  ? "#60a5fa"
                  : "#1e40af"
                : isDark
                ? "#4ade80"
                : "#065f46",
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
    {
      label: "Suspend",
      icon: <LockIcon fontSize="small" />,
      onClick: (row) => {
        setSuspendUser({
          userId: row.userId,
          name: row.name,
          email: row.email,
        });
        setSuspendModalOpen(true);
      },
      color: "warning",
    },
    {
      label: "Escalate",
      icon: <FlagIcon fontSize="small" />,
      onClick: (row) => {
        setEscalateUser({
          userId: row.userId,
          name: row.name,
          email: row.email,
          role: row.role,
        });
        setEscalateModalOpen(true);
      },
      color: "error",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => {
        setUserToDelete(row);
        setDeleteDialogOpen(true);
      },
      color: "error",
    },
  ];

  // ── Role filter tab style ──────────────────

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: isMobile ? "6px 12px" : "7px 16px",
    borderRadius: "8px",
    border: "none",
    fontSize: isMobile ? "11px" : "12px",
    fontWeight: 600,
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: active
      ? isDark
        ? "#7F56D9"
        : "#7F56D9"
      : isDark
      ? "rgba(45,27,105,0.2)"
      : "#f3f4f6",
    color: active ? "#ffffff" : isDark ? "#d1d5db" : "#374151",
  });

  // ── Shared dialog input style ──────────────

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1.5px solid ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
    fontSize: "14px",
    fontFamily: "'Nunito', sans-serif",
    outline: "none",
    backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
    color: isDark ? "#e2e8f0" : "#1f2937",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s ease",
  };

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
            Review and manage users awaiting approval
          </p>
        </div>
        <Tooltip title="Refresh data">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
              backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
              color: isDark ? "#d1d5db" : "#374151",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "'Nunito', sans-serif",
              cursor: isFetching ? "not-allowed" : "pointer",
              opacity: isFetching ? 0.6 : 1,
              transition: "all 0.2s",
            }}
            aria-label="Refresh pending users"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {!isMobile && "Refresh"}
          </button>
        </Tooltip>
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
            {totalPending} user{totalPending !== 1 ? "s" : ""} waiting for
            approval
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
            {isLoading ? "..." : totalPending}
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
            {isLoading ? "..." : studentsPending}
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
            {isLoading ? "..." : employersPending}
          </p>
        </div>
      </div>

      {/* Role Filter Tabs + Bulk Actions */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setRoleFilter("all")}
            style={tabStyle(roleFilter === "all")}
          >
            All ({totalPending})
          </button>
          <button
            onClick={() => setRoleFilter("student")}
            style={tabStyle(roleFilter === "student")}
          >
            Students ({studentsPending})
          </button>
          <button
            onClick={() => setRoleFilter("employer")}
            style={tabStyle(roleFilter === "employer")}
          >
            Employers ({employersPending})
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: isDark ? "#c084fc" : "#7F56D9",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {selectedUsers.length} selected
            </span>
            <Tooltip title="Bulk approve selected users">
              <button
                onClick={() => setBulkApproveDialogOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: "pointer",
                }}
              >
                <BulkApproveIcon sx={{ fontSize: 14 }} />
                Approve All
              </button>
            </Tooltip>
            <Tooltip title="Bulk reject selected users">
              <button
                onClick={() => setBulkRejectDialogOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: "pointer",
                }}
              >
                <BulkRejectIcon sx={{ fontSize: 14 }} />
                Reject All
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={users}
        actions={actions}
        loading={isLoading}
        selectable={true}
        onSelectionChange={(selected) => setSelectedUsers(selected)}
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
        defaultRowsPerPage={10}
        serverSidePagination={false}
      />

      {/* ── View User Dialog ────────────────── */}
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
            border: isDark ? "1px solid rgba(45,27,105,0.5)" : "none",
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
            <EyeIcon
              className="h-5 w-5"
              style={{ color: isDark ? "#fb923c" : "#ea580c" }}
            />
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                py: 1,
              }}
            >
              {[
                { label: "Full Name", value: userDetails.data.full_name },
                { label: "Email", value: userDetails.data.email },
                {
                  label: "Phone",
                  value: userDetails.data.mobile_number || "N/A",
                },
                {
                  label: "Role",
                  value: userDetails.data.role?.roleType || "N/A",
                },
                {
                  label: "Email Verified",
                  value: userDetails.data.email_verified ? "Yes" : "No",
                },
                {
                  label: "Phone Verified",
                  value: userDetails.data.phone_verified ? "Yes" : "No",
                },
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
            <Typography
              sx={{
                color: isDark ? "#9ca3af" : "#6b7280",
                textAlign: "center",
                py: 4,
              }}
            >
              Could not load user details
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
            p: 2,
            gap: 1,
          }}
        >
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

      {/* ── Reject Confirmation Dialog (with custom reason) ────── */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setUserToReject(null);
          setRejectReason("");
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
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <RejectIcon sx={{ color: "#dc2626", fontSize: 20 }} />
          Confirm Rejection
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
              mb: 2,
            }}
          >
            Are you sure you want to reject{" "}
            <strong>{userToReject?.name}</strong>'s registration? Their account
            will be locked.
          </Typography>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: isDark ? "#d1d5db" : "#374151",
                fontFamily: "'Nunito', sans-serif",
                marginBottom: "6px",
              }}
            >
              Rejection Reason (optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              aria-label="Rejection reason"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setUserToReject(null);
              setRejectReason("");
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
            {isRejecting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
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
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DeleteIcon sx={{ color: "#dc2626", fontSize: 20 }} />
          Delete User Permanently
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
            }}
          >
            Are you sure you want to <strong>permanently delete</strong>{" "}
            <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setUserToDelete(null);
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
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
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
            {isDeleting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Delete Permanently"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Bulk Approve Confirmation Dialog ────── */}
      <Dialog
        open={bulkApproveDialogOpen}
        onClose={() => setBulkApproveDialogOpen(false)}
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
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <BulkApproveIcon sx={{ color: "#16a34a", fontSize: 20 }} />
          Bulk Approve Users
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: "14px", color: isDark ? "#d1d5db" : "#374151" }}
          >
            Are you sure you want to approve{" "}
            <strong>{selectedUsers.length}</strong> selected user
            {selectedUsers.length !== 1 ? "s" : ""}?
          </Typography>
          <Box
            sx={{
              mt: 1.5,
              maxHeight: 150,
              overflowY: "auto",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}`,
              p: 1,
            }}
          >
            {selectedUsers.map((u) => (
              <Typography
                key={u.userId}
                sx={{
                  fontSize: "12px",
                  color: isDark ? "#d1d5db" : "#374151",
                  py: 0.3,
                }}
              >
                {u.name} ({u.email})
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setBulkApproveDialogOpen(false)}
            sx={{
              color: isDark ? "#d1d5db" : "#374151",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkApprove}
            disabled={isApproving}
            sx={{
              bgcolor: "#16a34a",
              color: "#fff",
              "&:hover": { bgcolor: "#15803d" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
            }}
          >
            {isApproving ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              `Approve ${selectedUsers.length} Users`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Bulk Reject Confirmation Dialog ────── */}
      <Dialog
        open={bulkRejectDialogOpen}
        onClose={() => setBulkRejectDialogOpen(false)}
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
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <BulkRejectIcon sx={{ color: "#dc2626", fontSize: 20 }} />
          Bulk Reject Users
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: "14px", color: isDark ? "#d1d5db" : "#374151" }}
          >
            Are you sure you want to reject{" "}
            <strong>{selectedUsers.length}</strong> selected user
            {selectedUsers.length !== 1 ? "s" : ""}? Their accounts will be
            locked.
          </Typography>
          <Box
            sx={{
              mt: 1.5,
              maxHeight: 150,
              overflowY: "auto",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}`,
              p: 1,
            }}
          >
            {selectedUsers.map((u) => (
              <Typography
                key={u.userId}
                sx={{
                  fontSize: "12px",
                  color: isDark ? "#d1d5db" : "#374151",
                  py: 0.3,
                }}
              >
                {u.name} ({u.email})
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setBulkRejectDialogOpen(false)}
            sx={{
              color: isDark ? "#d1d5db" : "#374151",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkReject}
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
            {isRejecting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              `Reject ${selectedUsers.length} Users`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Suspend User Modal ────── */}
      <SuspendUserModal
        isOpen={suspendModalOpen}
        onClose={() => {
          setSuspendModalOpen(false);
          setSuspendUser(null);
        }}
        user={suspendUser}
        onSuccess={() => refetch()}
      />

      {/* ── Escalate User Modal ────── */}
      <EscalateUserModal
        isOpen={escalateModalOpen}
        onClose={() => {
          setEscalateModalOpen(false);
          setEscalateUser(null);
        }}
        user={escalateUser}
      />
    </div>
  );
};

export default PendingApproval;

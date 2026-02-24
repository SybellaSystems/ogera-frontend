import React, { useState, useMemo } from "react";
import {
  ShieldExclamationIcon,
  LockOpenIcon,
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
  LockOpen as UnlockIcon,
  Gavel as BanIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  Lock as ExtendIcon,
  DoneAll as BulkReinstateIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  useGetLockedAccountsQuery,
  useUnlockUserAccountMutation,
  useLockUserAccountMutation,
  useDeleteUserMutation,
} from "../../services/api/usersApi";
import type { LockedAccount } from "../../services/api/usersApi";
import { useTheme } from "../../context/ThemeContext";
import EscalateUserModal from "../../components/EscalateUserModal";
import {
  logUserManagementEvent,
  USER_ACTIONS,
} from "../../utils/userManagementAudit";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

interface SuspendedRow {
  index: number;
  id: string;
  name: string;
  email: string;
  role: string;
  roleLower: string;
  reason: string;
  lockedDate: string;
  duration: string;
  lockedBy: string;
}

type RoleFilter = "all" | "student" | "employer";

const DURATION_OPTIONS = [
  { value: "1 day", label: "1 Day" },
  { value: "3 days", label: "3 Days" },
  { value: "7 days", label: "7 Days" },
  { value: "14 days", label: "14 Days" },
  { value: "30 days", label: "30 Days" },
  { value: "90 days", label: "90 Days" },
  { value: "permanent", label: "Permanent" },
];

const Suspended: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const currentUser = useSelector((state: any) => state.auth.user);
  const adminName =
    currentUser?.full_name || currentUser?.email || "Admin";

  // Pagination
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // Existing dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reinstateDialogOpen, setReinstateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuspendedRow | null>(null);
  const [reinstateReason, setReinstateReason] = useState("");

  // Ban dialog
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [userToBan, setUserToBan] = useState<SuspendedRow | null>(null);
  const [banReason, setBanReason] = useState("");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SuspendedRow | null>(null);

  // Extend suspension dialog
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [userToExtend, setUserToExtend] = useState<SuspendedRow | null>(null);
  const [extendReason, setExtendReason] = useState("");
  const [extendDuration, setExtendDuration] = useState("7 days");

  // Escalate modal
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateUser, setEscalateUser] = useState<{
    userId: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Role filter
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  // Bulk reinstate
  const [selectedRows, setSelectedRows] = useState<SuspendedRow[]>([]);
  const [bulkReinstateDialogOpen, setBulkReinstateDialogOpen] = useState(false);

  // ── API Hooks ──────────────────────────────

  const { data, isLoading, isError, refetch, isFetching } =
    useGetLockedAccountsQuery({ page: page + 1, limit });

  const [unlockAccount, { isLoading: isUnlocking }] =
    useUnlockUserAccountMutation();
  const [lockAccount, { isLoading: isLocking }] =
    useLockUserAccountMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  const lockedAccounts: LockedAccount[] = data?.data || [];
  const pagination = data?.pagination;
  const totalCount = pagination?.total || 0;

  // ── Row mapping ──────────────────────────────

  const mapRow = (account: LockedAccount, index: number): SuspendedRow => ({
    index: page * limit + index + 1,
    id: account.id,
    name: account.name || "N/A",
    email: account.email,
    role: account.role
      ? account.role.charAt(0).toUpperCase() + account.role.slice(1)
      : "Unknown",
    roleLower: (account.role || "").toLowerCase(),
    reason: account.reason || "No reason provided",
    lockedDate: account.lockedDate
      ? new Date(account.lockedDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "-",
    duration: account.duration || "N/A",
    lockedBy: account.lockedBy || "System",
  });

  const allRows: SuspendedRow[] = lockedAccounts.map((a, i) => mapRow(a, i));

  // Client-side role filter
  const rows = useMemo(() => {
    if (roleFilter === "all") return allRows;
    return allRows.filter((r) => r.roleLower === roleFilter);
  }, [allRows, roleFilter]);

  // Stats
  const studentCount = allRows.filter((r) => r.roleLower === "student").length;
  const employerCount = allRows.filter(
    (r) => r.roleLower === "employer"
  ).length;
  const permanentCount = allRows.filter(
    (r) => r.duration.toLowerCase() === "permanent"
  ).length;

  // ── Action Handlers ──────────────────────────

  const handleReinstate = async () => {
    if (!selectedUser) return;
    const userInfo = { userId: selectedUser.id, userName: selectedUser.name, userEmail: selectedUser.email };
    try {
      await unlockAccount(selectedUser.id).unwrap();
      logUserManagementEvent(USER_ACTIONS.USER_REINSTATED, "success", userInfo, adminName, reinstateReason || undefined);
      toast.success(`${selectedUser.name}'s account has been reinstated`);
      setReinstateDialogOpen(false);
      setSelectedUser(null);
      setReinstateReason("");
      refetch();
    } catch (error: any) {
      logUserManagementEvent(USER_ACTIONS.USER_REINSTATED, "failure", userInfo, adminName, reinstateReason || undefined);
      toast.error(error?.data?.message || "Failed to reinstate user");
    }
  };

  const handleBan = async () => {
    if (!userToBan || !banReason.trim()) return;
    const userInfo = { userId: userToBan.id, userName: userToBan.name, userEmail: userToBan.email };
    try {
      await lockAccount({
        userId: userToBan.id,
        reason: `[PERMANENT BAN] ${banReason.trim()}`,
        duration: "permanent",
      }).unwrap();
      logUserManagementEvent(USER_ACTIONS.USER_BANNED, "success", userInfo, adminName, banReason.trim());
      toast.success(`${userToBan.name} has been permanently banned`);
      setBanDialogOpen(false);
      setUserToBan(null);
      setBanReason("");
      refetch();
    } catch (error: any) {
      logUserManagementEvent(USER_ACTIONS.USER_BANNED, "failure", userInfo, adminName, banReason.trim());
      toast.error(error?.data?.message || "Failed to ban user");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    const userInfo = { userId: userToDelete.id, userName: userToDelete.name, userEmail: userToDelete.email };
    try {
      await deleteUserMutation(userToDelete.id).unwrap();
      logUserManagementEvent(USER_ACTIONS.USER_DELETED, "success", userInfo, adminName);
      toast.success(`${userToDelete.name} has been permanently deleted`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      refetch();
    } catch (error: any) {
      logUserManagementEvent(USER_ACTIONS.USER_DELETED, "failure", userInfo, adminName);
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const handleExtendSuspension = async () => {
    if (!userToExtend || !extendReason.trim()) return;
    const userInfo = { userId: userToExtend.id, userName: userToExtend.name, userEmail: userToExtend.email };
    try {
      await lockAccount({
        userId: userToExtend.id,
        reason: extendReason.trim(),
        duration: extendDuration,
      }).unwrap();
      logUserManagementEvent(USER_ACTIONS.USER_SUSPENSION_EXTENDED, "success", userInfo, adminName, extendReason.trim(), { duration: extendDuration });
      toast.success(
        `${userToExtend.name}'s suspension has been extended (${extendDuration})`
      );
      setExtendDialogOpen(false);
      setUserToExtend(null);
      setExtendReason("");
      setExtendDuration("7 days");
      refetch();
    } catch (error: any) {
      logUserManagementEvent(USER_ACTIONS.USER_SUSPENSION_EXTENDED, "failure", userInfo, adminName, extendReason.trim(), { duration: extendDuration });
      toast.error(error?.data?.message || "Failed to extend suspension");
    }
  };

  const handleBulkReinstate = async () => {
    let successCount = 0;
    let failCount = 0;
    for (const user of selectedRows) {
      const userInfo = { userId: user.id, userName: user.name, userEmail: user.email };
      try {
        await unlockAccount(user.id).unwrap();
        logUserManagementEvent(USER_ACTIONS.BULK_REINSTATE, "success", userInfo, adminName);
        successCount++;
      } catch {
        logUserManagementEvent(USER_ACTIONS.BULK_REINSTATE, "failure", userInfo, adminName);
        failCount++;
      }
    }
    if (successCount > 0)
      toast.success(`${successCount} user(s) reinstated successfully`);
    if (failCount > 0)
      toast.error(`${failCount} user(s) failed to reinstate`);
    setBulkReinstateDialogOpen(false);
    setSelectedRows([]);
    refetch();
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Refreshing suspended accounts...");
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "N/A";
    return dateString;
  };

  // ── Table Config ──────────────────────────────

  const columns: Column<SuspendedRow>[] = [
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
      minWidth: isMobile ? 120 : 180,
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
              bgcolor: "#ef4444",
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
            id: "email" as keyof SuspendedRow,
            label: "Email",
            minWidth: 170,
          },
        ]
      : []),
    {
      id: "reason",
      label: "Reason",
      minWidth: isMobile ? 100 : 180,
      format: (value) => (
        <Typography
          sx={{
            fontSize: isMobile ? "0.7rem" : "0.8rem",
            color: isDark ? "#fca5a5" : "#dc2626",
            fontWeight: 500,
          }}
        >
          {value}
        </Typography>
      ),
    },
    ...(!isMobile
      ? [
          {
            id: "duration" as keyof SuspendedRow,
            label: "Duration",
            minWidth: 100,
            format: (value: any) => (
              <Chip
                label={value}
                size="small"
                sx={{
                  bgcolor:
                    value?.toLowerCase() === "permanent"
                      ? isDark
                        ? "rgba(220,38,38,0.15)"
                        : "#fef2f2"
                      : isDark
                      ? "rgba(245,158,11,0.15)"
                      : "#fef3c7",
                  color:
                    value?.toLowerCase() === "permanent"
                      ? isDark
                        ? "#fca5a5"
                        : "#dc2626"
                      : isDark
                      ? "#fbbf24"
                      : "#92400e",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />
            ),
          },
          {
            id: "lockedDate" as keyof SuspendedRow,
            label: "Suspended",
            minWidth: 100,
          },
        ]
      : []),
  ];

  const actions: TableAction<SuspendedRow>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        setSelectedUser(row);
        setViewDialogOpen(true);
      },
      color: "primary",
    },
    {
      label: "Reinstate",
      icon: <UnlockIcon fontSize="small" />,
      onClick: (row) => {
        setSelectedUser(row);
        setReinstateDialogOpen(true);
      },
      color: "success",
    },
    {
      label: "Ban",
      icon: <BanIcon fontSize="small" />,
      onClick: (row) => {
        setUserToBan(row);
        setBanDialogOpen(true);
      },
      color: "error",
    },
    {
      label: "Escalate",
      icon: <FlagIcon fontSize="small" />,
      onClick: (row) => {
        setEscalateUser({
          userId: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
        });
        setEscalateModalOpen(true);
      },
      color: "warning",
    },
    {
      label: "Extend",
      icon: <ExtendIcon fontSize="small" />,
      onClick: (row) => {
        setUserToExtend(row);
        setExtendDialogOpen(true);
      },
      color: "warning",
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

  // ── Styles ──────────────────────────────

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
      ? "#7F56D9"
      : isDark
      ? "rgba(45,27,105,0.2)"
      : "#f3f4f6",
    color: active ? "#ffffff" : isDark ? "#d1d5db" : "#374151",
  });

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

  const dialogPaperSx = {
    borderRadius: "12px",
    bgcolor: isDark ? "#1e1833" : "#ffffff",
    border: isDark ? "1px solid rgba(45,27,105,0.5)" : "none",
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
            <ShieldExclamationIcon
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0"
              style={{ color: isDark ? "#f87171" : "#dc2626" }}
            />
            <span>Suspended Users</span>
          </h1>
          <p
            className="text-[10px] sm:text-xs mt-0.5"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Manage suspended accounts — reinstate, ban, escalate, or extend
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
            aria-label="Refresh suspended users"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {!isMobile && "Refresh"}
          </button>
        </Tooltip>
      </div>

      {/* Alert Banner */}
      {totalCount > 0 && (
        <div
          role="alert"
          style={{
            backgroundColor: isDark ? "rgba(220,38,38,0.12)" : "#fef2f2",
            border: `1px solid ${isDark ? "rgba(220,38,38,0.3)" : "#fecaca"}`,
            borderRadius: "8px",
            padding: "10px 14px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: isDark ? "#fca5a5" : "#991b1b",
              fontFamily: "'Nunito', sans-serif",
              margin: 0,
            }}
          >
            {totalCount} account{totalCount !== 1 ? "s" : ""} currently
            suspended
            {permanentCount > 0 &&
              ` (${permanentCount} permanent ban${permanentCount !== 1 ? "s" : ""})`}
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
        <div
          style={{
            backgroundColor: isDark ? "rgba(220,38,38,0.1)" : "#fef2f2",
            border: `1px solid ${isDark ? "rgba(220,38,38,0.25)" : "#fecaca"}`,
            borderRadius: "10px",
            padding: isMobile ? "8px 10px" : "12px 16px",
          }}
        >
          <p
            style={{
              fontSize: isMobile ? "10px" : "11px",
              fontWeight: 600,
              color: isDark ? "#fca5a5" : "#991b1b",
              margin: 0,
            }}
          >
            Total Suspended
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#f87171" : "#7f1d1d",
              margin: "4px 0 0",
            }}
          >
            {isLoading ? "..." : totalCount}
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
            {isLoading ? "..." : studentCount}
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
            {isLoading ? "..." : employerCount}
          </p>
        </div>
        <div
          style={{
            backgroundColor: isDark ? "rgba(127,86,217,0.1)" : "#faf5ff",
            border: `1px solid ${isDark ? "rgba(127,86,217,0.25)" : "#e9d5ff"}`,
            borderRadius: "10px",
            padding: isMobile ? "8px 10px" : "12px 16px",
          }}
        >
          <p
            style={{
              fontSize: isMobile ? "10px" : "11px",
              fontWeight: 600,
              color: isDark ? "#c084fc" : "#6b21a8",
              margin: 0,
            }}
          >
            Permanent Bans
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#d8b4fe" : "#581c87",
              margin: "4px 0 0",
            }}
          >
            {isLoading ? "..." : permanentCount}
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
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setRoleFilter("all")}
            style={tabStyle(roleFilter === "all")}
          >
            All ({allRows.length})
          </button>
          <button
            onClick={() => setRoleFilter("student")}
            style={tabStyle(roleFilter === "student")}
          >
            Students ({studentCount})
          </button>
          <button
            onClick={() => setRoleFilter("employer")}
            style={tabStyle(roleFilter === "employer")}
          >
            Employers ({employerCount})
          </button>
        </div>

        {selectedRows.length > 0 && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: isDark ? "#c084fc" : "#7F56D9",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {selectedRows.length} selected
            </span>
            <Tooltip title="Bulk reinstate selected users">
              <button
                onClick={() => setBulkReinstateDialogOpen(true)}
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
                <BulkReinstateIcon sx={{ fontSize: 14 }} />
                Reinstate All
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={rows}
        actions={actions}
        loading={isLoading}
        selectable={true}
        onSelectionChange={(selected) => setSelectedRows(selected)}
        emptyMessage={
          isError
            ? "Failed to load suspended accounts. Please try again."
            : totalCount === 0
            ? "No suspended accounts"
            : "No accounts found"
        }
        searchable={true}
        searchPlaceholder="Search suspended users..."
        rowsPerPageOptions={[5, 10, 25]}
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

      {/* ═══════════════════════════════════════════ */}
      {/* ══ DIALOGS ══════════════════════════════ */}
      {/* ═══════════════════════════════════════════ */}

      {/* ── View Details Dialog ────────────────── */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedUser(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: isDark ? "#f3f4f6" : "#1f2937",
            fontWeight: 700,
            fontSize: "16px",
            borderBottom: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShieldExclamationIcon
              className="h-5 w-5"
              style={{ color: isDark ? "#f87171" : "#dc2626" }}
            />
            Suspension Details
          </Box>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setSelectedUser(null);
            }}
            sx={{ minWidth: "auto", color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}
            >
              {[
                { label: "Name", value: selectedUser.name },
                { label: "Email", value: selectedUser.email },
                { label: "Role", value: selectedUser.role },
                { label: "Reason", value: selectedUser.reason },
                { label: "Duration", value: selectedUser.duration },
                {
                  label: "Suspended Date",
                  value: formatDate(selectedUser.lockedDate),
                },
                { label: "Suspended By", value: selectedUser.lockedBy },
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
                      color:
                        item.label === "Reason"
                          ? isDark
                            ? "#fca5a5"
                            : "#dc2626"
                          : isDark
                          ? "#e2e8f0"
                          : "#1f2937",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
            p: 2,
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {selectedUser && (
            <>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setReinstateDialogOpen(true);
                }}
                sx={{
                  bgcolor: "#16a34a",
                  color: "#fff",
                  "&:hover": { bgcolor: "#15803d" },
                  fontWeight: 600,
                  fontSize: "12px",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2,
                }}
              >
                <LockOpenIcon className="h-4 w-4 mr-1" />
                Reinstate
              </Button>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setUserToBan(selectedUser);
                  setBanDialogOpen(true);
                }}
                sx={{
                  bgcolor: "#dc2626",
                  color: "#fff",
                  "&:hover": { bgcolor: "#b91c1c" },
                  fontWeight: 600,
                  fontSize: "12px",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2,
                }}
              >
                <BanIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Ban
              </Button>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setEscalateUser({
                    userId: selectedUser.id,
                    name: selectedUser.name,
                    email: selectedUser.email,
                    role: selectedUser.role,
                  });
                  setEscalateModalOpen(true);
                }}
                sx={{
                  bgcolor: "#ea580c",
                  color: "#fff",
                  "&:hover": { bgcolor: "#c2410c" },
                  fontWeight: 600,
                  fontSize: "12px",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2,
                }}
              >
                <FlagIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Escalate
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Reinstate Confirmation Dialog ────────────── */}
      <Dialog
        open={reinstateDialogOpen}
        onClose={() => {
          setReinstateDialogOpen(false);
          setSelectedUser(null);
          setReinstateReason("");
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
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
          <UnlockIcon sx={{ color: "#16a34a", fontSize: 20 }} />
          Reinstate User
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
              mb: 2,
            }}
          >
            Are you sure you want to reinstate{" "}
            <strong>{selectedUser?.name}</strong>? They will regain full access
            to the platform.
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
              Reinstatement Note (optional)
            </label>
            <textarea
              value={reinstateReason}
              onChange={(e) => setReinstateReason(e.target.value)}
              placeholder="Add a note about why this user is being reinstated..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              aria-label="Reinstatement note"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setReinstateDialogOpen(false);
              setSelectedUser(null);
              setReinstateReason("");
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
            onClick={handleReinstate}
            disabled={isUnlocking}
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
            {isUnlocking ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Reinstate"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Ban Confirmation Dialog ────────────── */}
      <Dialog
        open={banDialogOpen}
        onClose={() => {
          setBanDialogOpen(false);
          setUserToBan(null);
          setBanReason("");
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
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
          <BanIcon sx={{ color: "#dc2626", fontSize: 20 }} />
          Permanently Ban User
        </DialogTitle>
        <DialogContent>
          {/* Warning Banner */}
          <div
            style={{
              backgroundColor: isDark ? "rgba(220,38,38,0.12)" : "#fef2f2",
              border: `1px solid ${isDark ? "rgba(220,38,38,0.3)" : "#fecaca"}`,
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: isDark ? "#fca5a5" : "#991b1b",
                fontFamily: "'Nunito', sans-serif",
                margin: 0,
              }}
            >
              This will permanently ban {userToBan?.name}. The account will be
              locked indefinitely and cannot be automatically reinstated.
            </p>
          </div>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
              mb: 2,
            }}
          >
            Banning <strong>{userToBan?.name}</strong> ({userToBan?.email})
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
              Ban Reason *
            </label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Provide a reason for this permanent ban..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              aria-required="true"
              aria-label="Ban reason"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setBanDialogOpen(false);
              setUserToBan(null);
              setBanReason("");
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
            onClick={handleBan}
            disabled={isLocking || !banReason.trim()}
            sx={{
              bgcolor: "#dc2626",
              color: "#fff",
              "&:hover": { bgcolor: "#b91c1c" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              opacity: !banReason.trim() ? 0.6 : 1,
            }}
          >
            {isLocking ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Ban Permanently"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
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
          <div
            style={{
              backgroundColor: isDark ? "rgba(220,38,38,0.12)" : "#fef2f2",
              border: `1px solid ${isDark ? "rgba(220,38,38,0.3)" : "#fecaca"}`,
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: isDark ? "#fca5a5" : "#991b1b",
                fontFamily: "'Nunito', sans-serif",
                margin: 0,
              }}
            >
              This action is irreversible. The user and all associated data will
              be permanently removed.
            </p>
          </div>
          <Typography
            sx={{ fontSize: "14px", color: isDark ? "#d1d5db" : "#374151" }}
          >
            Are you sure you want to <strong>permanently delete</strong>{" "}
            <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
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
            onClick={handleDelete}
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

      {/* ── Extend Suspension Dialog ────────────── */}
      <Dialog
        open={extendDialogOpen}
        onClose={() => {
          setExtendDialogOpen(false);
          setUserToExtend(null);
          setExtendReason("");
          setExtendDuration("7 days");
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
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
          <ExtendIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
          Extend Suspension
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
              mb: 2,
            }}
          >
            Extending suspension for <strong>{userToExtend?.name}</strong> (
            {userToExtend?.email})
          </Typography>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
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
                New Reason *
              </label>
              <textarea
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                placeholder="Provide a reason for extending the suspension..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
                aria-required="true"
                aria-label="Extension reason"
              />
            </div>
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
                New Duration
              </label>
              <select
                value={extendDuration}
                onChange={(e) => setExtendDuration(e.target.value)}
                style={inputStyle}
                aria-label="Suspension duration"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setExtendDialogOpen(false);
              setUserToExtend(null);
              setExtendReason("");
              setExtendDuration("7 days");
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
            onClick={handleExtendSuspension}
            disabled={isLocking || !extendReason.trim()}
            sx={{
              bgcolor: "#f59e0b",
              color: "#fff",
              "&:hover": { bgcolor: "#d97706" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              opacity: !extendReason.trim() ? 0.6 : 1,
            }}
          >
            {isLocking ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Extend Suspension"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Bulk Reinstate Confirmation Dialog ────────── */}
      <Dialog
        open={bulkReinstateDialogOpen}
        onClose={() => setBulkReinstateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
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
          <BulkReinstateIcon sx={{ color: "#16a34a", fontSize: 20 }} />
          Bulk Reinstate Users
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
            }}
          >
            Are you sure you want to reinstate{" "}
            <strong>{selectedRows.length}</strong> selected user
            {selectedRows.length !== 1 ? "s" : ""}? They will regain platform
            access.
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
            {selectedRows.map((u) => (
              <Typography
                key={u.id}
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
            onClick={() => setBulkReinstateDialogOpen(false)}
            sx={{
              color: isDark ? "#d1d5db" : "#374151",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkReinstate}
            disabled={isUnlocking}
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
            {isUnlocking ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              `Reinstate ${selectedRows.length} Users`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Escalate User Modal ────────────── */}
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

export default Suspended;

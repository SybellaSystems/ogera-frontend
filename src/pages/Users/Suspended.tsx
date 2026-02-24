import React, { useState } from "react";
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
} from "@mui/material";
import {
  Visibility as ViewIcon,
  LockOpen as UnlockIcon,
} from "@mui/icons-material";
import {
  useGetLockedAccountsQuery,
  useUnlockUserAccountMutation,
} from "../../services/api/usersApi";
import type { LockedAccount } from "../../services/api/usersApi";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

interface SuspendedRow {
  index: number;
  id: string;
  name: string;
  email: string;
  role: string;
  reason: string;
  lockedDate: string;
  duration: string;
  lockedBy: string;
}

const Suspended: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuspendedRow | null>(null);

  const { data, isLoading, isError, refetch } = useGetLockedAccountsQuery({
    page: page + 1,
    limit,
  });

  const [unlockAccount, { isLoading: isUnlocking }] = useUnlockUserAccountMutation();

  const lockedAccounts: LockedAccount[] = data?.data || [];
  const pagination = data?.pagination;
  const totalCount = pagination?.total || 0;

  const mapRow = (account: LockedAccount, index: number): SuspendedRow => ({
    index: page * limit + index + 1,
    id: account.id,
    name: account.name || "N/A",
    email: account.email,
    role: account.role
      ? account.role.charAt(0).toUpperCase() + account.role.slice(1)
      : "Unknown",
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

  const rows: SuspendedRow[] = lockedAccounts.map((a, i) => mapRow(a, i));

  const handleUnsuspend = async () => {
    if (!selectedUser) return;
    try {
      await unlockAccount(selectedUser.id).unwrap();
      toast.success(`${selectedUser.name}'s account has been unsuspended`);
      setUnsuspendDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to unsuspend user");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "N/A";
    return dateString;
  };

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
        <Box sx={{ display: "flex", alignItems: "center", gap: isMobile ? 0.75 : 1 }}>
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
                  bgcolor: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7",
                  color: isDark ? "#fbbf24" : "#92400e",
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
      label: "Unsuspend",
      icon: <UnlockIcon fontSize="small" />,
      onClick: (row) => {
        setSelectedUser(row);
        setUnsuspendDialogOpen(true);
      },
      color: "success",
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
            Manage suspended and locked user accounts
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
          style={{
            backgroundColor: isDark ? "rgba(45,27,105,0.4)" : "#f3f4f6",
            color: isDark ? "#d1d5db" : "#374151",
            border: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
          }}
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
          Refresh
        </button>
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
            {totalCount} account{totalCount !== 1 ? "s" : ""} currently suspended
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">
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
            {isLoading ? "…" : totalCount}
          </p>
        </div>
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
            This Page
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#fdba74" : "#7c2d12",
              margin: "4px 0 0",
            }}
          >
            {isLoading ? "…" : rows.length}
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
            Total Pages
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#93bbfd" : "#1e3a5f",
              margin: "4px 0 0",
            }}
          >
            {isLoading ? "…" : pagination?.totalPages || 1}
          </p>
        </div>
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={rows}
        actions={actions}
        loading={isLoading}
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

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedUser(null);
        }}
        maxWidth="sm"
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
            borderBottom: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
          }}
        >
          Suspension Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
              {[
                { label: "Name", value: selectedUser.name },
                { label: "Email", value: selectedUser.email },
                { label: "Role", value: selectedUser.role },
                { label: "Reason", value: selectedUser.reason },
                { label: "Duration", value: selectedUser.duration },
                { label: "Suspended Date", value: formatDate(selectedUser.lockedDate) },
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
        <DialogActions sx={{ borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`, p: 2 }}>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setSelectedUser((prev) => {
                if (prev) {
                  setUnsuspendDialogOpen(true);
                }
                return prev;
              });
            }}
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
            <LockOpenIcon className="h-4 w-4 mr-1" />
            Unsuspend
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unsuspend Confirmation Dialog */}
      <Dialog
        open={unsuspendDialogOpen}
        onClose={() => {
          setUnsuspendDialogOpen(false);
          setSelectedUser(null);
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
          Confirm Unsuspend
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
            }}
          >
            Are you sure you want to unsuspend <strong>{selectedUser?.name}</strong>'s
            account? They will regain access to the platform.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setUnsuspendDialogOpen(false);
              setSelectedUser(null);
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
            onClick={handleUnsuspend}
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
              "Unsuspend"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Suspended;

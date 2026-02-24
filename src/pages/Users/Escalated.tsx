import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  FlagIcon,
  CheckCircleIcon,
  XMarkIcon,
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
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as ResolveIcon,
  RemoveCircle as DismissIcon,
} from "@mui/icons-material";
import {
  getEscalations,
  resolveEscalation,
  dismissEscalation,
} from "../../utils/escalationManager";
import type { EscalatedUser, EscalationStatus, EscalationPriority } from "../../utils/escalationManager";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

interface EscalatedRow {
  index: number;
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  reason: string;
  priority: EscalationPriority;
  escalatedBy: string;
  createdAt: string;
  status: EscalationStatus;
}

const PRIORITY_COLORS: Record<EscalationPriority, { bg: string; bgDark: string; text: string; textDark: string }> = {
  low: { bg: "#dbeafe", bgDark: "rgba(59,130,246,0.2)", text: "#1e40af", textDark: "#60a5fa" },
  medium: { bg: "#fef3c7", bgDark: "rgba(245,158,11,0.2)", text: "#92400e", textDark: "#fbbf24" },
  high: { bg: "#fed7aa", bgDark: "rgba(249,115,22,0.2)", text: "#9a3412", textDark: "#fb923c" },
  critical: { bg: "#fee2e2", bgDark: "rgba(220,38,38,0.2)", text: "#991b1b", textDark: "#fca5a5" },
};

const STATUS_LABELS: Record<EscalationStatus, string> = {
  open: "Open",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const Escalated: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const currentUser = useSelector((state: any) => state.auth.user);

  const [statusFilter, setStatusFilter] = useState<EscalationStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<EscalationPriority | "all">("all");
  const [escalations, setEscalations] = useState<EscalatedUser[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<EscalatedRow | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const loadData = useCallback(() => {
    const filter: { status?: EscalationStatus; priority?: EscalationPriority } = {};
    if (statusFilter !== "all") filter.status = statusFilter;
    if (priorityFilter !== "all") filter.priority = priorityFilter;
    setEscalations(getEscalations(filter));
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mapRow = (esc: EscalatedUser, index: number): EscalatedRow => ({
    index: index + 1,
    id: esc.id,
    userId: esc.userId,
    userName: esc.userName,
    userEmail: esc.userEmail,
    userRole: esc.userRole,
    reason: esc.reason,
    priority: esc.priority,
    escalatedBy: esc.escalatedBy,
    createdAt: esc.createdAt
      ? new Date(esc.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "-",
    status: esc.status,
  });

  const rows: EscalatedRow[] = escalations.map((e, i) => mapRow(e, i));

  // Stats
  const allEscalations = getEscalations();
  const openCount = allEscalations.filter((e) => e.status === "open").length;
  const criticalCount = allEscalations.filter(
    (e) => e.status === "open" && e.priority === "critical"
  ).length;
  const highCount = allEscalations.filter(
    (e) => e.status === "open" && e.priority === "high"
  ).length;
  const resolvedCount = allEscalations.filter((e) => e.status === "resolved").length;

  const handleResolve = () => {
    if (!selectedEscalation || !resolutionNote.trim()) {
      toast.error("Please provide a resolution note");
      return;
    }
    const resolvedBy = currentUser?.full_name || currentUser?.email || "Admin";
    const success = resolveEscalation(selectedEscalation.id, resolutionNote.trim(), resolvedBy);
    if (success) {
      toast.success(`Escalation for ${selectedEscalation.userName} resolved`);
      setResolveDialogOpen(false);
      setSelectedEscalation(null);
      setResolutionNote("");
      loadData();
    } else {
      toast.error("Failed to resolve escalation");
    }
  };

  const handleDismiss = (row: EscalatedRow) => {
    const resolvedBy = currentUser?.full_name || currentUser?.email || "Admin";
    const success = dismissEscalation(row.id, resolvedBy);
    if (success) {
      toast.success(`Escalation for ${row.userName} dismissed`);
      loadData();
    } else {
      toast.error("Failed to dismiss escalation");
    }
  };

  const columns: Column<EscalatedRow>[] = [
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
      id: "userName",
      label: "User",
      minWidth: isMobile ? 120 : 160,
      format: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: isMobile ? 0.75 : 1 }}>
          <Avatar
            sx={{
              bgcolor: "#ea580c",
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
              fontSize: isMobile ? "0.65rem" : "0.75rem",
              fontWeight: 600,
            }}
          >
            {row.userName.charAt(0)}
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
                {row.userEmail}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: "priority",
      label: "Priority",
      minWidth: isMobile ? 60 : 80,
      format: (value: any) => {
        const p = value as EscalationPriority;
        const colors = PRIORITY_COLORS[p];
        return (
          <Chip
            label={p.charAt(0).toUpperCase() + p.slice(1)}
            size="small"
            sx={{
              bgcolor: isDark ? colors.bgDark : colors.bg,
              color: isDark ? colors.textDark : colors.text,
              fontWeight: 700,
              fontSize: isMobile ? "0.6rem" : "0.7rem",
              height: isMobile ? 20 : 22,
            }}
          />
        );
      },
    },
    {
      id: "reason",
      label: "Reason",
      minWidth: isMobile ? 100 : 180,
      format: (value) => (
        <Typography
          sx={{
            fontSize: isMobile ? "0.7rem" : "0.8rem",
            color: isDark ? "#d1d5db" : "#374151",
            fontWeight: 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 200,
          }}
        >
          {value}
        </Typography>
      ),
    },
    ...(!isMobile
      ? [
          {
            id: "escalatedBy" as keyof EscalatedRow,
            label: "Escalated By",
            minWidth: 120,
          },
          {
            id: "createdAt" as keyof EscalatedRow,
            label: "Date",
            minWidth: 100,
          },
          {
            id: "status" as keyof EscalatedRow,
            label: "Status",
            minWidth: 90,
            format: (value: any) => {
              const s = value as EscalationStatus;
              const statusColors = {
                open: { bg: isDark ? "rgba(234,88,12,0.15)" : "#fff7ed", color: isDark ? "#fb923c" : "#9a3412" },
                resolved: { bg: isDark ? "rgba(22,163,74,0.15)" : "#f0fdf4", color: isDark ? "#4ade80" : "#166534" },
                dismissed: { bg: isDark ? "rgba(107,114,128,0.15)" : "#f3f4f6", color: isDark ? "#9ca3af" : "#4b5563" },
              };
              const c = statusColors[s];
              return (
                <Chip
                  label={STATUS_LABELS[s]}
                  size="small"
                  sx={{
                    bgcolor: c.bg,
                    color: c.color,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
              );
            },
          },
        ]
      : []),
  ];

  const actions: TableAction<EscalatedRow>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        setSelectedEscalation(row);
        setViewDialogOpen(true);
      },
      color: "primary",
    },
    {
      label: "Resolve",
      icon: <ResolveIcon fontSize="small" />,
      onClick: (row) => {
        if (row.status !== "open") {
          toast.error("Only open escalations can be resolved");
          return;
        }
        setSelectedEscalation(row);
        setResolveDialogOpen(true);
      },
      color: "success",
    },
    {
      label: "Dismiss",
      icon: <DismissIcon fontSize="small" />,
      onClick: (row) => {
        if (row.status !== "open") {
          toast.error("Only open escalations can be dismissed");
          return;
        }
        handleDismiss(row);
      },
      color: "warning",
    },
  ];

  const filterTabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: "8px",
    border: "none",
    fontSize: "12px",
    fontWeight: active ? 700 : 500,
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: active
      ? isDark
        ? "rgba(45,27,105,0.4)"
        : "#ede9fe"
      : "transparent",
    color: active
      ? isDark
        ? "#c084fc"
        : "#7c3aed"
      : isDark
      ? "#9ca3af"
      : "#6b7280",
  });

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
            <FlagIcon
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0"
              style={{ color: isDark ? "#fb923c" : "#ea580c" }}
            />
            <span>Escalated Users</span>
          </h1>
          <p
            className="text-[10px] sm:text-xs mt-0.5"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Review flagged users and take action
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
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
            Open
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#fdba74" : "#7c2d12",
              margin: "4px 0 0",
            }}
          >
            {openCount}
          </p>
        </div>
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
            Critical
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#f87171" : "#7f1d1d",
              margin: "4px 0 0",
            }}
          >
            {criticalCount}
          </p>
        </div>
        <div
          style={{
            backgroundColor: isDark ? "rgba(249,115,22,0.1)" : "#fff7ed",
            border: `1px solid ${isDark ? "rgba(249,115,22,0.25)" : "#fdba74"}`,
            borderRadius: "10px",
            padding: isMobile ? "8px 10px" : "12px 16px",
          }}
        >
          <p
            style={{
              fontSize: isMobile ? "10px" : "11px",
              fontWeight: 600,
              color: isDark ? "#fb923c" : "#c2410c",
              margin: 0,
            }}
          >
            High
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#fdba74" : "#9a3412",
              margin: "4px 0 0",
            }}
          >
            {highCount}
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
            Resolved
          </p>
          <p
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: isDark ? "#86efac" : "#14532d",
              margin: "4px 0 0",
            }}
          >
            {resolvedCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          Status:
        </span>
        {(["all", "open", "resolved", "dismissed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={filterTabStyle(statusFilter === s)}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}

        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: isDark ? "#9ca3af" : "#6b7280",
            marginLeft: "12px",
          }}
        >
          Priority:
        </span>
        {(["all", "critical", "high", "medium", "low"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            style={filterTabStyle(priorityFilter === p)}
          >
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={rows}
        actions={actions}
        emptyMessage={
          escalations.length === 0
            ? "No escalated users"
            : "No results found"
        }
        searchable={true}
        searchPlaceholder="Search escalated users..."
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedEscalation(null);
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
          Escalation Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedEscalation && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
              {[
                { label: "User", value: selectedEscalation.userName },
                { label: "Email", value: selectedEscalation.userEmail },
                { label: "Role", value: selectedEscalation.userRole },
                {
                  label: "Priority",
                  value: selectedEscalation.priority.charAt(0).toUpperCase() + selectedEscalation.priority.slice(1),
                },
                { label: "Reason", value: selectedEscalation.reason },
                { label: "Escalated By", value: selectedEscalation.escalatedBy },
                { label: "Date", value: selectedEscalation.createdAt },
                { label: "Status", value: STATUS_LABELS[selectedEscalation.status] },
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
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`, p: 2, gap: 1 }}>
          {selectedEscalation?.status === "open" && (
            <>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setResolveDialogOpen(true);
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
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Resolve
              </Button>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  if (selectedEscalation) handleDismiss(selectedEscalation);
                }}
                sx={{
                  bgcolor: isDark ? "rgba(107,114,128,0.3)" : "#f3f4f6",
                  color: isDark ? "#d1d5db" : "#4b5563",
                  "&:hover": { bgcolor: isDark ? "rgba(107,114,128,0.5)" : "#e5e7eb" },
                  fontWeight: 600,
                  fontSize: "13px",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                }}
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => {
          setResolveDialogOpen(false);
          setSelectedEscalation(null);
          setResolutionNote("");
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
          }}
        >
          Resolve Escalation
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "14px",
              color: isDark ? "#d1d5db" : "#374151",
              mb: 2,
            }}
          >
            Resolving escalation for <strong>{selectedEscalation?.userName}</strong>.
            Please provide a resolution note.
          </Typography>
          <textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Describe the resolution..."
            rows={3}
            aria-label="Resolution note"
            aria-required="true"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              border: `1.5px solid ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
              fontSize: "14px",
              fontFamily: "'Nunito', sans-serif",
              outline: "none",
              backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
              color: isDark ? "#e2e8f0" : "#1f2937",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setResolveDialogOpen(false);
              setSelectedEscalation(null);
              setResolutionNote("");
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
            onClick={handleResolve}
            disabled={!resolutionNote.trim()}
            sx={{
              bgcolor: "#16a34a",
              color: "#fff",
              "&:hover": { bgcolor: "#15803d" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              opacity: !resolutionNote.trim() ? 0.6 : 1,
            }}
          >
            Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Escalated;

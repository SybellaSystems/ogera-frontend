import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Box,
  Typography,
  Chip,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Description as DocIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Gavel as ReviewIcon,
} from "@mui/icons-material";
import type { AcademicVerification } from "../services/api/academicVerificationApi";
import {
  getAuditLogForVerification,
  type AcademicAuditEntry,
  ACADEMIC_ACTIONS,
} from "../utils/academicVerificationAudit";
import { useTheme } from "../context/ThemeContext";

interface AcademicVerificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: AcademicVerification | null;
}

const ACTION_LABELS: Record<string, string> = {
  [ACADEMIC_ACTIONS.DOCUMENT_UPLOADED]: "Document Uploaded",
  [ACADEMIC_ACTIONS.DOCUMENT_REUPLOADED]: "Document Re-uploaded",
  [ACADEMIC_ACTIONS.VERIFICATION_APPROVED]: "Verification Approved",
  [ACADEMIC_ACTIONS.VERIFICATION_REJECTED]: "Verification Rejected",
  [ACADEMIC_ACTIONS.DOCUMENT_VIEWED]: "Document Viewed",
};

const ACTION_COLORS: Record<string, string> = {
  [ACADEMIC_ACTIONS.DOCUMENT_UPLOADED]: "#3b82f6",
  [ACADEMIC_ACTIONS.DOCUMENT_REUPLOADED]: "#8b5cf6",
  [ACADEMIC_ACTIONS.VERIFICATION_APPROVED]: "#16a34a",
  [ACADEMIC_ACTIONS.VERIFICATION_REJECTED]: "#dc2626",
  [ACADEMIC_ACTIONS.DOCUMENT_VIEWED]: "#6b7280",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  [ACADEMIC_ACTIONS.DOCUMENT_UPLOADED]: <UploadIcon sx={{ fontSize: 16 }} />,
  [ACADEMIC_ACTIONS.DOCUMENT_REUPLOADED]: <UploadIcon sx={{ fontSize: 16 }} />,
  [ACADEMIC_ACTIONS.VERIFICATION_APPROVED]: (
    <ApprovedIcon sx={{ fontSize: 16 }} />
  ),
  [ACADEMIC_ACTIONS.VERIFICATION_REJECTED]: (
    <RejectedIcon sx={{ fontSize: 16 }} />
  ),
  [ACADEMIC_ACTIONS.DOCUMENT_VIEWED]: <ViewIcon sx={{ fontSize: 16 }} />,
};

const AcademicVerificationDetailModal: React.FC<
  AcademicVerificationDetailModalProps
> = ({ isOpen, onClose, verification }) => {
  const muiTheme = useMuiTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!verification) return null;

  const auditEntries: AcademicAuditEntry[] = getAuditLogForVerification(
    verification.id
  );

  const statusConfig = {
    pending: {
      label: "Pending",
      color: "#f59e0b",
      bg: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7",
      icon: <PendingIcon sx={{ fontSize: 16 }} />,
    },
    accepted: {
      label: "Accepted",
      color: "#16a34a",
      bg: isDark ? "rgba(22,163,74,0.15)" : "#dcfce7",
      icon: <ApprovedIcon sx={{ fontSize: 16 }} />,
    },
    rejected: {
      label: "Rejected",
      color: "#dc2626",
      bg: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
      icon: <RejectedIcon sx={{ fontSize: 16 }} />,
    },
  };

  const currentStatus = statusConfig[verification.status] || statusConfig.pending;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const infoFields = [
    { label: "Status", value: currentStatus.label, isStatus: true },
    { label: "Submitted", value: formatDate(verification.created_at) },
    { label: "Last Updated", value: formatDate(verification.updated_at) },
    { label: "Storage Type", value: verification.storage_type === "s3" ? "Cloud (S3)" : "Local" },
    ...(verification.reviewer
      ? [
          {
            label: "Reviewed By",
            value: `${verification.reviewer.full_name} (${verification.reviewer.email})`,
          },
          { label: "Reviewed At", value: formatDate(verification.reviewed_at) },
        ]
      : []),
    ...(verification.rejection_reason
      ? [{ label: "Rejection Reason", value: verification.rejection_reason, isRejection: true }]
      : []),
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : "12px",
          bgcolor: isDark ? "#1e1833" : "#ffffff",
          border: isDark ? "1px solid rgba(45,27,105,0.5)" : "none",
          color: isDark ? "#f3f4f6" : "#1f2937",
        },
      }}
    >
      {/* ── Header ────────────── */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
          py: 1.5,
          px: isMobile ? 2 : 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <DocIcon
            sx={{ color: isDark ? "#c084fc" : "#7F56D9", fontSize: 22 }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: isMobile ? "15px" : "16px",
              color: isDark ? "#f3f4f6" : "#1f2937",
            }}
          >
            Verification Details
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{ minWidth: "auto", color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent
        sx={{
          px: isMobile ? 2 : 3,
          py: 2,
          maxHeight: fullScreen ? undefined : "70vh",
        }}
      >
        {/* ── Section A: User Info ────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
            p: 1.5,
            borderRadius: "10px",
            bgcolor: isDark ? "rgba(45,27,105,0.15)" : "#f9fafb",
            border: `1px solid ${isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}`,
          }}
        >
          <Avatar
            sx={{
              bgcolor: isDark ? "#7c3aed" : "#7F56D9",
              width: 40,
              height: 40,
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            {verification.user?.full_name?.charAt(0) || "?"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: isDark ? "#f3f4f6" : "#111827",
              }}
            >
              {verification.user?.full_name || "Unknown User"}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: isDark ? "#9ca3af" : "#6b7280",
              }}
            >
              {verification.user?.email || "N/A"}
            </Typography>
            {verification.user?.mobile_number && (
              <Typography
                sx={{
                  fontSize: "11px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                }}
              >
                {verification.user.mobile_number}
              </Typography>
            )}
          </Box>
          <Chip
            icon={currentStatus.icon}
            label={currentStatus.label}
            size="small"
            sx={{
              bgcolor: currentStatus.bg,
              color: currentStatus.color,
              fontWeight: 700,
              fontSize: "11px",
              "& .MuiChip-icon": { color: currentStatus.color },
            }}
          />
        </Box>

        {/* ── Section B: Verification Info Fields ────── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
          {infoFields.map((field) => (
            <Box key={field.label}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.25,
                }}
              >
                {field.label}
              </Typography>
              {"isStatus" in field && field.isStatus ? (
                <Chip
                  label={field.value}
                  size="small"
                  sx={{
                    bgcolor: currentStatus.bg,
                    color: currentStatus.color,
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                />
              ) : "isRejection" in field && field.isRejection ? (
                <Box
                  sx={{
                    bgcolor: isDark ? "rgba(220,38,38,0.1)" : "#fef2f2",
                    border: `1px solid ${isDark ? "rgba(220,38,38,0.25)" : "#fecaca"}`,
                    borderRadius: "8px",
                    p: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: isDark ? "#fca5a5" : "#dc2626",
                    }}
                  >
                    {field.value}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: isDark ? "#e2e8f0" : "#1f2937",
                  }}
                >
                  {field.value}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        <Divider
          sx={{
            my: 2,
            borderColor: isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb",
          }}
        />

        {/* ── Section C: Audit Log Timeline ────── */}
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "14px",
              color: isDark ? "#f3f4f6" : "#1f2937",
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ReviewIcon
              sx={{ fontSize: 18, color: isDark ? "#c084fc" : "#7F56D9" }}
            />
            Audit Log
          </Typography>

          {auditEntries.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 3,
                borderRadius: "10px",
                bgcolor: isDark ? "rgba(45,27,105,0.1)" : "#f9fafb",
                border: `1px dashed ${isDark ? "rgba(45,27,105,0.3)" : "#d1d5db"}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                  fontStyle: "italic",
                }}
              >
                No audit entries recorded yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {auditEntries
                .slice()
                .reverse()
                .map((entry, idx) => {
                  const actionColor =
                    ACTION_COLORS[entry.action] || "#6b7280";
                  const actionIcon =
                    ACTION_ICONS[entry.action] || (
                      <DocIcon sx={{ fontSize: 16 }} />
                    );
                  const actionLabel =
                    ACTION_LABELS[entry.action] || entry.action;

                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: "8px",
                        bgcolor: isDark
                          ? "rgba(45,27,105,0.1)"
                          : "#f9fafb",
                        border: `1px solid ${isDark ? "rgba(45,27,105,0.2)" : "#f3f4f6"}`,
                      }}
                    >
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: `${actionColor}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: actionColor,
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        {actionIcon}
                      </Box>
                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: actionColor,
                            }}
                          >
                            {actionLabel}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "10px",
                              color: isDark ? "#9ca3af" : "#6b7280",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {new Date(entry.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "11px",
                            color: isDark ? "#d1d5db" : "#374151",
                          }}
                        >
                          by {entry.performedBy}
                          {entry.status === "failure" && (
                            <Chip
                              label="Failed"
                              size="small"
                              sx={{
                                ml: 0.5,
                                height: 16,
                                fontSize: "9px",
                                bgcolor: "rgba(220,38,38,0.1)",
                                color: "#dc2626",
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Typography>
                        {entry.reason && (
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: isDark ? "#9ca3af" : "#6b7280",
                              fontStyle: "italic",
                              mt: 0.25,
                            }}
                          >
                            {entry.reason}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
          p: 2,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: isDark ? "#d1d5db" : "#374151",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcademicVerificationDetailModal;

import React, { useState } from "react";
import { useLockUserAccountMutation } from "../services/api/usersApi";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { userId: string; name: string; email: string } | null;
  onSuccess?: () => void;
}

const DURATION_OPTIONS = [
  { value: "1 day", label: "1 Day" },
  { value: "3 days", label: "3 Days" },
  { value: "7 days", label: "7 Days" },
  { value: "14 days", label: "14 Days" },
  { value: "30 days", label: "30 Days" },
  { value: "90 days", label: "90 Days" },
  { value: "permanent", label: "Permanent" },
];

const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("7 days");
  const [lockUser, { isLoading }] = useLockUserAccountMutation();

  const handleClose = () => {
    setReason("");
    setDuration("7 days");
    onClose();
  };

  const handleSuspend = async () => {
    if (!user) return;
    if (!reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    try {
      await lockUser({
        userId: user.userId,
        reason: reason.trim(),
        duration,
      }).unwrap();
      toast.success(`${user.name} has been suspended`);
      handleClose();
      onSuccess?.();
    } catch (err) {
      const error = err as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to suspend user");
    }
  };

  if (!isOpen || !user) return null;

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
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: isDark ? "#1e1833" : "#ffffff",
          border: isDark ? "1px solid rgba(45,27,105,0.5)" : "none",
          borderRadius: "16px",
          padding: "28px",
          maxWidth: "440px",
          width: "100%",
          boxShadow: isDark
            ? "0 8px 30px rgba(0,0,0,0.4)"
            : "0 8px 30px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-modal-title"
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: isDark ? "rgba(220,38,38,0.15)" : "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#fca5a5" : "#dc2626"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2
              id="suspend-modal-title"
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: isDark ? "#f3f4f6" : "#1f2937",
                fontFamily: "'Nunito', sans-serif",
                margin: 0,
              }}
            >
              Suspend User
            </h2>
            <p style={{ fontSize: "13px", color: isDark ? "#9ca3af" : "#6b7280", fontFamily: "'Nunito', sans-serif", margin: 0 }}>
              {user.name} ({user.email})
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
              Reason for Suspension *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why this user is being suspended..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              aria-required="true"
              aria-label="Reason for suspension"
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
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
              backgroundColor: "transparent",
              color: isDark ? "#d1d5db" : "#374151",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Nunito', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSuspend}
            disabled={isLoading || !reason.trim()}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Nunito', sans-serif",
              cursor: isLoading || !reason.trim() ? "not-allowed" : "pointer",
              opacity: isLoading || !reason.trim() ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            {isLoading ? "Suspending..." : "Suspend User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendUserModal;

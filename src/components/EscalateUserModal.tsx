import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import { escalateUser } from "../utils/escalationManager";
import type { EscalationPriority } from "../utils/escalationManager";
import toast from "react-hot-toast";

interface EscalateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { userId: string; name: string; email: string; role: string } | null;
  onSuccess?: () => void;
}

const PRIORITY_OPTIONS: { value: EscalationPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#3b82f6" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "critical", label: "Critical", color: "#dc2626" },
];

const EscalateUserModal: React.FC<EscalateUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const currentUser = useSelector((state: any) => state.auth.user);
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<EscalationPriority>("medium");

  const handleClose = () => {
    setReason("");
    setPriority("medium");
    onClose();
  };

  const handleEscalate = () => {
    if (!user) return;
    if (!reason.trim()) {
      toast.error("Please provide a reason for escalation");
      return;
    }

    escalateUser({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      reason: reason.trim(),
      priority,
      escalatedBy: currentUser?.full_name || currentUser?.email || "Admin",
    });

    toast.success(`${user.name} has been flagged for review`);
    handleClose();
    onSuccess?.();
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
        aria-labelledby="escalate-modal-title"
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: isDark ? "rgba(234,88,12,0.15)" : "#fff7ed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#fb923c" : "#ea580c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </div>
          <div>
            <h2
              id="escalate-modal-title"
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: isDark ? "#f3f4f6" : "#1f2937",
                fontFamily: "'Nunito', sans-serif",
                margin: 0,
              }}
            >
              Escalate User
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
              Priority Level
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: "8px",
                    border: `2px solid ${priority === opt.value ? opt.color : isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}`,
                    backgroundColor: priority === opt.value
                      ? `${opt.color}15`
                      : "transparent",
                    color: priority === opt.value ? opt.color : isDark ? "#9ca3af" : "#6b7280",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "'Nunito', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label={`Priority: ${opt.label}`}
                  aria-pressed={priority === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
              Reason for Escalation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why this user needs review..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              aria-required="true"
              aria-label="Reason for escalation"
            />
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
            onClick={handleEscalate}
            disabled={!reason.trim()}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Nunito', sans-serif",
              cursor: !reason.trim() ? "not-allowed" : "pointer",
              opacity: !reason.trim() ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            Flag for Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscalateUserModal;

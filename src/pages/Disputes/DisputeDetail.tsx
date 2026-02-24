import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getDisputeById,
  addDisputeMessage,
  uploadEvidence,
  resolveDispute,
  type Dispute,
  type DisputeEvidence,
  type DisputeMessage,
  type DisputeTimeline,
} from "../../services/api/disputesApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { hasPermission } from "../../utils/permissionUtils";
import { useTheme } from "../../context/ThemeContext";
import { getSocket, joinDisputeRoom, leaveDisputeRoom } from "../../utils/socket";

const WORKFLOW_STEPS = ["Open", "Under Review", "Mediation", "Resolved"] as const;

const WorkflowStepper: React.FC<{ currentStatus: string; isDark: boolean }> = ({ currentStatus, isDark }) => {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStatus as typeof WORKFLOW_STEPS[number]);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div
      aria-label="Dispute workflow progress"
      role="navigation"
      className="rounded-lg p-4"
      style={{
        backgroundColor: isDark ? "#1e1833" : "#ffffff",
        border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
      }}
    >
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1.5 relative">
                {/* Circle */}
                <div
                  aria-label={`${step}: ${isCompleted ? "completed" : isActive ? "current step" : "pending"}`}
                  className="relative flex items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: isCompleted
                      ? (isDark ? "#7F56D9" : "#2d1b69")
                      : isActive
                      ? (isDark ? "#7F56D9" : "#2d1b69")
                      : (isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"),
                    border: isPending ? `2px solid ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}` : "none",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  ) : isActive ? (
                    <>
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          backgroundColor: isDark ? "rgba(127,86,217,0.3)" : "rgba(45,27,105,0.2)",
                        }}
                      />
                      <div
                        className="h-3 w-3 rounded-full bg-white"
                      />
                    </>
                  ) : (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "#9ca3af" }}
                    />
                  )}
                </div>
                {/* Label */}
                <span
                  className="text-[10px] font-semibold text-center"
                  style={{
                    color: isCompleted || isActive
                      ? (isDark ? "#c084fc" : "#2d1b69")
                      : (isDark ? "#6b7280" : "#9ca3af"),
                  }}
                >
                  {step}
                </span>
              </div>
              {/* Connecting line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div
                  className="flex-1 mx-2"
                  style={{
                    height: 2,
                    marginBottom: 20,
                    backgroundColor: index < activeIndex
                      ? (isDark ? "#7F56D9" : "#2d1b69")
                      : (isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"),
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const DisputeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const user_id = useSelector((state: any) => state.auth.user_id);
  const permissions = useSelector((state: any) => state.auth.permissions);
  const accessToken = useSelector((state: any) => state.auth.accessToken);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [timeline, setTimeline] = useState<DisputeTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [resolvingDispute, setResolvingDispute] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    resolution: "Refunded" as "Refunded" | "Settled" | "Dismissed" | "Escalated",
    resolution_notes: "",
    refund_amount: "",
  });

  // Check if user is moderator (superadmin, admin, or has dispute edit permission)
  const isSuperadmin = role?.toLowerCase() === "superadmin";
  const isAdmin = role?.toLowerCase() === "admin";
  const hasDisputeEditPermission = hasPermission(permissions, "/disputes", "edit", role);
  const isModerator = isSuperadmin || isAdmin || hasDisputeEditPermission;
  const canResolve = isModerator && dispute?.status !== "Resolved";

  useEffect(() => {
    if (id) {
      fetchDisputeDetails();
    }
  }, [id]);

  // Socket.IO setup for real-time messaging
  useEffect(() => {
    if (!id || !accessToken) return;

    const getToken = () => accessToken;
    const socket = getSocket(getToken);

    if (!socket) return;

    // Join dispute room
    joinDisputeRoom(id, getToken);

    // Listen for new messages
    const handleNewMessage = (data: { message: DisputeMessage }) => {
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some((msg) => msg.message_id === data.message.message_id);
        if (exists) return prev;
        return [...prev, data.message];
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('joined_dispute', () => {
      console.log('Joined dispute room:', id);
    });
    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      leaveDisputeRoom(id, getToken);
      socket.off('new_message', handleNewMessage);
      socket.off('joined_dispute');
      socket.off('error');
    };
  }, [id, accessToken]);

  const fetchDisputeDetails = async () => {
    try {
      setLoading(true);
      const result = await getDisputeById(id!);
      setDispute(result.dispute);
      setEvidence(result.evidence || []);
      setMessages(result.messages || []);
      setTimeline(result.timeline || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load dispute details");
      navigate("/dashboard/disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !id) return;

    try {
      setSendingMessage(true);
      const newMessage = await addDisputeMessage(id, messageText);
      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
      toast.success("Message sent");
      // Refresh dispute to get updated last_response_at
      await fetchDisputeDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !id) return;

    try {
      setUploadingFile(true);
      const file = e.target.files[0];
      const newEvidence = await uploadEvidence(id, file);
      setEvidence((prev) => [newEvidence, ...prev]);
      toast.success("Evidence uploaded successfully");
      await fetchDisputeDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload evidence");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleResolve = async () => {
    if (!id || !resolutionData.resolution_notes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }

    try {
      setResolvingDispute(true);
      await resolveDispute(
        id,
        resolutionData.resolution,
        resolutionData.resolution_notes,
        resolutionData.refund_amount ? parseFloat(resolutionData.refund_amount) : undefined
      );
      toast.success("Dispute resolved successfully");
      setShowResolveModal(false);
      setResolutionData({
        resolution: "Refunded",
        resolution_notes: "",
        refund_amount: "",
      });
      await fetchDisputeDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to resolve dispute");
    } finally {
      setResolvingDispute(false);
    }
  };

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading dispute details">
        <Loader />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div
        role="status"
        className="text-center py-12 rounded-lg"
        style={{
          backgroundColor: isDark ? "#1e1833" : "#ffffff",
          border: isDark ? "1px dashed rgba(45,27,105,0.5)" : "1px dashed #e5e7eb",
        }}
      >
        <p className="text-sm" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Dispute not found</p>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto space-y-4 animate-fadeIn"
      style={{
        background: isDark ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)" : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 rounded-lg transition"
            style={{
              backgroundColor: isDark ? "rgba(45,27,105,0.25)" : "#f3f4f6",
            }}
          >
            <ArrowLeftIcon className="h-5 w-5" style={{ color: isDark ? "#d1d5db" : "#6b7280" }} />
          </button>
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
            >
              <ExclamationTriangleIcon className="h-6 w-6" style={{ color: isDark ? "#f87171" : "#dc2626" }} />
              {dispute.title}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
              Dispute ID: {dispute.dispute_id.slice(0, 8)}...
            </p>
          </div>
        </div>
        {canResolve && (
          <button
            onClick={() => setShowResolveModal(true)}
            aria-label="Resolve this dispute"
            className="px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
            style={{ backgroundColor: isDark ? "rgba(22,163,74,0.2)" : "#f0fdf4", color: isDark ? "#34d399" : "#16a34a", border: isDark ? "1px solid rgba(22,163,74,0.3)" : "1px solid #bbf7d0" }}
          >
            Resolve Dispute
          </button>
        )}
      </div>

      {/* Workflow Stepper */}
      <WorkflowStepper currentStatus={dispute.status} isDark={isDark} />

      {/* Status and Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
          }}
          aria-label={`Status: ${dispute.status}`}
        >
          <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Status</p>
          <p
            className="text-sm font-bold mt-0.5"
            style={{
              color: dispute.status === "Open"
                ? (isDark ? "#f87171" : "#dc2626")
                : dispute.status === "Under Review" || dispute.status === "Mediation"
                ? (isDark ? "#fbbf24" : "#ea580c")
                : (isDark ? "#34d399" : "#16a34a"),
            }}
          >
            {dispute.status}
          </p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
          }}
          aria-label={`Priority: ${dispute.priority}`}
        >
          <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Priority</p>
          <p
            className="text-sm font-bold mt-0.5"
            style={{
              color: dispute.priority === "High"
                ? (isDark ? "#f87171" : "#dc2626")
                : dispute.priority === "Medium"
                ? (isDark ? "#fbbf24" : "#ea580c")
                : (isDark ? "#93c5fd" : "#2563eb"),
            }}
          >
            {dispute.priority}
          </p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
          }}
        >
          <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Type</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: isDark ? "#c084fc" : "#7c3aed" }}>{dispute.type}</p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
          }}
        >
          <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Reported By</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
            {dispute.reported_by === 'student'
              ? dispute.student?.full_name || 'Student'
              : dispute.employer?.full_name || 'Employer'}
            <span className="text-[10px] font-normal ml-1 capitalize" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
              ({dispute.reported_by})
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: isDark ? "#1e1833" : "#ffffff",
              border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
            }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>Description</h2>
            <p className="text-xs whitespace-pre-wrap" style={{ color: isDark ? "#d1d5db" : "#374151" }}>{dispute.description}</p>
          </div>

          {/* Evidence */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: isDark ? "#1e1833" : "#ffffff",
              border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>Evidence</h2>
              {dispute.status !== "Resolved" && (
                <label
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition"
                  style={{ backgroundColor: isDark ? "#7F56D9" : "#2d1b69", color: "#ffffff" }}
                >
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    aria-label="Upload evidence files"
                  />
                  {uploadingFile ? "Uploading..." : "Upload Evidence"}
                </label>
              )}
            </div>
            {evidence.length === 0 ? (
              <p className="text-center py-6 text-xs" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>No evidence uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <div
                    key={ev.evidence_id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#f9fafb" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <PaperClipIcon className="h-4 w-4 flex-shrink-0" style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>{ev.file_name}</p>
                        <p className="text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                          Uploaded by {ev.uploader?.full_name || "Unknown"} • {new Date(ev.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={ev.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View evidence: ${ev.file_name}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0"
                      style={{ backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "#eff6ff", color: isDark ? "#93c5fd" : "#1d4ed8" }}
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages/Chat Thread */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: isDark ? "#1e1833" : "#ffffff",
              border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
            }}
          >
            <h2
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" style={{ color: isDark ? "#c084fc" : "#7c3aed" }} />
              Discussion Thread
            </h2>
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center py-6 text-xs" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: msg.sender_type === "moderator"
                        ? (isDark ? "rgba(45,27,105,0.25)" : "#f5f0fc")
                        : msg.sender_id === user_id
                        ? (isDark ? "rgba(59,130,246,0.15)" : "#eff6ff")
                        : (isDark ? "rgba(45,27,105,0.1)" : "#f9fafb"),
                      borderLeft: `3px solid ${
                        msg.sender_type === "moderator"
                          ? (isDark ? "#c084fc" : "#7c3aed")
                          : msg.sender_id === user_id
                          ? (isDark ? "#93c5fd" : "#3b82f6")
                          : (isDark ? "rgba(45,27,105,0.3)" : "#d1d5db")
                      }`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold capitalize" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                        {msg.sender?.full_name || msg.sender_type}
                      </p>
                      <p className="text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs whitespace-pre-wrap" style={{ color: isDark ? "#d1d5db" : "#374151" }}>{msg.message}</p>
                  </div>
                ))
              )}
            </div>
            {dispute.status !== "Resolved" && (
              <div style={{ borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.3)" : "#e5e7eb"}` }} className="pt-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  aria-label="Type your message"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-xs resize-none"
                  style={{
                    backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#f9fafb",
                    border: isDark ? "1px solid rgba(45,27,105,0.4)" : "1px solid #d1d5db",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendingMessage}
                  aria-label="Send message"
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isDark ? "#7F56D9" : "#2d1b69", color: "#ffffff" }}
                >
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Parties Info */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: isDark ? "#1e1833" : "#ffffff",
              border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
            }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>Parties Involved</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Student</p>
                <p className="text-xs font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>{dispute.student?.full_name || "N/A"}</p>
                <p className="text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                  {dispute.reported_by === 'student' ? (dispute.student?.email || "-") : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Employer</p>
                <p className="text-xs font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>{dispute.employer?.full_name || "N/A"}</p>
                <p className="text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                  {dispute.reported_by === 'employer' ? (dispute.employer?.email || "-") : "-"}
                </p>
              </div>
              {dispute.moderator && (
                <div>
                  <p className="text-[10px] font-medium" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Moderator</p>
                  <p className="text-xs font-semibold" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                    {dispute.moderator.full_name}
                  </p>
                  <p className="text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                    {dispute.moderator.email}
                    <span className="ml-1 capitalize">
                      ({dispute.moderator.role?.roleType === 'superAdmin' ? 'superadmin' : 'Admin'})
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: isDark ? "#1e1833" : "#ffffff",
              border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
            }}
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
              <ClockIcon className="h-4 w-4" style={{ color: isDark ? "#c084fc" : "#7c3aed" }} />
              Timeline
            </h3>
            <div className="space-y-3">
              {timeline.length === 0 ? (
                <p className="text-xs" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>No timeline events</p>
              ) : (
                timeline.map((event) => {
                  let displayName = event.performer?.full_name || event.performed_by_type;
                  let displayRole: string = event.performed_by_type;

                  if (event.performer?.role?.roleType === 'admin' || event.performer?.role?.roleType === 'superAdmin') {
                    displayRole = event.performer.role.roleType === 'superAdmin' ? 'superadmin' : 'Admin';
                    let details = event.details || '';
                    if (details.includes('admin')) {
                      const roleName = event.performer.role.roleName;
                      details = details.replace(new RegExp(roleName, 'gi'), displayRole);
                    }

                    return (
                      <div
                        key={event.timeline_id}
                        className="pl-3"
                        style={{ borderLeft: `2px solid ${isDark ? "#c084fc" : "#7c3aed"}` }}
                      >
                        <p className="text-xs font-semibold capitalize" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                          {event.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                          {displayName} ({displayRole}) • {new Date(event.created_at).toLocaleString()}
                        </p>
                        {details && (
                          <p className="text-[10px] mt-0.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>{details}</p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={event.timeline_id}
                      className="pl-3"
                      style={{ borderLeft: `2px solid ${isDark ? "#c084fc" : "#7c3aed"}` }}
                    >
                      <p className="text-xs font-semibold capitalize" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
                        {event.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                        {displayName} • {new Date(event.created_at).toLocaleString()}
                      </p>
                      {event.details && (
                        <p className="text-[10px] mt-0.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>{event.details}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Resolution Info */}
          {dispute.status === "Resolved" && dispute.resolution && (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: isDark ? "rgba(22,163,74,0.15)" : "#f0fdf4",
                border: isDark ? "1px solid rgba(22,163,74,0.3)" : "1px solid #bbf7d0",
              }}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: isDark ? "#34d399" : "#15803d" }}>
                <CheckCircleIcon className="h-4 w-4" />
                Resolution
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-medium" style={{ color: isDark ? "#34d399" : "#15803d" }}>Outcome</p>
                  <p className="text-xs font-semibold" style={{ color: isDark ? "#f3f4f6" : "#166534" }}>{dispute.resolution}</p>
                </div>
                {dispute.resolution_notes && (
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: isDark ? "#34d399" : "#15803d" }}>Notes</p>
                    <p className="text-xs" style={{ color: isDark ? "#d1d5db" : "#374151" }}>{dispute.resolution_notes}</p>
                  </div>
                )}
                {dispute.refund_amount && (
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: isDark ? "#34d399" : "#15803d" }}>Refund Amount</p>
                    <p className="text-xs font-semibold" style={{ color: isDark ? "#f3f4f6" : "#166534" }}>${dispute.refund_amount}</p>
                  </div>
                )}
                {dispute.resolved_at && (
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: isDark ? "#34d399" : "#15803d" }}>Resolved Date</p>
                    <p className="text-xs" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                      {new Date(dispute.resolved_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolve-dialog-title"
        >
          <div
            className="rounded-xl max-w-2xl w-full p-6"
            style={{
              backgroundColor: isDark ? "#1e1833" : "#ffffff",
              border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
            }}
          >
            <h2 id="resolve-dialog-title" className="text-lg font-bold mb-4" style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}>
              Resolve Dispute
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                  Resolution Type <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
                </label>
                <select
                  value={resolutionData.resolution}
                  onChange={(e) =>
                    setResolutionData({
                      ...resolutionData,
                      resolution: e.target.value as any,
                    })
                  }
                  aria-required="true"
                  className="w-full px-3 py-2 rounded-lg text-xs"
                  style={{
                    backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#f9fafb",
                    border: isDark ? "1px solid rgba(45,27,105,0.4)" : "1px solid #d1d5db",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                  }}
                >
                  <option value="Refunded">Refunded</option>
                  <option value="Settled">Settled</option>
                  <option value="Dismissed">Dismissed</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                  Resolution Notes <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
                </label>
                <textarea
                  value={resolutionData.resolution_notes}
                  onChange={(e) =>
                    setResolutionData({
                      ...resolutionData,
                      resolution_notes: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Explain the resolution..."
                  aria-required="true"
                  aria-label="Resolution notes"
                  className="w-full px-3 py-2 rounded-lg text-xs resize-none"
                  style={{
                    backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#f9fafb",
                    border: isDark ? "1px solid rgba(45,27,105,0.4)" : "1px solid #d1d5db",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                  }}
                />
              </div>
              {resolutionData.resolution === "Refunded" && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                    Refund Amount (Optional)
                  </label>
                  <input
                    type="number"
                    value={resolutionData.refund_amount}
                    onChange={(e) =>
                      setResolutionData({
                        ...resolutionData,
                        refund_amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    aria-label="Refund amount"
                    className="w-full px-3 py-2 rounded-lg text-xs"
                    style={{
                      backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#f9fafb",
                      border: isDark ? "1px solid rgba(45,27,105,0.4)" : "1px solid #d1d5db",
                      color: isDark ? "#f3f4f6" : "#1f2937",
                    }}
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition"
                  style={{
                    backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#f3f4f6",
                    color: isDark ? "#d1d5db" : "#374151",
                    border: isDark ? "1px solid rgba(45,27,105,0.4)" : "1px solid #d1d5db",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolvingDispute}
                  aria-label="Confirm resolution"
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: isDark ? "rgba(22,163,74,0.2)" : "#f0fdf4", color: isDark ? "#34d399" : "#16a34a", border: isDark ? "1px solid rgba(22,163,74,0.3)" : "1px solid #bbf7d0" }}
                >
                  {resolvingDispute ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resolving...
                    </>
                  ) : (
                    "Confirm Resolution"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeDetail;

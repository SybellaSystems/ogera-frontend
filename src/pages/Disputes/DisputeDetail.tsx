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
import { getSocket, joinDisputeRoom, leaveDisputeRoom } from "../../utils/socket";
import { useTheme } from "../../context/ThemeContext";

// Workflow Stepper Component
const WORKFLOW_STEPS = ["Open", "Under Review", "Mediation", "Resolved"];

const WorkflowStepper: React.FC<{ currentStatus: string; isDark: boolean }> = ({
  currentStatus,
  isDark,
}) => {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStatus);

  return (
    <div
      className="rounded-xl p-6 shadow-md"
      style={{
        background: isDark ? "#1e1833" : "#ffffff",
        border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
      }}
      aria-label="Dispute workflow progress"
      role="navigation"
    >
      <div className="flex items-center justify-between relative">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <React.Fragment key={step}>
              {/* Step */}
              <div className="flex flex-col items-center z-10 relative" style={{ flex: "0 0 auto" }}>
                <div
                  className="relative flex items-center justify-center"
                  aria-label={`${step}: ${isCompleted ? "completed" : isActive ? "current step" : "pending"}`}
                >
                  {/* Pulse ring for active */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        background: isDark ? "rgba(192,132,252,0.3)" : "rgba(127,86,217,0.3)",
                        width: 40,
                        height: 40,
                        top: -4,
                        left: -4,
                      }}
                    />
                  )}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                    style={{
                      background: isCompleted
                        ? isDark ? "#7F56D9" : "#7F56D9"
                        : isActive
                        ? isDark ? "#c084fc" : "#7F56D9"
                        : isDark ? "rgba(75,65,100,0.5)" : "#e5e7eb",
                      color: isCompleted || isActive ? "#ffffff" : isDark ? "#6b7280" : "#9ca3af",
                      border: isActive ? `2px solid ${isDark ? "#c084fc" : "#7F56D9"}` : "none",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                </div>
                <span
                  className="text-xs font-medium mt-2 text-center whitespace-nowrap"
                  style={{
                    color: isCompleted || isActive
                      ? isDark ? "#c084fc" : "#7F56D9"
                      : isDark ? "#6b7280" : "#9ca3af",
                  }}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2"
                  style={{
                    background: index < currentIndex
                      ? isDark ? "#7F56D9" : "#7F56D9"
                      : isDark ? "rgba(75,65,100,0.5)" : "#e5e7eb",
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

  // Card/section style helpers
  const cardStyle: React.CSSProperties = {
    background: isDark ? "#1e1833" : "#ffffff",
    border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #e5e7eb",
  };
  const headingColor = isDark ? "#f3f4f6" : "#1f2937";
  const bodyColor = isDark ? "#d1d5db" : "#374151";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";

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
      <div className="text-center py-12" role="status">
        <p style={{ color: mutedColor }}>Dispute not found</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
    color: isDark ? "#e2e8f0" : "#1f2937",
    borderColor: isDark ? "rgba(45,27,105,0.5)" : "#d1d5db",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition"
            style={{ background: isDark ? "rgba(45,27,105,0.3)" : undefined }}
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6" style={{ color: mutedColor }} />
          </button>
          <div>
            <h1
              className="text-3xl font-extrabold flex items-center gap-3"
              style={{ color: headingColor }}
            >
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              {dispute.title}
            </h1>
            <p style={{ color: mutedColor }} className="mt-1">
              Dispute ID: {dispute.dispute_id.slice(0, 8)}...
            </p>
          </div>
        </div>
        {canResolve && (
          <button
            onClick={() => setShowResolveModal(true)}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md"
            aria-label="Resolve this dispute"
          >
            Resolve Dispute
          </button>
        )}
      </div>

      {/* Workflow Stepper */}
      <WorkflowStepper currentStatus={dispute.status} isDark={isDark} />

      {/* Status and Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 shadow-md" style={cardStyle}>
          <p className="text-xs font-medium" style={{ color: mutedColor }}>Status</p>
          <p
            className="text-lg font-bold mt-1"
            role="status"
            aria-label={`Status: ${dispute.status}`}
            style={{
              color:
                dispute.status === "Open"
                  ? "#dc2626"
                  : dispute.status === "Under Review" || dispute.status === "Mediation"
                  ? "#ea580c"
                  : "#16a34a",
            }}
          >
            {dispute.status}
          </p>
        </div>
        <div className="rounded-xl p-4 shadow-md" style={cardStyle}>
          <p className="text-xs font-medium" style={{ color: mutedColor }}>Priority</p>
          <p
            className="text-lg font-bold mt-1"
            role="status"
            aria-label={`Priority: ${dispute.priority}`}
            style={{
              color:
                dispute.priority === "High"
                  ? "#dc2626"
                  : dispute.priority === "Medium"
                  ? "#ea580c"
                  : "#2563eb",
            }}
          >
            {dispute.priority}
          </p>
        </div>
        <div className="rounded-xl p-4 shadow-md" style={cardStyle}>
          <p className="text-xs font-medium" style={{ color: mutedColor }}>Type</p>
          <p className="text-lg font-bold mt-1" style={{ color: isDark ? "#c084fc" : "#7F56D9" }}>
            {dispute.type}
          </p>
        </div>
        <div className="rounded-xl p-4 shadow-md" style={cardStyle}>
          <p className="text-xs font-medium" style={{ color: mutedColor }}>Reported By</p>
          <p className="text-lg font-bold mt-1" style={{ color: headingColor }}>
            {dispute.reported_by === 'student'
              ? dispute.student?.full_name || 'Student'
              : dispute.employer?.full_name || 'Employer'}
            <span className="text-sm font-normal ml-2 capitalize" style={{ color: mutedColor }}>
              ({dispute.reported_by})
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-xl p-6 shadow-md" style={cardStyle}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: headingColor }}>
              Description
            </h2>
            <p className="whitespace-pre-wrap" style={{ color: bodyColor }}>
              {dispute.description}
            </p>
          </div>

          {/* Evidence */}
          <div className="rounded-xl p-6 shadow-md" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: headingColor }}>
                Evidence
              </h2>
              {dispute.status !== "Resolved" && (
                <label
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold cursor-pointer transition"
                  aria-label="Upload evidence files"
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
              <p className="text-center py-8" style={{ color: mutedColor }} role="status">
                No evidence uploaded yet
              </p>
            ) : (
              <div className="space-y-3">
                {evidence.map((ev) => (
                  <div
                    key={ev.evidence_id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      background: isDark ? "rgba(45,27,105,0.2)" : "#f9fafb",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <PaperClipIcon className="h-5 w-5" style={{ color: mutedColor }} />
                      <div>
                        <p className="font-medium" style={{ color: headingColor }}>
                          {ev.file_name}
                        </p>
                        <p className="text-xs" style={{ color: mutedColor }}>
                          Uploaded by {ev.uploader?.full_name || "Unknown"} •{" "}
                          {new Date(ev.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={ev.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                      aria-label={`View evidence: ${ev.file_name}`}
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages/Chat Thread */}
          <div className="rounded-xl p-6 shadow-md" style={cardStyle}>
            <h2
              className="text-xl font-semibold mb-4 flex items-center gap-2"
              style={{ color: headingColor }}
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              Discussion Thread
            </h2>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center py-8" style={{ color: mutedColor }} role="status">
                  No messages yet
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className="p-4 rounded-lg"
                    style={{
                      background:
                        msg.sender_type === "moderator"
                          ? isDark ? "rgba(127,86,217,0.15)" : "#faf5ff"
                          : msg.sender_id === user_id
                          ? isDark ? "rgba(59,130,246,0.15)" : "#eff6ff"
                          : isDark ? "rgba(75,65,100,0.2)" : "#f9fafb",
                      borderLeft: `4px solid ${
                        msg.sender_type === "moderator"
                          ? "#7F56D9"
                          : msg.sender_id === user_id
                          ? "#3b82f6"
                          : isDark ? "rgba(75,65,100,0.5)" : "#d1d5db"
                      }`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold capitalize" style={{ color: headingColor }}>
                        {msg.sender?.full_name || msg.sender_type}
                      </p>
                      <p className="text-xs" style={{ color: mutedColor }}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap" style={{ color: bodyColor }}>
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>
            {dispute.status !== "Resolved" && (
              <div className="border-t pt-4" style={{ borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb" }}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  style={inputStyle}
                  aria-label="Type your message"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendingMessage}
                  className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parties Info */}
          <div className="rounded-xl p-6 shadow-md" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: headingColor }}>
              Parties Involved
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium" style={{ color: mutedColor }}>Student</p>
                <p className="font-semibold" style={{ color: headingColor }}>
                  {dispute.student?.full_name || "N/A"}
                </p>
                <p className="text-sm" style={{ color: bodyColor }}>
                  {dispute.reported_by === 'student' ? (dispute.student?.email || "-") : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: mutedColor }}>Employer</p>
                <p className="font-semibold" style={{ color: headingColor }}>
                  {dispute.employer?.full_name || "N/A"}
                </p>
                <p className="text-sm" style={{ color: bodyColor }}>
                  {dispute.reported_by === 'employer' ? (dispute.employer?.email || "-") : "-"}
                </p>
              </div>
              {dispute.moderator && (
                <div>
                  <p className="text-xs font-medium" style={{ color: mutedColor }}>Moderator</p>
                  <p className="font-semibold" style={{ color: headingColor }}>
                    {dispute.moderator.full_name}
                  </p>
                  <p className="text-sm" style={{ color: bodyColor }}>
                    {dispute.moderator.email}
                    <span className="text-xs font-normal ml-2" style={{ color: mutedColor }}>
                      ({dispute.moderator.role?.roleType === 'superAdmin' ? 'superadmin' : 'Admin'})
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl p-6 shadow-md" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: headingColor }}>
              <ClockIcon className="h-5 w-5" />
              Timeline
            </h3>
            <div className="space-y-4">
              {timeline.length === 0 ? (
                <p className="text-sm" style={{ color: mutedColor }}>No timeline events</p>
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
                        className="pl-4"
                        style={{ borderLeft: `2px solid ${isDark ? "#7F56D9" : "#7F56D9"}` }}
                      >
                        <p className="font-semibold capitalize" style={{ color: headingColor }}>
                          {event.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs" style={{ color: mutedColor }}>
                          {displayName} ({displayRole}) • {new Date(event.created_at).toLocaleString()}
                        </p>
                        {details && (
                          <p className="text-sm mt-1" style={{ color: bodyColor }}>{details}</p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={event.timeline_id}
                      className="pl-4"
                      style={{ borderLeft: `2px solid ${isDark ? "#7F56D9" : "#7F56D9"}` }}
                    >
                      <p className="font-semibold capitalize" style={{ color: headingColor }}>
                        {event.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs" style={{ color: mutedColor }}>
                        {displayName} • {new Date(event.created_at).toLocaleString()}
                      </p>
                      {event.details && (
                        <p className="text-sm mt-1" style={{ color: bodyColor }}>{event.details}</p>
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
              className="rounded-xl p-6 shadow-md"
              style={{
                background: isDark ? "rgba(22,163,74,0.15)" : "#f0fdf4",
                border: isDark ? "1px solid rgba(22,163,74,0.3)" : "1px solid #bbf7d0",
              }}
            >
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: isDark ? "#86efac" : "#14532d" }}
              >
                <CheckCircleIcon className="h-5 w-5" />
                Resolution
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium" style={{ color: isDark ? "#4ade80" : "#15803d" }}>
                    Outcome
                  </p>
                  <p className="font-semibold" style={{ color: isDark ? "#86efac" : "#14532d" }}>
                    {dispute.resolution}
                  </p>
                </div>
                {dispute.resolution_notes && (
                  <div>
                    <p className="text-xs font-medium" style={{ color: isDark ? "#4ade80" : "#15803d" }}>
                      Notes
                    </p>
                    <p className="text-sm" style={{ color: isDark ? "#bbf7d0" : "#166534" }}>
                      {dispute.resolution_notes}
                    </p>
                  </div>
                )}
                {dispute.refund_amount && (
                  <div>
                    <p className="text-xs font-medium" style={{ color: isDark ? "#4ade80" : "#15803d" }}>
                      Refund Amount
                    </p>
                    <p className="font-semibold" style={{ color: isDark ? "#86efac" : "#14532d" }}>
                      ${dispute.refund_amount}
                    </p>
                  </div>
                )}
                {dispute.resolved_at && (
                  <div>
                    <p className="text-xs font-medium" style={{ color: isDark ? "#4ade80" : "#15803d" }}>
                      Resolved Date
                    </p>
                    <p className="text-sm" style={{ color: isDark ? "#bbf7d0" : "#166534" }}>
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolve-modal-title"
        >
          <div
            className="rounded-xl max-w-2xl w-full p-6"
            style={{
              background: isDark ? "#1e1833" : "#ffffff",
              border: isDark ? "1px solid rgba(45,27,105,0.5)" : undefined,
            }}
          >
            <h2
              id="resolve-modal-title"
              className="text-2xl font-bold mb-4"
              style={{ color: headingColor }}
            >
              Resolve Dispute
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: bodyColor }}
                >
                  Resolution Type *
                </label>
                <select
                  value={resolutionData.resolution}
                  onChange={(e) =>
                    setResolutionData({
                      ...resolutionData,
                      resolution: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                  aria-required="true"
                >
                  <option value="Refunded">Refunded</option>
                  <option value="Settled">Settled</option>
                  <option value="Dismissed">Dismissed</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: bodyColor }}
                >
                  Resolution Notes *
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
                  className="w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  style={inputStyle}
                  aria-required="true"
                />
              </div>
              {resolutionData.resolution === "Refunded" && (
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: bodyColor }}
                  >
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
                    className="w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                    style={inputStyle}
                  />
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="px-6 py-2.5 rounded-lg font-semibold transition"
                  style={{
                    border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #d1d5db",
                    color: bodyColor,
                    background: isDark ? "rgba(45,27,105,0.2)" : undefined,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolvingDispute}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {resolvingDispute ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

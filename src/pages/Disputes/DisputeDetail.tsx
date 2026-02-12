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
  updateDispute,
  type Dispute,
  type DisputeEvidence,
  type DisputeMessage,
  type DisputeTimeline,
} from "../../services/api/disputesApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { hasPermission } from "../../utils/permissionUtils";

const DisputeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const user_id = useSelector((state: any) => state.auth.user_id);
  const permissions = useSelector((state: any) => state.auth.permissions);

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
    return <Loader />;
  }

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dispute not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              {dispute.title}
            </h1>
            <p className="text-gray-500 mt-1">Dispute ID: {dispute.dispute_id.slice(0, 8)}...</p>
          </div>
        </div>
        {canResolve && (
          <button
            onClick={() => setShowResolveModal(true)}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            Resolve Dispute
          </button>
        )}
      </div>

      {/* Status and Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Status</p>
          <p
            className={`text-lg font-bold mt-1 ${
              dispute.status === "Open"
                ? "text-red-600"
                : dispute.status === "Under Review" || dispute.status === "Mediation"
                ? "text-orange-600"
                : "text-green-600"
            }`}
          >
            {dispute.status}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Priority</p>
          <p
            className={`text-lg font-bold mt-1 ${
              dispute.priority === "High"
                ? "text-red-600"
                : dispute.priority === "Medium"
                ? "text-orange-600"
                : "text-blue-600"
            }`}
          >
            {dispute.priority}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Type</p>
          <p className="text-lg font-bold mt-1 text-purple-600">{dispute.type}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Reported By</p>
          <p className="text-lg font-bold mt-1">
            {dispute.reported_by === 'student' 
              ? dispute.student?.full_name || 'Student'
              : dispute.employer?.full_name || 'Employer'}
            <span className="text-sm font-normal text-gray-500 ml-2 capitalize">
              ({dispute.reported_by})
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{dispute.description}</p>
          </div>

          {/* Evidence */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Evidence</h2>
              {dispute.status !== "Resolved" && (
                <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold cursor-pointer transition">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  {uploadingFile ? "Uploading..." : "Upload Evidence"}
                </label>
              )}
            </div>
            {evidence.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No evidence uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {evidence.map((ev) => (
                  <div
                    key={ev.evidence_id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <PaperClipIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{ev.file_name}</p>
                        <p className="text-xs text-gray-500">
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
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages/Chat Thread */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              Discussion Thread
            </h2>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`p-4 rounded-lg ${
                      msg.sender_type === "moderator"
                        ? "bg-purple-50 border-l-4 border-purple-500"
                        : msg.sender_id === user_id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "bg-gray-50 border-l-4 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 capitalize">
                        {msg.sender?.full_name || msg.sender_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
            {dispute.status !== "Resolved" && (
              <div className="border-t pt-4">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendingMessage}
                  className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parties Involved</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Student</p>
                <p className="font-semibold text-gray-900">{dispute.student?.full_name || "N/A"}</p>
                <p className="text-sm text-gray-600">
                  {dispute.reported_by === 'student' ? (dispute.student?.email || "-") : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Employer</p>
                <p className="font-semibold text-gray-900">{dispute.employer?.full_name || "N/A"}</p>
                <p className="text-sm text-gray-600">
                  {dispute.reported_by === 'employer' ? (dispute.employer?.email || "-") : "-"}
                </p>
              </div>
              {dispute.moderator && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Moderator</p>
                  <p className="font-semibold text-gray-900">
                    {dispute.moderator.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dispute.moderator.email}
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      ({dispute.moderator.role?.roleType === 'superAdmin' ? 'superadmin' : 'Admin'})
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Timeline
            </h3>
            <div className="space-y-4">
              {timeline.length === 0 ? (
                <p className="text-gray-500 text-sm">No timeline events</p>
              ) : (
                timeline.map((event) => {
                  // Determine display name and role
                  let displayName = event.performer?.full_name || event.performed_by_type;
                  let displayRole = event.performed_by_type;
                  
                  // If performer is admin, show "Admin" instead of roleName
                  if (event.performer?.role?.roleType === 'admin' || event.performer?.role?.roleType === 'superAdmin') {
                    displayRole = event.performer.role.roleType === 'superAdmin' ? 'superadmin' : 'Admin';
                    // Update details to show "Admin" instead of roleName
                    let details = event.details || '';
                    if (details.includes('admin')) {
                      // Replace roleName with "Admin" or "superadmin"
                      const roleName = event.performer.role.roleName;
                      details = details.replace(new RegExp(roleName, 'gi'), displayRole);
                    }
                    
                    return (
                      <div key={event.timeline_id} className="border-l-2 border-purple-500 pl-4">
                        <p className="font-semibold text-gray-900 capitalize">{event.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-gray-500">
                          {displayName} ({displayRole}) • {new Date(event.created_at).toLocaleString()}
                        </p>
                        {details && (
                          <p className="text-sm text-gray-600 mt-1">{details}</p>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <div key={event.timeline_id} className="border-l-2 border-purple-500 pl-4">
                      <p className="font-semibold text-gray-900 capitalize">{event.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-gray-500">
                        {displayName} • {new Date(event.created_at).toLocaleString()}
                      </p>
                      {event.details && (
                        <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Resolution Info */}
          {dispute.status === "Resolved" && dispute.resolution && (
            <div className="bg-green-50 rounded-xl p-6 shadow-md border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Resolution
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-green-700 font-medium">Outcome</p>
                  <p className="font-semibold text-green-900">{dispute.resolution}</p>
                </div>
                {dispute.resolution_notes && (
                  <div>
                    <p className="text-xs text-green-700 font-medium">Notes</p>
                    <p className="text-sm text-green-800">{dispute.resolution_notes}</p>
                  </div>
                )}
                {dispute.refund_amount && (
                  <div>
                    <p className="text-xs text-green-700 font-medium">Refund Amount</p>
                    <p className="font-semibold text-green-900">${dispute.refund_amount}</p>
                  </div>
                )}
                {dispute.resolved_at && (
                  <div>
                    <p className="text-xs text-green-700 font-medium">Resolved Date</p>
                    <p className="text-sm text-green-800">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resolve Dispute</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Refunded">Refunded</option>
                  <option value="Settled">Settled</option>
                  <option value="Dismissed">Dismissed</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              {resolutionData.resolution === "Refunded" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
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
import React, { useEffect, useState } from "react";
import { XCircleIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import type { IdentityVerification } from "../../services/api/identityVerificationApi";
import {
  getIdentityVerificationsByStatus,
  DOCUMENT_TYPE_LABELS,
} from "../../services/api/identityVerificationApi";

const Rejected: React.FC = () => {
  const navigate = useNavigate();
  const [rejected, setRejected] = useState<IdentityVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadRejected = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getIdentityVerificationsByStatus("rejected", { page: 1, limit: 50 });
      setRejected(res.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to load rejected verifications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRejected();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-full shadow-lg"
            style={{ background: "linear-gradient(135deg, #2d1b69, #7F56D9)" }}
          >
            <XCircleIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#2d1b69" }}>
            Rejected Identity Verifications
          </h1>
          <p className="text-gray-600 text-xs">Identity documents that were not approved</p>
        </div>

        {/* Stats */}
        <div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 max-w-xs mx-auto"
          style={{ border: "1px solid #ddd0ec" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-xs uppercase" style={{ color: "#7F56D9" }}>Rejected</p>
              <p className="text-xl font-bold" style={{ color: "#2d1b69" }}>
                {rejected.length}
              </p>
            </div>
            <XCircleIcon className="h-5 w-5" style={{ color: "#7F56D9" }} />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-white/80 rounded-lg p-2 shadow" style={{ border: "1px solid #ddd0ec" }}>
            <p className="text-xs font-bold" style={{ color: "#2d1b69" }}>Total Rejected</p>
            <p className="text-lg font-bold" style={{ color: "#7F56D9" }}>{rejected.length}</p>
          </div>
          <div className="bg-white/80 rounded-lg p-2 shadow" style={{ border: "1px solid #ddd0ec" }}>
            <p className="text-xs font-bold" style={{ color: "#2d1b69" }}>Next Step</p>
            <p className="text-xs text-gray-500">Re-upload corrected documents</p>
          </div>
          <div className="bg-white/80 rounded-lg p-2 shadow" style={{ border: "1px solid #ddd0ec" }}>
            <p className="text-xs font-bold" style={{ color: "#2d1b69" }}>Tips</p>
            <p className="text-xs text-gray-500">Ensure documents are clear and not expired</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r">
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: "#ddd0ec", borderTopColor: "#7F56D9" }}
              ></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        ) : rejected.length === 0 ? (
          <div className="text-center py-6">
            <IdentificationIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No rejected identity verifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rejected.map((item) => (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                style={{ border: "1px solid #ddd0ec" }}
              >
                {/* Header row (always visible) */}
                <div
                  className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #ede7f8, #f5f0fc)" }}
                  >
                    <span className="font-bold text-xs" style={{ color: "#7F56D9" }}>
                      {(item.user?.full_name || item.user_id).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate" style={{ color: "#2d1b69" }}>
                      {item.user?.full_name || item.user_id}
                    </h3>
                    <p className="text-gray-500 text-xs">{item.user?.email || ""}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        item.user_type === "student"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {item.user_type}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: "#f5f0fc", color: "#6941C6" }}
                    >
                      {DOCUMENT_TYPE_LABELS[item.document_type]}
                    </span>
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">
                      REJECTED
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedId === item.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded details */}
                {expandedId === item.id && (
                  <div className="border-t p-3 space-y-2" style={{ borderColor: "#ddd0ec" }}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Submitted</p>
                        <p className="font-medium">{new Date(item.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reviewed</p>
                        <p className="font-medium">
                          {item.reviewed_at ? new Date(item.reviewed_at).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Storage</p>
                        <p className="font-medium uppercase">{item.storage_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reviewer</p>
                        <p className="font-medium">{item.reviewer?.full_name || "-"}</p>
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {item.rejection_reason && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r">
                        <p className="text-red-700 text-xs font-medium mb-1">Rejection Reason:</p>
                        <p className="text-red-600 text-xs">{item.rejection_reason}</p>
                      </div>
                    )}

                    {/* Recommended actions */}
                    <div className="rounded-lg p-2" style={{ backgroundColor: "#f5f0fc", border: "1px solid #ddd0ec" }}>
                      <p className="text-xs font-medium mb-1" style={{ color: "#2d1b69" }}>Recommended Actions:</p>
                      <ul className="text-xs space-y-0.5 list-disc list-inside" style={{ color: "#6941C6" }}>
                        <li>Review the rejection reason carefully</li>
                        <li>Ensure the document is clear, legible, and not expired</li>
                        <li>Upload a valid, high-quality scan or photo</li>
                      </ul>
                    </div>

                    <button
                      className="px-4 py-1.5 text-white rounded-lg text-xs font-medium transition-all shadow hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #2d1b69, #7F56D9)" }}
                      onClick={() => navigate("/dashboard/identity/pending")}
                    >
                      Resubmit Verification
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rejected;

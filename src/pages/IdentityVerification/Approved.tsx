import React, { useEffect, useState } from "react";
import { CheckCircleIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import type { IdentityVerification } from "../../services/api/identityVerificationApi";
import {
  getIdentityVerificationsByStatus,
  DOCUMENT_TYPE_LABELS,
} from "../../services/api/identityVerificationApi";
import api from "../../services/api/axiosInstance";

const Approved: React.FC = () => {
  const [approved, setApproved] = useState<IdentityVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [, setViewerBlob] = useState<Blob | null>(null);
  const [viewerContentType, setViewerContentType] = useState<string | null>(null);

  const loadApproved = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getIdentityVerificationsByStatus("accepted", { page: 1, limit: 50 });
      setApproved(res.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to load approved verifications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApproved();
  }, []);

  const handleViewDocument = async (item: IdentityVerification) => {
    try {
      setError(null);
      if (item.storage_type === "s3") {
        const res = await api.get(`/identity-verifications/${item.id}/document`);
        const url = (res?.data as any)?.url;
        if (url) {
          setViewerUrl(url);
          setViewerBlob(null);
          setViewerContentType(null);
          setShowViewer(true);
        }
        return;
      }
      const blobRes = await api.get(`/identity-verifications/${item.id}/document`, {
        responseType: "blob",
      });
      const blob = blobRes.data as Blob;
      const objectUrl = window.URL.createObjectURL(blob);
      setViewerUrl(objectUrl);
      setViewerBlob(blob);
      setViewerContentType(blob.type || null);
      setShowViewer(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to open document");
    }
  };

  const closeViewer = () => {
    if (viewerUrl && viewerUrl.startsWith("blob:")) {
      window.URL.revokeObjectURL(viewerUrl);
    }
    setShowViewer(false);
    setViewerUrl(null);
    setViewerBlob(null);
    setViewerContentType(null);
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
            <CheckCircleIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#2d1b69" }}>
            Approved Identity Verifications
          </h1>
          <p className="text-gray-600 text-xs">Successfully verified identity documents</p>
        </div>

        {/* Stats */}
        <div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 max-w-xs mx-auto"
          style={{ border: "1px solid #ddd0ec" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-xs uppercase" style={{ color: "#7F56D9" }}>Approved</p>
              <p className="text-xl font-bold" style={{ color: "#2d1b69" }}>
                {approved.length}
              </p>
            </div>
            <CheckCircleIcon className="h-5 w-5" style={{ color: "#7F56D9" }} />
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
        ) : approved.length === 0 ? (
          <div className="text-center py-6">
            <IdentificationIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No approved identity verifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {approved.map((item) => (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3"
                style={{ border: "1px solid #ddd0ec" }}
              >
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
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
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
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
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                      APPROVED
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.reviewer && (
                      <span className="text-gray-400 text-xs">by {item.reviewer.full_name}</span>
                    )}
                    {item.reviewed_at && (
                      <span className="text-gray-400 text-xs">
                        {new Date(item.reviewed_at).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      className="px-3 py-1 text-white rounded-lg text-xs font-medium transition-all hover:opacity-90"
                      style={{ backgroundColor: "#7F56D9" }}
                      onClick={() => handleViewDocument(item)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Viewer Modal */}
        {showViewer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black/40" onClick={closeViewer} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] z-60 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
                <h3 className="text-lg font-bold" style={{ color: "#2d1b69" }}>Document Viewer</h3>
                <button
                  className="px-3 py-1 text-sm text-white rounded"
                  style={{ backgroundColor: "#7F56D9" }}
                  onClick={closeViewer}
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                {viewerUrl ? (
                  viewerContentType?.startsWith("image/") ? (
                    <img src={viewerUrl} alt="document" className="mx-auto max-h-full w-auto object-contain" />
                  ) : (
                    <iframe src={viewerUrl} className="w-full h-full border-0 min-h-[500px] sm:min-h-[600px]" title="Document" />
                  )
                ) : (
                  <div className="text-center p-8">No document to display</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approved;

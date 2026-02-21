import React, { useEffect, useState } from "react";
import { CheckCircleIcon, EyeIcon, CalendarIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import { getAcademicVerificationsByStatus } from "../../services/api/academicVerificationApi";
import api from "../../services/api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

const Approved: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [approved, setApproved] = useState<AcademicVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerBlob, setViewerBlob] = useState<Blob | null>(null);
  const [viewerContentType, setViewerContentType] = useState<string | null>(null);

  useEffect(() => {
    const loadApproved = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAcademicVerificationsByStatus("accepted", {
          page: 1,
          limit: 50,
        });
        setApproved(res.data || []);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load approved verifications";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void loadApproved();
  }, []);

  const handleViewDocument = async (item: AcademicVerification) => {
    try {
      setError(null);

      if (item.storage_type === 's3') {
        const res = await api.get(`/academic-verifications/${item.id}/document`);
        const url = (res?.data as any)?.url;
        if (url) {
          setViewerUrl(url);
          setViewerBlob(null);
          setViewerContentType(null);
          setShowViewer(true);
        } else {
          setError('Could not obtain document URL');
        }
        return;
      }

      // Local storage: fetch blob and open inside modal
      const blobRes = await api.get(`/academic-verifications/${item.id}/document`, {
        responseType: 'blob',
      });

      const blob = blobRes.data as Blob;
      const objectUrl = window.URL.createObjectURL(blob);
      setViewerUrl(objectUrl);
      setViewerBlob(blob);
      setViewerContentType(blob.type || null);
      setShowViewer(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to open document';
      setError(msg);
    }
  };

  const closeViewer = () => {
    if (viewerUrl && viewerUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(viewerUrl);
    }
    setShowViewer(false);
    setViewerUrl(null);
    setViewerBlob(null);
    setViewerContentType(null);
  };

  const downloadViewer = async () => {
    try {
      if (viewerBlob) {
        const url = window.URL.createObjectURL(viewerBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      if (viewerUrl) {
        // fetch the resource and download as blob
        const r = await fetch(viewerUrl, { credentials: 'include' });
        const b = await r.blob();
        const url = window.URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      setError(e?.message || 'Download failed');
    }
  };

  return (
    <div
      className="p-4 min-h-full"
      style={{ background: isDark ? "linear-gradient(to bottom right, #0f0a1a, #1a1528)" : "linear-gradient(to bottom right, #f0fdf4, #ecfdf5)" }}
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
            <CheckCircleIcon className="h-6 w-6 text-white" />
          </div>
          <h1
            className="text-2xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: isDark ? "linear-gradient(to right, #34d399, #6ee7b7)" : "linear-gradient(to right, #16a34a, #059669)" }}
          >
            Approved Verifications
          </h1>
          <p style={{ color: isDark ? "#a0aec0" : "#4b5563" }} className="text-sm">Successfully verified academic credentials</p>
        </div>

        {/* Stats Card */}
        <div
          className="backdrop-blur-sm rounded-xl shadow-lg border p-4 max-w-xs mx-auto"
          style={{
            backgroundColor: isDark ? "#1e1833" : "rgba(255,255,255,0.8)",
            borderColor: isDark ? "rgba(45,27,105,0.5)" : "rgba(255,255,255,0.2)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: isDark ? "#34d399" : "#16a34a" }} className="font-bold text-xs uppercase">Approved</p>
              <p
                className="text-2xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: isDark ? "linear-gradient(to right, #34d399, #6ee7b7)" : "linear-gradient(to right, #16a34a, #059669)" }}
              >
                {approved.length}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isDark ? "rgba(16,185,129,0.2)" : "#dcfce7" }}
            >
              <CheckCircleIcon className="h-5 w-5" style={{ color: isDark ? "#34d399" : "#16a34a" }} />
            </div>
          </div>
        </div>

        {error && (
          <div
            className="border-l-4 p-3 rounded-r"
            style={{
              backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
              borderColor: isDark ? "#dc2626" : "#f87171",
            }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: isDark ? "#f87171" : "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p style={{ color: isDark ? "#f87171" : "#dc2626" }} className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full animate-spin"
                style={{
                  border: "2px solid",
                  borderColor: isDark ? "rgba(16,185,129,0.3)" : "#bbf7d0",
                  borderTopColor: isDark ? "#34d399" : "#16a34a",
                }}
              />
              <p style={{ color: isDark ? "#a0aec0" : "#4b5563" }} className="text-sm">Loading approved verifications...</p>
            </div>
          </div>
        ) : approved.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-2" style={{ color: isDark ? "#4a5568" : "#9ca3af" }} />
            <p style={{ color: isDark ? "#a0aec0" : "#6b7280" }}>No approved verifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-sm rounded-xl shadow-lg border p-4 hover:shadow-xl transition-all"
                style={{
                  backgroundColor: isDark ? "#1e1833" : "rgba(255,255,255,0.8)",
                  borderColor: isDark ? "rgba(45,27,105,0.5)" : "rgba(255,255,255,0.2)",
                }}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: isDark
                            ? "linear-gradient(to right, rgba(16,185,129,0.2), rgba(5,150,105,0.2))"
                            : "linear-gradient(to right, #dcfce7, #d1fae5)",
                        }}
                      >
                        <span style={{ color: isDark ? "#34d399" : "#16a34a" }} className="font-bold text-sm">
                          {item.user?.full_name?.charAt(0)?.toUpperCase() || item.user_id.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold" style={{ color: isDark ? "#fff" : "#1f2937" }}>
                          {item.user?.full_name || `User ${item.user_id.slice(0, 8)}`}
                        </h3>
                        <div className="flex items-center gap-4 text-xs" style={{ color: isDark ? "#a0aec0" : "#6b7280" }}>
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            <span>{item.user?.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                              {item.reviewed_at ? new Date(item.reviewed_at).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                          style={{
                            backgroundColor: isDark ? "rgba(16,185,129,0.2)" : "#dcfce7",
                            color: isDark ? "#34d399" : "#166534",
                          }}
                        >
                          <CheckCircleIcon className="w-3 h-3" />
                          Approved
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div
                        className="rounded-lg p-2"
                        style={{ backgroundColor: isDark ? "#0f0a1a" : "#f9fafb" }}
                      >
                        <div className="flex items-center gap-1 mb-1" style={{ color: isDark ? "#a0aec0" : "#4b5563" }}>
                          <ClockIcon className="w-3 h-3" />
                          <span className="font-medium">Reviewed By</span>
                        </div>
                        <p style={{ color: isDark ? "#e2e8f0" : "#1f2937" }}>{item.reviewer?.full_name || "N/A"}</p>
                      </div>
                      <div
                        className="rounded-lg p-2"
                        style={{ backgroundColor: isDark ? "#0f0a1a" : "#f9fafb" }}
                      >
                        <div className="flex items-center gap-1 mb-1" style={{ color: isDark ? "#a0aec0" : "#4b5563" }}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-medium">Storage Type</span>
                        </div>
                        <p className="uppercase" style={{ color: isDark ? "#e2e8f0" : "#1f2937" }}>{item.storage_type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:min-w-[120px]">
                    <button
                      onClick={() => handleViewDocument(item)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showViewer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
            <div
              className="fixed inset-0"
              style={{ backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)" }}
              onClick={closeViewer}
            />
            <div
              className="relative rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] z-60 flex flex-col overflow-hidden"
              style={{ backgroundColor: isDark ? "#1a1528" : "#fff" }}
            >
              <div
                className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0"
                style={{ borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb" }}
              >
                <h3 className="text-lg font-bold" style={{ color: isDark ? "#fff" : "#111827" }}>Document Viewer</h3>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm bg-green-500 text-white rounded" onClick={downloadViewer}>Download</button>
                  <button className="px-3 py-1 text-sm bg-red-400 text-white rounded" onClick={closeViewer}>Close</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                {viewerUrl ? (
                  viewerContentType?.startsWith('image/') ? (
                    <img src={viewerUrl} alt="document" className="mx-auto max-h-full w-auto object-contain" />
                  ) : viewerContentType === 'application/pdf' || viewerUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={viewerUrl} className="w-full h-full border-0 min-h-[500px] sm:min-h-[600px]" title="Document" />
                  ) : (
                    <iframe src={viewerUrl} className="w-full h-full border-0 min-h-[500px] sm:min-h-[600px]" title="Document" />
                  )
                ) : (
                  <div className="text-center p-8" style={{ color: isDark ? "#a0aec0" : "#6b7280" }}>No document to display</div>
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

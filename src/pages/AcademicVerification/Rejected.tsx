import React, { useEffect, useState } from "react";
import { XCircleIcon, EyeIcon, CalendarIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import { getAcademicVerificationsByStatus } from "../../services/api/academicVerificationApi";
import api from "../../services/api/axiosInstance";

const Rejected: React.FC = () => {
  const [rejected, setRejected] = useState<AcademicVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerBlob, setViewerBlob] = useState<Blob | null>(null);
  const [viewerContentType, setViewerContentType] = useState<string | null>(null);

  useEffect(() => {
    const loadRejected = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAcademicVerificationsByStatus("rejected", {
          page: 1,
          limit: 50,
        });
        setRejected(res.data || []);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load rejected verifications";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void loadRejected();
  }, []);

  const handleViewDocument = async (item: AcademicVerification) => {
    try {
      setError(null);

      if (item.storage_type === 's3') {
        const res = await api.get(`/academic-verifications/${item.id}/document`);
        const url = res?.data?.url;
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
    <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-lg">
            <XCircleIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Rejected Verifications
          </h1>
          <p className="text-gray-600 text-sm">Academic verification requests that were rejected</p>
        </div>

        {/* Stats Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 max-w-xs mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 font-bold text-xs uppercase">Rejected</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {rejected.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Loading rejected verifications...</p>
            </div>
          </div>
        ) : rejected.length === 0 ? (
          <div className="text-center py-8">
            <XCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No rejected verifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rejected.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-100 to-rose-100 flex items-center justify-center">
                        <span className="text-red-600 font-bold text-sm">
                          {item.user?.full_name?.charAt(0)?.toUpperCase() || item.user_id.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">
                          {item.user?.full_name || `User ${item.user_id.slice(0, 8)}`}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
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
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <XCircleIcon className="w-3 h-3" />
                          Rejected
                        </span>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {item.rejection_reason && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r">
                        <div className="flex items-center gap-1 text-red-600 mb-1">
                          <span className="font-medium text-xs">Rejection Reason:</span>
                        </div>
                        <p className="text-red-700 text-sm">{item.rejection_reason}</p>
                      </div>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <ClockIcon className="w-3 h-3" />
                          <span className="font-medium">Reviewed By</span>
                        </div>
                        <p className="text-gray-800">{item.reviewer?.full_name || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-medium">Storage Type</span>
                        </div>
                        <p className="text-gray-800 uppercase">{item.storage_type}</p>
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
            <div className="fixed inset-0 bg-black/40" onClick={closeViewer} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] z-60 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
                <h3 className="text-lg font-bold">Document Viewer</h3>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm bg-green-500 rounded" onClick={downloadViewer}>Download</button>
                  <button className="px-3 py-1 text-sm bg-red-400 rounded" onClick={closeViewer}>Close</button>
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

export default Rejected;

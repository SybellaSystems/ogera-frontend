import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import { getAcademicVerificationsByStatus } from "../../services/api/academicVerificationApi";
import api from "../../services/api/axiosInstance";

const ResubmissionRequired: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<AcademicVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerBlob, setViewerBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAcademicVerificationsByStatus("resubmission_required", {
          page: 1,
          limit: 50,
        });
        setItems(res.data || []);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          t("pages.academic.failedToLoadResubmissionRequired");
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void loadItems();
  }, []);

  const handleViewDocument = async (item: AcademicVerification) => {
    try {
      setError(null);

      if (item.storage_type === "s3") {
        const res = await api.get<{ url?: string }>(`/academic-verifications/${item.id}/document`);
        const url = res?.data?.url;
        if (url) {
          setViewerUrl(url);
          setViewerBlob(null);
          setShowViewer(true);
        } else {
          setError(t("pages.academic.couldNotObtainUrl"));
        }
        return;
      }

      const blobRes = await api.get(`/academic-verifications/${item.id}/document`, {
        responseType: "blob",
      });

      const blob = blobRes.data as Blob;
      const objectUrl = window.URL.createObjectURL(blob);
      setViewerUrl(objectUrl);
      setViewerBlob(blob);
      setShowViewer(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("pages.academic.failedToOpenDocument");
      setError(msg);
    }
  };

  const closeViewer = () => {
    if (viewerUrl && viewerUrl.startsWith("blob:")) {
      window.URL.revokeObjectURL(viewerUrl);
    }
    setShowViewer(false);
    setViewerUrl(null);
    setViewerBlob(null);
  };

  const downloadViewer = async () => {
    try {
      if (viewerBlob) {
        const url = window.URL.createObjectURL(viewerBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      if (viewerUrl) {
        const r = await fetch(viewerUrl, { credentials: "include" });
        const b = await r.blob();
        const url = window.URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      setError(e?.message || t("pages.academic.downloadFailed"));
    }
  };

  return (
    <div className="academic-page theme-page-bg p-3 min-h-full">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">{t("pages.academic.resubmissionRequiredTitle")}</h1>
            <p className="text-gray-500 text-xs">{t("pages.academic.resubmissionRequiredSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
            <ArrowPathIcon className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700 font-bold text-sm">{items.length} Resubmission</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r">
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-[#e0d8f0] border-t-[#7f56d9] rounded-full animate-spin mr-2"></div>
              <p className="text-gray-500 text-sm">{t("pages.academic.loading")}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <ArrowPathIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t("pages.academic.noResubmissionRequiredYet")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reviewed By</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f5f3ff]/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#7f56d9] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-[10px]">
                              {(item.user?.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.user?.full_name || "Unknown"}</p>
                            <p className="text-gray-400 text-[10px]">{item.user?.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 text-xs truncate max-w-[150px] block">
                          {(item.document_path?.split('/').pop() || "Document").replace(/^\d+-/, '')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[200px]">
                        {item.rejection_reason ? (
                          <span className="text-orange-600">{item.rejection_reason}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.reviewer?.full_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-700">
                          Resubmit
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDocument(item)}
                          className="cursor-pointer px-3 py-1.5 bg-[#7f56d9] hover:bg-[#5b3ba5] text-white rounded-lg text-xs font-medium transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="fixed inset-0 bg-black/40" onClick={closeViewer} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] z-60 flex flex-col overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="text-lg font-bold text-gray-800">{t("pages.academic.documentViewer")}</h3>
              <div className="flex items-center gap-2">
                <button className="cursor-pointer px-3 py-1 text-sm bg-[#7f56d9] text-white rounded" onClick={downloadViewer}>{t("pages.academic.download")}</button>
                <button className="cursor-pointer px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded" onClick={closeViewer}>{t("pages.academic.close")}</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              {viewerUrl ? (
                <iframe src={viewerUrl} className="w-full h-full border-0 min-h-[500px]" title="Document" />
              ) : (
                <div className="text-center p-8 text-gray-500">{t("pages.academic.noDocumentToDisplay")}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResubmissionRequired;


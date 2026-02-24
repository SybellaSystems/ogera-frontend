import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import {
  getMyAcademicVerification,
  getPendingAcademicVerifications,
  reviewAcademicVerification,
} from "../../services/api/academicVerificationApi";
import api from "../../services/api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import AcademicVerificationDetailModal from "../../components/AcademicVerificationDetailModal";
import {
  logAcademicVerificationEvent,
  ACADEMIC_ACTIONS,
} from "../../utils/academicVerificationAudit";

interface RootState {
  auth: {
    role: string;
    user?: { full_name?: string; email?: string };
  };
}

const PendingReviews: React.FC = () => {
  const role = useSelector((state: RootState) => state.auth.role);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const adminName = currentUser?.full_name || currentUser?.email || "Admin";
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // -------- detail modal state --------
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<AcademicVerification | null>(null);

  // -------- student state --------
  const [myVerification, setMyVerification] = useState<
    AcademicVerification | null
  >(null);
  const [uploading, setUploading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentSuccess, setStudentSuccess] = useState<string | null>(null);

  // -------- admin state --------
  const [pending, setPending] = useState<AcademicVerification[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>(
    {}
  );
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerBlob, setViewerBlob] = useState<Blob | null>(null);
  const [viewerContentType, setViewerContentType] = useState<string | null>(null);

  // ---------- helpers ----------
  const loadMyVerification = async () => {
    try {
      setStudentError(null);
      const res = await getMyAcademicVerification();
      setMyVerification(res.data);
    } catch (err: any) {
      // If not found, keep null
      setMyVerification(null);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not fetch academic verification";
      setStudentError(msg);
    }
  };

  const loadPendingForAdmin = async () => {
    try {
      setLoadingAdmin(true);
      setAdminError(null);
      const res = await getPendingAcademicVerifications({ page: 1, limit: 20 });
      setPending(res.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load pending academic verifications";
      setAdminError(msg);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (role === "student") {
      void loadMyVerification();
    } else if (role === "admin" || role === "superadmin" || role === "verifyDocAdmin") {
      void loadPendingForAdmin();
    }
  }, [role]);

  // ---------- handlers (student) ----------
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setStudentError(null);
      setStudentSuccess(null);

      // Decide whether to upload new or re-upload based on status
      if (myVerification && myVerification.status === "rejected") {
        const { reuploadAcademicVerification } = await import(
          "../../services/api/academicVerificationApi"
        );
        await reuploadAcademicVerification(myVerification.id, file);
        logAcademicVerificationEvent(
          ACADEMIC_ACTIONS.DOCUMENT_REUPLOADED,
          "success",
          { verificationId: myVerification.id, userName: adminName, userEmail: currentUser?.email || "" },
          adminName,
          undefined,
          { fileName: file.name }
        );
        setStudentSuccess(
          "Document re-uploaded successfully. It will be reviewed again."
        );
      } else {
        const { uploadAcademicVerification } = await import(
          "../../services/api/academicVerificationApi"
        );
        await uploadAcademicVerification(file);
        logAcademicVerificationEvent(
          ACADEMIC_ACTIONS.DOCUMENT_UPLOADED,
          "success",
          { verificationId: "new", userName: adminName, userEmail: currentUser?.email || "" },
          adminName,
          undefined,
          { fileName: file.name }
        );
        setStudentSuccess(
          "Document uploaded successfully. Status is now pending."
        );
      }

      await loadMyVerification();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload document";
      setStudentError(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ---------- handlers (admin) ----------
  const handleReview = async (
    id: string,
    status: "accepted" | "rejected"
  ): Promise<void> => {
    const item = pending.find((p) => p.id === id);
    const verInfo = {
      verificationId: id,
      userName: item?.user?.full_name || id,
      userEmail: item?.user?.email || "",
    };
    try {
      setReviewLoadingId(id);
      setAdminError(null);

      const rejection_reason =
        status === "rejected" ? rejectionNotes[id] || "" : undefined;

      await reviewAcademicVerification({ id, status, rejection_reason });

      logAcademicVerificationEvent(
        status === "accepted"
          ? ACADEMIC_ACTIONS.VERIFICATION_APPROVED
          : ACADEMIC_ACTIONS.VERIFICATION_REJECTED,
        "success",
        verInfo,
        adminName,
        rejection_reason
      );

      await loadPendingForAdmin();
    } catch (err: any) {
      logAcademicVerificationEvent(
        status === "accepted"
          ? ACADEMIC_ACTIONS.VERIFICATION_APPROVED
          : ACADEMIC_ACTIONS.VERIFICATION_REJECTED,
        "failure",
        verInfo,
        adminName
      );
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to review academic verification";
      setAdminError(msg);
    } finally {
      setReviewLoadingId(null);
    }
  };

  const handleViewDocument = async (item: AcademicVerification) => {
    try {
      setAdminError(null);

      if (item.storage_type === 's3') {
        const res = await api.get(`/academic-verifications/${item.id}/document`);
        const url = (res?.data as any)?.url;
        if (url) {
          setViewerUrl(url);
          setViewerBlob(null);
          setViewerContentType(null);
          setShowViewer(true);
        } else {
          setAdminError('Could not obtain document URL');
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
      setAdminError(msg);
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
      setAdminError(e?.message || 'Download failed');
    }
  };

  // Theme-aware styles (inline to bypass Tailwind v4 gradient issues)
  const pageBg = isDark
    ? { background: "linear-gradient(to bottom right, #0f0a1a, #1a1528)" }
    : { background: "linear-gradient(to bottom right, #faf5ff, #eef2ff)" };

  const cardBg = isDark
    ? { backgroundColor: "#1e1833", borderColor: "rgba(45, 27, 105, 0.5)" }
    : { backgroundColor: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.2)" };

  const headingGradient = isDark
    ? { backgroundImage: "linear-gradient(to right, #c084fc, #818cf8)" }
    : { backgroundImage: "linear-gradient(to right, #9333ea, #4f46e5)" };

  // ===================== STUDENT VIEW =====================
  if (role === "student") {
    return (
      <div className="p-3 min-h-full" style={pageBg}>
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg">
              <DocumentCheckIcon className="h-5 w-5 text-white" />
            </div>
            <h1
              className="text-xl font-bold bg-clip-text text-transparent"
              style={headingGradient}
            >
              Academic Verification
            </h1>
            <p style={{ color: isDark ? "#a0aec0" : "#4b5563" }} className="text-xs">
              Upload and track verification status
            </p>
          </div>

          {/* Status Card */}
          <div
            className="backdrop-blur-sm rounded-xl shadow-lg border p-3"
            style={cardBg}
          >
            <h2
              className="text-base font-bold mb-2"
              style={{ color: isDark ? "#fff" : "#1f2937" }}
            >
              Status
            </h2>
            {myVerification ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: isDark ? "#cbd5e0" : "#374151" }} className="text-sm">
                    Current:
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={
                      myVerification.status === "accepted"
                        ? { backgroundColor: isDark ? "rgba(16,185,129,0.2)" : "#dcfce7", color: isDark ? "#34d399" : "#15803d" }
                        : myVerification.status === "rejected"
                        ? { backgroundColor: isDark ? "rgba(239,68,68,0.2)" : "#fee2e2", color: isDark ? "#f87171" : "#b91c1c" }
                        : { backgroundColor: isDark ? "rgba(234,179,8,0.2)" : "#fef9c3", color: isDark ? "#fbbf24" : "#a16207" }
                    }
                  >
                    {myVerification.status}
                  </span>
                </div>
                {myVerification.rejection_reason && (
                  <div
                    className="border-l-4 p-2 rounded-r"
                    style={{
                      backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
                      borderColor: isDark ? "#dc2626" : "#f87171",
                    }}
                  >
                    <p style={{ color: isDark ? "#fca5a5" : "#b91c1c" }} className="text-xs font-medium">
                      Reason:
                    </p>
                    <p style={{ color: isDark ? "#f87171" : "#dc2626" }} className="text-xs">
                      {myVerification.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: isDark ? "#a0aec0" : "#6b7280" }} className="text-sm">
                No document uploaded
              </p>
            )}
          </div>

          {/* Upload Card */}
          <div
            className="backdrop-blur-sm rounded-xl shadow-lg border p-3"
            style={cardBg}
          >
            <h2
              className="text-base font-bold mb-2"
              style={{ color: isDark ? "#fff" : "#1f2937" }}
            >
              {myVerification?.status === "rejected" ? "Re-upload" : "Upload"}
            </h2>

            <div
              className="rounded-lg p-2 mb-2 border"
              style={{
                backgroundColor: isDark ? "rgba(139,92,246,0.1)" : "#faf5ff",
                borderColor: isDark ? "rgba(139,92,246,0.3)" : "#e9d5ff",
              }}
            >
              <p style={{ color: isDark ? "#c084fc" : "#7c3aed" }} className="text-xs">
                PDF, JPG, PNG, DOC, DOCX &bull; Max 10MB
              </p>
            </div>

            {studentError && (
              <div
                className="border-l-4 p-2 rounded-r mb-2"
                style={{
                  backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
                  borderColor: isDark ? "#dc2626" : "#f87171",
                }}
              >
                <p style={{ color: isDark ? "#f87171" : "#dc2626" }} className="text-xs">
                  {studentError}
                </p>
              </div>
            )}

            {studentSuccess && (
              <div
                className="border-l-4 p-2 rounded-r mb-2"
                style={{
                  backgroundColor: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4",
                  borderColor: isDark ? "#059669" : "#4ade80",
                }}
              >
                <p style={{ color: isDark ? "#34d399" : "#16a34a" }} className="text-xs">
                  {studentSuccess}
                </p>
              </div>
            )}

            <label className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium cursor-pointer transition-all shadow-md hover:shadow-lg ${
              uploading ? 'opacity-75 cursor-not-allowed' : ''
            }`}>
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
              <span>{uploading ? "Uploading..." : "Choose File"}</span>
              <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>

            {myVerification?.status === "pending" && (
              <div
                className="rounded-lg p-2 mt-3 text-center border"
                style={{
                  backgroundColor: isDark ? "rgba(234,179,8,0.1)" : "#fefce8",
                  borderColor: isDark ? "rgba(234,179,8,0.3)" : "#fde68a",
                }}
              >
                <p style={{ color: isDark ? "#fbbf24" : "#ca8a04" }} className="text-xs">
                  Under review by verification team
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===================== ADMIN/VERIFYDOCADMIN VIEW =====================
  return (
    <div className="p-3 min-h-full" style={pageBg}>
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg">
            <DocumentCheckIcon className="h-5 w-5 text-white" />
          </div>
          <h1
            className="text-xl font-bold bg-clip-text text-transparent"
            style={headingGradient}
          >
            Pending Reviews
          </h1>
          <p style={{ color: isDark ? "#a0aec0" : "#4b5563" }} className="text-xs">
            Academic verifications awaiting review
          </p>
        </div>

        {/* Stats */}
        <div
          className="backdrop-blur-sm rounded-xl shadow-lg border p-3 max-w-xs mx-auto"
          style={cardBg}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: isDark ? "#c084fc" : "#7c3aed" }} className="font-bold text-xs uppercase">
                Pending
              </p>
              <p
                className="text-xl font-bold bg-clip-text text-transparent"
                style={headingGradient}
              >
                {pending.length}
              </p>
            </div>
            <DocumentCheckIcon className="h-5 w-5" style={{ color: isDark ? "#c084fc" : "#7c3aed" }} />
          </div>
        </div>

        {adminError && (
          <div
            className="border-l-4 p-2 rounded-r"
            style={{
              backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
              borderColor: isDark ? "#dc2626" : "#f87171",
            }}
          >
            <p style={{ color: isDark ? "#f87171" : "#dc2626" }} className="text-xs">
              {adminError}
            </p>
          </div>
        )}

        {loadingAdmin ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full animate-spin"
                style={{
                  border: "2px solid",
                  borderColor: isDark ? "rgba(139,92,246,0.3)" : "#e9d5ff",
                  borderTopColor: isDark ? "#c084fc" : "#7c3aed",
                }}
              />
              <p style={{ color: isDark ? "#a0aec0" : "#4b5563" }} className="text-sm">
                Loading...
              </p>
            </div>
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-6">
            <DocumentCheckIcon className="h-10 w-10 mx-auto mb-2" style={{ color: isDark ? "#4a5568" : "#9ca3af" }} />
            <p style={{ color: isDark ? "#a0aec0" : "#6b7280" }} className="text-sm">
              No pending verifications
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-sm rounded-xl shadow-lg border p-3"
                style={cardBg}
              >
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isDark
                            ? "linear-gradient(to right, rgba(139,92,246,0.2), rgba(99,102,241,0.2))"
                            : "linear-gradient(to right, #f3e8ff, #e0e7ff)",
                        }}
                      >
                        <span style={{ color: isDark ? "#c084fc" : "#7c3aed" }} className="font-bold text-xs">
                          {item.user_id.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-bold text-sm truncate"
                          style={{ color: isDark ? "#fff" : "#1f2937" }}
                        >
                          ID: {item.user_id}
                        </h3>
                        <p style={{ color: isDark ? "#a0aec0" : "#6b7280" }} className="text-xs">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: isDark ? "rgba(139,92,246,0.2)" : "#f3e8ff",
                          color: isDark ? "#c4b5fd" : "#6b21a8",
                        }}
                      >
                        {item.storage_type.toUpperCase()}
                      </span>
                    </div>

                    {/* Rejection Reason */}
                    <div>
                      <label
                        className="block font-medium text-xs mb-1"
                        style={{ color: isDark ? "#cbd5e0" : "#374151" }}
                      >
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full rounded-lg border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        style={{
                          backgroundColor: isDark ? "#0f0a1a" : "#fff",
                          borderColor: isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb",
                          color: isDark ? "#e2e8f0" : "#111827",
                        }}
                        rows={2}
                        placeholder="Required for rejection..."
                        value={rejectionNotes[item.id] || ""}
                        onChange={(e) =>
                          setRejectionNotes((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:min-w-[130px] flex-shrink-0">
                    <button
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50"
                      onClick={() => handleViewDocument(item)}
                    >
                      View Doc
                    </button>
                    <button
                      className="flex-1 px-3 py-2 text-white rounded-lg font-medium transition-all text-xs"
                      style={{ backgroundColor: isDark ? "#7c3aed" : "#7F56D9" }}
                      onClick={() => {
                        setSelectedVerification(item);
                        setDetailModalOpen(true);
                      }}
                    >
                      Details
                    </button>
                    <button
                      className={`flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50 ${
                        reviewLoadingId === item.id ? 'animate-pulse' : ''
                      }`}
                      disabled={reviewLoadingId === item.id}
                      onClick={() => handleReview(item.id, "accepted")}
                    >
                      {reviewLoadingId === item.id ? "Approving..." : "Approve"}
                    </button>

                    <button
                      className={`flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50 ${
                        reviewLoadingId === item.id ? 'animate-pulse' : ''
                      }`}
                      disabled={reviewLoadingId === item.id}
                      onClick={() => handleReview(item.id, "rejected")}
                    >
                      {reviewLoadingId === item.id ? "Rejecting..." : "Reject"}
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
                <h3 className="text-lg font-bold" style={{ color: isDark ? "#fff" : "#111827" }}>
                  Document Viewer
                </h3>
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
                  <div className="text-center p-8" style={{ color: isDark ? "#a0aec0" : "#6b7280" }}>
                    No document to display
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AcademicVerificationDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedVerification(null);
        }}
        verification={selectedVerification}
      />
    </div>
  );
};

export default PendingReviews;

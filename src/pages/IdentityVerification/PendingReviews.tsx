import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IdentificationIcon } from "@heroicons/react/24/outline";
import type {
  IdentityVerification,
  IdentityDocumentType,
} from "../../services/api/identityVerificationApi";
import {
  getMyIdentityVerification,
  getPendingIdentityVerifications,
  reviewIdentityVerification,
  DOCUMENT_TYPE_LABELS,
  STUDENT_DOC_TYPES,
  EMPLOYER_DOC_TYPES,
} from "../../services/api/identityVerificationApi";
import api from "../../services/api/axiosInstance";

interface RootState {
  auth: {
    role: string;
  };
}

const PendingReviews: React.FC = () => {
  const role = useSelector((state: RootState) => state.auth.role);

  // -------- student/employer state --------
  const [myVerification, setMyVerification] = useState<IdentityVerification | null>(null);
  const [uploading, setUploading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentSuccess, setStudentSuccess] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<IdentityDocumentType | "">("");

  // -------- admin state --------
  const [pending, setPending] = useState<IdentityVerification[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerBlob, setViewerBlob] = useState<Blob | null>(null);
  const [viewerContentType, setViewerContentType] = useState<string | null>(null);

  const isStudentOrEmployer = role === "student" || role === "employer";
  const docTypeOptions = role === "employer" ? EMPLOYER_DOC_TYPES : STUDENT_DOC_TYPES;

  // ---------- helpers ----------
  const loadMyVerification = async () => {
    try {
      setStudentError(null);
      const res = await getMyIdentityVerification();
      setMyVerification(res.data);
    } catch (err: any) {
      setMyVerification(null);
      const msg =
        err?.response?.data?.message || err?.message || "Could not fetch identity verification";
      if (!msg.includes("not found")) {
        setStudentError(msg);
      }
    }
  };

  const loadPendingForAdmin = async () => {
    try {
      setLoadingAdmin(true);
      setAdminError(null);
      const res = await getPendingIdentityVerifications({ page: 1, limit: 20 });
      setPending(res.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to load pending identity verifications";
      setAdminError(msg);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (isStudentOrEmployer) {
      void loadMyVerification();
    } else if (role === "admin" || role === "superadmin" || role === "verifyDocAdmin") {
      void loadPendingForAdmin();
    }
  }, [role]);

  // ---------- SLA helpers ----------
  const getElapsedHours = (submittedAt: string): number => {
    return Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60));
  };

  const getSLABadge = (submittedAt: string) => {
    const hours = getElapsedHours(submittedAt);
    if (hours >= 48) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
          SLA BREACHED ({hours}h)
        </span>
      );
    }
    if (hours >= 36) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
          Near SLA ({hours}h)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#f5f0fc", color: "#6941C6" }}>
        {hours}h ago
      </span>
    );
  };

  // ---------- handlers (student/employer) ----------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedDocType) {
      setStudentError("Please select a document type before uploading.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setStudentError(null);
      setStudentSuccess(null);

      if (myVerification && myVerification.status === "rejected") {
        const { reuploadIdentityVerification } = await import(
          "../../services/api/identityVerificationApi"
        );
        await reuploadIdentityVerification(myVerification.id, file);
        setStudentSuccess("Document re-uploaded successfully. It will be reviewed again.");
      } else {
        const { uploadIdentityVerification } = await import(
          "../../services/api/identityVerificationApi"
        );
        await uploadIdentityVerification(file, selectedDocType as IdentityDocumentType);
        setStudentSuccess("Document uploaded successfully. Status is now pending.");
      }

      await loadMyVerification();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to upload document";
      setStudentError(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ---------- handlers (admin) ----------
  const handleReview = async (id: string, status: "accepted" | "rejected"): Promise<void> => {
    try {
      setReviewLoadingId(id);
      setAdminError(null);

      const rejection_reason = status === "rejected" ? rejectionNotes[id] || "" : undefined;
      await reviewIdentityVerification({ id, status, rejection_reason });
      await loadPendingForAdmin();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to review identity verification";
      setAdminError(msg);
    } finally {
      setReviewLoadingId(null);
    }
  };

  const handleViewDocument = async (item: IdentityVerification) => {
    try {
      setAdminError(null);

      if (item.storage_type === "s3") {
        const res = await api.get(`/identity-verifications/${item.id}/document`);
        const url = (res?.data as any)?.url;
        if (url) {
          setViewerUrl(url);
          setViewerBlob(null);
          setViewerContentType(null);
          setShowViewer(true);
        } else {
          setAdminError("Could not obtain document URL");
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
      const msg = err?.response?.data?.message || err?.message || "Failed to open document";
      setAdminError(msg);
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
      setAdminError(e?.message || "Download failed");
    }
  };

  // ===================== STUDENT / EMPLOYER VIEW =====================
  if (isStudentOrEmployer) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Header */}
          <div className="text-center space-y-1">
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-full shadow-lg"
              style={{ background: "linear-gradient(135deg, #2d1b69, #7F56D9)" }}
            >
              <IdentificationIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#2d1b69" }}>
              Identity Verification
            </h1>
            <p className="text-gray-600 text-xs">Upload your identity document for verification</p>
          </div>

          {/* Status Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3">
            <h2 className="text-base font-bold mb-2" style={{ color: "#2d1b69" }}>Status</h2>
            {myVerification ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-700 text-sm">Current:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      myVerification.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : myVerification.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {myVerification.status}
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#f5f0fc", color: "#6941C6" }}
                  >
                    {DOCUMENT_TYPE_LABELS[myVerification.document_type]}
                  </span>
                </div>
                {myVerification.status === "pending" && (
                  <p className="text-gray-500 text-xs">
                    Submitted {getElapsedHours(myVerification.submitted_at)}h ago
                  </p>
                )}
                {myVerification.rejection_reason && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r">
                    <p className="text-red-700 text-xs font-medium">Reason:</p>
                    <p className="text-red-600 text-xs">{myVerification.rejection_reason}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No document uploaded</p>
            )}
          </div>

          {/* Upload Card */}
          {(!myVerification || myVerification.status === "rejected") && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3">
              <h2 className="text-base font-bold mb-2" style={{ color: "#2d1b69" }}>
                {myVerification?.status === "rejected" ? "Re-upload Document" : "Upload Document"}
              </h2>

              <div className="rounded-lg p-2 mb-2" style={{ backgroundColor: "#f5f0fc", border: "1px solid #ddd0ec" }}>
                <p className="text-xs" style={{ color: "#6941C6" }}>PDF, JPG, PNG, DOC, DOCX - Max 10MB</p>
              </div>

              {/* Document Type Selector */}
              <div className="mb-3">
                <label className="block text-gray-700 font-medium text-xs mb-1">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{ borderColor: "#ddd0ec" }}
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as IdentityDocumentType)}
                >
                  <option value="">-- Select document type --</option>
                  {docTypeOptions.map((dt) => (
                    <option key={dt} value={dt}>
                      {DOCUMENT_TYPE_LABELS[dt]}
                    </option>
                  ))}
                </select>
              </div>

              {studentError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r mb-2">
                  <p className="text-red-600 text-xs">{studentError}</p>
                </div>
              )}

              {studentSuccess && (
                <div className="bg-green-50 border-l-4 border-green-400 p-2 rounded-r mb-2">
                  <p className="text-green-600 text-xs">{studentSuccess}</p>
                </div>
              )}

              <label
                className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium cursor-pointer transition-all shadow-md hover:shadow-lg ${
                  uploading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                style={{ background: "linear-gradient(135deg, #2d1b69, #7F56D9)" }}
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                )}
                <span>{uploading ? "Uploading..." : "Choose File"}</span>
                <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
          )}

          {/* Accepted state */}
          {myVerification?.status === "accepted" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-green-700 text-sm font-medium">
                Your identity has been verified successfully.
              </p>
            </div>
          )}

          {/* Pending state */}
          {myVerification?.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
              <p className="text-yellow-600 text-xs">Under review by verification team</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===================== ADMIN / VERIFYDOCADMIN VIEW =====================
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-full shadow-lg"
            style={{ background: "linear-gradient(135deg, #2d1b69, #7F56D9)" }}
          >
            <IdentificationIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#2d1b69" }}>
            Identity Verification - Pending Reviews
          </h1>
          <p className="text-gray-600 text-xs">Identity documents awaiting review (KPI: &lt;48h)</p>
        </div>

        {/* Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3 max-w-xs mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-xs uppercase" style={{ color: "#7F56D9" }}>Pending</p>
              <p className="text-xl font-bold" style={{ color: "#2d1b69" }}>
                {pending.length}
              </p>
            </div>
            <IdentificationIcon className="h-5 w-5" style={{ color: "#7F56D9" }} />
          </div>
        </div>

        {adminError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r">
            <p className="text-red-600 text-xs">{adminError}</p>
          </div>
        )}

        {loadingAdmin ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: "#ddd0ec", borderTopColor: "#7F56D9" }}
              ></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-6">
            <IdentificationIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No pending identity verifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((item) => (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3"
              >
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    {/* User Info */}
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {/* Badges */}
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
                      {getSLABadge(item.submitted_at)}
                    </div>

                    {/* Rejection Reason */}
                    <div>
                      <label className="block text-gray-700 font-medium text-xs mb-1">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full rounded-lg border px-2 py-1 text-xs focus:outline-none focus:ring-1 resize-none"
                        style={{ borderColor: "#ddd0ec" }}
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
                      className="flex-1 px-3 py-2 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50"
                      style={{ backgroundColor: "#7F56D9" }}
                      onClick={() => handleViewDocument(item)}
                    >
                      View
                    </button>
                    <button
                      className={`flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50 ${
                        reviewLoadingId === item.id ? "animate-pulse" : ""
                      }`}
                      disabled={reviewLoadingId === item.id}
                      onClick={() => handleReview(item.id, "accepted")}
                    >
                      {reviewLoadingId === item.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      className={`flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50 ${
                        reviewLoadingId === item.id ? "animate-pulse" : ""
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

        {/* Document Viewer Modal */}
        {showViewer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black/40" onClick={closeViewer} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] z-60 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
                <h3 className="text-lg font-bold" style={{ color: "#2d1b69" }}>Document Viewer</h3>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 text-sm text-white rounded"
                    style={{ backgroundColor: "#7F56D9" }}
                    onClick={downloadViewer}
                  >
                    Download
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-red-400 text-white rounded"
                    onClick={closeViewer}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                {viewerUrl ? (
                  viewerContentType?.startsWith("image/") ? (
                    <img
                      src={viewerUrl}
                      alt="document"
                      className="mx-auto max-h-full w-auto object-contain"
                    />
                  ) : (
                    <iframe
                      src={viewerUrl}
                      className="w-full h-full border-0 min-h-[500px] sm:min-h-[600px]"
                      title="Document"
                    />
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

export default PendingReviews;

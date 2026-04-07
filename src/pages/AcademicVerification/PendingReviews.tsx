import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import {
  getMyAcademicVerification,
  getPendingAcademicVerifications,
  reviewAcademicVerification,
} from "../../services/api/academicVerificationApi";
import api from "../../services/api/axiosInstance";
import toast from "react-hot-toast";

const PendingReviews: React.FC = () => {
  const { t } = useTranslation();
  const roleRaw = useSelector((state: any) => state.auth.role);
  const role = (typeof roleRaw === 'object' ? (roleRaw?.roleType || roleRaw?.roleName || '') : (typeof roleRaw === 'string' ? roleRaw : '')).toLowerCase();

  // -------- student state --------
  const [myVerifications, setMyVerifications] = useState<AcademicVerification[]>([]);
  const [loadingStudent, setLoadingStudent] = useState(false);
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
      setLoadingStudent(true);
      setStudentError(null);
      const res = await getMyAcademicVerification();
      const data = res.data;
      const all = Array.isArray(data) ? data : data ? [data] : [];
      setMyVerifications(all.filter((d: any) => d.status === "pending"));
    } catch (err: any) {
      setMyVerifications([]);
      const data = err?.response?.data;
      const raw =
        (typeof data?.message === "string" ? data.message : null) ||
        (typeof data?.error === "string" ? data.error : null) ||
        (typeof data?.msg === "string" ? data.msg : null) ||
        (typeof err?.message === "string" ? err.message : null) ||
        "";
      setStudentError(
        raw ? getTranslatedErrorMessage(raw) : t("pages.academic.failedToFetch")
      );
    } finally {
      setLoadingStudent(false);
    }
  };

  const loadPendingForAdmin = async () => {
    try {
      setLoadingAdmin(true);
      setAdminError(null);
      const res = await getPendingAcademicVerifications({ page: 1, limit: 20 });
      setPending(res.data || []);
    } catch (err: any) {
      const data = err?.response?.data;
      const raw =
        (typeof data?.message === "string" ? data.message : null) ||
        (typeof data?.error === "string" ? data.error : null) ||
        (typeof data?.msg === "string" ? data.msg : null) ||
        (typeof err?.message === "string" ? err.message : null) ||
        "";
      setAdminError(
        raw ? getTranslatedErrorMessage(raw) : t("pages.academic.failedToLoadPending")
      );
    } finally {
      setLoadingAdmin(false);
    }
  };

  // Map known API messages / rejection reasons to translated strings so they follow the selected language
  const getTranslatedErrorMessage = (apiMessage: string | undefined): string => {
    if (!apiMessage || typeof apiMessage !== "string") return apiMessage || "";
    const lower = apiMessage.toLowerCase().trim();
    // Match "incorrect document / please upload the correct document" in various phrasings
    const hasCorrectDocument = lower.includes("correct document");
    const hasWrongOrNotCorrect =
      lower.includes("not correct") ||
      lower.includes("incorrect") ||
      lower.includes("wrong document") ||
      lower.includes("not the correct");
    const hasUpload = lower.includes("upload") || lower.includes("laai");
    if (hasCorrectDocument && hasWrongOrNotCorrect && hasUpload) {
      return t("pages.academic.incorrectDocumentMessage");
    }
    return apiMessage;
  };

  useEffect(() => {
    if (role === "student") {
      void loadMyVerification();
    } else if (role === "admin" || role === "superadmin" || role === "verifydocadmin" || role?.includes("admin")) {
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

      // Always upload as a new document
      const { uploadAcademicVerification } = await import(
        "../../services/api/academicVerificationApi"
      );
      await uploadAcademicVerification(file);
      setStudentSuccess(t("pages.academic.documentUploadedSuccess"));

      await loadMyVerification();
    } catch (err: any) {
      const data = err?.response?.data;
      const raw =
        (typeof data?.message === "string" ? data.message : null) ||
        (typeof data?.error === "string" ? data.error : null) ||
        (typeof data?.msg === "string" ? data.msg : null) ||
        (typeof err?.message === "string" ? err.message : null) ||
        "";
      setStudentError(
        raw ? getTranslatedErrorMessage(raw) : t("pages.academic.failedToUpload")
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ---------- handlers (admin) ----------
  const handleReview = async (
    id: string,
    status: "accepted" | "rejected" | "resubmission_required"
  ): Promise<void> => {
    try {
      setReviewLoadingId(id);
      setAdminError(null);

      const needsReason = status === "rejected" || status === "resubmission_required";
      const rejection_reason = needsReason ? rejectionNotes[id]?.trim() || "" : undefined;

      if (needsReason && !rejection_reason) {
        setAdminError(t("pages.academic.reasonRequired"));
        setReviewLoadingId(null);
        return;
      }

      await reviewAcademicVerification({ id, status, rejection_reason });
      toast.success(
        status === "accepted" ? "Verification approved successfully" :
        status === "rejected" ? "Verification rejected" :
        "Resubmission requested"
      );
      await loadPendingForAdmin();
    } catch (err: any) {
      const data = err?.response?.data;
      const raw =
        (typeof data?.message === "string" ? data.message : null) ||
        (typeof data?.error === "string" ? data.error : null) ||
        (typeof data?.msg === "string" ? data.msg : null) ||
        (typeof err?.message === "string" ? err.message : null) ||
        "";
      setAdminError(
        raw ? getTranslatedErrorMessage(raw) : t("pages.academic.failedToReview")
      );
    } finally {
      setReviewLoadingId(null);
    }
  };

  const handleViewDocument = async (item: AcademicVerification) => {
    try {
      setAdminError(null);

      if (item.storage_type === 's3') {
        const res = await api.get<{ url?: string }>(`/academic-verifications/${item.id}/document`);
        const url = res?.data?.url;
        if (url) {
          setViewerUrl(url);
          setViewerBlob(null);
          setViewerContentType(null);
          setShowViewer(true);
        } else {
          setAdminError(t("pages.academic.couldNotObtainUrl"));
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
      const raw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "";
      setAdminError(
        raw ? getTranslatedErrorMessage(raw) : t("pages.academic.failedToOpenDocument")
      );
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
      setAdminError(e?.message || t("pages.academic.downloadFailed"));
    }
  };

  // ===================== STUDENT VIEW =====================
  if (role === "student") {
    return (
      <div className="academic-page theme-page-bg p-3 min-h-full">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header + Upload */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800">{t("pages.academic.title")}</h1>
              <p className="text-gray-500 text-xs">{t("pages.academic.subtitle")}</p>
            </div>
            <label className={`inline-flex items-center gap-2 px-4 py-2 bg-[#7f56d9] hover:bg-[#5b3ba5] text-white rounded-lg font-medium cursor-pointer transition-all text-sm ${
              uploading ? 'opacity-75 cursor-not-allowed' : ''
            }`}>
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              <span>{uploading ? t("pages.academic.uploading") : "Upload Document"}</span>
              <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>

          {studentError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r">
              <p className="text-red-600 text-xs">{studentError}</p>
            </div>
          )}

          {studentSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-2 rounded-r">
              <p className="text-green-600 text-xs">{studentSuccess}</p>
            </div>
          )}

          {/* Documents Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">
                Submitted Documents ({myVerifications.length})
              </h2>
            </div>

            {loadingStudent ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-[#e0d8f0] border-t-[#7f56d9] rounded-full animate-spin mr-2"></div>
                <p className="text-gray-500 text-sm">Loading documents...</p>
              </div>
            ) : myVerifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uploaded</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Feedback</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myVerifications.map((doc, index) => (
                      <tr key={doc.id} className="border-b border-gray-50 hover:bg-[#f5f3ff]/50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 text-xs">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#f5f3ff] rounded-lg flex items-center justify-center flex-shrink-0">
                              <DocumentCheckIcon className="w-4 h-4 text-[#7f56d9]" />
                            </div>
                            <span className="font-medium text-gray-800 truncate max-w-[200px]">
                              {(doc.document_path?.split('/').pop() || "Document").replace(/^\d+-/, '')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" - "}
                          {new Date(doc.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            doc.status === "accepted" ? "bg-green-100 text-green-700"
                            : doc.status === "rejected" || doc.status === "resubmission_required" ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {doc.status === "accepted" ? t("pages.academic.approved")
                            : doc.status === "rejected" ? t("pages.academic.rejected")
                            : doc.status === "resubmission_required" ? t("pages.academic.resubmissionRequired")
                            : t("pages.academic.pending")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                          {doc.rejection_reason ? (
                            <span className="text-red-600">{getTranslatedErrorMessage(doc.rejection_reason)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleViewDocument(doc)}
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
            ) : (
              <div className="text-center py-10">
                <DocumentCheckIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("pages.academic.noDocumentUploaded")}</p>
                <p className="text-gray-400 text-xs mt-1">Upload your academic documents to get verified</p>
              </div>
            )}
          </div>

          {/* File types hint */}
          <div className="bg-[#f5f3ff] border border-[#e0d8f0] rounded-lg p-2">
            <p className="text-[#7f56d9] text-xs">{t("pages.academic.fileTypesHint")}</p>
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
                  viewerContentType?.startsWith('image/') ? (
                    <img src={viewerUrl} alt="document" className="mx-auto max-h-full w-auto object-contain" />
                  ) : (
                    <iframe src={viewerUrl} className="w-full h-full border-0 min-h-[500px]" title="Document" />
                  )
                ) : (
                  <div className="text-center p-8 text-gray-500">{t("pages.academic.noDocumentToDisplay")}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================== ADMIN/VERIFYDOCADMIN VIEW =====================
  return (
    <div className="academic-page theme-page-bg p-3 min-h-full">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-[#7f56d9] rounded-full shadow-lg">
            <DocumentCheckIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#7f56d9]">
            {t("pages.academic.pendingReviews")}
          </h1>
          <p className="text-gray-600 text-xs">{t("pages.academic.awaitingReview")}</p>
        </div>

        {/* Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3 max-w-xs mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7f56d9] font-bold text-xs uppercase">{t("pages.academic.pending")}</p>
              <p className="text-xl font-bold text-[#7f56d9]">
                {pending.length}
              </p>
            </div>
            <DocumentCheckIcon className="h-5 w-5 text-[#7f56d9]" />
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
              <div className="w-5 h-5 border-2 border-[#e0d8f0] border-t-[#7f56d9] rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">{t("pages.academic.loading")}</p>
            </div>
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-6">
            <DocumentCheckIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">{t("pages.academic.noPendingVerifications")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#7f56d9] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {(item.user?.full_name || item.user_id).split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">{item.user?.full_name || item.user_id}</h3>
                        <p className="text-gray-500 text-xs">
                          {item.user?.email && <span className="mr-2">{item.user.email}</span>}
                          {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(item.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </p>
                      </div>
                      <span className="bg-[#f5f3ff] text-[#5b3ba5] px-2 py-1 rounded text-xs font-bold flex-shrink-0">
                        {item.storage_type.toUpperCase()}
                      </span>
                    </div>

                    {/* Review reason (required for reject/resubmission required) */}
                    <div>
                      <label className="cursor-pointer block text-gray-700 font-medium text-xs mb-1">
                        {t("pages.academic.reviewReason")} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#7f56d9] focus:border-[#7f56d9] resize-none"
                        rows={2}
                        placeholder={t("pages.academic.reviewReasonPlaceholder")}
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
                      className={`cursor-pointer flex-1 px-3 py-2 bg-[#7f56d9] hover:bg-[#5b3ba5] text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50`}
                      onClick={() => handleViewDocument(item)}
                    >
                      {t("pages.academic.view")}
                    </button>
                    <button
                      className={`cursor-pointer flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50 ${
                        reviewLoadingId === item.id ? 'animate-pulse' : ''
                      }`}
                      disabled={reviewLoadingId === item.id}
                      onClick={() => handleReview(item.id, "accepted")}
                    >
                      {reviewLoadingId === item.id ? t("pages.academic.approving") : t("pages.academic.approve")}
                    </button>
                    
                    <button
                      className={`cursor-pointer flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50 ${
                        reviewLoadingId === item.id ? 'animate-pulse' : ''
                      }`}
                      disabled={reviewLoadingId === item.id}
                      onClick={() => handleReview(item.id, "rejected")}
                    >
                      {reviewLoadingId === item.id ? t("pages.academic.rejecting") : t("pages.academic.reject")}
                    </button>
                    <button
                      className={`cursor-pointer flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all text-xs disabled:opacity-50 ${
                        reviewLoadingId === item.id ? 'animate-pulse' : ''
                      }`}
                      disabled={reviewLoadingId === item.id}
                      onClick={() => handleReview(item.id, "resubmission_required")}
                    >
                      {reviewLoadingId === item.id
                        ? t("pages.academic.markingResubmission")
                        : t("pages.academic.resubmission")}
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
            <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] z-60 flex flex-col overflow-hidden theme-modal border border-gray-200">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
                <h3 className="text-lg font-bold">{t("pages.academic.documentViewer")}</h3>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm bg-[#7f56d9] text-white rounded cursor-pointer" onClick={downloadViewer}>{t("pages.academic.download")}</button>
                  <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded cursor-pointer" onClick={closeViewer}>{t("pages.academic.close")}</button>
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
                  <div className="text-center p-8">{t("pages.academic.noDocumentToDisplay")}</div>
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

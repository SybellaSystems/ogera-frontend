import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import {
  getMyAcademicVerification,
  getPendingAcademicVerifications,
  reviewAcademicVerification,
} from "../../services/api/academicVerificationApi";

interface RootState {
  auth: {
    role: string;
  };
}

const PendingReviews: React.FC = () => {
  const role = useSelector((state: RootState) => state.auth.role);

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
        setStudentSuccess(
          "Document re-uploaded successfully. It will be reviewed again."
        );
      } else {
        const { uploadAcademicVerification } = await import(
          "../../services/api/academicVerificationApi"
        );
        await uploadAcademicVerification(file);
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
    try {
      setReviewLoadingId(id);
      setAdminError(null);

      const rejection_reason =
        status === "rejected" ? rejectionNotes[id] || "" : undefined;

      await reviewAcademicVerification({ id, status, rejection_reason });
      await loadPendingForAdmin();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to review academic verification";
      setAdminError(msg);
    } finally {
      setReviewLoadingId(null);
    }
  };

  // ===================== STUDENT VIEW =====================
  if (role === "student") {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg">
              <DocumentCheckIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Academic Verification
            </h1>
            <p className="text-gray-600 text-xs">Upload and track verification status</p>
          </div>

          {/* Status Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3">
            <h2 className="text-base font-bold text-gray-800 mb-2">Status</h2>
            {myVerification ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 text-sm">Current:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    myVerification.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : myVerification.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {myVerification.status}
                  </span>
                </div>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3">
            <h2 className="text-base font-bold text-gray-800 mb-2">
              {myVerification?.status === "rejected" ? "Re-upload" : "Upload"}
            </h2>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mb-2">
              <p className="text-purple-600 text-xs">PDF, JPG, PNG, DOC, DOCX • Max 10MB</p>
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-3 text-center">
                <p className="text-yellow-600 text-xs">Under review by verification team</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===================== ADMIN/VERIFYDOCADMIN VIEW =====================
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg">
            <DocumentCheckIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Pending Reviews
          </h1>
          <p className="text-gray-600 text-xs">Academic verifications awaiting review</p>
        </div>

        {/* Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3 max-w-xs mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-bold text-xs uppercase">Pending</p>
              <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {pending.length}
              </p>
            </div>
            <DocumentCheckIcon className="h-5 w-5 text-purple-600" />
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
              <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-6">
            <DocumentCheckIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No pending verifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-xs">
                          {item.user_id.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">ID: {item.user_id}</h3>
                        <p className="text-gray-500 text-xs">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold flex-shrink-0">
                        {item.storage_type.toUpperCase()}
                      </span>
                    </div>

                    {/* Rejection Reason */}
                    <div>
                      <label className="block text-gray-700 font-medium text-xs mb-1">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
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
      </div>
    </div>
  );
};

export default PendingReviews;

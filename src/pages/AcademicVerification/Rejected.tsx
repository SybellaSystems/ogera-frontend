import React, { useEffect, useState } from "react";
import { XCircleIcon, ChevronDownIcon, ExclamationTriangleIcon, ArrowPathIcon, ClipboardDocumentListIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import { getAcademicVerificationsByStatus } from "../../services/api/academicVerificationApi";

const Rejected: React.FC = () => {
  const [rejected, setRejected] = useState<AcademicVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <XCircleIcon className="h-10 w-10 text-red-600" />
          Rejected Verifications
        </h1>
        <p className="text-gray-500 mt-2">
          Review rejected academic verification requests and resubmit with corrections
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium text-lg">
                {rejected.length} Rejection{rejected.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-600 mt-0.5">Awaiting your action</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <ClipboardDocumentListIcon className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-amber-700 font-medium text-lg">Next Step</p>
              <p className="text-xs text-amber-600 mt-0.5">Review feedback & resubmit</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <LightBulbIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-blue-700 font-medium text-lg">Tip</p>
              <p className="text-xs text-blue-600 mt-0.5">Address all noted issues</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error Loading Verifications</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin mb-4">
            <ArrowPathIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Loading rejected verifications…</p>
        </div>
      ) : rejected.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <XCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-700">No Rejected Verifications</p>
          <p className="text-sm text-gray-500 mt-1">Great news! All your submissions have been approved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rejected.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md border-2 border-red-100 hover:shadow-lg hover:border-red-200 transition-all duration-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-red-600 font-bold text-lg flex-shrink-0">
                      {item.user?.full_name?.charAt(0)?.toUpperCase() ||
                        item.user_id.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.user?.full_name || `User ${item.user_id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-gray-500">{item.user?.email || "N/A"}</p>
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="inline-flex items-start gap-2">
                          <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
                            Rejection Reason:
                          </span>
                          <span className="text-sm text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                            {item.rejection_reason || "No reason provided"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Rejected on {item.reviewed_at
                            ? new Date(item.reviewed_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      expandedId === item.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === item.id && (
                <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white p-6 space-y-4">
                  {/* Full Details Section */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Verification Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 font-medium">Submitted On</p>
                        <p className="text-sm text-gray-900 font-semibold mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 font-medium">Storage Type</p>
                        <p className="text-sm text-gray-900 font-semibold mt-1">{item.storage_type || "N/A"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 font-medium">Status</p>
                        <p className="text-sm text-red-600 font-semibold mt-1">Rejected</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 font-medium">Reviewed By</p>
                        <p className="text-sm text-gray-900 font-semibold mt-1">
                          {item.reviewer?.full_name || "System"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason Details */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs text-red-700 font-semibold uppercase tracking-wide mb-2">⚠️ Rejection Feedback</p>
                    <p className="text-sm text-red-800">
                      {item.rejection_reason || "No detailed feedback provided"}
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-3">📋 Recommended Actions</p>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="text-base mt-0.5">✓</span>
                        <span>Review the rejection reason carefully</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-base mt-0.5">✓</span>
                        <span>Gather required documents or correct information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-base mt-0.5">✓</span>
                        <span>Resubmit your verification with corrections</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2">
                      <ArrowPathIcon className="h-4 w-4" />
                      Resubmit Verification
                    </button>
                    <button className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition">
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rejected;

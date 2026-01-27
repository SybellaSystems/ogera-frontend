import React, { useEffect, useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import type { AcademicVerification } from "../../services/api/academicVerificationApi";
import { getAcademicVerificationsByStatus } from "../../services/api/academicVerificationApi";

const Rejected: React.FC = () => {
  const [rejected, setRejected] = useState<AcademicVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          Academic verification requests that were rejected
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 font-medium">
          ✗ {rejected.length} verification{rejected.length !== 1 ? "s" : ""}{" "}
          rejected
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading rejected verifications…</p>
      ) : rejected.length === 0 ? (
        <p className="text-sm text-gray-500">No rejected verifications yet.</p>
      ) : (
        <div className="space-y-4">
          {rejected.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-6 shadow-md border border-red-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
                    {item.user?.full_name?.charAt(0)?.toUpperCase() ||
                      item.user_id.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.user?.full_name || `User ${item.user_id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.user?.email || "N/A"}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 font-medium">
                        Reason:{" "}
                      </span>
                      <span className="text-sm text-red-600 font-semibold">
                        {item.rejection_reason || "No reason provided"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Rejected on:{" "}
                      {item.reviewed_at
                        ? new Date(item.reviewed_at).toLocaleString()
                        : "N/A"}
                    </p>
                    {item.reviewer && (
                      <p className="text-xs text-gray-400 mt-1">
                        Reviewed by: {item.reviewer.full_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rejected;

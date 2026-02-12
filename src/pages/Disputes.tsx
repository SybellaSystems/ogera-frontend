import React, { useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getAllDisputes, getDisputeStats, type Dispute, type DisputeStats } from "../services/api/disputesApi";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const Disputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats>({ open: 0, underReview: 0, resolved: 0, highPriority: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [disputesData, statsData] = await Promise.all([
        getAllDisputes({ page: 1, limit: 10 }),
        getDisputeStats(),
      ]);
      setDisputes(disputesData.data || []);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
          Disputes
        </h1>
        <p className="text-gray-500 mt-2">Manage and resolve disputes between students and employers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Open Disputes</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">{stats.open}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Under Review</p>
                    <p className="text-3xl font-bold text-orange-900 mt-2">{stats.underReview}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Resolved This Month</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{stats.resolved}</p>
        </div>
      </div>

      <div className="space-y-4">
        {disputes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center">
            <p className="text-gray-500 text-lg">No disputes found</p>
          </div>
        ) : (
          disputes.map((dispute) => (
            <div key={dispute.dispute_id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dispute.status === "Open" ? "bg-red-100 text-red-700" :
                      dispute.status === "Under Review" ? "bg-orange-100 text-orange-700" :
                      dispute.status === "Resolved" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {dispute.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dispute.priority === "High" ? "bg-red-100 text-red-700" :
                      dispute.priority === "Medium" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {dispute.priority} Priority
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {dispute.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{dispute.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{dispute.description}</p>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Student</p>
                      <p className="text-sm font-semibold text-gray-900">{dispute.student?.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Employer</p>
                      <p className="text-sm font-semibold text-gray-900">{dispute.employer?.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Reported</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(dispute.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
               <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => navigate(`/dashboard/disputes/${dispute.dispute_id}`)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap"
                  >
                    View Details
                  </button>
                  {dispute.status !== "Resolved" && (
                    <button
                      onClick={() => navigate(`/dashboard/disputes/${dispute.dispute_id}`)}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/dashboard/disputes/${dispute.dispute_id}`)}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap"
                  >
                    Message Parties
                  </button>
                </div>
              </div>
            </div>
         ))
        )}
      </div>
    </div>
  );
};

export default Disputes;


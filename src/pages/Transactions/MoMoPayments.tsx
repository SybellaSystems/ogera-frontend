import React from "react";
import { BanknotesIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useListJobPaymentsQuery } from "../../services/api/momoApi";
import Loader from "../../components/Loader";

const MoMoPayments: React.FC = () => {
  const { data, isLoading, error } = useListJobPaymentsQuery();

  if (isLoading) return <Loader />;

  const payments = data?.data ?? [];
  const funded = payments.filter((p) => p.funding_status === "Funded");
  const pending = payments.filter((p) => p.funding_status === "Pending");

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <BanknotesIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
          MoMo Payments
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Employer payments received and job funding status (MTN MoMo)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Failed to load payments. Please try again.
        </div>
      )}

      {/* Employer payments received / Job funding status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Job funding status</h2>
          <p className="text-sm text-gray-500">Jobs funded or pending via MoMo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid at</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No MoMo payments yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.job_id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.job_title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.employer?.full_name ?? "—"} {p.employer?.mobile_number && `(${p.employer.mobile_number})`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.budget?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3">
                      {p.funding_status === "Funded" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircleIcon className="h-4 w-4" /> Funded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <ClockIcon className="h-4 w-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.momo_paid_at ? new Date(p.momo_paid_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual payouts to students (MVP: placeholder) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Manual payouts to students</h2>
        <p className="text-sm text-gray-500">
          For MVP, Ogera staff manually send payment from the MoMo business wallet to the student’s MoMo wallet and track here. Disbursement API automation can be added later.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Funded jobs: <strong>{funded.length}</strong> · Pending: <strong>{pending.length}</strong>
        </p>
      </div>
    </div>
  );
};

export default MoMoPayments;

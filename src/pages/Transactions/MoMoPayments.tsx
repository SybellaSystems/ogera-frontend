import React, { useState } from "react";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  WalletIcon,
  CurrencyDollarIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useListJobPaymentsQuery, useGetWalletBalanceQuery } from "../../services/api/momoApi";
import Loader from "../../components/Loader";
import type { JobPaymentItem } from "../../services/api/momoApi";

const MoMoPayments: React.FC = () => {
  const { data, isLoading, error } = useListJobPaymentsQuery();
  const { data: walletData } = useGetWalletBalanceQuery();
  const [payoutModal, setPayoutModal] = useState<JobPaymentItem | null>(null);

  if (isLoading) return <Loader />;

  const payments = data?.data ?? [];
  const funded = payments.filter((p) => p.funding_status === "Funded");
  const pending = payments.filter((p) => p.funding_status === "Pending");
  const paid = payments.filter((p) => p.funding_status === "Paid");
  const balance = walletData?.data?.availableBalance ?? "0";
  const currency = walletData?.data?.currency ?? "RWF";
  const totalPaidToStudents = paid.reduce(
    (sum, p) => sum + (p.amount_paid_to_student != null ? Number(p.amount_paid_to_student) : Number(p.budget) || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <BanknotesIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
          MoMo Payments
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Ogera wallet, employer payments, and payouts to students (MTN MoMo)
        </p>
      </div>

      {/* Ogera wallet + Total paid to students */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <WalletIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-200" />
            <h2 className="text-lg md:text-xl font-semibold">Ogera wallet balance</h2>
          </div>
          <p className="text-2xl md:text-4xl font-bold mt-1">
            {Number(balance).toLocaleString()} <span className="text-purple-200 text-lg font-medium">{currency}</span>
          </p>
          <p className="text-sm text-purple-200 mt-2">
            Total received from employers (job + 10% fee).
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <CurrencyDollarIcon className="h-8 w-8 md:h-10 md:w-10 text-emerald-200" />
            <h2 className="text-lg md:text-xl font-semibold">Total paid to students</h2>
          </div>
          <p className="text-2xl md:text-4xl font-bold mt-1">
            {totalPaidToStudents.toLocaleString()} <span className="text-emerald-200 text-lg font-medium">{currency}</span>
          </p>
          <p className="text-sm text-emerald-200 mt-2">
            Sum of all amounts sent to students for completed jobs.
          </p>
        </div>
      </div>

      {/* Summary cards: Pending, Funded, Paid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <ClockIcon className="h-5 w-5" />
            <span className="font-semibold">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">{pending.length}</p>
          <p className="text-xs text-amber-700 mt-1">Awaiting employer MoMo approval</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-semibold">Funded</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">{funded.length}</p>
          <p className="text-xs text-green-700 mt-1">Ready for approve & pay student</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CurrencyDollarIcon className="h-5 w-5" />
            <span className="font-semibold">Paid</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{paid.length}</p>
          <p className="text-xs text-emerald-700 mt-1">Student paid via disbursement</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Failed to load payments. Please try again.
        </div>
      )}

      {/* Job funding status table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">All jobs (Pending, Funded, Paid)</h2>
          <p className="text-sm text-gray-500">Employer pays job + 10% → Funded → Approve work & pay student → Paid</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funded at</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid to student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
                      {p.funding_status === "Paid" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircleIcon className="h-4 w-4" /> Paid
                        </span>
                      ) : p.funding_status === "Funded" ? (
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
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.funding_status === "Paid" ? (
                        <button
                          type="button"
                          onClick={() => setPayoutModal(p)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="View payout details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout details modal */}
      {payoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPayoutModal(null)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payout to student</h3>
              <button
                type="button"
                onClick={() => setPayoutModal(null)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Job</dt>
                <dd className="font-medium text-gray-900">{payoutModal.job_title}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Amount sent to student (90% of wallet)</dt>
                <dd className="text-xl font-bold text-emerald-600">
                  {(payoutModal.amount_paid_to_student ?? payoutModal.budget ?? 0).toLocaleString()} {payoutModal.amount_paid_to_student_currency || payoutModal.currency || "USD"}
                </dd>
              </div>
              {payoutModal.transaction_details?.funding && (
                <div>
                  <dt className="text-gray-500">Funding conversion (Employer to Wallet)</dt>
                  <dd className="text-gray-900">
                    {payoutModal.transaction_details.funding.original_amount.toLocaleString()} {payoutModal.transaction_details.funding.original_currency}
                    {" -> "}
                    {payoutModal.transaction_details.funding.converted_amount.toLocaleString()} {payoutModal.transaction_details.funding.converted_currency}
                    {" @ "}
                    {payoutModal.transaction_details.funding.exchange_rate}
                  </dd>
                </div>
              )}
              {payoutModal.transaction_details?.wallet_deduction && (
                <div>
                  <dt className="text-gray-500">Wallet deduction conversion</dt>
                  <dd className="text-gray-900">
                    {payoutModal.transaction_details.wallet_deduction.original_amount.toLocaleString()} {payoutModal.transaction_details.wallet_deduction.original_currency}
                    {" -> "}
                    {payoutModal.transaction_details.wallet_deduction.converted_amount.toLocaleString()} {payoutModal.transaction_details.wallet_deduction.converted_currency}
                    {" @ "}
                    {payoutModal.transaction_details.wallet_deduction.exchange_rate}
                  </dd>
                </div>
              )}
              {payoutModal.transaction_details?.student_payout && (
                <div>
                  <dt className="text-gray-500">Student payout conversion (Wallet to Student)</dt>
                  <dd className="text-gray-900">
                    {payoutModal.transaction_details.student_payout.original_amount.toLocaleString()} {payoutModal.transaction_details.student_payout.original_currency}
                    {" -> "}
                    {payoutModal.transaction_details.student_payout.converted_amount.toLocaleString()} {payoutModal.transaction_details.student_payout.converted_currency}
                    {" @ "}
                    {payoutModal.transaction_details.student_payout.exchange_rate}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Paid at</dt>
                <dd className="text-gray-900">
                  {payoutModal.paid_at ? new Date(payoutModal.paid_at).toLocaleString() : "—"}
                </dd>
              </div>
              {payoutModal.disbursement_reference_id && (
                <div>
                  <dt className="text-gray-500">Reference</dt>
                  <dd className="text-gray-600 font-mono text-xs break-all">{payoutModal.disbursement_reference_id}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">How it works</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Employer creates job (e.g. 1,000). Ogera adds 10% fee → employer pays 1,100 via MoMo. Ogera wallet receives 1,100.</li>
          <li>Job shows as <strong>Funded</strong>. Student applies; employer <strong>approves</strong> the student.</li>
          <li>When work is done, employer clicks <strong>Approve work & pay student</strong>.</li>
          <li>Ogera sends the job amount (1,000) to the student’s MoMo; job shows as <strong>Paid</strong>. Student gets 90% of wallet (e.g. 990); Ogera keeps 10% (110).</li>
        </ul>
      </div>
    </div>
  );
};

export default MoMoPayments;

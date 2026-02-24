import React from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

const PaymentCancelled: React.FC = () => {
  const handleClose = () => {
    window.close();
    if (!window.closed) {
      window.location.href = "/dashboard/transactions/pay";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <XCircleIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Payment Cancelled</h2>
        <p className="text-gray-500 mt-2">You cancelled the payment. No charges were made.</p>
        <button
          onClick={handleClose}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Close & Return
        </button>
      </div>
    </div>
  );
};

export default PaymentCancelled;

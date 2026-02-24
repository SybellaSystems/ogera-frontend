import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useLazyGetPaymentStatusQuery } from "../services/api/paymentApi";

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [paymentDetails, setPaymentDetails] = useState<Record<string, unknown> | null>(null);
  const [getPaymentStatus] = useLazyGetPaymentStatusQuery();

  const orderTrackingId = searchParams.get("OrderTrackingId");
  const orderMerchantReference = searchParams.get("OrderMerchantReference");

  useEffect(() => {
    if (!orderTrackingId) {
      setStatus("failed");
      return;
    }

    const checkStatus = async () => {
      try {
        const result = await getPaymentStatus(orderTrackingId).unwrap();
        if (result.success && result.data) {
          const data = result.data as { payment_status_description?: string };
          const desc = (data.payment_status_description || "").toLowerCase();
          if (desc.includes("completed") || desc.includes("paid")) {
            setStatus("success");
          } else if (desc.includes("failed") || desc.includes("rejected")) {
            setStatus("failed");
          } else {
            setStatus("pending");
          }
          setPaymentDetails(data as Record<string, unknown>);
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("pending");
      }
    };

    checkStatus();
  }, [orderTrackingId, getPaymentStatus]);

  const handleClose = () => {
    window.close();
    if (!window.closed) {
      window.location.href = "/dashboard/transactions";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        {status === "loading" && (
          <>
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Verifying payment...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500 mt-2">Your payment has been processed successfully.</p>
            {orderMerchantReference && (
              <p className="text-sm text-gray-400 mt-2">Reference: {orderMerchantReference}</p>
            )}
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close & Return
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500 mt-2">Your payment could not be processed. Please try again.</p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close & Return
            </button>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="inline-block h-12 w-12 rounded-full border-4 border-orange-400 border-r-transparent animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Pending</h2>
            <p className="text-gray-500 mt-2">
              Your payment is being processed. You can close this window and check back later.
            </p>
            {paymentDetails && (
              <pre className="mt-4 text-left text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                {JSON.stringify(paymentDetails, null, 2)}
              </pre>
            )}
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;

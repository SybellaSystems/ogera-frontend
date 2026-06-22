import React, { useEffect, useState, useRef } from "react";
import { XMarkIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { SUPPORTED_CURRENCIES } from "../../constants/currencies";
import { useSubscribePremiumMutation, useLazyGetSubscriptionPaymentStatusQuery } from "../../services/api/badgeApi";
import { useLazyGetMoMoStatusQuery } from "../../services/api/momoApi";
import { apiSlice } from "../../services/api/apiSlice";

interface UpgradeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;
  onSuccess?: () => void;
}

const PREMIUM_PRICE = 1000;
const DURATION_DAYS = 30;
/** Same polling cadence as job MoMo funding (JobDetails uses 8s; sandbox badge settles at ~5s). */
const POLL_INTERVAL_MS = 5000;

const UpgradeSubscriptionModal: React.FC<UpgradeSubscriptionModalProps> = ({
  isOpen,
  onClose,
  defaultPhone = "",
  onSuccess,
}) => {
  const [currency, setCurrency] = useState("EUR");
  const [payerPhone, setPayerPhone] = useState(defaultPhone);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollMaxRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dispatch = useDispatch();
  const [subscribePremium, { isLoading }] = useSubscribePremiumMutation();
  const [getMoMoStatus] = useLazyGetMoMoStatusQuery();
  const [pollBadgePayment] = useLazyGetSubscriptionPaymentStatusQuery();

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollStartRef.current) {
      clearTimeout(pollStartRef.current);
      pollStartRef.current = null;
    }
    if (pollMaxRef.current) {
      clearTimeout(pollMaxRef.current);
      pollMaxRef.current = null;
    }
  };

  const handlePaymentSuccess = () => {
    clearPolling();
    setIsPolling(false);
    dispatch(apiSlice.util.invalidateTags(["Badge", "MoMoPayments"]));
    toast.success("Premium subscription activated!");
    onSuccess?.();
    onClose();
  };

  const startMoMoPolling = (referenceId: string) => {
    clearPolling();
    setIsPolling(true);

    const pollOnce = async () => {
      try {
        const badgeRes = await pollBadgePayment(referenceId).unwrap();
        if (badgeRes.data?.status === "SUCCESSFUL") {
          handlePaymentSuccess();
          return;
        }
        if (badgeRes.data?.status === "FAILED") {
          clearPolling();
          setIsPolling(false);
          toast.error("Payment failed. Please try again.");
          return;
        }
      } catch {
        // keep polling
      }

      try {
        const statusRes = await getMoMoStatus(referenceId).unwrap();
        const status = statusRes.data?.status;
        if (status === "SUCCESSFUL") {
          handlePaymentSuccess();
          return;
        }
        if (status === "FAILED") {
          clearPolling();
          setIsPolling(false);
          toast.error("Payment failed. Please try again.");
        }
      } catch {
        // keep polling — same as job funding
      }
    };

    // First check after sandbox auto-approve window (~5s), then every 5s like job flow
    pollStartRef.current = setTimeout(() => {
      void pollOnce();
      pollIntervalRef.current = setInterval(pollOnce, POLL_INTERVAL_MS);
    }, POLL_INTERVAL_MS);

    pollMaxRef.current = setTimeout(() => {
      clearPolling();
      setIsPolling(false);
    }, 120000);
  };

  useEffect(() => {
    if (isOpen) {
      setPayerPhone(defaultPhone);
      setIsPolling(false);
      clearPolling();
    }
    return () => clearPolling();
  }, [isOpen, defaultPhone]);

  if (!isOpen) return null;

  const handlePay = async () => {
    if (!payerPhone.trim()) {
      toast.error("Enter your MoMo phone number");
      return;
    }

    try {
      const result = await subscribePremium({
        currency,
        payerPhone: payerPhone.trim(),
      }).unwrap();

      const ref = result.data?.referenceId;
      if (ref) {
        toast.success("Payment request sent. Confirming payment…");
        startMoMoPolling(ref);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to start payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-6 h-6 text-[#7f56d9]" />
            <h2 className="text-lg font-bold text-gray-900">Premium Subscription</h2>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Upgrade to <strong>PREMIUM</strong> for <strong>{DURATION_DAYS} days</strong>
            </p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {PREMIUM_PRICE.toLocaleString()} <span className="text-base font-medium">{currency}</span>
            </p>
            <ul className="text-xs text-yellow-800 mt-2 space-y-1 list-disc list-inside">
              <li>50 job applications</li>
              <li>Instant job visibility</li>
              <li>Premium job access</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent"
              disabled={isPolling}
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MoMo Phone Number</label>
            <input
              type="tel"
              value={payerPhone}
              onChange={(e) => setPayerPhone(e.target.value)}
              placeholder="e.g. 250788123456"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent"
              disabled={isPolling}
            />
          </div>

          <p className="text-xs text-gray-500">
            Payment method: MTN MoMo — same as job funding. Amount is credited to the Ogera wallet and your badge updates automatically.
          </p>
          {isPolling && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              MoMo payment pending… Sandbox auto-approves in about 5 seconds (same as employer job funding).
            </p>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            disabled={isLoading || isPolling}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={isLoading || isPolling}
            className="cursor-pointer px-5 py-2 text-sm font-semibold text-white bg-[#7f56d9] hover:bg-[#5b3ba5] rounded-lg disabled:opacity-60"
          >
            {isPolling ? "Confirming payment…" : isLoading ? "Sending…" : `Pay ${PREMIUM_PRICE} ${currency} with MoMo`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeSubscriptionModal;

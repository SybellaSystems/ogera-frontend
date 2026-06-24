import React, { useEffect, useState, useRef } from "react";
import {
  XMarkIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
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
const POLL_INTERVAL_MS = 5000;

const PREMIUM_BENEFITS = [
  "50 job applications per month",
  "Instant job visibility — no delay",
  "Premium job access",
  "Priority in employer search",
];

const UpgradeSubscriptionModal: React.FC<UpgradeSubscriptionModalProps> = ({
  isOpen,
  onClose,
  defaultPhone = "",
  onSuccess,
}) => {
  const [currency, setCurrency] = useState("EUR");
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollMaxRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dispatch = useDispatch();
  const [subscribePremium, { isLoading }] = useSubscribePremiumMutation();
  const [getMoMoStatus] = useLazyGetMoMoStatusQuery();
  const [pollBadgePayment] = useLazyGetSubscriptionPaymentStatusQuery();

  const payerPhone = defaultPhone.trim();
  const hasPhone = payerPhone.length > 0;

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
        // keep polling
      }
    };

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
      setIsPolling(false);
      clearPolling();
    }
    return () => clearPolling();
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = async () => {
    if (!hasPhone) {
      toast.error("Add your mobile number in your profile before upgrading.");
      return;
    }

    try {
      const result = await subscribePremium({
        currency,
        payerPhone,
      }).unwrap();

      const ref = result.data?.referenceId;
      if (ref) {
        toast.success("Payment request sent. Approve on your MoMo app…");
        startMoMoPolling(ref);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to start payment");
    }
  };

  const selectedCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currency);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => !isLoading && !isPolling && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#7f56d9] to-[#5b3ba5] px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isPolling}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Upgrade to Premium</h2>
              <p className="text-sm text-white/80">{DURATION_DAYS}-day subscription</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Order summary */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Premium badge ({DURATION_DAYS} days)</span>
              <span className="font-medium text-gray-800">
                {PREMIUM_PRICE.toLocaleString()} {currency}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total to pay</span>
              <span className="text-2xl font-extrabold text-[#7f56d9]">
                {PREMIUM_PRICE.toLocaleString()}{" "}
                <span className="text-base font-semibold">{currency}</span>
              </span>
            </div>
          </div>

          {/* Benefits */}
          <ul className="space-y-2">
            {PREMIUM_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          {/* Currency selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent disabled:opacity-60"
              disabled={isPolling}
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </select>
            {selectedCurrency && (
              <p className="text-xs text-gray-500 mt-1">
                You will be charged in {selectedCurrency.label} ({selectedCurrency.code})
              </p>
            )}
          </div>

          {/* MoMo info from profile */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-purple-100 bg-purple-50">
            <DevicePhoneMobileIcon className="w-5 h-5 text-[#7f56d9] mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-purple-900">MTN Mobile Money</p>
              {hasPhone ? (
                <p className="text-sm text-purple-700 mt-0.5">
                  Payment request will be sent to{" "}
                  <span className="font-semibold">{payerPhone}</span> from your profile.
                </p>
              ) : (
                <p className="text-sm text-red-600 mt-0.5">
                  No mobile number in your profile. Please add one before upgrading.
                </p>
              )}
              <p className="text-xs text-purple-600 mt-1">
                Approve the prompt on your phone to activate Premium instantly.
              </p>
            </div>
          </div>

          {isPolling && (
            <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <CreditCardIcon className="w-5 h-5 shrink-0 animate-pulse" />
              <span>
                Waiting for MoMo approval… This usually takes a few seconds.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            disabled={isLoading || isPolling}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={isLoading || isPolling || !hasPhone}
            className="cursor-pointer px-6 py-2.5 text-sm font-semibold text-white bg-[#7f56d9] hover:bg-[#5b3ba5] rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPolling
              ? "Confirming payment…"
              : isLoading
                ? "Sending request…"
                : `Pay ${PREMIUM_PRICE.toLocaleString()} ${currency}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeSubscriptionModal;

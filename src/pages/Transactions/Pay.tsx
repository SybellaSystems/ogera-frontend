import React, { useState } from "react";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useSubmitPaymentOrderMutation } from "../../services/api/paymentApi";
import Button from "../../components/button";

const CURRENCIES = [
  { code: "KES", label: "Kenyan Shilling" },
  { code: "UGX", label: "Ugandan Shilling" },
  { code: "TZS", label: "Tanzanian Shilling" },
  { code: "MWK", label: "Malawian Kwacha" },
  { code: "RWF", label: "Rwandan Franc" },
  { code: "ZMW", label: "Zambian Kwacha" },
  { code: "ZWL", label: "Zimbabwean Dollar" },
];

const Pay: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [description, setDescription] = useState("Ogera Platform Payment");
  const [error, setError] = useState("");
  const [submitPaymentOrder, { isLoading }] = useSubmitPaymentOrderMutation();

  const handlePay = async () => {
    setError("");
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      const result = await submitPaymentOrder({
        amount: amountNum,
        currency,
        description: description || "Ogera Platform Payment",
      }).unwrap();

      if (result.success && result.data?.redirect_url) {
        window.open(result.data.redirect_url, "_blank", "width=900,height=750,scrollbars=yes");
      } else {
        setError("Failed to create payment. Please try again.");
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      setError(e?.data?.message || e?.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <BanknotesIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
          Pay with Pesapal
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Make a payment using Pesapal - M-Pesa, cards, and more
        </p>
      </div>

      <div className="max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            text={isLoading ? "Processing..." : "Pay with Pesapal"}
            onClick={handlePay}
            disabled={isLoading}
          />
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          A new window will open with Pesapal payment options (M-Pesa, cards, etc.)
        </p>
      </div>
    </div>
  );
};

export default Pay;

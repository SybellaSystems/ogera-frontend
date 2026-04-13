import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { useListJobPaymentsQuery } from "../services/api/momoApi";
import Loader from "../components/Loader";

interface Transaction {
  id: string;
  transactionId: string;
  student: string;
  employer: string;
  amount: string;
  type: "Payment" | "Refund" | "Withdrawal";
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

const Transactions: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useListJobPaymentsQuery();

  // Convert MoMo payments to transaction format
  const transactions: Transaction[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((payment) => ({
      id: payment.job_id || "",
      transactionId: payment.momo_reference_id || `TXN-${payment.job_id?.substring(0, 8).toUpperCase()}`,
      student: "Student", // This info is not available in JobPaymentItem
      employer: payment.employer?.full_name || "Unknown Employer",
      amount: `RWF ${Number(payment.budget || 0).toLocaleString()}`,
      type: "Payment" as const,
      status: payment.funding_status === "Paid" ? "Completed" : payment.funding_status === "Pending" ? "Pending" : "Failed",
      date: payment.momo_paid_at ? new Date(payment.momo_paid_at).toISOString().split("T")[0] : payment.paid_at ? new Date(payment.paid_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }));
  }, [data?.data]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const completed = transactions.filter((t) => t.status === "Completed").length;
    const pending = transactions.filter((t) => t.status === "Pending").length;
    const failed = transactions.filter((t) => t.status === "Failed").length;
    const totalVolume = transactions
      .filter((t) => t.status === "Completed")
      .reduce((sum, t) => {
        const amount = parseFloat(t.amount.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    return { completed, pending, failed, totalVolume };
  }, [transactions]);

  const columns: Column<Transaction>[] = [
    {
      id: "transactionId",
      label: t("pages.transactions.transactionId"),
      minWidth: 150,
      format: (value) => (
        <Typography
          sx={{
            fontFamily: "monospace",
            fontWeight: 600,
            color: "var(--theme-text-primary, #374151)",
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "student",
      label: t("pages.transactions.student"),
      minWidth: 150,
    },
    {
      id: "employer",
      label: t("pages.transactions.employer"),
      minWidth: 150,
    },
    {
      id: "amount",
      label: t("pages.transactions.amount"),
      minWidth: 120,
      align: "right",
      format: (value) => (
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--theme-text-primary, #111827)",
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "type",
      label: t("pages.transactions.type"),
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "Payment"
                ? "var(--chip-verified-bg)"
                : value === "Refund"
                ? "var(--chip-warning-bg)"
                : "var(--chip-permission-yes-bg)",
            color:
              value === "Payment"
                ? "var(--chip-verified-text)"
                : value === "Refund"
                ? "var(--chip-warning-text)"
                : "var(--chip-permission-yes-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "status",
      label: t("pages.transactions.status"),
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "Completed"
                ? "var(--chip-status-active-bg)"
                : value === "Pending"
                ? "var(--chip-status-pending-bg)"
                : "var(--chip-status-suspended-bg)",
            color:
              value === "Completed"
                ? "var(--chip-status-active-text)"
                : value === "Pending"
                ? "var(--chip-status-pending-text)"
                : "var(--chip-status-suspended-text)",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "date",
      label: t("pages.transactions.date"),
      minWidth: 120,
    },
  ];

  const actions: TableAction<Transaction>[] = [
    {
      label: t("pages.transactions.viewDetails"),
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View transaction:", row);
      },
      color: "primary",
    },
    {
      label: t("pages.transactions.receipt"),
      icon: <ReceiptIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Download receipt:", row);
      },
      color: "success",
      show: (row) => row.status === "Completed",
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <div className="theme-page-bg space-y-6 animate-fadeIn min-h-full p-4">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-[var(--theme-text-primary)] flex items-center gap-2 md:gap-3">
          <CreditCardIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600 dark:text-purple-400" />
          {t("pages.transactions.transactions")}
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-[var(--theme-text-secondary)] mt-2">
          {t("pages.transactions.subtitle")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-md border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">{t("pages.transactions.totalVolume")}</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-900 mt-2">
            {stats.totalVolume.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200">
          <p className="text-sm text-green-700 font-medium">{t("pages.transactions.completed")}</p>
          <p className="text-2xl md:text-3xl font-bold text-green-900 mt-2">
            {stats.completed}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-md border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">{t("pages.transactions.pending")}</p>
          <p className="text-2xl md:text-3xl font-bold text-orange-900 mt-2">
            {stats.pending}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-md border border-red-200">
          <p className="text-sm text-red-700 font-medium">{t("pages.transactions.failed")}</p>
          <p className="text-2xl md:text-3xl font-bold text-red-900 mt-2">{stats.failed}</p>
        </div>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <CreditCardIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No transactions yet</p>
          <p className="text-gray-400 text-sm mt-2">Transaction data will appear here once payments are processed.</p>
        </div>
      ) : (
        <CustomTable
          columns={columns}
          data={transactions}
          actions={actions}
          searchable={true}
          searchPlaceholder={t("pages.transactions.searchPlaceholder")}
          rowsPerPageOptions={[10, 25, 50]}
          defaultRowsPerPage={10}
        />
      )}
    </div>
  );
};

export default Transactions;

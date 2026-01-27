import React from "react";
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

interface Transaction {
  id: number;
  transactionId: string;
  student: string;
  employer: string;
  amount: string;
  type: "Payment" | "Refund" | "Withdrawal";
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

const Transactions: React.FC = () => {
  const transactions: Transaction[] = [
    {
      id: 1,
      transactionId: "TXN-001234",
      student: "John Doe",
      employer: "Google Inc",
      amount: "$2,500",
      type: "Payment",
      status: "Completed",
      date: "2024-03-15",
    },
    {
      id: 2,
      transactionId: "TXN-001235",
      student: "Emily Smith",
      employer: "Microsoft",
      amount: "$1,800",
      type: "Payment",
      status: "Completed",
      date: "2024-03-14",
    },
    {
      id: 3,
      transactionId: "TXN-001236",
      student: "Mike Johnson",
      employer: "Amazon",
      amount: "$500",
      type: "Refund",
      status: "Pending",
      date: "2024-03-13",
    },
    {
      id: 4,
      transactionId: "TXN-001237",
      student: "Sarah Williams",
      employer: "Tesla",
      amount: "$3,200",
      type: "Payment",
      status: "Completed",
      date: "2024-03-12",
    },
    {
      id: 5,
      transactionId: "TXN-001238",
      student: "David Brown",
      employer: "Apple",
      amount: "$1,200",
      type: "Payment",
      status: "Failed",
      date: "2024-03-11",
    },
  ];

  const columns: Column<Transaction>[] = [
    {
      id: "transactionId",
      label: "Transaction ID",
      minWidth: 150,
      format: (value) => (
        <Typography
          sx={{ fontFamily: "monospace", fontWeight: 600, color: "#374151" }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "student",
      label: "Student",
      minWidth: 150,
    },
    {
      id: "employer",
      label: "Employer",
      minWidth: 150,
    },
    {
      id: "amount",
      label: "Amount",
      minWidth: 120,
      align: "right",
      format: (value) => (
        <Typography
          sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "type",
      label: "Type",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "Payment"
                ? "#dbeafe"
                : value === "Refund"
                ? "#fed7aa"
                : "#f3e8ff",
            color:
              value === "Payment"
                ? "#1e40af"
                : value === "Refund"
                ? "#9a3412"
                : "#7c3aed",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "Completed"
                ? "#d1fae5"
                : value === "Pending"
                ? "#fed7aa"
                : "#fee2e2",
            color:
              value === "Completed"
                ? "#065f46"
                : value === "Pending"
                ? "#9a3412"
                : "#991b1b",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "date",
      label: "Date",
      minWidth: 120,
    },
  ];

  const actions: TableAction<Transaction>[] = [
    {
      label: "View Details",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View transaction:", row);
      },
      color: "primary",
    },
    {
      label: "Receipt",
      icon: <ReceiptIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Download receipt:", row);
      },
      color: "success",
      show: (row) => row.status === "Completed",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <CreditCardIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
          Transactions
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          View and manage all financial transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-md border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Total Volume</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-900 mt-2">
            $124,500
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200">
          <p className="text-sm text-green-700 font-medium">Completed</p>
          <p className="text-2xl md:text-3xl font-bold text-green-900 mt-2">
            1,245
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-md border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Pending</p>
          <p className="text-2xl md:text-3xl font-bold text-orange-900 mt-2">
            38
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-md border border-red-200">
          <p className="text-sm text-red-700 font-medium">Failed</p>
          <p className="text-2xl md:text-3xl font-bold text-red-900 mt-2">12</p>
        </div>
      </div>

      {/* Transactions Table */}
      <CustomTable
        columns={columns}
        data={transactions}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search by transaction ID, student, employer..."
        rowsPerPageOptions={[10, 25, 50]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default Transactions;

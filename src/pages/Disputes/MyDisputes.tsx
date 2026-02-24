import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { getUserDisputes, type Dispute } from "../../services/api/disputesApi";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

const MyDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const disputes = await getUserDisputes();
      setDisputes(disputes || []);
    } catch (error: any) {
      console.error("Failed to fetch my disputes:", error);
      toast.error(error?.response?.data?.message || "Failed to load disputes");
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Dispute>[] = [
    {
      id: "type",
      label: "Type",
      minWidth: 130,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: isDark ? "rgba(45,27,105,0.25)" : "#f3e8ff",
            color: isDark ? "#c084fc" : "#7c3aed",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "title",
      label: "Title",
      minWidth: 250,
      format: (value) => (
        <Typography sx={{ fontSize: "0.875rem", color: isDark ? "#f3f4f6" : "#374151", fontWeight: 600 }}>
          {value}
        </Typography>
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
              value === "Open"
                ? (isDark ? "rgba(220,38,38,0.15)" : "#fee2e2")
                : value === "Under Review" || value === "Mediation"
                ? (isDark ? "rgba(234,88,12,0.15)" : "#fef3c7")
                : (isDark ? "rgba(22,163,74,0.15)" : "#d1fae5"),
            color:
              value === "Open"
                ? (isDark ? "#f87171" : "#991b1b")
                : value === "Under Review" || value === "Mediation"
                ? (isDark ? "#fbbf24" : "#92400e")
                : (isDark ? "#34d399" : "#065f46"),
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "priority",
      label: "Priority",
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "High"
                ? (isDark ? "rgba(220,38,38,0.15)" : "#fee2e2")
                : value === "Medium"
                ? (isDark ? "rgba(234,88,12,0.15)" : "#fef3c7")
                : (isDark ? "rgba(59,130,246,0.15)" : "#dbeafe"),
            color:
              value === "High"
                ? (isDark ? "#f87171" : "#991b1b")
                : value === "Medium"
                ? (isDark ? "#fbbf24" : "#92400e")
                : (isDark ? "#93c5fd" : "#1e40af"),
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "created_at",
      label: "Created",
      minWidth: 120,
      format: (value) => (
        <span style={{ color: isDark ? "#d1d5db" : "#374151" }}>
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions: TableAction<Dispute>[] = [
    {
      label: "View Details",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        navigate(`/dashboard/disputes/${row.dispute_id}`);
      },
      color: "primary",
    },
  ];

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading your disputes">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="space-y-4 animate-fadeIn"
      style={{
        background: isDark ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)" : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            <ExclamationTriangleIcon className="h-6 w-6" style={{ color: isDark ? "#f87171" : "#dc2626" }} />
            My Disputes
          </h1>
          <p className="text-xs mt-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            View and manage your dispute tickets
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/disputes/create")}
          aria-label="File a new dispute"
          className="px-4 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
          style={{ backgroundColor: isDark ? "#7F56D9" : "#2d1b69", color: "#ffffff" }}
        >
          <PlusIcon className="h-4 w-4" />
          File New Dispute
        </button>
      </div>

      {disputes.length === 0 ? (
        <div
          role="status"
          className="text-center py-8 rounded-lg"
          style={{
            backgroundColor: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px dashed rgba(45,27,105,0.5)" : "1px dashed #e5e7eb",
          }}
        >
          <ExclamationTriangleIcon className="h-10 w-10 mx-auto mb-2" style={{ color: isDark ? "#4b5563" : "#d1d5db" }} />
          <p className="text-sm font-medium" style={{ color: isDark ? "#d1d5db" : "#1f2937" }}>No Disputes Yet</p>
          <p className="text-xs mt-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            You haven't filed any disputes. Click the button above to create one.
          </p>
          <button
            onClick={() => navigate("/dashboard/disputes/create")}
            className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold transition"
            style={{ backgroundColor: isDark ? "#7F56D9" : "#2d1b69", color: "#ffffff" }}
          >
            File Your First Dispute
          </button>
        </div>
      ) : (
        <CustomTable
          columns={columns}
          data={disputes}
          actions={actions}
          searchable={true}
          searchPlaceholder="Search disputes..."
          rowsPerPageOptions={[5, 10, 25]}
          defaultRowsPerPage={10}
        />
      )}
    </div>
  );
};

export default MyDisputes;

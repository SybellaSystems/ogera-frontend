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
            bgcolor: isDark ? "rgba(45,27,105,0.4)" : "#dbeafe",
            color: isDark ? "#c084fc" : "#1e40af",
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
        <Typography sx={{ fontSize: "0.875rem", color: isDark ? "#d1d5db" : "#374151", fontWeight: 600 }}>
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
          role="status"
          aria-label={`Status: ${value}`}
          sx={{
            bgcolor:
              value === "Open"
                ? isDark ? "rgba(220,38,38,0.2)" : "#fee2e2"
                : value === "Under Review" || value === "Mediation"
                ? isDark ? "rgba(234,88,12,0.2)" : "#fef3c7"
                : isDark ? "rgba(22,163,74,0.2)" : "#d1fae5",
            color:
              value === "Open"
                ? isDark ? "#fca5a5" : "#991b1b"
                : value === "Under Review" || value === "Mediation"
                ? isDark ? "#fdba74" : "#92400e"
                : isDark ? "#86efac" : "#065f46",
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
          role="status"
          aria-label={`Priority: ${value}`}
          sx={{
            bgcolor:
              value === "High"
                ? isDark ? "rgba(220,38,38,0.2)" : "#fee2e2"
                : value === "Medium"
                ? isDark ? "rgba(234,88,12,0.2)" : "#fef3c7"
                : isDark ? "rgba(59,130,246,0.2)" : "#dbeafe",
            color:
              value === "High"
                ? isDark ? "#fca5a5" : "#991b1b"
                : value === "Medium"
                ? isDark ? "#fdba74" : "#92400e"
                : isDark ? "#93c5fd" : "#1e40af",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "created_at",
      label: "Created",
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString(),
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl md:text-4xl font-extrabold flex items-center gap-2 md:gap-3"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            <ExclamationTriangleIcon className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
            My Disputes
          </h1>
          <p
            className="text-sm md:text-base mt-2"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            View and manage your dispute tickets
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/disputes/create")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md flex items-center gap-2"
          aria-label="File a new dispute"
        >
          <PlusIcon className="h-5 w-5" />
          File New Dispute
        </button>
      </div>

      {disputes.length === 0 ? (
        <div
          className="rounded-xl shadow-md p-12 text-center"
          style={{
            background: isDark ? "#1e1833" : "#ffffff",
            border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #e5e7eb",
          }}
          role="status"
        >
          <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4" style={{ color: isDark ? "#4b5563" : "#9ca3af" }} />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            No Disputes Yet
          </h3>
          <p className="mb-6" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            You haven't filed any disputes. Click the button above to create one.
          </p>
          <button
            onClick={() => navigate("/dashboard/disputes/create")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md"
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

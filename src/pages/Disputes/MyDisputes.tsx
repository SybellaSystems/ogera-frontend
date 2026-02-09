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
  MessageOutlined as MessageIcon,
} from "@mui/icons-material";
import { getUserDisputes, type Dispute } from "../../services/api/disputesApi";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const MyDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
            bgcolor: "#dbeafe",
            color: "#1e40af",
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
        <Typography sx={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>
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
                ? "#fee2e2"
                : value === "Under Review" || value === "Mediation"
                ? "#fef3c7"
                : "#d1fae5",
            color:
              value === "Open"
                ? "#991b1b"
                : value === "Under Review" || value === "Mediation"
                ? "#92400e"
                : "#065f46",
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
                ? "#fee2e2"
                : value === "Medium"
                ? "#fef3c7"
                : "#dbeafe",
            color:
              value === "High"
                ? "#991b1b"
                : value === "Medium"
                ? "#92400e"
                : "#1e40af",
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
    return <Loader />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
            <ExclamationTriangleIcon className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
            My Disputes
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            View and manage your dispute tickets
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/disputes/create")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          File New Dispute
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Disputes Yet</h3>
          <p className="text-gray-500 mb-6">
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




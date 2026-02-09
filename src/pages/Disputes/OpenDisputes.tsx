import React, { useEffect, useState } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  MessageOutlined as MessageIcon,
  CheckCircle as ResolveIcon,
} from "@mui/icons-material";

import { getAllDisputes, type Dispute } from "../../services/api/disputesApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";

const OpenDisputes: React.FC = () => {
   const role = useSelector((state: any) => state.auth.role);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Only allow admins/superadmin to view this page
    if (role === "student" || role === "employer") {
      navigate("/dashboard/disputes/my-disputes");
      return;
    }
    fetchDisputes();
  }, [role]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const result = await getAllDisputes({ status: "Open", page: 1, limit: 100 });
      setDisputes(result.data || []);
    } catch (error) {
      console.error("Failed to fetch open disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Dispute>[] = [
    {
      id: "type",
      label: "Type",
      minWidth: 150,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: "#f3e8ff",
            color: "#7c3aed",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "title",
      label: "Title",
      minWidth: 200,
      format: (value) => (
        <Typography sx={{ fontSize: "0.875rem", color: "#374151", fontWeight: 600 }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "student",
      label: "Student",
      minWidth: 150,
       format: (value: any, row: any) => {
        // If dispute was created by student, show name, otherwise show "-"
        return row.reported_by === 'student' ? (value?.full_name || "N/A") : "-";
      },
    },
    {
      id: "employer",
      label: "Employer",
      minWidth: 150,
      format: (value: any, row: any) => {
        // If dispute was created by employer, show name, otherwise show "-"
        return row.reported_by === 'employer' ? (value?.full_name || "N/A") : "-";
      },
    },
    {
      id: "priority",
      label: "Priority",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "High"
                ? "#fee2e2"
                : value === "Medium"
                ? "#fed7aa"
                : "#dbeafe",
            color:
              value === "High"
                ? "#991b1b"
                : value === "Medium"
                ? "#9a3412"
                : "#1e40af",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "created_at",
      label: "Reported Date",
      minWidth: 130,
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
    {
      label: "Message Parties",
      icon: <MessageIcon fontSize="small" />,
      onClick: (row) => {
                navigate(`/dashboard/disputes/${row.dispute_id}`);
      },
      color: "primary",
    },
    {
      label: "Resolve",
      icon: <ResolveIcon fontSize="small" />,
      onClick: (row) => {
                navigate(`/dashboard/disputes/${row.dispute_id}`);
      },
      color: "success",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <ExclamationCircleIcon className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
          Open Disputes
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Disputes that require immediate attention
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 font-medium text-sm md:text-base">
          ⚠️ {disputes.length} open disputes requiring action
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-medium">High Priority</p>
           <p className="text-3xl font-bold text-red-900 mt-2">
            {disputes.filter((d) => d.priority === "High").length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Medium Priority</p>
           <p className="text-3xl font-bold text-orange-900 mt-2">
            {disputes.filter((d) => d.priority === "Medium").length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Low Priority</p>
           <p className="text-3xl font-bold text-blue-900 mt-2">
            {disputes.filter((d) => d.priority === "Low").length}
          </p>
        </div>
      </div>

      <CustomTable
        columns={columns}
        data={disputes}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search disputes..."
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default OpenDisputes;


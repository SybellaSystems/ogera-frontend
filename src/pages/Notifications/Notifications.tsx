import React from "react";
import { BellIcon, ArrowPathIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import CustomTable, {
  type Column,
  type TableAction,
} from "../../components/Table/CustomTable";
import { Chip, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as MarkReadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation } from "../../services/api/notificationApi";

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const { data: notificationsData, isLoading, error, refetch } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  // Transform API data to table format
  const notifications: NotificationRow[] = (notificationsData?.data || []).map((notification: any) => ({
    id: notification.notification_id || notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'General',
    isRead: notification.is_read || notification.isRead || false,
    createdAt: new Date(notification.created_at || notification.createdAt).toLocaleDateString(),
  }));

  const columns: Column<NotificationRow>[] = [
    {
      id: "type",
      label: "Type",
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: value === "Alert" ? "#fee2e2" : value === "Info" ? "#dbeafe" : "#f3e8ff",
            color: value === "Alert" ? "#991b1b" : value === "Info" ? "#1e40af" : "#7c3aed",
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
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "message",
      label: "Message",
      minWidth: 300,
      format: (value) => (
        <Typography sx={{ fontSize: "0.875rem", color: "#374151" }}>
          {value.length > 100 ? `${value.substring(0, 100)}...` : value}
        </Typography>
      ),
    },
    {
      id: "isRead",
      label: "Status",
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value ? "Read" : "Unread"}
          size="small"
          sx={{
            bgcolor: value ? "#d1fae5" : "#fef3c7",
            color: value ? "#065f46" : "#92400e",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "createdAt",
      label: "Date",
      minWidth: 120,
    },
  ];

  const actions: TableAction<NotificationRow>[] = [
    {
      label: "View",
      icon: <ViewIcon fontSize="small" />,
      onClick: (row) => {
        console.log("View notification:", row);
      },
      color: "primary",
    },
    {
      label: "Mark as Read",
      icon: <MarkReadIcon fontSize="small" />,
      onClick: async (row) => {
        try {
          await markAsRead(row.id).unwrap();
          refetch();
        } catch (err) {
          console.error("Failed to mark as read:", err);
        }
      },
      color: "success",
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => {
        console.log("Delete notification:", row);
      },
      color: "error",
    },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-[#7F56D9] animate-spin" />
        <span className="ml-2 text-gray-500">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load notifications</p>
            <p className="text-xs text-red-600 mt-1">Please try again later</p>
          </div>
          <button
            onClick={() => refetch()}
            className="ml-auto px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 md:gap-3">
          <BellIcon className="h-8 w-8 md:h-10 md:w-10 text-[#7F56D9]" />
          Notifications
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          View and manage your notifications
        </p>
      </div>

      <div className="bg-purple-50 border-l-4 border-[#7F56D9] p-4 rounded-lg">
        <p className="text-purple-800 font-medium text-sm md:text-base">
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'All caught up! No unread notifications'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Total</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">{notifications.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Unread</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">{unreadCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Read</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{notifications.length - unreadCount}</p>
        </div>
      </div>

      <CustomTable
        columns={columns}
        data={notifications}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search notifications..."
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={10}
      />
    </div>
  );
};

export default Notifications;

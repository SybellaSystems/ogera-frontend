import React from "react";
import { useTranslation } from "react-i18next";
import {
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useRevokeOtherSessionsMutation,
} from "../services/api/sessionsApi";
import {
  CheckCircleIcon,
  XMarkIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ActiveSessions: React.FC = () => {
  const { t } = useTranslation();
  const { data: sessionsResponse, isLoading, error, refetch } = useGetActiveSessionsQuery();
  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation();
  const [revokeOthers, { isLoading: isRevokingOthers }] = useRevokeOtherSessionsMutation();

  // Format timestamp to readable string
  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    // If less than 1 minute
    if (diff < 60000) return "Just now";
    // If less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    // If less than 1 day
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    // If less than 7 days
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return d.toLocaleDateString();
  };

  // Get device icon based on device type
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      default:
        return <ComputerDesktopIcon className="w-5 h-5" />;
    }
  };

  // Handle revoke session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId).unwrap();
      toast.success(t("profile.sessionRevoked", { defaultValue: "Session revoked successfully" }));
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || t("profile.revokeSessionError", { defaultValue: "Failed to revoke session" }));
    }
  };

  // Handle revoke other sessions
  const handleRevokeOthers = async () => {
    if (!confirm(t("profile.confirmRevokeOthers", { defaultValue: "Are you sure you want to logout from all other devices?" }))) {
      return;
    }

    try {
      await revokeOthers().unwrap();
      toast.success(t("profile.allOtherSessionsRevoked", { defaultValue: "All other sessions revoked successfully" }));
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || t("profile.revokeOthersError", { defaultValue: "Failed to revoke other sessions" }));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
          <h2 className="text-2xl font-bold">
            {t("profile.activeSessions", { defaultValue: "Active Sessions" })}
          </h2>
          <p className="text-white/80 mt-2">
            {t("profile.activeSessionsDescription", { defaultValue: "View and manage active user sessions" })}
          </p>
        </div>
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('Error fetching sessions:', error);
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
          <h2 className="text-2xl font-bold">
            {t("profile.activeSessions", { defaultValue: "Active Sessions" })}
          </h2>
          <p className="text-white/80 mt-2">
            {t("profile.activeSessionsDescription", { defaultValue: "View and manage active user sessions" })}
          </p>
        </div>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">
            {t("profile.noActiveSessions", { defaultValue: "No active sessions found" })}
          </p>
          <p className="text-sm text-gray-500">
            {t("profile.noActiveSessionsDesc", { 
              defaultValue: "Your first session will be created when you log in. Sessions track your active logins across different devices." 
            })}
          </p>
        </div>
      </div>
    );
  }

  const sessions = sessionsResponse?.data || [];
  const currentSession = sessions[0]; // Most recent session is current
  const otherSessions = sessions.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-8 py-8 text-white">
        <h2 className="text-2xl font-bold">
          {t("profile.activeSessions", { defaultValue: "Active Sessions" })}
        </h2>
        <p className="text-white/80 mt-2">
          {t("profile.activeSessionsDescription", { defaultValue: "View and manage active user sessions" })}
        </p>
      </div>

      <div className="p-8 space-y-6">
        {/* Current Session */}
        {currentSession && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {t("profile.currentSession", { defaultValue: "Current Session" })}
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <CheckCircleIcon className="w-4 h-4" />
                {t("profile.active", { defaultValue: "Active" })}
              </span>
            </h3>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 space-y-4">
              {/* Device Info */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#f5f3ff]">
                  <span className="text-[#7f56d9]">{getDeviceIcon(currentSession.device_type)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 capitalize">
                      {currentSession.device_type}
                    </h4>
                    {currentSession.ip_address && (
                      <span className="text-xs text-gray-500">{currentSession.ip_address}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {currentSession.user_agent || "Unknown device"}
                  </p>

                  {/* Session Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("profile.lastActive", { defaultValue: "Last Active" })}:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatTime(currentSession.last_activity)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("profile.signedIn", { defaultValue: "Signed In" })}:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {new Date(currentSession.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Sessions */}
        {otherSessions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("profile.otherSessions", { defaultValue: "Other Sessions" })}
              </h3>
              {otherSessions.length > 0 && (
                <button
                  onClick={handleRevokeOthers}
                  disabled={isRevokingOthers}
                  className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  {isRevokingOthers
                    ? t("profile.revoking", { defaultValue: "Revoking..." })
                    : t("profile.revokeAll", { defaultValue: "Revoke All" })}
                </button>
              )}
            </div>

            {otherSessions.map((session) => (
              <div
                key={session.id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-[#f5f3ff]">
                    <span className="text-[#7f56d9]">{getDeviceIcon(session.device_type)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 capitalize">
                        {session.device_type}
                      </h4>
                      {session.ip_address && (
                        <span className="text-xs text-gray-500">{session.ip_address}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {session.user_agent || "Unknown device"}
                    </p>

                    {/* Session Details */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>
                          {t("profile.lastActive", { defaultValue: "Last Active" })}:
                        </span>
                        <span className="text-gray-900 font-medium">
                          {formatTime(session.last_activity)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>{t("profile.signedIn", { defaultValue: "Signed In" })}:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revoke Button */}
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={isRevoking}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="w-4 h-4" />
                  {isRevoking
                    ? t("profile.revoking", { defaultValue: "Revoking..." })
                    : t("profile.revokeSession", { defaultValue: "Revoke Session" })}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No sessions message */}
        {sessions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {t("profile.noActiveSessions", { defaultValue: "No active sessions found" })}
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <div className="flex gap-3">
            <EyeIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                {t("profile.sessionSecurityInfo", { defaultValue: "Session Security" })}
              </h4>
              <p className="text-sm text-blue-700">
                {t("profile.sessionSecurityDesc", {
                  defaultValue:
                    "Revoke sessions from devices you no longer use to enhance your account security. You can logout from all other devices or revoke individual sessions.",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSessions;

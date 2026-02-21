import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNotificationPreferences } from "./useNotificationPreferences";

interface NotificationsTabProps {
  userId: string | undefined;
}

const Toggle: React.FC<{
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2d1b69] focus:ring-offset-2 dark:focus:ring-offset-[#1a1528] ${
        enabled ? "bg-[#2d1b69]" : "bg-gray-200 dark:bg-gray-600"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const FrequencyOption: React.FC<{
  selected: boolean;
  label: string;
  description: string;
  onClick: () => void;
}> = ({ selected, label, description, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
      selected
        ? "border-[#2d1b69] bg-[#f4f0fa] dark:bg-[#2d1b69]/20"
        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-[#2d1b69] dark:border-[#9F7AEA]" : "border-gray-300 dark:border-gray-500"
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-[#2d1b69] dark:bg-[#9F7AEA]" />}
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </button>
);

const NotificationsTab: React.FC<NotificationsTabProps> = ({ userId }) => {
  const { preferences, updatePreferences, updateNotificationType, isSaving } =
    useNotificationPreferences(userId);

  return (
    <div className="bg-white dark:bg-[#1a1528] rounded-xl shadow-lg border border-gray-200 dark:border-[#2d1b69]/50 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#2d1b69] px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BellIcon className="w-6 h-6" />
          Notifications
        </h2>
        {isSaving && (
          <span className="text-white/70 text-xs">Saving...</span>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* General Notification Toggles */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Channels</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Choose how you want to receive notifications</p>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <Toggle
              enabled={preferences.emailNotifications}
              onChange={(val) => updatePreferences({ emailNotifications: val })}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <Toggle
              enabled={preferences.pushNotifications}
              onChange={(val) => updatePreferences({ pushNotifications: val })}
              label="Push Notifications"
              description="Receive browser push notifications"
            />
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Types</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Choose which types of notifications you want to receive</p>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <Toggle
              enabled={preferences.notificationTypes.jobs}
              onChange={(val) => updateNotificationType("jobs", val)}
              label="Jobs"
              description="New job postings, application updates, and deadlines"
            />
            <Toggle
              enabled={preferences.notificationTypes.disputes}
              onChange={(val) => updateNotificationType("disputes", val)}
              label="Disputes"
              description="Dispute status changes and resolution updates"
            />
            <Toggle
              enabled={preferences.notificationTypes.verifications}
              onChange={(val) => updateNotificationType("verifications", val)}
              label="Verifications"
              description="Academic and identity verification updates"
            />
            <Toggle
              enabled={preferences.notificationTypes.systemUpdates}
              onChange={(val) => updateNotificationType("systemUpdates", val)}
              label="System Updates"
              description="Platform announcements and maintenance notices"
            />
          </div>
        </div>

        {/* Frequency */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Frequency</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">How often do you want to receive notification emails?</p>
          <div className="space-y-3">
            <FrequencyOption
              selected={preferences.frequency === "realtime"}
              label="Real-time"
              description="Get notified immediately when something happens"
              onClick={() => updatePreferences({ frequency: "realtime" })}
            />
            <FrequencyOption
              selected={preferences.frequency === "daily"}
              label="Daily Digest"
              description="Receive a summary of notifications once per day"
              onClick={() => updatePreferences({ frequency: "daily" })}
            />
            <FrequencyOption
              selected={preferences.frequency === "weekly"}
              label="Weekly Digest"
              description="Receive a summary of notifications once per week"
              onClick={() => updatePreferences({ frequency: "weekly" })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;

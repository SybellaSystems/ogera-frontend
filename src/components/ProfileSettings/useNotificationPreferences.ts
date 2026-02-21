import { useState, useEffect, useCallback } from "react";

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: {
    jobs: boolean;
    disputes: boolean;
    verifications: boolean;
    systemUpdates: boolean;
  };
  frequency: "realtime" | "daily" | "weekly";
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  notificationTypes: {
    jobs: true,
    disputes: true,
    verifications: true,
    systemUpdates: true,
  },
  frequency: "realtime",
};

const getStorageKey = (userId: string) => `notification_prefs_${userId}`;

export const useNotificationPreferences = (userId: string | undefined) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    try {
      const stored = localStorage.getItem(getStorageKey(userId));
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors, use defaults
    }
  }, [userId]);

  const updatePreferences = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      setIsSaving(true);
      const updated = { ...preferences, ...updates };
      setPreferences(updated);
      if (userId) {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
      }
      setTimeout(() => setIsSaving(false), 300);
    },
    [preferences, userId]
  );

  const updateNotificationType = useCallback(
    (type: keyof NotificationPreferences["notificationTypes"], value: boolean) => {
      const updated = {
        ...preferences,
        notificationTypes: { ...preferences.notificationTypes, [type]: value },
      };
      setPreferences(updated);
      if (userId) {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
      }
    },
    [preferences, userId]
  );

  return { preferences, updatePreferences, updateNotificationType, isSaving };
};
